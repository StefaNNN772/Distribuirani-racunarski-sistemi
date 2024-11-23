from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from uuid import uuid4
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Stock(db.Model):
    __tablename__ = 'stocks'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    stock_name = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    purchase_price = db.Column(db.Numeric(10, 2), nullable=False)
    transaction_date = db.Column(db.DateTime, nullable=False)

def add_users():
    users = [
        User(
            first_name='Stefan', 
            last_name='Lazarevic', 
            email='slazarevic772@gmail.com', 
            password_hash=generate_password_hash('password123')
        ),
    ]

    for user in users:
        db.session.add(user)
    
    db.session.commit()

def init_db(app):
    if not hasattr(app, 'extensions'):
        app.extensions = {}
    if 'sqlalchemy' not in app.extensions:
        db.init_app(app)
    with app.app_context():
        db.create_all()
        add_users()