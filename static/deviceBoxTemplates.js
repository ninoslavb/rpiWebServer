

function createOutputDeviceBox(device_key, device) {
 
  const deviceBox = document.createElement('div');
  deviceBox.classList.add('device-box');
  deviceBox.setAttribute('device-id', device_key);
  
  const deviceTop = document.createElement('div');
  deviceTop.classList.add('device-top');
  deviceTop.id = `${device_key}-top`; // Assign an id based on the device_key
  deviceBox.appendChild(deviceTop);

  const deviceLabel = document.createElement('div');
  deviceLabel.classList.add('device-label');
  deviceLabel.textContent = device.gpio_id;
  deviceTop.appendChild(deviceLabel);

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



/*############---DELETE DEVICE BUTTON---#################*/
  // Add a delete button
  const deleteButton = document.createElement('i');
  deleteButton.classList.add('fas', 'fa-trash');
  deleteButton.style.position = 'absolute';
  deleteButton.style.right = '5px';
  deleteButton.style.bottom = '5px';
  deleteButton.style.color = '#f5f5f5';
  deviceTop.appendChild(deleteButton);

  // Add a confirmation div, initially hidden
  const confirmDiv = document.createElement('div');
  confirmDiv.id = `${device_key}-confirm`; // Assign an id based on the device_key
  confirmDiv.style.display = 'none';
  confirmDiv.style.position = 'absolute';
  confirmDiv.style.top = '0';
  confirmDiv.style.bottom = '0';
  confirmDiv.style.left = '0';
  confirmDiv.style.right = '0';
  confirmDiv.style.backgroundColor = 'rgba(0, 0, 0, 0)';
  confirmDiv.style.color = 'white';
  confirmDiv.style.textAlign = 'center';
  confirmDiv.style.paddingTop = '20%';  // Adjust as needed
  deviceBox.appendChild(confirmDiv);

  // Add confirmation text
  const confirmText = document.createElement('p');
  confirmText.textContent = 'Delete device?';
  confirmDiv.appendChild(confirmText);

  // Add "No" button
  const noButton = document.createElement('button');
  noButton.textContent = 'NO';
  noButton.classList.add('no-button');
  noButton.id = `${device_key}-no-button`;  // unique id for the "No" button
  noButton.style.marginRight = '10px';
  confirmDiv.appendChild(noButton);

  // Add "Yes" button
  const yesButton = document.createElement('button');
  yesButton.classList.add('yes-button');
  yesButton.textContent = 'YES';
  yesButton.id = `${device_key}-yes-button`;  // unique id for the "Yes" button
  confirmDiv.appendChild(yesButton);

  // Toggle visibility of the confirmation div when the delete button is clicked
  deleteButton.addEventListener('click', (e) => {
    e.stopPropagation();  
    confirmDiv.style.display = confirmDiv.style.display === 'none' ? 'block' : 'none';
    deviceTop.style.display = deviceTop.style.display === 'none' ? 'block' : 'none';
    const lockIcon = deviceBox.querySelector('.lock-icon'); // Query lock icon
    if(lockIcon){
        lockIcon.style.display = 'none'; // hide the lockIcon
    }
  });

  // Hide the confirmation div when "No" is clicked, and show the deviceTop
  noButton.addEventListener('click', (e) => {
    e.stopPropagation();
    confirmDiv.style.display = 'none';
    deviceTop.style.display = 'block';
    const lockIcon = deviceBox.querySelector('.lock-icon'); // Query lock icon
    if(lockIcon){
      lockIcon.style.display = 'block'; // hide the lockIcon
  }
    
  });

      // Hide confirmation div when clicked outside
  window.addEventListener('click', (event) => {
    if (!deviceBox.contains(event.target)) {
        confirmDiv.style.display = 'none';
        deviceTop.style.display = 'block';  // Show the other parts of the device box
    }
  });


/*##########--DEVICE ICON---########## */
const deviceIcon = document.createElement('div');
deviceIcon.classList.add('device-icon');
deviceTop.appendChild(deviceIcon);

const icon = document.createElement('i');
icon.classList.add('fas', 'fa-lightbulb');
icon.style.color = '#FFFFFF';
deviceIcon.appendChild(icon);

// Retrieve the selected icon from local storage when the page is reloaded
const storedIconName = localStorage.getItem(`device-${device_key}-icon`);
if (storedIconName) {
  icon.className = ''; // Clear existing classes
  icon.classList.add('fas', storedIconName);
} else {
  // If no icon is stored, default to 'fa-lightbulb'
  icon.classList.add('fas', 'fa-lightbulb');
}

// Create a div to act as the icon dropdown menu
const dropdown = document.createElement('div');
dropdown.classList.add('icon-dropdown');
dropdown.style.display = 'none';                     // Hide the dropdown initially
dropdown.style.position = 'absolute';                // Position dropdown within the device box
dropdown.style.top = '0';                            // Align the top of the dropdown with the top of the device box
dropdown.style.bottom = '0';                         // Align the bottom of the dropdown with the bottom of the device box
dropdown.style.left = '0';                           // Align the left side of the dropdown with the left side of the device box
dropdown.style.right = '0';                          // Align the right side of the dropdown with the right side of the device box
dropdown.style.overflowY = 'scroll';                 // Add scroll bar if content exceeds max height
dropdown.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // Set dropdown background color to semi-transparent
dropdown.style.color = 'white';
dropdown.style.zIndex = '1000'; // Ensure dropdown appears on top of other elements
deviceBox.appendChild(dropdown); // Append the dropdown to deviceBox instead of deviceTop

  // Add a non-selectable "Choose Icon" option
const chooseIconOption = document.createElement('div');
chooseIconOption.innerText = 'Choose Icon';
chooseIconOption.style.fontWeight = 'bold';
chooseIconOption.style.padding = '10px';
chooseIconOption.style.pointerEvents = 'none'; // Make the option non-selectable
dropdown.appendChild(chooseIconOption);

// Add a few icon options
['fa-lightbulb', 'fa-tv', 'fa-shower', 'fa-plug', 'fa-fan', 'fa-couch','fa-bed','fa-bath','fa-car','fa-home','fa-door-open'].forEach(iconName => {
    const option = document.createElement('div');
    option.style.padding = '10px'; // Add padding to options
    option.value = iconName;
    option.innerText = iconName;
    option.addEventListener('click', () => { // Update icon when option is clicked
        icon.className = '';  // clear existing classes
        icon.classList.add('fas', iconName);
        dropdown.style.display = 'none';  // Hide the dropdown after selection
        deviceTop.style.display = 'block';  // Show the other parts of the device box

          // Store the selected icon in local storage
        localStorage.setItem(`device-${device_key}-icon`, iconName);
    });
    dropdown.appendChild(option);
});


// Toggle the visibility of the dropdown when the icon is clicked
icon.addEventListener('click', (e) => {
  e.stopPropagation();  
  const dropdown = deviceBox.querySelector('.icon-dropdown');
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  if (dropdown.style.display === 'block') { // If dropdown is visible
      deviceTop.style.display = 'none'; // Hide the deviceTop
      const lockIcon = deviceBox.querySelector('.lock-icon'); // Query lock icon
      if(lockIcon){
          lockIcon.style.display = 'none'; // Hide the lockIcon 
      }
  } else if (confirmDiv.style.display !== 'block') { // Only show deviceTop if confirmDiv is not visible
      deviceTop.style.display = 'block'; 
      const lockIcon = deviceBox.querySelector('.lock-icon'); // Query lock icon
      if(lockIcon){
        lockIcon.style.display = 'none'; // hide the lockIcon
    }
  }
});

// Hide dropdown when clicked outside
window.addEventListener('click', (event) => {
  if (!deviceBox.contains(event.target)) {
      dropdown.style.display = 'none';
      if (confirmDiv.style.display !== 'block') { // Only show deviceTop if confirmDiv is not visible
          deviceTop.style.display = 'block';  // Show the other parts of the device box
      }
  }
});
  

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
  wifiIcon.style.bottom = '15px'; // Adjust this value to position the icon above the label
  wifiIcon.style.left = '5px';
  wifiIcon.style.fontSize = '10px';
  wifiIcon.style.color = 'white';
  deviceTop.appendChild(wifiIcon);
  }

  if (device.source === 'zbee') {

    const batteryValue = document.createElement('span');
    batteryValue.className = 'battery-value';
    batteryValue.style.position = 'absolute'
    batteryValue.style.fontSize = '10px';
    batteryValue.style.bottom = '12px'; // Adjust this value to position the icon above the label
    batteryValue.style.left = '20px';   //adjust this value to position battery status right to the wifi icon
    batteryValue.style.color = 'white';
    batteryValue.textContent = ``;
    deviceTop.appendChild(batteryValue);

  
  }

 return deviceBox;
}











