import RPi.GPIO as GPIO
from flask import Flask, render_template, make_response
from flask_socketio import SocketIO, emit
from database_handler import load_devices, save_devices, get_device_status, update_device_status, get_device_name, update_device_name, get_device_gpio_id, get_device_box_id, get_device_type, add_device, get_device_gpio_pin
import json
import os

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/gateway1.mbednino.online')
def my_route():
    response = make_response('Disable cache for /gateway.mbednino.online')
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

GPIO.setwarnings(False)

# Define actuators GPIOs
Relay1 = 40
Relay2 = 12
Sensor1 = 35
Sensor2 = 22
Sensor3 = 33
Sensor4 = 37

GPIO.setmode(GPIO.BOARD)
GPIO.setup(Relay1, GPIO.OUT)
GPIO.setup(Relay2, GPIO.OUT)
#GPIO.output(Relay1, GPIO.LOW)
GPIO.setup(Sensor1, GPIO.IN)
GPIO.setup(Sensor2, GPIO.IN)
GPIO.setup(Sensor3, GPIO.IN)
GPIO.setup(Sensor4, GPIO.IN)



add_device('relay1',  'Relay1', 0,  'DO1', 0, 'output',40)
add_device('relay2',  'Relay2', 0,  'DO2', 1, 'output',12)
add_device('sensor1', 'Sensor1', 0, 'DI1', 2, 'input', 35)
add_device('sensor2', 'Sensor2', 0, 'DI2', 3, 'input', 22)
add_device('sensor3', 'Sensor3', 0, 'DI3', 4, 'input', 33)
add_device('sensor4', 'Sensor4', 0, 'DI4', 5, 'input', 37)


def init_device_data():
    device_data = {}
    devices = load_devices()
    for device_key, device in devices.items():
        device_data[device_key] = {
            'name': device['device_name'],
            'status': device['device_status'],
            'gpio_id': device['device_gpio_id'],
            'box_id': device['device_box_id'],
            'type': device['device_type'],
            'gpio_pin': device['device_gpio_pin'],
        }
    return device_data

if __name__ == '__main__':
  
    device_data = init_device_data()

GPIO.output(Relay1, GPIO.HIGH if device_data['relay1']['status'] else GPIO.LOW)
GPIO.output(Relay2, GPIO.HIGH if device_data['relay2']['status'] else GPIO.LOW)


@app.route("/")
def index():
    return render_template('index.html', device_data=device_data)


#When the socket connection is established, send all relay and sensor statuses and device names
@socketio.on('connect')
def handle_connect():
    Relay1Sts = GPIO.input(Relay1)
    Relay2Sts = GPIO.input(Relay2)
    Sensor1Sts = GPIO.input(Sensor1)
    Sensor2Sts = GPIO.input(Sensor2)
    Sensor3Sts = GPIO.input(Sensor3)
    Sensor4Sts = GPIO.input(Sensor4)
    emit('relay1_status', {'Relay1': Relay1Sts})
    emit('relay2_status', {'Relay2': Relay2Sts})
    emit('sensor1_status', {'Sensor1': Sensor1Sts})
    emit('sensor2_status', {'Sensor2': Sensor2Sts})
    emit('sensor3_status', {'Sensor3': Sensor3Sts})
    emit('sensor4_status', {'Sensor4': Sensor4Sts})

    # Emit device names
    for device_key, device in device_data.items():
        emit('device_name_updated', {'device_key': device_key, 'device_name': device['name']})   


#When the name of device is changed, update the name and send feedback to the client
@socketio.on('update_device_name')
def update_device_name_socketio(data):
    device_key = data['device_key']
    device_name = data['device_name']
    device_data[device_key]['name'] = device_name 
    emit('device_name_updated', {'device_key': device_key, 'device_name': device_name}, broadcast=True)
    update_device_name(device_key, device_name) #update database with the new name

#When the button for change the relay state is pressed, execute the action, check the state of the relay and send update to the client
@socketio.on('device_update')
def relay_update(data):
    device_key = data['device_key']
    action = data['action']
    print(f"Received device_update: device_key = {device_key}, action = {action}")  # Add this print statement

    if device_key in device_data:
        if action == 'on':
            GPIO.output(device_data[device_key]['gpio_pin'], GPIO.HIGH)
        elif action == 'off':
            GPIO.output(device_data[device_key]['gpio_pin'], GPIO.LOW)
            
        device_data[device_key]['status'] = GPIO.input(device_data[device_key]['gpio_pin'])
        update_device_status(device_key, device_data[device_key]['status'])
        emit('device_status', {'device_key': device_key, 'status': device_data[device_key]['status']}, broadcast=True)


def sensor1_callback(channel):
    Sensor1Sts = GPIO.input(channel)
    print("Sensor1Sts:", Sensor1Sts)
    
    update_device_status('sensor1', Sensor1Sts)
    socketio.emit('sensor1_status', {'Sensor1': Sensor1Sts}, namespace='/')


GPIO.add_event_detect(Sensor1, GPIO.BOTH, callback=sensor1_callback, bouncetime=50)

def sensor2_callback(channel):
    Sensor2Sts = GPIO.input(channel)
    print("Sensor2Sts:", Sensor2Sts)
    update_device_status('sensor2', Sensor2Sts)
    socketio.emit('sensor2_status', {'Sensor2': Sensor2Sts}, namespace='/')


GPIO.add_event_detect(Sensor2, GPIO.BOTH, callback=sensor2_callback, bouncetime=50)

def sensor3_callback(channel):
    Sensor3Sts = GPIO.input(channel)
    print("Sensor3Sts:", Sensor3Sts)
    update_device_status('sensor3', Sensor3Sts)
    socketio.emit('sensor3_status', {'Sensor3': Sensor3Sts}, namespace='/')


GPIO.add_event_detect(Sensor3, GPIO.BOTH, callback=sensor3_callback, bouncetime=50)

def sensor4_callback(channel):
    Sensor4Sts = GPIO.input(channel)
    print("Sensor4Sts:", Sensor4Sts)
    update_device_status('sensor4', Sensor4Sts)
    socketio.emit('sensor4_status', {'Sensor4': Sensor4Sts}, namespace='/')


GPIO.add_event_detect(Sensor4, GPIO.BOTH, callback=sensor4_callback, bouncetime=50)

#@app.route('/static/<path:path>')
#def send_static(path):
#    return send_from_directory('static', path)

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=80, debug=True, allow_unsafe_werkzeug=True)