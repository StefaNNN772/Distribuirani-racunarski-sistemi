from os import environ
from datetime import timedelta

class ApplicationConfig:   
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_DATABASE_URI = environ.get('DATABASE_URL')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_SECRET_KEY = "slbodvmvs"
    #Mail configuration
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = 'schneiderelectricinternship@gmail.com'
    MAIL_PASSWORD = 'aeoo vuqm gifg pnsw'
    MAIL_DEFAULT_SENDER = 'schneiderelectricinternship@gmail.com'