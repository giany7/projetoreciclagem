// Lógica da Aplicação Recicla Consciente
document.addEventListener("DOMContentLoaded", () => {
  // Inicialização de Estado e Armazenamento Local
  initStorage();
  initBuscaCidade();
  renderMateriais("todos");
  initQuiz();
  updateMetricsDashboard();
  initNavEvents();
});

// ==========================================
// 1. GERENCIAMENTO DE ESTADO E STORAGE
// ==========================================
function initStorage() {
  if (!localStorage.getItem("recicla_visits")) {
    localStorage.setItem("recicla_visits", "1");
  } else {
    const visits = parseInt(localStorage.getItem("recicla_visits"), 10) + 1;
    localStorage.setItem("recicla_visits", visits.toString());
  }

  if (!localStorage.getItem("recicla_quiz_antes")) {
    localStorage.setItem("recicla_quiz_antes", JSON.stringify([]));
  }
  if (!localStorage.getItem("recicla_quiz_depois")) {
    localStorage.setItem("recicla_quiz_depois", JSON.stringify([]));
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

  // Gerar os cards dos canais oficiais para a cidade
  const canaisHtml = (RECICLA_DATA.canaisOficiais || []).map(canal => {
    let linkAcao = "#";
    let btnTexto = canal.btnTexto;

    if (canal.tipoAcao === "prefeitura") {
      linkAcao = `https://www.google.com/search?q=${encodeURIComponent('coleta seletiva prefeitura ' + cidade)}`;
      btnTexto = `Consultar Coleta em ${escapeHtml(cidade)} ↗`;
    } else if (canal.tipoAcao === "maps-cooperativas") {
      linkAcao = `https://www.google.com/maps/search/${encodeURIComponent('cooperativa de reciclagem em ' + cidade)}`;
      btnTexto = `Ver Cooperativas em ${escapeHtml(cidade)} no Mapa ↗`;
    } else if (canal.tipoAcao === "maps-oleo") {
      linkAcao = `https://www.google.com/maps/search/${encodeURIComponent('descarte de oleo de cozinha em ' + cidade)}`;
      btnTexto = `Ver Pontos de Óleo em ${escapeHtml(cidade)} ↗`;
    } else if (canal.linkUrl) {
      linkAcao = canal.linkUrl;
    }

    return `
      <div class="canal-card">
        <div>
          <div class="canal-top">
            <div class="canal-icon">${canal.icone}</div>
            <div class="canal-titulos">
              <span class="canal-badge ${canal.badgeClass}">${escapeHtml(canal.categoriaBadge)}</span>
              <h4>${escapeHtml(canal.titulo)}</h4>
            </div>
          </div>
          <div class="canal-body">
            <p>${escapeHtml(canal.descricao)}</p>
            <div class="canal-dica">
              <strong>💡 Orientação:</strong> ${escapeHtml(canal.dica)}
            </div>
          </div>
        </div>
        <div>
          <a href="${linkAcao}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary canal-btn">
            ${btnTexto}
          </a>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <!-- CABEÇALHO DA CIDADE SELECIONADA -->
    <div class="cidade-header-bar">
      <div>
        <span class="cidade-status-badge">📍 CIDADE SELECIONADA</span>
        <h3>Ecopontos e Canais de Descarte em ${escapeHtml(cidade)}</h3>
        <p>Canais oficiais regulamentados pela Política Nacional de Resíduos Sólidos (Lei nº 12.305/2010).</p>
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
          Acesse a busca em tempo real do Google Maps para explorar todos os ecopontos municipais, galpões de triagem de cooperativas e caçambas oficiais abertas em <strong>${escapeHtml(cidade)}</strong>, com fotos, telefones, horários de funcionamento e rotas pelo GPS.
        </p>
      </div>
      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-maps-large">
        Abrir Ecopontos de ${escapeHtml(cidade)} no Maps ↗
      </a>
    </div>

    <!-- GRID DE CANAIS OFICIAIS DINÂMICOS POR MATERIAL -->
    <div class="canais-grid">
      ${canaisHtml}
    </div>

    <!-- DICA DE CIDADANIA E ENGAJAMENTO -->
    <div class="pontos-notice">
      <strong>💡 Dica Comunitária para Moradores de ${escapeHtml(cidade)}:</strong> O descarte em ecopontos públicos municipais é 100% gratuito e protege os córregos e terrenos do município contra o descarte clandestino. Entregar os recicláveis secos limpos a cooperativas gera trabalho e renda digna para os catadores da sua cidade!
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
        A coleta seletiva e os ecopontos são organizados de forma autônoma por cada município brasileiro. Digite o nome da sua cidade no campo acima ou clique em uma das cidades sugeridas para abrir o mapa em tempo real e consultar os canais oficiais de descarte ecológico da sua região.
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

  // Salvar no LocalStorage
  salvarTentativaQuiz(quizMode, percent, userScore, total);
  updateMetricsDashboard();
  renderQuizComparativo();
}

function salvarTentativaQuiz(modo, percentual, acertos, total) {
  const key = modo === "antes" ? "recicla_quiz_antes" : "recicla_quiz_depois";
  const lista = JSON.parse(localStorage.getItem(key) || "[]");
  lista.push({
    data: new Date().toISOString(),
    percentual,
    acertos,
    total
  });
  localStorage.setItem(key, JSON.stringify(lista));
}

function renderQuizComparativo() {
  const elComp = document.getElementById("quizComparativoView");
  if (!elComp) return;

  const antes = JSON.parse(localStorage.getItem("recicla_quiz_antes") || "[]");
  const depois = JSON.parse(localStorage.getItem("recicla_quiz_depois") || "[]");

  if (antes.length > 0 && depois.length > 0) {
    const mediaAntes = Math.round(antes.reduce((acc, c) => acc + c.percentual, 0) / antes.length);
    const mediaDepois = Math.round(depois.reduce((acc, c) => acc + c.percentual, 0) / depois.length);
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
function updateMetricsDashboard() {
  const visits = parseInt(localStorage.getItem("recicla_visits") || "1", 10);
  const quizAntes = JSON.parse(localStorage.getItem("recicla_quiz_antes") || "[]");
  const quizDepois = JSON.parse(localStorage.getItem("recicla_quiz_depois") || "[]");

  const totalQuizzes = quizAntes.length + quizDepois.length;

  // Médias
  const mediaAntes = quizAntes.length 
    ? Math.round(quizAntes.reduce((acc, cur) => acc + cur.percentual, 0) / quizAntes.length) 
    : 0;

  const mediaDepois = quizDepois.length 
    ? Math.round(quizDepois.reduce((acc, cur) => acc + cur.percentual, 0) / quizDepois.length) 
    : 0;

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
    elEvol.textContent = diffPts >= 0 ? `+${diffPts} p.p.` : `${diffPts} p.p.`;
    elEvol.style.color = diffPts >= 0 ? "#16a34a" : "#dc2626";
  }

  setTextSafe("dashMediaDepois", `${mediaDepois}%`);
}

function setTextSafe(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// Botão para Popular Dados de Demonstração (Mock para Apresentação Acadêmica)
const btnMockData = document.getElementById("btnMockData");
if (btnMockData) {
  btnMockData.addEventListener("click", () => {
    if (!confirm("Deseja carregar 30 testes simulados (antes e depois) para visualizar os gráficos e métricas completos?")) return;

    localStorage.setItem("recicla_visits", "148");

    const mockAntes = [];
    for (let i = 0; i < 30; i++) {
      // Notas entre 40% e 60%
      const nota = Math.floor(Math.random() * 25) + 40;
      mockAntes.push({ data: new Date().toISOString(), percentual: nota, acertos: Math.round(nota/10), total: 10 });
    }
    localStorage.setItem("recicla_quiz_antes", JSON.stringify(mockAntes));

    const mockDepois = [];
    for (let i = 0; i < 30; i++) {
      // Notas entre 75% e 95%
      const nota = Math.floor(Math.random() * 25) + 75;
      mockDepois.push({ data: new Date().toISOString(), percentual: nota, acertos: Math.round(nota/10), total: 10 });
    }
    localStorage.setItem("recicla_quiz_depois", JSON.stringify(mockDepois));

    updateMetricsDashboard();
    renderQuizComparativo();
    alert("Dados de demonstração carregados com sucesso! O painel de métricas agora reflete as notas de 30 participantes no pré e pós-teste.");
  });
}

// Botão para Resetar Dados
const btnResetData = document.getElementById("btnResetData");
if (btnResetData) {
  btnResetData.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja zerar os dados de testes e métricas?")) {
      localStorage.setItem("recicla_visits", "1");
      localStorage.setItem("recicla_quiz_antes", "[]");
      localStorage.setItem("recicla_quiz_depois", "[]");
      updateMetricsDashboard();
      renderQuizComparativo();
      alert("Dados zerados.");
    }
  });
}

// Botão para Exportar Relatório em CSV (para anexar ao relatório acadêmico)
const btnExportCSV = document.getElementById("btnExportCSV");
if (btnExportCSV) {
  btnExportCSV.addEventListener("click", () => {
    exportToCSV();
  });
}

function exportToCSV() {
  const quizAntes = JSON.parse(localStorage.getItem("recicla_quiz_antes") || "[]");
  const quizDepois = JSON.parse(localStorage.getItem("recicla_quiz_depois") || "[]");

  if (quizAntes.length === 0 && quizDepois.length === 0) {
    alert("Não há dados de testes para exportar ainda. Responda ao quiz ou carregue dados de demonstração.");
    return;
  }

  let csvContent = "\uFEFF"; // BOM para acentos no Excel em português
  csvContent += "RELATORIO DE METRICAS - PROJETO RECICLA CONSCIENTE\n";
  csvContent += `Data de Exportacao:;${new Date().toLocaleDateString('pt-BR')}\n\n`;

  csvContent += "=== RESUMO DAS METRICAS ===\n";
  csvContent += `Total de Visitantes Unicos (Acessos):;${localStorage.getItem("recicla_visits") || 1}\n`;
  csvContent += `Total de Quizzes Concluidos:;${quizAntes.length + quizDepois.length}\n`;
  csvContent += `Testes no Quiz - Antes (Diagnostico):;${quizAntes.length}\n`;
  csvContent += `Testes no Quiz - Depois (Pos-Uso):;${quizDepois.length}\n\n`;

  csvContent += "=== RESULTADOS DO QUIZ (APRENDIZAGEM) ===\n";
  csvContent += "Etapa;Data;Acertos;Total;Aproveitamento (%)\n";
  quizAntes.forEach(q => {
    csvContent += `Antes (Diagnostico);${q.data};${q.acertos};${q.total};${q.percentual}%\n`;
  });
  quizDepois.forEach(q => {
    csvContent += `Depois (Pos-uso);${q.data};${q.acertos};${q.total};${q.percentual}%\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Resultados_Quiz_ReciclaConsciente_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
