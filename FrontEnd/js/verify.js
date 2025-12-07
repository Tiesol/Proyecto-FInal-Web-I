import { verifyEmail } from './api/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const loadingSpinner = document.querySelector('#loadingSpinner');
  const successContainer = document.querySelector('#successContainer');
  const errorContainer = document.querySelector('#errorContainer');
  const verifyTitle = document.querySelector('#verifyTitle');
  const verifyMessage = document.querySelector('#verifyMessage');
  const errorText = document.querySelector('#errorText');

  if (!token) {
    showError('Token de verificación no proporcionado');
    return;
  }

  try {
    const data = await verifyEmail(token);
    
    // Ocultar spinner
    loadingSpinner.classList.add('hidden');
    
    // Mostrar éxito
    verifyTitle.textContent = '¡Cuenta Verificada!';
    verifyMessage.textContent = data.message || 'Tu cuenta ha sido activada correctamente.';
    successContainer.classList.remove('hidden');
    
  } catch (error) {
    showError(error.message || 'Error al verificar la cuenta');
  }

  function showError(message) {
    loadingSpinner.classList.add('hidden');
    verifyTitle.textContent = 'Error de Verificación';
    verifyMessage.textContent = 'No pudimos verificar tu cuenta.';
    errorText.textContent = message;
    errorContainer.classList.remove('hidden');
  }
});
