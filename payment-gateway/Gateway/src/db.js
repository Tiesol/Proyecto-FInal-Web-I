import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

let pool;

export async function initDB() {
  try {
    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Crear tabla si no existe
    const createSql = `CREATE TABLE IF NOT EXISTS pagos (
      id CHAR(36) PRIMARY KEY,
      fechaRegistro DATETIME NOT NULL,
      monto DECIMAL(10,2) NOT NULL,
      estado VARCHAR(20) NOT NULL,
      fechaPago DATETIME NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

    const conn = await pool.getConnection();
    await conn.query(createSql);
    conn.release();
    console.log('Tabla pagos verificada.');
  } catch (err) {
    console.error('Error inicializando DB:', err.message);
    throw err;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Pool de DB no inicializado. Llama initDB primero.');
  }
  return pool;
}
