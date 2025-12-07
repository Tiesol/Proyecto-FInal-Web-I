// Create Campaign Page JS (create-campaign.html)
// Funciones para crear/editar campañas

const rewards = [];
let editingCampaignId = null;
let currentMediaType = null;
let currentRequirements = [];
let currentWorkflowStateId = null;
let quill = null;

// Obtener ID de campaña si estamos editando
function getCampaignId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Handler para insertar imagen
function imageHandler() {
  showMediaModal('image');
}

// Handler para insertar video
function videoHandler() {
  showMediaModal('video');
}

// Inicializar Quill con handler de imagen por URL
function initQuill() {
  quill = new Quill('#quillEditor', {
    theme: 'snow',
    placeholder: 'Describe tu campaña en detalle...',
    modules: {
      toolbar: {
        container: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'align': [] }],
          ['link', 'image', 'video'],
          ['clean']
        ],
        handlers: {
          image: imageHandler,
          video: videoHandler
        }
      }
    }
  });
}

// Cargar requisitos según categoría
async function loadRequirements(categoryId) {
  const section = document.getElementById('requirementsSection');
  const container = document.getElementById('requirementsContainer');
  
  if (!categoryId) {
    section.classList.add('hidden');
    currentRequirements = [];
    return;
  }

  try {
    const response = await fetch(`${API_URL}/requirements/category/${categoryId}`);
    if (response.ok) {
      currentRequirements = await response.json();
      
      if (currentRequirements.length === 0) {
        section.classList.add('hidden');
        return;
      }

      // Renderizar requisitos
      container.innerHTML = currentRequirements.map(req => {
        const isRequired = req.is_required;
        const requiredMark = isRequired ? '<span class="required-mark">*</span>' : '';
        // NO usar required attr - validación solo en JS
        const requiredClass = isRequired ? 'is-required' : '';
        
        // Determinar tipo de input según requirement_type_id
        // 1=Texto, 2=Archivo, 3=Imagen, 4=URL
        let inputHtml = '';
        switch(req.requirement_type_id) {
          case 4: // URL
            inputHtml = `<input type="url" id="req_${req.id}" class="requirement-input ${requiredClass}" 
                         placeholder="https://..." data-req-id="${req.id}" data-required="${isRequired}">`;
            break;
          case 2: // Archivo - usamos URL también
          case 3: // Imagen - usamos URL
            inputHtml = `<input type="url" id="req_${req.id}" class="requirement-input ${requiredClass}" 
                         placeholder="URL del archivo o imagen" data-req-id="${req.id}" data-required="${isRequired}">`;
            break;
          default: // Texto
            inputHtml = `<textarea id="req_${req.id}" class="requirement-input requirement-textarea ${requiredClass}" 
                         rows="2" data-req-id="${req.id}" data-required="${isRequired}" placeholder="Tu respuesta..."></textarea>`;
        }

        return `
          <div class="requirement-item" data-req-id="${req.id}">
            <label for="req_${req.id}">
              ${req.name} ${requiredMark}
            </label>
            <p class="requirement-description">${req.description || ''}</p>
            ${inputHtml}
            <span class="error-mensaje">Este campo es obligatorio</span>
          </div>
        `;
      }).join('');

      section.classList.remove('hidden');
      
      // Si estamos editando, cargar las respuestas previas
      if (editingCampaignId) {
        await loadRequirementResponses(editingCampaignId);
      }
    }
  } catch (error) {
    console.error('Error cargando requisitos:', error);
  }
}

// Cargar respuestas de requisitos existentes
async function loadRequirementResponses(campaignId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/requirements/campaign/${campaignId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const responses = await response.json();
      responses.forEach(resp => {
        const input = document.querySelector(`input[data-req-id="${resp.requirement_id}"], textarea[data-req-id="${resp.requirement_id}"]`);
        if (input) {
          input.value = resp.response_value || resp.file_url || '';
        }
      });
    }
  } catch (error) {
    console.error('Error cargando respuestas:', error);
  }
}

// Obtener respuestas de requisitos del formulario
function getRequirementResponses() {
  const responses = [];
  currentRequirements.forEach(req => {
    const input = document.querySelector(`input[data-req-id="${req.id}"], textarea[data-req-id="${req.id}"]`);
    if (input && input.value && input.value.trim()) {
      const value = input.value.trim();
      responses.push({
        requirement_id: req.id,
        response_value: req.requirement_type_id === 1 ? value : null,
        file_url: req.requirement_type_id !== 1 ? value : null
      });
    }
  });
  return responses;
}

