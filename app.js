const express = require('express');
const app = express();
const swig = require('swig');
var request = require('request');
const port = process.env.PORT || 3000;
// Leer body
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Session
const expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

//Acceso a contenido carpeta public
app.use(express.static('public'));


// Router - zonaprivada
var zonaprivada = express.Router();

zonaprivada.use(function (req, res, next) {

    if (req.session.usuario) {
        // dejamos correr la petición
        next();
    } else {
        req.session.destino = req.originalUrl;
        console.log("va a : " + req.session.destino)
        res.redirect("/login");
    }

});

// Aplicar zonaprivada a las siguientes URLs
app.use("/privado/dashboard", zonaprivada);
app.use("/privado/vehiculos", zonaprivada);
app.use("/privado/vehiculo", zonaprivada);

/**
 * Abre pagina index.html
 */
app.get('/', function (req, res) {
    var respuesta = swig.renderFile("vistas/index.html", {});
    res.send(respuesta);
});
/**
 * Abre pagina registro.html
 */
app.get('/registro', function (req, res) {
    var respuesta = swig.renderFile("vistas/registro.html", {});
    res.send(respuesta);
});
/**
 * Abre pagina login.html
 */
app.get('/login', function (req, res) {
    var respuesta = swig.renderFile("vistas/login.html", {});
    res.send(respuesta);
});
/**
 * Abre pagina dashboard.html
 */
app.get('/privado/dashboard', function (req, res) {
    var respuesta = swig.renderFile('vistas/privado/dashboard.html', {
        usuario: req.session.usuario
    });
    res.send(respuesta);
});

/**
 * Guarda un usuario 
 */
app.post('/guardarUsuario', function (req, res) {
    //Recupera valores del formulario
    var usuario = {
        nombres: req.body.nombres,
        correo: req.body.correo,
        clave: req.body.clave
    }
    //consume servicio web rest 
    var configuraApi = {
        url: "https://app-server-vehiculos.herokuapp.com/usuario",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: usuario
    }
    request(configuraApi, function (err, response, body) {
        if (err) {
            var respuesta = swig.renderFile('vistas/error.html', {
                mensaje: "Ha ocurrido un error"
            });
            res.send(respuesta);
        }
        if (body.error) {
            var respuesta = swig.renderFile('vistas/error.html', {
                mensaje: body.mensaje
            });
            res.send(respuesta);
        }
        else {
            res.redirect("/login");
        }
    });
});



/**-------------
*/

/**
 * Abre pagina de datos del vehiculo.html
 */
app.get('/privado/vehiculo', function (req, res) {
    var respuesta = swig.renderFile('vistas/privado/vehiculo.html', {
        titulo: "Crear Vehículo",
        usuario: req.session.usuario
    });
    res.send(respuesta);
});

/**
 * Abre pagina de datos del vehiculo.html
 */
app.get('/privado/vehiculo/:id', function (req, res) {
    var idVehiculo = req.params.id;

    //consume servicio web rest 
    var configuraApi = {
        url: "https://app-server-vehiculos.herokuapp.com/vehiculo/" + idVehiculo,
        method: "GET",
        json: true,
        headers: {
            "content-type": "application/json",
            "token": req.session.token, //Envia token de sessión
        }
    }
    request(configuraApi, function (err, response, body) {
        if (err) {
            var respuesta = swig.renderFile('vistas/error.html', {
                mensaje: "Ha ocurrido un error"
            });
            res.send(respuesta);
        }
        console.log(body);
        var respuesta = swig.renderFile('vistas/privado/vehiculo.html', {
            titulo: "Modificar Vehículo",
            vehiculo: body.vehiculo[0],
            usuario: req.session.usuario
        });
        res.send(respuesta);
    });

});


