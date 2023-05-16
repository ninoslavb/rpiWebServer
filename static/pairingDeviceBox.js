function createPairingDeviceBox(friendly_name, device) {
    const pairingdeviceBox = document.createElement('div');
    pairingdeviceBox.classList.add('pairing-device-box');
    pairingdeviceBox.setAttribute('pairing-device-id', friendly_name);
  
    const friendlyName = document.createElement('div');
    friendlyName.classList.add('device-friendly-name');
    friendlyName.textContent = `Device ID: ${friendly_name}`;
    pairingdeviceBox.appendChild(friendlyName);
  
    const deviceDescription = document.createElement('div');
    deviceDescription.classList.add('device-description');
    deviceDescription.textContent = `Description: ${device.description}`;
    pairingdeviceBox.appendChild(deviceDescription);
  
    const deviceModel = document.createElement('div');
    deviceModel.classList.add('device-model');
    deviceModel.textContent = `Model: ${device.model}`;
    pairingdeviceBox.appendChild(deviceModel);
  
    const deviceVendor = document.createElement('div');
    deviceVendor.classList.add('device-vendor');
    deviceVendor.textContent = `Vendor: ${device.vendor}`;
    pairingdeviceBox.appendChild(deviceVendor);
  
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    
    const acceptButton = document.createElement('button');
    acceptButton.classList.add('accept-button');
    acceptButton.textContent = 'Accept';
    acceptButton.setAttribute('data-friendly-name', friendly_name);  // Store friendly_name as an attribute
    buttonContainer.appendChild(acceptButton);

    const declineButton = document.createElement('button');
    declineButton.classList.add('decline-button');
    declineButton.textContent = 'Decline';
    declineButton.setAttribute('data-friendly-name', friendly_name);  // Store friendly_name as an attribute
    buttonContainer.appendChild(declineButton);

    pairingdeviceBox.appendChild(buttonContainer);



    return pairingdeviceBox;
}
export {createPairingDeviceBox};