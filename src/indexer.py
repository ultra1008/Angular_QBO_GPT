import pymongo
from pymongo import MongoClient, ASCENDING
from uuid import uuid4



class Indexer:
    def __init__(self):
        client = MongoClient('mongodb://mongo:27017')
        self.db = client.rovuk_db

        # If the index already exists, MongoDB will not recreate the index
        self.db.documents.create_index([('searchable', pymongo.TEXT)], name='document_fields')
        self.db.relations.create_index([('relation_id', ASCENDING)], name='relation_id')
        self.db.relations.create_index([('document_id', ASCENDING)], name='document_id')
        self.db.relations.create_index([('document_hash', ASCENDING)], name='document_hash')


    def update_duplicate_document_bundle(self, doc_hash, document_id, s3_docs_bundle_url):
        result = self.db.documents.update_many({
            'document_hash': doc_hash
        }, {
            '$set': {'document_id': document_id, 'url': s3_docs_bundle_url}
        })

        return result.modified_count > 0


    def index(self, customer_id, document_id, s3_docs_bundle_url, doc_hash, documents):
        for doc in documents:
            self._index_document(customer_id, document_id, s3_docs_bundle_url, doc)

        self.db.documents.update_many({
            'document_id': document_id
        }, {
            '$set': {'indexed': True, 'document_hash': doc_hash}
        })

    def _index_document(self, customer_id, document_id, s3_docs_bundle_url, document):
        if document['document_type'] == 'PURCHASE_ORDER':
            self._index_purchase_order_document(customer_id, document_id, s3_docs_bundle_url, document)
        elif document['document_type'] == 'PACKING_SLIP':
            self._index_packing_slip_document(customer_id, document_id, s3_docs_bundle_url, document)
        elif document['document_type'] == 'QUOTE':
            self._index_quote_document(customer_id, document_id, s3_docs_bundle_url, document)
        elif document['document_type'] == 'INVOICE':
            self._index_invoice_document(customer_id, document_id, s3_docs_bundle_url, document)


    def search(self, customer_id, query):
        if 'documents' not in self.db.list_collection_names():
            return []

        documents = list(self.db.documents.find({'customer_id': customer_id, '$text': {'$search': query}}))
        return self._compose_documents(documents)


    def get_documents_by_id(self, customer_id, document_ids):
        print('get_documents_by_id')
        if 'documents' not in self.db.list_collection_names():
            return []

        documents = list(self.db.documents.find({
            'customer_id': customer_id,
            'document_id': {'$in': document_ids},
            'indexed': True
        }))
        documents = self._compose_documents(documents)

        results = {}
        for doc in documents:
            if doc['document_id'] not in results:
                results[doc['document_id']] = []
            results[doc['document_id']].append(doc)

        for did in document_ids:
            if did not in results:
                results[did] = None

        return results

    def _compose_documents(self, documents):
        relation_ids = list({doc['relation_id'] for doc in documents})
        relations = list(self.db.relations.find({"relation_id": {'$in': relation_ids}}))
        related_document_ids = []
        for relation in relations:
            related_document_ids.extend(relation['related'])
        all_related_documents_ids = list(set(related_document_ids))
        all_related_documents = list(self.db.documents.find({"_id": {'$in': all_related_documents_ids}}))
        all_related_documents_map = {document['_id']: document for document in all_related_documents}
        all_relations_map = {relation['relation_id']: relation for relation in relations}

        results = []
        for doc_set in documents:
            doc_set_result = {
                'document_type': doc_set['document_type'],
                'document_id': doc_set['document_id'],
                'document_url': doc_set['url'],
                'document_pages': [{
                        'fields': doc['fields'],
                        'expense_groups': doc.get('expense_groups')
                    }
                    for doc in doc_set['documents']
                ]
            }

            related = all_relations_map[doc_set['relation_id']]['related']
            related = [rel for rel in related if rel != doc_set['_id']]
            doc_set_result['related_documents'] = [{
                    'document_type': all_related_documents_map[rel]['document_type'],
                    'document_id': doc_set['document_id'],
                    'document_url': all_related_documents_map[rel]['url'],
                    'document_pages': [{
                            'fields': doc['fields'],
                            'expense_groups': doc.get('expense_groups')
                        }
                        for doc in all_related_documents_map[rel]['documents']
                    ]
                }
                for rel in related
            ]

            results.append(doc_set_result)

        return results


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

    def _index_quote_document(self, customer_id, document_id, s3_docs_bundle_url, document):
        n_docs = 0
        if document['fields']['QUOTE_NUMBER']:
            n_docs = self.db.documents.count_documents({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'QUOTE',
                'quote_number': document['fields']['QUOTE_NUMBER']
            })

        if n_docs == 0:
            # Add document
            relation_id = self._generate_uuid()
            quote_resp = self.db.documents.insert_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'QUOTE',
                'quote_number': document['fields']['QUOTE_NUMBER'],
                'documents': [
                    document
                ],
                'relation_id': relation_id,
                'searchable': list(document['fields'].values()),
                'url': s3_docs_bundle_url
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
                'document_id': document_id,
                'document_type': 'QUOTE',
                'quote_number': document['fields']['QUOTE_NUMBER'],
            }, {
                '$push': {
                    'documents': document,
                    'searchable': {'$each': list(document['fields'].values())}
                }
            })


    def _index_purchase_order_document(self, customer_id, document_id, s3_docs_bundle_url, document):
        n_docs = 0
        if document['fields']['PO_NUMBER']:
            n_docs = self.db.documents.count_documents({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'PURCHASE_ORDER',
                'po_number': document['fields']['PO_NUMBER'],
            })

        if n_docs == 0:
            # Add document
            relation_id = self._generate_uuid()
            po_resp = self.db.documents.insert_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'PURCHASE_ORDER',
                'po_number': document['fields']['PO_NUMBER'],
                'quote_number': document['fields']['QUOTE_NUMBER'],
                'documents': [
                    document
                ],
                'relation_id': relation_id,
                'searchable': list(document['fields'].values()),
                'url': s3_docs_bundle_url
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
                'document_id': document_id,
                'document_type': 'PURCHASE_ORDER',
                'po_number': document['fields']['PO_NUMBER']
            }, {
                '$push': {
                    'documents': document,
                    'searchable': {'$each': list(document['fields'].values())}
                },
            })

    def _index_invoice_document(self, customer_id, document_id, s3_docs_bundle_url, document):
        n_docs = 0
        if document['fields']['INVOICE_NUMBER']:
            n_docs = self.db.documents.count_documents({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'INVOICE',
                'invoice_number': document['fields']['INVOICE_NUMBER']
            })

        if n_docs == 0:
            relation_id = self._generate_uuid()
            invoice_resp = self.db.documents.insert_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'INVOICE',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
                'documents': [
                    document
                ],
                'relation_id': relation_id,
                'searchable': list(document['fields'].values()),
                'url': s3_docs_bundle_url
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
                'document_id': document_id,
                'document_type': 'INVOICE',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
            }, {
                '$push': {
                    'documents': document,
                    'searchable': {'$each': list(document['fields'].values())}
                }
            })


    def _index_packing_slip_document(self, customer_id, document_id, s3_docs_bundle_url, document):
        n_docs = 0
        if document['fields']['INVOICE_NUMBER'] and document['fields']['PO_NUMBER']:
            n_docs = self.db.documents.count_documents({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'PACKING_SLIP',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER']
            })

        if n_docs == 0:
            # Add document
            relation_id = self._generate_uuid()
            ps_resp = self.db.documents.insert_one({
                'customer_id': customer_id,
                'document_id': document_id,
                'document_type': 'PACKING_SLIP',
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
                'documents': [
                    document
                ],
                'relation_id': relation_id,
                'searchable': list(document['fields'].values()),
                'url': s3_docs_bundle_url
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
                'document_id': document_id,
                'document_type': 'PACKING_SLIP',
                # Note: since PS does not have a dedicated ID (like PO_NUMBER for PO) we identify it by these:
                'invoice_number': document['fields']['INVOICE_NUMBER'],
                'po_number': document['fields']['PO_NUMBER'],
            }, {
                '$push': {
                    'documents': document,
                    'searchable': {'$each': list(document['fields'].values())}
                }
            })






