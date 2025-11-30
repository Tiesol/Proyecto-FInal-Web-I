// edit-profile.js - Editar perfil del usuario
const EDIT_PROFILE_API_URL = 'http://localhost:3000';

let currentUser = null;

async function loadCurrentProfile() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = './login.html';
    return;
  }
  
  try {
    const response = await fetch(`${EDIT_PROFILE_API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = './login.html';
        return;
      }
      throw new Error('Error al cargar perfil');
    }
    
    currentUser = await response.json();
    
    // Llenar formulario con datos actuales
    fillForm(currentUser);
    
  } catch (error) {
    console.error('Error cargando perfil:', error);
  }
}

function fillForm(user) {
  // Imagen de perfil
  const imageInput = document.getElementById('profileImageUrl');
  const imagePreview = document.querySelector('.profile-image');
  
  if (imageInput && user.profile_image_url) {
    imageInput.value = user.profile_image_url;
  }
  
  if (imagePreview) {
    if (user.profile_image_url) {
      imagePreview.innerHTML = `<img src="${user.profile_image_url}" alt="${user.first_name}">`;
    } else {
      imagePreview.innerHTML = '<div class="image-placeholder"><i class="fa-solid fa-user"></i></div>';
    }
  }
  
  // Descripción
  const descriptionInput = document.getElementById('profileDescription');
  if (descriptionInput && user.description) {
    descriptionInput.value = user.description;
  }
}

// Previsualizar imagen cuando cambia la URL
function setupImagePreview() {
  const imageInput = document.getElementById('profileImageUrl');
  const imagePreview = document.querySelector('.profile-image');
  
  if (imageInput && imagePreview) {
    imageInput.addEventListener('input', () => {
      const url = imageInput.value.trim();
      if (url) {
        imagePreview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'><i class=\\'fa-solid fa-user\\'></i></div>'">`;
      } else {
        imagePreview.innerHTML = '<div class="image-placeholder"><i class="fa-solid fa-user"></i></div>';
      }
    });
  }
}

// Guardar cambios
async function saveProfile() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = './login.html';
    return;
  }
  
  const imageInput = document.getElementById('profileImageUrl');
  const descriptionInput = document.getElementById('profileDescription');
  
  const updateData = {};
  
  if (imageInput) {
    updateData.profile_image_url = imageInput.value.trim() || null;
  }
  
  if (descriptionInput) {
    updateData.description = descriptionInput.value.trim() || null;
  }
  
  try {
    const response = await fetch(`${EDIT_PROFILE_API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al guardar cambios');
    }
    
    const updatedUser = await response.json();
    
    // Actualizar localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    alert('¡Perfil actualizado correctamente!');
    window.location.href = './profile.html';
    
  } catch (error) {
    console.error('Error guardando perfil:', error);
    alert('Error al guardar: ' + error.message);
  }
}

// Configurar botones
function setupButtons() {
  const cancelBtn = document.querySelector('.btn-cancel');
  const saveBtn = document.querySelector('.btn-save');
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = './profile.html';
    });
  }
  
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveProfile();
    });
  }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
  loadCurrentProfile();
  setupImagePreview();
  setupButtons();
});
