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
from flask_socketio import SocketIO, emit, join_room, leave_room
import threading
from datetime import datetime, timedelta
import jwt
import yfinance as yf
import pandas as pd
import requests
import os
import time

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
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

price_cache = {}
connected_users = {}  # Track connected users and their rooms

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

# WebSocket Events
@socketio.on('connect')
def on_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def on_disconnect():
    print(f"Client disconnected: {request.sid}")
    for user_id, sessions in list(connected_users.items()):
        if request.sid in sessions:
            sessions.remove(request.sid)
            if not sessions:
                del connected_users[user_id]
            break

@socketio.on('join_user_room')
def on_join_user_room(data):
    user_id = data.get('user_id')
    if user_id:
        room = f"user_{user_id}"
        join_room(room)
        
        # Track connected users
        if user_id not in connected_users:
            connected_users[user_id] = []
        connected_users[user_id].append(request.sid)
        
        print(f"User {user_id} joined room {room}")
        emit('joined_room', {'room': room})

@socketio.on('leave_user_room')
def on_leave_user_room(data):
    user_id = data.get('user_id')
    if user_id:
        room = f"user_{user_id}"
        leave_room(room)
        print(f"User {user_id} left room {room}")

def broadcast_stock_update(user_id, event_type, data):
    room = f"user_{user_id}"
    socketio.emit(event_type, data, room=room)
    print(f"Broadcasted {event_type} to room {room}")

def broadcast_price_updates():
    while True:
        try:
            time.sleep(120)  # Update every 2 minutes
            
            if not connected_users:
                continue
                
            # Get all unique stock symbols from all users
            all_stocks = set()
            user_stocks = {}
            
            for user_id in connected_users.keys():
                user = User.query.filter_by(id=user_id).first()
                if user:
                    stocks = Stock.query.filter_by(user_id=user_id).all()
                    user_stock_symbols = [stock.stock_name.upper() for stock in stocks]
                    user_stocks[user_id] = user_stock_symbols
                    all_stocks.update(user_stock_symbols)
            
            # Fetch current prices for all stocks
            updated_prices = {}
            for symbol in all_stocks:
                try:
                    current_price = get_current_stock_price(symbol)
                    if current_price:
                        updated_prices[symbol] = current_price
                        cache_price(symbol, current_price)
                except Exception as e:
                    print(f"Error updating price for {symbol}: {e}")
            
            # Broadcast updates to each user's room
            for user_id, symbols in user_stocks.items():
                user_updates = {symbol: updated_prices.get(symbol) for symbol in symbols if symbol in updated_prices}
                if user_updates:
                    room = f"user_{user_id}"
                    socketio.emit('prices_updated', {
                        'prices': user_updates,
                        'timestamp': datetime.now().isoformat()
                    }, room=room)
                    
        except Exception as e:
            print(f"Error in price update broadcast: {e}")

# Start price update thread
price_update_thread = threading.Thread(target=broadcast_price_updates, daemon=True)
price_update_thread.start()

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
        'exp':datetime.utcnow()+timedelta(minutes=15)
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

