# 📁 Estructura de JavaScript - Frontend

## 🎯 Arquitectura

```
FrontEnd/js/
├── api/
│   └── auth.js          # ⚙️ Funciones puras de API (fetch)
├── auth-check.js        # 🔒 Protección de rutas y utilities
├── login.js             # 📄 Lógica de login.html (DOM)
├── register.js          # 📄 Lógica de register.html (DOM)
└── index-logged.js      # 📄 Lógica de index-logged.html (DOM)
```

---

## 📦 Módulos

### **api/auth.js** - Capa de API
**Responsabilidad:** Comunicación con el backend (NO toca el DOM)

Funciones disponibles:
- `register(userData)` - Registra nuevo usuario
- `login(email, password)` - Inicia sesión y guarda token
- `getProfile()` - Obtiene perfil del usuario autenticado
- `logout()` - Cierra sesión y redirige
- `isAuthenticated()` - Verifica si hay token
- `getCurrentUser()` - Obtiene datos del usuario del localStorage

**Ejemplo de uso:**
```javascript
import { login } from './api/auth.js';

const data = await login('usuario@test.com', '123456');
console.log(data.token); // JWT token
console.log(data.user);  // {id, email, first_name, last_name}
```

---

### **auth-check.js** - Protección y Utilities
**Responsabilidad:** Proteger páginas y funcionalidades comunes de auth

Funciones disponibles:
- `requireAuth()` - Protege páginas que requieren login (redirige si no autenticado)
- `redirectIfAuthenticated()` - Redirige si YA está autenticado (para login/register)
- `updateUserHeader()` - Actualiza el nombre del usuario en el header
- `setupLogoutButton()` - Configura botón de cerrar sesión
- `initAuth()` - Inicializa todo (llama a updateUserHeader y setupLogoutButton)

**Ejemplo de uso en página protegida:**
```javascript
import { requireAuth, initAuth } from './auth-check.js';

requireAuth(); // Bloquea acceso si no está autenticado

document.addEventListener('DOMContentLoaded', () => {
  initAuth(); // Configura header y logout
});
```

---

### **login.js** - Página de Login
**Responsabilidad:** Maneja el formulario de login (DOM)

- Obtiene valores del form (`#email`, `#password`)
- Valida campos
- Llama a `login()` de la API
- Muestra errores en `#errorMessage`
- Redirige a `/pages/index-logged.html` si es exitoso

**HTML requerido:**
```html
<form id="loginForm">
  <input type="email" id="email" />
  <input type="password" id="password" />
  <button type="submit" id="submitButton">Iniciar Sesión</button>
</form>
<div id="errorMessage" style="display: none;"></div>
<script type="module" src="../js/login.js"></script>
```

---

### **register.js** - Página de Registro
**Responsabilidad:** Maneja el formulario de registro (DOM)

- Obtiene valores (`#firstName`, `#lastName`, `#email`, `#password`, `#confirmPassword`)
- Valida campos y coincidencia de contraseñas
- Llama a `register()` de la API
- Muestra éxito en `#successMessage` o error en `#errorMessage`
- Redirige a login después de 3 segundos

**HTML requerido:**
```html
<form id="registerForm">
  <input type="text" id="firstName" />
  <input type="text" id="lastName" />
  <input type="email" id="email" />
  <input type="password" id="password" />
  <input type="password" id="confirmPassword" />
  <button type="submit" id="submitButton">Crear Cuenta</button>
</form>
<div id="errorMessage" style="display: none;"></div>
<div id="successMessage" style="display: none;"></div>
<script type="module" src="../js/register.js"></script>
```

---

### **index-logged.js** - Página Principal Autenticada
**Responsabilidad:** Protege la página y muestra datos del usuario

- Llama a `requireAuth()` para proteger la página
- Llama a `initAuth()` para configurar header y logout

**HTML requerido:**
```html
<span id="userName">Cargando...</span>
<button id="logoutBtn">Cerrar Sesión</button>
<script type="module" src="../js/index-logged.js"></script>
```

---

## 🔄 Flujo de Autenticación

### **1. Registro**
```
Usuario → register.html → register.js → api/auth.js → Backend
Backend → Crea usuario con is_active: false
Usuario recibe mensaje "Verifica tu email"
```

### **2. Login**
```
Usuario → login.html → login.js → api/auth.js → Backend
Backend → Valida credenciales y is_active
Backend → Devuelve JWT token
api/auth.js → Guarda token y user en localStorage
login.js → Redirige a index-logged.html
```

### **3. Acceso a Página Protegida**
```
Usuario → index-logged.html
index-logged.js → requireAuth() verifica token en localStorage
Si NO hay token → Redirige a login.html
Si hay token → Muestra página y datos del usuario
```

### **4. Llamadas a API Protegidas**
```
Frontend → Llama a getProfile()
api/auth.js → Lee token de localStorage
api/auth.js → Envía Authorization: Bearer {token}
Backend → Valida JWT con AuthGuard
Backend → Devuelve datos del usuario
```

---

## 🔐 localStorage

El sistema usa localStorage para persistir la sesión:

```javascript
// Datos guardados después del login:
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIs...');
localStorage.setItem('user', '{"id":1,"email":"juan@test.com",...}');

// Lectura:
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Limpieza (logout):
localStorage.removeItem('token');
localStorage.removeItem('user');
```

---

## 🚀 Cómo Probar

### 1. Abrir login.html en el navegador
```bash
# Abre con Live Server o directamente:
file:///home/tiesol/Projects/Web-l/Proyecto-final/FrontEnd/pages/login.html
```

### 2. Registrarse
- Ir a register.html
- Completar formulario
- Activar usuario en BD: `UPDATE person SET is_active = true WHERE email = 'tu@email.com';`

### 3. Iniciar sesión
- Completar form de login
- Se guardará token en localStorage
- Redirige automáticamente a index-logged.html

### 4. Ver token en DevTools
```javascript
// Console del navegador:
localStorage.getItem('token')
localStorage.getItem('user')
```

---

## 📚 Próximos Pasos

### Crear módulos para otras funcionalidades:
```
js/api/
├── auth.js        ✅ Ya creado
├── campaigns.js   ⏳ Próximo (getCampaigns, createCampaign, etc.)
├── favorites.js   ⏳ Próximo (addFavorite, removeFavorite, etc.)
└── donations.js   ⏳ Próximo (createDonation, getDonations, etc.)
```

### Páginas que necesitan JS:
```
pages/
├── login.html              ✅ login.js conectado
├── register.html           ✅ register.js conectado
├── index-logged.html       ✅ index-logged.js conectado
├── category-logged.html    ⏳ Necesita category-logged.js
├── campaign-detail-logged.html ⏳ Necesita campaign-detail.js
└── saved-projects.html     ⏳ Necesita saved-projects.js
```

---

## 🎨 Convenciones

- ✅ **Usar ES6 Modules** (`import/export`)
- ✅ **Separar API de DOM** (api/ vs páginas específicas)
- ✅ **async/await** para todas las peticiones
- ✅ **try/catch** para manejar errores
- ✅ **Validación en frontend** antes de enviar
- ✅ **Mostrar mensajes** al usuario (errores y éxitos)
- ✅ **DOMContentLoaded** para asegurar que el DOM esté listo
