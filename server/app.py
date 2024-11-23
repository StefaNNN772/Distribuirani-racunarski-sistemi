from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from database import init_db, User, Stock, db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@db:5432/portfolio'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
init_db(app)

cors = CORS(app, origins = '*')

@app.route("/api/users", methods=['GET'])
def users():
    users = User.query.all()
    user_names = [user.first_name for user in users]
    return jsonify({
        "users": user_names
    })
if __name__ == "__main__":
    app.run(debug = True, port = 8080)