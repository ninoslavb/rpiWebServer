

function createOutputDeviceBox(device_key, device) {
 
    const deviceBox = document.createElement('div');
    deviceBox.classList.add('device-box');
    deviceBox.setAttribute('device-id', device_key);
  
    const deviceLabel = document.createElement('div');
    deviceLabel.classList.add('device-label');
    deviceLabel.textContent = device.gpio_id;
    deviceBox.appendChild(deviceLabel);
  
    const deviceTop = document.createElement('div');
    deviceTop.classList.add('device-top');
    deviceBox.appendChild(deviceTop);
  
    const deviceName = document.createElement('div');
    deviceName.classList.add('device-name');
    deviceTop.appendChild(deviceName);
  
    const deviceInput = document.createElement('input');
    deviceInput.classList.add('device-input');
    deviceInput.type = 'text';
    deviceInput.placeholder = 'Enter name';
    deviceInput.id = `${device_key}-name`;
    deviceInput.value = device.name;
    deviceName.appendChild(deviceInput);
  
    const deviceIcon = document.createElement('div');
    deviceIcon.classList.add('device-icon');
    deviceTop.appendChild(deviceIcon);
  
    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-lightbulb');
    icon.style.color = '#FFFFFF';
    deviceIcon.appendChild(icon);
  
    const deviceSwitch = document.createElement('label');
    deviceSwitch.classList.add('device-switch');
    deviceTop.appendChild(deviceSwitch);
  
    const switchInput = document.createElement('input');
    switchInput.type = 'checkbox';
    switchInput.id = `${device_key}-input`;
    deviceSwitch.appendChild(switchInput);
  
    const slider = document.createElement('span');
    slider.classList.add('slider', 'round');
    deviceSwitch.appendChild(slider);
  
   return deviceBox;
  }

  


  function createInputDeviceBox(device_key, device) {
 
    const deviceBox = document.createElement('div');
    deviceBox.classList.add('device-box');
    deviceBox.setAttribute('device-id', device_key);
  
    const deviceLabel = document.createElement('div');
    deviceLabel.classList.add('device-label');
    deviceLabel.textContent = device.gpio_id;
    deviceBox.appendChild(deviceLabel);
  
    const deviceTop = document.createElement('div');
    deviceTop.classList.add('device-top');
    deviceBox.appendChild(deviceTop);
  
    const deviceName = document.createElement('div');
    deviceName.classList.add('device-name');
    deviceTop.appendChild(deviceName);
  
    const deviceInput = document.createElement('input');
    deviceInput.classList.add('device-input');
    deviceInput.type = 'text';
    deviceInput.placeholder = 'Enter name';
    deviceInput.id = `${device_key}-name`;
    deviceInput.value = device.name;
    deviceName.appendChild(deviceInput);
  
    const deviceIcon = document.createElement('div');
    deviceIcon.classList.add('device-icon');
    deviceTop.appendChild(deviceIcon);
  
    const icon = document.createElement('i');
    icon.classList.add('fa-solid', 'fa-door-open');
    icon.style.color = '#FFFFFF';
    deviceIcon.appendChild(icon);
  
    return deviceBox;
  }


  function createTHDSensorDeviceBox(device_key, device) {
    const deviceBox = document.createElement('div');
    deviceBox.classList.add('device-box');
    deviceBox.setAttribute('device-id', device_key);
  
    const deviceLabel = document.createElement('div');
    deviceLabel.classList.add('device-label');
    deviceLabel.textContent = device.gpio_id;
    deviceBox.appendChild(deviceLabel);
  
    const deviceTop = document.createElement('div');
    deviceTop.classList.add('device-top');
    deviceBox.appendChild(deviceTop);
  
    const deviceName = document.createElement('div');
    deviceName.classList.add('device-name');
    deviceTop.appendChild(deviceName);
  
    const deviceInput = document.createElement('input');
    deviceInput.classList.add('device-input');
    deviceInput.type = 'text';
    deviceInput.placeholder = 'Enter name';
    deviceInput.id = `${device_key}-name`;
    deviceInput.value = device.name;
    deviceName.appendChild(deviceInput);
  
    const deviceIcon = document.createElement('div');
    deviceIcon.classList.add('device-icon');
    deviceTop.appendChild(deviceIcon);
  
    // Add temperature value in a separate row
    const temperatureRow = document.createElement('div');
    deviceIcon.appendChild(temperatureRow);
  
    const temperatureValue = document.createElement('span');
    temperatureValue.className = 'temperature-value';
    temperatureValue.style.fontSize = '30px';
    temperatureValue.style.color = '#FFFFFF';
    temperatureValue.textContent = `${device.sensor_value1} °C`;
    temperatureRow.appendChild(temperatureValue);
  
    // Add humidity value in a separate row if type2 is humid
    if (device.sensor_type2 === 'humid') {

      const humidityRow = document.createElement('div');
      humidityRow.style.marginTop = '-20px'; // Adjust this value to change the space between the rows
      deviceIcon.appendChild(humidityRow);
  
  
      const humidityValue = document.createElement('span');
      humidityValue.className = 'humidity-value';
      humidityValue.style.fontSize = '20px';
      humidityValue.style.color = '#FFFFFF';
      humidityValue.textContent = `${device.sensor_value2}% RH`;
      humidityRow.appendChild(humidityValue);
    }
  
    return deviceBox;
  }
  
  


export {createOutputDeviceBox, createInputDeviceBox, createTHDSensorDeviceBox};




