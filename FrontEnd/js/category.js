// category.js - Búsqueda de campañas por categoría y por texto
const CATEGORY_API_URL = 'http://localhost:3000';

let allCampaigns = [];
let currentCategory = null;
let currentSearch = '';

// Obtener parámetros de URL
function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    category: params.get('category'),
    search: params.get('search')
  };
}

// Cargar información de la categoría
async function loadCategoryInfo(categoryId) {
  try {
    const response = await fetch(`${CATEGORY_API_URL}/categories/${categoryId}`);
    if (!response.ok) throw new Error('Categoría no encontrada');
    return await response.json();
  } catch (error) {
    console.error('Error cargando categoría:', error);
    return null;
  }
}

// Cargar campañas
async function loadCampaigns(categoryId = null, searchQuery = null) {
  try {
    let url = `${CATEGORY_API_URL}/campaigns/public`;
    const params = new URLSearchParams();
    
    if (categoryId) params.append('category_id', categoryId);
    if (searchQuery) params.append('search', searchQuery);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al cargar campañas');
    const campaigns = await response.json();
    return campaigns;
  } catch (error) {
    console.error('Error cargando campañas:', error);
    return [];
  }
}

// Calcular días restantes
function calculateDaysLeft(expirationDate) {
  const now = new Date();
  const expDate = new Date(expirationDate);
  const diff = expDate - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

// Crear card de campaña
function createCampaignCard(campaign) {
  const daysLeft = calculateDaysLeft(campaign.expiration_date);
  const progress = campaign.progress_percentage || 0;
  const isLogged = !!localStorage.getItem('token');
  const detailPage = isLogged ? './campaign-detail-logged.html' : './campaign-detail.html';
  const creatorName = campaign.user_first_name ? `${campaign.user_first_name} ${campaign.user_last_name || ''}` : 'Anónimo';
  
  return `
    <div class="campaign_grid_card">
      <div class="campaign_grid_image">
        <img src="${campaign.main_image_url || 'https://placehold.co/400x250/FF7A59/FFFFFF?text=Sin+Imagen'}" alt="${campaign.tittle}">
        <span class="campaign_category">${campaign.category_name || 'Sin categoría'}</span>
      </div>
      <div class="campaign_grid_content">
        <div class="campaign_grid_user">
          <div class="grid_user_avatar">
            ${campaign.user_profile_image_url ? `<img src="${campaign.user_profile_image_url}" alt="${creatorName}">` : '<i class="fa-solid fa-user"></i>'}
          </div>
          <span class="grid_user_name">${creatorName}</span>
        </div>
        <h3 class="campaign_grid_title">${campaign.tittle}</h3>
        <div class="campaign_grid_progress">
          <div class="grid_progress_bar">
            <div class="grid_progress_fill" style="width: ${progress}%"></div>
          </div>
          <p class="grid_progress_text">$${(campaign.current_amount || 0).toLocaleString()} de $${(campaign.goal_amount || 0).toLocaleString()} | ${Math.round(progress)}% financiado</p>
        </div>
        <div class="campaign_grid_footer">
          <span class="grid_days_left">
            <i class="fa-solid fa-clock"></i> ${daysLeft} días restantes
          </span>
          <a href="${detailPage}?id=${campaign.id}" class="btn_more_details">Ver más</a>
        </div>
      </div>
    </div>
  `;
}

// Filtrar campañas (ya vienen filtradas del backend, esto es solo para filtros locales adicionales)
function filterCampaigns() {
  return [...allCampaigns];
}

// Renderizar campañas
function renderCampaigns() {
  const grid = document.querySelector('.campaigns_grid');
  if (!grid) return;
  
  const filtered = filterCampaigns();
  
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no_results">
        <i class="fa-solid fa-search"></i>
        <h3>No se encontraron campañas</h3>
        <p>Intenta con otra búsqueda o categoría</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = filtered.map(c => createCampaignCard(c)).join('');
}

// Actualizar header de la página
function updatePageHeader(category, searchQuery) {
  const titleEl = document.querySelector('.category_title');
  const descEl = document.querySelector('.category_description');
  
  if (category) {
    if (titleEl) titleEl.textContent = category.name;
    if (descEl) descEl.textContent = category.description || `Explora proyectos de ${category.name}`;
    document.title = `${category.name} - RiseUp`;
  } else if (searchQuery) {
    if (titleEl) titleEl.textContent = `Resultados para "${searchQuery}"`;
    if (descEl) descEl.textContent = `Campañas que coinciden con tu búsqueda`;
    document.title = `Búsqueda: ${searchQuery} - RiseUp`;
  } else {
    if (titleEl) titleEl.textContent = 'Todas las Campañas';
    if (descEl) descEl.textContent = 'Explora todos los proyectos disponibles';
    document.title = 'Campañas - RiseUp';
  }
}

// Configurar filtros de estado
function setupFilters() {
  const filterBtns = document.querySelectorAll('.filter_btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.textContent.trim().toLowerCase();
      let filtered = [...allCampaigns];
      
      if (filter === 'financiados') {
        filtered = filtered.filter(c => c.progress_percentage >= 100);
      } else if (filter === 'recientes') {
        // Ya vienen ordenados del backend, pero podemos reordenar
        filtered = filtered.slice().reverse();
      }
      // "todos" y "en progreso" muestran todo (ya están en progreso del backend)
      
      const grid = document.querySelector('.campaigns_grid');
      if (grid) {
        if (filtered.length === 0) {
          grid.innerHTML = `
            <div class="no_results">
              <i class="fa-solid fa-search"></i>
              <h3>No se encontraron campañas</h3>
              <p>Intenta con otro filtro</p>
            </div>
          `;
        } else {
          grid.innerHTML = filtered.map(c => createCampaignCard(c)).join('');
        }
      }
    });
  });
}

// Inicializar página
async function initCategoryPage() {
  const params = getURLParams();
  currentCategory = params.category;
  currentSearch = params.search || '';
  
  // Actualizar el input de búsqueda si hay un término
  const searchInput = document.querySelector('.search_container input');
  if (searchInput && currentSearch) {
    searchInput.value = currentSearch;
  }
  
  // Cargar info de categoría si se especificó
  let categoryInfo = null;
  if (currentCategory) {
    categoryInfo = await loadCategoryInfo(currentCategory);
  }
  
  // Actualizar header
  updatePageHeader(categoryInfo, currentSearch);
  
  // Cargar campañas (el backend filtra por categoría y búsqueda)
  allCampaigns = await loadCampaigns(currentCategory, currentSearch);
  
  // Renderizar
  renderCampaigns();
  
  // Configurar filtros
  setupFilters();
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', initCategoryPage);
