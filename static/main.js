import { updateDeviceName, attachDeviceNameUpdateListener } from './deviceName_handler.js';
import { createOutputDeviceBox, createInputDeviceBox, createTHDSensorDeviceBox} from './deviceBoxTemplates.js';
import {createPairingDeviceBox } from './pairingDeviceBox.js';


document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect(); //connect the socket


    const addGroupContainer = document.getElementById('add-group-container');
    const addRuleContainer = document.getElementById('add-rule-container');
    const addSceneContainer = document.getElementById('add-scene-container');


/*###################################### ADD PAIRING DEVICE ########################################################################### */
    const pairingdeviceContainer = document.querySelector(".pairing-device-container");
    const pairingDeviceKeys = Object.keys(pairingdeviceData)    
    pairingDeviceKeys.forEach((friendly_name)=> {
    const pairingdDevice = pairingdeviceData[friendly_name];
    let pairingdeviceBox;
    pairingdeviceBox = createPairingDeviceBox(friendly_name,pairingdDevice)
    pairingdeviceContainer.appendChild(pairingdeviceBox);
    });



/*###################################### ADD DEVICE ###########################################################################
Following code checks all device_key s from deviceData dictonary, checks device type and creates appropriate device Box
 */
      const deviceContainer = document.querySelector(".device-container");
      const DeviceKeys = Object.keys(deviceData)

      DeviceKeys.forEach((device_key) => {
        const device = deviceData[device_key];
        let deviceBox;
        if (device.type === 'digital-input') {
          deviceBox = createInputDeviceBox(device_key, device);
         
        } else if (device.type === 'digital-output') {
          deviceBox = createOutputDeviceBox(device_key, device);
        
        } else if (device.type === 'sensor' && device.type1 === 'temp') {
          deviceBox = createTHDSensorDeviceBox(device_key, device);
        
        } else {
          return; // Skip the device if it has an unrecognized type
        }
        deviceContainer.appendChild(deviceBox);
      });


/*########################################## DELETE DEVICE ########################################################################### */

 //Create a new loop just for attaching the event listeners


