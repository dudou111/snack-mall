const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'src/utils/request.ts'), 'utf8');

assert(
  source.includes('getStoredAuthToken'),
  'request.ts should centralize token lookup in getStoredAuthToken'
);

assert(
  source.includes("localStorage.getItem('token')") || source.includes('localStorage.getItem("token")'),
  'request.ts should read the token key written by login'
);

assert(
  source.includes('JSON.parse'),
  'request.ts should parse JSON-stringified token values before sending Authorization'
);

console.log('request auth token tests passed');
