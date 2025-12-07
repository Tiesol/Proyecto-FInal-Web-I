// Campaign Detail Logged Page JS (campaign-detail-logged.html)
// Funciones para la página de detalle de campaña para usuarios autenticados

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

// Obtener ID de campaña de la URL
function getCampaignId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
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

// Variable global para la campaña
let currentCampaign = null;
let isFavorite = false;

// Cargar detalle de la campaña
async function loadCampaignDetail() {
  const campaignId = getCampaignId();
  const token = localStorage.getItem('token');
  
  if (!campaignId) {
    window.location.href = './index-logged.html';
    return;
  }

  try {
    // Primero intentar con endpoint autenticado (para ver propias campañas en borrador)
    let response;
    if (token) {
      response = await fetch(`${API_URL}/campaigns/${campaignId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    
    // Si falla o no hay token, intentar endpoint público
    if (!response || !response.ok) {
      response = await fetch(`${API_URL}/campaigns/public/${campaignId}`);
    }
    
    if (!response.ok) {
      throw new Error('Campaña no encontrada');
    }
    
    currentCampaign = await response.json();
    renderCampaignDetail(currentCampaign);
    
  } catch (error) {
    console.error('Error cargando campaña:', error);
    window.location.href = './index-logged.html';
  }
}

// Renderizar detalle de la campaña
function renderCampaignDetail(campaign) {
  // Ocultar placeholder y mostrar imagen
  const loadingPlaceholder = document.querySelector('.loading-placeholder');
  const heroImage = document.querySelector('.campaign_hero_left img');
  
  if (loadingPlaceholder) {
    loadingPlaceholder.classList.add('hidden');
  }
  
  heroImage.src = campaign.main_image_url || 'https://placehold.co/800x500/FF7A59/FFFFFF?text=Sin+Imagen';
  heroImage.alt = campaign.tittle;
  heroImage.classList.remove('hidden');

  // Nombre del creador
  const creatorName = campaign.user_first_name 
    ? `${campaign.user_first_name} ${campaign.user_last_name || ''}`
    : 'Creador';
  document.querySelector('.creator_name').textContent = creatorName;

  // Imagen del creador
  const creatorAvatar = document.querySelector('.creator_avatar');
  if (campaign.user_profile_image_url) {
    creatorAvatar.innerHTML = `<img src="${campaign.user_profile_image_url}" alt="${campaign.user_first_name || 'Creador'}">`;
  }

  // Título
  document.querySelector('.campaign_detail_title').textContent = campaign.tittle;

  // Descripción corta
  document.querySelector('.campaign_short_description').textContent = campaign.description || 'Sin descripción disponible';

  // Progreso
  const progress = campaign.goal_amount > 0 
    ? (campaign.current_amount / campaign.goal_amount * 100) 
    : 0;
  
  document.querySelector('.detail_progress_fill').style.width = `${Math.min(progress, 100)}%`;
  document.querySelector('.funding_text').textContent = 
    `${formatCurrency(campaign.current_amount)} de ${formatCurrency(campaign.goal_amount)} | ${progress.toFixed(0)}% financiado`;

  // Descripción completa (rich_text)
  const descriptionContent = document.querySelector('.description_content');
  if (campaign.rich_text) {
    descriptionContent.innerHTML = campaign.rich_text;
  } else {
    descriptionContent.innerHTML = `
      <h3>Sobre el Proyecto</h3>
      <p>${campaign.description || 'Sin descripción disponible'}</p>
    `;
  }

  // Actualizar título de la página
  document.title = `${campaign.tittle} - RiseUp`;
}

// Cargar recompensas
async function loadRewards() {
  const campaignId = getCampaignId();
  if (!campaignId) return;

  try {
    const response = await fetch(`${API_URL}/rewards/campaign/${campaignId}`);
    const rewards = await response.json();
    renderRewards(rewards);
  } catch (error) {
    console.error('Error cargando recompensas:', error);
  }
}

// Renderizar recompensas
function renderRewards(rewards) {
  const rewardsGrid = document.querySelector('.rewards_grid');
  
  if (!rewards || rewards.length === 0) {
    rewardsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Esta campaña aún no tiene recompensas.</p>';
    return;
  }

  rewardsGrid.innerHTML = rewards.map(reward => `
    <div class="reward_card">
      <h3 class="reward_title">${reward.tittle}</h3>
      <div class="reward_image">
        <img src="${reward.image_url || 'https://placehold.co/300x200/FF7A59/FFFFFF?text=Recompensa'}" alt="${reward.tittle}">
      </div>
      <p class="reward_amount">${formatCurrency(reward.amount)}</p>
      <p class="reward_description">${reward.description || 'Sin descripción'}</p>
      ${reward.stock !== null ? `<p class="reward_stock">Disponibles: ${reward.stock}</p>` : ''}
    </div>
  `).join('');
}

// Cargar top donadores
async function loadTopDonors() {
  const campaignId = getCampaignId();
  if (!campaignId) return;

  try {
    const response = await fetch(`${API_URL}/donations/campaign/${campaignId}/top-donors?limit=5`);
    const donors = await response.json();
    renderTopDonors(donors);
  } catch (error) {
    console.error('Error cargando donadores:', error);
  }
}

// Renderizar top donadores
function renderTopDonors(donors) {
  const donatorsList = document.querySelector('.donators_list');
  
  if (!donors || donors.length === 0) {
    donatorsList.innerHTML = '<p style="text-align: center; color: #666; padding: 1rem;">Sé el primero en donar a esta campaña.</p>';
    return;
  }

  donatorsList.innerHTML = donors.map(donor => `
    <div class="donator_item">
      <div class="donator_info">
        <div class="donator_avatar">
          <i class="fa-solid fa-user"></i>
        </div>
        <span class="donator_name">${donor.user_name}</span>
      </div>
      <span class="donator_amount">${formatCurrency(donor.amount)}</span>
    </div>
  `).join('');
}

// Mostrar mensaje temporal (reemplaza alerts)
function showMessage(message, isError = false) {
  // Remover mensaje anterior si existe
  const existingMsg = document.querySelector('.temp_message');
  if (existingMsg) existingMsg.remove();

  const msgDiv = document.createElement('div');
  msgDiv.className = 'temp_message';
  msgDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    background: ${isError ? '#ef4444' : '#22c55e'};
    color: white;
    font-weight: 500;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  msgDiv.textContent = message;
  document.body.appendChild(msgDiv);

  setTimeout(() => msgDiv.remove(), 3000);
}

// Abrir modal de donación
function handleDonate() {
  document.getElementById('donationModal').classList.remove('hidden');
  document.getElementById('donationAmount').value = '';
  document.getElementById('donationAmount').focus();
}

// Cerrar modal de donación
function closeDonationModal() {
  document.getElementById('donationModal').classList.add('hidden');
}

// Confirmar donación desde el modal
async function confirmDonation() {
  const campaignId = getCampaignId();
  const amountInput = document.getElementById('donationAmount');
  const amount = amountInput.value;
  
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    showMessage('Por favor ingresa una cantidad válida', true);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/donations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        campaign_id: parseInt(campaignId),
        amount: parseFloat(amount),
        payment_method_id: 1
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al procesar donación');
    }

    closeDonationModal();
    showMessage('¡Donación realizada con éxito! Gracias por tu apoyo.');
    loadCampaignDetail();
    loadTopDonors();

  } catch (error) {
    console.error('Error:', error);
    showMessage(error.message, true);
  }
}

// Cerrar modal con Escape o click fuera
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeDonationModal();
  }
});

document.getElementById('donationModal')?.addEventListener('click', function(e) {
  if (e.target === this) {
    closeDonationModal();
  }
});

// Manejar favoritos
async function handleFavorite(e) {
  e.preventDefault();
  const campaignId = getCampaignId();
  const favoriteBtn = document.querySelector('.add_favorite');
  const icon = favoriteBtn.querySelector('i');

  try {
    const response = await fetch(`${API_URL}/favorites/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        campaign_id: parseInt(campaignId)
      })
    });

    if (response.ok) {
      isFavorite = true;
      icon.classList.remove('fa-regular');
      icon.classList.add('fa-solid');
      favoriteBtn.style.color = '#FF7A59';
      favoriteBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> En favoritos';
    } else {
      const error = await response.json();
      // Si ya está en favoritos, mostrar como tal
      if (error.detail && error.detail.includes('ya')) {
        isFavorite = true;
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        favoriteBtn.style.color = '#FF7A59';
        favoriteBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> En favoritos';
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Inicializar página
window.onload = function() {
  loadCampaignDetail();
  loadRewards();
  loadTopDonors();

  // Configurar botón de donar
  const donateBtn = document.querySelector('.btn_donate');
  donateBtn.addEventListener('click', handleDonate);

  // Configurar favoritos
  const favoriteBtn = document.querySelector('.add_favorite');
  favoriteBtn.addEventListener('click', handleFavorite);

  // Configurar admin link y logout
  const user = getCurrentUser();
  const adminLink = document.getElementById('adminLink');
  const logoutBtn = document.getElementById('logoutBtn');

  if (user && user.role_id === 1 && adminLink) {
    adminLink.classList.remove('hidden');
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
};
