// Página de campeões: busca os dados na API (GET /api/campeoes)

var listaCampeoes = [];

function mostrarErro(texto) {
    var aviso = document.getElementById('aviso');
    aviso.textContent = texto;
    aviso.classList.add('mostrar');
}

function desenhar(lista) {
    var tabela = document.getElementById('tabelaCampeoes');
    var grade = document.getElementById('gradeCampeoes');
    tabela.innerHTML = '';
    grade.innerHTML = '';

    lista.forEach(function (c) {
        // linha da tabela
        var tr = document.createElement('tr');
        var tdNome = document.createElement('td');
        var tdFuncao = document.createElement('td');
        tdNome.textContent = c.nome;
        tdFuncao.textContent = c.funcao;
        tr.appendChild(tdNome);
        tr.appendChild(tdFuncao);
        tabela.appendChild(tr);

        // card
        var card = document.createElement('div');
        card.className = 'card';

        var img = document.createElement('img');
        img.src = c.imagem;
        img.alt = 'Campeão ' + c.nome;

        var corpo = document.createElement('div');
        corpo.className = 'card-corpo';

        var titulo = document.createElement('h3');
        titulo.textContent = c.nome;

        var etiqueta = document.createElement('span');
        etiqueta.className = 'etiqueta';
        etiqueta.textContent = c.funcao;

        var descricao = document.createElement('p');
        descricao.textContent = c.descricao;

        corpo.appendChild(titulo);
        corpo.appendChild(etiqueta);
        corpo.appendChild(descricao);
        card.appendChild(img);
        card.appendChild(corpo);
        grade.appendChild(card);
    });
}

async function carregar() {
    try {
        var resposta = await fetch('/api/campeoes');
        var json = await resposta.json();
        listaCampeoes = json.dados;
        desenhar(listaCampeoes);
    } catch (erro) {
        mostrarErro('Não foi possível carregar os campeões. O servidor está ligado?');
    }
}

// Filtro de busca por nome
document.getElementById('txtBusca').addEventListener('input', function (e) {
    var texto = e.target.value.toLowerCase();
    var filtrados = listaCampeoes.filter(function (c) {
        return c.nome.toLowerCase().indexOf(texto) !== -1;
    });
    desenhar(filtrados);
});

carregar();
