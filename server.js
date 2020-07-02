require('./config/config');
const express = require('express');

const app = express();
app.use(require('./config/express'));

app.listen(process.env.PORT, () => {
    console.log("Servidor escuchando por el puerto", process.env.PORT);
});
