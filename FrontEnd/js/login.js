import { login, isAuthenticated } from './api/auth.js';

// Si ya está autenticado, redirigir
if (isAuthenticated()) {
  window.location.href = './index-logged.html';
}

// Esperar a que cargue el DOM
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

    // Limpiar mensajes de error previos
    if (errorMessage) {
      errorMessage.textContent = '';
      errorMessage.style.display = 'none';
    }

    // Obtener valores
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validación básica
    if (!email || !password) {
      showError('Por favor completa todos los campos');
      return;
    }

    // Deshabilitar botón mientras procesa
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Iniciando sesión...';
    }

    try {
      // Llamar a la API
      const data = await login(email, password);

      // Éxito - redirigir
      console.log('Login exitoso:', data);
      window.location.href = './index-logged.html';
    } catch (error) {
      // Mostrar error
      showError(error.message || 'Error al iniciar sesión');

      // Rehabilitar botón
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Iniciar sesión';
      }
    }
  });

  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
    } else {
      alert(message);
    }
  }
});
