const API_URL = 'http://localhost:3000';

// Verificar autenticación
function isAuthenticated() {
  return !!localStorage.getItem('token');
}

function getToken() {
  return localStorage.getItem('token');
}

function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = './login.html';
}

// Proteger página
if (!isAuthenticated()) {
  window.location.href = './login.html';
}

// Formatear moneda
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Calcular días restantes
function calculateDaysLeft(expirationDate) {
  if (!expirationDate) return 0;
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// Crear card de campaña favorita
function createFavoriteCard(campaign) {
  const daysLeft = calculateDaysLeft(campaign.expiration_date);
  const progress = campaign.progress_percentage || 0;
  const imageUrl = campaign.main_image_url || 'https://placehold.co/400x250/FF7A59/FFFFFF?text=Sin+Imagen';
  
  const article = document.createElement('article');
  article.className = 'campaign_grid_card';
  article.innerHTML = `
    <div class="campaign_grid_image">
      <img src="${imageUrl}" alt="${campaign.tittle}" onerror="this.src='https://placehold.co/400x250/FF7A59/FFFFFF?text=Sin+Imagen'">
      <button class="btn_remove_favorite" data-campaign-id="${campaign.id}" title="Quitar de favoritos">
        <i class="fa-solid fa-heart-crack"></i>
      </button>
      ${campaign.category_name ? `<span class="campaign_category">${campaign.category_name}</span>` : ''}
    </div>
    <div class="campaign_grid_content">
      <div class="campaign_grid_user">
        <div class="grid_user_avatar">
          <i class="fa-solid fa-user"></i>
        </div>
        <span class="grid_user_name">${campaign.user_first_name} ${campaign.user_last_name || ''}</span>
      </div>
      <h3 class="campaign_grid_title">${campaign.tittle}</h3>
      <div class="campaign_grid_progress">
        <div class="grid_progress_bar">
          <div class="grid_progress_fill" style="width: ${Math.min(progress, 100)}%"></div>
        </div>
        <p class="grid_progress_text">${formatCurrency(campaign.current_amount)} de ${formatCurrency(campaign.goal_amount)} | ${progress.toFixed(0)}% financiado</p>
      </div>
      <div class="campaign_grid_footer">
        <span class="grid_days_left">
          <i class="fa-solid fa-clock"></i> ${daysLeft} días restantes
        </span>
        <a href="campaign-detail-logged.html?id=${campaign.id}" class="btn_more_details">Ver más</a>
      </div>
    </div>
  `;
  
  // Agregar event listener al botón de quitar
  const removeBtn = article.querySelector('.btn_remove_favorite');
  removeBtn.addEventListener('click', handleRemoveFavorite);
  
  return article;
}

// Cargar favoritos
async function loadFavorites() {
  const favoritesGrid = document.getElementById('favoritesGrid');

  try {
    const response = await fetch(`${API_URL}/favorites/`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar favoritos');
    }

    const favorites = await response.json();

    if (favorites.length === 0) {
      favoritesGrid.innerHTML = `
        <div class="no_favorites" style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
          <i class="fa-regular fa-heart" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
          <h3 style="color: #666; margin-bottom: 0.5rem;">No tienes campañas favoritas</h3>
          <p style="color: #999; margin-bottom: 1.5rem;">Explora campañas y guárdalas para verlas después</p>
          <a href="./index-logged.html" class="btn_explore" style="display: inline-block; padding: 0.75rem 1.5rem; background: #FF7A59; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
            Explorar Campañas
          </a>
        </div>
      `;
      return;
    }

    // Limpiar grid y renderizar favoritos
    favoritesGrid.innerHTML = '';
    favorites.forEach(campaign => {
      const card = createFavoriteCard(campaign);
      favoritesGrid.appendChild(card);
    });

  } catch (error) {
    console.error('Error:', error);
    favoritesGrid.innerHTML = `
      <div class="error_favorites" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <i class="fa-solid fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444;"></i>
        <p style="margin-top: 1rem; color: #666;">Error al cargar los favoritos</p>
      </div>
    `;
  }
}

// Quitar de favoritos
async function handleRemoveFavorite(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const btn = e.currentTarget;
  const campaignId = btn.dataset.campaignId;
  const card = btn.closest('.campaign_grid_card');

  try {
    const response = await fetch(`${API_URL}/favorites/${campaignId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (response.ok) {
      // Remover la card inmediatamente
      card.remove();
      // Verificar si quedan favoritos
      const remaining = document.querySelectorAll('.campaign_grid_card');
      if (remaining.length === 0) {
        loadFavorites();
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Inicializar página
function initFavoritesPage() {
  loadFavorites();

  // Configurar admin link y logout
  const user = getCurrentUser();
  const adminLink = document.getElementById('adminLink');
  const logoutBtn = document.getElementById('logoutBtn');

  if (user && user.role_id === 1 && adminLink) {
    adminLink.style.display = 'flex';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }

  // Cerrar menú al hacer click fuera
  document.addEventListener('click', function(e) {
    const toggle = document.getElementById('userMenuToggle');
    const container = document.querySelector('.user_menu_container');
    if (container && !container.contains(e.target)) {
      toggle.checked = false;
    }
  });
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initFavoritesPage);
