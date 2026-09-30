# Projeto Prático - League of Legends (Front-end + API REST)

Site sobre League of Legends com back-end em **Node.js + Express**.
A funcionalidade principal da API é o **CRUD de campeões** (não é gerenciamento de usuários).

## Como rodar
```bash
npm install
npm start
```
Abra http://localhost:3000

Login do administrador: **usuário `admin` / senha `1234`**

## Estrutura
```
server.js               -> back-end (rotas, sessão, JSON)
data/campeoes.json      -> "banco" de dados dos campeões
data/contatos.json      -> mensagens do formulário de contato
public/                 -> front-end (HTML, CSS, JS, imagens)
postman_collection.json -> requisições prontas (Postman / Insomnia)
```

## Endpoints
| Método | Rota | Acesso | Status |
|---|---|---|---|
| GET | /api/campeoes | público | 200 |
| GET | /api/campeoes/:id | público | 200, 404 |
| POST | /api/campeoes | **login** | 201, 400, 401 |
| PUT | /api/campeoes/:id | **login** | 200, 400, 401, 404 |
| DELETE | /api/campeoes/:id | **login** | 200, 401, 404 |
| POST | /api/login | público | 200, 400, 401 |
| POST | /api/logout | público | 200 |
| GET | /api/sessao | público | 200 |
| POST | /api/contatos | público | 201, 400 |
| GET | /api/contatos | **login** | 200, 401 |

## Formato das respostas (JSON)
```json
{ "sucesso": true, "mensagem": "Campeão criado com sucesso.", "dados": { "id": 5, "nome": "Teemo" } }
```
Em caso de erro: `{ "sucesso": false, "mensagem": "..." }`
