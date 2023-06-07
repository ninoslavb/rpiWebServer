
// DOM elements
document.addEventListener('DOMContentLoaded', () => {


const socket = io();

const sceneList = document.getElementById("scene-list");


// Show/hide the add-scene-container when the "ADD NEW SCENE" button is clicked
const addNewSceneButton = document.getElementById('add-new-scene-button');
const addSceneContainer = document.getElementById('add-scene-container');

//container for adding scene   
const sceneNameContainer = document.getElementById("scene-name-container");
const input = document.createElement("input");
input.className = "scene-input";
input.type = "text";
input.placeholder = "Enter name";
input.id = "new-scene-name";
sceneNameContainer.appendChild(input);


const sceneNameInput = document.getElementById("new-scene-name");


function resetAddSceneForm() {

 //delete all existing Rows
  const existingSceneDeviceRows = document.querySelectorAll('.scene-device-row');
  existingSceneDeviceRows.forEach(row => sceneDeviceWrapper.removeChild(row));

  sceneDeviceRowCount = 0;
  sceneNameInput.value = ""; // Reset the scene name input field

    // Hide the add-scene-container after submitting the form
  addSceneContainer.style.display = 'none';


}

// Show/hide the add-scene-container when the "ADD NEW SCENE" button is clicked
addNewSceneButton.addEventListener('click', () => {
  if (addSceneContainer.style.display === 'none') {
    resetAddSceneForm();
    addSceneContainer.style.display = 'block';
  } else {
    addSceneContainer.style.display = 'none';
  }
});


/*############################################################################################################################################################
1. createRow(className):
This function is used to create a new HTML 'div' element with a specified class. It accepts a string parameter which is used as the class name for the 'div'. The newly created 'div' is returned by the function.

2. createSelect(className, optionsHTML):
This function creates a new 'select' HTML element with a given class name and inner HTML. It accepts two parameters, 'className' which specifies the class for the 'select' element and 'optionsHTML' which specifies the HTML content inside the 'select' element.

3. createSceneDeviceSelect():
This function is used to create a new 'select' HTML element for scene devices. It iterates over 'deviceData' and creates an 'option' element for each 'digital-output' device. The 'select' element is returned by the function.

4. createRemoveButton(sceneDeviceWrapper, sceneDeviceRow):
This function creates a new 'button' HTML element that is used to remove a scene device row. It sets up an event listener on the 'click' event. When the button is clicked, the function removes the 'sceneDeviceRow' from 'sceneDeviceWrapper', updates the scene device options, and decreases 'sceneDeviceRowCount' by one.

5. handleSceneDeviceChange(sceneDeviceSelect, sceneDeviceRow, removeButton):
This function is used as an event handler for the 'change' event of 'sceneDeviceSelect'. It creates and adds 'select' elements for active and inactive scene actions based on the type of the selected device. It also ensures that the previously selected options are removed when a new device is selected.

6. addSceneDeviceRow():
This function is used to add a new scene device row to the scene device wrapper. It creates a new row, creates a select element for scene devices and a remove button, and sets up an event handler for the 'change' event of the select element. It also ensures that a new row cannot be added if the number of rows is equal to the number of 'digital-output' devices.
*/


//Scene device row counter initialization
let sceneDeviceRowCount = 0;


function createRow(className) {
    const row = document.createElement('div');
    row.classList.add(className);
    return row;
  }

function createSelect(className, optionsHTML) {
const select = document.createElement('select');
select.classList.add(className);
select.innerHTML = optionsHTML;
return select;
}


function createSceneDeviceSelect() {
    const sceneDeviceSelect = createSelect('scene-device-select', `<option disabled selected class="placeholder-option">Select Scene Device</option>`);
    sceneDeviceSelect.classList.add('scene-device-select');
    
    for (const deviceKey in deviceData) {
      const device = deviceData[deviceKey];
      if (device.type === 'digital-output') {
        const optionDevice = document.createElement("option");
        optionDevice.value = deviceKey;
        optionDevice.textContent = device.name;
        sceneDeviceSelect.appendChild(optionDevice);
      }
    }
  
    return sceneDeviceSelect;
  }
  
  function createRemoveButton(sceneDeviceWrapper, sceneDeviceRow) {
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.classList.add('btn', 'btn-sm', 'custom-delete-scene-device-button');
    
    removeButton.addEventListener('click', () => {
      sceneDeviceWrapper.removeChild(sceneDeviceRow);
      updateSceneDeviceOptions();
      sceneDeviceRowCount--;
    });
  
    return removeButton;
  }
  
  function handleSceneDeviceChange(sceneDeviceSelect, sceneDeviceRow, removeButton) {
    const selectedDevice = deviceData[sceneDeviceSelect.value];
  
    const existingActiveOptionDropdown = sceneDeviceRow.querySelector('.scene-active-device-option');
    if (existingActiveOptionDropdown) {
      sceneDeviceRow.removeChild(existingActiveOptionDropdown);
    }

    const existingInactiveOptionDropdown = sceneDeviceRow.querySelector('.scene-inactive-device-option');
    if (existingInactiveOptionDropdown) {
      sceneDeviceRow.removeChild(existingInactiveOptionDropdown);
    }
  
    if (selectedDevice.type === 'digital-output') {
        const sceneActiveDeviceOption = createSelect('scene-active-device-option', `
          <option disabled selected>Select Scene Activated Action</option>
          <option value="0">OFF</option>
          <option value="1">ON</option>
        `);
        sceneDeviceRow.insertBefore(sceneActiveDeviceOption, removeButton);
    
        const sceneInactiveDeviceOption = createSelect('scene-inactive-device-option', `
          <option disabled selected>Select Scene Stopped Action</option>
          <option value="0">OFF</option>
          <option value="1">ON</option>
        `);
        sceneDeviceRow.insertBefore(sceneInactiveDeviceOption, removeButton);
      } 
    updateSceneDeviceOptions();
  }

  



function addSceneDeviceRow() {
    const sceneDeviceWrapper = document.getElementById('sceneDeviceWrapper');
  
    const sceneDeviceCount = Object.values(deviceData).filter(device => device.type === 'digital-output').length;
    if (sceneDeviceRowCount >= sceneDeviceCount) {
      return false; // Row was not added
    }
  
    const sceneDeviceRow = createRow('scene-device-row');
    sceneDeviceWrapper.appendChild(sceneDeviceRow);
  
    const sceneDeviceSelect = createSceneDeviceSelect();
    sceneDeviceRow.appendChild(sceneDeviceSelect);
  
    const removeButton = createRemoveButton(sceneDeviceWrapper, sceneDeviceRow);
    sceneDeviceRow.appendChild(removeButton);
  
    sceneDeviceSelect.addEventListener('change', () => handleSceneDeviceChange(sceneDeviceSelect, sceneDeviceRow, removeButton));
    sceneDeviceWrapper.appendChild(sceneDeviceRow);
    updateSceneDeviceOptions();
  
    sceneDeviceRowCount++;
    return true;
  }
  




  
  /* ###########################################################################################
   This function updates options to disable the options that are already selected
  */

function updateSceneDeviceOptions() {
  const selectedSceneDevices = new Set();
  const DeviceSelectElements = document.getElementsByClassName('scene-device-select');

  // Loop through all input device selects and add their values to the selectedInputDevices set
  for (const selectElement of DeviceSelectElements) {
    if (selectElement.value !== "") {
      selectedSceneDevices.add(selectElement.value);
    }
  }

  // Loop through all device selects and disable the options that are already selected
for (const selectElement of DeviceSelectElements) {
  for (const optionElement of selectElement.options) {
    // Check if the optionElement has the custom class
    const isPlaceholder = optionElement.classList.contains("placeholder-option");

    if (!isPlaceholder && optionElement.value !== "" && selectedSceneDevices.has(optionElement.value)) {
      optionElement.disabled = selectElement.value !== optionElement.value;
    } else {
      optionElement.disabled = isPlaceholder;
    }
  }
}
}

window.updateSceneDeviceOptions = updateSceneDeviceOptions;

/*#################################################################################################################################################################
Options():
This function is used to update the options in all the 'select' elements for scene devices in the document's scene list. 
It starts by querying all the 'select' elements with the class 'scene-device-select'. 
Then for each 'select' element, it clears the inner HTML and creates a new 'option' element for each device in the 'deviceData'. 
It preserves the previously selected option by saving its value before clearing the inner HTML and then setting the value back after the new options have been added. 
This function is particularly useful in case the available devices change dynamically and the scene list needs to be updated to reflect the current state of available devices.
*/


function updateSceneListDeviceOptions() {
    // Query all elements with the class 'device-select'
    const DeviceSelects = document.querySelectorAll('.scene-device-select');

  
    DeviceSelects.forEach((sceneDeviceSelect) => {   // Iterate through each input device select element
      const currentValue = sceneDeviceSelect.value;       // Store the current value of the select element
      DeviceSelect.innerHTML = `<option disabled selected>Select Scene Device</option>`; // Reset the inner HTML of the select element, keeping only the disabled option
      //inputDeviceOption.innerHTML = `<option disabled selected>Select State</option>`; // Reset the inner HTML of the select element, keeping only the disabled option
      for (const deviceKey in deviceData) {                 // Iterate through the deviceData object
        const device = deviceData[deviceKey];             
        const optionDevice = document.createElement("option"); // Create a new option element for the input device
        optionDevice.value = deviceKey;
        optionDevice.textContent = device.name;
        sceneDeviceSelect.appendChild(optionDevice);          // Add the new option element to the select elemement
        
      }
      sceneDeviceSelect.value = currentValue;                   // Restore the original value of the select element
    });
     }
  

     
 /*##########################################################################################################################################
 Add event listener to check if name is updated. If the name is updated, update displayed scene list and options in dropdown menu */
socket.on("device_name_updated", (data) => {
    const deviceKey = data.device_key;
    const deviceName = data.device_name;
        
    deviceData[deviceKey].name = deviceName;
        
    updateSceneList();      
    updateSceneListDeviceOptions();  
});



/*
####################################################################################################################################################################################
The following code is an event listener for the scene form submission. When the form is submitted, it prevents the default form submission behavior and processes the form data as follows:

1. It selects all the scene device rows and creates an array of scene devices. Each scene device object contains the selected device key and its option values for both active and inactive states.
2. It creates a unique scene key if a new scene is being added or uses the existing scene key if an existing scene is being edited.
3. It sends the form data to the server using the 'add_scene' event via the socket connection. The form data includes the scene key, scene name, and scene devices.
4. The server responds with either 'error' or 'success'. If there is an error, it alerts the user with the error message. If the response is successful, it updates the sceneData object and calls the updateSceneList() function to update the list of scenes displayed on the page.
5. After a scene is successfully added or edited, it removes all existing scene device rows from the form, resets the scene name input field, hides the 'add-scene-container', and allows the user to start fresh when adding a new scene or editing an existing scene.
*/



const addSceneForm = document.getElementById("add-scene-form");

let originalSceneData = null;
let currentlyEditingSceneKey = null;

// Function to generate a pseudo-random scene key.
function generateSceneKey() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

addSceneForm.addEventListener("submit", (event) => {
  event.preventDefault();

// Get the selected scene devices from the scene device rows
          const sceneDeviceRows = document.querySelectorAll('.scene-device-row');
          const sceneDevices = Array.from(sceneDeviceRows).map((row) => {
            const scene_device_key = row.querySelector('.scene-device-select').value;
            const scene_active_device_option = row.querySelector('.scene-active-device-option') ? row.querySelector('.scene-active-device-option').value : null;
            const scene_inactive_device_option = row.querySelector('.scene-inactive-device-option') ? row.querySelector('.scene-inactive-device-option').value : null;
    
            return {
              scene_device_key,
              scene_active_device_option,
              scene_inactive_device_option,
            };
          });
          
        
        
        const sceneName = sceneNameInput.value;


        // Validation check: If no devices are selected, show an alert and return early
        if (sceneDevices.length === 0) {
        alert('Please add at least one device to the scene.');
        return;
        }


      // Validation check: If an scene device is not selected from the dropdown, show an alert and return early
      for (const sceneDevice of sceneDevices) {
        if (sceneDevice.scene_device_key === 'Select Scene Device') {
          alert('Please select a valid scene device.');
          return;
        } else if (sceneDevice.scene_active_device_option === 'Select Scene Activated Action') {
          alert('Please select a valid device action when the scene is activated.');
          return;
       }
    
     else if (sceneDevice.scene_inactive_device_option === 'Select Scene Stopped Action') {
        alert('Please select a valid device action when the scene is stopped.');
        return;
     }
    }
        if (sceneName === '') {
          alert('Please enter a valid scene name.');
          return;
      }

      const addScene = () => {
        let scene_key;
        if (currentlyEditingSceneKey) {
          scene_key = currentlyEditingSceneKey;
        } else {
          scene_key = generateSceneKey();
        }


      socket.emit('add_scene', {
        scene_key,
        scene_name: sceneName,
        scene_devices: sceneDevices,
        is_edit: !!currentlyEditingSceneKey
      }, (response) => {
        if (response && response.error) {
          alert(response.error);
          if (currentlyEditingSceneKey) {
            // If an error occurred while editing a scene, restore the original scene.
            sceneData[currentlyEditingSceneKey] = originalSceneData;
          }
        } else {
          if (currentlyEditingSceneKey) {
            delete sceneData[currentlyEditingSceneKey]; // remove the old scene
          }
          sceneData[scene_key] = {
            scene_name: sceneName,
            scene_devices: sceneDevices
          };
          updateSceneList();
        
        
        currentlyEditingSceneKey = null;
        originalSceneData = null;

        sceneDeviceRows.forEach(row => sceneDeviceWrapper.removeChild(row));  
        sceneDeviceRowCount = 0; 
        sceneNameInput.value = ""; // Reset the rule name input field

          // Hide the add-scene-container after submitting the form
        addSceneContainer.style.display = 'none';
        }
      });
    }
    addScene();
});



/*
####################################################################################################################################################################################
The 'updateSceneList' function performs the following steps:

1. Clears the existing scene list displayed on the web page by setting the innerHTML of the sceneList element to an empty string.
2. Iterates over each scene in the sceneData object.
3. For each scene, it maps the scene devices to their respective texts. It fetches the device name from the deviceData object using the scene_device_key and generates the text representing the device's active and inactive state. 
4. It then creates a list item (li element) for the scene, appending the scene name and the scene devices text to it.
5. It also adds a 'Delete' and 'Edit' button to each scene list item. The 'Delete' button when clicked emits a 'delete_scene' event to the server with the scene key to delete the scene. The 'Edit' button when clicked calls the 'startEditingScene' function with the scene key to start editing the scene.
6. Finally, it appends the list item to the sceneList element, which updates the scene list displayed on the web page.
This function is generally called after adding, deleting, or editing a scene to update the scene list on the page.
*/


function updateSceneList() {
sceneList.innerHTML = "";
for (const sceneKey in sceneData) {
  const scene = sceneData[sceneKey];
  const sceneDevices = scene.scene_devices;
  const sceneName = scene.scene_name;

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
  listItem.classList.add("scene-list-item");
  
  const sceneDevicesText = sceneDevices.map((sceneDevice, index) => {
    const device = deviceData[sceneDevice.scene_device_key];
    let sceneText = '';
  
    if (device.type === 'digital-output') {
    sceneText = `${device.name} state is ${getDigitalOutputText(sceneDevice.scene_active_device_option)} when the scene is activated and ${getDigitalOutputText(sceneDevice.scene_inactive_device_option)} when the scene is stopped `;
    } 
  
    return index === 0 ? `${sceneText}` : `${sceneText}`;
  });
  
  const sceneNameElement = document.createElement("div");
  sceneNameElement.textContent = `Scene Name: ${sceneName}`;
  listItem.appendChild(sceneNameElement);
  
  const sceneDevicesElement = document.createElement("div");
  sceneDevicesElement.innerHTML = sceneDevicesText.join('<br>'); // Join the array elements with a line break
  listItem.appendChild(sceneDevicesElement);
  
  // Create a container for the buttons
  const sceneButtonContainer = document.createElement("div");
  sceneButtonContainer.classList.add("scene-button-container"); 
  
  
  const deleteSceneButton = document.createElement("button");
  deleteSceneButton.classList.add("delete-scene-button");
  deleteSceneButton.textContent = "Delete";
  deleteSceneButton.dataset.ruleKey = sceneKey;
  deleteSceneButton.addEventListener("click", () => {
    socket.emit("delete_scene", { scene_key: sceneKey });

  });
  sceneButtonContainer.appendChild(deleteSceneButton);
  
  // Create Edit Button
  const editSceneButton = document.createElement("button");
  editSceneButton.classList.add("edit-scene-button");
  editSceneButton.textContent = "Edit";
  editSceneButton.dataset.ruleKey = sceneKey;
  editSceneButton.addEventListener("click", () => {
      startEditingScene(sceneKey);                        
  });
  sceneButtonContainer.appendChild(editSceneButton);
  
  
  listItem.appendChild(sceneButtonContainer);
  sceneList.appendChild(listItem);

}
}


// Call this function to add event listeners to the newly added edit buttons
function addEditButtonEventListeners() {
const editSceneButtons = document.querySelectorAll(".edit-scene-button");
editSceneButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sceneKey = button.dataset.sceneKey; 
        startEditingScene(sceneKey);
    });
});
}

