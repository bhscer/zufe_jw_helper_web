module.exports = {
  dev: {
    prod: false,
    BASE_URL: 'http://localhost:8080/',
    // BASE_URL: 'https://jw-api.bhscer.com/',
  },
  prod: {
    prod: true,
    BASE_URL: 'https://jw-api.bhscer.com/',
    // BASE_URL: 'http://172.31.140.189:8011', // special version for vm
  },
};
