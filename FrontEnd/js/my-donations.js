// my-donations.js - Mis contribuciones

function getToken() {
  return localStorage.getItem('token');
}

// Proteger página
if (!getToken()) {
  window.location.href = './login.html';
}

function formatCurrency(amount) {
  return '$' + amount.toLocaleString();
}

function formatDate(dateString) {
  var date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
}

async function loadMyDonations() {
  var container = document.getElementById('donationsList');
  
  try {
    var response = await fetch(API_URL + '/donations/my-donations', {
      headers: {
        'Authorization': 'Bearer ' + getToken()
      }
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = './login.html';
      return;
    }
    
    var donations = await response.json();
    
    if (donations.length === 0) {
      container.innerHTML = '<div class="empty_message"><p>No has realizado contribuciones aún.</p><a href="./index-logged.html" class="btn_primary">Explorar campañas</a></div>';
      return;
    }
    
    var html = '<table class="donations_table"><thead><tr><th>Fecha</th><th>Campaña</th><th>Monto</th><th>Acciones</th></tr></thead><tbody>';
    
    for (var i = 0; i < donations.length; i++) {
      var d = donations[i];
      html += '<tr>';
      html += '<td>' + formatDate(d.created_at) + '</td>';
      html += '<td>' + (d.campaign_title || 'Campaña #' + d.campaign_id) + '</td>';
      html += '<td class="amount">' + formatCurrency(d.amount) + '</td>';
      html += '<td><a href="./campaign-detail-logged.html?id=' + d.campaign_id + '" class="btn_ver">Ver campaña</a></td>';
      html += '</tr>';
    }
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<p>Error al cargar las contribuciones.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadMyDonations);
