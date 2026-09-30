// assets/js/campeoes.js
// Front-end da página de Campeões: consome a API REST feita em /backend.
// GET é público. POST/PUT/DELETE pedem login (token JWT).

const API_BASE = "http://localhost:3000/api";

// Guarda o token em memória + sessionStorage (some ao fechar a aba).
let tokenAdmin = sessionStorage.getItem("tokenAdmin") || null;

// Guarda a lista de campeões já carregada, pra poder filtrar sem
// precisar buscar tudo de novo na API a cada clique.
let todosCampeoes = [];
let filtroAtual = "todos";

// --------- Elementos da página ---------
const grade = document.getElementById("grade-campeoes");
const filtrosContainer = document.getElementById("filtros");
const bolinhaStatus = document.getElementById("bolinha-status");
const textoStatus = document.getElementById("texto-status");

const btnAbrirLogin = document.getElementById("btn-abrir-login");
const painelLogado = document.getElementById("painel-logado");
const btnNovoCampeao = document.getElementById("btn-novo-campeao");
const btnLogout = document.getElementById("btn-logout");

const modalLogin = document.getElementById("modal-login");
const formLogin = document.getElementById("form-login");
const erroLogin = document.getElementById("erro-login");

const modalCampeao = document.getElementById("modal-campeao");
const formCampeao = document.getElementById("form-campeao");
const erroCampeao = document.getElementById("erro-campeao");
const tituloModalCampeao = document.getElementById("titulo-modal-campeao");

const areaToasts = document.getElementById("area-toasts");

// =====================================================
// INICIALIZAÇÃO
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  atualizarVisualDeLogin();
  carregarCampeoes();
});

// =====================================================
// BUSCAR CAMPEÕES NA API (GET - não precisa de token)
// =====================================================
async function carregarCampeoes() {
  mostrarEsqueletoDeCarregamento();

  try {
    const resposta = await fetch(`${API_BASE}/campeoes`);

    if (!resposta.ok) {
      throw new Error("A API respondeu com erro.");
    }

    todosCampeoes = await resposta.json();

    definirStatusApi(true);
    montarFiltros(todosCampeoes);
    renderizarCampeoes(todosCampeoes);
  } catch (erro) {
    definirStatusApi(false);
    grade.innerHTML = `
      <div class="mensagem-vazia">
        Não foi possível conectar à API em <code>${API_BASE}</code>.<br>
        Verifique se o back-end está rodando (<code>npm start</code> na pasta backend).
      </div>`;
  }
}

function definirStatusApi(online) {
  if (online) {
    bolinhaStatus.classList.add("online");
    textoStatus.textContent = "API conectada";
  } else {
    bolinhaStatus.classList.remove("online");
    textoStatus.textContent = "API offline";
  }
}

// =====================================================
// RENDERIZAÇÃO DOS CARDS (com animação de entrada em cascata)
// =====================================================
function renderizarCampeoes(lista) {
  const listaFiltrada =
    filtroAtual === "todos"
      ? lista
      : lista.filter((c) => c.funcao === filtroAtual);

  if (listaFiltrada.length === 0) {
    grade.innerHTML = `<div class="mensagem-vazia">Nenhum campeão encontrado.</div>`;
    return;
  }

  grade.innerHTML = "";

  listaFiltrada.forEach((campeao, indice) => {
    const card = document.createElement("article");
    card.className = "card-campeao";
    // atraso crescente para cada card, criando o efeito de cascata
    card.style.animationDelay = `${indice * 70}ms`;

    const imagemSrc = campeao.imagem ? `imagens/${campeao.imagem}` : null;

    card.innerHTML = `
      ${
        imagemSrc
          ? `<img src="${imagemSrc}" alt="Campeão ${campeao.nome}" onerror="this.style.display='none'">`
          : ""
      }
      <div class="card-corpo">
        <div class="card-topo">
          <h2>${escaparHtml(campeao.nome)}</h2>
          <span class="etiqueta-funcao">${escaparHtml(campeao.funcao)}</span>
        </div>
        <p>${escaparHtml(campeao.descricao || "Sem descrição cadastrada.")}</p>
      </div>
      <div class="card-acoes-admin escondido" data-acoes>
        <button class="btn-icone" data-editar="${campeao.id}" title="Editar">✎ Editar</button>
        <button class="btn-icone btn-perigo" data-excluir="${campeao.id}" title="Excluir">🗑 Excluir</button>
      </div>
    `;

    grade.appendChild(card);
  });

  // se o admin já estiver logado, mostra os botões de ação em cada card
  if (tokenAdmin) {
    grade.querySelectorAll("[data-acoes]").forEach((el) => el.classList.remove("escondido"));
  }

  // liga os cliques de editar/excluir (delegação simples, um listener por botão)
  grade.querySelectorAll("[data-editar]").forEach((btn) => {
    btn.addEventListener("click", () => abrirModalEdicao(Number(btn.dataset.editar)));
  });
  grade.querySelectorAll("[data-excluir]").forEach((btn) => {
    btn.addEventListener("click", () => excluirCampeao(Number(btn.dataset.excluir)));
  });
}

