const express = require('express');
const app = express();
const swig = require('swig');
var request = require('request');
const port = process.env.PORT || 3000;

//Acceso a contenido carpeta public
app.use(express.static('public'));

/**
 * Abre pagina index.html
 */
app.get('/', function (req, res) {
    var respuesta = swig.renderFile("vistas/index.html",
        {            
        }
    );
    res.send(respuesta);
});
/**
 * Abre pagina registro.html
 */
app.get('/registro', function (req, res) {
    var respuesta = swig.renderFile("vistas/registro.html",
        {}
    );
    res.send(respuesta);
});
/**
 * Abre pagina login.html
 */
app.get('/login', function (req, res) {
    var respuesta = swig.renderFile("vistas/login.html",
        {}
    );
    res.send(respuesta);
});




app.post('/login', function (req, res) {
    //Recupera valores del formulario
    var credenciales = {
        correo: '1111',
        clave: '222'
    }
    var configuraApi = {
        url: "https://app-server-vehiculos.herokuapp.com/usuario/autentificar",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: credenciales
    }
    request(configuraApi, function (error, response, body) {
                console.log(body.token);
    });


});


app.listen(port, function () {
    console.log(`Escuchando peticiones en el puerto ${port}`);
});


