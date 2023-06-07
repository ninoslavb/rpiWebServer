import json
import os



def load_scenes():
    if not os.path.exists('scenes.json'):
        with open('scenes.json', 'w') as f:
            json.dump({}, f, indent=2)

    try:
        with open('scenes.json', 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {}



#def save_rules(rules):
 #   with open('rules.json', 'w') as f:
  #      json.dump(rules, f, indent=2)

def save_scenes(devices):
    with open('scenes.json', 'w') as f:
        json.dump(devices, f, indent=2)
        f.flush()
        os.fsync(f.fileno())




def add_scene(scene_key, scene_name, scene_devices):
    scenes = load_scenes()
    if scene_key not in scenes:
        scenes[scene_key] = {
            'scene_name': scene_name,
            'scene_devices': scene_devices
        }
        save_scenes(scenes)
    else:
        print(f"Scene key {scene_key} already exists.")


def delete_scene(scene_key):
    scenes = load_scenes()
    if scene_key in scenes:
        del scenes[scene_key]
        with open("scenes.json", "w") as f:
            json.dump(scenes, f)





        