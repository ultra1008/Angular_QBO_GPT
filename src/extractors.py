from collections import namedtuple
import json
import boto3
import time
import os
import trp
from dotenv import load_dotenv
load_dotenv()


class ExpensesCreator:
    def __init__(self, s3_docs_bundle_url):
        self.s3_docs_bundle_url = s3_docs_bundle_url

    def create(self):
        job_id = self._start_analysis()
        return self._wait_and_get_analysis_result(job_id)

    def _start_analysis(self):
        # Parse input s3 object url
        indices = [i for i in range(len(self.s3_docs_bundle_url)) if self.s3_docs_bundle_url[i] == '/']
        endpoint_url = self.s3_docs_bundle_url[:indices[2]]
        bucket = self.s3_docs_bundle_url[indices[2] + 1: indices[3]]
        key = self.s3_docs_bundle_url[indices[3] + 1:]

        # Connect to source s3
        input_s3 = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=os.getenv('INPUT_AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('INPUT_AWS_SECRET_ACCESS_KEY')
        )

        # Get bucket object
        result = input_s3.get_object(Bucket=bucket, Key=key)

        # Copy to destination s3
        textract_s3_bucket = 'rovuk-analysis-input'
        s3 = boto3.client('s3')
        s3.put_object(Body=result['Body'].read(), Bucket=textract_s3_bucket, Key=key)

        # Analyze
        return self._start_job(textract_s3_bucket, key)

    @staticmethod
    def _start_job(bucket_name, object_name):
        client = boto3.client('textract')
        response = client.start_expense_analysis(
            DocumentLocation={
                'S3Object': {
                    'Bucket': bucket_name,
                    'Name': object_name
                }
            })

        return response["JobId"]

    @staticmethod
    def _wait_and_get_analysis_result(job_id):
        print(f'expense_job_id: {job_id}')
        sleep_sec = 1
        time.sleep(sleep_sec)
        client = boto3.client('textract')
        response = client.get_expense_analysis(JobId=job_id)
        print(f'expense_job_status: {response["JobStatus"]}')

        while response["JobStatus"] == "IN_PROGRESS":
            time.sleep(sleep_sec)
            response = client.get_expense_analysis(JobId=job_id)
            print(f'expense_job_status: {response["JobStatus"]}')

        return response


ExpenseAnalysisField = namedtuple("ExpenseAnalysisField", "type label value")
ExpenseAnalysisLineItem = namedtuple("ExpenseAnalysisLineItem", "item unit_price product_code quantity price")


class ExpenseParser:
    """
    List of Expense Analysis Standard Fields:
    https://docs.aws.amazon.com/textract/latest/dg/invoices-receipts.html
    """

    def __init__(self, document):
        self.document = document
        self.classified_fields = None
        self.other_fields = None
        self.expense_groups = None

    def parse(self):
        (self.classified_fields,
         self.other_fields,
         self.expense_groups) = self._parse_document()

        return self

    def _parse_document(self):
        classified = {}
        other = []

        # Parse fields
        for sf in self.document['SummaryFields']:
            field_type = sf['Type']['Text']
            field = ExpenseAnalysisField(
                type=field_type,
                label=sf['LabelDetection']['Text'] if 'LabelDetection' in sf else None,
                value=sf['ValueDetection']['Text']
            )

            if field_type != 'OTHER':
                if field.value:
                    classified[field_type] = field
            else:
                other.append(field)

        # Parse expense line item groups
        parsed_groups = []
        for group in self.document['LineItemGroups']:
            if len(group['LineItems']) == 0:
                continue

            parsed_group = []
            for line_item in group['LineItems']:
                expense_fields = {
                    field['Type']['Text']: field['ValueDetection']['Text']
                    for field in line_item['LineItemExpenseFields']
                }

                extracted_line_item = ExpenseAnalysisLineItem(
                    item=expense_fields.get('ITEM'),
                    unit_price=expense_fields.get('UNIT_PRICE'),
                    product_code=expense_fields.get('PRODUCT_CODE'),
                    quantity=expense_fields.get('QUANTITY'),
                    price=expense_fields.get('PRICE')
                )
                parsed_group.append(extracted_line_item)

            parsed_groups.append(parsed_group)

        return classified, other, parsed_groups


    def get_clf_field_value(self, key_name: str):
        if key_name in self.classified_fields:
            value = self.classified_fields[key_name].value
            return value if value.strip() != '' else None
        else:
            return None

    def get_other_field_value(self, label: str):
        label = label.lower()
        for field in self.other_fields:
            if field.label.lower() == label:
                return field.value if field.value.strip() != '' else None

        return None



