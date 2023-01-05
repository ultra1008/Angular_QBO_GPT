from fastapi import FastAPI
from celery import Celery
from typing import List
from pydantic import BaseModel
from indexer import Indexer
from starlette.status import HTTP_403_FORBIDDEN
import os
from fastapi import Security, Depends, HTTPException
from fastapi.security.api_key import APIKeyHeader
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

celery_app = Celery(
    'postman',
    broker='pyamqp://user:bitnami@rabbitmq',
    backend='rpc://user:bitnami@rabbitmq',
)

indexer = Indexer()


@app.get("/")
def health_check():
    return {"status": "OK"}


class Document(BaseModel):
    document_url: str


class Documents(BaseModel):
    documents: List[Document]


@app.post("/process")
async def process(data: Documents, _=Depends(auth)):
    # print('post_data:', data)
    for document in data.documents:
        celery_app.send_task('process_documents_bundle', (document.document_url,))

    return {
        'status': 'OK'
    }


@app.get("/search")
async def search(customer_id: str, query: str, _=Depends(auth)):
    return indexer.search(customer_id, query)
