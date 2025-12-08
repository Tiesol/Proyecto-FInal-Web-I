

document.addEventListener('DOMContentLoaded', async function() {
    
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) {
        const isPaid = await fetchPago(id);

        if(!isPaid){
            // Refrescar cada 5 segundos si no está pagado
            // detener cuando esté pagado
            const intervalId = setInterval(async () => {
                const paid = await fetchPago(id);
                if (paid) {
                    clearInterval(intervalId);
                }
            }, 5000);
        }
    }
});

async function fetchPago(id) {
    const resultado = document.getElementById('resultado');
    let isPaid = false;
    resultado.style.display = 'block';
    const qrContainer = document.getElementById('qrContainer');
    try {
        const response = await fetch(`/api/pago/${id}`);
        const data = await response.json();
        if (response.ok) {

            if(data.estado === 'pendiente' && data.qr) {
                const qrImage = document.getElementById('qrImage');
                qrImage.src = data.qr;
                qrContainer.style.display = 'block';
                resultado.style.display = 'none';
            }else{
                resultado.className = 'mt-3 alert alert-success';
                resultado.innerHTML = `El pago ya fue procesado. Estado: <strong>${data.estado}</strong>`;
                qrContainer.style.display = 'none';
                isPaid = true;
            }

            const detallePago = document.getElementById('detallePago');
            detallePago.style.display = 'block';

            const montoPago = document.getElementById('montoPago');
            montoPago.textContent = `$${data.monto.toFixed(2)}`;

            
        } else {
            resultado.className = 'mt-3 alert alert-danger';

            resultado.innerHTML = `Error: ${data.error}`;
        }
    } catch (error) {
        resultado.className = 'mt-3 alert alert-danger';
        resultado.innerHTML = `Error al obtener los detalles del pago.`;
    }
    return isPaid;
}