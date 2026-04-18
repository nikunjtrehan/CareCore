const http = require('http');

const postData = JSON.stringify({
  prompt: 'Hello, are you there?'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/query',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response body:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
