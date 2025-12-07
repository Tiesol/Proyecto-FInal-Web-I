/**
 * Configuración global del Frontend
 * Este archivo centraliza todas las configuraciones
 * Debe cargarse ANTES que cualquier otro script
 */

(function() {
  // URL del API Backend
  const API_URL = 'http://localhost:3000';
  
  // URL del Frontend  
  const FRONTEND_URL = 'http://localhost:8080';

  // Configuración global
  const CONFIG = {
    API_URL: API_URL,
    FRONTEND_URL: FRONTEND_URL,
    PAGE_SIZE: 9,
    MESSAGE_TIMEOUT: 4000,
    VERSION: '1.0.0'
  };

  // Hacer disponible globalmente
  window.CONFIG = CONFIG;
  window.API_URL = API_URL;
})();
