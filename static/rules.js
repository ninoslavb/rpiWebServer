  // DOM elements
  const addRuleForm = document.getElementById("add-rule-form");
  const inputSelect = document.getElementById("input");
  const outputSelect = document.getElementById("output");
  const inputStateSelect = document.getElementById("input_option");
  const outputActionSelect = document.getElementById("output_action");
  const ruleList = document.getElementById("rule-list");
  
  // Function to update device options in the form
  function updateDeviceOptions() {
    // Clear the current options
    inputSelect.innerHTML         = "";
    outputSelect.innerHTML        = "";
    inputStateSelect.innerHTML    = "";
    outputActionSelect.innerHTML  = "";
  
    // Rebuild the options with the updated device names
    for (const deviceKey in deviceData) {
      const device = deviceData[deviceKey];
      const optionDevice = document.createElement("option");
      optionDevice.value = deviceKey;
      optionDevice.textContent = device.name;
      // Add options for input and output devices
      if (device.type === "input") {
        inputSelect.appendChild(optionDevice.cloneNode(true));
      } else if (device.type === "output") {
        outputSelect.appendChild(optionDevice.cloneNode(true));
      }
    }
  
    // Add input state options
    for (const state of [0, 1]) {
      const optionInputState = document.createElement("option");
      optionInputState.value = state;
      optionInputState.textContent = state;
  
      inputStateSelect.appendChild(optionInputState);
    }
  
    // Add output action options
    for (const action of [0, 1]) {
      const optionOutputAction = document.createElement("option");
      optionOutputAction.value = action;
      optionOutputAction.textContent = action;
  
      outputActionSelect.appendChild(optionOutputAction);
    }
  }
  
  const socket = io();
  
  // Add an event listener for the form submission
  addRuleForm.addEventListener("submit", (event) => {
      event.preventDefault();
    
      // Send the form data to the server
      socket.emit('add_rule', {
        rule_key: `${inputSelect.value}-${outputSelect.value}`,
        input_key: inputSelect.value,
        output_key: outputSelect.value,
        input_option: inputStateSelect.value,
        output_action: outputActionSelect.value
      }, (response) => {
        if (response === 'error') { //handle the server response
          alert("Rule already exists for these devices!"); //show an error message if the rule already exists for these devices
        } else {
          // Update the ruleData object with the new rule
            ruleData[`${inputSelect.value}-${outputSelect.value}`] = {
            input_device_key: inputSelect.value,
            output_device_key: outputSelect.value,
            input_device_option: inputStateSelect.value,
            output_device_action: outputActionSelect.value
          };
          updateRuleList(); // Update the rule list displayed on the page
        }
      });
  });

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
      // If true, it means the device is used in a rule and should be locked
      const isLocked = outputDeviceKeys.has(deviceKey);
     // Call the lockDevice function to lock or unlock the device based on the isLocked value
      lockDevice(deviceKey, isLocked);
    }
  }
  


//check if device name is updated to update it in rules sector
socket.on("device_name_updated", (data) => {
  const deviceKey = data.device_key;
  const deviceName = data.device_name;

  deviceData[deviceKey].name = deviceName;

  updateRuleList();       // Call the updateRuleList function to update the displayed rules when the name is updated
  updateDeviceOptions();  //Call the updateDeviceOptions to update the options in dropdown menu when the name is updated
});

// FUnction to update the list of current rules
function updateRuleList() {
  ruleList.innerHTML = "";
  for (const ruleKey in ruleData) {
    const rule = ruleData[ruleKey];
    const input = rule.input_device_key;
    const output = rule.output_device_key;
    const input_option = rule.input_device_option;
    const output_action = rule.output_device_action;

    //list the rule with input device name, input option, output device name, output option
    const listItem = document.createElement("li");
    listItem.textContent = `If ${deviceData[input].name} is ${input_option}, then ${deviceData[output].name} is ${output_action}`;

    // Add a delete button for each rule
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      socket.emit("delete_rule", { rule_key: ruleKey });
    });

    listItem.appendChild(deleteButton);
    ruleList.appendChild(listItem);
  }
  updateLockStates();
}


// Load the current rules and display them
socket.on("rules_updated", (rules) => {
  ruleData = rules; // Update the ruleData object with the new data
  updateRuleList();
});



// Lock device if it is used in rules
function lockDevice(device_key, isLocked) {
 // console.log('Device key:', device_key); // Log the device key for debugging purposes
  const deviceInput = document.querySelector(`#${device_key}-input`);           // Select the input element for the device using its unique ID
  const box_id = deviceData[device_key].box_id;                                 // Get the box_id of the device from the deviceData object
  const deviceBox = document.querySelector(`.device-box[data-id="${box_id}"]`); // Select the device box element using its data-id attribute
  const existingLockIcon = deviceBox.querySelector('.lock-icon');               // Check if there's an existing lock icon within the deviceBox element

  // If the device input or box is not found, log a warning and return early
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



socket.on('lock_device', (data) => {
  lockDevice(data.device_key, data.isLocked);
});
