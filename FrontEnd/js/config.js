

(function() {
  const API_URL = 'http://localhost:3000';

  const FRONTEND_URL = 'http://localhost:8080';

  const CONFIG = {
    API_URL: API_URL,
    FRONTEND_URL: FRONTEND_URL,
    PAGE_SIZE: 9,
    MESSAGE_TIMEOUT: 4000,
    VERSION: '1.0.0'
  };

  window.CONFIG = CONFIG;
  window.API_URL = API_URL;
})();
