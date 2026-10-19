// Lógica da Aplicação Recicla Consciente
document.addEventListener("DOMContentLoaded", () => {
  // Inicialização de Estado e Armazenamento Local
  initStorage().then(updateMetricsDashboard);
  initBuscaCidade();
  renderMateriais("todos");
  initQuiz();
  initNavEvents();
  window.setInterval(() => {
    if (document.visibilityState === "visible") updateMetricsDashboard();
  }, 60000);
});

// ==========================================
// 1. GERENCIAMENTO DE ESTADO E STORAGE
// ==========================================
// As métricas são cumulativas e compartilhadas entre todos os visitantes,
// armazenadas em contadores online (Abacus): visitas, quantidade de quizzes por etapa e a soma de
// acertos, codificada em bits (um contador por bit) para que cada quiz exija poucas requisições.
const METRICAS_API = "https://abacus.jasoncameron.dev";
const METRICAS_NS = "recicla-consciente-extensao";
const METRICAS_CACHE = "recicla_metricas_cache";

function totalQuestoes() {
  return RECICLA_DATA.quizPerguntas.length;
}

function totalBits() {
  return Math.ceil(Math.log2(totalQuestoes() + 1));
}

const esperar = ms => new Promise(res => setTimeout(res, ms));

// Repete a chamada se o serviço limitar a taxa de requisições (429)
async function requisitarContador(url, tentativas = 6) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(url);
      if (r.status !== 429) return r;
    } catch (e) {
      if (i === tentativas - 1) throw e;
    }
    await esperar(1200 * (i + 1));
  }
  throw new Error("Limite de requisições");
}

async function contadorGet(chave) {
  const r = await requisitarContador(`${METRICAS_API}/get/${METRICAS_NS}/${chave}`);
  if (r.status === 404) return 0;
  if (!r.ok) throw new Error(`Falha ${r.status}`);
  return (await r.json()).value || 0;
}

async function contadorHit(chave) {
  const r = await requisitarContador(`${METRICAS_API}/hit/${METRICAS_NS}/${chave}`);
  if (!r.ok) throw new Error(`Falha ao registrar métrica (${r.status})`);
  return r.json();
}

async function lerEtapa(etapa) {
  const bits = totalBits();
  const chaves = [`${etapa}_qtd`, `${etapa}_soma`];
  for (let b = 0; b < bits; b++) chaves.push(`${etapa}_b${b}`);
  const v = [];
  for (const chave of chaves) {
    v.push(await contadorGet(chave));
    await esperar(250);
  }
  const somaLegada = v[1];
  const somaNovos = v.slice(2).reduce((acc, c, b) => acc + c * 2 ** b, 0);
  const soma = somaLegada + somaNovos;
  return { qtd: v[0], soma };
}

let metricasEmAndamento = null;

function carregarMetricas() {
  // Evita requisições duplicadas quando várias partes da página pedem as métricas ao mesmo tempo
  if (!metricasEmAndamento) {
    metricasEmAndamento = buscarMetricas().finally(() => { metricasEmAndamento = null; });
  }
  return metricasEmAndamento;
}

async function buscarMetricas() {
  try {
    const visitas = await contadorGet("visitas");
    const antes = await lerEtapa("antes");
    const depois = await lerEtapa("depois");
    const m = { visitas, antes, depois };
    localStorage.setItem(METRICAS_CACHE, JSON.stringify(m));
    return m;
  } catch (e) {
    const cache = localStorage.getItem(METRICAS_CACHE);
    return cache ? JSON.parse(cache) : null;
  }
}

function resumoModo(dados) {
  const media = dados.qtd ? Math.round((dados.soma / (dados.qtd * totalQuestoes())) * 100) : 0;
  return { qtd: dados.qtd, media };
}

async function initStorage() {
  // Conta uma visita por sessão do navegador
  if (!sessionStorage.getItem("recicla_visita_contada")) {
    sessionStorage.setItem("recicla_visita_contada", "1");
    try {
      await contadorHit("visitas");
    } catch (error) {
      console.error("Falha ao registrar a visita:", error);
    }
  }
}

// ==========================================
// 2. GUIA DE MATERIAIS E BUSCA
// ==========================================
let currentCategory = "todos";
let currentSearchTerm = "";

