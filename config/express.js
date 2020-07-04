const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// Cors
app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


// ==============
//  Routes
// ==============
app.use(require('../routes/cliente'));

module.exports = app;
