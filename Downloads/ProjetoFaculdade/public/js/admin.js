// Área do administrador: login por sessão + CRUD de campeões

var areaLogin = document.getElementById('areaLogin');
var areaPainel = document.getElementById('areaPainel');

function mostrarAviso(id, texto, tipo) {
    var el = document.getElementById(id);
    el.textContent = texto;
    el.className = 'aviso mostrar ' + tipo;
}

// ---------- Sessão ----------
async function verificarSessao() {
    var resposta = await fetch('/api/sessao');
    var json = await resposta.json();
    if (json.dados.logado) {
        entrarNoPainel();
    }
}

function entrarNoPainel() {
    areaLogin.classList.add('oculto');
    areaPainel.classList.remove('oculto');
    carregarCampeoes();
    carregarContatos();
}

document.getElementById('formLogin').addEventListener('submit', async function (e) {
    e.preventDefault();
    var resposta = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            usuario: document.getElementById('txtUsuario').value,
            senha: document.getElementById('txtSenha').value
        })
    });
    var json = await resposta.json();

    if (resposta.ok) {
        entrarNoPainel();
    } else {
        mostrarAviso('avisoLogin', json.mensagem, 'erro');
    }
});

document.getElementById('btnSair').addEventListener('click', async function () {
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
});

// ---------- Lista de campeões ----------
async function carregarCampeoes() {
    var resposta = await fetch('/api/campeoes');
    var json = await resposta.json();
    var tbody = document.getElementById('tabelaAdmin');
    tbody.innerHTML = '';

    json.dados.forEach(function (c) {
        var tr = document.createElement('tr');

        [c.id, c.nome, c.funcao].forEach(function (valor) {
            var td = document.createElement('td');
            td.textContent = valor;
            tr.appendChild(td);
        });

        var tdAcoes = document.createElement('td');

        var btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.className = 'pequeno secundario';
        btnEditar.addEventListener('click', function () { prepararEdicao(c); });

        var btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.className = 'pequeno perigo';
        btnExcluir.addEventListener('click', function () { excluir(c); });

        tdAcoes.appendChild(btnEditar);
        tdAcoes.appendChild(btnExcluir);
        tr.appendChild(tdAcoes);
        tbody.appendChild(tr);
    });
}

// ---------- Formulário (POST / PUT) ----------
function prepararEdicao(c) {
    document.getElementById('txtId').value = c.id;
    document.getElementById('txtNomeCampeao').value = c.nome;
    document.getElementById('selFuncao').value = c.funcao;
    document.getElementById('selImagem').value = c.imagem;
    document.getElementById('txtDescricao').value = c.descricao;
    document.getElementById('tituloForm').textContent = 'Editando: ' + c.nome;
    document.getElementById('btnCancelar').classList.remove('oculto');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFormulario() {
    document.getElementById('formCampeao').reset();
    document.getElementById('txtId').value = '';
    document.getElementById('tituloForm').textContent = 'Novo campeão';
    document.getElementById('btnCancelar').classList.add('oculto');
}

document.getElementById('btnCancelar').addEventListener('click', limparFormulario);

document.getElementById('formCampeao').addEventListener('submit', async function (e) {
    e.preventDefault();

    var id = document.getElementById('txtId').value;
    var dados = {
        nome: document.getElementById('txtNomeCampeao').value.trim(),
        funcao: document.getElementById('selFuncao').value,
        imagem: document.getElementById('selImagem').value,
        descricao: document.getElementById('txtDescricao').value.trim()
    };

    // Se tem id -> PUT (atualizar). Se não tem -> POST (criar).
    var url = '/api/campeoes';
    var metodo = 'POST';
    if (id) {
        url = url + '/' + id;
        metodo = 'PUT';
    }

    var resposta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    var json = await resposta.json();

    if (resposta.ok) {
        mostrarAviso('avisoForm', json.mensagem, 'ok');
        limparFormulario();
        carregarCampeoes();
    } else {
        mostrarAviso('avisoForm', json.mensagem, 'erro');
    }
});

// ---------- Excluir (DELETE) ----------
async function excluir(c) {
    if (!confirm('Excluir o campeão ' + c.nome + '?')) {
        return;
    }
    var resposta = await fetch('/api/campeoes/' + c.id, { method: 'DELETE' });
    var json = await resposta.json();
    mostrarAviso('avisoForm', json.mensagem, resposta.ok ? 'ok' : 'erro');
    carregarCampeoes();
}

// ---------- Mensagens de contato (GET protegido) ----------
async function carregarContatos() {
    var resposta = await fetch('/api/contatos');
    var json = await resposta.json();
    var div = document.getElementById('listaContatos');
    div.innerHTML = '';

    if (json.dados.length === 0) {
        div.textContent = 'Nenhuma mensagem recebida ainda.';
        return;
    }

    json.dados.forEach(function (c) {
        var p = document.createElement('p');
        p.textContent = c.nome + ' (' + c.email + '): ' + c.mensagem;
        div.appendChild(p);
    });
}

verificarSessao();
