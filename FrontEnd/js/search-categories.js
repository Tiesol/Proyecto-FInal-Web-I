(function() {
  if (window._searchCategoriesLoaded) return;
  window._searchCategoriesLoaded = true;

  function getCategoryPage() {
    const isLogged = !!localStorage.getItem('token');
    return isLogged ? './category-logged.html' : './category.html';
  }

  async function loadSearchCategories() {
    const grid = document.getElementById('searchCategoriesGrid');
    if (!grid) return;

    try {
      const response = await fetch(`${API_URL}/categories/`);
      if (!response.ok) throw new Error('Error al cargar categorías');

      const categories = await response.json();
      const categoryPage = getCategoryPage();

      grid.innerHTML = categories.map(cat => `
        <a href="${categoryPage}?category=${cat.id}" class="search_category_card">
          ${cat.name}
        </a>
      `).join('');
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  }

  function setupSearchDropdown() {
    const searchInput = document.querySelector('.search_container input');
    const searchDropdown = document.querySelector('.search_dropdown');
    const searchForm = document.querySelector('.search_container form');

    if (!searchInput || !searchDropdown) return;

    searchInput.addEventListener('focus', () => {
      searchDropdown.classList.add('show');
    });

    document.addEventListener('click', (e) => {
      const searchContainer = document.querySelector('.search_container');
      if (searchContainer && !searchContainer.contains(e.target)) {
        searchDropdown.classList.remove('show');
      }
    });

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
