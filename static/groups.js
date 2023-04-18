
document.addEventListener('DOMContentLoaded', () => {
    
  const socket = io();
  
  //container for adding group name        
  const groupNameContainer = document.getElementById("group-name-container");
  const input = document.createElement("input");
  input.className = "group-input";
  input.type = "text";
  input.placeholder = "Enter name";
  input.id = "new-group-name";
  groupNameContainer.appendChild(input);
          
  
  
   
    const addNewGroupButton = document.getElementById('add-new-group-button');
    const addGroupContainer = document.getElementById('add-group-container');
  
    // Show/hide the add-rule-container when the "ADD NEW GROUP" button is clicked
    addNewGroupButton.addEventListener('click', () => {
      addGroupContainer.style.display = addGroupContainer.style.display === 'none' ? 'block' : 'none';
    });
  
  
  /* 
  The addDeviceRow function creates a new device row with a dropdown for selecting device for the group.
  It also adds a remove button to delete the device row.
  The updateGroupDeviceOptions function disables device options that are already selected in other dropdowns. 
  This is done by first collecting all the selected devices in a set and then looping through all the device selects and disabling the options that are already selected.
  The event listener at the end of the code listens for changes in device
  */
  let DeviceRowCount = 0;
  
  //add group ROW
  function addDeviceRow() {
      const groupWrapper = document.getElementById('groupWrapper');
      const DeviceRow = document.createElement('div');
      DeviceRow.classList.add('group-device-row');
    
    
      // Check if the number of rows is equal to the number of devices available
      const DeviceCount = Object.values(deviceData).length;
      if (DeviceRowCount >= DeviceCount) {
        return false; // Row was not added
      }
    
      // Create a dropdown to select device
      const DeviceSelect = document.createElement('select');
      DeviceSelect.classList.add('device-select');
      DeviceSelect.innerHTML = `<option disabled selected class="placeholder-option">Select Device</option>`;
      for (const deviceKey in deviceData) {
        const device = deviceData[deviceKey];
        const optionDevice = document.createElement("option");
        optionDevice.value = deviceKey;
        optionDevice.textContent = device.name;
        DeviceSelect.appendChild(optionDevice);
      
      }
      // Add an event listener to call updateGroupDeviceOptions when the selected device changes
      /*when you select a device from the dropdown menu, the updateGroupDeviceOptions() function will be called, 
      and the selected device will be disabled in the other dropdown menus. */
    DeviceSelect.addEventListener('change', () => {
    updateGroupDeviceOptions();
    });
  
  
      DeviceRow.appendChild(DeviceSelect);
    
  
      // Create a remove button to delete the row
      const removeRowButton = document.createElement('button');
      removeRowButton.type = 'button';
      removeRowButton.textContent = 'Remove';
      removeRowButton.classList.add('btn', 'btn-sm', 'custom-delete-device-button');
      removeRowButton.addEventListener('click', () => {
      groupWrapper.removeChild(DeviceRow);
        updateGroupDeviceOptions();
    
      // Decrement the DeviceRowCount since a row was removed
      DeviceRowCount--;
      });
      DeviceRow.appendChild(removeRowButton);
  
    
      // Add the device row to the groupWrapper and update the input device options
      groupWrapper.appendChild(DeviceRow);
      updateGroupDeviceOptions();
    
      // Increment the DeviceRowCount since a row was added
      DeviceRowCount++;
      return true; // Row was added
    }
  
  
  
    
  
  
    /* ###########################################################################################
   This function updates options to disable the options that are already selected
  */
  function updateGroupDeviceOptions() {
      const selectedGroupDevices = new Set();
      const DeviceSelectElements = document.getElementsByClassName('device-select');
    
      // Loop through all input device selects and add their values to the selectedInputDevices set
      for (const selectElement of DeviceSelectElements) {
        if (selectElement.value !== "") {
          selectedGroupDevices.add(selectElement.value);
        }
      }
    
      // Loop through all device selects and disable the options that are already selected
    for (const selectElement of DeviceSelectElements) {
      for (const optionElement of selectElement.options) {
        // Check if the optionElement has the custom class
        const isPlaceholder = optionElement.classList.contains("placeholder-option");
    
        if (!isPlaceholder && optionElement.value !== "" && selectedGroupDevices.has(optionElement.value)) {
          optionElement.disabled = selectElement.value !== optionElement.value;
        } else {
          optionElement.disabled = isPlaceholder;
        }
      }
    }
  }
  
  
  
    /*##############################################################################################################################
    This function updates the options in all device selects by first querying all elements with the class 'device-select'.
    Then, for each device select element, it stores the current value, resets its inner HTML, and repopulates it with the updated devices. 
    Finally, it restores the original value of the select element. 
    This function is used when we want to update the device options, for example, when a new device is added or when device name is updated
    */
    function updateListDeviceOptions() {
      // Query all elements with the class 'device-select'
      const DeviceSelects = document.querySelectorAll('.device-select');
  
    
      DeviceSelects.forEach((DeviceSelect) => {   // Iterate through each input device select element
        const currentValue = DeviceSelect.value;       // Store the current value of the select element
        DeviceSelect.innerHTML = `<option disabled selected>Select Device</option>`; // Reset the inner HTML of the select element, keeping only the disabled option
        //inputDeviceOption.innerHTML = `<option disabled selected>Select State</option>`; // Reset the inner HTML of the select element, keeping only the disabled option
        for (const deviceKey in deviceData) {                 // Iterate through the deviceData object
          const device = deviceData[deviceKey];             
          const optionDevice = document.createElement("option"); // Create a new option element for the input device
          optionDevice.value = deviceKey;
          optionDevice.textContent = device.name;
          DeviceSelect.appendChild(optionDevice);          // Add the new option element to the select elemement
          
        }
        DeviceSelect.value = currentValue;                   // Restore the original value of the select element
      });
       }
    
  
       
   /*##############################################################################
   Add event listener to check if name is updated. If the name is updated, update displayed groups in group list and options in dropdown menu */
  socket.on("device_name_updated", (data) => {
      const deviceKey = data.device_key;
      const deviceName = data.device_name;
          
      deviceData[deviceKey].name = deviceName;
          
      updateGroupList();       // Call the updateRuleList function to update the displayed rules when the name is updated
      updateListDeviceOptions();  //Call the updateDeviceOptions to update the options in dropdown menu when the name is updated
  });
  
  
  
  
   /* 
    ####################################################################################################################################################################################
    The following code is an event listener for the form submission. When the form is submitted, it prevents the default form submission behavior and processes the form data as follows:
   --> It selects all input device and creates an array of devices, where each device object contains the selected device key .
   --> It creates a rule key by combining all device keys 
   --> It sends the form data to the server using the 'add_group' event via the socket connection.
   -->The server responds with either 'error' or 'success'. If there is an error, it alerts the user that particular device is already assigned ot another group
    If the response is successful, it updates the groupData object and calls the updateGroupList() function to update the list of groups displayed on the page.
    After the group is successfully added, it removes all existing device rows from the form, allowing the user to start fresh when adding a new rule.
    */
      const addGroupForm = document.getElementById("add-group-form");
  
       addGroupForm.addEventListener("submit", (event) => {
          //console.log('Form submit event triggered');
          event.preventDefault();
        
                // Get the selected input devices from group device rows
                const groupDeviceRows = document.querySelectorAll('.group-device-row');
                const groupDevices = Array.from(groupDeviceRows).map((row) => ({
                  group_device_key: row.querySelector('.device-select').value
                }));
                const groupNameInput = document.getElementById("new-group-name");
                const groupName = groupNameInput.value;
  
                // Validation check: If no devices are selected, show an alert and return early
                if (groupDevices.length === 0) {
                 alert('Please add at least one device to the group.');
                return;
                }
      
              // Validation check: If device is not selected from the dropdown, show an alert and return early
              for (const groupDevice of groupDevices) {
                if (groupDevice.group_device_key === 'Select Device') {
                  alert('Please select a valid  device.');
                  return;
                }
              }
              if (groupName === '') {
                  alert('Please enter a valid group name.');
                  return;
              }
  
              // Create a rule key by combining all device keys 
              const group_key = groupDevices.map((groupDevice) => groupDevice.group_device_key).join('-');
      
  
              socket.emit('add_group', {
                group_key,
                group_name: groupName,
                group_devices: groupDevices
              }, (response) => {
                 // console.log('Response from server', response);
                  if (response && response.error) {
                      alert(response.error);
                  } else {
                      groupData[group_key] = {
                          group_name: groupName,
                          group_devices: groupDevices
                      };
    
                  updateSidebarGroupLinks();
                  updateGroupList();
                  // Remove all existing device rows once group is added
                groupDeviceRows.forEach(row => groupWrapper.removeChild(row));  
                DeviceRowCount = 0; // Reset / set input DeviceRow Count to 0
                 groupNameInput.value = ""; // Reset the group name input field
  
                  // Hide the add-rule-container after submitting the form
                addGroupContainer.style.display = 'none';
                
                }
              });
        });
  
  
  /* ################################################################################################
  The updateGroupList function is responsible for updating the displayed list of groups on the web page.
  It first clears the inner HTML of the ruleList element. 
  Then, it iterates through the groupData object and extracts information about each group, such as the group devices and group name.
  For each group, it creates a text string that represents devices in the list separated with ",". 
  It then creates a list item element, sets its text content to display the group, and creates a delete button for the group. 
  When the delete button is clicked, it emits the "delete_group" event with the group key to delete the group on the server.
  */
        const groupList = document.getElementById("group-list");
  
        function updateGroupList() {
          groupList.innerHTML = "";
          for (const groupKey in groupData) {
            const group = groupData[groupKey];
            const groupDevices = group.group_devices;
            const groupName = group.group_name;
        
            const DevicesText = groupDevices.map((groupDevice) => deviceData[groupDevice.group_device_key].name).join(', ');
        
            const listItem = document.createElement("li");
            listItem.classList.add("group-list-item");
        
            // Create separate elements for group name, devices, and delete button
            const groupNameElement = document.createElement("div");
            groupNameElement.textContent = `Group Name: ${groupName}`;
            listItem.appendChild(groupNameElement);
        
            const groupDevicesElement = document.createElement("div");
            groupDevicesElement.textContent = `Devices: ${DevicesText}`;
            listItem.appendChild(groupDevicesElement);
        
            const deleteGroupButton = document.createElement("button");
            deleteGroupButton.classList.add("delete-group-button");
            deleteGroupButton.textContent = "Delete";
            deleteGroupButton.addEventListener("click", () => {
              socket.emit("delete_group", { group_key: groupKey });
            });
            listItem.appendChild(deleteGroupButton);
        
            groupList.appendChild(listItem);
          }
        }
        
  
  
  
  /*
  This function populates sidebar list of added groups. When the user clicks on the group name it will navigate to the dashboard, but hide all devices except devices that are
  assigned to the group. Since navigate() function includes the part where we check if the pageId='dashboard' and title = 'Dashboard' it will repopulate the page with all devices back again
  once when Dashboard button is clicked
  */
  
  // Update the sidebar with group links
  function updateSidebarGroupLinks() {
    const groupSidebarList = document.getElementById("group-sidebar-list");
    groupSidebarList.innerHTML = "";
  
    for (const groupKey in groupData) {
      const group = groupData[groupKey];
      const groupName = group.group_name;
  
      //create list and list button with the name of the group in it
      const groupLinkLi = document.createElement("li");
     // groupLinkLi.classList.add("group-li");
      const groupLink = document.createElement("button");
      groupLink.classList.add("group-button");
      groupLink.textContent = groupName;
      groupLink.dataset.groupKey = groupKey;
     
      groupLink.addEventListener("click", () => {
        
        // Hide all devices
        const allDevices = document.querySelectorAll(".device-box");
        allDevices.forEach((device) => {
          device.style.display = "none";
        });
  
        // Show only devices belonging to the clicked group
        const groupDevices = group.group_devices;
        groupDevices.forEach((groupDevice) => {
          const deviceKey = groupDevice.group_device_key;
          const deviceElement = document.querySelector(`[device-id='${deviceKey}']`);
          if (deviceElement) {
            deviceElement.style.display = "block";
          }
        });
  
      // set the data-group-key attribute for the group and save the sort order
      const deviceContainer = document.querySelector('.device-container');
      deviceContainer.setAttribute('data-group-key', groupKey);
      const newOrder = sortable.options.store.get(sortable);
      sortable.sort(newOrder);
        // Navigate to the dashboard but with changed name to the groupName and hidden all elements except the elements from the group
       navigate('dashboard', groupName);
       toggleSidebar(); // toggle the sidebar when the group is selected
 

      });
  
      groupLinkLi.appendChild(groupLink);
      groupSidebarList.appendChild(groupLinkLi);
    }
  }
  
  // Call the function to initially populate the sidebar
  updateSidebarGroupLinks();
  
        
  
  /*##########################################################################################################################
  The socket.on("groups_updated") event listener is called when the server sends updated groups data. 
  It updates the groupData object with the new data and calls the updateGroupList( function to update the displayed list of rules.
  */
  
        // Load the current groups and display them
        socket.on("groups_updated", (groups) => {
          groupData = groups; // Update the groupData object with the new data
          updateSidebarGroupLinks();
          updateGroupList(); // update group list in Groups page
        });
        
  
  
  /* ##########################################################################################################
  This event listener is added to the "Add Device to Group" button . 
  When the button is clicked, the event listener will prevent the default action of the button click (using event.preventDefault()). 
  Then, it will call the addDeviceRow() function, which is responsible for adding a new input device row to the form.
  */
  document.querySelector("button.custom-add-device-to-group-button").addEventListener("click", (event) => {
      event.preventDefault();
      
      // Check if a row was added
      if (!addDeviceRow()) {
        alert("No more devices available!");
      }
    });
  
  
  });