// Call the function after updating the scene list
updateSceneList();
addEditButtonEventListeners();




/* 
####################################################################################################################################################################################
1. Scene Editing Preparation: The function first prepares the environment for scene editing. It removes all existing scene device rows from the user interface (UI) and resets the scene device row count to zero. It then sets the currentlyEditingSceneKey with the provided sceneKey.
2. Scene Selection: The function selects the scene to be edited using the provided sceneKey and sets the scene name in the UI input field.
3. Scene Devices Setup: The function iterates over the scene devices defined in the scene. For each device, it adds a new row to the UI and selects the device in the dropdown. If the selected device is of the type 'digital-output', it populates and selects the relevant options. This process includes a mechanism allowing the Document Object Model (DOM) to update, ensuring that UI elements have been created or updated before the script continues.
4. Lock State Update: The UI elements are updated to ensure that the user can only interact with the appropriate elements. This stage is not included in the provided function but is often necessary in similar UI interactions.
5. Show Scene Editing Container: Lastly, the container for editing the scene is displayed to the user.
This function is typically called when the user wishes to edit an existing scene. It prepares the editing interface with the scene's current configurations and allows the user to make changes.
*/

async function startEditingScene(sceneKey) {


const existingSceneDeviceRows = document.querySelectorAll('.scene-device-row');
existingSceneDeviceRows.forEach(row => sceneDeviceWrapper.removeChild(row));

sceneDeviceRowCount=0;
  // Update the currently editing scene key
currentlyEditingSceneKey = sceneKey;
  
const scene = sceneData[sceneKey];
sceneNameInput.value = scene.scene_name;


// Create device rows for each device in the scene
for (const sceneDevice of scene.scene_devices) {
  const sceneDeviceRowAdded = addSceneDeviceRow();
  if (sceneDeviceRowAdded) {
    const sceneDeviceRow = document.querySelector('.scene-device-row:last-child');
    const sceneDeviceSelect = sceneDeviceRow.querySelector('.scene-device-select');
    sceneDeviceSelect.value = sceneDevice.scene_device_key;

    // Dispatch the change event to create the options and await its finish
    const changeEvent = new Event('change');
    let resolveChange;
    const onChange = new Promise(resolve => resolveChange = resolve);
    sceneDeviceSelect.addEventListener('change', () => resolveChange(), { once: true });
    sceneDeviceSelect.dispatchEvent(changeEvent);
    await onChange;

    // Check the device type and create the options accordingly
    const selectedDevice = deviceData[sceneDevice.scene_device_key];

    if (selectedDevice) {
      if (selectedDevice.type === 'digital-output') {
        const sceneActiveDeviceOptionInput = sceneDeviceRow.querySelector('.scene-active-device-option');
        const sceneInactiveDeviceOptionInput = sceneDeviceRow.querySelector('.scene-inactive-device-option');
        if (sceneActiveDeviceOptionInput) {
          // Then set the selected option value based on the scene data
          sceneActiveDeviceOptionInput.value = sceneDevice.scene_active_device_option;
        }
        if (sceneInactiveDeviceOptionInput) {
            // Then set the selected option value based on the scene data
            sceneInactiveDeviceOptionInput.value = sceneDevice.scene_inactive_device_option;
          }
      }

    }
  }
}        

// Show the add-scene-container so the user can edit the scene.
addSceneContainer.style.display = 'block';
}






// Load the current scenes and display them
socket.on("scenes_updated", (scenes) => {
sceneData = scenes; // Update the sceneData object with the new data
addSceneContainer.style.display = 'none'; //hide ADD Scene container once when scene is added/deleted.
updateSceneList();
});





/* ##########################################################################################################
This event listener is added to the "Add Scene Device" button (which has a CSS class of custom-add-scene-device-button). 
When the button is clicked, the event listener will prevent the default action of the button click (using event.preventDefault()). 
Then, it will call the addSceneDeviceRow() function, which is responsible for adding a new scene device row to the form.
*/
document.querySelector("button.custom-add-scene-device-button").addEventListener("click", (event) => {
event.preventDefault();

// Check if a row was added
if (!addSceneDeviceRow()) {
  alert("No more devices available!");
}
});


});

