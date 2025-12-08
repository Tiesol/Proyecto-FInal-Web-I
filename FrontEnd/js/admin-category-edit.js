var categoriaId = null;
var requisitos = [];
var requisitoAEliminar = null;
var requisitoEditando = null;

document.addEventListener('DOMContentLoaded', function() {
    verificarAdmin();

    var params = new URLSearchParams(window.location.search);
    categoriaId = params.get('id');

    if (categoriaId) {
        document.getElementById('tituloPagina').textContent = 'Editar Categoría';
        cargarCategoria();
        document.getElementById('seccionRequisitos').classList.remove('oculto');
    } else {
        document.getElementById('nombreCategoria').disabled = false;
    }
});

function verificarAdmin() {
    var token = localStorage.getItem('token');
    var user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || user.role_id !== 1) {
        window.location.href = './index-logged.html';
    }
}

function cargarCategoria() {
    fetch(API_URL + '/categories/' + categoriaId)
    .then(function(response) {
        if (!response.ok) throw new Error('Error');
        return response.json();
    })
    .then(function(data) {
        document.getElementById('nombreCategoria').value = data.name;
        cargarRequisitos();
    })
    .catch(function(error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar la categoría', 'error');
    });
}

function limpiarErrores() {
    var campos = document.querySelectorAll('.campo');
    for (var i = 0; i < campos.length; i++) {
        campos[i].classList.remove('error');
    }
}

function guardarCategoria() {
    var nombre = document.getElementById('nombreCategoria').value;

    limpiarErrores();

    if (!nombre || nombre.trim() === '') {
        document.getElementById('campoNombreCategoria').classList.add('error');
        return;
    }

    var token = localStorage.getItem('token');
    var url = API_URL + '/categories';
    var method = 'POST';

    if (categoriaId) {
        url = API_URL + '/categories/' + categoriaId;
        method = 'PUT';
    }

    fetch(url, {
        method: method,
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: nombre })
    })
    .then(function(response) {
        if (!response.ok) throw new Error('Error');
        return response.json();
    })
    .then(function(data) {
        if (!categoriaId) {
            mostrarMensaje('Categoría creada', 'exito');
            setTimeout(function() {
                window.location.href = './admin-category-edit.html?id=' + data.id;
            }, 1000);
        } else {
            mostrarMensaje('Categoría actualizada', 'exito');
        }
    })
    .catch(function(error) {
        console.error('Error:', error);
        mostrarMensaje('Error al guardar', 'error');
    });
}

function cargarRequisitos() {
    var token = localStorage.getItem('token');

    fetch(API_URL + '/requirements/category/' + categoriaId, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(response) {
        if (!response.ok) throw new Error('Error');
        return response.json();
    })
    .then(function(data) {
        requisitos = data;
        mostrarRequisitos();
    })
    .catch(function(error) {
        console.error('Error:', error);
        requisitos = [];
        mostrarRequisitos();
    });
}

function mostrarRequisitos() {
    var tbody = document.getElementById('tablaRequisitos');
    tbody.innerHTML = '';

    if (requisitos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="sin-resultados">No hay requisitos</td></tr>';
        return;
    }

    var tipos = { 1: 'Texto', 2: 'Archivo', 3: 'Imagen', 4: 'URL' };

    for (var i = 0; i < requisitos.length; i++) {
        var r = requisitos[i];
        var tr = document.createElement('tr');

        tr.innerHTML = '' +
            '<td>' + r.id + '</td>' +
            '<td>' + r.name + '</td>' +
            '<td>' + (tipos[r.requirement_type_id] || 'N/A') + '</td>' +
            '<td>' + (r.is_required ? 'Sí' : 'No') + '</td>' +
            '<td class="acciones">' +
                '<button class="btn btn-editar" onclick="editarRequisito(' + r.id + ')">Editar</button>' +
                '<button class="btn btn-eliminar" onclick="eliminarRequisito(' + r.id + ')">Eliminar</button>' +
            '</td>';

        tbody.appendChild(tr);
    }
}

