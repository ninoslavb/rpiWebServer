import { updateDeviceName, attachDeviceNameUpdateListener } from './deviceName_handler.js';
import { createOutputDeviceBox, createInputDeviceBox } from './deviceBoxTemplates.js';



document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect(); //connect the socket


    //Add device boxes
      const deviceContainer = document.querySelector(".device-container");
      const DeviceKeys = Object.keys(deviceData)

      DeviceKeys.forEach((device_key) => {
        const device = deviceData[device_key];
        let deviceBox;
        if (device.type === 'input') {
          deviceBox = createInputDeviceBox(device_key, device);
          //deviceContainer.appendChild(deviceBox);
        } else if (device.type === 'output') {
          deviceBox = createOutputDeviceBox(device_key, device);
          //deviceContainer.appendChild(deviceBox);
        } else {
          return; // Skip the device if it has an unrecognized type
        }
        deviceContainer.appendChild(deviceBox);
      });





    // Handle device name updates from the server and send the name update to the server when it is changed
      socket.on('device_name_updated', (data) => {
      updateDeviceName(data.device_key, data.device_name);
      attachDeviceNameUpdateListener(data.device_key); //attach the listener, and send the update to the server when new name is entered
      });


      const sendUpdate = (device_key, action) => {
        socket.emit('device_output_update', { device_key: device_key, action: action });
      };
      
      // Add the device keys of devices with type 'output'
      const outputDeviceKeys = Object.keys(deviceData).filter((device_key) => deviceData[device_key].type === 'output');
      //const outputDeviceKeys = ['relay1', 'relay2'];
      
    
      outputDeviceKeys.forEach((device_key) => {
      
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
            const deviceOutputStatus = data.gpio_status;
            if (deviceOutputStatus === 1) {
              document.querySelector(`#${device_key}-input`).checked = true;
            } else {
              document.querySelector(`#${device_key}-input`).checked = false;
            }
          }
        });
      });
      

    //function to update deviceInput box
    function updateDeviceInputStatus(deviceInputBox, deviceInputStatus) {
    if (deviceInputStatus === 0) {
    deviceInputBox.classList.add('device-input-connected');
     } else {
    deviceInputBox.classList.remove('device-input-connected');
    }
    }

    // listens information from the Server side about digital input status
    socket.on('device_input_status', (data) => {
      const deviceKey = data.device_key;
      const deviceInputStatus = data.gpio_status;
      const deviceBox = document.querySelector(`.device-box[device-id="${deviceKey}"]`);
      updateDeviceInputStatus(deviceBox, deviceInputStatus);
      });



     /*################################################################################################################################
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