DeviceKeys.forEach((device_key) => {
deleteDeviceListener(device_key);

});
  // Attach an event listener to each "Yes" button

  function deleteDeviceListener(device_key) {
  const yesButton = deviceContainer.querySelector(`#${device_key}-yes-button`);
  const deviceBox = document.querySelector(`.device-box[device-id="${device_key}"]`)
  
  if (yesButton) { // Ensure the button exists before adding an event listener
    yesButton.addEventListener('click', (e) => {
      e.preventDefault();

       // Get the deviceTop element
       const deviceTop = document.querySelector(`#${device_key}-top`);
       const confirmDiv = document.querySelector(`#${device_key}-confirm`);
      
      //FIRST CHECK IF DEVICE IS PART OF THE RULE, AND IF YES ALERT!
      const ruleKeys = Object.keys(ruleData);

      for (let i = 0; i < ruleKeys.length; i++) {
        const ruleKey = ruleKeys[i];
        const rule = ruleData[ruleKey];
        const inputDevices = rule.input_devices;

        // Check if the device is the output device for this rule
        if (rule.output_device_key === device_key) {
          alert("Cannot delete device. It is used as output in rule: " + rule.rule_name + ". To delete the device, you must first delete it from the rule.");
          deviceTop.style.display = 'block'; // Make the device box visible again after alert message is shown
          confirmDiv.style.display = 'none'; //Hide device deletion window;
          const lockIcon = deviceBox.querySelector('.lock-icon'); // Query lock icon
          if(lockIcon){
            lockIcon.style.display = 'block'; // hide the lockIcon
        }
          return;
        }

        // Check if the device is one of the input devices for this rule
        for (let j = 0; j < inputDevices.length; j++) {
          if (inputDevices[j].input_device_key === device_key) {
            alert("Cannot delete device. It is used as input in rule: " + rule.rule_name + ". To delete the device, you must first delete it from the rule.");
            deviceTop.style.display = 'block'; // Make the device box appear after alert message is shown
            confirmDiv.style.display = 'none'; //Hide device deletion window
            const lockIcon = deviceBox.querySelector('.lock-icon'); // Query lock icon
            if(lockIcon){
              lockIcon.style.display = 'block'; // hide the lockIcon
            }
            return;
          }
        }
      }

      //CHECK IF DEVICE IS PART OF ANY GROUP, AND IF YES ALERT!
      const groupKeys = Object.keys(groupData);

      for (let i = 0; i < groupKeys.length; i++) {
        const groupKey = groupKeys[i];
        const group = groupData[groupKey];
        const groupDevices = group.group_devices;

        // Check if the device is in this group
        for (let j = 0; j < groupDevices.length; j++) {
          if (groupDevices[j].group_device_key === device_key) {
            alert("Cannot delete device. It is part of the group: " + group.group_name + ". To delete the device, you must first delete it from the group by usign edit button in Groups page");
            deviceTop.style.display = 'block'; // Make the device box visible again after alert message is shown
            confirmDiv.style.display = 'none'; //Hide device deletion window;
            return;
          }
        }
      }


      //CHECK IF DEVICE IS PART OF ANY SCENE, AND IF YES ALERT!
      const sceneKeys = Object.keys(sceneData);

      for (let i = 0; i < sceneKeys.length; i++) {
        const sceneKey = sceneKeys[i];
        const scene = sceneData[sceneKey];
        const sceneDevices = scene.scene_devices;

        // Check if the device is in this scene
        for (let j = 0; j < sceneDevices.length; j++) {
          if (sceneDevices[j].scene_device_key === device_key) {
            alert("Cannot delete device. It is part of the scene: " + scene.scene_name + ". To delete the device, you must first delete it from the scene using the edit button in the Scenes page.");
            deviceTop.style.display = 'block'; // Make the device box visible again after alert message is shown
            confirmDiv.style.display = 'none'; //Hide device deletion window;
            const lockIcon = deviceBox.querySelector('.lock-icon'); // Query lock icon
            if(lockIcon){
              lockIcon.style.display = 'block'; // hide the lockIcon
            }
            return;
          }
        }
      }
      


      //If device is not part of any rule or group, proceed with deletion
      socket.emit('delete_device', { device_key: device_key });



    });
  }
}

// Wait for device_deleted event and delete it from the frontend, update deviceData dictionary
socket.on("device_deleted", (data) => {
  deviceData = data.device_data; // Update the groupData object with the new data
  const deviceKeyToDelete = data.device_key;
  const deviceBoxToDelete = document.querySelector(`[device-id="${deviceKeyToDelete}"]`); // Select the device box with the corresponding device-id
  if (deviceBoxToDelete) { // Make sure the box was found before trying to remove it
    deviceBoxToDelete.parentElement.removeChild(deviceBoxToDelete); // Remove the device box from its parent
  }
  updateDeviceOptions();      //remove device from the rule options
  updateGroupDeviceOptions(); //remove device fom the group options
  updateSceneDeviceOptions(); // remove device from the rule options
  addGroupContainer.style.display = 'none'; //close add group container when device is deleted so it is refreshed once when device is deleted
  addRuleContainer.style.display = 'none';  //close add rule container when device is deleted so it is refreshed once when device is deleted
  addSceneContainer.style.display = 'none'; //close add scene container when device is deleted so it is refreshed once when device is deleted
  });




  

/*###########################################--DEVICE NAME UPDATE---###########################################################################
Following code is socket event listener for device_name_updated. When event is received from the server updateDeviceName for 
updating device name is called, and attachDeviceNameUpdateListener is reponsible to sending device name update information to
the server
 */
      socket.on('device_name_updated', (data) => {
      updateDeviceName(data.device_key, data.device_name);
      attachDeviceNameUpdateListener(data.device_key); //attach the listener, and send the update to the server when new name is entered
      });


