const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/api/config', (request, response) => {
	response.sendFile(path.join(__dirname, '..', 'config', 'config.json'));
});

app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/*', (request, response) => {
	response.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(9000);
