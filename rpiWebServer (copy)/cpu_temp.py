import subprocess
import time

def get_cpu_temperature():
    # Run the vcgencmd command to get the CPU temperature
    process = subprocess.Popen(['vcgencmd', 'measure_temp'], stdout=subprocess.PIPE)
    output, _error = process.communicate()

    # Extract the temperature from the output string
    temperature_str = output.decode('utf-8')
    temperature = float(temperature_str.split('=')[1].split('\'')[0])
    return temperature