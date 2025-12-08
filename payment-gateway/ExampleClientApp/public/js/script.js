async function procesarPago(e) {
    e.preventDefault();
    const montoInput = document.getElementById('monto');
    const submitBtn = document.getElementById('submitBtn');
    const resultado = document.getElementById('resultado');
    const monto = montoInput.value;

    // Validar monto
    if (!monto || parseFloat(monto) <= 0) {
        mostrarResultado('Por favor ingresa un monto válido mayor a 0', false);
        return false;
    }

    // Deshabilitar botón y mostrar loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Procesando<span class="loading"></span>';
    resultado.style.display = 'none';

    try {
        // Hacer petición al endpoint
        const response = await fetch('/api/pago/cobrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ monto: parseFloat(monto) })
        });

        const data = await response.json();

        if (response.ok) {
            // Éxito
            window.location.href = `/cobro.html?id=${data.id}`;
        } else {
            // Error del servidor
            mostrarResultado(`Error: ${data.error}`, false);
        }
    } catch (error) {
        // Error de red o conexión
        mostrarResultado(
            `Error de conexión: No se pudo conectar con el servidor. ${error.message}`,
            false
        );
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Procesar Monto';
    }
}

function mostrarResultado(mensaje, esExito) {
    const resultado = document.getElementById('resultado');
    resultado.className = esExito ? 'mt-3 alert alert-success' : 'mt-3 alert alert-danger';
    resultado.innerHTML = `
        <strong>${esExito ? 'Éxito' : 'Error'}</strong>
        <div class="resultado-detalle">${mensaje}</div>
    `;
    resultado.style.display = 'block';
}
