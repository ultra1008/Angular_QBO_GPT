from extractors import ExpensesCreator, ExtractorsManager


def main():
    # url = 'https://s3.us-west-1.wasabisys.com/bicket1/folder1/invoice_page-1.pdf'
    url = 'https://s3.us-west-1.wasabisys.com/bicket1/folder1/quote_1.pdf'
    expenses = ExpensesCreator(url).create()
    results = ExtractorsManager(expenses['ExpenseDocuments']).extract()
    print(results)


if __name__ == '__main__':
    main()
