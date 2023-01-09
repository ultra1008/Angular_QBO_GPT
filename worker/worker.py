import time
import random
# from processor import process_documents_bundle
from redis import Redis
from pottery import Redlock
from pottery.exceptions import ReleaseUnlockedLock
import os
from PyPDF2 import PdfReader, PdfWriter
from io import BytesIO
import boto3

from extractors import ExpensesCreator, ExtractorsManager
from indexer import Indexer


def process_document_bundle(documents_bundle_url):
    print(f'started process_document_bundle: {documents_bundle_url}')
    for _ in range(3):
        print('#'*100)

    indices = [i for i in range(len(documents_bundle_url)) if documents_bundle_url[i] == '/']
    customer_id = documents_bundle_url[indices[2] + 1: indices[3]]

    expenses = ExpensesCreator(documents_bundle_url).create()
    pages_on_s3 = _extract_documents_bundle_pages(documents_bundle_url)
    extracted_documents = ExtractorsManager(expenses['ExpenseDocuments'], pages_on_s3).extract()

    redis = Redis.from_url('redis://cache:6379/0')
    customer_lock = Redlock(key=customer_id, masters={redis}, auto_release_time=5*60)
    try:
        with customer_lock:
            Indexer().index(customer_id, documents_bundle_url, extracted_documents)

    except ReleaseUnlockedLock:
        print(f'Released unlocked lock for key: {customer_id} of url: {documents_bundle_url}')

    print(f'ended process_document_bundle: {documents_bundle_url}')


def _extract_documents_bundle_pages(documents_bundle_url):
    indices = [i for i in range(len(documents_bundle_url)) if documents_bundle_url[i] == '/']
    endpoint_url = documents_bundle_url[:indices[2]]
    bucket = documents_bundle_url[indices[2] + 1: indices[3]]
    key = documents_bundle_url[indices[3] + 1:]

    # Connect to source s3
    input_s3 = boto3.client(
        's3',
        endpoint_url=endpoint_url,
        aws_access_key_id=os.getenv('INPUT_AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('INPUT_AWS_SECRET_ACCESS_KEY')
    )

    # Get bucket object
    result = input_s3.get_object(Bucket=bucket, Key=key)
    raw_bytes_data = result['Body'].read()
    reader = PdfReader(BytesIO(raw_bytes_data))

    results = []
    for i in range(reader.numPages):
        writer = PdfWriter()
        writer.addPage(reader.getPage(i))

        with BytesIO() as bytes_stream:
            writer.write(bytes_stream)
            bytes_stream.seek(0)

            # Copy to destination s3
            textract_s3_bucket = 'rovuk-analysis-input'
            s3 = boto3.client('s3')
            key_i = f'{key}_{i}.pdf'
            s3.put_object(Body=bytes_stream, Bucket=textract_s3_bucket, Key=key_i)

            results.append((textract_s3_bucket, key_i))

    return results
