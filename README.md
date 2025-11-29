# RiseUp - Plataforma de Crowdfunding

Plataforma de financiación colectiva desarrollada con FastAPI (Backend) y HTML/CSS/JavaScript vanilla (Frontend).

## 🚀 Inicio Rápido con Docker

### Requisitos
- Docker
- Docker Compose

### Iniciar la aplicación

```bash
# Desde la raíz del proyecto
docker-compose up --build
```

### URLs de acceso

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Documentación API (Swagger)**: http://localhost:3000/docs
- **Base de datos PostgreSQL**: localhost:5433

### Credenciales por defecto

**Administrador:**
- Email: admin@riseup.com
- Password: admin123

## 📁 Estructura del Proyecto

```
Proyecto-final/
├── backend/                    # API FastAPI
│   ├── app/
│   │   ├── core/              # Configuración, DB, seguridad
│   │   ├── models/            # Modelos SQLModel
│   │   ├── routers/           # Endpoints de la API
│   │   ├── services/          # Servicios (email, etc.)
│   │   ├── main.py            # Punto de entrada
│   │   └── init_db.py         # Script de inicialización
│   ├── Dockerfile
│   └── requirements.txt
├── FrontEnd/                   # Interfaz de usuario
│   ├── assets/
│   │   ├── css/
│   │   └── images/
│   ├── js/
│   │   └── api/               # Llamadas a la API
│   ├── pages/                 # Páginas HTML
│   ├── Dockerfile
│   └── nginx.conf
├── database/
│   └── init.sql               # Script de inicialización de BD
└── docker-compose.yml
```

## 🔧 Desarrollo Local (Sin Docker)

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o: venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor
uvicorn app.main:app --reload --port 3000
```

### Frontend

Usar cualquier servidor HTTP estático:

```bash
cd FrontEnd

# Con Python
python -m http.server 8080

# O con npx
npx serve -p 8080
```

## 📧 Configuración de Email (Mailtrap)

El proyecto usa Mailtrap para envío de correos en desarrollo. Las credenciales están configuradas en:

- `backend/.env`
- `docker-compose.yml`

Para ver los correos enviados, accede a tu cuenta de Mailtrap.

## 🔐 Endpoints de la API

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/verify/{token}` - Verificar email
- `GET /auth/profile` - Obtener perfil (requiere auth)
- `PUT /auth/profile` - Actualizar perfil (requiere auth)

### Campañas
- `GET /campaigns/public` - Listar campañas públicas
- `GET /campaigns/featured` - Campañas destacadas
- `GET /campaigns/public/{id}` - Detalle de campaña
- `GET /campaigns/my-campaigns` - Mis campañas (requiere auth)
- `POST /campaigns` - Crear campaña (requiere auth)
- `PUT /campaigns/{id}` - Editar campaña (requiere auth)
- `DELETE /campaigns/{id}` - Eliminar campaña (requiere auth)
- `POST /campaigns/{id}/submit-for-review` - Enviar a revisión
- `POST /campaigns/{id}/start` - Iniciar recaudación
- `POST /campaigns/{id}/pause` - Pausar recaudación

### Donaciones
- `POST /donations` - Realizar donación (requiere auth)
- `GET /donations/my-donations` - Mis donaciones
- `GET /donations/campaign/{id}` - Donaciones de campaña
- `GET /donations/campaign/{id}/top-donors` - Top donadores

### Favoritos
- `POST /favorites` - Agregar a favoritos
- `DELETE /favorites/{campaign_id}` - Quitar de favoritos
- `GET /favorites` - Mis favoritos

### Administración
- `GET /admin/campaigns` - Listar todas las campañas
- `POST /admin/campaigns/{id}/approve` - Aprobar campaña
- `POST /admin/campaigns/{id}/observe` - Observar campaña
- `POST /admin/campaigns/{id}/reject` - Rechazar campaña
- `GET /admin/users` - Listar administradores
- `POST /admin/users` - Crear administrador

### Catálogos
- `GET /categories` - Listar categorías
- `GET /countries` - Listar países
- `GET /payment-methods` - Métodos de pago

## 🗃️ Base de Datos

La base de datos PostgreSQL se inicializa automáticamente con:

- Roles (Administrador, Usuario)
- 22 países de habla hispana
- 12 categorías de proyectos
- Estados de workflow y campaña
- Métodos de pago
- Usuario administrador por defecto

## 🛠️ Tecnologías

### Backend
- **FastAPI** - Framework web moderno y rápido
- **SQLModel** - ORM que combina SQLAlchemy y Pydantic
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **Mailtrap** - Servicio de email para desarrollo

### Frontend
- **HTML5/CSS3** - Estructura y estilos
- **JavaScript ES6+** - Lógica del cliente
- **Font Awesome** - Iconos
- **Nginx** - Servidor web

### DevOps
- **Docker** - Contenedores
- **Docker Compose** - Orquestación

## 📝 Licencia

Este proyecto es para fines educativos - Universidad NUR.