function renderMateriais(categoria = "todos", search = "") {
  const container = document.getElementById("materialsContainer");
  if (!container) return;

  container.innerHTML = "";

  const filtrados = RECICLA_DATA.materiais.filter(item => {
    const matchCat = (categoria === "todos") || (item.categoria === categoria);
    const termo = search.toLowerCase().trim();
    const matchSearch = !termo || 
      item.nome.toLowerCase().includes(termo) ||
      item.comoPreparar.toLowerCase().includes(termo) ||
      item.atencao.toLowerCase().includes(termo);

    return matchCat && matchSearch;
  });

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
        <p style="font-size: 1.1rem;">Nenhum material encontrado para "<strong>${escapeHtml(search)}</strong>".</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Tente buscar por "papelão", "óleo", "remédio", "espelho" ou selecione outra categoria.</p>
      </div>
    `;
    return;
  }

  filtrados.forEach(item => {
    const card = document.createElement("div");
    card.className = "material-card";
    card.innerHTML = `
      <div class="card-top">
        <div class="card-icon-title">
          <div class="card-icon">${item.icone}</div>
          <div class="card-title">${escapeHtml(item.nome)}</div>
        </div>
        <span class="badge-recicla ${item.reciclavel ? 'badge-sim' : 'badge-nao'}">
          ${item.reciclavel ? 'RECICLÁVEL' : 'REJEITO / COMUM'}
        </span>
      </div>
      <div class="card-body">
        <div class="card-step">
          <strong>Como preparar para descarte:</strong>
          <p>${escapeHtml(item.comoPreparar)}</p>
        </div>
        <div class="card-alert">
          <strong>Atenção:</strong> ${escapeHtml(item.atencao)}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Filtros do Guia
const searchInput = document.getElementById("materialSearch");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearchTerm = e.target.value;
    renderMateriais(currentCategory, currentSearchTerm);
  });
}

const catButtons = document.querySelectorAll(".cat-btn");
catButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    catButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.category;
    renderMateriais(currentCategory, currentSearchTerm);
  });
});

// ==========================================
// 3. PONTOS DE DESCARTE POR CIDADE
// ==========================================
let cidadeAtual = null;

function initBuscaCidade() {
  const btnBuscarCidade = document.getElementById("btnBuscarCidade");
  const inputCidade = document.getElementById("inputCidadeManual");
  const chips = document.querySelectorAll(".chip-btn");

  // Evento de clique no botão buscar
  if (btnBuscarCidade && inputCidade) {
    btnBuscarCidade.addEventListener("click", () => {
      buscarCidade(inputCidade.value);
    });

    inputCidade.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarCidade(inputCidade.value);
      }
    });
  }

  // Eventos nos botões de atalho rápido de cidades
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const cidade = chip.dataset.cidade;
      if (inputCidade) inputCidade.value = cidade;
      buscarCidade(cidade);
    });
  });

  // Recuperar última cidade consultada ou exibir tela inicial
  const cidadeSalva = localStorage.getItem("recicla_cidade");
  if (cidadeSalva) {
    if (inputCidade) inputCidade.value = cidadeSalva;
    buscarCidade(cidadeSalva);
  } else {
    renderCidadeEmptyState();
  }
}

function buscarCidade(nomeCidade) {
  const input = document.getElementById("inputCidadeManual");
  const termo = (nomeCidade || (input ? input.value : "")).trim();

  if (!termo) {
    alert("Por favor, digite o nome de uma cidade (ex: Curitiba, Campinas, São Paulo, Salvador).");
    if (input) input.focus();
    return;
  }

  // Formatar primeira letra maiúscula para boa apresentação
  const cidadeFormatada = formatarNomeCidade(termo);
  cidadeAtual = cidadeFormatada;
  localStorage.setItem("recicla_cidade", cidadeFormatada);

  // Atualizar estado ativo dos chips de atalho
  const chips = document.querySelectorAll(".chip-btn");
  chips.forEach(chip => {
    if (chip.dataset.cidade.toLowerCase() === cidadeFormatada.toLowerCase()) {
      chip.classList.add("active");
    } else {
      chip.classList.remove("active");
    }
  });

  renderCidadeResultados(cidadeFormatada);
}