// Validar requisitos obligatorios
function validateRequirements() {
  let hasErrors = false;
  
  // Limpiar errores previos de requisitos
  document.querySelectorAll('.requirement-item').forEach(item => {
    item.classList.remove('error');
  });
  
  currentRequirements.forEach(req => {
    if (req.is_required) {
      const input = document.querySelector(`input[data-req-id="${req.id}"], textarea[data-req-id="${req.id}"]`);
      const item = document.querySelector(`.requirement-item[data-req-id="${req.id}"]`);
      if (!input || !input.value || !input.value.trim()) {
        if (item) item.classList.add('error');
        hasErrors = true;
      }
    }
  });
  return hasErrors;
}

// Mostrar modal para media
function showMediaModal(type) {
  currentMediaType = type;
  const modal = document.getElementById('mediaModal');
  const title = document.getElementById('mediaModalTitle');
  const label = document.getElementById('mediaModalLabel');
  const help = document.getElementById('mediaModalHelp');
  const input = document.getElementById('mediaUrlInput');

  if (type === 'image') {
    title.textContent = 'Insertar Imagen';
    label.textContent = 'URL de la imagen:';
    help.textContent = 'Pega la URL directa de la imagen (ej: https://ejemplo.com/foto.jpg)';
    input.placeholder = 'https://ejemplo.com/imagen.jpg';
  } else {
    title.textContent = 'Insertar Video';
    label.textContent = 'URL del video:';
    help.textContent = 'Pega el enlace de YouTube o Vimeo. Ej: https://youtube.com/watch?v=xxxxx';
    input.placeholder = 'https://youtube.com/watch?v=...';
  }

  input.value = '';
  modal.classList.remove('hidden');
  input.focus();
}

// Cerrar modal
function closeMediaModal() {
  document.getElementById('mediaModal').classList.add('hidden');
  currentMediaType = null;
}

// Insertar media desde modal
function insertMedia() {
  let url = document.getElementById('mediaUrlInput').value.trim();
  if (!url) {
    return;
  }

  const range = quill.getSelection(true);

  if (currentMediaType === 'video') {
    // Convertir URL de YouTube a embed
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) url = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) url = `https://www.youtube.com/embed/${videoId}`;
    }
    quill.insertEmbed(range.index, 'video', url);
  } else {
    quill.insertEmbed(range.index, 'image', url);
  }

  quill.setSelection(range.index + 1);
  closeMediaModal();
}

// Mostrar error visual
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
  document.getElementById('successMessage').classList.add('hidden');
  errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Mostrar éxito visual
function showSuccess(message) {
  const successDiv = document.getElementById('successMessage');
  successDiv.textContent = message;
  successDiv.classList.remove('hidden');
  document.getElementById('errorMessage').classList.add('hidden');
}

// Ocultar mensajes
function hideMessages() {
  document.getElementById('errorMessage').classList.add('hidden');
  document.getElementById('successMessage').classList.add('hidden');
}

