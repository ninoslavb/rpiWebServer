import { updateDeviceName, attachDeviceNameUpdateListener } from './deviceName_handler.js';


document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect(); //connect the socket

    

    // Handle device name updates from the server and send the name update to the server when it is changed
      socket.on('device_name_updated', (data) => {
      updateDeviceName(data.device_key, data.device_name);
      attachDeviceNameUpdateListener(data.device_key); //attach the listener, and send the update to the server when new name is entered
      });


      const sendUpdate = (device_key, action) => {
        socket.emit('device_update', { device_key: device_key, action: action });
      };
      
      // Add the device keys of devices with type 'output'
      //const outputDeviceKeys = Object.keys(deviceData).filter((device_key) => deviceData[device_key].type === 'output');
      const outputDeviceKeys = ['relay1', 'relay2'];
      
      outputDeviceKeys.forEach((device_key) => {
        document.querySelector(`#${device_key}-input`).addEventListener('change', (e) => {
          e.preventDefault();
          if (e.target.checked) {
            sendUpdate(device_key, 'on');
          } else {
            sendUpdate(device_key, 'off');
          }
        });
      
        socket.on('device_status', (data) => {
          if (data.device_key === device_key) {
            const deviceStatus = data.status;
            if (deviceStatus === 1) {
              document.querySelector(`#${device_key}-input`).checked = true;
            } else {
              document.querySelector(`#${device_key}-input`).checked = false;
            }
          }
        });
      });
      

    //function to update sensor box
    function updateSensorStatus(sensorBox, sensorStatus) {
    if (sensorStatus === 0) {
    sensorBox.classList.add('sensor-connected');
     } else {
    sensorBox.classList.remove('sensor-connected');
    }
    }

    // listens information from the Server side about sensor status (digital input status)
    socket.on('sensorStatus', (data) => {
      const deviceKey = data.device_key;
      const deviceStatus = data.status;
      const boxID= deviceData[deviceKey].box_id;
      const deviceBox = document.querySelector(`.device-box[data-id="${boxID}"]`);
      updateSensorStatus(deviceBox, deviceStatus);
      });


    //if this, then this example
    /*socket.on('sensor1_status', (data) => {
    const mapping = document.querySelector(`option[value="sensor1-relay1"]`);
    if (mapping) {
      if(data.Sensor1===0) //if sensor is closed
      sendUpdate1('on')
      else 
      sendUpdate1('off')
    }
  });
  */

  });

