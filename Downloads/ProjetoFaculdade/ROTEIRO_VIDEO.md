# Roteiro do vídeo (máx. 20 min) - sugestão de tempo

1. **Apresentação (1 min)** - nome, projeto (site de LoL), o que foi feito: CRUD de campeões com API REST.
2. **Estrutura do código (3 min)** - abrir `server.js`: imports, `express.json()`, `express-session`, funções `lerArquivo/salvarArquivo`, pasta `data/` e pasta `public/`.
3. **Métodos HTTP (3 min)** - GET (buscar), POST (criar), PUT (atualizar), DELETE (excluir). Mostrar a rota de cada um no código.
4. **Status codes (3 min)** - 200 OK, 201 Created (POST), 400 Bad Request (dados faltando / JSON inválido), 401 Unauthorized (sem login), 404 Not Found (id não existe).
5. **Controle de acesso por sessão (3 min)** - `express-session` (cookie com o id da sessão; os dados ficam no servidor), a rota `/api/login` criando `req.session.logado`, e o middleware `verificarLogin` protegendo POST/PUT/DELETE.
6. **Formato JSON (2 min)** - `sucesso`, `mensagem`, `dados`; mostrar uma resposta de sucesso e uma de erro.
7. **Demonstração no Postman/Insomnia (5 min)** - seguir a ordem da coleção `postman_collection.json` (a ordem já mostra 401 -> login -> CRUD -> 400/404 -> logout -> 401).
8. **Front-end (1 min, opcional)** - mostrar o site consumindo a API (`campeoes.html` e `admin.html`).
