# Aplicación de Cliente de Ejemplo

Aplicación Node.js con Express que permite crear y consultar pagos a través de la pasarela de pagos (Gateway API).

## 🚀 Características

- Formulario web para crear pagos con montos
- Consulta de estado de pagos por ID
- Confirmación de pagos mediante webhook desde el Gateway
- Servidor de archivos estáticos
- Interfaz moderna y responsiva

## 📋 Requisitos

- Node.js >= 18
- npm

## 🛠️ Instalación

```bash
npm install
```

## ▶️ Uso

Para iniciar el servidor:

```bash
npm start
```

El servidor se iniciará en `http://localhost:3001`

## 📁 Estructura del Proyecto

```
ExampleClientApp/
├── server.js           # Servidor Express con endpoints API
├── package.json        # Configuración y dependencias del proyecto
├── Dockerfile          # Imagen Docker para la aplicación
├── public/             # Archivos estáticos
│   ├── index.html      # Página principal con formulario de pago
│   ├── cobro.html      # Página de consulta de estado de pago
│   └── js/
│       ├── script.js   # Lógica del formulario de pago
│       └── cobro.js    # Lógica de consulta de pago
└── README.md          # Este archivo
```

## 🔌 Endpoints API

### POST `/api/pago/cobrar`

Crea un nuevo pago en el Gateway y lo almacena localmente.

**Request Body:**
```json
{
  "monto": 1000.50
}
```

**Response (éxito - 200):**
```json
{
  "success": true,
  "monto": 1000.50,
  "mensaje": "Monto procesado exitosamente",
  "id": "uuid-del-pago"
}
```

**Response (error - 400):**
```json
{
  "error": "El monto debe ser un número válido mayor a 0"
}
```

### GET `/api/pago/:id`

Consulta el estado de un pago por su ID.

**Response (éxito - 200):**
```json
{
  "id": "uuid-del-pago",
  "monto": 1000.50,
  "estado": "pendiente",
  "qr": "http://gateway:3000/payments/qr/uuid-externo"
}
```

**Response (error - 404):**
```json
{
  "error": "Pago no encontrado"
}
```

### POST `/api/pago/confirmar`

Webhook para recibir confirmaciones de pago desde el Gateway.

**Request Body:**
```json
{
  "id": "uuid-pago-externo",
  "fechaPago": "2025-11-29T12:35:20.000Z"
}
```

**Response (éxito - 200):**
```json
{
  "success": true,
  "mensaje": "Pago confirmado exitosamente"
}
```

## 🔧 Variables de Entorno

Crear archivo `.env`:
```
PORT=3001
API_URL=http://localhost:3000/payments
```

## 📝 Notas

- La aplicación almacena pagos en memoria (objeto `pagos` en `server.js`)
- Los pagos se crean con estado `pendiente` y se actualizan a `confirmado` mediante webhook
- Cada pago tiene un `id` local (UUID) y un `identificador` del Gateway
- El Gateway notifica automáticamente cuando un pago es confirmado
