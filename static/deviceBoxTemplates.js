

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

        // Add ON text element
    const onText = document.createElement('span');
    onText.classList.add('on-text');
    onText.textContent = 'ON';
    slider.appendChild(onText);

    // Add OFF text element
    const offText = document.createElement('span');
    offText.classList.add('off-text');
    offText.textContent = 'OFF';
    slider.appendChild(offText);

    if (device.source === 'zbee') {
  // Add Wi-Fi icon above the device label
    const wifiIcon = document.createElement('i');
    wifiIcon.classList.add('fas', 'fa-wifi'); // Use 'far' instead of 'fas' for the regular icon
    wifiIcon.style.position = 'absolute';
    wifiIcon.style.bottom = '20px'; // Adjust this value to position the icon above the label
    wifiIcon.style.left = '5px';
    wifiIcon.style.fontSize = '10px';
    wifiIcon.style.color = 'white';
    deviceBox.appendChild(wifiIcon);
    }
  
  
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
    deviceIcon.style.display = 'flex';        // Add this line
    deviceIcon.style.flexDirection = 'column'; // Add this line
    deviceIcon.style.alignItems = 'center';    // Add this line
    deviceTop.appendChild(deviceIcon);

    const icon = document.createElement('i');
    icon.classList.add('fa-solid', 'fa-door-open');
    icon.style.marginTop = '10px'; // Add this line to move the icon down
    icon.style.color = '#FFFFFF';
    deviceIcon.appendChild(icon);


    const stateValue = document.createElement('span');
    stateValue.classList.add('state-value');
    //stateValue.className = 'state-value'
    stateValue.style.marginTop = '10px'; 
    stateValue.style.fontSize = '15px';
    stateValue.style.color = '#FFFFFF';
    stateValue.textContent = `closed`;
  
    deviceIcon.appendChild(stateValue);

    if (device.source === 'zbee') {
  // Add Wi-Fi icon above the device label
    const wifiIcon = document.createElement('i');
    wifiIcon.classList.add('fas', 'fa-wifi'); // Use 'far' instead of 'fas' for the regular icon
    wifiIcon.style.position = 'absolute';
    wifiIcon.style.bottom = '20px'; // Adjust this value to position the icon above the label
    wifiIcon.style.left = '5px';
    wifiIcon.style.fontSize = '10px';
    wifiIcon.style.color = 'white';
    deviceBox.appendChild(wifiIcon);
    }
  

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
    temperatureRow.style.marginTop = '-10px'; 
    deviceIcon.appendChild(temperatureRow);
  
    const temperatureValue = document.createElement('span');
    temperatureValue.className = 'temperature-value';
    temperatureValue.style.fontSize = '20px';
    temperatureValue.style.color = '#FFFFFF';
    temperatureValue.textContent = `${device.value1} °C`;
    temperatureRow.appendChild(temperatureValue);
  
    // Add humidity value in a separate row if type2 is humid
    if (device.type2 === 'humid') {

      const humidityRow = document.createElement('div');
      humidityRow.style.marginTop = '-25px'; // Adjust this value to change the space between the rows
      deviceIcon.appendChild(humidityRow);
  
  
      const humidityValue = document.createElement('span');
      humidityValue.className = 'humidity-value';
      humidityValue.style.fontSize = '20px';
      humidityValue.style.color = '#FFFFFF';
      humidityValue.textContent = `${device.value2}% RH`;
      humidityRow.appendChild(humidityValue);
    }

    if (device.source === 'zbee') {

    const batteryRow = document.createElement('div');
    batteryRow.style.marginTop = '-25px'; // Adjust this value to change the space between the rows
    deviceIcon.appendChild(batteryRow);
  
    const batteryValue = document.createElement('span');
    batteryValue.className = 'battery-value';
    batteryValue.style.fontSize = '20px';
    batteryValue.style.color = '#FFFFFF';
    batteryValue.textContent = `${device.bat_stat}%`;
    batteryRow.appendChild(batteryValue);

  }

  if (device.source === 'zbee') {
    // Add Wi-Fi icon above the device label
      const wifiIcon = document.createElement('i');
      wifiIcon.classList.add('fas', 'fa-wifi'); // Use 'far' instead of 'fas' for the regular icon
      wifiIcon.style.position = 'absolute';
      wifiIcon.style.bottom = '20px'; // Adjust this value to position the icon above the label
      wifiIcon.style.left = '5px';
      wifiIcon.style.fontSize = '10px';
      wifiIcon.style.color = 'white';
      deviceBox.appendChild(wifiIcon);
      }


    return deviceBox;
  }
  
  


export {createOutputDeviceBox, createInputDeviceBox, createTHDSensorDeviceBox};




