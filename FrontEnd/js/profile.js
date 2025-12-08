
async function loadProfile() {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = './login.html';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
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

    const user = await response.json();

    localStorage.setItem('user', JSON.stringify(user));

    displayProfile(user);

  } catch (error) {
    console.error('Error cargando perfil:', error);
  }
}

function displayProfile(user) {
  const profileImage = document.querySelector('.profile-image img');
  if (profileImage) {
    profileImage.src = user.profile_image_url || 'https://placehold.co/200x200/FFD166/1E293B?text=User';
    profileImage.alt = `${user.first_name} ${user.last_name}`;
  }

  const usernameEl = document.getElementById('profileUsername');
  if (usernameEl) {
    usernameEl.textContent = `${user.first_name} ${user.last_name}`;
  }

  const descriptionEl = document.getElementById('profileDescription');
  if (descriptionEl) {
    descriptionEl.textContent = user.description || 'Sin descripción aún. ¡Edita tu perfil para agregar una!';
  }
}

document.addEventListener('DOMContentLoaded', loadProfile);
