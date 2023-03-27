import { updateDeviceName, attachDeviceNameUpdateListener } from './deviceName_handler.js';


document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect(); //connect the socket

    // Handle device name updates from the server and send the name update to the server when it is changed
      socket.on('device_name_updated', (data) => {
      updateDeviceName(data.device_key, data.device_name);
      attachDeviceNameUpdateListener(data.device_key); //attach the listener, and send the update to the server when new name is entered
      });


    //function to send relay_update
    const sendUpdate = (action) => {
      socket.emit('relay_update', { action: action });
    };
    //When the relay-input (slider) is changed / pressed, send action to the server
    document.querySelector('#relay-input').addEventListener('change', (e) => {
      e.preventDefault();
      if (e.target.checked) {
        sendUpdate('on');
      } else {
        sendUpdate('off');
      }
    });

    //Server sends back infromation if it is on (1) of off (0), and slider is changed accordingly
      socket.on('relay_status', (data) => {
      const relayStatus = data.Relay;
      if(relayStatus === 1) {
        document.querySelector('#relay-input').checked = true;
      }
      else {
      document.querySelector('#relay-input').checked = false;
      }
    });

    //function to update sensor box
    function updateSensorStatus(sensorBox, sensorStatus) {
    if (sensorStatus === 0) {
    sensorBox.classList.add('sensor-connected');
     } else {
    sensorBox.classList.remove('sensor-connected');
    }
    }

    //when the sensor status is updated, update sensor box with the new info (this means the box will be transparent)
    socket.on('sensor1_status', (data) => {
    const sensor1Box = document.querySelector('.device-box[data-id="2"]');
    updateSensorStatus(sensor1Box, data.Sensor1);
    });

    socket.on('sensor2_status', (data) => {
    const sensor2Box = document.querySelector('.device-box[data-id="3"]');
    updateSensorStatus(sensor2Box, data.Sensor2);
    });

    socket.on('sensor3_status', (data) => {
    const sensor3Box = document.querySelector('.device-box[data-id="4"]');
    updateSensorStatus(sensor3Box, data.Sensor3);
    });

    socket.on('sensor4_status', (data) => {
    const sensor4Box = document.querySelector('.device-box[data-id="5"]');
    updateSensorStatus(sensor4Box, data.Sensor4);
    });

  });