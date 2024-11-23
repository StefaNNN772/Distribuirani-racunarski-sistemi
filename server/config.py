from os import environ
from datetime import timedelta

class ApplicationConfig:   
    #SECRET_KEY = os.environ["SECRET_KEY"]
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_DATABASE_URI = environ.get('DB_URL')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)