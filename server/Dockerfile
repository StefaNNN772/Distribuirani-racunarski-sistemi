FROM python:3.9-alpine

WORKDIR /app

COPY config.py ./
COPY models/ ./models
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD flask run --host=0.0.0.0 --port=${PORT:-5000}