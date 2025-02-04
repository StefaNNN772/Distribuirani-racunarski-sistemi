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

# Provjera rada nad bazom
# @app.route("/print-users", methods=["GET"])
# def print_users():
#     try:
#         # Fetch all users
#         users = User.query.all()
        
#         # Serialize user data
#         user_list = [{"id": user.id, "email": user.email, "password": user.password} for user in users]
        
#         # Print to terminal for debugging
#         for user in users:
#             print(f"User ID: {user.id}, Email: {user.email}")
        
#         return jsonify(user_list), 200
#     except Exception as ex:
#         print(f"Error retrieving users: {ex}")
#         return jsonify({"Error": "Unable to fetch users"}), 500

@app.route('/add-stock', methods=['POST'])
def add_stock():
    try:
        print(f"Received data: {request.json}")  # Log za podatke

        # Extract data from the incoming JSON request using request.json["key"]
        user_id = request.json["user_id"]
        stock_name = request.json["stockName"]
        transaction_type = request.json["transactionType"]
        transaction_date = request.json["transactionDate"]
        quantity = request.json["transactionQuantity"]
        purchase_price = request.json["transactionValue"]


        # Create a new Stock entry
        new_stock = Stock(
            user_id=user_id,
            stock_name=stock_name,
            quantity=quantity,
            purchase_price=purchase_price,
            transaction_date=datetime.datetime.strptime(transaction_date, '%Y-%m-%dT%H:%M') if transaction_date else None,
            is_sold = False
        )

        # Add the new stock to the database
        db.session.add(new_stock)
        db.session.commit()

        return jsonify({"message": "Stock added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/get-stock', methods=['GET'])
def get_stock():
    print("GET /get-stock endpoint hit")  # Log za praćenje
    try:
        stocks = Stock.query.all()
        stock_list = [
            {
                "id": stock.id,
                "user_id": stock.user_id,
                "stock_name": stock.stock_name,
                "quantity": stock.quantity,
                "purchase_price": stock.purchase_price,
                "transaction_date": stock.transaction_date.strftime('%Y-%m-%dT%H:%M') if stock.transaction_date else None,
                "is_sold": stock.is_sold,
            }
            for stock in stocks
        ]
        return jsonify(stock_list), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    


if __name__ == "__main__":
    app.run(debug = True)