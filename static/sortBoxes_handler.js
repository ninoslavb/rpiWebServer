const deviceContainer = document.querySelector('.device-container');
const sortable = Sortable.create(deviceContainer, {
animation: 150,
delay: 100,
delayOnTouchOnly: true,
dataIdAttr: 'device-id', // Use 'device-id' attribute as the unique key
store: {
  get: function (sortable) {
    const groupKey = deviceContainer.getAttribute('data-group-key');
    const orderKey = 'device-order-' + groupKey;
    const order = localStorage.getItem(orderKey);
    return order ? order.split('|') : [];
  },
  set: function (sortable) {
    const groupKey = deviceContainer.getAttribute('data-group-key');
    const orderKey = 'device-order-' + groupKey;
    const order = sortable.toArray();
    localStorage.setItem(orderKey, order.join('|'));
  },
},
});