class FormsParser:
    def __init__(self, s3_or_json_page):
        self.s3_or_json_page = s3_or_json_page
        self.fields = None
        if not isinstance(s3_or_json_page, tuple):
            self.fields = self._parse_response(s3_or_json_page)

    @staticmethod
    def _parse_response(json_page):
        fields = {}

        doc = trp.Document(json_page)
        for field in doc.pages[0].form.fields:
            fields[str(field.key).lower()] = str(field.value)

        return fields

    def get_field_value(self, key_name: str, equals: bool):
        key_name = key_name.lower()
        if self.fields is None:
            job_id = self._start_job(self.s3_or_json_page[0], self.s3_or_json_page[1])
            cont = self._wait_and_get_analysis_result(job_id)
            self.fields = self._parse_response(cont)

        if equals:
            return self.fields.get(key_name)
        else:
            for key, value in self.fields.items():
                if key_name in key:
                    return value
            return None

    @staticmethod
    def _start_job(bucket_name, object_name):
        client = boto3.client('textract')
        response = client.start_document_analysis(
            DocumentLocation={
                'S3Object': {
                    'Bucket': bucket_name,
                    'Name': object_name
                }
            },
            FeatureTypes=["FORMS"]
        )
        return response["JobId"]

    @staticmethod
    def _wait_and_get_analysis_result(job_id):
        print(f'forms_job_id: {job_id}')
        sleep_sec = 1
        time.sleep(sleep_sec)
        client = boto3.client('textract')
        response = client.get_document_analysis(JobId=job_id)
        print(f'forms_job_status: {response["JobStatus"]}')

        while response["JobStatus"] == "IN_PROGRESS":
            time.sleep(sleep_sec)
            response = client.get_document_analysis(JobId=job_id)
            print(f'forms_job_status: {response["JobStatus"]}')

        return response





class ExtractorsManager:
    def __init__(self, documents_bundle_expenses, documents_bundle_pages, custom_fields_conf):
        self.documents_bundle_expenses = documents_bundle_expenses
        self.documents_bundle_pages = documents_bundle_pages
        self.custom_fields_conf = custom_fields_conf

    def extract(self):
        results = []
        for expense_json, s3_document_page in zip(
                self.documents_bundle_expenses,
                self.documents_bundle_pages
        ):
            doc_type = self._detect_doc_type(expense_json)
            expense_parser = ExpenseParser(expense_json).parse()
            forms_parser = FormsParser(s3_document_page)

            if doc_type == 'PURCHASE_ORDER':
                extractor = PurchaseOrderExtractor(expense_parser, forms_parser,
                                                   self.custom_fields_conf.get('PURCHASE_ORDER'))
            elif doc_type == 'PACKING_SLIP':
                extractor = PackingSlipExtractor(expense_parser, forms_parser,
                                                 self.custom_fields_conf.get('PACKING_SLIP'))
            elif doc_type == 'QUOTE':
                extractor = QuoteExtractor(expense_parser, forms_parser,
                                           self.custom_fields_conf.get('QUOTE'))
            elif doc_type == 'INVOICE':
                extractor = InvoiceExtractor(expense_parser, forms_parser,
                                             self.custom_fields_conf.get('INVOICE'))
            else:
                extractor = None

            if extractor:
                result = extractor.extract()
                results.append(result)

        return results

    def _detect_doc_type(self, expense_doc):
        if self._contains_text(expense_doc, 'Purchase Order'):
            return 'PURCHASE_ORDER'
        elif self._contains_text(expense_doc, 'Packing Slip'):
            return 'PACKING_SLIP'
        elif self._contains_text(expense_doc, 'Quote'):
            return 'QUOTE'
        elif self._contains_text(expense_doc, 'Invoice'):
            return 'INVOICE'
        else:
            return None

    @staticmethod
    def _contains_text(expense_doc, text):
        text = text.lower()
        for block in expense_doc['Blocks']:
            if block['BlockType'] == 'LINE':
                if block['Text'].lower() == text:
                    return True

        return False


