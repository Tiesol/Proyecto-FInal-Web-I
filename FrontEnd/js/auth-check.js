import { isAuthenticated, logout, getCurrentUser } from './api/auth.js';

export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = './login.html';
  }
}

export function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = './index-logged.html';
  }
}

export function updateUserHeader() {
  const user = getCurrentUser();
  const userNameElement = document.querySelector('#userName');

  if (userNameElement && user) {
    userNameElement.textContent = `${user.first_name} ${user.last_name}`;
  }
}

export function setupLogoutButton() {
  const logoutBtn = document.querySelector('#logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}

export function initAuth() {
  updateUserHeader();
  setupLogoutButton();
}
