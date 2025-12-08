# Payments API

API en Node.js + Express para registrar y confirmar pagos almacenados en MySQL.

## Requisitos
- Node.js >= 18
- MySQL 5.7+ / 8+

## Instalación
```bash
npm install
```

## Variables de entorno
Duplicar `.env.example` en `.env` y ajustar credenciales:
```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secret
DB_NAME=payments_db
PUBLIC_URL=http://localhost:3000
CONFIRMATION_HOOK_ENDPOINT=http://localhost:3001/api/pago/confirmar
```

## Inicializar base de datos
La aplicación crea automáticamente la tabla `pagos` si no existe al arrancar.

## Ejecutar
```bash
npm start
```
Modo desarrollo con recarga:
```bash
npm run dev
```

## Endpoints

### Crear pago
`POST /payments`

Body (JSON):
```json
{
  "monto": 123.45
}
```

Respuesta 201:
```json
{
  "id": "uuid",
  "fechaRegistro": "2025-11-29T12:34:56.000Z",
  "monto": 123.45,
  "estado": "PENDING",
  "fechaPago": null,
  "paymentUrl": "http://localhost:3000/pay.html?id=uuid"
}
```

### Confirmar pago (Webhook interno)
`POST /payments/:id/confirm`

Respuesta 200:
```json
{
  "id": "uuid",
  "fechaRegistro": "2025-11-29T12:34:56.000Z",
  "monto": 123.45,
  "estado": "CONFIRMED",
  "fechaPago": "2025-11-29T12:35:20.000Z"
}
```

Ejecuta un POST al `CONFIRMATION_HOOK_ENDPOINT` con el pago confirmado.

### Obtener pago por ID
`GET /payments/:id`

Respuesta 200:
```json
{
  "id": "uuid",
  "fechaRegistro": "2025-11-29T12:34:56.000Z",
  "monto": 123.45,
  "estado": "PENDING",
  "fechaPago": null
}
```

Respuesta 404 si no existe.

## CORS
Se permite cualquier origen (`*`).

## Archivos estáticos
Servidos desde `public/`. 
- Raíz (`/`) muestra `index.html`
- `/pay.html?id=<uuid>` página de confirmación de pago

## Notas
- `monto` se almacena como DECIMAL(10,2). Se devuelve como número.
- `id` es UUID v4 generado automáticamente.
- Estados posibles: `PENDING`, `CONFIRMED`.
- Al confirmar, se notifica al `CONFIRMATION_HOOK_ENDPOINT` configurado.

## Futuras mejoras (sugeridas)
- Validación avanzada y sanitización.
- Registro de auditoría.
- Tests automatizados.
- Manejo de estados adicionales (FAILED, CANCELLED).