function mostrarEsqueletoDeCarregamento() {
  grade.innerHTML = Array.from({ length: 4 })
    .map(() => `<div class="card-esqueleto"></div>`)
    .join("");
}

// =====================================================
// FILTROS POR FUNÇÃO (gerados a partir dos dados reais)
// =====================================================
function montarFiltros(lista) {
  const funcoes = ["todos", ...new Set(lista.map((c) => c.funcao))];

  filtrosContainer.innerHTML = funcoes
    .map(
      (funcao) => `
      <button
        class="chip-filtro ${funcao === filtroAtual ? "ativo" : ""}"
        data-filtro="${funcao}">
        ${funcao === "todos" ? "Todos" : escaparHtml(funcao)}
      </button>`
    )
    .join("");

  filtrosContainer.querySelectorAll("[data-filtro]").forEach((btn) => {
    btn.addEventListener("click", () => {
      filtroAtual = btn.dataset.filtro;
      filtrosContainer
        .querySelectorAll(".chip-filtro")
        .forEach((c) => c.classList.remove("ativo"));
      btn.classList.add("ativo");
      renderizarCampeoes(todosCampeoes);
    });
  });
}

// =====================================================
// LOGIN DO ADMIN
// =====================================================
btnAbrirLogin.addEventListener("click", () => abrirModal(modalLogin));

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  erroLogin.textContent = "";

  const usuario = document.getElementById("login-usuario").value.trim();
  const senha = document.getElementById("login-senha").value;

  try {
    const resposta = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      erroLogin.textContent = dados.erro || "Não foi possível entrar.";
      return;
    }

    tokenAdmin = dados.token;
    sessionStorage.setItem("tokenAdmin", tokenAdmin);

    fecharModal(modalLogin);
    formLogin.reset();
    atualizarVisualDeLogin();
    renderizarCampeoes(todosCampeoes);
    mostrarToast("Login realizado. Agora você pode editar os campeões.", "sucesso");
  } catch (erro) {
    erroLogin.textContent = "Erro de conexão com a API.";
  }
});

btnLogout.addEventListener("click", () => {
  tokenAdmin = null;
  sessionStorage.removeItem("tokenAdmin");
  atualizarVisualDeLogin();
  renderizarCampeoes(todosCampeoes);
  mostrarToast("Sessão encerrada.", "info");
});

function atualizarVisualDeLogin() {
  if (tokenAdmin) {
    painelLogado.classList.remove("escondido");
    btnAbrirLogin.classList.add("escondido");
  } else {
    painelLogado.classList.add("escondido");
    btnAbrirLogin.classList.remove("escondido");
  }
}

// =====================================================
// CRIAR / EDITAR CAMPEÃO (POST e PUT - precisam de token)
// =====================================================
btnNovoCampeao.addEventListener("click", () => abrirModalCriacao());

function abrirModalCriacao() {
  tituloModalCampeao.textContent = "Novo Campeão";
  formCampeao.reset();
  document.getElementById("campeao-id").value = "";
  erroCampeao.textContent = "";
  abrirModal(modalCampeao);
}

