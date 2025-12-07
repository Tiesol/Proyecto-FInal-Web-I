// my-campaigns.js - Funcionalidad de Mis Campañas

// Estados de workflow
const WORKFLOW_STATES = {
  1: { name: 'Borrador', class: 'draft' },
  2: { name: 'En Revisión', class: 'pending' },
  3: { name: 'Observado', class: 'pending' },
  4: { name: 'Rechazado', class: 'rejected' },
  5: { name: 'Publicado', class: 'approved' }
};

// Estados de campaña
const CAMPAIGN_STATES = {
  1: 'No Iniciada',
  2: 'En Progreso',
  3: 'En Pausa',
  4: 'Finalizada'
};

let allCampaigns = [];
let currentFilter = 'all';
let openMenuId = null;
let pendingDeleteId = null;

// Paginación
let currentPage = 1;
const PAGE_SIZE = 9;

// Referencias a los divs de mensaje
const errorMessageDiv = document.getElementById('errorMessage');
const successMessageDiv = document.getElementById('successMessage');

// Mostrar mensaje de error
function showError(message) {
  if (successMessageDiv) successMessageDiv.classList.add('hidden');
  if (errorMessageDiv) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('hidden');
    errorMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Mostrar mensaje de éxito
function showSuccess(message) {
  if (errorMessageDiv) errorMessageDiv.classList.add('hidden');
  if (successMessageDiv) {
    successMessageDiv.textContent = message;
    successMessageDiv.classList.remove('hidden');
    successMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}


// Mostrar modal de confirmación
function showConfirmModal(message, onConfirm) {
  // Crear modal si no existe
  let modal = document.getElementById('confirmModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirmModal';
    modal.innerHTML = `
      <div class="confirm-modal-overlay">
        <div class="confirm-modal-content">
          <p id="confirmModalMessage"></p>
          <div class="confirm-modal-buttons">
            <button type="button" class="btn btn-cancel" id="confirmModalCancel">Cancelar</button>
            <button type="button" class="btn btn-danger" id="confirmModalConfirm">Eliminar</button>
          </div>
        </div>
      </div>
    `;
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    modal.querySelector('.confirm-modal-content').style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 8px;
      max-width: 400px;
      text-align: center;
    `;
    modal.querySelector('.confirm-modal-buttons').style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 20px;
    `;
    modal.querySelector('.btn-cancel').style.cssText = `
      padding: 10px 20px;
      background: #f0f0f0;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    `;
    modal.querySelector('.btn-danger').style.cssText = `
      padding: 10px 20px;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    `;
    document.body.appendChild(modal);
  }
  
  document.getElementById('confirmModalMessage').textContent = message;
  modal.classList.remove('hidden');
  
  const cancelBtn = document.getElementById('confirmModalCancel');
  const confirmBtn = document.getElementById('confirmModalConfirm');
  
  const closeModal = () => { modal.classList.add('hidden'); };
  
  cancelBtn.onclick = closeModal;
  confirmBtn.onclick = () => {
    closeModal();
    onConfirm();
  };
}

// Obtener token
function getToken() {
  return localStorage.getItem('token');
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

// Formatear moneda
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
}

// Cargar campañas del usuario
async function loadMyCampaigns() {
  const gallery = document.querySelector('.campaigns-gallery');
  
  try {
    const response = await fetch(`${API_URL}/campaigns/my-campaigns`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) throw new Error('Error al cargar campañas');
    
    allCampaigns = await response.json();
    renderCampaigns(allCampaigns);
    
  } catch (error) {
    console.error('Error:', error);
    gallery.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <i class="fa-solid fa-exclamation-triangle" style="font-size: 2rem; color: #FF7A59;"></i>
        <p style="margin-top: 1rem; color: #666;">Error al cargar tus campañas</p>
      </div>
    `;
  }
}

// Renderizar campañas
function renderCampaigns(campaigns) {
  const gallery = document.querySelector('.campaigns-gallery');
  
  // Filtrar según el filtro activo
  let filtered = campaigns;
  if (currentFilter !== 'all') {
    const filterMap = {
      'approved': 5,
      'pending': 2,
      'observed': 3,
      'rejected': 4,
      'draft': 1
    };
    filtered = campaigns.filter(c => c.workflow_state_id === filterMap[currentFilter]);
  }
  
  if (filtered.length === 0) {
    gallery.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <i class="fa-solid fa-folder-open" style="font-size: 2rem; color: #ccc;"></i>
        <p style="margin-top: 1rem; color: #666;">No tienes campañas en esta categoría</p>
        <a href="./create-campaign.html" class="btn btn-primary" style="margin-top: 1rem; display: inline-block; padding: 12px 24px; text-decoration: none;">Crear Campaña</a>
      </div>
    `;
    renderMyCampaignsPagination(0, 0);
    return;
  }
  
  // Paginación del lado del cliente
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedCampaigns = filtered.slice(startIndex, endIndex);
  
  gallery.innerHTML = paginatedCampaigns.map(campaign => createCampaignCard(campaign)).join('');
  renderMyCampaignsPagination(totalPages, filtered.length);
}

// Renderizar paginación
function renderMyCampaignsPagination(totalPages, totalItems) {
  let paginationContainer = document.querySelector('.my-campaigns .pagination');
  
  // Crear contenedor si no existe
  if (!paginationContainer) {
    const section = document.querySelector('.my-campaigns');
    if (section) {
      paginationContainer = document.createElement('div');
      paginationContainer.className = 'pagination';
      section.appendChild(paginationContainer);
    } else {
      return;
    }
  }
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Botón anterior
  html += `<button class="pagination_btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToMyCampaignsPage(${currentPage - 1})">
    <i class="fa-solid fa-chevron-left"></i>
  </button>`;
  
  // Páginas
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  if (startPage > 1) {
    html += `<button class="pagination_btn" onclick="goToMyCampaignsPage(1)">1</button>`;
    if (startPage > 2) {
      html += `<span class="pagination_dots">...</span>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="pagination_btn ${i === currentPage ? 'active' : ''}" onclick="goToMyCampaignsPage(${i})">${i}</button>`;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<span class="pagination_dots">...</span>`;
    }
    html += `<button class="pagination_btn" onclick="goToMyCampaignsPage(${totalPages})">${totalPages}</button>`;
  }
  
  // Botón siguiente
  html += `<button class="pagination_btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToMyCampaignsPage(${currentPage + 1})">
    <i class="fa-solid fa-chevron-right"></i>
  </button>`;
  
  paginationContainer.innerHTML = html;
}

// Ir a página específica
function goToMyCampaignsPage(page) {
  currentPage = page;
  renderCampaigns(allCampaigns);
  document.querySelector('.my-campaigns')?.scrollIntoView({ behavior: 'smooth' });
}

// Crear card de campaña
function createCampaignCard(campaign) {
  const daysLeft = calculateDaysLeft(campaign.expiration_date);
  const workflow = WORKFLOW_STATES[campaign.workflow_state_id] || { name: 'Desconocido', class: 'draft' };
  const campaignState = CAMPAIGN_STATES[campaign.campaign_state_id] || 'Desconocido';
  const isDraft = campaign.workflow_state_id === 1;
  const isPublished = campaign.workflow_state_id === 5;
  
  return `
    <article class="my-campaign-card" data-id="${campaign.id}">
      <div class="campaign-menu-container">
        <button class="campaign-menu-btn" onclick="toggleCampaignMenu(${campaign.id}, event)">
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
        <div class="campaign-dropdown" id="menu-${campaign.id}">
          <a href="./create-campaign.html?id=${campaign.id}" class="campaign-dropdown-item">
            <i class="fa-solid fa-pen"></i>
            Editar
          </a>
          ${isPublished ? `
            <div class="campaign-dropdown-item has-submenu" onclick="toggleStateSubmenu(${campaign.id}, event)">
              <i class="fa-solid fa-toggle-on"></i>
              Cambiar Estado
              <i class="fa-solid fa-chevron-left submenu-arrow"></i>
              <div class="campaign-submenu" id="submenu-${campaign.id}">
                <a href="#" class="campaign-dropdown-item" onclick="changeCampaignState(${campaign.id}, 2, event)">
                  <i class="fa-solid fa-play"></i>
                  Iniciar
                </a>
                <a href="#" class="campaign-dropdown-item" onclick="changeCampaignState(${campaign.id}, 3, event)">
                  <i class="fa-solid fa-pause"></i>
                  Pausar
                </a>
              </div>
            </div>
          ` : ''}
          <a href="./donations.html?campaign_id=${campaign.id}" class="campaign-dropdown-item">
            <i class="fa-solid fa-hand-holding-dollar"></i>
            Ver Contribuciones
          </a>
          ${isDraft ? `
            <div class="campaign-dropdown-divider"></div>
            <a href="#" class="campaign-dropdown-item danger" onclick="deleteCampaign(${campaign.id}, event)">
              <i class="fa-solid fa-trash"></i>
              Eliminar
            </a>
          ` : ''}
        </div>
      </div>
      <span class="campaign-badge ${workflow.class}">${workflow.name}</span>
      <div class="campaign-image">
        <img src="${campaign.main_image_url || 'https://placehold.co/400x250/FF7A59/FFFFFF?text=Sin+Imagen'}" alt="${campaign.tittle}">
      </div>
      <div class="campaign-info">
        <h3>${campaign.tittle}</h3>
        <div class="campaign-stats">
          <span class="days-left"><i class="fa-solid fa-clock"></i> ${daysLeft} días restantes</span>
          <span class="status-label">Estado: ${campaignState}</span>
        </div>
        <a href="./campaign-detail-logged.html?id=${campaign.id}" class="btn btn-small btn-primary">Ver Campaña</a>
      </div>
    </article>
  `;
}

// Toggle menú de campaña
function toggleCampaignMenu(campaignId, event) {
  event.preventDefault();
  event.stopPropagation();
  
  const menu = document.getElementById(`menu-${campaignId}`);
  const allMenus = document.querySelectorAll('.campaign-dropdown');
  
  // Cerrar todos los otros menús
  allMenus.forEach(m => {
    if (m.id !== `menu-${campaignId}`) {
      m.classList.remove('show');
    }
  });
  
  // Cerrar todos los submenús
  document.querySelectorAll('.campaign-submenu').forEach(s => s.classList.remove('show'));
  
  // Toggle este menú
  menu.classList.toggle('show');
  openMenuId = menu.classList.contains('show') ? campaignId : null;
}

// Toggle submenú de estado
function toggleStateSubmenu(campaignId, event) {
  event.preventDefault();
  event.stopPropagation();
  
  const submenu = document.getElementById(`submenu-${campaignId}`);
  submenu.classList.toggle('show');
}

// Cambiar estado de campaña
async function changeCampaignState(campaignId, newState, event) {
  event.preventDefault();
  event.stopPropagation();
  
  try {
    const response = await fetch(`${API_URL}/campaigns/${campaignId}/state`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ campaign_state_id: newState })
    });
    
    if (!response.ok) throw new Error('Error al cambiar estado');
    
    // Recargar campañas
    closeAllMenus();
    loadMyCampaigns();
    showSuccess('Estado de campaña actualizado');
    
  } catch (error) {
    console.error('Error:', error);
    showError('Error al cambiar el estado de la campaña');
  }
}

// Eliminar campaña (solo borradores)
async function deleteCampaign(campaignId, event) {
  event.preventDefault();
  event.stopPropagation();
  
  showConfirmModal('¿Estás seguro de que deseas eliminar esta campaña? Esta acción no se puede deshacer.', async () => {
    try {
      const response = await fetch(`${API_URL}/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (!response.ok) throw new Error('Error al eliminar');
      
      // Recargar campañas
      closeAllMenus();
      loadMyCampaigns();
      showSuccess('Campaña eliminada');
      
    } catch (error) {
      console.error('Error:', error);
      showError('Error al eliminar la campaña');
    }
  });
}

// Cerrar todos los menús
function closeAllMenus() {
  document.querySelectorAll('.campaign-dropdown').forEach(m => m.classList.remove('show'));
  document.querySelectorAll('.campaign-submenu').forEach(s => s.classList.remove('show'));
  openMenuId = null;
}

// Configurar filtros
function setupFilters() {
  const tags = document.querySelectorAll('.tag');
  
  tags.forEach(tag => {
    tag.addEventListener('click', function() {
      // Remover active de todos
      tags.forEach(t => t.classList.remove('active'));
      // Agregar active a este
      this.classList.add('active');
      
      // Obtener filtro
      const filterText = this.textContent.trim().toLowerCase();
      
      if (filterText.includes('approved') || filterText.includes('publicado')) {
        currentFilter = 'approved';
      } else if (filterText.includes('pending') || filterText.includes('revisión')) {
        currentFilter = 'pending';
      } else if (filterText.includes('rejected') || filterText.includes('rechazado')) {
        currentFilter = 'rejected';
      } else if (filterText.includes('draft') || filterText.includes('borrador')) {
        currentFilter = 'draft';
      } else if (filterText.includes('observed') || filterText.includes('observado')) {
        currentFilter = 'observed';
      } else {
        currentFilter = 'all';
      }
      
      // Resetear a página 1 al cambiar filtro
      currentPage = 1;
      renderCampaigns(allCampaigns);
    });
  });
}

// Cerrar menús al hacer click fuera
document.addEventListener('click', function(e) {
  if (!e.target.closest('.campaign-menu-container')) {
    closeAllMenus();
  }
});

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
  loadMyCampaigns();
  setupFilters();
});
