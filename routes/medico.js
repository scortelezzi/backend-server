var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var md_Autenticacion = require('../middlewares/autenticacion');


var app = express();


var Medico = require('../models/medico');

// ==============================================
// Obtener todos los usuarios
// ==============================================
app.get('/', ( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number( desde );

    Medico.find({  })
        .skip(desde)
        .limit(5)     
        .populate('usuario', 'usuario email')
        .populate('hospital', 'nombre')       
        .exec(
            (err, medicos) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors : err
                });
            }

            Medico.count({}, (err, conteo) =>{
                
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
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

    Medico.findById( id, (err, medico) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar medico',
                errors : err
            });
        }
        
        if(!medico){
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encontro el medico con el id ' + id,
                errors : { message: 'No existe el medico con ese ID'}
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        
        medico.save( (err, medicoGuardado) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    body: body,
                    errors : err
                });
            }

            medicoGuardado.password = ':=)';

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// ==============================================
// Crear un nuevo usuario
// ==============================================
app.post('/', md_Autenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico =  new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( (err, medicoGuardado) =>{
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                body: body,
                errors : err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario
        });

    });
});

// ==============================================
// Elimina un usuario
// ==============================================

app.delete('/:id',md_Autenticacion.verificaToken, (req, res) =>{

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar medico',
                errors : err
            });
        }

        if(!medicoBorrado){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors : { message:'No existe un medico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});


module.exports = app;