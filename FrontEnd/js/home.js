import { getPublicCampaigns, getFeaturedCampaigns, calculateDaysLeft, formatCurrency } from './api/campaigns.js';

/**
 * Genera el HTML de una tarjeta de campaña para el grid
 * @param {Object} campaign - Datos de la campaña
 * @param {boolean} isLogged - Si el usuario está logueado
 * @returns {string} HTML de la tarjeta
 */
function createCampaignCard(campaign, isLogged = false) {
  const daysLeft = calculateDaysLeft(campaign.expiration_date);
  const detailPage = isLogged ? 'campaign-detail-logged.html' : 'campaign-detail.html';
  const progress = campaign.progress_percentage || 0;
  
  return `
    <article class="campaign_grid_card">
      <div class="campaign_grid_image">
        <img src="${campaign.main_image_url || 'https://placehold.co/400x250/FF7A59/FFFFFF?text=Sin+Imagen'}" alt="${campaign.tittle}">
        <span class="campaign_category">${campaign.category_name || 'General'}</span>
      </div>
      <div class="campaign_grid_content">
        <div class="campaign_grid_user">
          <div class="grid_user_avatar">
            <i class="fa-solid fa-user"></i>
          </div>
          <span class="grid_user_name">${campaign.user_first_name} ${campaign.user_last_name}</span>
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
          <a href="${detailPage}?id=${campaign.id}" class="btn_more_details">Ver más</a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Genera el HTML de una tarjeta para el carrusel
 * @param {Object} campaign - Datos de la campaña
 * @param {boolean} isLogged - Si el usuario está logueado
 * @returns {string} HTML de la tarjeta del carrusel
 */
function createCarouselCard(campaign, isLogged = false) {
  const detailPage = isLogged ? 'campaign-detail-logged.html' : 'campaign-detail.html';
  const progress = campaign.progress_percentage || 0;
  
  return `
    <div class="campaign_card">
      <img src="${campaign.main_image_url || 'https://placehold.co/1200x600/FF7A59/FFFFFF?text=Sin+Imagen'}" alt="${campaign.tittle}" class="campaign_bg">
      <div class="campaign_overlay">
        <div class="campaign_content">
          <div class="user_info">
            <div class="user_avatar">
              <i class="fa-solid fa-user"></i>
            </div>
            <span class="user_name">${campaign.user_first_name} ${campaign.user_last_name}</span>
          </div>
          <h3 class="campaign_title">${campaign.tittle}</h3>
          <div class="campaign_progress">
            <div class="progress_bar">
              <div class="progress_fill" style="width: ${Math.min(progress, 100)}%"></div>
            </div>
            <div class="progress_info">
              <span class="progress_percentage">${progress.toFixed(0)}%</span>
              <span class="progress_funded">${formatCurrency(campaign.current_amount)} de ${formatCurrency(campaign.goal_amount)}</span>
            </div>
            <a href="${detailPage}?id=${campaign.id}" class="btn_view_campaign">Ver Campaña</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza las campañas en el grid de campañas populares
 * @param {boolean} isLogged - Si el usuario está logueado
 */
async function renderPopularCampaigns(isLogged = false) {
  const campaignsGrid = document.querySelector('.campaigns_grid');
  
  if (!campaignsGrid) {
    console.error('No se encontró el contenedor .campaigns_grid');
    return;
  }
  
  // Mostrar loading
  campaignsGrid.innerHTML = `
    <div class="loading_campaigns">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Cargando campañas...</p>
    </div>
  `;
  
  try {
    const campaigns = await getPublicCampaigns({ limit: 6 });
    
    if (campaigns.length === 0) {
      campaignsGrid.innerHTML = `
        <div class="no_campaigns">
          <i class="fa-solid fa-folder-open"></i>
          <p>No hay campañas disponibles en este momento.</p>
        </div>
      `;
      return;
    }
    
    // Renderizar las campañas
    campaignsGrid.innerHTML = campaigns.map(campaign => createCampaignCard(campaign, isLogged)).join('');
    
  } catch (error) {
    console.error('Error al cargar campañas:', error);
    campaignsGrid.innerHTML = `
      <div class="error_campaigns">
        <i class="fa-solid fa-exclamation-triangle"></i>
        <p>Error al cargar las campañas. Por favor, intenta más tarde.</p>
      </div>
    `;
  }
}

/**
 * Renderiza las campañas destacadas en el carrusel
 * @param {boolean} isLogged - Si el usuario está logueado
 */
async function renderFeaturedCampaigns(isLogged = false) {
  const carouselTrack = document.querySelector('.carousel_track');
  const indicatorsContainer = document.querySelector('.carousel_indicators');
  
  if (!carouselTrack) {
    console.error('No se encontró el contenedor .carousel_track');
    return;
  }
  
  // Mostrar loading
  carouselTrack.innerHTML = `
    <div class="loading_campaigns" style="width: 100%; display: flex; justify-content: center; align-items: center; min-height: 300px;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #FF7A59;"></i>
    </div>
  `;
  
  try {
    const campaigns = await getFeaturedCampaigns(5);
    
    if (campaigns.length === 0) {
      carouselTrack.innerHTML = `
        <div class="no_campaigns" style="width: 100%; text-align: center; padding: 2rem;">
          <p>No hay campañas destacadas disponibles.</p>
        </div>
      `;
      return;
    }
    
    // Renderizar las campañas en el carrusel
    carouselTrack.innerHTML = campaigns.map(campaign => createCarouselCard(campaign, isLogged)).join('');
    
    // Actualizar indicadores
    if (indicatorsContainer) {
      indicatorsContainer.innerHTML = campaigns.map((_, index) => 
        `<button class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>`
      ).join('');
      
      // Inicializar carrusel
      initCarousel(campaigns.length);
    }
    
  } catch (error) {
    console.error('Error al cargar campañas destacadas:', error);
    carouselTrack.innerHTML = `
      <div class="error_campaigns" style="width: 100%; text-align: center; padding: 2rem;">
        <p>Error al cargar las campañas destacadas.</p>
      </div>
    `;
  }
}

/**
 * Inicializa la funcionalidad del carrusel
 * @param {number} totalSlides - Número total de slides
 */
function initCarousel(totalSlides) {
  let currentSlide = 0;
  
  const track = document.querySelector('.carousel_track');
  const cards = track.querySelectorAll('.campaign_card');
  const prevBtn = document.querySelector('.carousel_nav_prev');
  const nextBtn = document.querySelector('.carousel_nav_next');
  const indicators = document.querySelectorAll('.indicator');
  
  function updateCarousel() {
    // Ocultar todas las cards
    cards.forEach((card, index) => {
      card.style.display = index === currentSlide ? 'block' : 'none';
    });
    
    // Actualizar indicadores
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === currentSlide);
    });
  }
  
  function nextSlide(e) {
    if (e) e.preventDefault();
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
  }
  
  function prevSlide(e) {
    if (e) e.preventDefault();
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
  }
  
  // Event listeners
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      currentSlide = index;
      updateCarousel();
    });
  });
  
  // Auto-play cada 5 segundos
  setInterval(nextSlide, 5000);
  
  // Mostrar primera slide
  updateCarousel();
}

/**
 * Inicializa la página de inicio
 * @param {boolean} isLogged - Si el usuario está logueado
 */
export async function initHomePage(isLogged = false) {
  console.log('Inicializando página de inicio...');
  
  // Cargar ambas secciones en paralelo
  await Promise.all([
    renderFeaturedCampaigns(isLogged),
    renderPopularCampaigns(isLogged)
  ]);
  
  console.log('Campañas cargadas exitosamente');
}

// Exportar funciones individuales por si se necesitan
export { renderPopularCampaigns, renderFeaturedCampaigns };
