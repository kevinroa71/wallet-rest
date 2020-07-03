const express = require('express');
const _ = require('underscore');
const Validator = require('better-validator');
const soap = require('soap');

const app = express();


// ###############
//    Funciones
// ###############

function parseError(code, errors) {
    return {
        ok: false,
        status: code,
        errors: errors
    };
}

function runValidator(validator) {
    const errors = validator.run();
    let mensajes = [];

    if (errors.length > 0) {
        errors.forEach(error => {
            error.path.forEach(path => {
                mensajes.push(`${path} is not valid. Reason: ${error.failed}`);
            });
        });
    }

    return mensajes;
}

function makeRequest(req, res, constraint, method) {
    const data = req.body;
    const validator = new Validator();

    validator(data).required().isObject(constraint);

    const errors = runValidator(validator);

    if (errors.length > 0) {
        return res.status(400).json(parseError(400, errors));
    }

    soap.createClientAsync(process.env.SOAP_WLS)
        .then(soapClient => soapClient[`${method}Async`](data))
        .then(result => {
            $json = JSON.parse(result[0].return.$value);
            if ($json) {
                return res.status($json.code).json($json);
            }
            return res.status(500).json(parseError(500, ["bad json to parse"]));
        })
        .catch(err => {
            return res.status(500).json(parseError(500, [err.toString()]));
        });
}


// ###############
// Rutas de la api
// ###############

app.post('/registro', (req, res) => {
    const constraint = (obj) => {
        obj('documento').required().isString();
        obj('nombres').required().isString();
        obj('email').required().isString();
        obj('celular').required().isString();
    };

    return makeRequest(req, res, constraint, 'registroCliente');
});

app.put('/recargar', (req, res) => {
    const constraint = (obj) => {
        obj('documento').required().isString();
        obj('celular').required().isString();
        obj('valor').required().isNumber();
    };

    return makeRequest(req, res, constraint, 'recargarBilletera');
});

app.get('/consultar', (req, res) => {
    const constraint = (obj) => {
        obj('documento').required().isString();
        obj('celular').required().isString();
    };

    return makeRequest(req, res, constraint, 'consultarSaldo');
});

app.post('/pagar', (req, res) => {
    const constraint = (obj) => {
        obj('documento').required().isString();
        obj('celular').required().isString();
        obj('valor').required().isNumber();
        obj('descripcion').required().isString();
    };

    return makeRequest(req, res, constraint, 'pagar');
});

app.post('/confirmar-pago', (req, res) => {
    const constraint = (obj) => {
        obj('token').required().isString();
        obj('session').required().isString();
    };

    return makeRequest(req, res, constraint, 'confirmarPago');
});


module.exports = app;
