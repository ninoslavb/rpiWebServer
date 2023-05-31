
import {addInputDeviceRow, updateLogicOperatorVisibility, setInputDeviceRowCount, updateInputDeviceOptions, createSelect} from './rulesInputDeviceRow_handler.js';


// DOM elements
document.addEventListener('DOMContentLoaded', () => {


const socket = io();


const logicOperatorSelect = document.querySelector(".logic-operator-select");
const outputSelect = document.querySelector(".output-select");
const outputActionSelect = document.querySelector(".output-action-select");
const ruleList = document.getElementById("rule-list");


// Show/hide the add-rule-container when the "ADD NEW RULE" button is clicked
const addNewRuleButton = document.getElementById('add-new-rule-button');
const addRuleContainer = document.getElementById('add-rule-container');

addNewRuleButton.addEventListener('click', () => {
  addRuleContainer.style.display = addRuleContainer.style.display === 'none' ? 'block' : 'none';

});


//container for adding rule name      
  const ruleNameContainer = document.getElementById("rule-name-container");
  const input = document.createElement("input");
  input.className = "rule-input";
  input.type = "text";
  input.placeholder = "Enter name";
  input.id = "new-rule-name";
  ruleNameContainer.appendChild(input);



/*##############################################################################################################################
This function updates the options in all input device selects and output device select by first querying all elements with the class 'input-device-select' and 'output-select'. 
Then, for each input and output device select element, it stores the current value, resets its inner HTML, and repopulates it with the updated devices. 
Finally, it restores the original value of the select element. 
This function is used when we want to update the input or output device options, for example, when a new device is added or when device name is updated
*/
function updateDeviceOptions() {
  // Query all elements with the class 'input-device-select'
  const inputDeviceSelects = document.querySelectorAll('.input-device-select');
  const outputDeviceSelects = document.querySelectorAll('.output-select');

  inputDeviceSelects.forEach((inputDeviceSelect) => {
    const currentValueInput = inputDeviceSelect.value;
    inputDeviceSelect.innerHTML = `<option disabled selected>Select Input Device</option>`;

    for (const deviceKey in deviceData) {
      const device = deviceData[deviceKey];
      if (device.type === 'digital-input' || device.type === 'sensor') {
        const optionDeviceInput = document.createElement("option");
        optionDeviceInput.value = deviceKey;
        optionDeviceInput.textContent = device.name;
        inputDeviceSelect.appendChild(optionDeviceInput);
      }
    }
    inputDeviceSelect.value = currentValueInput;
  });

  outputDeviceSelects.forEach((outputDeviceSelect) => {
    const currentValueOutput = outputDeviceSelect.value;
    outputDeviceSelect.innerHTML = `<option disabled selected>Select Output Device</option>`;

    for (const deviceKey in deviceData) {
      const device = deviceData[deviceKey];
      if (device.type === 'digital-output') {
        const optionDeviceOutput = document.createElement("option");
        optionDeviceOutput.value = deviceKey;
        optionDeviceOutput.textContent = device.name;
        outputDeviceSelect.appendChild(optionDeviceOutput);
      }
    }
    outputDeviceSelect.value = currentValueOutput;
  });
}

window.updateDeviceOptions = updateDeviceOptions;



/* 
####################################################################################################################################################################################
The following code is an event listener for the form submission. When the form is submitted, it prevents the default form submission behavior and processes the form data as follows:
--> It selects all input device rows and creates an array of input devices, where each device object contains the selected input device key and its option value.
--> It creates a rule key by combining all input device keys and the output device key.
--> It sends the form data to the server using the 'add_rule' event via the socket connection.
-->The server responds with either 'error' or 'success'. If there is an error, it alerts the user that the rule already exists for that output. 
If the response is successful, it updates the ruleData object and calls the updateRuleList() function to update the list of rules displayed on the page.
After the rule is successfully added, it removes all existing input device rows from the form, allowing the user to start fresh when adding a new rule.

*/

const addRuleForm = document.getElementById("add-rule-form");
const ruleNameInput = document.getElementById("new-rule-name");
let originalRuleData = null;
let currentlyEditingRuleKey = null;

// Function to generate a pseudo-random rule key.
function generateRuleKey() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

addRuleForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const temperatureRow = document.querySelector('.temperature-row');

// Get the selected input devices from the input device rows
          const inputDeviceRows = document.querySelectorAll('.input-device-row');
          const inputDevices = Array.from(inputDeviceRows).map((row) => {
            const input_device_key = row.querySelector('.input-device-select').value;
            const input_device_option = row.querySelector('.input-device-option') ? row.querySelector('.input-device-option').value : null;
          
            const device = deviceData[input_device_key];
            let tempOption = null;
            let tempValue = null;
            
            if (device.type === 'sensor' && device.type1 === 'temp') {
              const temperatureRow = document.querySelector('.temperature-row');  
              tempOption = temperatureRow ? temperatureRow.querySelector('.temp-option').value : null;
              tempValue = temperatureRow ? temperatureRow.querySelector('.temp-value').value : null;
            }
          
            return {
              input_device_key,
              input_device_option,
              temp_option: tempOption,
              temp_value: tempValue
            };
          });
          
        
        
        const ruleName = ruleNameInput.value;


        // Validation check: If no devices are selected, show an alert and return early
        if (inputDevices.length === 0) {
        alert('Please add at least one input device to the rule.');
        return;
        }


      // Validation check: If an input device is not selected from the dropdown, show an alert and return early
      for (const inputDevice of inputDevices) {
        if (inputDevice.input_device_key === 'Select Input Device') {
          alert('Please select a valid input device.');
          return;
        } else if (inputDevice.input_device_option === 'Select State') {
          alert('Please select a valid input device state.');
          return;
        } else if (inputDevice.temp_option === 'Select Option' && temperatureRow &&temperatureRow.parentNode) {
          alert('Please select a valid sensor option.');
          return;
        } else if (inputDevice.temp_value === '' && temperatureRow && temperatureRow.parentNode) {
          alert('Please enter a valid sensor value.');
          return;
        } else if (temperatureRow && temperatureRow.parentNode && (inputDevice.temp_value < -20 || inputDevice.temp_value > 80 || inputDevice.temp_value % 1 !== 0)) {
          alert('Please enter a valid sensor value between -20 and 80°C with the step of 1°C.');
          return;
        }

       }
      
      
        if(outputActionSelect.value === 'Select Action' ) {
          alert('Please select a valid output device action.');
          return;
        }

        if(outputSelect.value === 'Select Output Device' ) {
          alert('Please select a valid output device.');
          return;
        }

        if (logicOperatorSelect.value === 'Select Logic') {
          alert('Please select a valid logic operator.');
          return;
        }

        if (ruleName === '') {
          alert('Please enter a valid rule name.');
          return;
      }

      const addRule = () => {
        let rule_key;
        if (currentlyEditingRuleKey) {
          rule_key = currentlyEditingRuleKey;
        } else {
          rule_key = generateRuleKey();
        }


      socket.emit('add_rule', {
        rule_key,
        rule_name: ruleName,
        input_devices: inputDevices,
        logic_operator: logicOperatorSelect.value,
        output_key: outputSelect.value,
        output_action: outputActionSelect.value,
        is_edit: !!currentlyEditingRuleKey
      }, (response) => {
        if (response && response.error) {
          alert(response.error);
          if (currentlyEditingRuleKey) {
            // If an error occurred while editing a rule, restore the original rule.
            ruleData[currentlyEditingRuleKey] = originalRuleData;
          }
        } else {
          if (currentlyEditingRuleKey) {
            delete ruleData[currentlyEditingRuleKey]; // remove the old rule data
          }
          ruleData[rule_key] = {
            rule_name: ruleName,
            input_devices: inputDevices,
            logic_operator: logicOperatorSelect.value,
            output_device_key: outputSelect.value,
            output_device_action: outputActionSelect.value
          };
          updateRuleList();
        
        
        currentlyEditingRuleKey = null;
        originalRuleData = null;

        inputDeviceRows.forEach(row => inputDeviceWrapper.removeChild(row));  // Remove all existing input device rows once when rule is added   
        updateLogicOperatorVisibility() // update logic OperatorVisibility (hide it when the rule is applied and no more devices selected)
        setInputDeviceRowCount(0); // Reset / set input DeviceRow Count to 0

        // Reset the logic operator, output select, and output action select to their default values
        logicOperatorSelect.value = 'Select Logic';
        outputSelect.value = 'Select Output Device';
        outputActionSelect.value = 'Select Action';
        ruleNameInput.value = ""; // Reset the rule name input field

          // Hide the add-rule-container after submitting the form
        addRuleContainer.style.display = 'none';

        //Delete temperature row when the rule is submitted and select default values for option and value
        if (temperatureRow && temperatureRow.parentNode) {
          inputDeviceWrapper.removeChild(temperatureRow);
          temperatureRow.querySelector('.temp-option').value = 'Select Option';
          temperatureRow.querySelector('.temp-value').value = '';
        }
        

        }
      });
    }
    addRule();
});



