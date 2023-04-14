const deviceContainer = document.querySelector('.device-container');        // Select the device container element
const sortable = Sortable.create(deviceContainer, {                         // Create a new Sortable instance with the device container as the target element
  animation: 150,                                                           // Set the duration of the animation to 150ms
  delay: 100,                                                               // Set the delay before dragging starts to 100ms
  delayOnTouchOnly: true,                                                   // Apply the delay only on touch devices
  dataIdAttr: 'device-id',                                                  // Use the 'device-id' attribute as the unique key for each item
  store: {                                                                  // Define custom 'get' and 'set' functions for storing and retrieving the sort order
    get: function (sortable) {                                              // The 'get' function returns the stored order for the current group key
      const groupKey = deviceContainer.getAttribute('data-group-key');      // Get the current group key from the 'data-group-key' attribute of the device container
      const orderKey = 'device-order-' + groupKey;                          // Construct the order key by combining 'device-order-' and the group key
      const order = localStorage.getItem(orderKey);                         // Get the stored order for the current order key from localStorage
      return order ? order.split('|') : [];                                 // If the order exists, return it as an array of device IDs, otherwise return an empty array
    },
    set: function (sortable) {                                              // The 'set' function stores the current order of items for the current group key
      const groupKey = deviceContainer.getAttribute('data-group-key');      // Get the current group key from the 'data-group-key' attribute of the device container
      const orderKey = 'device-order-' + groupKey;                          // Construct the order key by combining 'device-order-' and the group key
      const order = sortable.toArray();                                     // Get the current order of items as an array of device IDs
      localStorage.setItem(orderKey, order.join('|'));                      // Store the current order as a string of device IDs separated by '|' in localStorage
    },
  },
});
