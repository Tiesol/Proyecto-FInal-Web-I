// Campaign Detail Public Page JS (campaign-detail.html)
// Funciones para la página de detalle de campaña pública (usuarios no autenticados)

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

// Cargar detalle de la campaña
async function loadCampaignDetail() {
  const campaignId = getCampaignId();
  
  if (!campaignId) {
    window.location.href = './index.html';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/campaigns/public/${campaignId}`);
    
    if (!response.ok) {
      throw new Error('Campaña no encontrada');
    }
    
    const campaign = await response.json();
    renderCampaignDetail(campaign);
    
  } catch (error) {
    console.error('Error cargando campaña:', error);
    window.location.href = './index.html';
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
  document.querySelector('.creator_name').textContent = campaign.user_first_name 
    ? `${campaign.user_first_name} ${campaign.user_last_name || ''}`
    : 'Creador';

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

  // Configurar botón de donar (redirige a login)
  const donateBtn = document.querySelector('.btn_donate');
  donateBtn.addEventListener('click', () => {
    window.location.href = './login.html';
  });

  // Configurar favoritos (redirige a login)
  const favoriteBtn = document.querySelector('.add_favorite');
  favoriteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = './login.html';
  });
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

// Inicializar página
window.onload = function() {
  loadCampaignDetail();
  loadRewards();
  loadTopDonors();
};
