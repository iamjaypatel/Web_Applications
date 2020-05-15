from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()
# db.metadata.clear()

e_s = db.Table('event_staff',
               db.Column('event_id', db.Integer, db.ForeignKey('event.id')),
               db.Column('staff_id', db.Integer, db.ForeignKey('staff.id')))


class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(80), unique=True)
    events = db.relationship(
        'Event', backref='customers', lazy='dynamic')

    def __repr__(self):
        return '<Customer {}>'.format(self.username)


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    date = db.Column(db.Date())
    customer_id = db.Column(
        db.Integer, db.ForeignKey('customer.id'))
    events = db.relationship(
        'Staff', secondary=e_s, backref=db.backref('events', lazy='dynamic'))

    def __repr__(self):
        return '<Event {}>'.format(self.name)


class Owner(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(80), unique=True)

    def __init__(self, username, password):
        self.username = username
        self.password = password

    def __repr__(self):
        return '<Owner {}>'.format(self.username)


class Staff(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(80), unique=True)
    eventstaff = db.relationship('Event', secondary=e_s, backref=db.backref(
        'event_staff', lazy='dynamic'))

    def __repr__(self):
        return '<Staff {}>'.format(self.username)
