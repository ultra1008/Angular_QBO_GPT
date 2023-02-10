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
import json
import hashlib
import boto3
import os

from dotenv import load_dotenv
load_dotenv()

from extractors import ExtractorsManager
from indexer import Indexer


def process_documents_bundle(data):
    for _ in range(3):
        print('#'*100)
    print(f'started process_document_bundle: {data}')

    indexer = Indexer()
    doc_hash = _calc_document_bundle_hash(data['document_url'])
    if indexer.update_duplicate_document_bundle(doc_hash, data['document_id'], data['document_url']):
        return

    custom_fields_conf = _load_custom_fields_conf()
    extracted_documents = ExtractorsManager(data['document_url'], custom_fields_conf).extract()

    indices = [i for i in range(len(data['document_url'])) if data['document_url'][i] == '/']
    customer_id = data['document_url'][indices[2] + 1: indices[3]]

    redis = Redis.from_url('redis://cache:6379/0')
    customer_lock = Redlock(key=customer_id, masters={redis}, auto_release_time=5*60)
    try:
        with customer_lock:
            indexer.index(customer_id, data['document_id'], data['document_url'], doc_hash, extracted_documents)

    except ReleaseUnlockedLock:
        print(f'Released unlocked lock for key: {customer_id} of url: {data["document_url"]}')

    print(f'ended process_document_bundle: {data["document_url"]}')


def _load_custom_fields_conf():
    conf = {}
    for conf_name in ['PURCHASE_ORDER', 'PACKING_SLIP', 'QUOTE', 'INVOICE']:
        try:
            with open(f'/data/custom_fields/{conf_name}.json') as f:
                conf_cont = f.read()
                conf[conf_name] = json.loads(conf_cont)

            print(f'Loaded custom_fields_conf for doctype: {conf_name}')
        except Exception as e:
            print(f'No custom_fields_conf for doctype: {conf_name}')

    print(f'Final custom_fields_conf: {conf}')
    return conf


def _calc_document_bundle_hash(documents_bundle_url):
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

    # Hash
    h1 = hashlib.sha1()
    h1.update(raw_bytes_data)
    return h1.hexdigest()  # 160 bits
