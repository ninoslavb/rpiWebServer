import RPi.GPIO as GPIO
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from database_handler import get_device_status, update_device_status, get_device_name, update_device_name, get_database_connection, create_table

app = Flask(__name__)
socketio = SocketIO(app)

GPIO.setwarnings(False)

# Define actuators GPIOs
Relay = 40
Sensor1 = 35
GPIO.setmode(GPIO.BOARD)
GPIO.setup(Relay, GPIO.OUT)
#GPIO.output(Relay, GPIO.LOW)
GPIO.setup(Sensor1, GPIO.IN)

def init_device_data():
    device_names = {
        'relay': get_device_name('relay'),
        'sensor1': get_device_name('sensor1'),
    }
    device_status = {
        'relay': get_device_status('relay'),
        'sensor1': get_device_status('sensor1'),
    }
    return device_names, device_status

if __name__ == '__main__':
    create_table()
    device_names, device_status = init_device_data()

GPIO.output(Relay, GPIO.HIGH if device_status['relay'] else GPIO.LOW)


@app.route("/")
def index():
    return render_template('index.html', device_names=device_names, device_status=device_status)

@socketio.on('update_device_name')
def update_device_name_socketio(data):
    device_key = data['device_key']
    device_name = data['device_name']
    device_names[device_key] = device_name
    emit('device_name_updated', {'device_key': device_key, 'device_name': device_name}, broadcast=True)
    update_device_name(device_key, device_name)


@socketio.on('connect')
def handle_connect():
    RelaySts = GPIO.input(Relay)
    Sensor1Sts = GPIO.input(Sensor1)
    emit('relay_status', {'Relay': RelaySts})
    emit('sensor1_status', {'Sensor1': Sensor1Sts})

    # Emit device names
    for device_key, device_name in device_names.items():
        emit('device_name_updated', {'device_key': device_key, 'device_name': device_name})    

@socketio.on('relay_update')
def handle_relay_update(data):
    action = data['action']
    if action == 'on':
        GPIO.output(Relay, GPIO.HIGH)
    elif action == 'off':
        GPIO.output(Relay, GPIO.LOW)

    RelaySts = GPIO.input(Relay)
    update_device_status('relay', RelaySts)
    emit('relay_status', {'Relay': RelaySts}, broadcast=True)

def sensor1_callback(channel):
    Sensor1Sts = GPIO.input(channel)
    print("Sensor1Sts:", Sensor1Sts)
    update_device_status('sensor1', Sensor1Sts)
    socketio.emit('sensor1_status', {'Sensor1': Sensor1Sts}, namespace='/')


GPIO.add_event_detect(Sensor1, GPIO.BOTH, callback=sensor1_callback, bouncetime=50)

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=80, debug=True, allow_unsafe_werkzeug=True)
