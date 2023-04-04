  const addRuleForm = document.getElementById("add-rule-form");
  const inputSelect = document.getElementById("input");
  const outputSelect = document.getElementById("output");
  const inputStateSelect = document.getElementById("input_option");
  const outputActionSelect = document.getElementById("output_action");
  const ruleList = document.getElementById("rule-list");
  
  function updateDeviceOptions() {
    // Clear the current options
    inputSelect.innerHTML = "";
    outputSelect.innerHTML = "";
    inputStateSelect.innerHTML = "";
    outputActionSelect.innerHTML = "";
  
    // Rebuild the options with the updated device names
    for (const deviceKey in deviceData) {
      const device = deviceData[deviceKey];
      const optionDevice = document.createElement("option");
      optionDevice.value = deviceKey;
      optionDevice.textContent = device.name;
  
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
        if (response === 'error') {
          alert("Rule already exists for these devices!");
        } else {
          // Update the ruleData object with the new rule
          ruleData[`${inputSelect.value}-${outputSelect.value}`] = {
            input_device_key: inputSelect.value,
            output_device_key: outputSelect.value,
            input_device_option: inputStateSelect.value,
            output_device_action: outputActionSelect.value
          };
          updateRuleList();
        }
      });
    });
    
  

socket.on("device_name_updated", (data) => {
  const deviceKey = data.device_key;
  const deviceName = data.device_name;

  deviceData[deviceKey].name = deviceName;

  updateRuleList(); // Call the updateRuleList function to update the displayed rules when the name is updated
  updateDeviceOptions(); //Call the updateDeviceOptions to update the options in dropdown menu when the name is updated
});

// Update the function to display the updated rule list
// Update the function to display the updated rule list
function updateRuleList() {
  ruleList.innerHTML = "";
  for (const ruleKey in ruleData) {
    const rule = ruleData[ruleKey];
    const input = rule.input_device_key;
    const output = rule.output_device_key;
    const input_option = rule.input_device_option;
    const output_action = rule.output_device_action;

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
}


// Load the current rules and display them
socket.on("rules_updated", (rules) => {
  ruleData = rules; // Update the ruleData object with the new data
  updateRuleList();
});
