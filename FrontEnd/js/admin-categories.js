var categorias = [];
var categoriaAEliminar = null;

document.addEventListener('DOMContentLoaded', function() {
    verificarAdmin();
    cargarCategorias();
});

function verificarAdmin() {
    var token = localStorage.getItem('token');
    var user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || user.role_id !== 1) {
        window.location.href = './index-logged.html';
    }
}

function cargarCategorias() {
    fetch(API_URL + '/categories')
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Error al cargar');
        }
        return response.json();
    })
    .then(function(data) {
        categorias = data;
        mostrarCategorias();
    })
    .catch(function(error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar las categorías', 'error');
    });
}

function mostrarCategorias() {
    var tbody = document.getElementById('tablaCategorias');
    tbody.innerHTML = '';

    if (categorias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="sin-resultados">No hay categorías</td></tr>';
        return;
    }

    for (var i = 0; i < categorias.length; i++) {
        var c = categorias[i];
        var tr = document.createElement('tr');

        tr.innerHTML = '' +
            '<td>' + c.id + '</td>' +
            '<td>' + c.name + '</td>' +
            '<td>' + (c.requirements_count || 0) + '</td>' +
            '<td class="acciones">' +
                '<a href="./admin-category-edit.html?id=' + c.id + '" class="btn btn-editar">Editar</a>' +
                '<button class="btn btn-eliminar" onclick="eliminarCategoria(' + c.id + ')">Eliminar</button>' +
            '</td>';

        tbody.appendChild(tr);
    }
}

function eliminarCategoria(id) {
    var categoria = null;
    for (var i = 0; i < categorias.length; i++) {
        if (categorias[i].id === id) {
            categoria = categorias[i];
            break;
        }
    }

    categoriaAEliminar = id;
    document.getElementById('textoConfirmar').textContent = '¿Estás seguro de eliminar "' + (categoria ? categoria.name : 'esta categoría') + '"?';
    document.getElementById('modalConfirmar').classList.remove('oculto');
}

function cerrarModal() {
    document.getElementById('modalConfirmar').classList.add('oculto');
    categoriaAEliminar = null;
}

function confirmarEliminar() {
    if (!categoriaAEliminar) return;

    var token = localStorage.getItem('token');

    fetch(API_URL + '/categories/' + categoriaAEliminar, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Error');
        }
        return response.json();
    })
    .then(function(data) {
        cerrarModal();
        mostrarMensaje('Categoría eliminada', 'exito');
        cargarCategorias();
    })
    .catch(function(error) {
        console.error('Error:', error);
        mostrarMensaje('Error al eliminar la categoría', 'error');
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
