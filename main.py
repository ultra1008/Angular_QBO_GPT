from extractors import ExpensesCreator, ExtractorsManager, Indexer



def main():
    # url = 'https://s3.us-west-1.wasabisys.com/bicket1/folder1/invoice_page-1.pdf'
    url = 'https://s3.us-west-1.wasabisys.com/bicket1/folder1/quote_1.pdf'
    expenses = ExpensesCreator(url).create()
    extracted_documents = ExtractorsManager(expenses['ExpenseDocuments']).extract()
    Indexer('cust_1', extracted_documents).index()


if __name__ == '__main__':
    main()
