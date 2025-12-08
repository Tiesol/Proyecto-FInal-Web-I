// wallet.js - Página de confirmación de pago del gateway

// Obtener ID del pago de la URL
const pathParts = window.location.pathname.split('/');
const paymentId = pathParts[pathParts.length - 1];

document.getElementById('paymentId').textContent = paymentId;

// Cargar información del pago
async function loadPayment() {
  const loading = document.getElementById('loading');
  const paymentInfo = document.getElementById('paymentInfo');
  const errorInfo = document.getElementById('errorInfo');
  
  try {
    const response = await fetch(`/payments/${paymentId}`);
    
    if (!response.ok) {
      throw new Error('Pago no encontrado');
    }
    
    const data = await response.json();
    loading.style.display = 'none';
    paymentInfo.style.display = 'block';
    
    document.getElementById('amount').textContent = `$${data.monto.toFixed(2)}`;
    
    const statusBadge = document.getElementById('status');
    if (data.estado === 'CONFIRMED') {
      statusBadge.textContent = 'Confirmado';
      statusBadge.classList.remove('status-pending');
      statusBadge.classList.add('status-confirmed');
      document.getElementById('confirmSection').style.display = 'none';
      document.getElementById('confirmedSection').style.display = 'block';
    }
    
  } catch (error) {
    loading.style.display = 'none';
    errorInfo.style.display = 'block';
    document.getElementById('errorMessage').textContent = error.message;
  }
}

// Confirmar pago
async function confirmPayment() {
  const btn = document.getElementById('btnConfirm');
  btn.disabled = true;
  btn.innerHTML = 'Procesando...';
  
  try {
    const response = await fetch(`/payments/${paymentId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al confirmar');
    }
    
    document.getElementById('confirmSection').style.display = 'none';
    document.getElementById('confirmedSection').style.display = 'block';
    
    const statusBadge = document.getElementById('status');
    statusBadge.textContent = 'Confirmado';
    statusBadge.classList.remove('status-pending');
    statusBadge.classList.add('status-confirmed');
    
  } catch (error) {
    btn.disabled = false;
    btn.innerHTML = 'Confirmar Pago';
    alert(error.message);
  }
}

// Iniciar
loadPayment();
