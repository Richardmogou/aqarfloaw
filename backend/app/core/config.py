from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")
    database_url: str = ""
    secret_key: str = ""
    cors_origins: str = "http://localhost:3000"
    environment: str = "development"
    session_cookie_name: str = "aqarflow_session"
    session_ttl_days: int = 7
    media_root: str = "uploads"
    storage_backend: Literal["local", "s3"] = "local"
    s3_endpoint_url: str = ""
    s3_region: str = "us-east-1"
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_bucket: str = "aqarflow-media"
    # Agency that receives general contact messages (no property attached). Empty = the only agency, if there is one.
    public_agency_slug: str = ""

    @property
    def cookie_secure(self) -> bool:
        return self.environment != "development"

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
