import sqlite3
from sqlite3 import Error

def get_database_connection():
    print("get_database_connection called")
    conn = None
    try:
        conn = sqlite3.connect('devices.db')
    except Error as e:
        print(e)
    return conn

def create_table():
    conn = get_database_connection()
    if conn is not None:
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS devices
                     (device_key TEXT PRIMARY KEY, device_name TEXT, device_status INTEGER)''')
        conn.commit()

        # Insert default data if the table is empty
        c.execute('SELECT COUNT(*) FROM devices')
        count = c.fetchone()[0]
        if count == 0:
            c.execute('INSERT INTO devices (device_key, device_name, device_status) VALUES (?, ?, ?)', ('relay', 'Relay1', 0))
            c.execute('INSERT INTO devices (device_key, device_name, device_status) VALUES (?, ?, ?)', ('sensor1', 'Sensor 1', 0))
            c.execute('INSERT INTO devices (device_key, device_name, device_status) VALUES (?, ?, ?)', ('sensor2', 'Sensor 2', 0))
            c.execute('INSERT INTO devices (device_key, device_name, device_status) VALUES (?, ?, ?)', ('sensor3', 'Sensor 3', 0))
            c.execute('INSERT INTO devices (device_key, device_name, device_status) VALUES (?, ?, ?)', ('sensor4', 'Sensor 4', 0))
            conn.commit()

        conn.close()

def get_device_status(device_key):
    conn = get_database_connection()
    if conn is not None:
        c = conn.cursor()
        c.execute('SELECT device_status FROM devices WHERE device_key=?', (device_key,))
        status = c.fetchone()
        conn.close()
        return status[0] if status is not None else None
    return None

def update_device_status(device_key, device_status):
    conn = get_database_connection()
    if conn is not None:
        c = conn.cursor()
        c.execute('UPDATE devices SET device_status=? WHERE device_key=?', (device_status, device_key))
        conn.commit()
        conn.close()

def get_device_name(device_key):
    conn = get_database_connection()
    if conn is not None:
        c = conn.cursor()
        c.execute('SELECT device_name FROM devices WHERE device_key=?', (device_key,))
        name = c.fetchone()
        conn.close()
        print(f"Name for {device_key}: {name[0] if name is not None else None}")
        return name[0] if name is not None else None
    return None


def update_device_name(device_key, device_name):
    conn = get_database_connection()
    if conn is not None:
        c = conn.cursor()
        c.execute('UPDATE devices SET device_name=? WHERE device_key=?', (device_name, device_key))
        conn.commit()
        conn.close()

