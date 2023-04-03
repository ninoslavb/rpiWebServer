const addRuleForm = document.getElementById("add-rule-form");
const inputSelect = document.getElementById("input");
const outputSelect = document.getElementById("output");
const ruleList = document.getElementById("rule-list");

function updateDeviceOptions() {
    // Clear the current options
    inputSelect.innerHTML = "";
    outputSelect.innerHTML = "";
  
    // Rebuild the options with the updated device names
    for (const deviceKey in deviceData) {
      const device = deviceData[deviceKey];
      const option = document.createElement("option");
      option.value = deviceKey;
      option.textContent = device.name;
  
      if (device.type === "input") {
        inputSelect.appendChild(option.cloneNode(true));
      } else if (device.type === "output") {
        outputSelect.appendChild(option.cloneNode(true));
      }
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
      output_key: outputSelect.value
    }, (response) => {
      if (response === 'error') {
        alert("Rule already exists.");
      } else {
        // Update the ruleData object with the new rule
        ruleData[`${inputSelect.value}-${outputSelect.value}`] = {
          input_device_key: inputSelect.value,
          output_device_key: outputSelect.value
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
function updateRuleList() {
  ruleList.innerHTML = "";
  for (const ruleKey in ruleData) {
    const rule = ruleData[ruleKey];
    const input = rule.input_device_key;
    const output = rule.output_device_key;

    const listItem = document.createElement("li");
    listItem.textContent = `${deviceData[input].name} -> ${deviceData[output].name}`;

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
