var admins = [];
var adminAEliminar = null;
var miId = null;

document.addEventListener('DOMContentLoaded', function() {
    verificarAdmin();
    cargarAdmins();
});

function verificarAdmin() {
    var token = localStorage.getItem('token');
    var user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || user.role_id !== 1) {
        window.location.href = './index-logged.html';
    }

    miId = user.id;
}

function cargarAdmins() {
    var token = localStorage.getItem('token');

    fetch(API_URL + '/admin/users', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Error al cargar');
        }
        return response.json();
    })
    .then(function(data) {
        admins = data;
        mostrarAdmins();
    })
    .catch(function(error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar los administradores', 'error');
    });
}

function mostrarAdmins() {
    var tbody = document.getElementById('tablaAdmins');
    tbody.innerHTML = '';

    if (admins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="sin-resultados">No hay administradores</td></tr>';
        return;
    }

    for (var i = 0; i < admins.length; i++) {
        var a = admins[i];
        var tr = document.createElement('tr');

        var nombreCompleto = a.first_name + ' ' + a.last_name;
        var esMiUsuario = (a.id === miId);

        var botonEliminar = '';
        if (!esMiUsuario) {
            botonEliminar = '<button class="btn btn-eliminar" onclick="abrirModalEliminar(' + a.id + ', \'' + nombreCompleto + '\')">Eliminar</button>';
        } else {
            botonEliminar = '<span class="texto-info">(Tú)</span>';
        }

        tr.innerHTML = '' +
            '<td>' + a.id + '</td>' +
            '<td>' + nombreCompleto + '</td>' +
            '<td>' + a.email + '</td>' +
            '<td class="acciones">' + botonEliminar + '</td>';

        tbody.appendChild(tr);
    }
}

function mostrarFormulario() {
    document.getElementById('nombreAdmin').value = '';
    document.getElementById('apellidoAdmin').value = '';
    document.getElementById('emailAdmin').value = '';
    document.getElementById('passwordAdmin').value = '';
    limpiarErrores();
    document.getElementById('formularioAdmin').classList.remove('oculto');
}

function limpiarErrores() {
    var campos = document.querySelectorAll('.campo');
    for (var i = 0; i < campos.length; i++) {
        campos[i].classList.remove('error');
    }
}

function validarEmail(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function cancelarFormulario() {
    limpiarErrores();
    document.getElementById('formularioAdmin').classList.add('oculto');
}

function crearAdmin() {
    var nombre = document.getElementById('nombreAdmin').value;
    var apellido = document.getElementById('apellidoAdmin').value;
    var email = document.getElementById('emailAdmin').value;
    var password = document.getElementById('passwordAdmin').value;

    limpiarErrores();
    var hayErrores = false;

    if (!nombre || nombre.trim() === '') {
        document.getElementById('campoNombre').classList.add('error');
        hayErrores = true;
    }
    if (!apellido || apellido.trim() === '') {
        document.getElementById('campoApellido').classList.add('error');
        hayErrores = true;
    }
    if (!email || email.trim() === '' || !validarEmail(email)) {
        document.getElementById('campoEmail').classList.add('error');
        hayErrores = true;
    }
    if (!password || password.length < 8) {
        document.getElementById('campoPassword').classList.add('error');
        hayErrores = true;
    }

    if (hayErrores) {
        return;
    }

    var token = localStorage.getItem('token');
    var datos = {
        first_name: nombre,
        last_name: apellido,
        email: email,
        password: password
    };

    fetch(API_URL + '/admin/users', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(function(response) {
        if (!response.ok) {
            return response.json().then(function(err) {
                throw new Error(err.detail || 'Error');
            });
        }
        return response.json();
    })
    .then(function(data) {
        cancelarFormulario();
        mostrarMensaje('Administrador creado correctamente', 'exito');
        cargarAdmins();
    })
    .catch(function(error) {
        console.error('Error:', error);
        mostrarMensaje('Error: ' + error.message, 'error');
    });
}

function abrirModalEliminar(id, nombre) {
    adminAEliminar = id;
    document.getElementById('textoConfirmar').textContent = '¿Estás seguro de que quieres eliminar a ' + nombre + '?';
    document.getElementById('modalConfirmar').classList.remove('oculto');
}

function cerrarModal() {
    document.getElementById('modalConfirmar').classList.add('oculto');
    adminAEliminar = null;
}

function confirmarEliminar() {
    if (!adminAEliminar) return;

    var token = localStorage.getItem('token');

    fetch(API_URL + '/admin/users/' + adminAEliminar, {
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
        mostrarMensaje('Administrador eliminado', 'exito');
        cargarAdmins();
    })
    .catch(function(error) {
        console.error('Error:', error);
        mostrarMensaje('Error al eliminar el administrador', 'error');
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
