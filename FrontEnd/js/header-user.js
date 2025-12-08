
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

  if (user.profile_image_url) {
    avatarBtn.innerHTML = `<img src="${user.profile_image_url}" alt="${user.first_name || 'Usuario'}">`;
  } else {
    avatarBtn.innerHTML = '<i class="fa-solid fa-user"></i>';
  }
}

function setupUserMenu() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const adminLink = document.getElementById('adminLink');
  const logoutBtn = document.getElementById('logoutBtn');
  const menuToggle = document.querySelector('.user_menu_toggle');

  if (user && user.role_id === 1 && adminLink) {
    adminLink.classList.remove('hidden');
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = './login.html';
    });
  }

  if (menuToggle) {
    document.addEventListener('click', function(e) {
      const userMenuContainer = document.querySelector('.user_menu_container');
      if (userMenuContainer && !userMenuContainer.contains(e.target)) {
        menuToggle.checked = false;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
  loadUserAvatar();
  setupUserMenu();
});
