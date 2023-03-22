import RPi.GPIO as GPIO
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

GPIO.setwarnings(False)

# define actuators GPIOs
Relay = 40
Sensor1 = 35
GPIO.setmode(GPIO.BOARD)
GPIO.setup(Relay, GPIO.OUT)
GPIO.output(Relay, GPIO.LOW)
#GPIO.setup(Sensor1, GPIO.IN, pull_up_down=GPIO.PUD_UP)
#GPIO.setup(Sensor1, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(Sensor1, GPIO.IN)

@app.route("/")
def index():
    RelaySts = GPIO.input(Relay)
    Sensor1Sts = GPIO.input(Sensor1)
    templateData = {
        'Relay': RelaySts,
        'Sensor1' : Sensor1Sts,
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

def sensor1_callback(channel):
    Sensor1Sts = GPIO.input(channel)
    print("Sensor1Sts:", Sensor1Sts)  # Add this print statement
    socketio.emit('sensor1_status', {'Sensor1': Sensor1Sts}, namespace='/')

GPIO.add_event_detect(Sensor1, GPIO.BOTH, callback=sensor1_callback, bouncetime=50)

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=80, debug=True)