/* #############################################################################################################################################
This function, updateLockStates(), is responsible for locking or unlocking devices based on whether they are used as output devices in any rules.
- The function starts by creating a Set called outputDeviceKeys to store the output device keys of the rules. 
- It then iterates through the ruleData object to extract each rule and adds the output_device_key of the rule to the outputDeviceKeys set.
- Next, it iterates through the deviceData object to get each device. 
  For each device, it checks if its key is present in the outputDeviceKeys set. If it is, it means that the device is used in a rule and should be locked. The isLocked variable stores this information as a boolean value.
- Finally, it calls the lockDevice function with the device key and the isLocked value. The lockDevice function is responsible for locking or unlocking the device based on the isLocked value.
*/
function updateLockStates() {
  // Create a set to store the output device keys of the rules
  const outputDeviceKeys = new Set();
  // Iterate through the ruleData object to get each rule
  for (const ruleKey in ruleData) {
    const rule = ruleData[ruleKey];
    // Add the output_device_key of each rule to the outputDeviceKeys set
    outputDeviceKeys.add(rule.output_device_key);
  }
 // Iterate through the deviceData object to get each device
  for (const deviceKey in deviceData) {
    // Check if the current deviceKey is present in the outputDeviceKeys set
    // If true, it means the device is used in a rule and should be locked or unlocked
    const isLocked = outputDeviceKeys.has(deviceKey);
   // Call the lockDevice function to lock or unlock the device based on the isLocked value
    lockDevice(deviceKey, isLocked);
  }
}


