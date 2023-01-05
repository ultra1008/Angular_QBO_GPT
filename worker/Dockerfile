FROM python:3.8

WORKDIR /app

COPY ./worker/requirements.txt .
RUN pip install -r requirements.txt

COPY ./worker/worker.py .
COPY ./src .
COPY ./.env .

ENTRYPOINT celery -A worker worker --autoscale 10 --loglevel=info