class Extractor:
    def __init__(self, document_type, expense_parser, forms_parser, conf):
        self.document_type = document_type
        self.expense_parser = expense_parser
        self.forms_parser = forms_parser
        self.conf = conf

    def extract(self):
        result = self._extract()
        if self.conf:
            try:
                custom_fields = self._extract_custom()
                result['fields'].update(custom_fields)
            except Exception as e:
                print(f'Exception occurred while parsing custom_fields_conf for doctype: {self.document_type}, '
                      f'exception: {e}')

        return result

    def _extract_custom(self):
        fields = {}
        for dst_key, sources in self.conf.items():
            value = None
            for src, act in sources.items():
                if src == 'EXPENSES':
                    value = self.get_clf_field_value(act['SRC_KEY'])

                    if value:
                        if act.get('ONLY_DIGITS', False):
                            value = ''.join([ch for ch in value if ch.isdigit()])

                    if value:
                        break

                if src == 'FORMS':
                    value = self.get_forms_field_value(act['SRC_KEY'], equals=False)

                    if value:
                        if act.get('ONLY_DIGITS', False):
                            value = ''.join([ch for ch in value if ch.isdigit()])

                    if value:
                        break

            fields[dst_key] = value


        print('custom_fields:', fields)
        return fields

    def _extract(self) -> dict:
        pass

    def get_clf_field_value(self, key_name: str):
        return self.expense_parser.get_clf_field_value(key_name)

    def get_other_field_value(self, label: str):
        return self.expense_parser.get_other_field_value(label)

    def get_forms_field_value(self, key_name: str, equals=True):
        return self.forms_parser.get_field_value(key_name, equals)

    def get_expense_groups(self):
        groups = []
        for expense_group in self.expense_parser.expense_groups:
            group = []
            groups.append(group)

            for item_desc in expense_group:
                group.append({
                    'ITEM': item_desc.item,
                    'PRODUCT_CODE': item_desc.product_code,
                    'UNIT_PRICE': item_desc.unit_price,
                    'QUANTITY': item_desc.quantity,
                    'PRICE': item_desc.price
                })

        return groups


class PackingSlipExtractor(Extractor):
    def __init__(self, expense_parser, forms_parser, conf):
        super().__init__('PACKING_SLIP', expense_parser, forms_parser, conf)

    def _extract(self):
        date = self.get_clf_field_value('INVOICE_RECEIPT_DATE')
        invoice_number = self.get_clf_field_value('INVOICE_RECEIPT_ID')
        ship_to_address = self.get_clf_field_value('RECEIVER_ADDRESS')
        vendor_name = self.get_clf_field_value('VENDOR_NAME')
        vendor_address = self.get_clf_field_value('VENDOR_ADDRESS')
        po_number = self.get_clf_field_value('PO_NUMBER')
        received_by = self.get_clf_field_value('RECEIVER_NAME')

        fields = {
            'DATE': date,
            'INVOICE_NUMBER': invoice_number,
            'PO_NUMBER': po_number,
            'SHIP_TO_ADDRESS': ship_to_address,
            'VENDOR_NAME': vendor_name,
            'VENDOR_ADDRESS': vendor_address,
            'RECEIVED_BY': received_by
        }

        return {
            'document_type': 'PACKING_SLIP',
            'fields': fields
        }


class QuoteExtractor(Extractor):
    def __init__(self, expense_parser, forms_parser, conf):
        super().__init__('QUOTE', expense_parser, forms_parser, conf)

    def _extract(self):
        quote_number = self.get_clf_field_value('INVOICE_RECEIPT_ID')
        quote_date = self.get_clf_field_value('INVOICE_RECEIPT_DATE')
        terms = self.get_clf_field_value('PAYMENT_TERMS')
        address = self.get_clf_field_value('RECEIVER_ADDRESS')
        vendor_name = self.get_clf_field_value('VENDOR_NAME')
        vendor_address = self.get_clf_field_value('VENDOR_ADDRESS')
        shipping_method = self.get_other_field_value('Shipping Method')
        sub_total = self.get_clf_field_value('SUBTOTAL')
        tax = self.get_clf_field_value('TAX')
        quote_order_total = self.get_clf_field_value('TOTAL')

        fields = {
            'QUOTE_NUMBER': quote_number,
            'QUOTE_DATE': quote_date,
            'TERMS': terms,
            'ADDRESS': address,
            'VENDOR_NAME': vendor_name,
            'VENDOR_ADDRESS': vendor_address,
            'SHIPPING_METHOD': shipping_method,
            'SUB_TOTAL': sub_total,
            'TAX': tax,
            'QUOTE_ORDER_TOTAL': quote_order_total,
            'RECEIVER_PHONE': self.get_clf_field_value('RECEIVER_PHONE'),
            'VENDOR_PHONE': self.get_clf_field_value('VENDOR_PHONE')
        }

        groups = self.get_expense_groups()

        return {
            'document_type': 'QUOTE',
            'fields': fields,
            'expense_groups': groups
        }


