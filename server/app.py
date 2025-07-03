from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from config import ApplicationConfig
from uuid import uuid4
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from database import init_db, User, Stock, db
from flask_mail import Mail, Message
import threading
import datetime
import jwt
import yfinance as yf
import pandas as pd

def get_uuid():
    return uuid4().hex

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
app.url_map.strict_slashes = False
db.init_app(app)
#jwt = JWTManager(app)
bcrypt = Bcrypt(app)
init_db(app)

cors = CORS(app, supports_credentials=True)

mail = Mail(app)

with app.app_context():
    db.create_all()

def send_mail_async(app, message):
    with app.app_context():
        try:
            mail.send(message)
            print("Mail successfully sent")
        except Exception as ex:
            print(f"Error: {ex}")


#--------LOGIN-------- 
def login_user(email, password):
    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"Error": "User with that email doesnt exist"}), 401

    try:
        if not bcrypt.check_password_hash(user.password, password):
        #if password != user.password:
            return jsonify({"Error": "Invalid email or password"}), 401
    except Exception as ex:
        print(f"Error: {ex}")
        return jsonify({"Error": "Server error"}), 500
    
    access_token = jwt.encode({
        'id':user.id,
        'exp':datetime.datetime.utcnow()+datetime.timedelta(minutes=15)
    },ApplicationConfig.JWT_SECRET_KEY, algorithm='HS256')
    return jsonify(access_token=access_token,user={"id":user.id,"email":user.email})

@app.route("/login", methods=["POST"])
def login_route():
    try:
        email = request.json["email"]
        password = request.json["password"]
    except Exception as ex:
        print(f"Error: {ex}")
        return jsonify({"Error": f"Missing key {ex}"}), 400

    return login_user(email, password)

#--------REGISTER--------
@app.route("/signup", methods=["POST"])
def register_route():
    try:
        email = request.json["email"]
        password = request.json["password"]
        first_name = request.json["first_name"]
        last_name = request.json["last_name"]
        address = request.json["address"]
        city = request.json["city"]
        country = request.json["country"]
        phone = request.json["phone"]
    except Exception as ex:
        print(f"Error: {ex}")
        return jsonify({"Error": f"Missing key {ex}"}), 400
    
    user_exist = User.query.filter_by(email=email).first()

    if user_exist:
        return jsonify({"Error": "User with that email already exists"}), 409
    
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(email = email, first_name = first_name, last_name = last_name, address = address, city = city, country = country, phone = phone, password = password_hash)
    db.session.add(user)
    db.session.commit()

    #slanje maila u zasebnom threadu
    message = Message(
        subject = f"Registration on stock portfolio",
        recipients = [f"{email}"],
        body = f"Successfully created account!\n\nGood luck in trading!"
    )

    thread = threading.Thread(target=send_mail_async, args=(app, message))
    thread.start()

    return jsonify({"Message": "Successfully registered user"}), 200

#--------EDIT PROFILE--------
@app.route("/user/<int:id>", methods = ["GET"])
def edit_route(id):
    user = User.query.filter_by(id=id).first()

    if user is None:
        return jsonify({"Error": "User with that email doesnt exist"}), 401

    return jsonify({"email":user.email, "first_name":user.first_name, "last_name":user.last_name, "address":user.address, "city":user.city, 
                    "country":user.country, "phone":user.phone, "password":user.password}), 200

@app.route("/edit/<int:id>", methods = ["POST", "PATCH"])
def edit_user_route(id):
    user = User.query.filter_by(id=id).first()

    if user is None:
        return jsonify({"Error": "User with that id doesnt exist"}), 401
    
    try:
        email = request.json["email"]
        password = request.json["password"]
        first_name = request.json["first_name"]
        last_name = request.json["last_name"]
        address = request.json["address"]
        city = request.json["city"]
        country = request.json["country"]
        phone = request.json["phone"]
    except Exception as ex:
        print(f"Error: {ex}")
        return jsonify({"Error": f"Missing key {ex}"}), 400
    
    user_exist = User.query.filter_by(email=email).first()

    if user_exist.id == id and (user_exist.id == id or user_exist is None):
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        user.email = email
        user.password = password_hash
        user.first_name = first_name
        user.last_name = last_name
        user.address = address
        user.city = city
        user.country = country
        user.phone = phone
        db.session.commit()

        #slanje maila u zasebnom threadu
        message = Message(
            subject = f"Updated profile on stock portfolio",
            recipients = [f"{email}"],
            body = f"Successfully updated account!\n\nGood luck in trading!"
        )

        thread = threading.Thread(target=send_mail_async, args=(app, message))
        thread.start()

        return jsonify({"Message": "Successfully updated user"}), 200
    else:
        return jsonify({"Error": "User with that email already exists"}), 409

