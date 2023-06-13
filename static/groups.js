
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
const groupNameInput = document.getElementById("new-group-name");

//function to reset add group form (we use it everytime when ADD GROUP is clicked)
function resetAddGroupForm() {
  const groupDeviceRows = document.querySelectorAll('.group-device-row');
  groupDeviceRows.forEach(row => groupWrapper.removeChild(row));
  DeviceRowCount = 0;
  groupNameInput.value = "";
  addGroupContainer.style.display = 'none';
}

// Show/hide the add-group-container when the "ADD NEW GROUP" button is clicked
addNewGroupButton.addEventListener('click', () => {
  if (addGroupContainer.style.display === 'none') {
    resetAddGroupForm();
    addGroupContainer.style.display = 'block';
  } else {
    addGroupContainer.style.display = 'none';
  }
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
  
  
  window.updateGroupDeviceOptions = updateGroupDeviceOptions;

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
      updateListDeviceOptions();  //Call the updateListDeviceOptions to update the options in dropdown menu when the name is updated
  });
  
  
  
  
/* 
####################################################################################################################################################################################
The following code is an event listener for the form submission. When the form is submitted, it prevents the default form submission behavior and processes the form data as follows:

--> It selects all input devices and creates an array of devices, where each device object contains the selected device key.

--> It then performs a series of validations:
    - If no devices are selected, an alert is shown to the user and the function returns early.
    - If any of the devices are not properly selected from the dropdown (e.g., 'Select Device'), an alert is shown and the function returns early.
    - If the group name is empty, an alert is shown and the function returns early.

--> It then defines a function addGroup, which performs the following tasks:
    - It creates a group key based on whether the group is currently being edited or a new group is being added. In the latter case, a pseudo-random group key is generated.
    - It emits the 'add_group' event, sending the form data to the server using the socket connection.
    - The server responds with either an 'error' or a successful response. If there is an error, it alerts the user about the issue (e.g., a device is already assigned to another group).
    - If the response is successful, it updates the groupData object, removes the old group data if any, and calls the updateGroupList() and updateSidebarGroupLinks() functions to update the list of groups displayed on the page.
    - It then removes all existing device rows from the form, resets the group name input field, and hides the addGroupContainer, allowing the user to start fresh when adding a new group or editing an existing one.

--> Finally, it calls the addGroup function to process the form data and add or update the group.
*/

const addGroupForm = document.getElementById("add-group-form");

let originalGroupData = null;
let currentlyEditingGroupKey = null;

// Function to generate a pseudo-random group key.
function generateGroupKey() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

addGroupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Get all delete and edit buttons
 // const deleteButtons = document.querySelectorAll(".delete-group-button");
  //const editButtons = document.querySelectorAll(".edit-group-button");
  const groupDeviceRows = document.querySelectorAll('.group-device-row');
  const groupDevices = Array.from(groupDeviceRows).map((row) => ({
    group_device_key: row.querySelector('.device-select').value
  }));

  const groupName = groupNameInput.value;

  if (groupDevices.length === 0) {
    alert('Please add at least one device to the group.');
    return;
  }

  for (const groupDevice of groupDevices) {
    if (groupDevice.group_device_key === 'Select Device') {
      alert('Please select a valid device.');
      return;
    }
  }

  if (groupName === '') {
    alert('Please enter a valid group name.');
    return;
  }

  const addGroup = () => {
    let groupKey;
    if (currentlyEditingGroupKey) {
      groupKey = currentlyEditingGroupKey;
    } else {
      groupKey = generateGroupKey();
    }

    // Log event data
    console.log(`Emitting add_group event with data: ${JSON.stringify({
      group_key: groupKey,
      group_name: groupName,
      group_devices: groupDevices,
      is_edit: !!currentlyEditingGroupKey
    })}`);

    socket.emit('add_group', {
      group_key: groupKey,
      group_name: groupName,
      group_devices: groupDevices,
      is_edit: !!currentlyEditingGroupKey
    }, (response) => {
      if (response && response.error) {
        alert(response.error);
        if (currentlyEditingGroupKey) {
          // If an error occurred while editing a group, restore the original group.
          groupData[currentlyEditingGroupKey] = originalGroupData;
        }
      } else {
        groupData[groupKey] = {
          group_name: groupName,
          group_devices: groupDevices
        };


        currentlyEditingGroupKey = null;
        originalGroupData = null;

        updateSidebarGroupLinks();
        updateGroupList();
        groupDeviceRows.forEach(row => groupWrapper.removeChild(row));
        DeviceRowCount = 0; // Reset / set input DeviceRow Count to 0
        groupNameInput.value = ""; // Reset the group name input field

        addGroupContainer.style.display = 'none';
      }
    });
  }

  addGroup();
});


    
  
  
/*
################################################################################################
The updateGroupList function is responsible for updating the displayed list of groups on the web page.

--> It first clears the inner HTML of the groupList element. 
--> Then, it iterates through the groupData object and extracts information about each group, such as the group devices and group name.
--> For each group, it creates a text string that represents the devices in the list separated with ",". 
--> It then creates a list item element, and adds separate div elements for the group name and group devices, displaying the relevant information.
--> Within each list item, it creates a container for the buttons and adds two buttons - 'Delete' and 'Edit'.
   - When the delete button is clicked, it emits the "delete_group" event with the group key to delete the group on the server.
   - The edit button is assigned a dataset attribute with the group key. When the edit button is clicked, it calls the startEditingGroup function with the group key as argument.
--> The list item, with all its child elements, is then appended to the groupList.

The addEditButtonEventListeners function adds 'click' event listeners to all the 'edit-group-button' elements in the document.
When the edit button is clicked, it calls the startEditingGroup function with the group key as argument.
This function is called after updating the group list.
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
        
            // Create a container for the buttons
            const groupButtonContainer = document.createElement("div");
            groupButtonContainer.classList.add("group-button-container"); // You can style this class for positioning and spacing of the buttons

            // Create Delete Button
            const deleteGroupButton = document.createElement("button");
            deleteGroupButton.classList.add("delete-group-button");
            deleteGroupButton.textContent = "Delete";
            deleteGroupButton.dataset.groupKey = groupKey;
            deleteGroupButton.addEventListener("click", () => {
                socket.emit("delete_group", { group_key: groupKey });
            });
            groupButtonContainer.appendChild(deleteGroupButton);

            // Create Edit Button
            const editGroupButton = document.createElement("button");
            editGroupButton.classList.add("edit-group-button");
            editGroupButton.textContent = "Edit";
            editGroupButton.dataset.groupKey = groupKey;
            editGroupButton.addEventListener("click", () => {
                startEditingGroup(groupKey);
            });
            groupButtonContainer.appendChild(editGroupButton);

            // Append the button container to the list item
            listItem.appendChild(groupButtonContainer);

            groupList.appendChild(listItem);

          }
        }
        
  
          // Call this function to add event listeners to the newly added edit buttons
        function addEditButtonEventListeners() {
          const editGroupButtons = document.querySelectorAll(".edit-group-button");
          editGroupButtons.forEach(button => {
              button.addEventListener('click', () => {
                  const groupKey = button.dataset.groupKey; 
                  startEditingGroup(groupKey);
              });
          });
        }

        // Call the function after updating the group list
        updateGroupList();
        addEditButtonEventListeners();



      /*
        ################################################################################################
        The startEditingGroup function is responsible for initiating the group editing process on the web page.

        --> It first sets the currentlyEditingGroupKey to the groupKey passed as argument.
        --> It fetches the group data from the groupData object using the group key.
        --> It populates the groupNameInput field with the group name from the group data.
        --> It selects all the '.device-select' elements in the document and stores them in an array.
        --> If the number of device select elements is less than the number of devices in the group, it adds additional device select elements by calling the addDeviceRow function.
        --> It then iterates through the devices in the group and sets the value of each device select element to the corresponding group device key from the group data.
        --> Finally, it displays the addGroupContainer so the user can see and edit the group data.
        */

        function startEditingGroup(groupKey) {

          // Remove all existing device rows
          const deviceRows = Array.from(document.querySelectorAll('.group-device-row'));
          deviceRows.forEach(row => groupWrapper.removeChild(row));
          DeviceRowCount = 0;
       
          currentlyEditingGroupKey = groupKey;
        
          const group = groupData[groupKey];
          groupNameInput.value = group.group_name;
          
          // Populate the device selects with the devices from the group.
          let deviceSelects = Array.from(document.querySelectorAll('.device-select'));
          
          // Check if the number of device selects is less than the number of devices in the group
          if (deviceSelects.length < group.group_devices.length) {
            // If yes, add more device select input fields to match the number of devices in the group
            const additionalSelectsNeeded = group.group_devices.length - deviceSelects.length;
            for (let i = 0; i < additionalSelectsNeeded; i++) {
              addDeviceRow();  // Assuming addDeviceRow is a function that adds a new device select input field
            }
            // Query the device selects again after adding new ones
            deviceSelects = Array.from(document.querySelectorAll('.device-select'));
          }
          
          for (let i = 0; i < group.group_devices.length; i++) {
            deviceSelects[i].value = group.group_devices[i].group_device_key;
          }
          
          // Call updateGroupDeviceOptions to disable already selected options
          updateGroupDeviceOptions();
        
          // Show the add-group-container so the user can edit the group.
          addGroupContainer.style.display = 'block';
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
      groupLinkLi.classList.add("group-li");
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
  

  // Load the current rules and display them
  socket.on("groups_updated", (data) => {
    groupData = data.groups; // Update the ruleData object with the new data
    if(data.deleted){ //if the group is deleted
      addGroupContainer.style.display = 'none'; //hide ADD Scene container when scene is deleted
    }
    updateSidebarGroupLinks();
    updateGroupList();
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




