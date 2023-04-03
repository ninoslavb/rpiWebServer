import os
import json

def add_device(device_key, device_name, device_status, device_gpio_id, device_box_id, device_type,device_gpio_pin):
    devices = load_devices()
    if device_key not in devices:
        devices[device_key] = {
            'device_name': device_name,
            'device_status': device_status,
            'device_gpio_id': device_gpio_id,
            'device_box_id': device_box_id,
            'device_type': device_type,
            'device_gpio_pin': device_gpio_pin
        }
        save_devices(devices)
    else:
        print(f"Device key {device_key} already exists.")


def load_devices():
    if not os.path.exists('devices.json'):
        with open('devices.json', 'w') as f:
            json.dump({}, f, indent=2)

    try:
        with open('devices.json', 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {}




def save_devices(devices):
    with open('devices.json', 'w') as f:
        json.dump(devices, f, indent=2)




def get_device_status(device_key):
    devices = load_devices()
    return devices.get(device_key, {}).get('device_status', None)


def update_device_status(device_key, device_status):
    devices = load_devices()
    if device_key in devices:
        devices[device_key]['device_status'] = device_status
        save_devices(devices)




def get_device_name(device_key):
    devices = load_devices()
    return devices.get(device_key, {}).get('device_name', None)


def update_device_name(device_key, device_name):
    devices = load_devices()
    if device_key in devices:
        devices[device_key]['device_name'] = device_name
        save_devices(devices)



def get_device_gpio_id(device_key):
    devices = load_devices()
    return devices.get(device_key, {}).get('device_gpio_id', None)


def get_device_box_id(device_key):
    devices = load_devices()
    return devices.get(device_key, {}).get('device_box_id', None)


def get_device_type(device_key):
    devices = load_devices()
    return devices.get(device_key, {}).get('device_type', None)

def get_device_gpio_pin(device_key):
    devices = load_devices()
    return devices.get(device_key, {}).get('gpio_pin', None)




