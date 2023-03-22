import RPi.GPIO as GPIO
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

GPIO.setwarnings(False)

# define actuators GPIOs
Relay = 40
GPIO.setmode(GPIO.BOARD)
GPIO.setup(Relay, GPIO.OUT)
GPIO.output(Relay, GPIO.LOW)

@app.route("/")
def index():
    RelaySts = GPIO.input(Relay)
    templateData = {
        'Relay': RelaySts,
    }
    return render_template('index.html', **templateData)

@socketio.on('relay_update')
def handle_relay_update(data):
    action = data['action']
    if action == 'on':
        GPIO.output(Relay, GPIO.HIGH)
    elif action == 'off':
        GPIO.output(Relay, GPIO.LOW)

    RelaySts = GPIO.input(Relay)
    emit('relay_status', {'Relay': RelaySts}, broadcast=True)

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=80, debug=True, allow_unsafe_werkzeug=True)