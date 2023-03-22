//connect to WebSocket server
document.addEventListener('DOMContentLoaded', () => {
  const socket = io.connect(); 

  //Listens for 'relay_status' events and updates the DOM with the new status.
  socket.on('relay_status', (data) => {
    document.querySelector('#relay-status').textContent = data.Relay;
  });

  //Defines a function sendUpdate for sending relay updates to the server.
  const sendUpdate = (action) => {
    socket.emit('relay_update', { action: action });
  };
//Adds click event listeners for the "ON" and "OFF" buttons, calling the sendUpdate function with the appropriate action.
  document.querySelector('#relay-on').addEventListener('click', (e) => {
    e.preventDefault();
    sendUpdate('on');
  });

  document.querySelector('#relay-off').addEventListener('click', (e) => {
    e.preventDefault();
    sendUpdate('off');
  });
});
