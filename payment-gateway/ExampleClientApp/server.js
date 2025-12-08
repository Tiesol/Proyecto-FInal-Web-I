require('dotenv').config();
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const API_URL = process.env.API_URL || '';

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

const pagos = {};
/*
abc=> {},
xyz=> {},
iyz=> {}
*/

// Endpoint para procesar el monto
app.post('/api/pago/cobrar', async (req, res) => {
    try {
        const { monto } = req.body;

        // Validar que el monto sea válido
        if (!monto || isNaN(monto) || monto <= 0) {
            return res.status(400).json({ 
                error: 'El monto debe ser un número válido mayor a 0' 
            });
        }

        console.log(`Procesando monto: $${monto}`);

        // Llamada a API externa de la pasarela de pagos
        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                monto: parseFloat(monto),
                timestamp: new Date().toISOString()
            })
        });

        const apiData = await apiResponse.json();

        const pagoId = uuidv4();//GUID
        const newPago = {
            id: pagoId,
            monto: parseFloat(monto),
            estado: 'pendiente',
            identificador: apiData.id || null,  //Id del pago en la pasarela de pagos
            creadoEn: new Date(),
            qr : apiData.qr || null
        };

        pagos[pagoId] = newPago;

        // Responder con los datos de la API externa
        res.json({
            success: true,
            monto: parseFloat(monto),
            mensaje: 'Monto procesado exitosamente',
            id: newPago.id
        });

    } catch (error) {
        console.error('Error al procesar el monto:', error.message);
        res.status(500).json({ 
            error: 'Error al procesar la solicitud',
            detalle: error.message 
        });
    }
});

app.get('/api/pago/:id', (req, res) => {
    
    const pagoId = req.params.id;
    const pago = pagos[pagoId];
    if (!pago) {
        return res.status(404).json({ error: 'Pago no encontrado' });
    }
    res.json({
        id: pago.id,
        monto: pago.monto,
        estado: pago.estado,
        qr: pago.qr
    });
});

app.post('/api/pago/confirmar', (req, res) => {
    const identificadorExternoPagado = req.body.id;
    const fechaPago = req.body.fechaPago;
    const pagoIds = Object.keys(pagos);

    console.log(`Confirmando pago para ID externo: ${identificadorExternoPagado} en fecha ${fechaPago}`);

    for (const pagoId of pagoIds) {
        const pago = pagos[pagoId];
        if (pago.identificador === identificadorExternoPagado) {

            console.log(`Pago encontrado. Actualizando estado a 'confirmado'.`);
            pago.estado = 'confirmado';
            pago.fechaPago = fechaPago;
            pagos[pagoId] = pago;
            console.table(pago);
            return res.json({ success: true, mensaje: 'Pago confirmado exitosamente' });
        }
    }

    res.status(404).json({ error: 'Pago no encontrado para el identificador proporcionado' });
})



// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
