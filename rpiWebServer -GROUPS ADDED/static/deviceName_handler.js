  // Handle device name updates from the server
  function updateDeviceName(device_key, device_name) {
    const inputSelector = `#${device_key}-name`;
    const inputElement = document.querySelector(inputSelector);
  
    if (inputElement) {
      inputElement.value = device_name;
    }
  }


  //function that check if name exists
  /*##################################################################################################################################################################################################################################################################################
  deviceData.hasOwnProperty(key): This checks if the deviceData object has a property with the name key. This is useful to ensure that we're only considering properties that belong to the deviceData object itself and not any properties that might be inherited from its prototype.
  key !== device_key: This condition checks if the current key in the loop is not the same as the device_key parameter. This is important because we want to compare the name with other devices, not the device itself.
  deviceData[key].name.toLowerCase() === name.toLowerCase(): This condition checks if the name of the device (converted to lowercase) at the current key is equal to the name parameter (also converted to lowercase). Converting both names to lowercase ensures that the comparison is case-insensitive, so "DeviceName" and "devicename" would be considered the same.
  All three conditions are combined using the logical AND operator (&&). This means that for the overall condition to be true, all three individual conditions must be true. If any of them are false, the overall condition will be false.
  
  */
  function doesNameExist(name, device_key) {
    for (const key in deviceData) {
      if (deviceData.hasOwnProperty(key) && key !== device_key && deviceData[key].name.toLowerCase() === name.toLowerCase()) {
        return true;
      }
    }
    return false;
  }
  

  // Send update to the server when the name change
  /* when user try to update the device name to an existing name, the function will show an alert, 
  reset the input field to its original value, and return without sending an update to the server.*/
  function attachDeviceNameUpdateListener(device_key) {
    const inputSelector = `#${device_key}-name`;
    const inputElement = document.querySelector(inputSelector);
    const socket = io.connect(); //connect the socket
  
    if (inputElement) {
      inputElement.addEventListener('change', (e) => {
        const newName = e.target.value.trim();
        
        if (doesNameExist(newName, device_key)) {
          alert("The name already exists. Please choose a different name.");
          inputElement.value = deviceData[device_key].name; // Reset the input field to its original value
          return;
        }
  
        socket.emit('update_device_name', { device_key: device_key, device_name: newName });
      });
    }
  }
  
 
  export { updateDeviceName, attachDeviceNameUpdateListener };