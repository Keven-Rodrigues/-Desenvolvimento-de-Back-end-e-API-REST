# API de Campeões — Atividade de Back-end

API REST construída com **Node.js + Express** para a funcionalidade de
gerenciamento de Campeões do projeto (relacionada à página `campeoes.html`
do site).

## Como rodar

```bash
cd backend
npm install
cp .env.example .env
npm start
```

A API sobe em `http://localhost:3000`.

## Estrutura de pastas

```
backend/
 ├─ server.js              -> arquivo principal, liga tudo
 ├─ routes/
 │   ├─ auth.js             -> rota de login (gera o token JWT)
 │   └─ campeoes.js         -> rotas GET, POST, PUT, DELETE de campeões
 ├─ middlewares/
 │   └─ auth.js             -> verifica o token JWT nas rotas protegidas
 └─ data/
     └─ campeoes.json       -> "banco de dados" simples em arquivo JSON
```

## Autenticação (JWT)

Login em `admin` / `admin123` (definidos no `.env`).

```
POST /api/login
Content-Type: application/json

{
  "usuario": "admin",
  "senha": "admin123"
}
```

Resposta:
```json
{
  "mensagem": "Login realizado com sucesso.",
  "token": "eyJhbGciOi..."
}
```

Esse token deve ser enviado no cabeçalho `Authorization` das rotas
protegidas (POST, PUT, DELETE):

```
Authorization: Bearer eyJhbGciOi...
```

O token expira em 1 hora. Isso não é um sistema de cadastro de usuários —
é apenas a forma de provar que quem está alterando os dados é o admin do
site, como pedido na atividade (controle de acesso).

## Endpoints

| Método | Rota                  | Protegido? | Descrição                        |
|--------|-----------------------|------------|-----------------------------------|
| GET    | /api/campeoes         | Não        | Lista todos os campeões           |
| GET    | /api/campeoes/:id     | Não        | Busca um campeão pelo id          |
| POST   | /api/campeoes         | Sim (JWT)  | Cria um novo campeão              |
| PUT    | /api/campeoes/:id     | Sim (JWT)  | Atualiza um campeão existente     |
| DELETE | /api/campeoes/:id     | Sim (JWT)  | Remove um campeão                 |

GET fica público porque é só consulta (qualquer visitante do site pode
ver os campeões). POST, PUT e DELETE ficam protegidos porque alteram os
dados.

### Exemplo de corpo para POST/PUT

```json
{
  "nome": "Lux",
  "funcao": "Maga",
  "descricao": "Maga de luz",
  "imagem": "lux.jpg"
}
```

## Códigos de status HTTP usados

| Código | Quando acontece                                              |
|--------|---------------------------------------------------------------|
| 200    | Requisição bem-sucedida (GET, PUT, DELETE)                    |
| 201    | Recurso criado com sucesso (POST)                              |
| 400    | Dados obrigatórios não enviados no corpo da requisição         |
| 401    | Token não enviado, ou login/senha incorretos                   |
| 403    | Token enviado, porém inválido ou expirado                      |
| 404    | Campeão (ou rota) não encontrado                                |

## Formato das respostas

Todas as respostas são em **JSON**, tanto em caso de sucesso quanto de
erro (ex.: `{ "erro": "Campeão não encontrado." }`).

## Testando

Pode testar com Insomnia, Postman ou `curl`. Exemplo de fluxo:

1. `POST /api/login` com usuário/senha -> pega o `token`.
2. `GET /api/campeoes` -> não precisa de token.
3. `POST /api/campeoes` com o `token` no header `Authorization` -> cria
   um campeão novo.
4. `PUT /api/campeoes/:id` -> atualiza.
5. `DELETE /api/campeoes/:id` -> remove.
