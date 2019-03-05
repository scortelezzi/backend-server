var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var md_Autenticacion = require('../middlewares/autenticacion');


var app = express();


var Hospital = require('../models/hospital');

// ==============================================
// Obtener todos los hospitales
// ==============================================
app.get('/', ( req, res, next ) => {


    var desde = req.query.desde || 0;
    desde = Number( desde );

    Hospital.find({  }) 
        .skip(desde)
        .limit(5)   
        .populate('usuario', 'nombre email')       
        .exec(
            (err, hospitales) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors : err
                });
            }

            Hospital.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });


            });


    })
});

// ==============================================
// Actualizar usuario
// ==============================================

app.put('/:id',md_Autenticacion.verificaToken, (req, res) =>{

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, (err, hospital) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar hospital',
                errors : err
            });
        }
        
        if(!hospital){
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encontro el hospital con el id ' + id,
                errors : { message: 'No existe el hospital con ese ID'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = body.usuario._id;

        hospital.save( (err, hospitalGuardado) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors : err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// ==============================================
// Crear un nuevo hospital
// ==============================================
app.post('/', md_Autenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital =  new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( (err, hospitalGuardado) =>{
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors : err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario
        });

    });
});

// ==============================================
// Elimina un usuario
// ==============================================

app.delete('/:id',md_Autenticacion.verificaToken, (req, res) =>{

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar hospital',
                errors : err
            });
        }

        if(!hospitalBorrado){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors : { message:'No existe un hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: hospitalBorrado
        });

    });

});


module.exports = app;