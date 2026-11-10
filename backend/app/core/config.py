from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")
    database_url: str = ""
    secret_key: str = ""
    cors_origins: str = "http://localhost:3000"
    environment: str = "development"
    session_cookie_name: str = "aqarflow_session"
    session_ttl_days: int = 7

    @property
    def cookie_secure(self) -> bool:
        return self.environment != "development"

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
