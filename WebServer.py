import RPi.GPIO as GPIO
from flask import Flask, render_template, make_response, request, jsonify
from flask_socketio import SocketIO, emit
from database_handler import load_devices, save_devices, get_device_status, update_device_gpio_status, get_device_name, update_device_name, get_device_gpio_id, get_device_type, add_device, get_device_gpio_pin, add_pairing_device, load_pairing_devices, delete_pairing_device
from rule_handler import add_rule, load_rules, delete_rule
from group_handler import add_group, load_groups, delete_group
import json
import os
import time
from cpu_temp import get_cpu_temperature
from zigbee import register_callback, control_actuator, start_mqtt_loop
import logging
import atexit

def flush_logs():
    for handler in logging.getLogger().handlers:
        handler.flush()

atexit.register(flush_logs)
logging.basicConfig(filename='log.txt', level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
devices = load_devices()
logging.debug(f'Initial devices: {devices}')


app = Flask(__name__)
#socketio = SocketIO(app)
socketio = SocketIO(app, logger=False, engineio_logger=False)


@app.route('/gateway1.mbednino.online')
def my_route():
    response = make_response('Disable cache for /gateway1.mbednino.online')
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response


GPIO.setwarnings(False)

# Define devices
if not devices:
    add_device('digout1', None, 'DO1', 0,  'DO1', 40, 'digital-output',  None,       None,  None, None, None, 'rpi')
    add_device('digout2', None, 'DO2', 0,  'DO2', 12, 'digital-output',  None,       None,  None, None, None, 'rpi')
    add_device('digin1',  None, 'DI1', 0,  'DI1', 35, 'digital-input' , 'contact',   None,  None, None, None, 'rpi')
    add_device('digin2',  None, 'DI2', 0,  'DI2', 22, 'digital-input' , 'contact',   None,  None, None, None, 'rpi')
    add_device('digin3',  None, 'DI3', 0,  'DI3', 33, 'digital-input' , 'contact',   None,  None, None, None, 'rpi')
    add_device('digin4',  None, 'DI4', 0,  'DI4', 37, 'digital-input' , 'contact',   None,  None, None, None, 'rpi')
    add_device('digin5',  None, 'DI5', 0,  'DI5', 16, 'digital-input' , 'motion',    None,  None, None, None, 'rpi')
    add_device('TCPU', None,'TEMP CPU', 0,'TCPU',0,'sensor','temp',None,None,None,None,'cpu')

#################################################################################################################################################################
#######################################################---DICTIONARIES, INITIAL STATES AND RENDERING---##########################################################
#################################################################################################################################################################

def init_device_data():
    device_data = {}
    devices = load_devices()
    for device_key, device in devices.items():
        device_data[device_key] = {
            'device_id': device['device_id'],
            'name': device['device_name'],
            'gpio_status': device['device_gpio_status'],
            'gpio_id': device['device_gpio_id'],
            'gpio_pin': device['device_gpio_pin'],
            'type': device['device_type'],  
            'type1': device['device_type1'],
            'type2': device['device_type2'],
            'value1': device['device_value1'],
            'value2': device['device_value2'],
            'bat_stat': device['device_bat_stat'],
            'source': device['device_source'],
        }
    return device_data

def init_rules():
    rule_data = {}
    rules = load_rules()
    for rule_key, rule in rules.items():
        rule_data[rule_key] = {
            'rule_name': rule['rule_name'],
            'input_devices': rule['input_devices'],
            'logic_operator': rule['logic_operator'],
            'output_device_key': rule['output_device_key'],
            'output_device_action': rule['output_device_action'],
        }
    return rule_data

def init_groups():
    group_data = {}
    groups = load_groups()
    for group_key, group in groups.items():
        group_data[group_key] = {
            'group_name': group['group_name'],
            'group_devices': group['group_devices'],
        }
    return group_data


def init_pairing_device_data():
    pairing_device_data = {}
    pairing_devices = load_pairing_devices()
    for friendly_name, pairing_device in pairing_devices.items():
        pairing_device_data[friendly_name] = {
            'description':pairing_device['description'],
            'model': pairing_device['model'],
            'supported': pairing_device['supported'],
            'vendor': pairing_device['vendor'],
        }
    return pairing_device_data



if __name__ == '__main__':
    
  
    device_data = init_device_data()
    rule_data = init_rules()
    group_data = init_groups()
    pairing_device_data = init_pairing_device_data()

devices = load_devices()
logging.debug(f' devices after init: {devices}')

# set GPIOs according to its type
GPIO.setmode(GPIO.BOARD)

for device_key, device in device_data.items():
    if device['source'] == 'rpi':
        if device['type'] == 'digital-output':
            GPIO.setup(device['gpio_pin'], GPIO.OUT)
        elif device['type'] == 'digital-input':
            GPIO.setup(device['gpio_pin'], GPIO.IN)

# set digital outputs initial states
for device_key, device in device_data.items():
    if device['source'] == 'rpi':
        if device['type'] == 'digital-output':
            GPIO.output(device['gpio_pin'], GPIO.HIGH if device['gpio_status'] else GPIO.LOW)        


#render device_data, rule data and group data in index.html
@app.route("/")
def index():
    return render_template('index.html', device_data=device_data, rule_data=rule_data, group_data=group_data, pairing_device_data=pairing_device_data)

#################################################################################################################################################################
####################################################---SOCKET INITIAL CONNECTION---##############################################################################
#################################################################################################################################################################

#When the socket connection is established, send all digital input and output statuses, device name, rules, groups and pairing devices
@socketio.on('connect')
def handle_connect():
    # Emit device state for each device
    for device_key, device in device_data.items():
        if device['source'] == 'rpi':
            if (device['type'] == 'digital-output'):
                device['gpio_status'] = GPIO.input(device['gpio_pin'])
                emit('device_gpio_status', {'device_key': device_key, 'gpio_status': device_data[device_key]['gpio_status'],'device_type1':device_data[device_key]['type1'],'device_source': device_data[device_key]['source'],'device_bat_stat': device_data[device_key]['bat_stat']}, broadcast=True)
            if (device['type'] == 'digital-input'):
                device['gpio_status'] = GPIO.input(device['gpio_pin'])
                emit('device_input_status', {'device_key': device_key, 'gpio_status': device_data[device_key]['gpio_status'],'device_type1':device_data[device_key]['type1'],'device_source': device_data[device_key]['source'],'device_bat_stat': device_data[device_key]['bat_stat']}, broadcast=True)

        elif device['source']=='zbee':
                if(device['type']=='digital-input'):
                    emit('device_input_status', {'device_key': device_key, 'gpio_status': device_data[device_key]['gpio_status'],'device_type1':device_data[device_key]['type1'],'device_source': device_data[device_key]['source'],'device_bat_stat': device_data[device_key]['bat_stat']}, broadcast=True) # just send the state because it is stored in device_data
                if (device['type'] == 'digital-output'):
                    emit('device_gpio_status', {'device_key': device_key, 'gpio_status': device_data[device_key]['gpio_status'],'device_type1':device_data[device_key]['type1'],'device_source': device_data[device_key]['source'],'device_bat_stat': device_data[device_key]['bat_stat']}, broadcast=True)
                if (device['type']=='sensor'):
                    emit('device_sensor_status', {'device_key': device_key, 'device_type': device_data[device_key]['type'], 'device_type1': device_data[device_key]['type1'], 'device_type2': device_data[device_key]['type2'], 'device_value1': device_data[device_key]['value1'], 'device_value2': device_data[device_key]['value2'], 'device_bat_stat': device_data[device_key]['bat_stat'], 'device_source':device_data[device_key]['source']}, broadcast=True)
        #else for future use if device has different source

    # Emit device names
    for device_key, device in device_data.items():
        emit('device_name_updated', {'device_key': device_key, 'device_name': device['name']})   

    # Emit current rules
    emit('rules_updated', rule_data, broadcast=True)  # Send the entire rule_data object

    # Emit rule names
    for rule_key, rule in rule_data.items():
        emit('rule_name_updated', {'rule_key': rule_key, 'rule_name': rule['rule_name']})  

    
    # Emit current groups
    emit('groups_updated', group_data, broadcast=True)  # Send the entire group_data object

    # Emit group names
    for group_key, group in group_data.items():
        emit('group_name_updated', {'group_key': group_key, 'group_name': group['group_name']})  

    # Emit pairing devices
    emit('pairing_devices_updated', pairing_device_data, broadcast=True)  # Send the entire group_data object





################################################################################################################################################################
#################################################---DEVICE NAME UPDATE EVENT---#################################################################################
################################################################################################################################################################

#When the name of device is changed, update the name and send feedback to the client
@socketio.on('update_device_name')
def update_device_name_socketio(data):
    device_key = data['device_key']
    device_name = data['device_name']
    device_data[device_key]['name'] = device_name 
    emit('device_name_updated', {'device_key': device_key, 'device_name': device_name}, broadcast=True)
    update_device_name(device_key, device_name) #update database with the new name




################################################################################################################################################################
#################################################---DIGITAL INPUT/OUTPUT UPDATE---##############################################################################
################################################################################################################################################################

#When the button for change the output device is pressed, execute the action, check the state of the output and send update to the client
@socketio.on('device_output_update')
def digital_output_update(data):
    device_key = data['device_key']
    action = data['action']
    print(f"Received device_update: device_key = {device_key}, action = {action}")  # Add this print statement

    if device_key in device_data:
        if device_data[device_key]['source'] == 'rpi':
            if action == 'on':
                GPIO.output(device_data[device_key]['gpio_pin'], GPIO.HIGH)
            elif action == 'off':
                GPIO.output(device_data[device_key]['gpio_pin'], GPIO.LOW)
                
            device_data[device_key]['gpio_status'] = GPIO.input(device_data[device_key]['gpio_pin'])
            update_device_gpio_status(device_key, device_data[device_key]['gpio_status'])
            emit('device_gpio_status', {'device_key': device_key, 'gpio_status': device_data[device_key]['gpio_status'],'device_type1':device_data[device_key]['type1'],'device_source': device_data[device_key]['source'],'device_bat_stat': device_data[device_key]['bat_stat']}, broadcast=True)
        elif device_data[device_key]['source'] == 'zbee':
            if action == 'on':
                control_actuator(device_key,1)
            elif action == 'off':
                control_actuator(device_key,0)



# Add event detect for all digital inputs
for device_key, device in device_data.items():
    if device['source'] == 'rpi':
        if device['type'] == 'digital-input':
            GPIO.add_event_detect(device['gpio_pin'], GPIO.BOTH, callback=lambda channel, dk=device_key: input_device_callback(channel, dk), bouncetime=50)

def input_device_callback(channel, device_key):
    if device_data[device_key]['source'] == 'rpi':
        device_data[device_key]['gpio_status'] = GPIO.input(device_data[device_key]['gpio_pin'])
        update_device_gpio_status(device_key, device_data[device_key]['gpio_status'])
        socketio.emit('device_input_status', {'device_key': device_key, 'gpio_status': device_data[device_key]['gpio_status'],'device_type1':device_data[device_key]['type1'],'device_source': device_data[device_key]['source'],'device_bat_stat': device_data[device_key]['bat_stat']}, namespace='/')
        #print(f"Input device callback triggered for {device_key}, gpio_status: {device_data[device_key]['gpio_status']}")  # Add this print statement
    #else for future use if device has different source


###################################################################################################################################################################
###########################################---ZIGBEE SENSORS CALLBACK---###########################################################################################
###################################################################################################################################################################

def zigbee_callback(event_type, device_key):
    print(f"Event Type: {event_type}, Device Key: {device_key}")  # Print the event_type and device_keycd
    if event_type == "sensor_update":
        devices=load_devices()
        if device_key in devices:
            device = devices[device_key]
            device_data[device_key] = {
                'device_id': device['device_id'],
                'name': device['device_name'],
                'gpio_status': device['device_gpio_status'],
                'gpio_id': device['device_gpio_id'],
                'gpio_pin': device['device_gpio_pin'],
                'type': device['device_type'],  
                'type1': device['device_type1'],
                'type2': device['device_type2'],
                'value1': device['device_value1'],
                'value2': device['device_value2'],
                'bat_stat': device['device_bat_stat'],
                'source': device['device_source'],
            }
        else:
            return  # Skip the device if the device_key is not found in devices
        socketio.emit('device_sensor_status', {'device_key': device_key, 'device_type': device_data[device_key]['type'], 'device_type1': device_data[device_key]['type1'], 'device_type2': device_data[device_key]['type2'], 'device_value1': device_data[device_key]['value1'], 'device_value2': device_data[device_key]['value2'], 'device_bat_stat': device_data[device_key]['bat_stat'], 'device_source':device_data[device_key]['source']}, namespace='/')


    elif event_type == "digital_input_update":
        devices=load_devices()
        if device_key in devices:
            device = devices[device_key]
            device_data[device_key] = {
                'device_id': device['device_id'],
                'name': device['device_name'],
                'gpio_status': device['device_gpio_status'],
                'gpio_id': device['device_gpio_id'],
                'gpio_pin': device['device_gpio_pin'],
                'type': device['device_type'],  
                'type1': device['device_type1'],
                'type2': device['device_type2'],
                'value1': device['device_value1'],
                'value2': device['device_value2'],
                'bat_stat': device['device_bat_stat'],
                'source': device['device_source'],
            }
        else:
            return  # Skip the device if the device_key is not found in devices
        socketio.emit('device_input_status', {'device_key': device_key, 'gpio_status': device_data[device_key]['gpio_status'],'device_type1':device_data[device_key]['type1'],'device_source': device_data[device_key]['source'],'device_bat_stat': device_data[device_key]['bat_stat']}, namespace='/')


    elif event_type == "digital_output_update":
        devices=load_devices()
        if device_key in devices:
            device = devices[device_key]
            device_data[device_key] = {
                'device_id': device['device_id'],
                'name': device['device_name'],
                'gpio_status': device['device_gpio_status'],
                'gpio_id': device['device_gpio_id'],
                'gpio_pin': device['device_gpio_pin'],
                'type': device['device_type'],  
                'type1': device['device_type1'],
                'type2': device['device_type2'],
                'value1': device['device_value1'],
                'value2': device['device_value2'],
                'bat_stat': device['device_bat_stat'],
                'source': device['device_source'],
            }
        else:
            return  # Skip the device if the device_key is not found in devices
        socketio.emit('device_gpio_status', {'device_key': device_key, 'gpio_status': device_data[device_key]['gpio_status'],'device_type1':device_data[device_key]['type1'],'device_source': device_data[device_key]['source'],'device_bat_stat': device_data[device_key]['bat_stat']}, namespace='/')

register_callback("sensor_update", zigbee_callback)
register_callback("digital_input_update", zigbee_callback)
register_callback("digital_output_update", zigbee_callback)



################################################################################################################################################
##############################################---DEVICE PAIRING---##############################################################################
################################################################################################################################################

def pairing_callback(event_type, device_info):

    if event_type == "pairing_device":
        print("SUCESSFULL CALLBACK!!!!!!!!!!!!!")
        friendly_name = device_info.get('friendly_name', None)
        device_id = device_info.get('device_id',None)
        description = device_info.get('description', None)
        model = device_info.get('model', None)
        supported = device_info.get('supported', None)
        vendor = device_info.get('vendor', None)

        # Check if the device already exists in devices
        devices = load_devices()
        device_key = f"{model}-{device_id[2:]}"
        if device_key in devices:
            print(f"Device with key {device_key} already exists, skipping adding.")
            return  # Skip the rest of the function if the device already exists

        #if device not exist, add device to the pairing list and send information to the frontend
        add_pairing_device(friendly_name,device_id,description,model,supported,vendor)
        pairing_device_data[friendly_name] = {
            'device_id':device_id,
            'description': description,
            'model':model,
            'supported':supported,
            'vendor':vendor,
        }
        pairing_device_info = pairing_device_data[friendly_name]
        socketio.emit('new_device_pairing', {'friendly_name': friendly_name, 'pairing_device_info': pairing_device_info}, namespace='/')
register_callback("pairing_device", pairing_callback)



#Function to store paired device (called if paring device is accepted in frontend)
def store_paired_device(device):
    def add_device_helper(device_type, device_type1, device_type2):
        add_device(
            device_key=device_key,
            device_id=device['device_id'],
            device_name=device_name,
            device_gpio_status=None,
            device_gpio_id=device_gpio_id,
            device_gpio_pin=None,
            device_type=device_type,
            device_type1=device_type1,
            device_type2=device_type2,
            device_value1=None,
            device_value2=None,
            device_bat_stat=None,
            device_source='zbee'
        )

    device_key = f"{device['model']}-{device['device_id'][2:]}"
    device_name = f"{device['model']}-{device['device_id'][14:]}"
    device_gpio_id = f"{device['model']}-{device['device_id'][16:]}"
    
    
    description = device['description']
    if "temperature" in description.lower() and "humidity" in description.lower():
        add_device_helper('sensor', 'temp', 'humid')

    elif "contact sensor" in description.lower():
        add_device_helper('digital-input', 'contact', None)
     
    elif "motion sensor" in description.lower():
       add_device_helper('digital-input', 'motion', None)
     
    elif "smart plug" in description.lower():
        add_device_helper('digital-output', 'plug', None)


#wait for pairing_device_action event from the frontend
@socketio.on('pairing_device_action')
def paring_device_action(data):
    friendly_name = data['friendly_name']
    action = data['action']
    print(f"Received paring_device_update: friendly_name = {friendly_name}, action = {action}")  # Add this print statement

    if action == 'accept_device': #if device is accepted
        pairing_device=pairing_device_data[friendly_name]
        device_key = f"{pairing_device['model']}-{pairing_device['device_id'][2:]}"

         # Check if the device already exists in devices
        devices = load_devices()
        if device_key in devices:
            print(f"Device with key {device_key} already exists, skipping adding.")
            return  # Skip the rest of the function if the device already exists

        # If the device does not exist, store it
        store_paired_device(pairing_device)
    
        devices = load_devices()
        device = devices[device_key]
        device_data[device_key] = { #update device_data dictionary
            'device_id': device['device_id'],
            'name': device['device_name'],
            'gpio_status': device['device_gpio_status'],
            'gpio_id': device['device_gpio_id'],
            'gpio_pin': device['device_gpio_pin'],
            'type': device['device_type'],  
            'type1': device['device_type1'],
            'type2': device['device_type2'],
            'value1': device['device_value1'],
            'value2': device['device_value2'],
            'bat_stat': device['device_bat_stat'],
            'source': device['device_source'],
            }
        new_device_info = device_data[device_key]
        #send information about new device to the frontend to render it
        socketio.emit('new_device_added', {'device_key': device_key, 'device_info': new_device_info}, namespace='/')
        socketio.emit('device_gpio_status', {'device_key': device_key, 'gpio_status': device_data[device_key]['gpio_status'],'device_type1':device_data[device_key]['type1'],'device_source': device_data[device_key]['source'],'device_bat_stat': device_data[device_key]['bat_stat']}, namespace='/')
      
    else:
        return   
    #delete pairing devie from the pairing device dictionary (does not matter if it is accepted or declined)
    if friendly_name in pairing_device_data:
        delete_pairing_device(friendly_name)
        del pairing_device_data[friendly_name]
        emit('pairing_devices_updated', pairing_device_data, broadcast=True)  # Send the entire pairing_device_data object



################################################################################################################################################################
########################################################---GROUPS---############################################################################################
################################################################################################################################################################

#add/update group handler
@socketio.on('add_group')
def update_group_handler(data):
    #print('Received add_group event', data)
    groupKey = data['group_key']
    groupName = data['group_name']
    groupDevices = data['group_devices']

    existing_group_key = None
    existing_group_device_key = None
    existing_group_name = None
    existing_device_name = None

    groups = load_groups()
    # Check if the group name already exists
    for group in group_data.values():
        if group['group_name'] == groupName:
            return {'error': f"Group name {groupName} already exists!"}

    # Check if the device is already assigned to some group
    for group_key, group_details in groups.items():
        for group_device in group_details['group_devices']:
            for new_group_device in groupDevices:
                if group_device['group_device_key'] == new_group_device['group_device_key']:
                    existing_group_key = group_key
                    existing_group_device_key = group_device['group_device_key']
                    existing_group_name = group_details['group_name']
                    existing_device_name = device_data[existing_group_device_key]['name']
                    break  # Exit the inner loop if a match is found
            if existing_group_device_key is not None:
                break  # Exit the middle loop if a match is found
        if existing_group_device_key is not None:
            break  # Exit the outer loop if a match is found

    if existing_group_device_key is None:
        # Add the new group if no match was found
        add_group(groupKey, groupDevices, groupName)
        group_data[groupKey] = {
            'group_name': groupName,
            'group_devices': groupDevices
        }
        emit('groups_updated', group_data, broadcast=True) # Notify the frontend to update the group list on the sidebar
    else:
        return {'error': f"Device {existing_device_name} already assigned to the group {existing_group_name}."}



#delete_group_handler
@socketio.on('delete_group')
def delete_group_handler(data):
    group_key = data['group_key']
    if group_key in group_data:
        delete_group(group_key)
        del group_data[group_key]
        emit('groups_updated', group_data, broadcast=True)



################################################################################################################################################################
#############################################################---RULES---########################################################################################
################################################################################################################################################################            

#add/update rule handler
@socketio.on('add_rule')
def update_rule_handler(data):
    rule_key = data['rule_key']
    rule_name = data['rule_name']
    input_devices = data['input_devices']
    logic_operator = data['logic_operator']
    output_device_key = data['output_key']
    output_device_action = data['output_action']

    existing_output_rule_name = None
    existing_output_device_name = None

    rules = load_rules()

    # Check if the output device is already used in existing rules
    for existing_rule_key, existing_rule in rules.items():
        if existing_rule['output_device_key'] == output_device_key:
            existing_output_device_name = device_data[existing_rule['output_device_key']]['name']
            existing_output_rule_name = existing_rule['rule_name']
            return {'error': f"Output {existing_output_device_name} already assigned to the rule {existing_output_rule_name}."}

    # Check if the rule name already exists
    for rule in rule_data.values():
        if rule['rule_name'] == rule_name:
            return {'error': f"Rule name {rule_name} already exists!"}

    if rule_key not in rule_data:
        if input_devices and output_device_key:
            add_rule(rule_key, rule_name, input_devices, logic_operator, output_device_key, output_device_action)
            rule_data[rule_key] = {
                'rule_name': rule_name,
                'input_devices': input_devices,
                'logic_operator': logic_operator,
                'output_device_key': output_device_key,
                'output_device_action': output_device_action
            }
            emit('rules_updated', rule_data, broadcast=True)
            emit('lock_device', {'device_key': output_device_key, 'isLocked': True}, broadcast=True)
            return 'success'
    return 'error'


#delete_rule_handler
@socketio.on('delete_rule')
def delete_rule_handler(data):
    rule_key = data['rule_key']
    if rule_key in rule_data:
        output_device_key = rule_data[rule_key]['output_device_key']
        delete_rule(rule_key)
        del rule_data[rule_key]
        emit('rules_updated', rule_data, broadcast=True)

        is_output_device_used = False
        for remaining_rule_key, remaining_rule in rule_data.items():
            if remaining_rule['output_device_key'] == output_device_key:
                is_output_device_used = True
                break

        if not is_output_device_used:
            print(f"Unlocking device {output_device_key}")  # Add a console log
            emit('lock_device', {'device_key': output_device_key, 'isLocked': False}, broadcast=True)



def check_input_devices_and_apply_rules():
    # Keep track of the rules that have been applied
    applied_rules = set()
    previous_output_states = {} #used so control_actuator is executed only when the state realy changes (to lower MQTT traffic)

    while True:
        rules = load_rules()
        # Iterate over the rules and apply them if conditions are met
        for rule_key, rule in rules.items():
            input_devices = rule['input_devices']
            logic_operator = rule['logic_operator']
            output_device_key = rule['output_device_key']
            output_device_action = int(rule['output_device_action'])

            # Check if the input devices match the rule conditions
            matching_input_devices = []
            for input_device in input_devices:
                device = device_data[input_device['input_device_key']]
                if device['type'] == 'digital-input':
                    matching_input_devices.append(str(device['gpio_status']) == input_device['input_device_option'])
                elif device['type'] == 'sensor':
                    if device['type1'] == 'temp':
                        temp_option = input_device['temp_option']
                        temp_value = float(input_device['temp_value'])
                        sensor_value = float(device['value1'])

                        if temp_option == 'less':
                            matching_input_devices.append(sensor_value < temp_value)
                        elif temp_option == 'greater':
                            matching_input_devices.append(sensor_value > temp_value)
                        elif temp_option == 'equal':
                            matching_input_devices.append(sensor_value == temp_value)

            # If the rule conditions are met, apply the rule
            if (logic_operator == 'AND' and all(matching_input_devices)) or (logic_operator == 'OR' and any(matching_input_devices)):
                if device_data[output_device_key]['source'] == 'rpi':
                    GPIO.output(device_data[output_device_key]['gpio_pin'], output_device_action)
                    applied_rules.add(rule_key)
                elif device_data[output_device_key]['source'] == 'zbee':
                    if previous_output_states.get(output_device_key) != output_device_action:
                        control_actuator(output_device_key, output_device_action)
                        applied_rules.add(rule_key)
                        # Update the previous state
                        previous_output_states[output_device_key] = output_device_action
            # If the rule conditions are not met, set the output to the opposite state
            if not ((logic_operator == 'AND' and all(matching_input_devices)) or (logic_operator == 'OR' and any(matching_input_devices))):
                if device_data[output_device_key]['source'] == 'rpi':
                    opposite_action = 1 - output_device_action
                    GPIO.output(device_data[output_device_key]['gpio_pin'], opposite_action)
                    if rule_key in applied_rules:
                        applied_rules.discard(rule_key)
                elif device_data[output_device_key]['source'] == 'zbee':
                    opposite_action = 1 - output_device_action
                    if previous_output_states.get(output_device_key) != opposite_action:
                        control_actuator(output_device_key, opposite_action)
                        if rule_key in applied_rules:
                            applied_rules.discard(rule_key)
                        previous_output_states[output_device_key] = opposite_action

            # Update the gpio_status of the output device
            if device_data[output_device_key]['source'] == 'rpi':
                device_data[output_device_key]['gpio_status'] = GPIO.input(device_data[output_device_key]['gpio_pin'])
                update_device_gpio_status(output_device_key, device_data[output_device_key]['gpio_status'])
                socketio.emit('device_gpio_status', {'device_key': output_device_key, 'gpio_status': device_data[output_device_key]['gpio_status'],'device_type1':device_data[device_key]['type1'],'device_source': device_data[device_key]['source'],'device_bat_stat': device_data[device_key]['bat_stat']},  namespace='/')
            ##device_gpio_status of device with source zbee is updated using MQTT messages and callback functions


        time.sleep(1)  # Check every second




###############################################################################################################################################################
########################################## CPU TEMPERATURE EXAMPLE ############################################################################################
###############################################################################################################################################################



def check_sensor_value():
    while True:
        for device_key, device in device_data.items():
    
            if (device['type'] == 'sensor' and device['type1'] == 'temp' and device['source'] == 'cpu'):
                device['value1'] = get_cpu_temperature()
                socketio.emit('device_sensor_status', {'device_key': device_key, 'device_type': device['type'], 'device_type1': device['type1'], 'device_type2': device['type2'], 'device_value1': device['value1'], 'device_value2': device['value2'], 'device_bat_stat': device['bat_stat'], 'device_source':device['source']}, namespace='/')
           
        time.sleep(5)






#@app.route('/static/<path:path>')
#def send_static(path):
#    return send_from_directory('static', path)

if __name__ == "__main__":
    app.env="development"
    socketio.start_background_task(check_input_devices_and_apply_rules)
    start_mqtt_loop()
    socketio.start_background_task(check_sensor_value)
    socketio.run(app, host='0.0.0.0', port=80, debug=True, allow_unsafe_werkzeug=True, use_reloader=False)
   