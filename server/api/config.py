from pydantic_settings import BaseSettings  

class Settings(BaseSettings):
    database_url: str
    openai_api_key: str = ""
    weather_api_key: str = ""
    secret_key: str = "fallback_secret"

    class Config:
        env_file = ".env"

settings = Settings()