app.get('/privado/vehiculos', function (req, res) {
    //consume servicio web rest 
    var configuraApi = {
        url: "https://app-server-vehiculos.herokuapp.com/vehiculo",
        method: "GET",
        json: true,
        headers: {
            "content-type": "application/json",
            "token": req.session.token, //Envia token de sessión
        }
    }
    request(configuraApi, function (err, response, body) {
        if (err) {
            var respuesta = swig.renderFile('vistas/error.html', {
                mensaje: "Ha ocurrido un error"
            });
            res.send(respuesta);
        }
        var respuesta = swig.renderFile('vistas/privado/vehiculos.html', {
            usuario: req.session.usuario,
            vehiculos: body.vehiculos

        });
        res.send(respuesta);
    });
});

/**
 * Guarda un vehiculo 
 */
app.post('/guardarVehiculo', function (req, res) {
    //Recupera valores del formulario
    var vehiculo = {
        marca: req.body.marca,
        modelo: req.body.modelo,
        precio: req.body.precio,
        color: req.body.color,
        anio: req.body.anio,
        urlImagen: req.body.urlImagen
    }
    //consume servicio web rest 
    var configuraApi = {
        url: "https://app-server-vehiculos.herokuapp.com/vehiculo",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
            "token": req.session.token, //Envia token de sessión
        },
        body: vehiculo
    }
    request(configuraApi, function (err, response, body) {
        if (err) {
            var respuesta = swig.renderFile('vistas/error.html', {
                mensaje: "Ha ocurrido un error"
            });
            res.send(respuesta);
        }
        var respuesta = swig.renderFile('vistas/privado/vehiculo.html', {
            titulo: "Crear Vehículo",
            mensaje: body.mensaje,
            usuario: req.session.usuario
        });
        res.send(respuesta);
    });
});



/**
 * Guarda un vehiculo 
 */
app.post('/modificarVehiculo/:id', function (req, res) {
    var idVehiculo = req.params.id;
    //Recupera valores del formulario
    var vehiculo = {
        marca: req.body.marca,
        modelo: req.body.modelo,
        precio: req.body.precio,
        color: req.body.color,
        anio: req.body.anio,
        urlImagen: req.body.urlImagen
    }
    //consume servicio web rest 
    var configuraApi = {
        url: "https://app-server-vehiculos.herokuapp.com/vehiculo/"+idVehiculo,
        method: "PUT",
        json: true,
        headers: {
            "content-type": "application/json",
            "token": req.session.token, //Envia token de sessión
        },
        body: vehiculo
    }
    request(configuraApi, function (err, response, body) {
        if (err) {
            var respuesta = swig.renderFile('vistas/error.html', {
                mensaje: "Ha ocurrido un error"
            });
            res.send(respuesta);
        }
        var respuesta = swig.renderFile('vistas/privado/vehiculo.html', {
            titulo: "Modificar Vehículo",
            mensaje: body.mensaje,
            usuario: req.session.usuario,
            vehiculo: vehiculo
        });
        res.send(respuesta);
    });
});

app.post('/login', function (req, res) {
    //Recupera valores del formulario
    var credenciales = {
        correo: req.body.correo,
        clave: req.body.clave
    }
    //consume servicio web rest 
    var configuraApi = {
        url: "https://app-server-vehiculos.herokuapp.com/autentificar",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: credenciales
    }
    request(configuraApi, function (err, response, body) {
        if (err) {
            var respuesta = swig.renderFile('vistas/error.html', {
                mensaje: "Ha ocurrido un error"
            });
            res.send(respuesta);
        }
        if (body.error) {
            var respuesta = swig.renderFile('vistas/login.html', {
                mensaje: body.mensaje
            });
            res.send(respuesta);
        }
        else {
            // Encontrado
            req.session.usuario = body.usuario;
            req.session.token = body.token;
            res.redirect("/privado/dashboard");
        }
    });
});


app.get('/logout', function (req, res) {
    req.session.usuario = null;
    req.session.token = null;
    res.redirect("/");
})


app.listen(port, function () {
    console.log(`Escuchando peticiones en el puerto ${port}`);
});


