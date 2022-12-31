from pymongo import MongoClient
from uuid import uuid4


class Database:
    def __init__(self):
        client = MongoClient()
        self.db = client.rovuk_db

    @staticmethod
    def _generate_uuid():
        return str(uuid4())

    def _relate_to_matched(self, customer_id, matched_document, relation_id):
        # Get existing relations
        src_relation = self.db.relations.find_one({
            'customer_id': customer_id,
            'relation_id': relation_id
        })
        dst_relation = self.db.relations.find_one({
            'customer_id': customer_id,
            'relation_id': matched_document['relation_id']
        })

        # Make common relation
        related = list(set(src_relation['related']).union(set(dst_relation['related'])))

        # Create new relation
        new_relation_id = self._generate_uuid()
        self.db.relations.insert_one({
            'customer_id': customer_id,
            'relation_id': new_relation_id,
            'related': related
        })

        # Update
        for _id in related:
            self.db.documents.update_one({
                '_id': _id
            }, {
                "$set": {'relation_id': new_relation_id}
            })

        return new_relation_id

    def _index_quote_document(self, customer_id, document):
        n_docs = self.db.documents.count_documents({
            'customer_id': customer_id,
            'document_type': 'QUOTE',
            'quote_number': document['fields']['QUOTE_NUMBER']
        })

        if n_docs == 0:
            # Add document
            relation_id = self._generate_uuid()
            quote_resp = self.db.documents.insert_one({
                'customer_id': customer_id,
                'document_type': 'QUOTE',
                'quote_number': document['fields']['QUOTE_NUMBER'],
                'documents': [
                    document
                ],
                'relation_id': relation_id
            })
            # Add Relation
            self.db.relations.insert_one({
                'customer_id': customer_id,
                'relation_id': relation_id,
                'related': [quote_resp.inserted_id]
            })

            # Match to PO
            if document['fields']['QUOTE_NUMBER']:
                matched_po = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'PURCHASE_ORDER',
                    'quote_number': document['fields']['QUOTE_NUMBER']
                })
                if matched_po:
                    relation_id = self._relate_to_matched(customer_id, matched_po, relation_id)

        else:
            self.db.documents.update_one({
                'customer_id': customer_id,
                'document_type': 'QUOTE',
                'quote_number': document['fields']['QUOTE_NUMBER'],
            }, {
                '$push': {'documents': document}
            })


    def _index_purchase_order_document(self, customer_id, document):
        n_docs = self.db.documents.count_documents({
            'customer_id': customer_id,
            'document_type': 'PURCHASE_ORDER',
            'po_number': document['fields']['PO_NUMBER'],
        })

        if n_docs == 0:
            # Add document
            relation_id = self._generate_uuid()
            po_resp = self.db.documents.insert_one({
                'customer_id': customer_id,
                'document_type': 'PURCHASE_ORDER',
                'po_number': document['fields']['PO_NUMBER'],
                'quote_number': document['fields']['QUOTE_NUMBER'],
                'documents': [
                    document
                ],
                'relation_id': relation_id
            })
            # Add Relation
            self.db.relations.insert_one({
                'customer_id': customer_id,
                'relation_id': relation_id,
                'related': [po_resp.inserted_id]
            })

            # Match to Quote
            if document['fields']['QUOTE_NUMBER']:
                matched_quote = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'QUOTE',
                    'quote_number': document['fields']['QUOTE_NUMBER']
                })
                if matched_quote:
                    relation_id = self._relate_to_matched(customer_id, matched_quote, relation_id)

            # Match to Invoice
            if document['fields']['PO_NUMBER']:
                matched_invoice = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'INVOICE',
                    'po_number': document['fields']['PO_NUMBER']
                })
                if matched_invoice:
                    relation_id = self._relate_to_matched(customer_id, matched_invoice, relation_id)

            # Match to PS
            if document['fields']['PO_NUMBER']:
                matched_ps = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'PACKING_SLIP',
                    'po_number': document['fields']['PO_NUMBER']
                })
                if matched_ps:
                    relation_id = self._relate_to_matched(customer_id, matched_ps, relation_id)

        else:
            self.db.documents.update_one({
                'customer_id': customer_id,
                'document_type': 'PURCHASE_ORDER',
                'po_number': document['fields']['PO_NUMBER']
            }, {
                '$push': {'documents': document}
            })

    def _index_invoice_document(self, customer_id, document):
        n_docs = self.db.documents.count_documents({
            'customer_id': customer_id,
            'document_type': 'INVOICE',
            'invoice_number': document['fields']['INVOICE_NUMBER']
        })

        if n_docs == 0:
            relation_id = self._generate_uuid()
            invoice_resp = self.db.documents.insert_one({
                'customer_id': customer_id,
                'document_type': 'INVOICE',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
                'documents': [
                    document
                ],
                'relation_id': relation_id
            })
            # Add Relation
            self.db.relations.insert_one({
                'customer_id': customer_id,
                'relation_id': relation_id,
                'related': [invoice_resp.inserted_id]
            })

            # Match to PO
            if document['fields']['PO_NUMBER']:
                matched_po = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'PURCHASE_ORDER',
                    'po_number': document['fields']['PO_NUMBER']
                })
                if matched_po:
                    relation_id = self._relate_to_matched(customer_id, matched_po, relation_id)

            # Match to PS
            if document['fields']['INVOICE_NUMBER']:
                matched_ps = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'PACKING_SLIP',
                    'invoice_number': document['fields']['INVOICE_NUMBER']
                })
                if matched_ps:
                    relation_id = self._relate_to_matched(customer_id, matched_ps, relation_id)

        else:
            self.db.documents.update_one({
                'customer_id': customer_id,
                'document_type': 'INVOICE',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
            }, {
                '$push': {'documents': document}
            })


    def _index_packing_slip_document(self, customer_id, document):
        n_docs = self.db.documents.count_documents({
            'customer_id': customer_id,
            'document_type': 'PACKING_SLIP',
            'invoice_number': document['fields']['INVOICE_NUMBER'],
            'po_number': document['fields']['PO_NUMBER']
        })

        if n_docs == 0:
            # Add document
            relation_id = self._generate_uuid()
            ps_resp = self.db.documents.insert_one({
                'customer_id': customer_id,
                'document_type': 'PACKING_SLIP',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
                'documents': [
                    document
                ],
                'relation_id': relation_id
            })
            # Add Relation
            self.db.relations.insert_one({
                'customer_id': customer_id,
                'relation_id': relation_id,
                'related': [ps_resp.inserted_id]
            })

            # Match to Invoice
            if document['fields']['INVOICE_NUMBER']:
                matched_invoice = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'INVOICE',
                    'invoice_number': document['fields']['INVOICE_NUMBER']
                })
                if matched_invoice:
                    relation_id = self._relate_to_matched(customer_id, matched_invoice, relation_id)

            # Match to PO
            if document['fields']['PO_NUMBER']:
                matched_po = self.db.documents.find_one({
                    'customer_id': customer_id,
                    'document_type': 'PURCHASE_ORDER',
                    'po_number': document['fields']['PO_NUMBER']
                })
                if matched_po:
                    relation_id = self._relate_to_matched(customer_id, matched_po, relation_id)

        else:
            self.db.documents.update_one({
                'customer_id': customer_id,
                'document_type': 'PACKING_SLIP',
                # Note: since PS does not have a dedicated ID (like PO_NUMBER for PO) we identify it by these:
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
            }, {
                '$push': {'documents': document}
            })

    def index_document(self, customer_id, document):
        if document['document_type'] == 'PURCHASE_ORDER':
            self._index_purchase_order_document(customer_id, document)
        elif document['document_type'] == 'PACKING_SLIP':
            self._index_packing_slip_document(customer_id, document)
        elif document['document_type'] == 'QUOTE':
            self._index_quote_document(customer_id, document)
        elif document['document_type'] == 'INVOICE':
            self._index_invoice_document(customer_id, document)