class InvoiceExtractor(Extractor):
    def __init__(self, expense_parser, forms_parser, conf):
        super().__init__('INVOICE', expense_parser, forms_parser, conf)

    def _extract(self):
        fields = {
            'INVOICE_NUMBER': self._extract_invoice_number(),
            'INVOICE_DATE': self.get_clf_field_value('INVOICE_RECEIPT_DATE'),
            'ORDER_DATE': self.get_clf_field_value('ORDER_DATE'),
            'PO_NUMBER': self._extract_po(),
            'INVOICE_TO': self.get_clf_field_value('RECEIVER_NAME'),
            'ADDRESS': self.get_clf_field_value('RECEIVER_ADDRESS'),
            'SUBTOTAL': self.get_clf_field_value('SUBTOTAL'),
            'TOTAL': self.get_clf_field_value('TOTAL'),
            'TAX': self.get_clf_field_value('TAX'),
            'INVOICE_TOTAL': self.get_clf_field_value('TOTAL'),
            'VENDOR_NAME': self.get_clf_field_value('VENDOR_NAME'),
            'VENDOR_ADDRESS': self.get_clf_field_value('VENDOR_ADDRESS'),
            'VENDOR_PHONE': self.get_clf_field_value('VENDOR_PHONE'),
            'JOB_NUMBER': self.get_other_field_value('JOB NUMBER'),
            'DELIVERY_ADDRESS': self.get_clf_field_value('RECEIVER_ADDRESS'),
            'TERMS': self._extract_terms(),
            'DUE_DATE': self.get_clf_field_value('DUE_DATE'),
            'SHIP_DATE': self.get_other_field_value('DATE SHIPPED'),
            'CONTRACT_NUMBER': self._extract_contract_number(),
            'DISCOUNT': self.get_clf_field_value('DISCOUNT'),
            'ACCOUNT_NUMBER': self._extract_account_number()
        }

        groups = self.get_expense_groups()

        return {
            'document_type': 'INVOICE',
            'fields': fields,
            'expense_groups': groups
        }


    def _extract_po(self):
        po = self.expense_parser.get_clf_field_value('PO_NUMBER')
        if po is not None:
            return po
        else:
            return self.get_other_field_value('ORDER #')

    def _extract_terms(self):
        terms = self.get_clf_field_value('PAYMENT_TERMS')
        if terms is not None:
            return terms
        else:
            return self.get_other_field_value('Gateway')

    def _extract_invoice_number(self):
        value = self.get_clf_field_value('INVOICE_RECEIPT_ID')
        if value is None:
            value = self.get_forms_field_value('Invoice')
            if value is not None:
                value = ''.join([ch for ch in value if ch.isdigit()])  # to eliminate case "#00121"

        return value

    def _extract_contract_number(self):
        value = self.get_other_field_value('CONTRACT NUMBER')
        if value is not None:
            value = ''.join([ch for ch in value if ch.isdigit()])  # to eliminate case "'121010925"

        return value

    def _extract_account_number(self):
        value = self.get_clf_field_value('ACCOUNT_NUMBER')
        if value is not None:
            value = ''.join([ch for ch in value if ch.isdigit()])  # to eliminate case "'501527"

        return value



class PurchaseOrderExtractor(Extractor):
    def __init__(self, expense_parser, forms_parser, conf):
        super().__init__('PURCHASE_ORDER', expense_parser, forms_parser, conf)

    def _extract(self):
        fields = {
            'PO_CREATE_DATE': self.get_clf_field_value('INVOICE_RECEIPT_DATE'),
            'PO_NUMBER': self.get_clf_field_value('PO_NUMBER'),
            'CUSTOMER_ID': self.get_clf_field_value('CUSTOMER_NUMBER'),
            'ADDRESS': self.get_clf_field_value('RECEIVER_ADDRESS'),
            'TERMS': self.get_clf_field_value('PAYMENT_TERMS'),
            'DELIVERY_DATE': self.get_clf_field_value('DELIVERY_DATE'),
            'DUE_DATE': self.get_clf_field_value('DUE_DATE'),
            'QUOTE_NUMBER': self.get_clf_field_value('INVOICE_RECEIPT_ID'),
            'CONTRACT_NUMBER': self.get_clf_field_value('RECEIVER_PHONE'),
            'DELIVERY_ADDRESS': self.get_clf_field_value('RECEIVER_ADDRESS'),
            'VENDOR_ID': self.get_other_field_value('Vendor'),
            'SUBTOTAL': self.get_clf_field_value('SUBTOTAL'),
            'TAX': self.get_clf_field_value('TAX'),
            'PURCHASE_ORDER_TOTAL': self.get_clf_field_value('TOTAL')
        }

        groups = self.get_expense_groups()

        return {
            'document_type': 'PURCHASE_ORDER',
            'fields': fields,
            'expense_groups': groups
        }