#--------GET STOCKS--------
@app.route("/stocks/<int:id>", methods=["GET"])
def get_stocks(id):
    user = User.query.filter_by(id=id).first()

    if user is None:
        return jsonify({"Error": "User with that id didnt found"}), 401
    
    stocks = Stock.query.filter_by(user_id = id).all()

    stock_list = []
    totalValue = 0.0
    totalProfit = 0.0
    for stock in stocks:
        ticker = yf.Ticker(stock.stock_name.upper())

        info = ticker.info

        current_price = info.get('currentPrice', 'N/A')

        current_price = float(current_price)
        quantity = float(stock.quantity)

        if stock.is_sold == False:
            purchase_price = float(stock.purchase_price)
            invested_amount = purchase_price * quantity
            current_value = current_price * quantity
            profit = current_value - invested_amount
            totalValue -= invested_amount
        else:
            purchase_price = float(stock.sell_price)
            invested_amount = purchase_price * quantity
            current_value = current_price * quantity
            profit = invested_amount - current_value
            totalValue += invested_amount
        
        totalProfit += profit
        stock_list.append({
            'id': stock.id,
            'stock_name': stock.stock_name,
            'quantity': stock.quantity,
            'purchase_price': purchase_price,
            'transaction_date': stock.transaction_date.isoformat(),
            'current_price': round(current_price, 2),
            'profit': round(profit, 2),
            'is_sold': stock.is_sold
        })
    
    print(totalProfit)
    print(totalValue)

    return jsonify({
        "stocks": stock_list,
        "portfolioValue": round(totalValue, 2),
        "totalProfit": round(totalProfit, 2)
    }), 200

#--------ADD STOCKS--------
@app.route("/addStocks", methods=["POST"])
def add_stocks():
    try:
        stock_name = request.json["stock_name"]
        quantity = request.json["quantity"]
        price = request.json["price"]
        transaction_date = pd.to_datetime(request.json["transaction_date"])
        print(transaction_date)
        transaction_type = request.json["transaction_type"]
        user_id = request.json["user_id"]
    except Exception as ex:
        print(f"Error: {ex}")
        return jsonify({"Error": f"Server couldnt get data: {ex}"}), 400
    
    ticker = yf.Ticker(stock_name.upper())

    info = ticker.info

    if not info.get('longName') and not info.get('shortName'):
            return jsonify({"Error": f"Symbol '{stock_name}' not found in Yahoo Finance"}), 400
    
    if info.get('quoteType') not in ['EQUITY', 'ETF', 'MUTUALFUND', 'INDEX', 'CRYPTOCURRENCY']:
            return jsonify({"Error": f"'{stock_name}' is not a valid financial instrument"}), 400
    
    if transaction_type == "buy":
        stock = Stock(user_id = user_id, stock_name = stock_name, quantity = quantity, purchase_price = price, 
                    transaction_date = transaction_date, is_sold = False)
        db.session.add(stock)
        db.session.commit()
    else:
        stock = Stock(user_id = user_id, stock_name = stock_name, quantity = quantity, purchase_price = 0, 
                    transaction_date = transaction_date, is_sold = True, sell_price = price)
        db.session.add(stock)
        db.session.commit()

    return jsonify({"Message": "Successfully added stock transaction"}), 200

#--------DELETE STOCKS--------
@app.route("/deleteStocks/<int:id>", methods=["DELETE"])
def delete_stocks(id):
    stock = Stock.query.filter_by(id = id).first()

    if stock is None:
        return jsonify({"Error": "Stock with that id didnt found"}), 401
    
    db.session.delete(stock)
    db.session.commit()

    return jsonify({"Message": "Successfully deleted stock transaction"}), 200

if __name__ == "__main__":
    app.run(debug = True)