/* #################################################################### 
function to lock unlock device*/
// Lock device if it is used in rules
function lockDevice(device_key, isLocked) {
// console.log('Device key:', device_key); // Log the device key for debugging purposes
 const deviceInput = document.querySelector(`#${device_key}-input`);           // Select the input element for the device using its unique ID
 const deviceBox = document.querySelector(`.device-box[device-id="${device_key}"]`); // Select the device box element using its device-id attribute
 const existingLockIcon = deviceBox.querySelector('.lock-icon');               // Check if there's an existing lock icon within the deviceBox element

 // If the device input or top element is not found, log a warning and return early
 if (!deviceInput || !deviceBox) {
   //console.warn(`Device with key ${device_key} not found.`);
   return;
 }
 // If the device should be locked (isLocked is true)
 if (isLocked) {
   deviceInput.setAttribute('disabled', 'disabled'); // Disable the device input by setting the 'disabled' attribute
   // If there isn't an existing lock icon, create and add one to the deviceBox
   if (!existingLockIcon) {                          
     const lockIcon = document.createElement('i');
     lockIcon.className = 'lock-icon fa fa-lock';
     deviceBox.appendChild(lockIcon);
   }
 } else {
   //if the device should not be locked (isLocked is false)
   deviceInput.removeAttribute('disabled');  // Remove 'disable' attribute
   if (existingLockIcon) {
     deviceBox.removeChild(existingLockIcon); // If there is existing icon, remove it
   }
 }
}


