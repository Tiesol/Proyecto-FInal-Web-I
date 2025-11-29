import { isAuthenticated, logout, getCurrentUser } from './api/auth.js';

/**
 * Protege páginas que requieren autenticación
 * Usar en index-logged.html, saved-projects.html, etc.
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = './login.html';
  }
}

/**
 * Redirige si está autenticado (para login/register)
 * Usar en login.html y register.html
 */
export function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = './index-logged.html';
  }
}

/**
 * Actualiza el header con el nombre del usuario
 */
export function updateUserHeader() {
  const user = getCurrentUser();
  const userNameElement = document.querySelector('#userName');

  if (userNameElement && user) {
    userNameElement.textContent = `${user.first_name} ${user.last_name}`;
  }
}

/**
 * Configura el botón de logout
 */
export function setupLogoutButton() {
  const logoutBtn = document.querySelector('#logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}

/**
 * Inicializa funcionalidades comunes de autenticación
 */
export function initAuth() {
  updateUserHeader();
  setupLogoutButton();
}