function mostrarFormularioRequisito() {
    requisitoEditando = null;
    document.getElementById('requisitoId').value = '';
    document.getElementById('nombreRequisito').value = '';
    document.getElementById('descripcionRequisito').value = '';
    document.getElementById('tipoRequisito').value = '1';
    document.getElementById('obligatorioRequisito').checked = false;
    document.getElementById('tituloRequisito').textContent = 'Nuevo Requisito';
    document.getElementById('formularioRequisito').classList.remove('oculto');
}

function editarRequisito(id) {
    var requisito = null;
    for (var i = 0; i < requisitos.length; i++) {
        if (requisitos[i].id === id) {
            requisito = requisitos[i];
            break;
        }
    }

    if (!requisito) return;

    requisitoEditando = id;
    document.getElementById('requisitoId').value = id;
    document.getElementById('nombreRequisito').value = requisito.name;
    document.getElementById('descripcionRequisito').value = requisito.description || '';
    document.getElementById('tipoRequisito').value = requisito.requirement_type_id;
    document.getElementById('obligatorioRequisito').checked = requisito.is_required;
    document.getElementById('tituloRequisito').textContent = 'Editar Requisito';
    document.getElementById('formularioRequisito').classList.remove('oculto');
}

function cancelarRequisito() {
    document.getElementById('formularioRequisito').classList.add('oculto');
    requisitoEditando = null;
}

function guardarRequisito() {
    var nombre = document.getElementById('nombreRequisito').value;
    var descripcion = document.getElementById('descripcionRequisito').value;
    var tipo = document.getElementById('tipoRequisito').value;
    var obligatorio = document.getElementById('obligatorioRequisito').checked;

    limpiarErrores();

    if (!nombre || nombre.trim() === '') {
        document.getElementById('campoNombreRequisito').classList.add('error');
        return;
    }

    var token = localStorage.getItem('token');
    var datos = {
        name: nombre,
        description: descripcion,
        requirement_type_id: parseInt(tipo),
        is_required: obligatorio,
        category_id: parseInt(categoriaId)
    };

    var url = API_URL + '/requirements';
    var method = 'POST';

    if (requisitoEditando) {
        url = API_URL + '/requirements/' + requisitoEditando;
        method = 'PUT';
    }

    fetch(url, {
        method: method,
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(function(response) {
        if (!response.ok) throw new Error('Error');
        return response.json();
    })
    .then(function(data) {
        cancelarRequisito();
        mostrarMensaje(requisitoEditando ? 'Requisito actualizado' : 'Requisito creado', 'exito');
        cargarRequisitos();
    })
    .catch(function(error) {
        console.error('Error:', error);
        mostrarMensaje('Error al guardar el requisito', 'error');
    });
}

function eliminarRequisito(id) {
    requisitoAEliminar = id;
    document.getElementById('textoConfirmar').textContent = '¿Estás seguro de eliminar este requisito?';
    document.getElementById('modalConfirmar').classList.remove('oculto');
}

function cerrarModal() {
    document.getElementById('modalConfirmar').classList.add('oculto');
    requisitoAEliminar = null;
}

function confirmarEliminarRequisito() {
    if (!requisitoAEliminar) return;

    var token = localStorage.getItem('token');

    fetch(API_URL + '/requirements/' + requisitoAEliminar, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(response) {
        if (!response.ok) throw new Error('Error');
        return response.json();
    })
    .then(function(data) {
        cerrarModal();
        mostrarMensaje('Requisito eliminado', 'exito');
        cargarRequisitos();
    })
    .catch(function(error) {
        console.error('Error:', error);
        mostrarMensaje('Error al eliminar', 'error');
    });
}

function mostrarMensaje(texto, tipo) {
    var div = document.getElementById('mensaje');
    div.textContent = texto;
    div.className = 'mensaje mensaje-' + tipo;
    div.classList.remove('hidden');

    setTimeout(function() {
        div.classList.add('hidden');
    }, 3000);
}
