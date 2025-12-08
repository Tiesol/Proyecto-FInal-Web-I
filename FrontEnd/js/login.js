import { login, isAuthenticated } from './api/auth.js';

if (isAuthenticated()) {
  window.location.href = './index-logged.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#loginForm');
  const emailInput = document.querySelector('#email');
  const passwordInput = document.querySelector('#password');
  const errorMessage = document.querySelector('#errorMessage');
  const submitButton = document.querySelector('#submitButton');

  if (!loginForm) {
    console.error('No se encontró el formulario de login');
    return;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (errorMessage) {
      errorMessage.textContent = '';
      errorMessage.classList.add('hidden');
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Por favor completa todos los campos');
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Iniciando sesión...';
    }

    try {
      const data = await login(email, password);

      console.log('Login exitoso:', data);
      window.location.href = './index-logged.html';
    } catch (error) {
      showError(error.message || 'Error al iniciar sesión');

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Iniciar sesión';
      }
    }
  });

  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.classList.remove('hidden');
    } else {
      console.error('Error:', message);
    }
  }
});
