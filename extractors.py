from collections import namedtuple
import json
import boto3
import time


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

        # Connect to input s3
        input_s3 = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id='',
            aws_secret_access_key=''
        )

        # Get bucket object
        result = input_s3.get_object(Bucket=bucket, Key=key)

        # Copy
        textract_s3_bucket = 'temp-v2'
        s3 = boto3.client('s3')
        s3.put_object(Body=result['Body'].read(), Bucket=textract_s3_bucket, Key=key)

        # Analyze
        # textract_s3_bucket, key = 'temp-v2', f'folder1/quote_1.pdf'
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
        print(f'job_id: {job_id}')
        sleep_sec = 1
        time.sleep(sleep_sec)
        client = boto3.client('textract')
        response = client.get_expense_analysis(JobId=job_id)
        print(f'job_status: {response["JobStatus"]}')

        while response["JobStatus"] == "IN_PROGRESS":
            time.sleep(sleep_sec)
            response = client.get_expense_analysis(JobId=job_id)
            print(f'job_status: {response["JobStatus"]}')

        return response


ExpenseAnalysisField = namedtuple("ExpenseAnalysisField", "type label value")
ExpenseAnalysisLineItem = namedtuple("ExpenseAnalysisLineItem", "item unit_price product_code quantity price")


class ExpenseParser:
    def __init__(self, document):
        self.document = document
        self.classified_fields = None
        self.other_fields = None
        self.expense_groups = None

    def parse(self):
        (self.classified_fields,
         self.other_fields,
         self.expense_groups) = self._parse_document()

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




class ExtractorsManager:
    def __init__(self, expense_documents_bundle):
        self.expense_documents_bundle = expense_documents_bundle

    @staticmethod
    def _contains_text(expense_doc, text):
        text = text.lower()
        for block in expense_doc['Blocks']:
            if block['BlockType'] == 'LINE':
                if block['Text'].lower() == text:
                    return True

        return False

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


    def extract(self):
        results = []
        for document in self.expense_documents_bundle:
            doc_type = self._detect_doc_type(document)
            if doc_type == 'PURCHASE_ORDER':
                result = PurchaseOrderExtractor(document).extract()
            elif doc_type == 'PACKING_SLIP':
                result = PackingSlipExtractor(document).extract()
            elif doc_type == 'QUOTE':
                result = QuoteExtractor(document).extract()
            elif doc_type == 'INVOICE':
                result = InvoiceExtractor(document).extract()
            else:
                result = None

            if result is not None:
                results.append(result)

        return results



class Extractor:
    def __init__(self, document):
        self.expense_parser = ExpenseParser(document)
        self.expense_parser.parse()

    def extract(self):
        pass

    def get_clf_field_value(self, key_name: str):
        return self.expense_parser.get_clf_field_value(key_name)

    def get_other_field_value(self, label: str):
        return self.expense_parser.get_other_field_value(label)

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

    def extract(self):
        # Construct fields
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

    def extract(self):
        # Construct fields
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
            'QUOTE_ORDER_TOTAL': quote_order_total
        }

        groups = self.get_expense_groups()

        return {
            'document_type': 'QUOTE',
            'fields': fields,
            'expense_groups': groups
        }


class InvoiceExtractor(Extractor):

    def extract(self):
        fields = {
            'INVOICE_NUMBER': self.get_clf_field_value('INVOICE_RECEIPT_ID'),
            'INVOICE_DATE': self.get_clf_field_value('INVOICE_RECEIPT_DATE'),
            'PO_NUMBER': self.extract_po(),
            'INVOICE_TO': self.get_clf_field_value('RECEIVER_NAME'),
            'ADDRESS': self.get_clf_field_value('RECEIVER_ADDRESS'),
            'SUBTOTAL': self.get_clf_field_value('SUBTOTAL'),
            'TOTAL': self.get_clf_field_value('TOTAL'),
            'TAX': self.get_clf_field_value('TAX'),
            'INVOICE_TOTAL': self.get_clf_field_value('TOTAL'),
            'VENDOR_NAME': self.get_clf_field_value('VENDOR_NAME'),
            'VENDOR_ADDRESS': self.get_clf_field_value('VENDOR_ADDRESS'),
            'CONTRACT_NUMBER': self.get_clf_field_value('VENDOR_PHONE'),
            'JOB_NUMBER': self.get_other_field_value('JOB NUMBER'),
            'DELIVERY_ADDRESS': self.get_clf_field_value('RECEIVER_ADDRESS'),
            'TERMS': self.extract_terms(),
            'DUE_DATE': self.get_clf_field_value('DUE_DATE'),
            'SHIP_DATE': self.get_other_field_value('DATE SHIPPED'),
        }

        groups = self.get_expense_groups()

        return {
            'document_type': 'INVOICE',
            'fields': fields,
            'expense_groups': groups
        }


    def extract_po(self):
        po = self.expense_parser.get_clf_field_value('PO_NUMBER')
        if po is not None:
            return po
        else:
            return self.get_other_field_value('ORDER #')

    def extract_terms(self):
        terms = self.get_clf_field_value('PAYMENT_TERMS')
        if terms is not None:
            return terms
        else:
            return self.get_other_field_value('Gateway')


class PurchaseOrderExtractor(Extractor):

    def extract(self):
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


class Indexator:
    pass


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
