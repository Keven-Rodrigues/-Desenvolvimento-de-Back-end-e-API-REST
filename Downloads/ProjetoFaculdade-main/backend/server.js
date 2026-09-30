// server.js
// Arquivo principal: cria o servidor Express e liga as rotas.

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const rotasAuth = require("./routes/auth");
const rotasCampeoes = require("./routes/campeoes");

const app = express();

app.use(cors());
app.use(express.json()); // permite receber JSON no corpo das requisições

// Rota inicial só para confirmar que a API está no ar
app.get("/", (req, res) => {
  res.status(200).json({ mensagem: "API de Campeões no ar!" });
});

app.use("/api", rotasAuth);
app.use("/api/campeoes", rotasCampeoes);

// Rota "coringa" para quando o endpoint não existe
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
