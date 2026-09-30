// middlewares/auth.js
// Middleware responsável por proteger os endpoints.
// Ele verifica se o token JWT foi enviado no cabeçalho da requisição
// e se esse token é válido. Se não for, a requisição é bloqueada.

const jwt = require("jsonwebtoken");
require("dotenv").config();

function verificarToken(req, res, next) {
  // O token deve vir no header assim: Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      erro: "Token não informado. Faça login em /api/login para obter um token.",
    });
  }

  const partes = authHeader.split(" ");

  // Esperamos algo como ["Bearer", "token..."]
  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({ erro: "Token em formato inválido." });
  }

  const token = partes[1];

  jwt.verify(token, process.env.JWT_SECRET, (erro, dadosToken) => {
    if (erro) {
      // Token expirado ou adulterado
      return res.status(403).json({ erro: "Token inválido ou expirado." });
    }

    // Guarda os dados do token na requisição, caso alguma rota precise usar
    req.usuario = dadosToken;
    next(); // libera o acesso para a rota
  });
}

module.exports = verificarToken;
