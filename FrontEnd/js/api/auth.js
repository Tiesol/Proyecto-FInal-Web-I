

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

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = './login.html';
}

function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

export function isAuthenticated() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  if (isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }

  return true;
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}
