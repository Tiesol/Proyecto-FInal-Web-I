// API de Autenticación

/**
 * Registra un nuevo usuario
 * @param {Object} userData - {first_name, last_name, email, password, country_id}
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function register(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Error en el registro');
    }

    return data;
  } catch (error) {
    console.error('Error en register:', error);
    throw error;
  }
}

/**
 * Obtiene la lista de países
 * @returns {Promise<Array>} Lista de países
 */
export async function getCountries() {
  try {
    const response = await fetch(`${API_URL}/countries`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener países:', error);
    return [];
  }
}

/**
 * Verifica el email del usuario
 * @param {string} token - Token de verificación
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function verifyEmail(token) {
  try {
    const response = await fetch(`${API_URL}/auth/verify/${token}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error al verificar email');
    }

    return data;
  } catch (error) {
    console.error('Error en verificación:', error);
    throw error;
  }
}

/**
 * Inicia sesión
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} {token, user}
 */
export async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Error en el login');
    }

    // Guardar token en localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

/**
 * Obtiene el perfil del usuario autenticado
 * @returns {Promise<Object>} Datos del usuario
 */
export async function getProfile() {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener perfil');
    }

    return data;
  } catch (error) {
    console.error('Error en getProfile:', error);
    throw error;
  }
}

/**
 * Cierra sesión
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = './login.html';
}

/**
 * Decodifica un JWT sin verificar la firma (solo para leer el payload)
 * @param {string} token 
 * @returns {Object|null}
 */
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    // Decodificar base64url
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

/**
 * Verifica si el token JWT ha expirado
 * @param {string} token 
 * @returns {boolean} true si expiró o es inválido
 */
function isTokenExpired(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  
  // exp está en segundos, Date.now() en milisegundos
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Verifica si el usuario está autenticado (token existe y no ha expirado)
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  // Verificar si el token expiró
  if (isTokenExpired(token)) {
    // Limpiar datos de sesión expirada
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
  
  return true;
}

/**
 * Obtiene el usuario del localStorage
 * @returns {Object|null}
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}
