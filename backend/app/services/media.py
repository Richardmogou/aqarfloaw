import uuid
from typing import BinaryIO

from app.services.storage import get_storage

MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_IMAGES_PER_PROPERTY = 20
CONTENT_TYPES = {"jpg": "image/jpeg", "png": "image/png", "webp": "image/webp"}


class InvalidImage(Exception):
    pass


class ImageTooLarge(Exception):
    pass


def detect_image_extension(content: bytes) -> str | None:
    if content.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if content[:4] == b"RIFF" and content[8:12] == b"WEBP":
        return "webp"
    return None


def read_image(stream: BinaryIO) -> tuple[bytes, str]:
    # The browser-declared content type is ignored: only the file signature decides.
    content = stream.read(MAX_IMAGE_BYTES + 1)
    if len(content) > MAX_IMAGE_BYTES:
        raise ImageTooLarge
    extension = detect_image_extension(content)
    if extension is None:
        raise InvalidImage
    return content, extension


def content_type_for(storage_key: str) -> str:
    return CONTENT_TYPES.get(storage_key.rsplit(".", 1)[-1], "application/octet-stream")


def store_image(property_id: uuid.UUID, content: bytes, extension: str) -> str:
    storage_key = f"properties/{property_id}/{uuid.uuid4().hex}.{extension}"
    get_storage().put(storage_key, content, CONTENT_TYPES[extension])
    return storage_key


def load_image(storage_key: str) -> bytes:
    return get_storage().get(storage_key)


def delete_image(storage_key: str) -> None:
    get_storage().delete(storage_key)
