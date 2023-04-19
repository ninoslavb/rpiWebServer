/* ###########################################################################################
 This function updates the input device options to disable the options that are already selected
 The updateInputDeviceOptions function disables the input device options that are already selected in other dropdowns. 
This is done by first collecting all the selected input devices in a set and then looping through all the input device selects and disabling the options that are already selected.
 The event listener at the end  listens for changes in the input device
*/

function updateInputDeviceOptions() {
  const selectedInputDevices = new Set();
  const inputDeviceSelectElements = document.getElementsByClassName('input-device-select');

  // Loop through all input device selects and add their values to the selectedInputDevices set
  for (const selectElement of inputDeviceSelectElements) {
    if (selectElement.value !== "") {
      selectedInputDevices.add(selectElement.value);
    }
  }

  // Loop through all input device selects and disable the options that are already selected
for (const selectElement of inputDeviceSelectElements) {
  for (const optionElement of selectElement.options) {
    // Check if the optionElement has the custom class
    const isPlaceholder = optionElement.classList.contains("placeholder-option");

    if (!isPlaceholder && optionElement.value !== "" && selectedInputDevices.has(optionElement.value)) {
      optionElement.disabled = selectElement.value !== optionElement.value;
    } else {
      optionElement.disabled = isPlaceholder;
    }
  }
}
updateLogicOperatorVisibility();
}


// Event listener to update the input device options when a dropdown value changes
document.addEventListener('change', (event) => {
  if (event.target.classList.contains('input-device-select')) {
    updateInputDeviceOptions();
  }
});




/* ###########################################################################################
 This function updates logic operator visibility. If only one input device is selected, logic operator is not visible and it is set to OR by default.
 If more than one input device is seleced, logic operator is visible and selectable to be AND/OR
*/
function updateLogicOperatorVisibility() {
  const inputDeviceSelectElements = document.getElementsByClassName('input-device-select');
  const logicOperatorSelect = document.getElementById('logic-operator-select');
  const logicOperatorLabel = document.getElementById('logic-operator-label');
  
  let selectedDevicesCount = 0;
  for (const selectElement of inputDeviceSelectElements) {
    if (selectElement.value !== "") {
      selectedDevicesCount++;
    }
  }
  
  if (selectedDevicesCount > 1) {
    logicOperatorSelect.style.display = 'block'; //if there is more than 1 input device show the logic operator dropdown
    logicOperatorLabel.style.display = 'block';  //if there is more than 1 input device show "Logic operation between inputs text"
    logicOperatorSelect.value = 'Select Logic';
  } else {
    logicOperatorSelect.style.display = 'none';   // hide dropdown
    logicOperatorSelect.value = 'OR'; // Set the the logic operator to OR by default when there is only one input device selected
    logicOperatorLabel.style.display = 'none';    // hide text
  }
}

// this counter counts input devices available for rules
let inputDeviceRowCount = 0;
function setInputDeviceRowCount(value) {
  inputDeviceRowCount = value;
}

/* 
The addInputDeviceRow function creates a new input device row with a dropdown for selecting an input device and another dropdown for selecting the input device state (0 or 1) if device type is digital-input
If type is sensor, and if sensor-type1 = temp, then it will create temperature row where user can select equal, less than, greter than and the temperature value
It also adds a remove button to delete the input device row.
*/


function createRow(className) {
  const row = document.createElement('div');
  row.classList.add(className);
  return row;
}

function createLabel(textContent) {
  const label = document.createElement('label');
  label.textContent = textContent;
  return label;
}

function createSelect(className, optionsHTML) {
  const select = document.createElement('select');
  select.classList.add(className);
  select.innerHTML = optionsHTML;
  return select;
}

function createInput(type, className, placeholder) {
  const input = document.createElement('input');
  input.type = type;
  input.classList.add(className);
  input.placeholder = placeholder;
  return input;
}


function addInputDeviceRow() {
  const inputDeviceWrapper = document.getElementById('inputDeviceWrapper');

  const inputDeviceCount = Object.values(deviceData).filter(device => device.type === 'digital-input' || device.type === 'sensor').length;
  if (inputDeviceRowCount >= inputDeviceCount) {
    return false;
  }

  const inputDeviceRow = createRow('input-device-row');
  inputDeviceWrapper.appendChild(inputDeviceRow);

  //create device selection dropdown from device types digital-input and sensor
  const inputDeviceSelect = createSelect('input-device-select', `<option disabled selected class="placeholder-option">Select Input Device</option>`);
  for (const deviceKey in deviceData) {
    const device = deviceData[deviceKey];
    if (device.type === 'digital-input'|| device.type === 'sensor') {
      const optionDevice = document.createElement("option");
      optionDevice.value = deviceKey;
      optionDevice.textContent = device.name;
      inputDeviceSelect.appendChild(optionDevice);
    }
  }
  inputDeviceRow.appendChild(inputDeviceSelect);

  //create remove button for removing the row
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.textContent = 'Remove';
  removeButton.classList.add('btn', 'btn-sm', 'custom-delete-input-button');
  removeButton.addEventListener('click', () => {
    inputDeviceWrapper.removeChild(inputDeviceRow);
    if (temperatureRow.parentNode) 
    inputDeviceWrapper.removeChild(temperatureRow);
    updateInputDeviceOptions();
    inputDeviceRowCount--;
  });
  inputDeviceRow.appendChild(removeButton);

  //create temperature row
  const temperatureRow = createRow('temperature-row');
  temperatureRow.appendChild(createLabel('Temperature: '));
  temperatureRow.appendChild(createSelect('temp-option', `
    <option disabled selected>Select Option</option>
    <option value="equal">Equal To</option>
    <option value="less">Less Than</option>
    <option value="greater">Greater Than</option>
  `));
  temperatureRow.appendChild(createInput('text', 'temp-value', 'Value'));
  temperatureRow.appendChild(createLabel(' °C'));
 

  inputDeviceSelect.addEventListener('change', () => {
    const selectedDevice = deviceData[inputDeviceSelect.value];

    //if input-device-option dropdown already exists, remove it
    const existingOptionDropdown = inputDeviceRow.querySelector('.input-device-option');
    if (existingOptionDropdown) {
      inputDeviceRow.removeChild(existingOptionDropdown);
    }
  
    if (selectedDevice.type === 'digital-input') {
      const inputDeviceOption = createSelect('input-device-option', `
        <option disabled selected>Select State</option>
        <option value="0">0</option>
        <option value="1">1</option>
      `);
      inputDeviceRow.insertBefore(inputDeviceOption, removeButton); //insert inputDeviceOption before removeButton if device type is digital-input
    } else {
      const inputDeviceOptionElement = inputDeviceRow.querySelector('.input-device-option');
      if (inputDeviceOptionElement) {
        inputDeviceRow.removeChild(inputDeviceOptionElement);
      }
    }
    if (selectedDevice.type === 'sensor' && selectedDevice.type1 === 'temp') {
      // Check if the temperatureRow already exists
      const existingTemperatureRow = inputDeviceWrapper.querySelector('.temperature-row');
      if (!existingTemperatureRow) { //if not insert it
        inputDeviceRow.parentNode.insertBefore(temperatureRow, inputDeviceRow.nextSibling);
      }
    } else if (temperatureRow.parentNode) {
      inputDeviceWrapper.removeChild(temperatureRow);
    }

  
    updateInputDeviceOptions();
  });
  

  updateInputDeviceOptions();
  updateLogicOperatorVisibility();
  
  inputDeviceRowCount++;
  return true;
}




export {addInputDeviceRow, updateLogicOperatorVisibility, setInputDeviceRowCount};
