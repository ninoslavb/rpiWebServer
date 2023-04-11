

function createOutputDeviceBox(device_key, device) {
 
    const deviceBox = document.createElement('div');
    deviceBox.classList.add('device-box');
    deviceBox.setAttribute('data-id', device.box_id);
  
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
    deviceBox.setAttribute('data-id', device.box_id);
  
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


export {createOutputDeviceBox, createInputDeviceBox};

