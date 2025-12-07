// header-user.js - Cargar imagen de usuario en el header

function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  console.log('=== AUTH STATUS ===');
  console.log('Token:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
  console.log('User:', userStr ? JSON.parse(userStr) : 'NO HAY USER');
  console.log('Está logueado:', !!token);
  console.log('==================');
  
  return !!token;
}

function loadUserAvatar() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return;
  
  const user = JSON.parse(userStr);
  const avatarBtn = document.querySelector('.user_avatar_btn');
  
  if (!avatarBtn) return;
  
  // Si el usuario tiene imagen de perfil, mostrarla
  if (user.profile_image_url) {
    avatarBtn.innerHTML = `<img src="${user.profile_image_url}" alt="${user.first_name || 'Usuario'}">`;
  } else {
    // Si no, mostrar el icono por defecto
    avatarBtn.innerHTML = '<i class="fa-solid fa-user"></i>';
  }
}

// También configurar logout y admin link
function setupUserMenu() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const adminLink = document.getElementById('adminLink');
  const logoutBtn = document.getElementById('logoutBtn');
  const menuToggle = document.querySelector('.user_menu_toggle');
  
  // Mostrar admin link si es admin
  if (user && user.role_id === 1 && adminLink) {
    adminLink.classList.remove('hidden');
  }
  
  // Configurar logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = './login.html';
    });
  }
  
  // Cerrar dropdown de perfil al hacer click afuera
  if (menuToggle) {
    document.addEventListener('click', function(e) {
      const userMenuContainer = document.querySelector('.user_menu_container');
      if (userMenuContainer && !userMenuContainer.contains(e.target)) {
        menuToggle.checked = false;
      }
    });
  }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
  loadUserAvatar();
  setupUserMenu();
});
