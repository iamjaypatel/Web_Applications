# Name: Jay Patel (jjp107)
# CS 1520 (Monday 5:30PM): Project 2
import os
from flask import Flask, render_template, redirect, url_for, request, flash, session
from models import Customer, db, Event, Owner, Staff
from datetime import date

# Creating Application
app = Flask(__name__)

# Load default config and override config from an environment variable
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='development key',
    USERNAME='admin',
    PASSWORD='default',

    SQLALCHEMY_DATABASE_URI='sqlite:///' +
    os.path.join(app.root_path, 'catering.db')
))
app.config.from_envvar('CATERING_SETTINGS', silent=True)

db.init_app(app)


@app.cli.command('initdb')
def initdb_command():
    """Creates the database tables."""
    db.drop_all()
    db.create_all()
    own = Owner(username="owner", password="pass")
    db.session.add(own)
    db.session.commit()
    print('Initialized the database.')


@app.route('/')
def starting_page():
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if Owner.query.filter_by(username=request.form['username'], password=request.form['password']).first() != None:
            session['logged_in'] = True
            return redirect(url_for("owner"))
        elif Staff.query.filter_by(username=request.form['username'], password=request.form['password']).first() != None:
            session['logged_in'] = True
            return redirect(url_for("staff", username=request.form['username']))
        elif Customer.query.filter_by(username=request.form['username'], password=request.form['password']).first() != None:
            session['logged_in'] = True
            return redirect(url_for("customer", username=request.form['username']))
        else:
            error = 'Invalid Username or Password, Please Create a new account if forgotten!'
    return render_template('login.html', error=error)


@app.route('/newcustomer', methods=['GET', 'POST'])
def newcustomer():
    if request.method == 'POST':
        new_customer = Customer(
            username=request.form['username'], password=request.form['password'])
        db.session.add(new_customer)
        db.session.commit()
        flash('New account created successfully')
        return redirect(url_for('login'))
    return render_template("create_new_account.html")


@app.route('/customer/<username>', methods=['GET', 'POST'])
@app.route('/customer/', methods=['GET', 'POST'])
def customer(username=None):
    customer_username = username
    c = Customer.query.filter_by(username=customer_username).first()
    events = Event.query.filter_by(customer_id=c.id).all()
    if request.method == 'POST':
        customer_username = username
        get_date = request.form['get_event_date']
        year, month, day = get_date.split('-')
        event_day = date(int(year), int(month), int(day))
        if Event.query.filter_by(date=event_day).first() == None:
            add_event = Event(
                name=request.form['get_event_name'], date=event_day, customers=c)
            db.session.add(add_event)
            db.session.commit()
            flash('Event has been created successfully!')
        else:
            flash('We are already booked for that day. Sorry!')
    session['logged_in'] = True
    return render_template('customer.html', username=customer_username, events=events)


@app.route('/newstaff', methods=['GET', 'POST'])
def newstaff():
    if request.method == 'POST':
        new_staff = Staff(
            username=request.form['username'], password=request.form['password'])
        db.session.add(new_staff)
        db.session.commit()
        flash('New staff account created successfully!')
        return redirect(url_for('owner'))
    session['logged_in'] = True
    return render_template('create_new_account.html')


@app.route('/staff/<username>', methods=['GET', 'POST'])
def staff(username=None):
    staff = Staff.query.filter_by(username=username).first()
    events = Event.query.all()
    avail_event = []
    sign_up = []
    for event in events:
        if event in staff.events:
            sign_up.append(event)
        else:
            avail_event.append(event)
    if request.method == 'POST':
        sign_up_event = request.form['event']
        event = Event.query.filter_by(name=sign_up_event).first()
        event.event_staff.append(staff)
        db.session.commit()
        flash('Refresh page to see events you signed up for!')
    return render_template('staff.html', staff=staff, sign_up=sign_up, avail_event=avail_event)


@app.route('/owner', methods=['GET', 'POST'])
def owner():
    get_all_events = Event.query.all()
    return render_template('owner.html', events=get_all_events)


@app.route('/cancelevent/<string:d>')
def cancelevent(d):
    return_url = request.referrer
    event_date = d
    year, month, day = event_date.split('-')
    event_date = date(int(year), int(month), int(day))
    del_event = Event.query.filter_by(date=event_date).first()
    db.session.delete(del_event)
    db.session.commit()
    flash('Event had been cancelled. Thank you!')
    session['logged_in'] = True
    return redirect(return_url)


@app.route('/logout/')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('login'))


if __name__ == "__main__":
    app.run()
