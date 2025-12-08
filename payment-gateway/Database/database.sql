-- Crear base de datos
CREATE DATABASE IF NOT EXISTS payments_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE payments_db;

-- Crear tabla pagos
CREATE TABLE IF NOT EXISTS pagos (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID del pago',
  fechaRegistro DATETIME NOT NULL COMMENT 'Fecha y hora de creación del pago',
  monto DECIMAL(10,2) NOT NULL COMMENT 'Monto del pago',
  estado VARCHAR(20) NOT NULL COMMENT 'Estado del pago (PENDING, CONFIRMED, etc.)',
  fechaPago DATETIME NULL COMMENT 'Fecha y hora de confirmación del pago'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;