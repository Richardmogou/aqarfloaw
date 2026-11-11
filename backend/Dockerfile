FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    MEDIA_ROOT=/app/uploads

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN useradd --create-home --uid 1000 aqarflow
COPY --chown=aqarflow:aqarflow . .
# Created and owned before VOLUME so the mounted volume inherits write access for the non-root user.
RUN mkdir -p "$MEDIA_ROOT" && chown aqarflow:aqarflow "$MEDIA_ROOT"
VOLUME ["/app/uploads"]

USER aqarflow
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
