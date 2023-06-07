import os
import json

def add_device(device_key, device_id,device_name, device_gpio_status, device_gpio_id, device_gpio_pin, device_type, device_type1, device_type2, device_value1, device_value2, device_bat_stat, device_source):
    #print(f"add_device() called with device_key: {device_key}")  
    devices = load_devices()
    if device_key not in devices:
        devices[device_key] = {
            'device_id': device_id,
            'device_name': device_name,
            'device_gpio_status': device_gpio_status,
            'device_gpio_id': device_gpio_id,
            'device_gpio_pin': device_gpio_pin,
            'device_type': device_type,
            'device_type1': device_type1,
            'device_type2': device_type2,
            'device_value1': device_value1,
            'device_value2': device_value2,
            'device_bat_stat':device_bat_stat,
            'device_source': device_source
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




#def save_devices(devices):
 #   with open('devices.json', 'w') as f:
  #      json.dump(devices, f, indent=2)

def save_devices(devices):
    with open('devices.json', 'w') as f:
        json.dump(devices, f, indent=2)
        f.flush()
        os.fsync(f.fileno())


def delete_device(device_key):
    devices = load_devices()
    if device_key in devices:
        del devices[device_key]
        with open("devices.json", "w") as f:
            json.dump(devices, f)





#####################---PAIRING DEVICES DICTIONARY---############################

def add_pairing_device(friendly_name,device_id, description, model, supported, vendor):
    #print(f"add_device() called with device_key: {device_key}")  
    pairing_devices = load_pairing_devices()
    if friendly_name not in pairing_devices:
        pairing_devices[friendly_name] = {
            'device_id':device_id,
            'description': description,
            'model':model,
            'supported': supported,
            'vendor': vendor
        }
        save_pairing_devices(pairing_devices)
    else:
        print(f"Device {friendly_name} already in pairing process!")



def load_pairing_devices():
    if not os.path.exists('pairing_devices.json'):
        with open('pairing_devices.json', 'w') as f:
            json.dump({}, f, indent=2)

    try:
        with open('pairing_devices.json', 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {}




def save_pairing_devices(pairing_devices):
    with open('pairing_devices.json', 'w') as f:
        json.dump(pairing_devices, f, indent=2)
        f.flush()
        os.fsync(f.fileno())


def delete_pairing_device(friendly_name):
    pairing_devices = load_pairing_devices()
    if friendly_name in pairing_devices:
        del pairing_devices[friendly_name]
        with open("pairing_devices.json", "w") as f:
            json.dump(pairing_devices, f)


#########################################################################################

def get_device_status(device_key):
    devices = load_devices()
    return devices.get(device_key, {}).get('device_gpio_status', None)


def update_device_gpio_status(device_key, device_gpio_status):
    devices = load_devices()
    if device_key in devices:
        devices[device_key]['device_gpio_status'] = device_gpio_status
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



def get_device_type(device_key):
    devices = load_devices()
    return devices.get(device_key, {}).get('device_type', None)

def get_device_gpio_pin(device_key):
    devices = load_devices()
    return devices.get(device_key, {}).get('gpio_pin', None)