if __name__ == '__main__':
    # -----------------------------------------------------------------------------------------
    def case_1():
        Database()._index_quote_document('cust_1', {
            'fields': {
                'document_type': 'QUOTE',
                'QUOTE_NUMBER': 'q1'
            }
        })

        Database()._index_invoice_document('cust_1', {
            'fields': {
                'document_type': 'INVOICE',
                'INVOICE_NUMBER': 'in1',
                'PO_NUMBER': 'po1',
            }
        })

        Database()._index_purchase_order_document('cust_1', {
            'fields': {
                'document_type': 'PURCHASE_ORDER',
                'PO_NUMBER': 'po1',
                'QUOTE_NUMBER': 'q1'
            }
        })

    def test_relation_case(case, customer_id, drop_db=True):
        if drop_db:
            MongoClient().drop_database('rovuk_db')

        documents = {
            'QUOTE': {
                'document_type': 'QUOTE',
                'fields': {
                    'QUOTE_NUMBER': 'q1'
                }
            },
            'INVOICE': {
                'document_type': 'INVOICE',
                'fields': {
                    'INVOICE_NUMBER': 'in1',
                    'PO_NUMBER': 'po1',
                }
            },
            'PURCHASE_ORDER': {
                'document_type': 'PURCHASE_ORDER',
                'fields': {
                    'PO_NUMBER': 'po1',
                    'QUOTE_NUMBER': 'q1'
                }
            },
            'PACKING_SLIP': {
                'document_type': 'PACKING_SLIP',
                'fields': {
                    'PO_NUMBER': 'po1',
                    'INVOICE_NUMBER': 'in1'
                }
            }
        }

        for doc_type in case:
            if doc_type == 'quote':
                Database()._index_quote_document(customer_id, documents['QUOTE'])
            elif doc_type == 'invoice':
                Database()._index_invoice_document(customer_id, documents['INVOICE'])
            elif doc_type == 'po':
                Database()._index_purchase_order_document(customer_id, documents['PURCHASE_ORDER'])
            elif doc_type == 'ps':
                Database()._index_packing_slip_document(customer_id, documents['PACKING_SLIP'])
            else:
                raise Exception(f'Wrong input document type: {doc_type}')


    # test_relation_case(['quote', 'invoice', 'po'], 'cust_1')
    # test_relation_case(['quote', 'po', 'invoice'], 'cust_1')
    # test_relation_case(['po', 'quote', 'invoice'], 'cust_1')
    # test_relation_case(['po', 'invoice', 'quote'], 'cust_1')
    # test_relation_case(['invoice', 'po', 'quote'], 'cust_1')
    # test_relation_case(['invoice', 'quote', 'po'], 'cust_1')

    # test_relation_case(['quote', 'invoice', 'po'], 'cust_1')
    # test_relation_case(['quote', 'invoice', 'po'], 'cust_1', drop_db=False)

    # --
    # test_relation_case(['ps', 'invoice'], 'cust_1')
    # test_relation_case(['invoice', 'ps'], 'cust_1', drop_db=False)
    # --
    # test_relation_case(['invoice', 'ps'], 'cust_1')
    # --
    # test_relation_case(['ps', 'po'], 'cust_1')
    # --
    # test_relation_case(['po', 'ps'], 'cust_1')
    # --


    # test_relation_case(['ps', 'invoice', 'quote', 'po'], 'cust_1')
    # test_relation_case(['po', 'ps', 'invoice', 'quote'], 'cust_1')
    test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_1')





    # -----------------------------------------------------------------------------------------
    def load_resp(fn):
        with open(fn) as f:
            response = f.read()
            response = json.loads(response)

        return response

    from extractors import ExtractorsManager
    import json

    def test_index_quote():
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_QUOTEs_aws_analyze_api/quote_1.pdf.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        # print(json.dumps(results_, indent=2))
        Database()._index_quote_document('cust_1', results_[0])

    def test_index_po():
        # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_PO FNC for Anil.pdf.json'
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_61cc7994d2045c72475f9ed4po1646925766302.pdf.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        Database()._index_purchase_order_document('cust_1', results_[0])

    def test_index_invoice():
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/' \
             'Invoice,8042209225,38077982,PJ WG Renewal 1 year.PDF.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        print(results_)
        Database()._index_invoice_document('cust_1', results_[0])

    def test_index_ps():
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_PSs_aws_analyze_api/ps_packingslip.pdf.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        print(results_)
        Database()._index_packing_slip_document('cust_1', results_[0])


    # test_index_quote()
    # test_index_po()
    # test_index_invoice()
    # test_index_ps()