/*###################################################################
This event listener listens for the 'lock_device' event from the server. 
When this event is received, it will call the lockDevice function with the device_key and isLocked properties from the data object.
The lockDevice function is responsible for updating the lock state of the specified device on the client side.
*/
socket.on('lock_device', (data) => {
 lockDevice(data.device_key, data.isLocked);
});





/*##############################################################################
add event listener to check if name is updated. If the name is updated, update displayed rules in rule list and options in dropdown menu
*/
socket.on("device_name_updated", (data) => {
const deviceKey = data.device_key;
const deviceName = data.device_name;

deviceData[deviceKey].name = deviceName;

updateRuleList();       // Call the updateRuleList function to update the displayed rules when the name is updated
updateDeviceOptions();  //Call the updateDeviceOptions to update the options in dropdown menu when the name is updated
});






/* ################################################################################################
The updateRuleList function is responsible for updating the displayed list of rules on the web page.
It first clears the inner HTML of the ruleList element. 
Then, it iterates through the ruleData object and extracts information about each rule, such as the input devices, logic operator, output device, and output action.
For each rule, it creates a text string that represents the input devices and their options, connected by the logic operator. 
It then creates a list item element, sets its text content to display the rule, and creates a delete button for the rule. 
When the delete button is clicked, it emits the "delete_rule" event with the rule key to delete the rule on the server.
After the rule list is updated, the updateLockStates() function is called to update the lock states of the input devices.
The socket.on("rules_updated") event listener is called when the server sends updated rules data. 
It updates the ruleData object with the new data and calls the updateRuleList() function to update the displayed list of rules.
*/

function updateRuleList() {
ruleList.innerHTML = "";
for (const ruleKey in ruleData) {
  const rule = ruleData[ruleKey];
  const inputDevices = rule.input_devices;
  const logicOperator = rule.logic_operator;
  const output = rule.output_device_key;
  const output_action = rule.output_device_action;
  const ruleName = rule.rule_name;

  function getSensorOptionText(optionValue) { // get option text instead of value 
    switch (optionValue) {
      case 'less':
        return 'less than';
      case 'greater':
        return 'greater than';
      case 'equal':
        return 'equal to';
      default:
        return '';
    }
  }

  function getContactInputText(optionValue){
    switch (optionValue) {
      case '0':
        return 'open';
      case '1':
        return 'closed';
      default:
        return '';
    }
  }


  function getMotionInputText(optionValue){
    switch (optionValue) {
      case '0':
        return 'unoccupied';
      case '1':
        return 'occupied';
      default:
        return '';
    }
  }


  function getDigitalOutputText(actionValue){
    switch (actionValue) {
      case '0':
        return 'OFF';
      case '1':
        return 'ON';
      default:
        return '';
    }
  }


  const listItem = document.createElement("li");
  listItem.classList.add("rule-list-item");
  
  const inputDevicesText = inputDevices.map((inputDevice, index) => {
    const device = deviceData[inputDevice.input_device_key];
    let deviceText = '';
  
    if (device.type === 'digital-input' && device.type1 === 'contact') {
    //  deviceText = `${device.name} is ${inputDevice.input_device_option}`;
    deviceText = `${device.name} is ${getContactInputText(inputDevice.input_device_option)}`;
    } 
        
    else if (device.type === 'digital-input' && device.type1 === 'motion') {
      //  deviceText = `${device.name} is ${inputDevice.input_device_option}`;
      deviceText = `${device.name} is ${getMotionInputText(inputDevice.input_device_option)}`;
      } 
    
    else if (device.type === 'sensor') {
      let sensorText = '';
      if (device.type1 === 'temp') {
        sensorText += `temperature is ${getSensorOptionText(inputDevice.temp_option)} ${inputDevice.temp_value}°C`;
      }
      deviceText = `${device.name} ${sensorText}`;
    }
  
    return index === 0 ? `If ${deviceText}` : `If ${deviceText}`;
  }).join(` ${logicOperator} <br> `);
  
  const ruleNameElement = document.createElement("div");
  ruleNameElement.textContent = `Rule Name: ${ruleName}`;
  listItem.appendChild(ruleNameElement);
  
  const inputDevicesElement = document.createElement("div");
  inputDevicesElement.innerHTML = inputDevicesText;
  listItem.appendChild(inputDevicesElement);
  
  const outputDeviceElement = document.createElement("div");
  //outputDeviceElement.textContent = `then ${deviceData[output].name} is ${output_action}`;
  outputDeviceElement.textContent = `then ${deviceData[output].name} is ${getDigitalOutputText(output_action)}`;
  listItem.appendChild(outputDeviceElement);

  // Create a container for the buttons
  const ruleButtonContainer = document.createElement("div");
  ruleButtonContainer.classList.add("rule-button-container"); // You can style this class for positioning and spacing of the buttons
  
  
  const deleteRuleButton = document.createElement("button");
  deleteRuleButton.classList.add("delete-rule-button");
  deleteRuleButton.textContent = "Delete";
  deleteRuleButton.dataset.ruleKey = ruleKey;
  deleteRuleButton.addEventListener("click", () => {
    socket.emit("delete_rule", { rule_key: ruleKey });

  });
  ruleButtonContainer.appendChild(deleteRuleButton);
  
  // Create Edit Button
  const editRuleButton = document.createElement("button");
  editRuleButton.classList.add("edit-rule-button");
  editRuleButton.textContent = "Edit";
  editRuleButton.dataset.ruleKey = ruleKey;
  editRuleButton.addEventListener("click", () => {
      startEditingRule(ruleKey);                        
  });
  ruleButtonContainer.appendChild(editRuleButton);
  
  
  listItem.appendChild(ruleButtonContainer);
  ruleList.appendChild(listItem);

}
updateLockStates();
}


