// user-profile.js - Ver perfil de otro usuario

function getUserIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadUserProfile() {
  const userId = getUserIdFromURL();
  
  if (!userId) {
    document.getElementById('userName').textContent = 'Usuario no encontrado';
    document.getElementById('userDescription').textContent = '';
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);
    
    if (!response.ok) {
      throw new Error('Usuario no encontrado');
    }
    
    const user = await response.json();
    displayUserProfile(user);
    
  } catch (error) {
    console.error('Error cargando perfil:', error);
    document.getElementById('userName').textContent = 'Usuario no encontrado';
    document.getElementById('userDescription').textContent = '';
  }
}

function displayUserProfile(user) {
  const avatarEl = document.getElementById('userAvatar');
  const nameEl = document.getElementById('userName');
  const descEl = document.getElementById('userDescription');
  
  if (avatarEl) {
    avatarEl.src = user.profile_image_url || 'https://placehold.co/200x200/FFD166/1E293B?text=User';
    avatarEl.alt = `${user.first_name} ${user.last_name}`;
  }
  
  if (nameEl) {
    nameEl.textContent = `${user.first_name} ${user.last_name}`;
  }
  
  if (descEl) {
    descEl.textContent = user.description || 'Este usuario no tiene descripción.';
  }
  
  // Actualizar título de la página
  document.title = `${user.first_name} ${user.last_name} - RiseUp`;
}

// Inicializar
document.addEventListener('DOMContentLoaded', loadUserProfile);
