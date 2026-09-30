// =====================================================
// Back-end do projeto "League of Legends"
// API REST com Node.js + Express + controle de acesso por sessão
// =====================================================

const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORTA = 3000;

// Arquivos onde os dados ficam salvos (em formato JSON)
const ARQUIVO_CAMPEOES = path.join(__dirname, 'data', 'campeoes.json');
const ARQUIVO_CONTATOS = path.join(__dirname, 'data', 'contatos.json');

// Login do administrador (fixo, só para liberar o acesso às rotas protegidas)
const ADMIN_USUARIO = 'admin';
const ADMIN_SENHA = '1234';

// -----------------------------------------------------
// Configurações (middlewares)
// -----------------------------------------------------

// Permite receber JSON no corpo (body) das requisições
app.use(express.json());

// Configura a sessão. O servidor guarda quem está logado
// e envia ao navegador um cookie com o id da sessão.
app.use(session({
    secret: 'segredo-do-projeto-lol',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 30 } // sessão dura 30 minutos
}));

// Entrega o front-end (pasta public)
app.use(express.static(path.join(__dirname, 'public')));

// -----------------------------------------------------
// Funções auxiliares para ler e salvar os arquivos JSON
// -----------------------------------------------------

function lerArquivo(caminho) {
    const texto = fs.readFileSync(caminho, 'utf-8');
    return JSON.parse(texto);
}

function salvarArquivo(caminho, dados) {
    fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), 'utf-8');
}

// -----------------------------------------------------
// Middleware de controle de acesso por sessão
// Se não estiver logado, responde 401 e bloqueia a rota
// -----------------------------------------------------

function verificarLogin(req, res, next) {
    if (req.session.logado) {
        next(); // está logado, pode continuar
    } else {
        res.status(401).json({
            sucesso: false,
            mensagem: 'Acesso negado. Faça login para usar este recurso.'
        });
    }
}

// =====================================================
// ROTAS DE AUTENTICAÇÃO (sessão)
// =====================================================

// POST /api/login -> cria a sessão
app.post('/api/login', function (req, res) {
    const usuario = req.body.usuario;
    const senha = req.body.senha;

    if (!usuario || !senha) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Informe usuário e senha.'
        });
    }

    if (usuario === ADMIN_USUARIO && senha === ADMIN_SENHA) {
        req.session.logado = true;
        req.session.usuario = usuario;
        return res.status(200).json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso.',
            dados: { usuario: usuario }
        });
    }

    res.status(401).json({
        sucesso: false,
        mensagem: 'Usuário ou senha inválidos.'
    });
});

// POST /api/logout -> destrói a sessão
app.post('/api/logout', function (req, res) {
    req.session.destroy(function () {
        res.status(200).json({
            sucesso: true,
            mensagem: 'Logout realizado com sucesso.'
        });
    });
});

// GET /api/sessao -> informa se existe alguém logado (usado pelo front)
app.get('/api/sessao', function (req, res) {
    res.status(200).json({
        sucesso: true,
        dados: { logado: req.session.logado === true }
    });
});

// =====================================================
// ROTAS DE CAMPEÕES (CRUD)
// =====================================================

// GET /api/campeoes -> lista todos (pública)
app.get('/api/campeoes', function (req, res) {
    const campeoes = lerArquivo(ARQUIVO_CAMPEOES);
    res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de campeões.',
        dados: campeoes
    });
});

// GET /api/campeoes/:id -> busca um campeão (pública)
app.get('/api/campeoes/:id', function (req, res) {
    const id = Number(req.params.id);
    const campeoes = lerArquivo(ARQUIVO_CAMPEOES);
    const campeao = campeoes.find(function (c) { return c.id === id; });

    if (!campeao) {
        return res.status(404).json({
            sucesso: false,
            mensagem: 'Campeão não encontrado.'
        });
    }

    res.status(200).json({ sucesso: true, dados: campeao });
});

// POST /api/campeoes -> cria um campeão (protegida)
app.post('/api/campeoes', verificarLogin, function (req, res) {
    const nome = req.body.nome;
    const funcao = req.body.funcao;
    const descricao = req.body.descricao;
    const imagem = req.body.imagem;

    if (!nome || !funcao) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Os campos nome e funcao são obrigatórios.'
        });
    }

    const campeoes = lerArquivo(ARQUIVO_CAMPEOES);

    // O novo id é o maior id existente + 1
    let novoId = 1;
    if (campeoes.length > 0) {
        novoId = Math.max.apply(null, campeoes.map(function (c) { return c.id; })) + 1;
    }

    const novo = {
        id: novoId,
        nome: nome,
        funcao: funcao,
        descricao: descricao || '',
        imagem: imagem || 'imagens/padrao.svg'
    };

    campeoes.push(novo);
    salvarArquivo(ARQUIVO_CAMPEOES, campeoes);

    res.status(201).json({
        sucesso: true,
        mensagem: 'Campeão criado com sucesso.',
        dados: novo
    });
});

