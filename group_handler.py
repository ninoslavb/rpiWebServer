import json
import os



def load_groups():
    if not os.path.exists('groups.json'):
        with open('groups.json', 'w') as f:
            json.dump({}, f, indent=2)

    try:
        with open('groups.json', 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {}



#def save_groups(groups):
 #   with open('groups.json', 'w') as f:
  #      json.dump(groups, f, indent=2)
        
def save_groups(devices):
    with open('groups.json', 'w') as f:
        json.dump(devices, f, indent=2)
        f.flush()
        os.fsync(f.fileno())


def add_group(group_key, group_devices, group_name):
    groups = load_groups()
    groups[group_key] = {
        'group_name': group_name,
        'group_devices': group_devices
        }
    save_groups(groups)
  

def delete_group(group_key):
    groups = load_groups()
    if group_key in groups:
        del groups[group_key]
        with open("groups.json", "w") as f:
            json.dump(groups, f)





        