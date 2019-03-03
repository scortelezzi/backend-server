// Requires
var express = require('express');
var mongoose = require('mongoose');

//Inicializar variables
var app = express();

// Conexion a la BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) =>{
    if( err ) throw err;

    console.log('MongoDB corriendo en el puerto 27017: \x1b[32m%s\x1b[0m','ON LINE');
});

// Rutas
app.get('/', ( req, res, next ) =>{

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctameente'
    });
});


//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m','ON LINE');
})