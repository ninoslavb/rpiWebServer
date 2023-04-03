import json
import os



def load_rules():
    if not os.path.exists('rules.json'):
        with open('rules.json', 'w') as f:
            json.dump({}, f, indent=2)

    try:
        with open('rules.json', 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {}



def save_rules(rules):
    with open('rules.json', 'w') as f:
        json.dump(rules, f, indent=2)


def add_rule(rule_key,input_device_key, output_device_key):
    rules = load_rules()
    if rule_key not in rules:
        rules[rule_key] = {
            'input_device_key': input_device_key,
            'output_device_key': output_device_key
        }
        save_rules(rules)
    else:
        print(f"Rule key {rule_key} already exists.")


def delete_rule(rule_key):
    rules = load_rules()
    if rule_key in rules:
        del rules[rule_key]
        with open("rules.json", "w") as f:
            json.dump(rules, f)





        