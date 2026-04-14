FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app
COPY resources/ ./resources
COPY certs/ ./certs

EXPOSE 80 443

# start.sh – run HTTP on port 80 and HTTPS on port 443 concurrently.
# Both instances serve the same FastAPI application.
RUN printf '#!/bin/sh\n\
uvicorn app.main:app --host 0.0.0.0 --port 80 &\n\
uvicorn app.main:app --host 0.0.0.0 --port 443 \\\n\
  --ssl-keyfile /app/certs/server.key \\\n\
  --ssl-certfile /app/certs/server.crt &\n\
wait\n' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]
