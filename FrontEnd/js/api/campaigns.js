// API Base URL
const API_URL = 'http://localhost:3000';

/**
 * Obtiene las campañas públicas (publicadas y en progreso)
 * @param {Object} options - { category_id, search, limit, offset }
 * @returns {Promise<Array>} Lista de campañas
 */
export async function getPublicCampaigns(options = {}) {
  try {
    const params = new URLSearchParams();
    
    if (options.category_id) params.append('category_id', options.category_id);
    if (options.search) params.append('search', options.search);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const queryString = params.toString();
    const url = `${API_URL}/campaigns/public${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Error al obtener campañas');
    }
    
    return data;
  } catch (error) {
    console.error('Error en getPublicCampaigns:', error);
    throw error;
  }
}

/**
 * Obtiene las campañas destacadas (más vistas/favoritos)
 * @param {number} limit - Cantidad máxima de campañas
 * @returns {Promise<Array>} Lista de campañas destacadas
 */
export async function getFeaturedCampaigns(limit = 6) {
  try {
    const response = await fetch(`${API_URL}/campaigns/featured?limit=${limit}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Error al obtener campañas destacadas');
    }
    
    return data;
  } catch (error) {
    console.error('Error en getFeaturedCampaigns:', error);
    throw error;
  }
}

/**
 * Obtiene el detalle de una campaña pública
 * @param {number} campaignId - ID de la campaña
 * @returns {Promise<Object>} Detalle de la campaña
 */
export async function getCampaignDetail(campaignId) {
  try {
    const response = await fetch(`${API_URL}/campaigns/public/${campaignId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Error al obtener campaña');
    }
    
    return data;
  } catch (error) {
    console.error('Error en getCampaignDetail:', error);
    throw error;
  }
}

/**
 * Obtiene las recompensas de una campaña
 * @param {number} campaignId - ID de la campaña
 * @returns {Promise<Array>} Lista de recompensas
 */
export async function getCampaignRewards(campaignId) {
  try {
    const response = await fetch(`${API_URL}/rewards/campaign/${campaignId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Error al obtener recompensas');
    }
    
    return data;
  } catch (error) {
    console.error('Error en getCampaignRewards:', error);
    throw error;
  }
}

/**
 * Obtiene los top donadores de una campaña
 * @param {number} campaignId - ID de la campaña
 * @param {number} limit - Cantidad máxima
 * @returns {Promise<Array>} Lista de top donadores
 */
export async function getTopDonors(campaignId, limit = 5) {
  try {
    const response = await fetch(`${API_URL}/donations/campaign/${campaignId}/top-donors?limit=${limit}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Error al obtener donadores');
    }
    
    return data;
  } catch (error) {
    console.error('Error en getTopDonors:', error);
    throw error;
  }
}

/**
 * Calcula los días restantes hasta una fecha
 * @param {string} expirationDate - Fecha de expiración
 * @returns {number} Días restantes
 */
export function calculateDaysLeft(expirationDate) {
  if (!expirationDate) return 0;
  
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Formatea un número como moneda
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
