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
        if (device.type === 'output') {
          deviceBox = createOutputDeviceBox(device_key, device);
          //deviceContainer.appendChild(deviceBox);
        } else if (device.type === 'input') {
          deviceBox = createInputDeviceBox(device_key, device);
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
      
        socket.on('device_output_status', (data) => {
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

    // listens information from the Server side about digital input statu
    socket.on('device_input_status', (data) => {
      const deviceKey = data.device_key;
      const deviceInputStatus = data.gpio_status;
      const deviceBox = document.querySelector(`.device-box[device-id="${deviceKey}"]`);
      updateDeviceInputStatus(deviceBox, deviceInputStatus);
      });

  });

  function navigate(tabName) {
    var tabContents = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }

    document.getElementById(tabName).style.display = "block";
}


