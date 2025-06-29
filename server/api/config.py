from pydantic_settings import BaseSettings  

class Settings(BaseSettings):
    database_url: str
    gemini_api_key: str
    openweather_api_key: str = ""
    secret_key: str = "THIS_IS_A_SECRET"

    class Config:
        env_file = ".env"

settings = Settings()
