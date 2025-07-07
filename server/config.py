from os import environ
from datetime import timedelta

class ApplicationConfig:   
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_DATABASE_URI = environ.get('DATABASE_URL')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_SECRET_KEY = environ.get('JWT_SECRET_KEY')
    #Mail configuration
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = environ.get('MAIL_DEFAULT_SENDER')