// Cargar categorías
async function loadCategories() {
  try {
    const response = await fetch(`${API_URL}/categories/`);
    if (response.ok) {
      const categories = await response.json();
      const select = document.getElementById('categorySelect');
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

// Cargar datos de campaña existente (modo edición)
async function loadCampaignData(campaignId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/campaigns/${campaignId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const campaign = await response.json();
      
      // Guardar el workflow state
      currentWorkflowStateId = campaign.workflow_state_id;
      
      // Cambiar título de la página
      document.querySelector('.page-title').textContent = 'Editar Campaña';
      document.title = 'Editar Campaña - RiseUp';
      
      // Rellenar campos
      document.getElementById('campaignTitle').value = campaign.tittle || '';
      document.getElementById('shortDescription').value = campaign.description || '';
      document.getElementById('goalAmount').value = campaign.goal_amount || '';
      document.getElementById('mainImageUrl').value = campaign.main_image_url || '';
      
      if (campaign.expiration_date) {
        document.getElementById('expirationDate').value = campaign.expiration_date;
      }
      
      // Asignar el ID ANTES de cargar requisitos para que se carguen las respuestas
      editingCampaignId = campaignId;
      
      if (campaign.category_id) {
        document.getElementById('categorySelect').value = campaign.category_id;
        // Cargar requisitos de la categoría
        await loadRequirements(campaign.category_id);
      }
      
      // Cargar rich text en Quill
      if (campaign.rich_text) {
        quill.root.innerHTML = campaign.rich_text;
      }
      
      // Si está en Observado (3), mostrar el botón de observaciones activo
      if (currentWorkflowStateId === 3) {
        const btnObs = document.getElementById('btnObservations');
        btnObs.classList.remove('btn-warning');
        btnObs.classList.add('btn-obs-active');
      }
    } else {
      showError('No se pudo cargar la campaña');
    }
  } catch (error) {
    console.error('Error cargando campaña:', error);
    showError('Error al cargar los datos de la campaña');
  }
}

// Renderizar rewards
function renderRewards() {
  const container = document.getElementById('rewardsList');
  container.innerHTML = rewards.map((r, i) => `
    <div class="reward-card">
      <div class="reward-info">
        <strong>${r.title}</strong> - Mínimo: $${r.minAmount}
        <p>${r.description}</p>
      </div>
      <button type="button" class="btn-remove" onclick="removeReward(${i})">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join('');
}

// Añadir reward
function addReward() {
  const title = document.getElementById('rewardTitle').value.trim();
  const minAmount = document.getElementById('rewardMinAmount').value;
  const description = document.getElementById('rewardDescription').value.trim();

  if (!title || !minAmount) {
    showError('Ingresa título y monto mínimo para la recompensa');
    return;
  }

  rewards.push({ title, minAmount: parseFloat(minAmount), description });
  renderRewards();
  hideMessages();

  document.getElementById('rewardTitle').value = '';
  document.getElementById('rewardMinAmount').value = '';
  document.getElementById('rewardDescription').value = '';
}

// Remover reward
function removeReward(index) {
  rewards.splice(index, 1);
  renderRewards();
}

// Cargar y mostrar observaciones
async function loadAndShowObservations(campaignId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/campaigns/${campaignId}/observations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const observations = await response.json();
      const container = document.getElementById('observationsList');
      
      if (observations.length === 0) {
        container.innerHTML = '<p class="no-observations">No hay observaciones registradas.</p>';
      } else {
        container.innerHTML = observations.map(obs => `
          <div class="observation-item">
            <div class="observation-header">
              <span class="observation-admin"><i class="fa-solid fa-user-shield"></i> ${obs.admin_name || 'Administrador'}</span>
              <span class="observation-date">${new Date(obs.created_at).toLocaleString('es-ES')}</span>
            </div>
            <div class="observation-text">${obs.observation_text}</div>
          </div>
        `).join('');
      }
      
      document.getElementById('observationsModal').classList.remove('hidden');
    } else {
      showError('No se pudieron cargar las observaciones');
    }
  } catch (error) {
    console.error('Error cargando observaciones:', error);
    showError('Error al cargar las observaciones');
  }
}

// Cerrar modal de observaciones
function closeObservationsModal() {
  document.getElementById('observationsModal').classList.add('hidden');
}

// Limpiar errores de validación de campos
function limpiarErroresCampos() {
  const grupos = document.querySelectorAll('.form-group');
  grupos.forEach(g => g.classList.remove('error'));
}

async function saveCampaign(send) {
  hideMessages();
  limpiarErroresCampos();
  
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const tittle = document.getElementById('campaignTitle').value.trim();
  const description = document.getElementById('shortDescription').value.trim();
  const categoryId = document.getElementById('categorySelect').value;
  const goalAmount = document.getElementById('goalAmount').value;
  const expirationDate = document.getElementById('expirationDate').value;
  const mainImageUrl = document.getElementById('mainImageUrl').value.trim();
  const richText = quill.root.innerHTML;

  // Validación con errores visuales debajo de cada campo
  let hayErrores = false;
  
  if (!tittle) {
    document.getElementById('grupoTitulo').classList.add('error');
    hayErrores = true;
  }
  if (!description) {
    document.getElementById('grupoDescripcion').classList.add('error');
    hayErrores = true;
  }
  if (!categoryId) {
    document.getElementById('grupoCategoria').classList.add('error');
    hayErrores = true;
  }
  if (!goalAmount || parseFloat(goalAmount) <= 0) {
    document.getElementById('grupoMeta').classList.add('error');
    hayErrores = true;
  }
  if (!expirationDate) {
    document.getElementById('grupoFecha').classList.add('error');
    hayErrores = true;
  }
  
  if (hayErrores) {
    return;
  }

  // Si es enviar a revisión, validar requisitos obligatorios
  if (send) {
    const hasReqErrors = validateRequirements();
    if (hasReqErrors) {
      return;
    }
  }

  // Datos con los nombres correctos del backend
  const data = {
    tittle: tittle,
    description: description,
    goal_amount: parseFloat(goalAmount),
    expiration_date: expirationDate,
    main_image_url: mainImageUrl || null,
    rich_text: richText,
    category_id: parseInt(categoryId)
  };

  try {
    let response;
    let campaignId = editingCampaignId;
    
    if (editingCampaignId) {
      // Modo edición: PUT
      response = await fetch(`${API_URL}/campaigns/${editingCampaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
    } else {
      // Modo creación: POST
      response = await fetch(`${API_URL}/campaigns/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const newCampaign = await response.json();
        campaignId = newCampaign.id;
      }
    }

    if (!response.ok) {
      const err = await response.json();
      if (err.detail && Array.isArray(err.detail)) {
        const messages = err.detail.map(e => e.msg || e.message || 'Error de validación').join(', ');
        showError(messages);
      } else {
        showError(err.detail || 'Error al guardar la campaña');
      }
      return;
    }

    // Guardar respuestas de requisitos
    const reqResponses = getRequirementResponses();
    if (reqResponses.length > 0 && campaignId) {
      await fetch(`${API_URL}/requirements/campaign/${campaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reqResponses)
      });
    }

    // Si es enviar a revisión, cambiar workflow_state
    if (send && campaignId) {
      const reviewResponse = await fetch(`${API_URL}/campaigns/${campaignId}/submit-for-review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!reviewResponse.ok) {
        const err = await reviewResponse.json();
        showError(err.detail || 'Error al enviar a revisión');
        return;
      }
    }

    const msg = send 
      ? '¡Campaña enviada para revisión!'
      : (editingCampaignId ? '¡Campaña actualizada!' : '¡Borrador guardado!');
    showSuccess(msg);
    setTimeout(() => {
      window.location.href = 'my-campaigns.html';
    }, 1500);

  } catch (error) {
    console.error('Error:', error);
    showError('Error de conexión con el servidor');
  }
}

// Inicializar página
document.addEventListener('DOMContentLoaded', async function() {
  // Inicializar Quill primero
  initQuill();
  
  await loadCategories();
  
  // Verificar si estamos en modo edición
  const campaignId = getCampaignId();
  if (campaignId) {
    await loadCampaignData(campaignId);
  }

  // Evento para cargar requisitos al cambiar categoría
  document.getElementById('categorySelect').addEventListener('change', function() {
    const categoryId = this.value;
    loadRequirements(categoryId);
  });

  // Event listeners para el modal de media
  document.getElementById('closeMediaModal').addEventListener('click', closeMediaModal);
  document.getElementById('cancelMediaBtn').addEventListener('click', closeMediaModal);
  document.getElementById('insertMediaBtn').addEventListener('click', insertMedia);
  
  // Cerrar modal con Escape o click fuera
  document.getElementById('mediaModal').addEventListener('click', function(e) {
    if (e.target === this) closeMediaModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMediaModal();
  });
  
  // Enter en el input inserta el media
  document.getElementById('mediaUrlInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      insertMedia();
    }
  });

  document.getElementById('btnAddReward').addEventListener('click', addReward);

  document.getElementById('btnCancel').addEventListener('click', function() {
    window.location.href = 'my-campaigns.html';
  });

  document.getElementById('btnSave').addEventListener('click', function() {
    saveCampaign(false);
  });

  document.getElementById('btnSendCampaign').addEventListener('click', function() {
    saveCampaign(true);
  });

  document.getElementById('btnObservations').addEventListener('click', async function() {
    // Solo mostrar observaciones si la campaña existe y está en Observado (3)
    if (!editingCampaignId) {
      showError('Primero debes crear la campaña.');
      return;
    }
    
    if (currentWorkflowStateId !== 3) {
      showError('Las observaciones solo están disponibles cuando tu campaña ha sido observada por un administrador.');
      return;
    }
    
    await loadAndShowObservations(editingCampaignId);
  });

  // Event listeners para modal de observaciones
  document.getElementById('closeObservationsModal').addEventListener('click', closeObservationsModal);
  document.getElementById('closeObservationsBtn').addEventListener('click', closeObservationsModal);
  document.getElementById('observationsModal').addEventListener('click', function(e) {
    if (e.target === this) closeObservationsModal();
  });
});
