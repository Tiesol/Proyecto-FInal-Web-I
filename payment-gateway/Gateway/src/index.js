import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import paymentsRouter from './routes/payments.js';
import { initDB } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());

// Static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/payments', paymentsRouter);

// Ruta para la billetera - sirve wallet.html para cualquier /wallet/{id}
app.get('/wallet/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'wallet.html'));
});

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Payments API' });
});

async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor por error en DB.');
  }
}

start();