// Call this function to add event listeners to the newly added edit buttons
function addEditButtonEventListeners() {
const editRuleButtons = document.querySelectorAll(".edit-rule-button");
editRuleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const ruleKey = button.dataset.ruleKey; 
        startEditingRule(ruleKey);
    });
});
}

// Call the function after updating the group list
updateRuleList();
addEditButtonEventListeners();




/* ###########start Editing Rule function##############
1. Preparation: The function starts by preparing the environment for editing. This includes removing all the existing input device rows from the UI and resetting the input device count to zero. The currentlyEditingRuleKey is set with the provided ruleKey.
2. Rule Selection: The function selects the rule to be edited based on the provided ruleKey and sets the rule name in the UI input field.
3. Wait DOM Update: A helper function is defined to create a delay that allows the DOM to update. This is used later in the function to ensure that UI elements have been created or updated before the script continues.
4. Input Devices Setup: The function iterates over the input devices defined in the rule. For each device, a new row is added to the UI, and the device is selected in the dropdown. If the selected device is of type 'digital-input' and subtype 'contact' or 'motion', the relevant options are populated and selected. If the selected device is of type 'sensor' and subtype 'temp', the temperature-related fields are populated and selected.
5. Logic Operator Setup: The function sets the logic operator for the rule in the UI.
6. Output Devices Setup: The function sets the output device and the associated action for the rule in the UI.
7. Lock State Update: The lock state of the UI elements is updated to ensure that the user can only interact with the appropriate elements.
8. Show Rule Editing Container: Finally, the container for editing the rule is displayed to the user.
*/



