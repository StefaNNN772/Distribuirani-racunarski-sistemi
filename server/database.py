from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, String, func
from sqlalchemy.orm import relationship
from uuid import uuid4
from datetime import datetime

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    address = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.Integer, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    balance = db.Column(db.Numeric(20, 2), nullable=False, default=0.0)

class Stock(db.Model):
    __tablename__ = 'stocks'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    stock_name = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    purchase_price = db.Column(db.Numeric(10, 2), nullable=False)
    sell_price = db.Column(db.Numeric(10, 2), nullable=True)
    transaction_date = db.Column(db.DateTime, default=func.now())
    is_sold = db.Column(db.Boolean, default = False)

# def add_users():
#     users = [
#         User(
#             first_name='Stefan',
#             last_name='Lazarevic',
#             email='slazarevic772@gmail.com',
#             address='Aleksandra Tisme 8',
#             city='Novi Sad',
#             country='Serbia',
#             phone='065',
#             password='Stefan'
#         ),
#     ]

#     for user in users:
#         db.session.add(user)
    
#     db.session.commit()

def init_db(app):
    if not hasattr(app, 'extensions'):
        app.extensions = {}
    if 'sqlalchemy' not in app.extensions:
        db.init_app(app)
    with app.app_context():
        db.create_all()
        # add_users()