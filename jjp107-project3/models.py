from datetime import datetime, date
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
# db.metadata.clear()


class Users(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(50), nullable=False)
    post = db.relationship('Messages', backref='post', lazy='dynamic')
    create = db.relationship('Chatroom', backref='room', lazy='dynamic')


class Messages(db.Model):
    message_id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(150), unique=False, nullable=False)
    post_date = db.Column(db.DateTime(), unique=False, nullable=False)
    send_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    room_id = db.Column(db.Integer, db.ForeignKey('chatroom.chat_id'))
    post_msg = db.Column(db.String(50), unique=False, nullable=False)


class Chatroom(db.Model):
    chat_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    create_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    post_msg = db.relationship('Messages', backref='chatter', lazy='dynamic')