async function startEditingRule(ruleKey) {

const temperatureRows = document.querySelectorAll('.temperature-row');
temperatureRows.forEach(row => inputDeviceWrapper.removeChild(row));

const existingInputDeviceRows = document.querySelectorAll('.input-device-row');
existingInputDeviceRows.forEach(row => inputDeviceWrapper.removeChild(row));

setInputDeviceRowCount(0); // Reset / set input DeviceRow Count to 0
/*
  // If there is a currently editing rule, show its delete button again
  if (currentlyEditingRuleKey) {
    const previousDeleteRuleButton = document.querySelector(`.delete-rule-button[data-rule-key="${currentlyEditingRuleKey}"]`);
    if(previousDeleteRuleButton) {
        previousDeleteRuleButton.style.display = 'block';
    }
  }
  */
  // Update the currently editing rule key
  currentlyEditingRuleKey = ruleKey;
  
  /*
  // Hide the delete button of the currently editing rule
  const deleteRuleButton = document.querySelector(`.delete-rule-button[data-rule-key="${ruleKey}"]`);
  if(deleteRuleButton) {
      deleteRuleButton.style.display = 'none';
  }
*/
const rule = ruleData[ruleKey];
ruleNameInput.value = rule.rule_name;


// Create input device rows for each input device in the rule
for (const inputDevice of rule.input_devices) {
  const inputDeviceRowAdded = addInputDeviceRow();
  if (inputDeviceRowAdded) {
    const inputDeviceRow = document.querySelector('.input-device-row:last-child');
    const inputDeviceSelect = inputDeviceRow.querySelector('.input-device-select');
    inputDeviceSelect.value = inputDevice.input_device_key;

    // Dispatch the change event to create the options and await its finish
    const changeEvent = new Event('change');
    let resolveChange;
    const onChange = new Promise(resolve => resolveChange = resolve);
    inputDeviceSelect.addEventListener('change', () => resolveChange(), { once: true });
    inputDeviceSelect.dispatchEvent(changeEvent);
    await onChange;

    // Check the device type and create the input device options accordingly
    const selectedDevice = deviceData[inputDevice.input_device_key];

    if (selectedDevice) {
      if (selectedDevice.type === 'digital-input') {
        const inputDeviceOptionInput = inputDeviceRow.querySelector('.input-device-option');
        if (inputDeviceOptionInput) {
          // Then set the selected option value based on the rule data
          inputDeviceOptionInput.value = inputDevice.input_device_option;
        }
      }

      if (selectedDevice.type === 'sensor' && selectedDevice.type1 === 'temp') {
        // We give the event loop a chance to update the DOM by delaying the execution
        setTimeout(() => {
          const temperatureRow = inputDeviceRow.parentNode.querySelector('.temperature-row');
          if (temperatureRow) {
            const tempOptionInput = temperatureRow.querySelector('.temp-option');
            const tempValueInput = temperatureRow.querySelector('.temp-value');
            if (tempOptionInput && tempValueInput) {
              // Set the selected option value based on the rule data
              tempOptionInput.value = inputDevice.temp_option;
              tempValueInput.value = inputDevice.temp_value;
            }
          }
        }, 0);
      }
    }
  }
}


// Logic operator
const logicOperatorSelect = document.getElementById('logic-operator-select');
logicOperatorSelect.value = rule.logic_operator;

// Output device
const outputSelect = document.querySelector('.output-select');
outputSelect.value = rule.output_device_key;

const outputActionSelect = document.querySelector('.output-action-select');
outputActionSelect.value = rule.output_device_action;

updateLockStates();

// Show the add-rule-container so the user can edit the rule.
addRuleContainer.style.display = 'block';
}






// Load the current rules and display them
socket.on("rules_updated", (rules) => {
ruleData = rules; // Update the ruleData object with the new data
//addRuleContainer.style.display = 'none'; //hide ADD Rule container once when rule is added/deleted.
updateRuleList();
});





/* ##########################################################################################################
This event listener is added to the "Add Input Device" button (which has a CSS class of custom-add-input-device-button). 
When the button is clicked, the event listener will prevent the default action of the button click (using event.preventDefault()). 
Then, it will call the addInputDeviceRow() function, which is responsible for adding a new input device row to the form.
*/
document.querySelector("button.custom-add-input-device-button").addEventListener("click", (event) => {
event.preventDefault();

// Check if a row was added
if (!addInputDeviceRow()) {
  alert("No more devices available!");
}
});


});

