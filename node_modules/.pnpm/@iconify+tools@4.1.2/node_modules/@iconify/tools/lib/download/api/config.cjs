'use strict';

const axiosConfig = {
  // Empty by default. Add properties
};
const fetchCallbacks = {
  onStart: (url) => console.log("Fetching:", url)
};

exports.axiosConfig = axiosConfig;
exports.fetchCallbacks = fetchCallbacks;
