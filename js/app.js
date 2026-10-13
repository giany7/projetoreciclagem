// Lógica da Aplicação Recicla Consciente
document.addEventListener("DOMContentLoaded", () => {
  // Inicialização de Estado e Armazenamento Local
  initStorage();
  initStudentConfig();
  renderMateriais("todos");
  renderPontosColeta("todos");
  initQuiz();
  initFormAvaliacao();
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
  if (!localStorage.getItem("recicla_avaliacoes")) {
    localStorage.setItem("recicla_avaliacoes", JSON.stringify([]));
  }
}

// Configurações do Aluno / Projeto
function initStudentConfig() {
  const defaultInfo = {
    aluno: "Ingrid",
    curso: "Graduação / Ensino Superior",
    instituicao: "Universidade / Faculdade",
    orientador: "Prof. Orientador(a)"
  };

  const saved = JSON.parse(localStorage.getItem("recicla_student_info") || "null") || defaultInfo;
  applyStudentInfo(saved);

  // Eventos do modal
  const modal = document.getElementById("configModal");
  const openBtn = document.getElementById("btnOpenConfig");
  const closeBtn = document.getElementById("btnCloseConfig");
  const saveBtn = document.getElementById("btnSaveConfig");

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => {
      document.getElementById("inputNomeAluno").value = saved.aluno || "";
      document.getElementById("inputCurso").value = saved.curso || "";
      document.getElementById("inputInstituicao").value = saved.instituicao || "";
      document.getElementById("inputOrientador").value = saved.orientador || "";
      modal.classList.add("active");
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => modal.classList.remove("active"));
  }

  if (saveBtn && modal) {
    saveBtn.addEventListener("click", () => {
      const newInfo = {
        aluno: document.getElementById("inputNomeAluno").value.trim() || "Estudante",
        curso: document.getElementById("inputCurso").value.trim() || "Graduação",
        instituicao: document.getElementById("inputInstituicao").value.trim() || "Instituição de Ensino",
        orientador: document.getElementById("inputOrientador").value.trim() || "Orientação Docente"
      };
      localStorage.setItem("recicla_student_info", JSON.stringify(newInfo));
      applyStudentInfo(newInfo);
      modal.classList.remove("active");
      alert("Dados do projeto atualizados com sucesso!");
    });
  }
}