/*#########################################---UPDATE OUTPUT DEVICE---###########################################################################
function updateDeviceState is checks the status of output device received from the server and sets slider in frondend accordingly
It also checks if output device has battery and appends battery state in frontend if available.Function is called when device_gpio_status
socket event from server is recieved. 
sendUpdate function emits socket event device_output_device with device_key and action. It is called in addDigitalOutputEventListener event listener
which checks if slider is set to ON or OFF in frontend.
addDigitalOutputEventListener is attached for all device keys with type digital-output
*/
      function updateDeviceState(device_key, device) {
        const deviceBox = document.querySelector(`.device-box[device-id="${device_key}"]`);
        const deviceOutputStatus = device.gpio_status;
        const deviceBatStat = device.device_bat_stat;
        const deviceSource = device.device_source;
      
        if (deviceOutputStatus === 1) {
          document.querySelector(`#${device_key}-input`).checked = true;
        } else {
          document.querySelector(`#${device_key}-input`).checked = false;
        }
      
        if (deviceSource === 'zbee') {
          const batteryValue = deviceBox.querySelector('.battery-value');
          if (deviceBatStat !== null && deviceBatStat !== undefined) {
            if(batteryValue.textContent) //check if text Content exists??????????????
            batteryValue.textContent = `${deviceBatStat}%`;
          }
        }
      }
      

      const sendUpdate = (device_key, action) => {
        socket.emit('device_output_update', { device_key: device_key, action: action });
      };


      function addDigitalOutputEventListener(device_key) {
        document.querySelector(`#${device_key}-input`).addEventListener('change', (e) => {
          e.preventDefault();
      
          if (e.target.checked) {
            sendUpdate(device_key, 'on');
          } else {
            sendUpdate(device_key, 'off');
          }
        });
      
        socket.on('device_gpio_status', (data) => {
          if (data.device_key === device_key) {
            updateDeviceState(device_key, data);
          }
        });
      }
      
      // Add the device keys of devices with type 'digital-output'
      const outputDeviceKeys = Object.keys(deviceData).filter((device_key) => deviceData[device_key].type === 'digital-output');

      outputDeviceKeys.forEach((device_key) => {
        addDigitalOutputEventListener(device_key);
      });



/*###################################---UPDATE INPUT VALUES---#################################################################################
This function is responsible to update input device box in frontend depending of its type, type1, type2 and source. For example devices with zbee
source (ZigBee) will have battery status if it is not null and is defined. If input state is 0 and if input type 1 is contact (contact sensor)
then text shown will be 'open'and box will be transparent (device-input-connected class, take a look in master.css)
FUnction is called when socket event 'device_input_status' from the server side is received.
 */
    function updateDeviceInputStatus(deviceInputBox, deviceInputStatus, deviceInputType1, deviceBatStat, deviceSource) {
    const stateValue = deviceInputBox.querySelector('.state-value');
     //check if box exists
    if (stateValue === null) {
      console.error("Error: .state-value element not found within deviceInputBox");
      return;
  }
    if (deviceInputStatus === 0) {
      if(deviceInputType1 === 'contact') {
          deviceInputBox.classList.add('device-input-connected');
          stateValue.textContent = `open`;
        }
        else if(deviceInputType1 === 'motion') {
          deviceInputBox.classList.remove('device-input-connected');
          stateValue.textContent = 'unoccupied';
        }

     } else {
        if(deviceInputType1 === 'contact') {
            deviceInputBox.classList.remove('device-input-connected');
            stateValue.textContent = `closed`;
          }
          else if(deviceInputType1 === 'motion') {
            deviceInputBox.classList.add('device-input-connected');
            stateValue.textContent = 'occupied';
          }
    }


    if(deviceSource==='zbee') {
      const batteryValue = deviceInputBox.querySelector('.battery-value')
      if(deviceBatStat !== null && deviceBatStat !== undefined)
      batteryValue.textContent = `${deviceBatStat}%`;
      }

    }

    // listens information from the Server side about digital input status
    socket.on('device_input_status', (data) => {
      const deviceKey = data.device_key;
      const deviceInputStatus = data.gpio_status;
      const deviceInputType1 = data.device_type1;
      const deviceBatStat = data.device_bat_stat;
      const deviceSource = data.device_source;
      const deviceBox = document.querySelector(`.device-box[device-id="${deviceKey}"]`);
      updateDeviceInputStatus(deviceBox, deviceInputStatus, deviceInputType1, deviceBatStat, deviceSource);
      });