function createInputDeviceBox(device_key, device) {

  const deviceBox = document.createElement('div');
  deviceBox.classList.add('device-box');
  deviceBox.setAttribute('device-id', device_key);


  const deviceTop = document.createElement('div');
  deviceTop.classList.add('device-top');
  deviceTop.id = `${device_key}-top`; // Assign an id based on the device_key
  deviceBox.appendChild(deviceTop);

  const deviceLabel = document.createElement('div');
  deviceLabel.classList.add('device-label');
  deviceLabel.textContent = device.gpio_id;
  deviceTop.appendChild(deviceLabel);

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

  /*############---DELETE DEVICE BUTTON---#################*/
  // Add a delete button
  const deleteButton = document.createElement('i');
  deleteButton.classList.add('fas', 'fa-trash');
  deleteButton.style.position = 'absolute';
  deleteButton.style.right = '5px';
  deleteButton.style.bottom = '5px';
  deleteButton.style.color = '#f5f5f5';
  deviceTop.appendChild(deleteButton);

  // Add a confirmation div, initially hidden
  const confirmDiv = document.createElement('div');
  confirmDiv.id = `${device_key}-confirm`; // Assign an id based on the device_key
  confirmDiv.style.display = 'none';
  confirmDiv.style.position = 'absolute';
  confirmDiv.style.top = '0';
  confirmDiv.style.bottom = '0';
  confirmDiv.style.left = '0';
  confirmDiv.style.right = '0';
  confirmDiv.style.backgroundColor = 'rgba(0, 0, 0, 0)';
  confirmDiv.style.color = 'white';
  confirmDiv.style.textAlign = 'center';
  confirmDiv.style.paddingTop = '20%';  // Adjust as needed
  deviceBox.appendChild(confirmDiv);

  // Add confirmation text
  const confirmText = document.createElement('p');
  confirmText.textContent = 'Delete device?';
  confirmDiv.appendChild(confirmText);

  // Add "No" button
  const noButton = document.createElement('button');
  noButton.classList.add('no-button');
  noButton.textContent = 'NO';
  noButton.id = `${device_key}-no-button`;  // unique id for the "No" button
  noButton.style.marginRight = '10px';
  confirmDiv.appendChild(noButton);

  // Add "Yes" button
  const yesButton = document.createElement('button');
  yesButton.classList.add('yes-button');
  yesButton.textContent = 'YES';
  yesButton.id = `${device_key}-yes-button`;  // unique id for the "Yes" button
  confirmDiv.appendChild(yesButton);

  // Toggle visibility of the confirmation div when the delete button is clicked
  deleteButton.addEventListener('click', (e) => {
    e.stopPropagation();  
    confirmDiv.style.display = confirmDiv.style.display === 'none' ? 'block' : 'none';
    deviceTop.style.display = deviceTop.style.display === 'none' ? 'block' : 'none';
  });

  // Hide the confirmation div when "No" is clicked, and show the deviceTop
  noButton.addEventListener('click', (e) => {
    e.stopPropagation();
    confirmDiv.style.display = 'none';
    deviceTop.style.display = 'block';
    
  });

      // Hide confirmation div when clicked outside
  window.addEventListener('click', (event) => {
    if (!deviceBox.contains(event.target)) {
        confirmDiv.style.display = 'none';
        deviceTop.style.display = 'block';  // Show the other parts of the device box
    }
  });


/*##########--DEVICE ICON---########## */
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

// Retrieve the selected icon from local storage when the page is reloaded
const storedIconName = localStorage.getItem(`device-${device_key}-icon`);
if (storedIconName) {
  icon.className = ''; // Clear existing classes
  icon.classList.add('fas', storedIconName);
} else {
  // If no icon is stored, default to 'fa-lightbulb'
  icon.classList.add('fas', 'fa-door-open');
}

// Create a div to act as the icon dropdown menu
const dropdown = document.createElement('div');
dropdown.classList.add('icon-dropdown');
dropdown.style.display = 'none';                     // Hide the dropdown initially
dropdown.style.position = 'absolute';                // Position dropdown within the device box
dropdown.style.top = '0';                            // Align the top of the dropdown with the top of the device box
dropdown.style.bottom = '0';                         // Align the bottom of the dropdown with the bottom of the device box
dropdown.style.left = '0';                           // Align the left side of the dropdown with the left side of the device box
dropdown.style.right = '0';                          // Align the right side of the dropdown with the right side of the device box
dropdown.style.overflowY = 'scroll';                 // Add scroll bar if content exceeds max height
dropdown.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // Set dropdown background color to semi-transparent
dropdown.style.color = 'white';
dropdown.style.zIndex = '1000'; // Ensure dropdown appears on top of other elements
deviceBox.appendChild(dropdown); // Append the dropdown to deviceBox instead of deviceTop

  // Add a non-selectable "Choose Icon" option
const chooseIconOption = document.createElement('div');
chooseIconOption.innerText = 'Choose Icon';
chooseIconOption.style.fontWeight = 'bold';
chooseIconOption.style.padding = '10px';
chooseIconOption.style.pointerEvents = 'none'; // Make the option non-selectable
dropdown.appendChild(chooseIconOption);

// Add a few icon options
['fa-lightbulb', 'fa-tv', 'fa-shower', 'fa-plug', 'fa-fan', 'fa-couch','fa-bed','fa-bath','fa-car','fa-home','fa-door-open'].forEach(iconName => {
    const option = document.createElement('div');
    option.style.padding = '10px'; // Add padding to options
    option.value = iconName;
    option.innerText = iconName;
    option.addEventListener('click', () => { // Update icon when option is clicked
        icon.className = '';  // clear existing classes
        icon.classList.add('fas', iconName);
        dropdown.style.display = 'none';  // Hide the dropdown after selection
        deviceTop.style.display = 'block';  // Show the other parts of the device box

          // Store the selected icon in local storage
        localStorage.setItem(`device-${device_key}-icon`, iconName);
    });
    dropdown.appendChild(option);
});


// Toggle the visibility of the dropdown when the icon is clicked
icon.addEventListener('click', (e) => {
  e.stopPropagation();  
  const dropdown = deviceBox.querySelector('.icon-dropdown');
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  if (dropdown.style.display === 'block') { // If dropdown is visible
      deviceTop.style.display = 'none'; // Hide the deviceTop
  } else if (confirmDiv.style.display !== 'block') { // Only show deviceTop if confirmDiv is not visible
      deviceTop.style.display = 'block'; 
  }
});

// Hide dropdown when clicked outside
window.addEventListener('click', (event) => {
  if (!deviceBox.contains(event.target)) {
      dropdown.style.display = 'none';
      if (confirmDiv.style.display !== 'block') { // Only show deviceTop if confirmDiv is not visible
          deviceTop.style.display = 'block';  // Show the other parts of the device box
      }
  }
});
  
  const stateValue = document.createElement('span');
  stateValue.classList.add('state-value');
  //stateValue.className = 'state-value'
  stateValue.style.marginTop = '3px'; 
  stateValue.style.fontSize = '15px';
  stateValue.style.color = '#FFFFFF';
  //stateValue.textContent = `closed`;
  if (device.type1 === 'contact') {
    stateValue.textContent = 'closed';
} else if (device.type1 === 'motion') {
    stateValue.textContent = 'unoccupied';
}
  deviceIcon.appendChild(stateValue);

  if (device.source === 'zbee') {
// Add Wi-Fi icon above the device label
  const wifiIcon = document.createElement('i');
  wifiIcon.classList.add('fas', 'fa-wifi'); // Use 'far' instead of 'fas' for the regular icon
  wifiIcon.style.position = 'absolute';
  wifiIcon.style.bottom = '15px'; // Adjust this value to position the icon above the label
  wifiIcon.style.left = '5px';
  wifiIcon.style.fontSize = '10px';
  wifiIcon.style.color = 'white';
  deviceTop.appendChild(wifiIcon);
  }


  if (device.source === 'zbee') {

    const batteryValue = document.createElement('span');
    batteryValue.className = 'battery-value';
    batteryValue.style.position = 'absolute'
    batteryValue.style.fontSize = '10px';
    batteryValue.style.bottom = '12px'; // Adjust this value to position the icon above the label
    batteryValue.style.left = '20px';   //adjust this value to position battery status right to the wifi icon
    batteryValue.style.color = 'white';
    batteryValue.textContent = ``;
    deviceTop.appendChild(batteryValue);


  }

  return deviceBox;
}





