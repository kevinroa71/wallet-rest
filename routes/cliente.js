const express = require('express');
const _ = require('underscore');
const Validator = require('better-validator');
const soap = require('soap');

const app = express();


function parseError(code, errors) {
    return {
        ok: false,
        status: code,
        errors: errors
    };
}


app.post('/registro', (req, res) => {
    const cliente = req.body;
    const validator = new Validator();

    validator(cliente).required().isObject((obj) => {
        obj('documento').required().isString();
        obj('nombres').required().isString();
        obj('email').required().isString();
        obj('celular').required().isString( );
    });

    const errors = validator.run();

    if (errors.length > 0) {
        let mensajes = [];
        errors.forEach(error => {
            error.path.forEach(path => {
                mensajes.push(`${path} is not valid. Reason: ${error.failed}`);
            });
        });

        return res.status(400).json(parseError(400, mensajes));
    }

    soap.createClientAsync(process.env.SOAP_WLS)
        .then(soapClient => {
            return soapClient.registroClienteAsync(cliente);
        })
        .then(result => {
            $json = JSON.parse(result[0].return.$value);
            if ($json) {
                res.status($json.code).json($json);
            }
            res.status(500).json(parseError(500, ["bad json to parse"]));
        })
        .catch(err => {
            res.status(500).json(parseError(500, [err.toString()]));
        });
});


module.exports = app;
