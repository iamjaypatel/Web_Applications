# Name: Jay Patel (jjp107)
# CS 1520 (Monday 5:30PM): Project 3
import os
from flask import Flask, render_template, redirect, url_for, request, flash, session
from json import dumps
from datetime import datetime, timedelta
from models import Users, Messages, Chatroom, db

# Creating Application
app = Flask(__name__)

# Load default config and override config from an environment variable
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='development key',
    USERNAME='admin',
    PASSWORD='default',

    SQLALCHEMY_DATABASE_URI='sqlite:///' +
    os.path.join(app.root_path, 'chat.db')
))
app.config.from_envvar('CHAT_SETTINGS', silent=True)
# here to silence deprecation warning
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)


@app.cli.command('initdb')
def initdb_command():
    """Creates the database tables."""
    db.drop_all()
    db.create_all()
    print('Initialized the database.')


@app.route('/')
def starting_page():
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    err = None
    if session.get('user_id'):
        return redirect(url_for('chat_lobby'))
    else:
        if request.method == 'POST':
            username = request.form['username']
            password = request.form['password']
            curr_user = Users.query.filter_by(username=username).first()
            if curr_user is None:
                err = 'Invalid Username or Password'
            elif not curr_user.password == password:
                err = 'Invalid Username or Password'
            else:
                flash('{} was logged in'.format(username))
                session['user_id'] = curr_user.user_id
                session.pop('room_id', None)
                return redirect(url_for('chat_lobby'))
    return render_template('login.html', error=err)


@app.route('/newuser', methods=['GET', 'POST'])
def new_user():
    err = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        check_username = Users.query.filter_by(username=username).first()
        if check_username is not None:
            err = 'Please enter another username.'
        else:
            user = Users(username=username, password=password)
            db.session.add(user)
            db.session.commit()
            flash('New User had been created')
            return redirect(url_for('login'))
    return render_template('newUser.html', error=err)


@app.route('/createChatroom', methods=['GET', 'POST'])
def create_chatroom():
    err = None
    if request.method == 'POST':
        chat_name = request.form['username']
        user = Users.query.filter_by(user_id=session['user_id']).first()
        check_roomid = Chatroom.query.filter_by(name=chat_name).first()
        if check_roomid is not None:
            flash('Chatroom is already present')
        else:
            room = Chatroom(name=chat_name, create_id=user.user_id)
            db.session.add(room)
            db.session.commit()
            flash('New chatroom {} has been created'.format(chat_name))
            return redirect(url_for('chat_lobby'))
    return render_template('create_chatroom.html', error=err)


@app.route('/chatLobby', methods=['GET', 'POST'])
def chat_lobby():
    err = None
    if request.method == 'POST':
        delete_room = request.form['delete']
        if delete_room:
            chatroom = Chatroom.query.filter_by(
                chat_id=delete_room).first()
            if chatroom.create_id == session['user_id']:
                flash('Chatroom {} was deleted'.format(chatroom.name))
                db.session.delete(chatroom)
                db.session.commit()
            else:
                err = 'No such chatroom with that name!'
        else:
            err = 'No such chatroom with that name!'
    chatrooms = Chatroom.query.all()
    return render_template('chat_lobby.html', chatrooms=chatrooms, error=err)


@app.route('/leave_chatroom', methods=['GET', 'POST'])
def leave_chatroom():
    current_chatroom = Chatroom.query.filter_by(
        chat_id=session['room_id']).first()
    flash('Successfully left chatroom: {}'.format(current_chatroom.name))
    session.pop('room_id', None)
    return redirect(url_for('chat_lobby'))


@app.route('/chatroom/<name>', methods=['GET', 'POST'])
def chatroom(name):
    room = Chatroom.query.filter_by(name=name).first()
    if session.get('room_id'):
        if session['room_id'] is None or session['room_id'] == room.chat_id:
            session['room_id'] = room.chat_id
            message = Messages.query.filter(
                Messages.room_id == session['room_id']).all()
            return render_template('chatroom.html', chatroomName=name, post=message)
        else:
            old_room = Chatroom.query.filter_by(
                chat_id=session['room_id']).first()
            flash('You can only access one chatroom at a time')
            return redirect(url_for('chatroom', name=old_room.name))
    else:
        session['room_id'] = room.chat_id
        message = Messages.query.filter(
            Messages.room_id == session['room_id']).all()
        return render_template('chatroom.html', chatroomName=name, post=message)


@app.route('/postMessage', methods=['POST'])
def post_message():
    text = request.json
    curr_user = Users.query.filter_by(user_id=session['user_id']).first()
    message = Messages(message=text['msg'], post_date=datetime.now(
    ), send_id=session['user_id'], room_id=session['room_id'], post_msg=curr_user.username)
    db.session.add(message)
    db.session.commit()
    return render_template('chatroom.html')


@app.route('/getMessage', methods=['GET'])
def get_message():
    current = Chatroom.query.filter_by(chat_id=session['room_id']).first()
    if current:
        message = Messages.query.with_entities(Messages.message, Messages.post_msg).filter((Messages.room_id == session['room_id']) & (
            Messages.post_date.between((datetime.now()-timedelta(seconds=1)), datetime.now()))).all()
        return dumps(message)
    else:
        flash('Chatroom was deleted or not present')
        session.pop('room_id', None)
        return 'check lobby'


@app.route('/logout')
def logout():
    flash('Logout Successful')
    session.pop('user_id', None)
    session.pop('room_id', None)
    return redirect(url_for('login'))


if __name__ == "__main__":
    app.run(debug=True)
