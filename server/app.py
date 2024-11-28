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

def get_uuid():
    return uuid4().hex

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
app.url_map.strict_slashes = False
db.init_app(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
init_db(app)

cors = CORS(app, supports_credentials=True)

with app.app_context():
    db.create_all()

def login_user(email, password):
    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"Error": "Unauthorized"}), 401

    try:
        #if not bcrypt.check_password_hash(user.password, password):
        if password != user.password:
            return jsonify({"Error": "Invalid email or password"}), 401
    except Exception as ex:
        print(f"Error: {ex}")
        return jsonify({"Error": "Server error"}), 500
    
    access_token = create_access_token(identity = user.id)
    return jsonify(access_token = access_token, user = {"id": user.id, "email": user.email, "first_name": user.first_name, "last_name": user.last_name})

@app.route("/login", methods=["POST"])
def login_route():
    email = request.json["email"]
    password = request.json["password"]

    return login_user(email, password)

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

if __name__ == "__main__":
    app.run(debug = True)