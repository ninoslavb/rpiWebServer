  // Handle device name updates from the server
  function updateDeviceName(device_key, device_name) {
    const inputSelector = `#${device_key}-name`;
    const inputElement = document.querySelector(inputSelector);
  
    if (inputElement) {
      inputElement.value = device_name;
    }
  }
  // Send update to the server when the name change
  function attachDeviceNameUpdateListener(device_key) {
    const inputSelector = `#${device_key}-name`;
    const inputElement = document.querySelector(inputSelector);
  
    if (inputElement) {
      inputElement.addEventListener('change', (e) => {
        socket.emit('update_device_name', { device_key: device_key, device_name: e.target.value });
      });
    }
  }
 
  export { updateDeviceName, attachDeviceNameUpdateListener };