function applyStudentInfo(info) {
  const elAluno = document.getElementById("displayAluno");
  const elCurso = document.getElementById("displayCurso");
  const elInst = document.getElementById("displayInstituicao");
  const elOrientador = document.getElementById("displayOrientador");

  if (elAluno) elAluno.textContent = info.aluno;
  if (elCurso) elCurso.textContent = info.curso;
  if (elInst) elInst.textContent = info.instituicao;
  if (elOrientador) elOrientador.textContent = info.orientador;
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
// 3. PONTOS DE DESCARTE (ECOPONTOS)
// ==========================================
function renderPontosColeta(categoria = "todos") {
  const container = document.getElementById("pontosContainer");
  if (!container) return;

  container.innerHTML = "";

  const filtrados = RECICLA_DATA.locaisColetaPadrao.filter(ponto => {
    if (categoria === "todos") return true;
    return ponto.materiais.includes(categoria);
  });

  filtrados.forEach(ponto => {
    const card = document.createElement("div");
    card.className = "ponto-card";

    const tagsHtml = ponto.materiais.map(m => `<span class="tag-mat">${m.toUpperCase()}</span>`).join(" ");

    card.innerHTML = `
      <div>
        <div class="ponto-header">
          <span class="ponto-tipo">${escapeHtml(ponto.tipo)}</span>
          <h3 class="ponto-nome">${escapeHtml(ponto.nome)}</h3>
        </div>
        <ul class="ponto-info">
          <li><span class="icon">📍</span> <span>${escapeHtml(ponto.endereco)}</span></li>
          <li><span class="icon">🕒</span> <span>${escapeHtml(ponto.horario)}</span></li>
          <li><span class="icon">📞</span> <span>${escapeHtml(ponto.telefone)}</span></li>
          <li><span class="icon">ℹ️</span> <span>${escapeHtml(ponto.observacao)}</span></li>
        </ul>
        <div class="ponto-tags">
          ${tagsHtml}
        </div>
      </div>
      <div>
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ponto.endereco + ' ' + ponto.nome)}" 
           target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="width: 100%; font-size: 0.875rem;">
          🗺️ Abrir Rota no Google Maps
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}

const pontoFilterBtns = document.querySelectorAll(".ponto-filter-btn");
pontoFilterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    pontoFilterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderPontosColeta(btn.dataset.category);
  });
});

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
// 5. QUESTIONÁRIO DE AVALIAÇÃO COMUNITÁRIA
// ==========================================
function initFormAvaliacao() {
  const form = document.getElementById("formAvaliacaoImpacto");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const avaliacao = {
      id: "resp-" + Date.now(),
      data: new Date().toISOString(),
      faixaEtaria: formData.get("faixaEtaria"),
      separavaAntes: formData.get("separavaAntes"),
      clarezaSite: formData.get("clarezaSite"),
      intencaoSeparar: formData.get("intencaoSeparar"),
      comentario: (formData.get("comentario") || "").trim()
    };

    const existentes = JSON.parse(localStorage.getItem("recicla_avaliacoes") || "[]");
    existentes.push(avaliacao);
    localStorage.setItem("recicla_avaliacoes", JSON.stringify(existentes));

    form.reset();
    showFormSuccess();
    updateMetricsDashboard();
  });
}

function showFormSuccess() {
  const el = document.getElementById("formSuccessMsg");
  if (el) {
    el.style.display = "block";
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      el.style.display = "none";
    }, 8000);
  }
}

// ==========================================
// 6. DASHBOARD DE MÉTRICAS & EXPORTAÇÃO
// ==========================================
function updateMetricsDashboard() {
  const visits = parseInt(localStorage.getItem("recicla_visits") || "1", 10);
  const quizAntes = JSON.parse(localStorage.getItem("recicla_quiz_antes") || "[]");
  const quizDepois = JSON.parse(localStorage.getItem("recicla_quiz_depois") || "[]");
  const avaliacoes = JSON.parse(localStorage.getItem("recicla_avaliacoes") || "[]");

  const totalQuizzes = quizAntes.length + quizDepois.length;

  // Médias
  const mediaAntes = quizAntes.length 
    ? Math.round(quizAntes.reduce((acc, cur) => acc + cur.percentual, 0) / quizAntes.length) 
    : 0;

  const mediaDepois = quizDepois.length 
    ? Math.round(quizDepois.reduce((acc, cur) => acc + cur.percentual, 0) / quizDepois.length) 
    : 0;

  // Satisfação (Excelente + Bom)
  let positivas = 0;
  let pretendemMudar = 0;
  avaliacoes.forEach(a => {
    if (a.clarezaSite === "excelente" || a.clarezaSite === "bom") positivas++;
    if (a.intencaoSeparar === "sim_total" || a.intencaoSeparar === "provavelmente") pretendemMudar++;
  });

  const satPercent = avaliacoes.length ? Math.round((positivas / avaliacoes.length) * 100) : 0;
  const mudancaPercent = avaliacoes.length ? Math.round((pretendemMudar / avaliacoes.length) * 100) : 0;

  // Atualiza DOM
  setTextSafe("dashVisitas", visits);
  setTextSafe("dashTotalAvaliacoes", avaliacoes.length);
  setTextSafe("dashTotalQuizzes", totalQuizzes);
  setTextSafe("dashSatisfacao", `${satPercent}%`);

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

  setTextSafe("dashIntencaoMudar", `${mudancaPercent}%`);
}

function setTextSafe(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// Botão para Popular Dados de Demonstração (Mock para Apresentação Acadêmica)
const btnMockData = document.getElementById("btnMockData");
if (btnMockData) {
  btnMockData.addEventListener("click", () => {
    if (!confirm("Deseja carregar 35 respostas simuladas de uma turma de extensão universitária para visualizar os gráficos completos?")) return;

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

    const mockAvaliacoes = [
      { id: "1", faixaEtaria: "18-25", separavaAntes: "as_vezes", clarezaSite: "excelente", intencaoSeparar: "sim_total", comentario: "Muito esclarecedor sobre caixa de pizza e vidro quebrado." },
      { id: "2", faixaEtaria: "26-40", separavaAntes: "nao", clarezaSite: "excelente", intencaoSeparar: "sim_total", comentario: "Não sabia que o óleo contamina tanto. Agora vou guardar na garrafa PET." },
      { id: "3", faixaEtaria: "18-25", separavaAntes: "sim", clarezaSite: "bom", intencaoSeparar: "sim_total", comentario: "Excelente iniciativa para a nossa comunidade!" },
      { id: "4", faixaEtaria: "41-60", separavaAntes: "nao", clarezaSite: "bom", intencaoSeparar: "provavelmente", comentario: "Gostei da lista dos pontos de coleta da nossa cidade." },
      { id: "5", faixaEtaria: "mais_60", separavaAntes: "as_vezes", clarezaSite: "excelente", intencaoSeparar: "sim_total", comentario: "Muito fácil de navegar no celular." }
    ];
    for (let i = 6; i <= 32; i++) {
      mockAvaliacoes.push({
        id: i.toString(),
        faixaEtaria: ["ate_18", "18-25", "26-40", "41-60"][Math.floor(Math.random() * 4)],
        separavaAntes: ["sim", "nao", "as_vezes"][Math.floor(Math.random() * 3)],
        clarezaSite: ["excelente", "excelente", "bom", "regular"][Math.floor(Math.random() * 4)],
        intencaoSeparar: ["sim_total", "sim_total", "provavelmente"][Math.floor(Math.random() * 3)],
        comentario: "Participação comunitária no projeto de extensão universitária."
      });
    }
    localStorage.setItem("recicla_avaliacoes", JSON.stringify(mockAvaliacoes));

    updateMetricsDashboard();
    renderQuizComparativo();
    alert("Dados de demonstração carregados com sucesso! O painel de métricas agora reflete uma ação de extensão com 30+ participantes.");
  });
}

// Botão para Resetar Dados
const btnResetData = document.getElementById("btnResetData");
if (btnResetData) {
  btnResetData.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja zerar os dados coletados de testes e avaliações?")) {
      localStorage.setItem("recicla_visits", "1");
      localStorage.setItem("recicla_quiz_antes", "[]");
      localStorage.setItem("recicla_quiz_depois", "[]");
      localStorage.setItem("recicla_avaliacoes", "[]");
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
  const avaliacoes = JSON.parse(localStorage.getItem("recicla_avaliacoes") || "[]");
  const quizAntes = JSON.parse(localStorage.getItem("recicla_quiz_antes") || "[]");
  const quizDepois = JSON.parse(localStorage.getItem("recicla_quiz_depois") || "[]");
  const studentInfo = JSON.parse(localStorage.getItem("recicla_student_info") || "{}");

  if (avaliacoes.length === 0 && quizAntes.length === 0 && quizDepois.length === 0) {
    alert("Não há dados coletados para exportar ainda. Responda ao quiz ou questionário, ou carregue dados de demonstração.");
    return;
  }

  let csvContent = "\uFEFF"; // BOM para acentos no Excel em português
  csvContent += "RELATORIO DE METRICAS - PROJETO DE EXTENSAO RECICLA CONSCIENTE\n";
  csvContent += `Aluno(a):;${studentInfo.aluno || "Ingrid"};Curso:;${studentInfo.curso || ""}\n`;
  csvContent += `Instituicao:;${studentInfo.instituicao || ""};Orientador(a):;${studentInfo.orientador || ""}\n`;
  csvContent += `Data de Exportacao:;${new Date().toLocaleDateString('pt-BR')}\n\n`;

  csvContent += "=== RESUMO DAS METRICAS ===\n";
  csvContent += `Total de Visitantes Unicos (Acessos):;${localStorage.getItem("recicla_visits") || 1}\n`;
  csvContent += `Total de Formularios de Avaliacao:;${avaliacoes.length}\n`;
  csvContent += `Testes no Quiz - Antes:;${quizAntes.length}\n`;
  csvContent += `Testes no Quiz - Depois:;${quizDepois.length}\n\n`;

  csvContent += "=== RESPOSTAS DO QUESTIONARIO DE IMPACTO ===\n";
  csvContent += "ID;Data;Faixa Etaria;Separava Residuos Antes?;Avaliacao do Site;Intencao de Praticar Reciclagem;Comentarios\n";

  avaliacoes.forEach(a => {
    const com = (a.comentario || "").replace(/;/g, " ").replace(/\n/g, " ");
    csvContent += `${a.id};${a.data};${a.faixaEtaria};${a.separavaAntes};${a.clarezaSite};${a.intencaoSeparar};"${com}"\n`;
  });

  csvContent += "\n=== RESULTADOS DO QUIZ (APRENDIZAGEM) ===\n";
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
  link.setAttribute("download", `Relatorio_Extensao_ReciclaConsciente_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================
// 7. EVENTOS GERAIS DE NAVEGAÇÃO E UX
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
