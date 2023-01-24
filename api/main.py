from fastapi import FastAPI, Query
from typing import List
from pydantic import BaseModel
from indexer import Indexer
from starlette.status import HTTP_403_FORBIDDEN
import os
from fastapi import Security, Depends, HTTPException
from fastapi.security.api_key import APIKeyHeader

from redis import Redis
from rq import Queue

from dotenv import load_dotenv
load_dotenv()



authorizer = APIKeyHeader(name='X-API-KEY', auto_error=True)


async def auth(api_key_value: str = Security(authorizer)):
    if api_key_value == os.environ['API_KEY_VALUE']:
        return
    else:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN, detail="Not authenticated"
        )


app = FastAPI()
q = Queue(connection=Redis.from_url('redis://cache:6379/0'))

indexer = Indexer()


@app.get("/")
def health_check():
    print('health_check')
    return {"status": "OK"}


class Document(BaseModel):
    document_url: str
    document_id: str


class Documents(BaseModel):
    documents: List[Document]


@app.post("/process")
async def process(data: Documents, _=Depends(auth)):
    print(f'process: {data=}')
    for document in data.documents:
        r = q.enqueue(
            'worker.process_documents_bundle',
            {'document_url': document.document_url, 'document_id': document.document_id},
            job_timeout=600  # 10min
        )
        print('sent_task:', r)

    return {
        'status': 'OK'
    }


@app.get("/get_documents_by_id")
async def get_documents_by_id(customer_id: str, document_id: List[str] = Query(default=None), _=Depends(auth)):
    print(f'get_documents_by_id: {customer_id=}, {document_id=}')
    return indexer.get_documents_by_id(customer_id, document_id)


@app.get("/search")
async def search(customer_id: str, query: str, _=Depends(auth)):
    print(f'search: {customer_id=}, {query=}')
    return indexer.search(customer_id, query)