if __name__ == '__main__':
    import json

    # -----------------------------------------------------------------------------------------
    def case_1():
        Indexer()._index_quote_document('cust_1', {
            'fields': {
                'document_type': 'QUOTE',
                'QUOTE_NUMBER': 'q1'
            }
        })

        Indexer()._index_invoice_document('cust_1', {
            'fields': {
                'document_type': 'INVOICE',
                'INVOICE_NUMBER': 'in1',
                'PO_NUMBER': 'po1',
            }
        })

        Indexer()._index_purchase_order_document('cust_1', {
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
                Indexer()._index_quote_document(customer_id, 'my-s3_docs_bundle_url', documents['QUOTE'])
            elif doc_type == 'invoice':
                Indexer()._index_invoice_document(customer_id, 'my-s3_docs_bundle_url', documents['INVOICE'])
            elif doc_type == 'po':
                Indexer()._index_purchase_order_document(customer_id, 'my-s3_docs_bundle_url',
                                                         documents['PURCHASE_ORDER'])
            elif doc_type == 'ps':
                Indexer()._index_packing_slip_document(customer_id, 'my-s3_docs_bundle_url', documents['PACKING_SLIP'])
            else:
                raise Exception(f'Wrong input document type: {doc_type}')

    """Test Relations"""
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
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_1')

    # --
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_1')
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_2', drop_db=False)
    # --
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_1')
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_1', drop_db=False)
    # --

    """Test Search"""
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_1')
    # test_relation_case(['quote', 'invoice', 'ps', 'po'], 'cust_1', drop_db=False)
    # print(json.dumps({'search': Indexer().search('cust_1', 'in1')}, indent=2))
    # # --
    # test_relation_case(['quote'], 'cust_1')
    # print(json.dumps({'search': Indexer().search('cust_1', 'q1')}, indent=2))
    # --
    # test_relation_case(['invoice', 'ps'], 'cust_1')
    # test_relation_case(['quote'], 'cust_2', drop_db=False)
    # print(json.dumps({'search': Indexer().search('cust_2', 'q1')}, indent=2))
    # --
    # print(json.dumps({'search': Indexer().search('cust_1', '899')}, indent=2))


    def test_index_search():
        MongoClient().drop_database('rovuk_db')

        Indexer()._index_quote_document('cust_1', 'my_s3_url', {
            'document_type': 'QUOTE',
            'fields': {
                'QUOTE_NUMBER': 'q1',
                'FIELD_1': 'value_1'
            }
        })  # , searchable=['aaa1a', 'aaa1b']

        Indexer()._index_quote_document('cust_1', 'my_s3_url', {
            'document_type': 'QUOTE',
            'fields': {
                'QUOTE_NUMBER': 'q1',
                'FIELD_2': 'value_2'
            }
        })  # searchable=['aaa1a', 'aaa2b']

        Indexer()._index_quote_document('cust_1', 'my_s3_url', {
            'document_type': 'QUOTE',
            'fields': {
                'QUOTE_NUMBER': 'q2',
                'FIELD_3': 'value_3'
            }
        })  # searchable=['aaa1a', 'aaa3b']

        Indexer()._index_quote_document('cust_2', 'my_s3_url', {
            'document_type': 'QUOTE',
            'fields': {
                'QUOTE_NUMBER': 'q2',
                'FIELD_3': 'value_3'
            }
        })  # searchable=['aaa1a', 'aaa3b']


        #https://www.mongodb.com/docs/manual/tutorial/limit-number-of-items-scanned-for-text-search/
        # MongoClient().rovuk_db.documents.create_index([("$**", pymongo.TEXT)])  # {$text: {$search: 'value_3'}}
        # MongoClient().rovuk_db.documents.create_index("fields.$**")  # {"documents.fields.FIELD_3": "value_3"}
        #{"documents.fields": "value_1"}
        #

        # https://stackoverflow.com/questions/10610131/checking-if-a-field-contains-a-string


        # MongoClient().rovuk_db.documents.create_index([('searchable', pymongo.TEXT)], name='search_document_fields')  # {$text: {$search: 'value_3'}}
        print(json.dumps({'results': Indexer().search('cust_1', 'value_2')}, indent=2))


    # test_index_search()


    # -----------------------------------------------------------------------------------------
    def load_resp(fn):
        with open(fn) as f:
            response = f.read()
            response = json.loads(response)

        return response

    from extractors import ExtractorsManager

    def test_index_quote():
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_QUOTEs_aws_analyze_api/quote_1.pdf.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        # print(json.dumps(results_, indent=2))
        Indexer()._index_quote_document('cust_1', results_[0])

    def test_index_po():
        # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_PO FNC for Anil.pdf.json'
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_61cc7994d2045c72475f9ed4po1646925766302.pdf.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        Indexer()._index_purchase_order_document('cust_1', results_[0])

    def test_index_invoice():
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/' \
             'Invoice,8042209225,38077982,PJ WG Renewal 1 year.PDF.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        print(results_)
        Indexer()._index_invoice_document('cust_1', results_[0])

    def test_index_ps():
        fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_PSs_aws_analyze_api/ps_packingslip.pdf.json'
        results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
        print(results_)
        Indexer()._index_packing_slip_document('cust_1', results_[0])


    def test_agg():
        import datetime
        from bson.timestamp import Timestamp

        client = MongoClient('mongodb://localhost:27017')
        db = client.rovuk_db

        # db.documents.insert_many([
        #     {
        #         "documents_1": [
        #             {
        #                 "created_date": datetime.datetime.utcnow(),
        #                 "textract": [
        #                     "exp",
        #                     "form"
        #                 ]
        #             },
        #             {
        #                 "created_date": datetime.datetime.utcnow(),
        #                 "textract": [
        #                     "exp"
        #                 ]
        #             }
        #         ]
        #     },
        #     {
        #         "documents_1": [
        #             {
        #                 "created_date": datetime.datetime.utcnow(),
        #                 "textract": [
        #                     "exp"
        #                 ]
        #             }
        #         ]
        #     }
        # ])

        # date_from = datetime.datetime.fromisoformat('2023-02-10T12:40:51.860+00:00')
        # date_to = datetime.datetime.fromisoformat('2023-02-10T12:40:53.860+00:00')
        date_from = datetime.datetime.fromisoformat('2023-02-10T00:00:01.000+00:00')
        date_to = datetime.datetime.fromisoformat('2023-02-10T23:59:59.860+00:00')

        results = db.documents.aggregate([
            # {'$match': {{'documents_1.created_date': {$gt: 70, $lt: 90}}}},
            {'$match': {'documents_1.created_date': {'$gt': date_from, '$lt': date_to}}},
            # {'$match': {'documents_1.created_date': datetime.datetime.fromisoformat('2023-02-10T11:16:48.271+00:00')}},
            {'$unwind': "$documents_1"},
            {'$unwind': "$documents_1.textract"},
            {'$group': {'_id': "$documents_1.textract", 'count': {'$sum': 1}}},
        ])
        import pprint
        pprint.pprint(list(results))
        #https://www.bmc.com/blogs/mongodb-unwind/
        # results = db.documents.count(
        #     {"documents.te": True}
        # )
        # print(results)

    test_agg()
    # test_index_quote()
    # test_index_po()
    # test_index_invoice()
    # test_index_ps()
