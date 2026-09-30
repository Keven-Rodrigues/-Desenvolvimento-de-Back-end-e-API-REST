// routes/campeoes.js
// Endpoints da funcionalidade principal: CRUD de Campeões.
// GET    -> não exige login (qualquer visitante do site pode consultar)
// POST, PUT, DELETE -> exigem token JWT (só o admin pode alterar os dados)

const express = require("express");
const fs = require("fs");
const path = require("path");
const verificarToken = require("../middlewares/auth");

const router = express.Router();
const caminhoArquivo = path.join(__dirname, "..", "data", "campeoes.json");

// Funções auxiliares para ler e salvar o arquivo JSON que funciona
// como nosso "banco de dados" simples.
function lerCampeoes() {
  const dados = fs.readFileSync(caminhoArquivo, "utf-8");
  return JSON.parse(dados);
}

function salvarCampeoes(campeoes) {
  fs.writeFileSync(caminhoArquivo, JSON.stringify(campeoes, null, 2));
}

// GET /api/campeoes -> lista todos os campeões
router.get("/", (req, res) => {
  const campeoes = lerCampeoes();
  res.status(200).json(campeoes);
});

// GET /api/campeoes/:id -> busca um campeão específico
router.get("/:id", (req, res) => {
  const campeoes = lerCampeoes();
  const campeao = campeoes.find((c) => c.id === Number(req.params.id));

  if (!campeao) {
    return res.status(404).json({ erro: "Campeão não encontrado." });
  }

  res.status(200).json(campeao);
});

// POST /api/campeoes -> cria um novo campeão (protegido)
router.post("/", verificarToken, (req, res) => {
  const { nome, funcao, descricao, imagem } = req.body;

  if (!nome || !funcao) {
    return res.status(400).json({ erro: "Os campos 'nome' e 'funcao' são obrigatórios." });
  }

  const campeoes = lerCampeoes();

  const novoCampeao = {
    id: campeoes.length > 0 ? campeoes[campeoes.length - 1].id + 1 : 1,
    nome,
    funcao,
    descricao: descricao || "",
    imagem: imagem || "",
  };

  campeoes.push(novoCampeao);
  salvarCampeoes(campeoes);

  res.status(201).json({
    mensagem: "Campeão criado com sucesso.",
    campeao: novoCampeao,
  });
});

// PUT /api/campeoes/:id -> atualiza um campeão existente (protegido)
router.put("/:id", verificarToken, (req, res) => {
  const campeoes = lerCampeoes();
  const indice = campeoes.findIndex((c) => c.id === Number(req.params.id));

  if (indice === -1) {
    return res.status(404).json({ erro: "Campeão não encontrado." });
  }

  const { nome, funcao, descricao, imagem } = req.body;

  // Atualiza somente os campos enviados, mantendo os demais como estavam
  campeoes[indice] = {
    ...campeoes[indice],
    nome: nome ?? campeoes[indice].nome,
    funcao: funcao ?? campeoes[indice].funcao,
    descricao: descricao ?? campeoes[indice].descricao,
    imagem: imagem ?? campeoes[indice].imagem,
  };

  salvarCampeoes(campeoes);

  res.status(200).json({
    mensagem: "Campeão atualizado com sucesso.",
    campeao: campeoes[indice],
  });
});

// DELETE /api/campeoes/:id -> remove um campeão (protegido)
router.delete("/:id", verificarToken, (req, res) => {
  const campeoes = lerCampeoes();
  const indice = campeoes.findIndex((c) => c.id === Number(req.params.id));

  if (indice === -1) {
    return res.status(404).json({ erro: "Campeão não encontrado." });
  }

  const campeaoRemovido = campeoes.splice(indice, 1)[0];
  salvarCampeoes(campeoes);

  res.status(200).json({
    mensagem: "Campeão removido com sucesso.",
    campeao: campeaoRemovido,
  });
});

module.exports = router;