function createTHDSensorDeviceBox(device_key, device) {
  const deviceBox = document.createElement('div');
  deviceBox.classList.add('device-box');
  deviceBox.setAttribute('device-id', device_key);

  const deviceTop = document.createElement('div');
  deviceTop.classList.add('device-top');
  deviceTop.id = `${device_key}-top`; // Assign an id based on the device_key
  deviceBox.appendChild(deviceTop);

  const deviceLabel = document.createElement('div');
  deviceLabel.classList.add('device-label');
  deviceLabel.textContent = device.gpio_id;
  deviceTop.appendChild(deviceLabel);

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

    /*############---DELETE DEVICE BUTTON---#################*/
  // Add a delete button
  const deleteButton = document.createElement('i');
  deleteButton.classList.add('fas', 'fa-trash');
  deleteButton.style.position = 'absolute';
  deleteButton.style.right = '5px';
  deleteButton.style.bottom = '5px';
  deleteButton.style.color = '#f5f5f5';
  deviceTop.appendChild(deleteButton);

  // Add a confirmation div, initially hidden
  const confirmDiv = document.createElement('div');
  confirmDiv.id = `${device_key}-confirm`; // Assign an id based on the device_key
  confirmDiv.style.display = 'none';
  confirmDiv.style.position = 'absolute';
  confirmDiv.style.top = '0';
  confirmDiv.style.bottom = '0';
  confirmDiv.style.left = '0';
  confirmDiv.style.right = '0';
  confirmDiv.style.backgroundColor = 'rgba(0, 0, 0, 0)';
  confirmDiv.style.color = 'white';
  confirmDiv.style.textAlign = 'center';
  confirmDiv.style.paddingTop = '20%';  // Adjust as needed
  deviceBox.appendChild(confirmDiv);

  // Add confirmation text
  const confirmText = document.createElement('p');
  confirmText.textContent = 'Delete device?';
  confirmDiv.appendChild(confirmText);

  // Add "No" button
  const noButton = document.createElement('button');
  noButton.classList.add('no-button');
  noButton.textContent = 'NO';
  noButton.id = `${device_key}-no-button`;  // unique id for the "No" button
  noButton.style.marginRight = '10px';
  confirmDiv.appendChild(noButton);

  // Add "Yes" button
  const yesButton = document.createElement('button');
  yesButton.classList.add('yes-button');
  yesButton.textContent = 'YES';
  yesButton.id = `${device_key}-yes-button`;  // unique id for the "Yes" button
  confirmDiv.appendChild(yesButton);

  // Toggle visibility of the confirmation div when the delete button is clicked
  deleteButton.addEventListener('click', (e) => {
    e.stopPropagation();  
    confirmDiv.style.display = confirmDiv.style.display === 'none' ? 'block' : 'none';
    deviceTop.style.display = deviceTop.style.display === 'none' ? 'block' : 'none';
  });

  // Hide the confirmation div when "No" is clicked, and show the deviceTop
  noButton.addEventListener('click', (e) => {
    e.stopPropagation();
    confirmDiv.style.display = 'none';
    deviceTop.style.display = 'block';
    
  });

      // Hide confirmation div when clicked outside
  window.addEventListener('click', (event) => {
    if (!deviceBox.contains(event.target)) {
        confirmDiv.style.display = 'none';
        deviceTop.style.display = 'block';  // Show the other parts of the device box
    }
  });


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
  // Add Wi-Fi icon above the device label
    const wifiIcon = document.createElement('i');
    wifiIcon.classList.add('fas', 'fa-wifi'); // Use 'far' instead of 'fas' for the regular icon
    wifiIcon.style.position = 'absolute';
    wifiIcon.style.bottom = '15px'; // Adjust this value to position the icon above the label
    wifiIcon.style.left = '5px';
    wifiIcon.style.fontSize = '10px';
    wifiIcon.style.color = 'white';
    deviceTop.appendChild(wifiIcon);
    }

    if (device.source === 'zbee') {

      const batteryValue = document.createElement('span');
      batteryValue.className = 'battery-value';
      batteryValue.style.position = 'absolute'
      batteryValue.style.fontSize = '10px';
      batteryValue.style.bottom = '12px'; // Adjust this value to position the icon above the label
      batteryValue.style.left = '20px';   //adjust this value to position battery status right to the wifi icon
      batteryValue.style.color = 'white';
      batteryValue.textContent = ``;
      deviceTop.appendChild(batteryValue);
    }
    


  return deviceBox;
}


export {createOutputDeviceBox, createInputDeviceBox, createTHDSensorDeviceBox};