/*###################################---UPDATE SENSOR VALUES---#################################################################################
This function is responsible to update sensor values in frontend depending of its type, type1, type2 and source. For example devices with zbee
source (ZigBee) will have battery status if it is not null and is defined. 
FUnction is called when socket event 'update_sensor_status' from the server side is received.
 */
  function updateSensorValues(device_key, device_type, device_type1, device_type2, device_value1, device_value2, device_bat_stat,device_source) {
  
    if (device_type === 'sensor' && device_type1 === 'temp' && device_type2 === 'humid') {
      const deviceBox = document.querySelector(`.device-box[device-id="${device_key}"]`);
      const temperatureValue = deviceBox.querySelector('.temperature-value');
      const humidityValue = deviceBox.querySelector('.humidity-value');
      temperatureValue.textContent = `${device_value1} °C`;
      humidityValue.textContent = `${device_value2}% RH`;

      if(device_source==='zbee') {
        const batteryValue = deviceBox.querySelector('.battery-value')
        if(device_bat_stat !== null && device_bat_stat !== undefined)
        batteryValue.textContent = `${device_bat_stat}%`;
        }
    }
    else if(device_type === 'sensor' && device_type1 === 'temp' && device_type2 !== 'humid') {  //only for temperature sensors
      const deviceBox = document.querySelector(`.device-box[device-id="${device_key}"]`);
      const temperatureValue = deviceBox.querySelector('.temperature-value');
      temperatureValue.textContent = `${device_value1} °C`;
      if(device_source==='zbee') {
        const batteryValue = deviceBox.querySelector('.battery-value')
        if(device_bat_stat !== null && device_bat_stat !== undefined)
        batteryValue.textContent = `${device_bat_stat}%`;
        }
  
    }
    
    //else for other type sensors
  }

  socket.on('device_sensor_status', function(data) {
    updateSensorValues(data.device_key, data.device_type, data.device_type1, data.device_type2, data.device_value1, data.device_value2, data.device_bat_stat, data.device_source);
  });
  
  


/*###################################---NEW DEVICE PAIRING---###################################################################### */
socket.on('new_device_pairing',function(data) {

pairingdeviceData[data.friendly_name] = data.pairing_device_info;
const pairingDevice = pairingdeviceData[data.friendly_name];
console.log('Pairing device info:', pairingDevice);
let pairingdeviceBox;
pairingdeviceBox = createPairingDeviceBox(data.friendly_name,pairingDevice);
pairingdeviceContainer.appendChild(pairingdeviceBox);

});


// Load the current pairing devices on the load and display them
socket.on("pairing_devices_updated", (data) => {
  pairingdeviceData = data; // Update the pairingdeviceData object with the new data
  });
  


// Add event listener to all 'Accept' buttons
document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('accept-button')) {  // Check if clicked element is an 'Accept' button
      const friendly_name = e.target.getAttribute('data-friendly-name');  // Retrieve friendly_name from the attribute
      const action = 'accept_device';
      socket.emit('pairing_device_action', { friendly_name: friendly_name, action: action });
  }
});



// Add event listener to all 'Decline' buttons
document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('decline-button')) {  // Check if clicked element is an 'Decline' button
      const friendly_name = e.target.getAttribute('data-friendly-name');  // Retrieve friendly_name from the attribute
      const action = 'decline_device';
      socket.emit('pairing_device_action', { friendly_name: friendly_name, action: action });
  }
});

