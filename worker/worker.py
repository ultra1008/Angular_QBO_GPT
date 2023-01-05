import time
import random
from celery import Celery
# from processor import process_documents_bundle
from redis import Redis
from pottery import Redlock
from pottery.exceptions import ReleaseUnlockedLock

from extractors import ExpensesCreator, ExtractorsManager
from indexer import Indexer


# Wait for rabbitmq to be started
time.sleep(15)

app = Celery(
    'postman',
    broker='pyamqp://user:bitnami@rabbitmq',
    backend='rpc://user:bitnami@rabbitmq',
)

redis = Redis.from_url('redis://cache:6379/0')


@app.task(name='process_documents_bundle')
def process_document_bundle(document_url):
    print(f'started process_document_bundle: {document_url}')
    expenses = ExpensesCreator(document_url).create()
    extracted_documents = ExtractorsManager(expenses['ExpenseDocuments']).extract()

    indices = [i for i in range(len(document_url)) if document_url[i] == '/']
    customer_id = document_url[indices[2] + 1: indices[3]]

    customer_lock = Redlock(key=customer_id, masters={redis}, auto_release_time=5*60)
    try:
        with customer_lock:
            Indexer().index(customer_id, document_url, extracted_documents)

    except ReleaseUnlockedLock:
        print(f'Released unlocked lock for key: {customer_id} of url: {document_url}')

    print(f'ended process_document_bundle: {document_url}')
