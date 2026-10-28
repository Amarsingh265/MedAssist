from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./medassist.db"
    secret_key: str = "change-this-to-a-random-secret-key"
    access_token_expire_minutes: int = 1440
    algorithm: str = "HS256"
    cors_origins: str = "http://localhost:5173"
    webrtc_stun_urls: str = ""
    turn_server_urls: str = ""
    turn_shared_secret: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