// PUT /api/campeoes/:id -> atualiza um campeão (protegida)
app.put('/api/campeoes/:id', verificarLogin, function (req, res) {
    const id = Number(req.params.id);
    const campeoes = lerArquivo(ARQUIVO_CAMPEOES);
    const campeao = campeoes.find(function (c) { return c.id === id; });

    if (!campeao) {
        return res.status(404).json({
            sucesso: false,
            mensagem: 'Campeão não encontrado.'
        });
    }

    if (!req.body.nome || !req.body.funcao) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Os campos nome e funcao são obrigatórios.'
        });
    }

    campeao.nome = req.body.nome;
    campeao.funcao = req.body.funcao;
    campeao.descricao = req.body.descricao || '';
    campeao.imagem = req.body.imagem || campeao.imagem;

    salvarArquivo(ARQUIVO_CAMPEOES, campeoes);

    res.status(200).json({
        sucesso: true,
        mensagem: 'Campeão atualizado com sucesso.',
        dados: campeao
    });
});

// DELETE /api/campeoes/:id -> exclui um campeão (protegida)
app.delete('/api/campeoes/:id', verificarLogin, function (req, res) {
    const id = Number(req.params.id);
    const campeoes = lerArquivo(ARQUIVO_CAMPEOES);
    const posicao = campeoes.findIndex(function (c) { return c.id === id; });

    if (posicao === -1) {
        return res.status(404).json({
            sucesso: false,
            mensagem: 'Campeão não encontrado.'
        });
    }

    const removido = campeoes.splice(posicao, 1)[0];
    salvarArquivo(ARQUIVO_CAMPEOES, campeoes);

    res.status(200).json({
        sucesso: true,
        mensagem: 'Campeão excluído com sucesso.',
        dados: removido
    });
});

// =====================================================
// ROTAS DE CONTATO (formulário do site)
// =====================================================

// POST /api/contatos -> recebe uma mensagem do formulário (pública)
app.post('/api/contatos', function (req, res) {
    const nome = req.body.nome;
    const email = req.body.email;
    const mensagem = req.body.mensagem;

    if (!nome || !email || !mensagem) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Nome, email e mensagem são obrigatórios.'
        });
    }

    if (email.indexOf('@') === -1) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Email inválido.'
        });
    }

    const contatos = lerArquivo(ARQUIVO_CONTATOS);

    const novo = {
        id: contatos.length + 1,
        nome: nome,
        email: email,
        genero: req.body.genero || '',
        interesses: req.body.interesses || [],
        nivel: req.body.nivel || '',
        mensagem: mensagem,
        data: new Date().toISOString()
    };

    contatos.push(novo);
    salvarArquivo(ARQUIVO_CONTATOS, contatos);

    res.status(201).json({
        sucesso: true,
        mensagem: 'Mensagem enviada com sucesso!',
        dados: { id: novo.id }
    });
});

// GET /api/contatos -> lista as mensagens recebidas (protegida)
app.get('/api/contatos', verificarLogin, function (req, res) {
    const contatos = lerArquivo(ARQUIVO_CONTATOS);
    res.status(200).json({
        sucesso: true,
        mensagem: 'Lista de mensagens recebidas.',
        dados: contatos
    });
});

// =====================================================
// Tratamento de erros
// =====================================================

// Rota /api que não existe -> 404 em JSON
app.use('/api', function (req, res) {
    res.status(404).json({
        sucesso: false,
        mensagem: 'Rota não encontrada.'
    });
});

// JSON inválido no corpo da requisição -> 400 em JSON
app.use(function (erro, req, res, next) {
    if (erro.type === 'entity.parse.failed') {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'JSON inválido no corpo da requisição.'
        });
    }
    res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno no servidor.'
    });
});

// -----------------------------------------------------
// Inicia o servidor
// -----------------------------------------------------
app.listen(PORTA, function () {
    console.log('Servidor rodando em http://localhost:' + PORTA);
});