function abrirModalEdicao(id) {
  const campeao = todosCampeoes.find((c) => c.id === id);
  if (!campeao) return;

  tituloModalCampeao.textContent = `Editar ${campeao.nome}`;
  document.getElementById("campeao-id").value = campeao.id;
  document.getElementById("campeao-nome").value = campeao.nome;
  document.getElementById("campeao-funcao").value = campeao.funcao;
  document.getElementById("campeao-descricao").value = campeao.descricao || "";
  document.getElementById("campeao-imagem").value = campeao.imagem || "";
  erroCampeao.textContent = "";
  abrirModal(modalCampeao);
}

formCampeao.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  erroCampeao.textContent = "";

  const id = document.getElementById("campeao-id").value;
  const corpo = {
    nome: document.getElementById("campeao-nome").value.trim(),
    funcao: document.getElementById("campeao-funcao").value.trim(),
    descricao: document.getElementById("campeao-descricao").value.trim(),
    imagem: document.getElementById("campeao-imagem").value.trim(),
  };

  const ehEdicao = Boolean(id);
  const url = ehEdicao ? `${API_BASE}/campeoes/${id}` : `${API_BASE}/campeoes`;
  const metodo = ehEdicao ? "PUT" : "POST";

  try {
    const resposta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify(corpo),
    });

    const dados = await resposta.json();

    if (resposta.status === 401 || resposta.status === 403) {
      erroCampeao.textContent = "Sua sessão expirou. Faça login novamente.";
      tokenAdmin = null;
      sessionStorage.removeItem("tokenAdmin");
      atualizarVisualDeLogin();
      return;
    }

    if (!resposta.ok) {
      erroCampeao.textContent = dados.erro || "Não foi possível salvar.";
      return;
    }

    fecharModal(modalCampeao);
    mostrarToast(
      ehEdicao ? "Campeão atualizado com sucesso." : "Campeão criado com sucesso.",
      "sucesso"
    );
    await carregarCampeoes();
  } catch (erro) {
    erroCampeao.textContent = "Erro de conexão com a API.";
  }
});

// =====================================================
// EXCLUIR CAMPEÃO (DELETE - precisa de token)
// =====================================================
async function excluirCampeao(id) {
  const campeao = todosCampeoes.find((c) => c.id === id);
  if (!campeao) return;

  const confirmou = confirm(`Excluir "${campeao.nome}"? Essa ação não pode ser desfeita.`);
  if (!confirmou) return;

  try {
    const resposta = await fetch(`${API_BASE}/campeoes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarToast(dados.erro || "Não foi possível excluir.", "erro");
      return;
    }

    mostrarToast("Campeão removido.", "sucesso");
    await carregarCampeoes();
  } catch (erro) {
    mostrarToast("Erro de conexão com a API.", "erro");
  }
}

// =====================================================
// MODAIS (abrir/fechar com transição)
// =====================================================
function abrirModal(modal) {
  modal.classList.remove("escondido");
  requestAnimationFrame(() => modal.classList.add("visivel"));
}

function fecharModal(modal) {
  modal.classList.remove("visivel");
  setTimeout(() => modal.classList.add("escondido"), 200);
}

document.querySelectorAll("[data-fechar]").forEach((btn) => {
  btn.addEventListener("click", () => {
    fecharModal(document.getElementById(btn.dataset.fechar));
  });
});

// fecha o modal clicando fora da caixa
document.querySelectorAll(".overlay-modal").forEach((overlay) => {
  overlay.addEventListener("click", (evento) => {
    if (evento.target === overlay) fecharModal(overlay);
  });
});

// =====================================================
// TOASTS (notificações rápidas no canto da tela)
// =====================================================
function mostrarToast(mensagem, tipo = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensagem;
  areaToasts.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("visivel"));

  setTimeout(() => {
    toast.classList.remove("visivel");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// =====================================================
// util: evita que texto vindo da API quebre o HTML
// =====================================================
function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}