if __name__ == '__main__':
    def load_resp(fn):
        with open(fn) as f:
            response = f.read()
            response = json.loads(response)

        return response

    # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_PSs_aws_analyze_api/ps_packingslip.pdf.json'
    # print(json.dumps(PackingSlipExtractor(load_resp(fn)['ExpenseDocuments'][0]).extract(), indent=2))

    # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_QUOTEs_aws_analyze_api/quote_1.pdf.json'
    # print(json.dumps(QuoteExtractor(load_resp(fn)['ExpenseDocuments'][0]).extract(), indent=2))

    # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/' \
    #      'Invoice,8042209225,38077982,PJ WG Renewal 1 year.PDF.json'
    # print(json.dumps(InvoiceExtractor(load_resp(fn)['ExpenseDocuments'][0]).extract(), indent=2))

    # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_PO FNC for Anil.pdf.json'
    # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_PO FNC for Anil.pdf.json'
    # print(json.dumps(PurchaseOrderExtractor(load_resp(fn)['ExpenseDocuments'][0]).extract(), indent=2))

    # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_PO FNC for Anil.pdf.json'
    # results_ = ExtractorsManager([load_resp(fn)['ExpenseDocuments'][0]]).extract()
    # print(json.dumps(results_, indent=2))

    # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_QUOTEs_aws_analyze_api/quote_1.pdf.json'
    # results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
    # print(json.dumps(results_, indent=2))

    # ExpensesCreator('https://s3.us-west-1.wasabisys.com/bicket1/folder1/invoice_page-1.pdf')._start_job()

    #
    #
    #
    # inv_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/invoice_page-1.pdf.json'
    # frm_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_forms_and_tables_api/' \
    #          'invoice_page-1.pdf.json'
    #
    # """Test custom fields"""
    # print(json.dumps(
    #     InvoiceExtractor(
    #         ExpenseParser(load_resp(inv_fn)['ExpenseDocuments'][0]).parse(),
    #         FormsParser(load_resp(frm_fn)),  {
    #             'INVOICE_DATE_2': {
    #                 'EXPENSES': {
    #                     'SRC_KEY': 'XXX___INVOICE_RECEIPT_DATE'
    #                 },
    #                 'FORMS': {
    #                     'SRC_KEY': 'voice Dat',
    #                     'ONLY_DIGITS': True
    #                 }
    #             }
    #         }
    #     ).extract(), indent=2))



    # inv_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/invoice_adrian@vmgconstructioninc10.com8a83e28d7dc522e9017e253dfe203d5b21458d07f1c756ee4ad62d25a33dbd1e07bbb.pdf.json'
    # frm_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_forms_and_tables_api/invoice_adrian@vmgconstructioninc10.com8a83e28d7dc522e9017e253dfe203d5b21458d07f1c756ee4ad62d25a33dbd1e07bbb.pdf.json'
    #
    # """Test fields"""
    # print(json.dumps(
    #     InvoiceExtractor(
    #         ExpenseParser(load_resp(inv_fn)['ExpenseDocuments'][0]).parse(),
    #         FormsParser(load_resp(frm_fn)), None
    #     ).extract(), indent=2))





# self.conf = {
# 'DUE_DATE_2': {
#     'FORMS': {
#         'SRC_KEY': 'Due Date'
#     }
# },
# 'INVOICE_DATE_2': {
#     'EXPENSES': {
#         'SRC_KEY': 'INVOICE_RECEIPT_DATE'
#     },
#     'FORMS': {
#         'SRC_KEY': 'voice Dat'
#     }
# },
# 'INVOICE_DATE_2': {
#     'FORMS': {
#         'SRC_KEY': 'voice Dat'
#     },
#     'EXPENSES': {
#         'SRC_KEY': 'INVOICE_RECEIPT_DATE'
#     }
# }

# 'INVOICE_DATE_2': {
#     'FORMS': {
#         'SRC_KEY': 'XXXvoice Dat'
#     },
#     'EXPENSES': {
#         'SRC_KEY': 'INVOICE_RECEIPT_DATE'
#     }
# }

# 'INVOICE_DATE_2': {
#     'EXPENSES': {
#         'SRC_KEY': 'XXX___INVOICE_RECEIPT_DATE'
#     },
#     'FORMS': {
#         'SRC_KEY': 'voice Dat'
#     }
# },

# }
