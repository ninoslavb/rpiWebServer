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

# Define devices
add_device('relay1',  'Relay1', 0,  'DO1', 0, 'output',40)
add_device('relay2',  'Relay2', 0,  'DO2', 1, 'output',12)
add_device('sensor1', 'Sensor1', 0, 'DI1', 2, 'input', 35)
add_device('sensor2', 'Sensor2', 0, 'DI2', 3, 'input', 22)
add_device('sensor3', 'Sensor3', 0, 'DI3', 4, 'input', 33)
add_device('sensor4', 'Sensor4', 0, 'DI4', 5, 'input', 37)
add_device('motion', 'Sensor5', '0', 'DI5', 6, 'input', 16)


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

# set GPIOs according to its type
GPIO.setmode(GPIO.BOARD)

for device_key, device in device_data.items():
    if device['type'] == 'output':
        GPIO.setup(device['gpio_pin'], GPIO.OUT)
    elif device['type'] == 'input':
        GPIO.setup(device['gpio_pin'], GPIO.IN)

# set relay initial states
for device_key, device in device_data.items():
    if device['type'] == 'output':
        GPIO.output(device['gpio_pin'], GPIO.HIGH if device['status'] else GPIO.LOW)        


#render device_data in index.html
@app.route("/")
def index():
    return render_template('index.html', device_data=device_data)


#When the socket connection is established, send all relay and sensor statuses and device names
@socketio.on('connect')
def handle_connect():
    # Emit device state for each device
    for device_key, device in device_data.items():
        device['status'] = GPIO.input(device['gpio_pin'])
        emit('device_status', {'device_key': device_key, 'status': device['status']}, broadcast=True)


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



# Add event detect for all digital inputs
for device_key, device in device_data.items():
    if device['type'] == 'input':
        GPIO.add_event_detect(device['gpio_pin'], GPIO.BOTH, callback=lambda channel, dk=device_key: sensor_callback(channel, dk), bouncetime=50)

def sensor_callback(channel, device_key):
    device_data[device_key]['status'] = GPIO.input(device_data[device_key]['gpio_pin'])
    update_device_status(device_key, device_data[device_key]['status'])
    socketio.emit('sensorStatus', {'device_key': device_key, 'status': device_data[device_key]['status']}, namespace='/')




#@app.route('/static/<path:path>')
#def send_static(path):
#    return send_from_directory('static', path)

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=80, debug=True, allow_unsafe_werkzeug=True)