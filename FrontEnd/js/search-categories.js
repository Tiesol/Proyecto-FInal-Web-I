// search-categories.js - Dropdown de categorías en búsqueda
(function() {
  if (window._searchCategoriesLoaded) return;
  window._searchCategoriesLoaded = true;

  const SEARCH_API_URL = 'http://localhost:3000';

  // Iconos para cada categoría
  const categoryIcons = {
    'Tecnología': 'fa-microchip',
    'Arte': 'fa-palette',
    'Música': 'fa-music',
    'Cine y Video': 'fa-film',
    'Juegos': 'fa-gamepad',
    'Diseño': 'fa-pen-ruler',
    'Fotografía': 'fa-camera',
    'Moda': 'fa-shirt',
    'Comida': 'fa-utensils',
    'Causas Sociales': 'fa-hand-holding-heart',
    'Educación': 'fa-graduation-cap',
    'Medio Ambiente': 'fa-leaf'
  };

  // Determinar página de categoría según autenticación
  function getCategoryPage() {
    const isLogged = !!localStorage.getItem('token');
    return isLogged ? './category-logged.html' : './category.html';
  }

  // Cargar categorías en el dropdown de búsqueda
  async function loadSearchCategories() {
    const grid = document.getElementById('searchCategoriesGrid');
    if (!grid) return;

    try {
      const response = await fetch(`${SEARCH_API_URL}/categories/`);
      if (!response.ok) throw new Error('Error al cargar categorías');
      
      const categories = await response.json();
      const categoryPage = getCategoryPage();
      
      grid.innerHTML = categories.map(cat => `
        <a href="${categoryPage}?category=${cat.id}" class="search_category_card">
          <i class="fa-solid ${categoryIcons[cat.name] || 'fa-folder'}"></i>
          <span>${cat.name}</span>
        </a>
      `).join('');
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  }

  // Configurar dropdown de búsqueda
  function setupSearchDropdown() {
    const searchInput = document.querySelector('.search_container input');
    const searchDropdown = document.querySelector('.search_dropdown');
    const searchForm = document.querySelector('.search_container form');
    
    if (!searchInput || !searchDropdown) return;
    
    // Mostrar dropdown al hacer focus en el input
    searchInput.addEventListener('focus', () => {
      searchDropdown.classList.add('show');
    });
    
    // Cerrar dropdown al hacer click afuera
    document.addEventListener('click', (e) => {
      const searchContainer = document.querySelector('.search_container');
      if (searchContainer && !searchContainer.contains(e.target)) {
        searchDropdown.classList.remove('show');
      }
    });
    
    // Manejar búsqueda por texto
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          const categoryPage = getCategoryPage();
          window.location.href = `${categoryPage}?search=${encodeURIComponent(query)}`;
        }
      });
    }
  }

  // Inicializar al cargar la página
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadSearchCategories();
      setupSearchDropdown();
    });
  } else {
    loadSearchCategories();
    setupSearchDropdown();
  }
})();
