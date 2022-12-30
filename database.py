from pymongo import MongoClient


class Database:
    def __init__(self):
        client = MongoClient()
        self.db = client.documents_db

    def insert_quote_document(self, customer_id, document):
        n_docs = self.db.documents.count_documents({
            'customer_id': customer_id,
            'doc_type': 'QUOTE',
            'quote_number': document['fields']['QUOTE_NUMBER']
        })

        if n_docs == 0:
            self.db.documents.insert_one({
                'customer_id': customer_id,
                'doc_type': 'QUOTE',
                'quote_number': document['fields']['QUOTE_NUMBER'],
                'documents': [
                    document
                ],
                'relationships_id': None
            })
        else:
            self.db.documents.update_one({
                'customer_id': customer_id,
                'doc_type': 'QUOTE',
                'quote_number': document['fields']['QUOTE_NUMBER'],
            }, {
                '$push': {'documents': document}
            })


    def insert_purchase_order_document(self, customer_id, document):
        n_docs = self.db.documents.count_documents({
            'customer_id': customer_id,
            'doc_type': 'PO',
            'po_number': document['fields']['PO_NUMBER'],
        })

        if n_docs == 0:
            self.db.documents.insert_one({
                'customer_id': customer_id,
                'doc_type': 'PO',
                'po_number': document['fields']['PO_NUMBER'],
                'quote_number': document['fields']['QUOTE_NUMBER'],
                'documents': [
                    document
                ],
                'relationships_id': None
            })
        else:
            self.db.documents.update_one({
                'customer_id': customer_id,
                'doc_type': 'PO',
                'po_number': document['fields']['PO_NUMBER'],
            }, {
                '$push': {'documents': document}
            })

    def insert_invoice_document(self, customer_id, document):
        n_docs = self.db.documents.count_documents({
            'customer_id': customer_id,
            'doc_type': 'INVOICE',
            'invoice_number': document['fields']['INVOICE_NUMBER'],
        })

        if n_docs == 0:
            self.db.documents.insert_one({
                'customer_id': customer_id,
                'doc_type': 'INVOICE',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
                'documents': [
                    document
                ],
                'relationships_id': None
            })
        else:
            self.db.documents.update_one({
                'customer_id': customer_id,
                'doc_type': 'INVOICE',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
            }, {
                '$push': {'documents': document}
            })


    def insert_packing_slip_document(self, customer_id, document):
        n_docs = self.db.documents.count_documents({
            'customer_id': customer_id,
            'doc_type': 'PS',
            'invoice_number': document['fields']['INVOICE_NUMBER'],
            'po_number': document['fields']['PO_NUMBER'],
        })

        if n_docs == 0:
            self.db.documents.insert_one({
                'customer_id': customer_id,
                'doc_type': 'PS',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
                'documents': [
                    document
                ],
                'relationships_id': None
            })
        else:
            self.db.documents.update_one({
                'customer_id': customer_id,
                'doc_type': 'PS',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
            }, {
                '$push': {'documents': document}
            })




if __name__ == '__main__':
    def load_resp(fn):
        with open(fn) as f:
            response = f.read()
            response = json.loads(response)

        return response

    from extractors import ExtractorsManager
    import json

    def test_insert_quote():
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_QUOTEs_aws_analyze_api/quote_1.pdf.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        # print(json.dumps(results_, indent=2))

        Database().insert_quote_document('cust_1', results_[0])

    def test_insert_po():
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_PO FNC for Anil.pdf.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        Database().insert_purchase_order_document('cust_1', results_[0])

    def test_insert_invoice():
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/' \
             'Invoice,8042209225,38077982,PJ WG Renewal 1 year.PDF.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        print(results_)
        Database().insert_invoice_document('cust_1', results_[0])

    def test_insert_ps():
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_PSs_aws_analyze_api/ps_packingslip.pdf.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        print(results_)
        Database().insert_packing_slip_document('cust_1', results_[0])


    # test_insert_quote()
    # test_insert_po()
    # test_insert_invoice()
    test_insert_ps()