def get_stocks_data_internal(user_id):
    try:
        user = User.query.filter_by(id=user_id).first()
        if user is None:
            return None
        
        stocks = Stock.query.filter_by(user_id=user_id).all()
        
        stock_list = []
        totalValue = 0.0
        totalProfit = 0.0
        
        for stock in stocks:
            ticker = yf.Ticker(stock.stock_name)
            info = ticker.info
            current_price = info.get('currentPrice', 'N/A')
            
            if current_price is None:
                continue

            quantity = float(stock.quantity)

            if stock.is_sold == False:
                purchase_price = float(stock.purchase_price)
                invested_amount = purchase_price * quantity
                current_value = current_price * quantity
                profit = current_value - invested_amount
                totalValue += current_value
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
        
        return {
            "stocks": stock_list,
            "portfolioValue": round(totalValue, 2),
            "totalProfit": round(totalProfit, 2),
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as ex:
        print(f"Error fetching stocks internally: {ex}")
        return None

#--------GET STOCKS--------
@app.route("/stocks/<int:id>", methods=["GET"])
def get_stocks(id):
    try:
        user = User.query.filter_by(id=id).first()
        if user is None:
            return jsonify({"Error": "User with that id didnt found"}), 401
        
        stocks = Stock.query.filter_by(user_id = id).all()
        
        stock_list = []
        totalValue = 0.0
        totalProfit = 0.0
        
        for stock in stocks:
            # Function with fallback method
            #current_price = get_current_stock_price_with_cache(stock.stock_name.upper())

            ticker = yf.Ticker(stock.stock_name)
            info = ticker.info

            current_price = info.get('currentPrice', 'N/A')
            
            if current_price is None:
                return jsonify({"Error": f"Symbol '{stock.stock_name}' not found in Yahoo Finance or couldnt server get data"}), 400

            quantity = float(stock.quantity)

            if stock.is_sold == False:
                purchase_price = float(stock.purchase_price)
                invested_amount = purchase_price * quantity
                current_value = current_price * quantity
                profit = current_value - invested_amount
                totalValue += current_value
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
        
        return jsonify({
            "stocks": stock_list,
            "portfolioValue": round(totalValue, 2),
            "totalProfit": round(totalProfit, 2),
            "last_updated": datetime.now().isoformat()
        }), 200
        
    except Exception as ex:
        print(f"Error fetching stocks: {ex}")
        return jsonify({"Error": "Internal error"}), 500

def get_cached_price(stock_name, max_age_minutes=1):
    if stock_name not in price_cache:
        return None
        
    cached_data = price_cache[stock_name]
    cache_time = datetime.fromisoformat(cached_data['timestamp'])
    age_minutes = (datetime.now() - cache_time).total_seconds() / 60

    print(age_minutes, max_age_minutes)
    
    if age_minutes < max_age_minutes:
        print(f"Cache HIT for {stock_name}: ${cached_data['price']} (age: {age_minutes:.1f}min)")
        return cached_data['price']
    else:
        print(f"Cache EXPIRED for {stock_name} (age: {age_minutes:.1f}min)")
        return None

def cache_price(stock_name, price):
    price_cache[stock_name] = {
        'price': price,
        'timestamp': datetime.now().isoformat(),
    }
    print(f"Cached price for {stock_name}: ${price}")

def get_current_stock_price_with_cache(stock_name):
    # Checking cache
    cached_price = get_cached_price(stock_name, max_age_minutes=2)
    if cached_price:
        print("AAAAAAAAAAAAAAAAAAAAAAAA", cached_price)
        return cached_price
    
    fresh_price = get_current_stock_price(stock_name)
    print("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", fresh_price)
    
    if fresh_price:
        cache_price(stock_name, fresh_price)
    
    return fresh_price

def get_current_stock_price(stock_name):
    try:
        ticker = yf.Ticker(stock_name)
        info = ticker.info

        current_price = info.get('currentPrice', 'N/A')
        
        if not info.get('longName') and not info.get('shortName'):
            return None
        
        if info.get('quoteType') not in ['EQUITY', 'ETF', 'MUTUALFUND', 'INDEX', 'CRYPTOCURRENCY']:
            return None
        
        return round(float(current_price), 2)      
    except Exception as e:
        print(f"Method 2 failed for {stock_name}: {e}")
    return None

#--------GET STOCKS DATA FOR CHART--------
@app.route("/stocks/history/<stock_name>/<period>", methods=["GET"])
def get_stocks_data(stock_name, period):
    try:
        ticker = yf.Ticker(stock_name.upper())

        history = ticker.history(period=period, interval='1d')

        if history.empty:
            return jsonify({"Error", "Couldnt get history data for that stock name"}), 404
        
        prices = []
        for date, row in history.iterrows():
            prices.append({
                'date': date.strftime('%Y-%m-%d'),
                'price': round(float(row['Close']), 2),
                'open': round(float(row['Open']), 2),
                'high': round(float(row['High']),2 ),
                'low': round(float(row['Low']),2 ),
                'volume': int(row['Volume'])
            })
        
        prices.sort(key=lambda x: x['date'])

        return jsonify({
            'symbol': stock_name,
            'period': period,
            'prices': prices
        }), 200
    except Exception as ex:
        print(f"Error fetching stock history: {ex}")
        return jsonify({"Error", "Internal error"}), 500

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

    # Broadcast the new stock addition
    try:
        response_data = get_stocks_data_internal(user_id)
        if response_data:
            broadcast_stock_update(user_id, 'stock_added', {
                'message': 'New transaction added',
                'portfolio_data': response_data
            })
    except Exception as e:
        print(f"Error broadcasting stock addition: {e}")

    return jsonify({"Message": "Successfully added stock transaction"}), 200

#--------DELETE STOCKS--------
@app.route("/deleteStocks/<int:id>", methods=["DELETE"])
def delete_stocks(id):
    stock = Stock.query.filter_by(id = id).first()

    if stock is None:
        return jsonify({"Error": "Stock with that id didnt found"}), 401
    
    user_id = stock.user_id
    
    db.session.delete(stock)
    db.session.commit()

    # Broadcast the stock deletion
    try:
        response_data = get_stocks_data_internal(user_id)
        broadcast_stock_update(user_id, 'stock_deleted', {
            'message': 'Transaction deleted',
            'deleted_stock_id': id,
            'portfolio_data': response_data
        })
    except Exception as e:
        print(f"Error broadcasting stock deletion: {e}")

    return jsonify({"Message": "Successfully deleted stock transaction"}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port, debug=True)