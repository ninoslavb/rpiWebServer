import RPi.GPIO as GPIO
from flask import Flask, render_template, make_response, request, jsonify
from flask_socketio import SocketIO, emit
from database_handler import load_devices, save_devices, get_device_status, update_device_status, get_device_name, update_device_name, get_device_gpio_id, get_device_box_id, get_device_type, add_device, get_device_gpio_pin
from rule_handler import add_rule, load_rules, delete_rule
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
add_device('motion', 'Sensor5', 0, 'DI5', 6, 'input', 16)


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

def init_rules():
    rule_data = {}
    rules = load_rules()
    for rule_key, rule in rules.items():
        rule_data[rule_key] = {
            'input_device_key': rule['input_device_key'],
            'output_device_key': rule['output_device_key'],
            'input_device_option': rule['input_device_option'],
            'output_device_action': rule['output_device_action'],
        }
    return rule_data

if __name__ == '__main__':
  
    device_data = init_device_data()
    rule_data = init_rules()

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
    return render_template('index.html', device_data=device_data, rule_data=rule_data)


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

    # Emit current rules
    emit('rules_updated', rule_data, broadcast=True)  # Send the entire rule_data object



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
    socketio.emit('sensorStatus', {'device_key': device_key, 'status': device_data[device_key]['status']})
    print(f"Sensor callback triggered for {device_key}, status: {device_data[device_key]['status']}")  # Add this print statement

    # Iterate over rule_data and check for matching rules
    for rule_key, rule in rule_data.items():
        if rule['input_device_key'] == device_key:
            if str(device_data[device_key]['status']) == rule['input_device_option']: #if device_status equals input_device_option from the rules
                output_device_key = rule['output_device_key']
                output_device_action = int(rule['output_device_action'])
                if output_device_action == 0:
                    GPIO.output(device_data[output_device_key]['gpio_pin'], GPIO.LOW)
                elif output_device_action == 1:
                    GPIO.output(device_data[output_device_key]['gpio_pin'], GPIO.HIGH)
            else: #if device_status is different then inpute_device_option from the rules, perform oposite actin
                output_device_key = rule['output_device_key']
                output_device_action = not int(rule['output_device_action'])    # here we add oposite action that should be performer
                if output_device_action == 0:
                    GPIO.output(device_data[output_device_key]['gpio_pin'], GPIO.LOW)
                elif output_device_action == 1:
                    GPIO.output(device_data[output_device_key]['gpio_pin'], GPIO.HIGH)

                # Update the device status and emit the updated status to clients
            device_data[output_device_key]['status'] = GPIO.input(device_data[output_device_key]['gpio_pin'])
            update_device_status(output_device_key, device_data[output_device_key]['status'])
            socketio.emit('device_status', {'device_key': output_device_key, 'status': device_data[output_device_key]['status']}, namespace='/')
    


#add_rule_handler
@socketio.on('add_rule')
def update_rule_handler(data):
    rule_key = f"{data['input_key']}-{data['output_key']}"
    input_device_key     = data['input_key']
    output_device_key    = data['output_key']
    input_device_option  = data['input_option']
    output_device_action = data['output_action']
    if rule_key not in rule_data:
        if input_device_key and output_device_key:
            add_rule(rule_key, input_device_key, output_device_key, input_device_option, output_device_action)
            rule_data[rule_key] = { #update rules dictionary
                'input_device_key': input_device_key,
                'output_device_key': output_device_key,
                'input_device_option': input_device_option,
                'output_device_action': output_device_action
            }
            emit('rules_updated', rule_data, broadcast=True)  # Send the entire rule_data object
            return 'success'
    return 'error'

#delete_rule_handler
@socketio.on('delete_rule')
def delete_rule_handler(data):
    rule_key = data['rule_key']
    if rule_key in rule_data:
        delete_rule(rule_key)
        del rule_data[rule_key]
        emit('rules_updated', rule_data, broadcast=True)


#@app.route('/static/<path:path>')
#def send_static(path):
#    return send_from_directory('static', path)

if __name__ == "__main__":
    app.env="development"
    socketio.run(app, host='0.0.0.0', port=80, debug=True, allow_unsafe_werkzeug=True)
   