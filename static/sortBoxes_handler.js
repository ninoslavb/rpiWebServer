const deviceContainer = document.querySelector('.device-container');
const sortable = Sortable.create(deviceContainer, {
animation: 150,
delay: 100,
delayOnTouchOnly: true,
store: {
  get: function (sortable) {
    const order = localStorage.getItem('device-order');
    return order ? order.split('|') : [];
  },
  set: function (sortable) {
    const order = sortable.toArray();
    localStorage.setItem('device-order', order.join('|'));
  }
}
});