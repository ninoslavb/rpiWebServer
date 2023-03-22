document.addEventListener('DOMContentLoaded', () => {
  const socket = io.connect();

  socket.on('relay_status', (data) => {
    document.querySelector('#relay-status').textContent = data.Relay;
  });

  const sendUpdate = (action) => {
    socket.emit('relay_update', { action: action });
  };

  document.querySelector('#relay-on').addEventListener('click', (e) => {
    e.preventDefault();
    sendUpdate('on');
  });

  document.querySelector('#relay-off').addEventListener('click', (e) => {
    e.preventDefault();
    sendUpdate('off');
  });
});