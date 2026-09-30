// Formulário de contato: valida os campos e envia para POST /api/contatos

var form = document.getElementById('formContato');
var txtNome = document.getElementById('txtNome');
var txtEmail = document.getElementById('txtEmail');
var txtMensagem = document.getElementById('txtMensagem');
var aviso = document.getElementById('aviso');

// Contador de caracteres da mensagem
txtMensagem.addEventListener('input', function () {
    document.getElementById('contador').textContent = txtMensagem.value.length;
});

function marcarErro(campo, idErro, texto) {
    document.getElementById(idErro).textContent = texto;
    if (texto) {
        campo.classList.add('campo-erro');
    } else {
        campo.classList.remove('campo-erro');
    }
    return texto === '';
}

function validar() {
    var nomeOk = marcarErro(txtNome, 'erroNome',
        txtNome.value.trim().length < 3 ? 'Digite seu nome (mínimo 3 letras).' : '');

    var emailOk = marcarErro(txtEmail, 'erroEmail',
        txtEmail.value.indexOf('@') === -1 || txtEmail.value.indexOf('.') === -1 ? 'Digite um email válido.' : '');

    var msgOk = marcarErro(txtMensagem, 'erroMensagem',
        txtMensagem.value.trim().length < 10 ? 'A mensagem precisa ter pelo menos 10 caracteres.' : '');

    return nomeOk && emailOk && msgOk;
}

function mostrarAviso(texto, tipo) {
    aviso.textContent = texto;
    aviso.className = 'aviso mostrar ' + tipo;
}

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validar()) {
        mostrarAviso('Corrija os campos destacados.', 'erro');
        return;
    }

    // Monta o objeto que será enviado como JSON
    var interesses = [];
    document.querySelectorAll('input[name="interesses"]:checked').forEach(function (c) {
        interesses.push(c.value);
    });

    var dados = {
        nome: txtNome.value.trim(),
        email: txtEmail.value.trim(),
        genero: document.querySelector('input[name="genero"]:checked').value,
        interesses: interesses,
        nivel: document.getElementById('selNivel').value,
        mensagem: txtMensagem.value.trim()
    };

    try {
        var resposta = await fetch('/api/contatos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        var json = await resposta.json();

        if (resposta.ok) {
            mostrarAviso(json.mensagem, 'ok');
            form.reset();
            document.getElementById('contador').textContent = '0';
        } else {
            mostrarAviso(json.mensagem, 'erro');
        }
    } catch (erro) {
        mostrarAviso('Não foi possível enviar. O servidor está ligado?', 'erro');
    }
});

form.addEventListener('reset', function () {
    aviso.className = 'aviso';
    ['erroNome', 'erroEmail', 'erroMensagem'].forEach(function (id) {
        document.getElementById(id).textContent = '';
    });
    [txtNome, txtEmail, txtMensagem].forEach(function (c) { c.classList.remove('campo-erro'); });
    document.getElementById('contador').textContent = '0';
});
