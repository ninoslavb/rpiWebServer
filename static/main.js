import { updateDeviceName, attachDeviceNameUpdateListener } from './deviceName_handler.js';


document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect(); //connect the socket

    

    // Handle device name updates from the server and send the name update to the server when it is changed
      socket.on('device_name_updated', (data) => {
      updateDeviceName(data.device_key, data.device_name);
      attachDeviceNameUpdateListener(data.device_key); //attach the listener, and send the update to the server when new name is entered
      });


    //function to send relay1_update
    const sendUpdate1 = (action) => {
      socket.emit('relay1_update', { action: action });
    };
    //When the Relay1-input (slider) is changed / pressed, send action to the server
    document.querySelector('#relay1-input').addEventListener('change', (e) => {
      e.preventDefault();
      if (e.target.checked) {
        sendUpdate1('on');
      } else {
        sendUpdate1('off');
      }
    });

    //Server sends back infromation if it is on (1) of off (0), and slider is changed accordingly
      socket.on('relay1_status', (data) => {
      const relay1Status = data.Relay1;
      if(relay1Status === 1) {
        document.querySelector('#relay1-input').checked = true;
      }
      else {
      document.querySelector('#relay1-input').checked = false;
      }
    });


      //function to send relay2_update
        const sendUpdate2 = (action) => {
          socket.emit('relay2_update', { action: action });
        };
        //When the Relay2-input (slider) is changed / pressed, send action to the server
        document.querySelector('#relay2-input').addEventListener('change', (e) => {
          e.preventDefault();
          if (e.target.checked) {
            sendUpdate2('on');
          } else {
            sendUpdate2('off');
          }
        });
    
        //Server sends back infromation if it is on (1) of off (0), and slider is changed accordingly
          socket.on('relay2_status', (data) => {
          const relay2Status = data.Relay2;
          if(relay2Status === 1) {
            document.querySelector('#relay2-input').checked = true;
          }
          else {
          document.querySelector('#relay2-input').checked = false;
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


    //if this, then this example
   /* socket.on('sensor1_status', (data) => {
    const mapping = document.querySelector(`option[value="sensor1-relay1"]`);
    if (mapping) {
      if(data.Sensor1===0) //if sensor is closed
      sendUpdate1('on')
      else 
      sendUpdate1('off')
    }
  });*/
  

  });

 