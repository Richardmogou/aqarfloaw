from functools import lru_cache
from pathlib import Path

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.core.config import settings


class StoredObjectMissing(Exception):
    pass


class LocalStorage:
    # Reads media_root on every call so tests can point it at a temporary directory.
    def _path(self, key: str) -> Path:
        return Path(settings.media_root) / key

    def put(self, key: str, content: bytes, content_type: str) -> None:
        path = self._path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)

    def get(self, key: str) -> bytes:
        try:
            return self._path(key).read_bytes()
        except FileNotFoundError as error:
            raise StoredObjectMissing from error

    def delete(self, key: str) -> None:
        self._path(key).unlink(missing_ok=True)


class S3Storage:
    def __init__(self) -> None:
        self.bucket = settings.s3_bucket
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint_url or None,
            region_name=settings.s3_region,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            # MinIO serves buckets by path, not by virtual-host subdomain.
            config=Config(s3={"addressing_style": "path"}, signature_version="s3v4"),
        )

    def put(self, key: str, content: bytes, content_type: str) -> None:
        self.client.put_object(Bucket=self.bucket, Key=key, Body=content, ContentType=content_type)

    def get(self, key: str) -> bytes:
        try:
            return self.client.get_object(Bucket=self.bucket, Key=key)["Body"].read()
        except ClientError as error:
            if error.response["Error"]["Code"] in {"NoSuchKey", "404"}:
                raise StoredObjectMissing from error
            raise

    def delete(self, key: str) -> None:
        self.client.delete_object(Bucket=self.bucket, Key=key)


@lru_cache
def s3_storage() -> S3Storage:
    return S3Storage()


def get_storage() -> LocalStorage | S3Storage:
    return s3_storage() if settings.storage_backend == "s3" else LocalStorage()
