/* ###########################################################################################
 This function updates the input device options to disable the options that are already selected
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
The addInputDeviceRow function creates a new input device row with a dropdown for selecting an input device and another dropdown for selecting the input device state (0 or 1). 
It also adds a remove button to delete the input device row.
The updateInputDeviceOptions function disables the input device options that are already selected in other dropdowns. 
This is done by first collecting all the selected input devices in a set and then looping through all the input device selects and disabling the options that are already selected.
The event listener at the end of the code listens for changes in the input device
*/


// This function creates a new input device row and adds it to the inputDeviceWrapper
function addInputDeviceRow() {
  const inputDeviceWrapper = document.getElementById('inputDeviceWrapper');
  const inputDeviceRow = document.createElement('div');
  inputDeviceRow.classList.add('input-device-row');


    // Check if the number of rows is equal to the number of input devices
  const inputDeviceCount = Object.values(deviceData).filter(device => device.type === 'digital-input').length;
  if (inputDeviceRowCount >= inputDeviceCount) {
    return false; // Row was not added
  }

  // Create a dropdown to select an input device
  const inputDeviceSelect = document.createElement('select');
  inputDeviceSelect.classList.add('input-device-select');
  //inputDeviceSelect.innerHTML = `<option disabled selected>Select Input Device</option>`;
  //inputDeviceSelect.innerHTML = `<option disabled selected data-placeholder>Select Input Device</option>`;
  inputDeviceSelect.innerHTML = `<option disabled selected class="placeholder-option">Select Input Device</option>`;
  for (const deviceKey in deviceData) {
    const device = deviceData[deviceKey];
    if (device.type === 'digital-input') {
      const optionDevice = document.createElement("option");
      optionDevice.value = deviceKey;
      optionDevice.textContent = device.name;
      inputDeviceSelect.appendChild(optionDevice);
    }
  }
    // Add an event listener to call updateInputDeviceOptions when the selected device changes
    /*when you select a device from the dropdown menu, the updateInputDeviceOptions() function will be called, 
    and the selected device will be disabled in the other dropdown menus. */
    inputDeviceSelect.addEventListener('change', () => {
      updateInputDeviceOptions();
      });
    

  inputDeviceRow.appendChild(inputDeviceSelect);

  // Create a dropdown to select the input device state (0 or 1)
  const inputDeviceOption = document.createElement('select');
  inputDeviceOption.classList.add('input-device-option');
  inputDeviceOption.innerHTML = `
    <option disabled selected>Select State</option>
    <option value="0">0</option>
    <option value="1">1</option>
  `;
  inputDeviceRow.appendChild(inputDeviceOption);

  // Create a remove button to delete the input device row
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.textContent = 'Remove';
  removeButton.classList.add('btn', 'btn-sm', 'custom-delete-input-button');
  removeButton.addEventListener('click', () => {
    inputDeviceWrapper.removeChild(inputDeviceRow);
    updateInputDeviceOptions();

  // Decrement the inputDeviceRowCount since a row was removed
  inputDeviceRowCount--;
  });
  inputDeviceRow.appendChild(removeButton);

  // Add the input device row to the inputDeviceWrapper and update the input device options
  inputDeviceWrapper.appendChild(inputDeviceRow);
  updateInputDeviceOptions();

  updateLogicOperatorVisibility();

  // Increment the inputDeviceRowCount since a row was added
  inputDeviceRowCount++;
  return true; // Row was added
}





export {addInputDeviceRow, updateLogicOperatorVisibility, setInputDeviceRowCount};
