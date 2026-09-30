// routes/auth.js
// Rota simples de login usada apenas para gerar o token JWT.
// Não é um sistema de cadastro/gerenciamento de usuários, é somente
// a porta de entrada para conseguir acessar os endpoints protegidos.

const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();

router.post("/login", (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ erro: "Informe usuário e senha." });
  }

  // Comparação simples com o usuário/senha fixos do .env
  if (usuario !== process.env.ADMIN_USER || senha !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ erro: "Usuário ou senha incorretos." });
  }

  // Gera o token, válido por 1 hora
  const token = jwt.sign({ usuario }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return res.status(200).json({
    mensagem: "Login realizado com sucesso.",
    token,
  });
});

module.exports = router;