//remove device pairing box once when device is accepted or deleted
socket.on("pairing_device_deleted", (data) => {
  const deletedPairingDevice = data;
  const deletedPairingdeviceBox = document.querySelector(`div[pairing-device-id="${deletedPairingDevice.friendly_name}"]`);
  if (deletedPairingdeviceBox) {
    pairingdeviceContainer.removeChild(deletedPairingdeviceBox);
  }
  });



  /*##############################################---NEW DEVICE ADDED ---#############################################################
  This part of the code listens for the socket event 'new_device_added' from the server side, and for the given device_key
  and device type dynamically creates device Box. If it is type digital-output it attachs event listener which checks if 
  the state of digital-output changed in frontend (someone pressed the button in app), or if the state is changed (i.e. from the rule) 
  rule and group options are updated with the new device added.
  */

          socket.on('new_device_added', function(data) {
            // Update the deviceData object with the new device information
            
            deviceData[data.device_key] = data.device_info;
            const device = deviceData[data.device_key];
            //console.log('Device info:', device);
            let deviceBox;
            if (device.type === 'digital-input') {
              deviceBox = createInputDeviceBox(data.device_key, device);
            
            } else if (device.type === 'digital-output') {
              deviceBox = createOutputDeviceBox(data.device_key, device);
            
            } else if (device.type === 'sensor' && device.type1 === 'temp') {
              deviceBox = createTHDSensorDeviceBox(data.device_key, device);
            
            } else {
              return; // Skip the device if it has an unrecognized type
            }
            deviceContainer.appendChild(deviceBox);
            // Update the HTML content with the new device information


            deleteDeviceListener(data.device_key); //add delete device listener
            
            // Attach the event listener for the newly added device (if it's a digital-output device)
            if (device.type === "digital-output") {
              addDigitalOutputEventListener(data.device_key);
              } 
            updateDeviceOptions();      //append newly added device to the rule options
            updateGroupDeviceOptions(); //append newly added device to the group options
            updateSceneDeviceOptions(); //append newly added device to the scene options

            addGroupContainer.style.display = 'none'; //close add group container when device is added so it is refreshed once when device is added
            addRuleContainer.style.display = 'none';  //close add rule container when device is added so it is refreshed once when device is added
            addSceneContainer.style.display = 'none'; //close add scene container when device is added so it is refreshed once when device is added
          
          });






     /*################################################----INITIAL SORT----################################################################################
     These lines of code set the 'data-group-key' attribute of the device container, 
     retrieve the stored dashboard order from localStorage, and sort the devices according to the stored order. 
     If the initial sort order has not been stored yet, it stores the initial order for the dashboard and each group in localStorage.*/

      deviceContainer.setAttribute('data-group-key', 'dashboard'); // Set the 'data-group-key' attribute of the deviceContainer to 'dashboard'
      const storedDashboardOrder = localStorage.getItem('device-order-dashboard'); // Get the stored dashboard order from localStorage
      if (storedDashboardOrder) { // Check if the stored dashboard order exists
        const dashboardOrder = storedDashboardOrder.split('|'); // Split the stored dashboard order string into an array of device IDs
        sortable.sort(dashboardOrder); // Sort the devices in the device container according to the stored dashboard order
      }
      
      // Check if initialSortOrderStored is set to 'true' in localStorage
      if (!localStorage.getItem('initialSortOrderStored')) { // Check if the initial sort order has not been stored yet
        localStorage.setItem('initialSortOrderStored', 'true'); // Set 'initialSortOrderStored' to 'true' in localStorage
        const initialOrder = Array.from(document.querySelectorAll('.device-box')).map(device => device.getAttribute('device-id')).join('|'); // Get the initial order of the devices as a string of device IDs separated by '|'
        localStorage.setItem('device-order-dashboard', initialOrder); // Store the initial order for the dashboard
      
        // Iterate through groupData and store the initial order for each group
        for (const groupKey in groupData) { // Loop through the keys of the groupData object
          localStorage.setItem('device-order-' + groupKey, initialOrder); // Store the initial order for the current group in localStorage
        }
      }
      



  });


