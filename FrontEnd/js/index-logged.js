import { requireAuth, initAuth } from './auth-check.js';

// Proteger la página
requireAuth();

// Inicializar funcionalidades de autenticación
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  
  // Aquí puedes cargar las campañas, etc.
  console.log('Página index-logged cargada');
});