function formatarNomeCidade(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map(palavra => {
      if (["de", "da", "do", "das", "dos", "e"].includes(palavra.toLowerCase())) {
        return palavra.toLowerCase();
      }
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(" ");
}

function limparBuscaCidade() {
  cidadeAtual = null;
  localStorage.removeItem("recicla_cidade");

  const input = document.getElementById("inputCidadeManual");
  if (input) {
    input.value = "";
    input.focus();
  }

  const chips = document.querySelectorAll(".chip-btn");
  chips.forEach(chip => chip.classList.remove("active"));

  renderCidadeEmptyState();
}

function renderCidadeResultados(cidade) {
  const container = document.getElementById("cidadeResultadosContainer");
  if (!container) return;

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent('ecoponto ou cooperativa de reciclagem em ' + cidade)}`;

  container.innerHTML = `
    <!-- CABEÇALHO DA CIDADE SELECIONADA -->
    <div class="cidade-header-bar">
      <div>
        <span class="cidade-status-badge">📍 CIDADE SELECIONADA</span>
        <h3>Pontos de Reciclagem em ${escapeHtml(cidade)}</h3>
        <p>Acesse o mapa oficial do Google Maps com todos os ecopontos e cooperativas abertos na sua cidade.</p>
      </div>
      <button id="btnLimparCidade" class="btn btn-secondary" type="button" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
        ✏️ Trocar Cidade
      </button>
    </div>

    <!-- BANNER DE MAPA EM TEMPO REAL NO GOOGLE MAPS -->
    <div class="map-city-banner">
      <div class="map-city-content">
        <h4>🗺️ Mapa de Ecopontos e Cooperativas em ${escapeHtml(cidade)}</h4>
        <p>
          Abra a busca interativa no Google Maps para ver os ecopontos municipais, pontos de entrega voluntária e cooperativas de reciclagem em <strong>${escapeHtml(cidade)}</strong>, com rotas, endereços, horários de funcionamento e telefones atualizados em tempo real.
        </p>
      </div>
      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-maps-large">
        Abrir Mapa de ${escapeHtml(cidade)} no Google Maps ↗
      </a>
    </div>

    <!-- DICA DE CIDADANIA -->
    <div class="pontos-notice">
      <strong>💡 Dica Comunitária:</strong> No Google Maps você pode filtrar por locais abertos agora, conferir avaliações de outros moradores e traçar rotas a pé, de bicicleta ou de transporte público para entregar seus recicláveis com praticidade.
    </div>
  `;

  // Vincular evento de troca de cidade
  const btnLimpar = document.getElementById("btnLimparCidade");
  if (btnLimpar) {
    btnLimpar.addEventListener("click", limparBuscaCidade);
  }
}

function renderCidadeEmptyState() {
  const container = document.getElementById("cidadeResultadosContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="cidade-empty-state">
      <div class="empty-icon">🏙️</div>
      <h3>Onde descartar na sua cidade?</h3>
      <p>
        Digite o nome da sua cidade no campo acima ou clique em uma das cidades sugeridas para abrir o mapa em tempo real com todos os ecopontos e cooperativas da sua região.
      </p>
    </div>
  `;
}

// ==========================================
// 4. QUIZ EDUCATIVO COM ANTES & DEPOIS
// ==========================================
let quizMode = "antes"; // 'antes' ou 'depois'
let currentQuestionIndex = 0;
let userScore = 0;
let answeredQuestions = [];

function initQuiz() {
  const btnModoAntes = document.getElementById("btnModoAntes");
  const btnModoDepois = document.getElementById("btnModoDepois");

  if (btnModoAntes && btnModoDepois) {
    btnModoAntes.addEventListener("click", () => {
      setQuizMode("antes");
    });
    btnModoDepois.addEventListener("click", () => {
      setQuizMode("depois");
    });
  }

  const nextBtn = document.getElementById("btnQuizNext");
  if (nextBtn) {
    nextBtn.addEventListener("click", handleNextQuestion);
  }

  const restartBtn = document.getElementById("btnQuizRestart");
  if (restartBtn) {
    restartBtn.addEventListener("click", resetQuiz);
  }

  loadQuestion(0);
}

function setQuizMode(mode) {
  quizMode = mode;
  document.getElementById("btnModoAntes").classList.toggle("active", mode === "antes");
  document.getElementById("btnModoDepois").classList.toggle("active", mode === "depois");

  const modeBadge = document.getElementById("quizModeBadge");
  if (modeBadge) {
    modeBadge.textContent = mode === "antes" 
      ? "MODO: Diagnóstico Inicial (Antes de usar o site)" 
      : "MODO: Avaliação de Aprendizagem (Após usar o site)";
    modeBadge.style.color = mode === "antes" ? "#475569" : "#107c41";
  }

  resetQuiz();
}

function resetQuiz() {
  currentQuestionIndex = 0;
  userScore = 0;
  answeredQuestions = [];

  document.getElementById("quizActiveBox").style.display = "block";
  document.getElementById("quizResultBox").style.display = "none";
  loadQuestion(0);
}

function loadQuestion(index) {
  const questions = RECICLA_DATA.quizPerguntas;
  if (index >= questions.length) {
    showQuizResults();
    return;
  }

  const q = questions[index];
  document.getElementById("quizCounter").textContent = `Pergunta ${index + 1} de ${questions.length}`;
  document.getElementById("quizQuestionText").textContent = q.pergunta;

  // Barra de progresso
  const progressPercent = ((index) / questions.length) * 100;
  document.getElementById("quizProgressFill").style.width = `${progressPercent}%`;

  // Feedback invisível
  const feedbackEl = document.getElementById("quizFeedback");
  feedbackEl.className = "quiz-feedback";
  feedbackEl.innerHTML = "";

  const nextBtn = document.getElementById("btnQuizNext");
  nextBtn.style.display = "none";

  // Opções
  const optContainer = document.getElementById("quizOptionsContainer");
  optContainer.innerHTML = "";

  q.opcoes.forEach((opcao, optIndex) => {
    const btn = document.createElement("button");
    btn.className = "quiz-opt-btn";
    btn.textContent = opcao.texto;
    btn.addEventListener("click", () => selectOption(optIndex, q));
    optContainer.appendChild(btn);
  });
}

function selectOption(selectedIdx, question) {
  const buttons = document.querySelectorAll(".quiz-opt-btn");
  buttons.forEach(b => b.disabled = true);

  const selectedOption = question.opcoes[selectedIdx];
  const isCorrect = selectedOption.correta;

  if (isCorrect) {
    userScore++;
    buttons[selectedIdx].classList.add("correct");
  } else {
    buttons[selectedIdx].classList.add("incorrect");
    // Destaca a correta
    question.opcoes.forEach((op, idx) => {
      if (op.correta) buttons[idx].classList.add("correct");
    });
  }

  // Exibe explicação pedagógica
  const feedbackEl = document.getElementById("quizFeedback");
  feedbackEl.classList.add("show");
  if (isCorrect) {
    feedbackEl.classList.add("feedback-success");
    feedbackEl.innerHTML = `<strong>✨ Resposta Correta!</strong><p>${escapeHtml(question.explicacao)}</p>`;
  } else {
    feedbackEl.classList.add("feedback-wrong");
    feedbackEl.innerHTML = `<strong>❌ Resposta Incorreta!</strong><p>${escapeHtml(question.explicacao)}</p>`;
  }

  answeredQuestions.push({
    perguntaId: question.id,
    acertou: isCorrect
  });

  const nextBtn = document.getElementById("btnQuizNext");
  nextBtn.style.display = "inline-flex";
  nextBtn.textContent = (currentQuestionIndex + 1 === RECICLA_DATA.quizPerguntas.length) 
    ? "Ver Resultado Final" 
    : "Próxima Pergunta →";
}

function handleNextQuestion() {
  currentQuestionIndex++;
  loadQuestion(currentQuestionIndex);
}

function showQuizResults() {
  document.getElementById("quizActiveBox").style.display = "none";
  const resultBox = document.getElementById("quizResultBox");
  resultBox.style.display = "block";

  const total = RECICLA_DATA.quizPerguntas.length;
  const percent = Math.round((userScore / total) * 100);

  document.getElementById("quizScoreDisplay").textContent = `${percent}%`;
  document.getElementById("quizScoreFraction").textContent = `Você acertou ${userScore} de ${total} questões.`;

  let msg = "";
  if (percent >= 80) {
    msg = "Parabéns! Você tem um excelente conhecimento sobre separação de resíduos e impacto ecológico.";
  } else if (percent >= 50) {
    msg = "Bom desempenho! Você já conhece os pontos básicos, mas ainda pode aperfeiçoar alguns detalhes consultando o Guia de Materiais.";
  } else {
    msg = "Ainda há muitas dúvidas comuns! Não se preocupe: a maioria das pessoas erra pela falta de orientação das embalagens. Explore nosso guia para dominar o descarte correto.";
  }
  document.getElementById("quizResultMessage").textContent = msg;

  // Registrar no contador compartilhado
  salvarTentativaQuiz(quizMode, userScore);
}

async function salvarTentativaQuiz(modo, acertos) {
  const etapa = modo === "antes" ? "antes" : "depois";
  const hits = [`${etapa}_qtd`];
  for (let b = 0; b < totalBits(); b++) {
    if (acertos & (1 << b)) hits.push(`${etapa}_b${b}`);
  }
  try {
    for (const hit of hits) {
      await contadorHit(hit);
      await esperar(300);
    }
    await Promise.all([updateMetricsDashboard(), renderQuizComparativo()]);
  } catch (error) {
    const message = document.getElementById("quizResultMessage");
    if (message) {
      message.textContent += " Não foi possível sincronizar este resultado agora. Deixe a página aberta e tente atualizar as métricas em instantes.";
    }
    console.error("Falha ao sincronizar o resultado do quiz:", error);
  }
}

async function renderQuizComparativo() {
  const elComp = document.getElementById("quizComparativoView");
  if (!elComp) return;

  const m = await carregarMetricas();
  const antes = m ? resumoModo(m.antes) : { qtd: 0, media: 0 };
  const depois = m ? resumoModo(m.depois) : { qtd: 0, media: 0 };

  if (antes.qtd > 0 && depois.qtd > 0) {
    const mediaAntes = antes.media;
    const mediaDepois = depois.media;
    const diff = mediaDepois - mediaAntes;

    elComp.style.display = "block";
    elComp.innerHTML = `
      <h4 style="margin-bottom: 0.5rem; color: var(--primary-dark);">📊 Evidência de Aprendizagem Coletada (Métrica Acadêmica)</h4>
      <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">
        Comparativo entre os testes realizados no modo <strong>Diagnóstico Inicial (Antes)</strong> e <strong>Avaliação (Depois)</strong>:
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; text-align: center;">
        <div style="background: white; padding: 0.85rem; border-radius: 8px; border: 1px solid var(--border-color);">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Média 'Antes'</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #64748b;">${mediaAntes}%</div>
        </div>
        <div style="background: white; padding: 0.85rem; border-radius: 8px; border: 1px solid var(--border-color);">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Média 'Depois'</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">${mediaDepois}%</div>
        </div>
        <div style="background: white; padding: 0.85rem; border-radius: 8px; border: 1px solid var(--border-color);">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Evolução</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: ${diff >= 0 ? '#16a34a' : '#dc2626'};">
            ${diff >= 0 ? '+' + diff : diff}%
          </div>
        </div>
      </div>
    `;
  } else {
    elComp.style.display = "none";
  }
}

// ==========================================
// 5. DASHBOARD DE MÉTRICAS & EXPORTAÇÃO
// ==========================================
async function updateMetricsDashboard() {
  const m = await carregarMetricas();
  if (!m) {
    setTextSafe("dashEvolucaoPontos", "Indisponível");
    setTextSafe("dashEvolucaoDetalhe", "Não foi possível carregar os resultados compartilhados. Verifique a conexão e atualize a página.");
    return;
  }

  const visits = m.visitas;
  const antes = resumoModo(m.antes);
  const depois = resumoModo(m.depois);
  const quizAntes = { length: antes.qtd };
  const quizDepois = { length: depois.qtd };
  const totalQuizzes = antes.qtd + depois.qtd;
  const mediaAntes = antes.media;
  const mediaDepois = depois.media;

  // Atualiza DOM
  setTextSafe("dashVisitas", visits);
  setTextSafe("dashTotalQuizzes", totalQuizzes);
  setTextSafe("dashQuizzesAntes", quizAntes.length);
  setTextSafe("dashQuizzesDepois", quizDepois.length);

  // Barra de progresso comparativa
  const barAntes = document.getElementById("dashBarAntes");
  const barDepois = document.getElementById("dashBarDepois");
  const lblAntes = document.getElementById("dashValAntes");
  const lblDepois = document.getElementById("dashValDepois");

  if (barAntes && lblAntes) {
    barAntes.style.width = `${mediaAntes}%`;
    lblAntes.textContent = `${mediaAntes}% (${quizAntes.length} testes)`;
  }
  if (barDepois && lblDepois) {
    barDepois.style.width = `${mediaDepois}%`;
    lblDepois.textContent = `${mediaDepois}% (${quizDepois.length} testes)`;
  }

  // Evolução em pontos percentuais
  const diffPts = mediaDepois - mediaAntes;
  const elEvol = document.getElementById("dashEvolucaoPontos");
  if (elEvol) {
    const temComparacao = quizAntes.length > 0 && quizDepois.length > 0;
    elEvol.textContent = temComparacao
      ? (diffPts >= 0 ? `+${diffPts} p.p.` : `${diffPts} p.p.`)
      : "Aguardando as duas etapas";
    elEvol.style.color = !temComparacao ? "#64748b" : (diffPts >= 0 ? "#16a34a" : "#dc2626");
  }
  setTextSafe(
    "dashEvolucaoDetalhe",
    quizAntes.length > 0 && quizDepois.length > 0
      ? `Média coletiva: ${quizAntes.length} diagnósticos e ${quizDepois.length} avaliações`
      : "O ganho aparece após pelo menos um diagnóstico e uma avaliação final."
  );

  setTextSafe("dashMediaDepois", `${mediaDepois}%`);
}

function setTextSafe(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ==========================================
// 6. EVENTOS GERAIS DE NAVEGAÇÃO E UX
// ==========================================
function initNavEvents() {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
      });
    });
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
