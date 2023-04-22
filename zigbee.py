import time
import paho.mqtt.client as mqtt
from database_handler import load_devices, save_devices, get_device_status, update_device_gpio_status, get_device_name, update_device_name, get_device_gpio_id, get_device_type, add_device, get_device_gpio_pin
import json
#import os
import atexit


device_info = {}
callback = None  # Add this line


def register_callback(cb):
    global callback
    callback = cb

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe("zigbee2mqtt/bridge/event")
    client.subscribe("zigbee2mqtt/bridge/log")
    client.subscribe("zigbee2mqtt/+")  # Subscribe to all device topics



def on_message(client, userdata, msg):
    global device_info
    #maybe use global variable instead of devices, do devices.json is not being deleted if load is happened before save in handle_sensor_data function
    devices = load_devices()
    for device_key in devices:
        device = devices[device_key]
        topic = f"zigbee2mqtt/{device['device_id']}"
        if msg.topic == topic:
            try:
                payload = json.loads(msg.payload)
                handle_sensor_data(device_key, payload)
            except json.JSONDecodeError:
                print(f"Invalid JSON message received on topic {msg.topic}: {msg.payload}")
            break
    else:
        print(f"Message received on unknown topic {msg.topic}: {msg.payload}")



    print(f"Received message on topic: {msg.topic}")  # Add this line
    if "zigbee2mqtt/bridge/event" in msg.topic:
        print("Processing device_joined event")  # Add this line
        payload = json.loads(msg.payload)
        #print(f"Payload: {payload}")  # Add this line
        if 'type' in payload and payload['type'] == 'device_joined':
            data = payload.get('data', {})

            if 'friendly_name' in data and 'ieee_address' in data:
                device_info = {
                    'friendly_name': data['friendly_name'],
                    'device_id': data['ieee_address'],
                    'message': 'device_joined',
                }
                print(f"Device joined: {device_info}")  # Add this line
            else:
                print("Received device_joined event with incomplete data.")

    if "zigbee2mqtt/bridge/log" in msg.topic:
        print("Processing bridge log")  # Add this line
        payload = json.loads(msg.payload)
        print(f"Payload: {payload}")  # Add this line
        if 'type' in payload and payload['type'] == 'device_connected' and device_info.get('message') == 'device_joined':
            data = payload.get('message', {})
            print("Processing device_connected log")  # Add this line


            if 'friendly_name' in data and data['friendly_name'] == device_info.get('friendly_name'):
                device_info['message'] = 'device_connected'
                print(f"Device connected: {device_info}")  # Add this line
            else:
                print("Received device_connected log with incomplete data.")

        elif 'type' in payload and payload['type'] == 'pairing' and payload.get('message') == 'interview_successful' and device_info.get('message') == 'device_connected':
            data = payload.get('meta', {})
            print("Processing pairing event")  # Add this line

            if 'friendly_name' in data and data['friendly_name'] == device_info.get('friendly_name') and 'description' in data and 'model' in data:
                device_info['description'] = data['description']
                device_info['model'] = data['model']
                print(f"Storing paired device: {device_info}")  # Add this line
                store_paired_device(device_info)
            else:
                print("Received pairing event with incomplete data.")

 




def store_paired_device(device):
    device_key = f"{device['model']}-{device['device_id'][2:]}"
    device_name = f"{device['model']}-{device['device_id'][14:]}"
    device_gpio_id = f"{device['model']}-{device['device_id'][16:]}"
    
    description = device['description']
    if "temperature" in description.lower() and "humidity" in description.lower():
        device_type = 'sensor'
        device_type1 = 'temp'
        device_type2 = 'humid'
    elif "contact sensor" in description.lower():
        device_type = 'digital-input'
        device_type1 = None
        device_type2 = None

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
    if callback:
        callback("new_device", device_key)



def handle_sensor_data(device_id, payload):
    devices = load_devices()
    
    for device_key in devices:
        device=devices[device_key]
        if device_key == device_id:
            if device['device_type'] == 'sensor' and device['device_type1'] == 'temp' and device['device_type2'] == 'humid':
                if 'temperature' in payload:
                    device['device_value1'] = payload['temperature']
                    print(f"Temperature from {device_id}: {payload['temperature']}")
                
                if 'humidity' in payload:
                    device['device_value2'] = payload['humidity']
                    print(f"Humidity from {device_id}: {payload['humidity']}")
                
                if 'battery' in payload:
                    device['device_bat_stat'] = payload['battery']
                    print(f"Battery from {device_id}: {payload['battery']}")

                # Save updated device values to devices.json
                save_devices(devices)

                if callback:
                    callback("sensor_update", device_key)
                return

                
            if device['device_type'] == 'digital-input':
                if 'contact' in payload:
                    device['device_gpio_status'] = int(payload['contact']) #convert boolean to 0 or 1
                    print(f"Contact info from {device_id}: {int(payload['contact'])}")
                
                # Save updated device values to devices.json
                save_devices(devices)

                if callback:
                    callback("digital_input_update", device_key)
                return




client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

def disconnect_mqtt_client():
    print("Disconnecting MQTT client...")
    client.disconnect()

def start_mqtt_loop():
    client.connect("localhost", 1883, 60)
    atexit.register(disconnect_mqtt_client)  # Add this line
    client.loop_start()  # Run the loop in the background


client.disconnect()