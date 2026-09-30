# Mineiro LoL

Projeto full-stack sobre League of Legends desenvolvido com Node.js + Express, com front-end em HTML, CSS e JavaScript, além de API REST para gerenciamento de campeões e formulário de contato.

## O que foi feito

- Criação de um site temático de League of Legends
- Listagem pública de campeões
- Painel administrativo com login e sessão
- CRUD completo de campeões via API REST
- Armazenamento em arquivos JSON
- Formulário de contato com envio de mensagens
- Rotas protegidas por autenticação
- Estrutura organizada para front-end e back-end

## Tecnologias utilizadas

- Node.js
- Express
- Express Session
- HTML
- CSS
- JavaScript
- JSON como banco de dados simples

## Como rodar o projeto

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor:

```bash
npm start
```

4. Acesse no navegador:

```bash
http://localhost:3000
```

## Login do administrador

- Usuário: `admin`
- Senha: `1234`

## Estrutura do projeto

```bash
.
├── data/
│   ├── campeoes.json
│   └── contatos.json
├── public/
│   ├── css/ (se aplicável)
│   ├── js/
│   ├── imagens/
│   ├── index.html
│   ├── admin.html
│   ├── campeoes.html
│   ├── contato.html
│   └── mapa.html
├── package.json
├── server.js
├── postman_collection.json
├── README.md
└── ROTEIRO_VIDEO.md
```

## Endpoints principais da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/campeoes` | Lista todos os campeões |
| GET | `/api/campeoes/:id` | Busca um campeão por ID |
| POST | `/api/campeoes` | Cria um campeão (requer login) |
| PUT | `/api/campeoes/:id` | Atualiza um campeão (requer login) |
| DELETE | `/api/campeoes/:id` | Remove um campeão (requer login) |
| POST | `/api/login` | Faz login do administrador |
| POST | `/api/logout` | Encerra a sessão |
| GET | `/api/sessao` | Verifica se o usuário está logado |
| POST | `/api/contatos` | Envia mensagem do formulário |
| GET | `/api/contatos` | Lista mensagens recebidas (requer login) |

## Observações

Este projeto foi desenvolvido como exercício prático de back-end e API REST, com foco em:

- criação de rotas HTTP
- autenticação por sessão
- manipulação de arquivos JSON
- consumo de API no front-end
- organização de um projeto web em Node.js

## Autor

Keven Rodrigues Faria
