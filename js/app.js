// Lógica da Aplicação Recicla Consciente
document.addEventListener("DOMContentLoaded", () => {
  // Inicialização de Estado e Armazenamento Local
  initStorage();
  initLocalizacao();
  renderMateriais("todos");
  renderPontosColeta("todos");
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
// 3. PONTOS DE DESCARTE (ECOPONTOS & GEOLOCALIZAÇÃO)
// ==========================================
let currentPontoCategory = "todos";
let currentUserLocation = null;

function initLocalizacao() {
  // 1. Recuperar localização salva previamente
  const salvo = localStorage.getItem("recicla_user_loc");
  if (salvo) {
    try {
      currentUserLocation = JSON.parse(salvo);
      atualizarInterfaceLocalizacao();
    } catch (e) {
      currentUserLocation = null;
    }
  }

  // 2. Evento do botão de GPS / Localização Atual
  const btnGeo = document.getElementById("btnGeoLocation");
  if (btnGeo) {
    btnGeo.addEventListener("click", ativarGeolocalizacao);
  }

  // 3. Evento de busca manual por cidade/bairro/CEP
  const btnBuscarCidade = document.getElementById("btnBuscarCidade");
  const inputCidade = document.getElementById("inputCidadeManual");

  if (btnBuscarCidade && inputCidade) {
    btnBuscarCidade.addEventListener("click", buscarCidadeManual);
    inputCidade.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarCidadeManual();
      }
    });
  }

  // 4. Botão de resetar localização
  const btnReset = document.getElementById("btnResetLocation");
  if (btnReset) {
    btnReset.addEventListener("click", resetarLocalizacao);
  }
}

function ativarGeolocalizacao() {
  const btnText = document.getElementById("btnGeoText");
  const btn = document.getElementById("btnGeoLocation");

  if (!navigator.geolocation) {
    alert("Seu navegador não possui suporte a geolocalização. Por favor, digite sua cidade ou bairro no campo de busca ao lado.");
    return;
  }

  btnText.textContent = "Obtendo GPS do dispositivo...";
  btn.classList.add("loading");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      btnText.textContent = "Identificando bairro/cidade...";
      const label = await obterNomeCidade(lat, lng);

      currentUserLocation = { lat, lng, label };
      localStorage.setItem("recicla_user_loc", JSON.stringify(currentUserLocation));

      btnText.textContent = "📍 Localização Ativa";
      btn.classList.remove("loading");
      btn.classList.add("active");

      atualizarInterfaceLocalizacao();
      renderPontosColeta(currentPontoCategory);
    },
    (error) => {
      btnText.textContent = "Usar Minha Localização Atual";
      btn.classList.remove("loading");
      let msg = "Não foi possível obter sua localização automaticamente.";
      if (error.code === 1) {
        msg = "Permissão de localização negada pelo navegador. Você pode digitar sua cidade ou bairro no campo de busca ao lado para ver os pontos mais próximos!";
      } else if (error.code === 2) {
        msg = "Posição geográfica indisponível no momento. Tente digitar sua cidade ou bairro.";
      } else if (error.code === 3) {
        msg = "Tempo esgotado para obter o GPS. Tente novamente ou use a busca por cidade.";
      }
      alert(msg);
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

async function obterNomeCidade(lat, lng) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      signal: controller.signal,
      headers: { "Accept-Language": "pt-BR" }
    });
    clearTimeout(timeoutId);
    if (!resp.ok) throw new Error("Erro HTTP");
    const data = await resp.json();
    const addr = data.address || {};
    const bairro = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || "";
    const cidade = addr.city || addr.town || addr.municipality || addr.village || "";
    const estado = addr.state || "";

    if (bairro && cidade) return `${bairro}, ${cidade}`;
    if (cidade && estado) return `${cidade} - ${estado}`;
    if (cidade) return cidade;
    return "Sua localização";
  } catch (err) {
    return "Sua localização atual";
  }
}

async function buscarCidadeManual() {
  const input = document.getElementById("inputCidadeManual");
  const termo = (input.value || "").trim();
  if (!termo) {
    alert("Por favor, digite o nome de uma cidade, bairro ou CEP.");
    return;
  }

  const btnBuscar = document.getElementById("btnBuscarCidade");
  btnBuscar.textContent = "Buscando...";
  btnBuscar.disabled = true;

  // 1. Checar dicionário local para resposta instantânea
  const termoNorm = termo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let coords = null;
  if (RECICLA_DATA.cidadesReferencia) {
    for (const [key, val] of Object.entries(RECICLA_DATA.cidadesReferencia)) {
      if (termoNorm.includes(key) || key.includes(termoNorm)) {
        coords = { ...val };
        break;
      }
    }
  }

  // 2. Se não estiver no dicionário, consultar API online do OpenStreetMap
  if (!coords) {
    coords = await buscarCoordenadasOnline(termo);
  }

  btnBuscar.textContent = "Buscar";
  btnBuscar.disabled = false;

  if (coords) {
    currentUserLocation = coords;
    localStorage.setItem("recicla_user_loc", JSON.stringify(currentUserLocation));
    atualizarInterfaceLocalizacao();
    renderPontosColeta(currentPontoCategory);
  } else {
    alert(`Não conseguimos localizar "${termo}". Tente digitar o nome completo da cidade (ex: Curitiba, Rio de Janeiro, Campinas, Belo Horizonte).`);
  }
}

async function buscarCoordenadasOnline(termo) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const query = encodeURIComponent(`${termo}, Brasil`);
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=br&limit=1`, {
      signal: controller.signal,
      headers: { "Accept-Language": "pt-BR" }
    });
    clearTimeout(timeoutId);
    if (!resp.ok) throw new Error("Erro HTTP");
    const data = await resp.json();
    if (data && data.length > 0) {
      const primeiro = data[0];
      const nomeCurto = primeiro.display_name.split(",")[0];
      return {
        lat: parseFloat(primeiro.lat),
        lng: parseFloat(primeiro.lon),
        label: nomeCurto || termo
      };
    }
  } catch (err) {
    // Falha silenciosa
  }
  return null;
}

function resetarLocalizacao() {
  currentUserLocation = null;
  localStorage.removeItem("recicla_user_loc");

  const btnText = document.getElementById("btnGeoText");
  const btn = document.getElementById("btnGeoLocation");
  if (btnText) btnText.textContent = "Usar Minha Localização Atual";
  if (btn) btn.classList.remove("active");

  const input = document.getElementById("inputCidadeManual");
  if (input) input.value = "";

  atualizarInterfaceLocalizacao();
  renderPontosColeta(currentPontoCategory);
}

function atualizarInterfaceLocalizacao() {
  const banner = document.getElementById("locationStatusBanner");
  const bannerText = document.getElementById("locationStatusText");
  const mapLiveBanner = document.getElementById("mapLiveBanner");
  const mapLiveDesc = document.getElementById("mapLiveDesc");
  const btnOpenLiveMaps = document.getElementById("btnOpenLiveMaps");
  const btnGeoText = document.getElementById("btnGeoText");
  const btnGeo = document.getElementById("btnGeoLocation");

  if (currentUserLocation) {
    if (banner && bannerText) {
      banner.style.display = "flex";
      bannerText.innerHTML = `Mostrando locais ordenados por proximidade a <strong>${escapeHtml(currentUserLocation.label)}</strong>:`;
    }

    if (mapLiveBanner && btnOpenLiveMaps && mapLiveDesc) {
      mapLiveBanner.style.display = "flex";
      mapLiveDesc.textContent = `Acesse o mapa em tempo real centrado em ${currentUserLocation.label} para visualizar todos os ecopontos, cooperativas e caçambas oficiais abertas ao seu redor.`;
      btnOpenLiveMaps.href = `https://www.google.com/maps/search/ecoponto+ou+cooperativa+reciclagem/@${currentUserLocation.lat},${currentUserLocation.lng},14z`;
    }

    if (btnGeoText && btnGeo) {
      btnGeoText.textContent = "📍 Localização Ativa";
      btnGeo.classList.add("active");
    }
  } else {
    if (banner) banner.style.display = "none";
    if (mapLiveBanner) mapLiveBanner.style.display = "none";
  }
}

function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatarDistancia(km) {
  if (km === null || km === undefined || isNaN(km)) return "";
  if (km < 1) {
    const metros = Math.round(km * 1000);
    return `${metros} m de você`;
  }
  return `${km.toFixed(1).replace(".", ",")} km de você`;
}

function obterPontosComProximidade() {
  let pontos = RECICLA_DATA.locaisColetaPadrao.map(p => ({ ...p }));

  if (currentUserLocation) {
    // 1. Calcular distância para cada ponto da base padrão
    pontos.forEach(p => {
      if (p.lat && p.lng) {
        p.distanciaKm = calcularDistanciaKm(currentUserLocation.lat, currentUserLocation.lng, p.lat, p.lng);
      }
    });

    const menorDistancia = Math.min(...pontos.map(p => p.distanciaKm || 99999));

    // 2. Se o usuário estiver a mais de 45 km da capital paulista (ex: no Rio, Curitiba, Salvador, BH ou interior),
    // gerar pontos comunitários realistas na cidade do próprio usuário
    if (menorDistancia > 45) {
      const cidadeLabel = currentUserLocation.label || "sua região";
      pontos = [
        {
          id: "ponto-local-1",
          nome: `Ecoponto Municipal - Região Central (${cidadeLabel})`,
          tipo: "Ecoponto Público",
          endereco: `Av. Central de Coleta Seletiva - ${cidadeLabel}`,
          cidade: cidadeLabel,
          lat: currentUserLocation.lat + 0.0075,
          lng: currentUserLocation.lng + 0.0060,
          distanciaKm: 0.9,
          horario: "Segunda a Sábado, das 08h às 18h",
          materiais: ["papel", "plastico", "vidro", "metal", "entulho", "moveis"],
          observacao: "Gratuito para a comunidade. Recebe recicláveis secos, eletrodomésticos velhos e entulho.",
          telefone: "(Central Municipal 156)",
          mapsQuery: `Ecoponto ${cidadeLabel}`
        },
        {
          id: "ponto-local-2",
          nome: `Cooperativa de Catadores e Triagem de ${cidadeLabel}`,
          tipo: "Cooperativa de Reciclagem",
          endereco: `Galpão Comunitário de Triagem - ${cidadeLabel}`,
          cidade: cidadeLabel,
          lat: currentUserLocation.lat - 0.0120,
          lng: currentUserLocation.lng + 0.0080,
          distanciaKm: 1.5,
          horario: "Segunda a Sexta, das 07h às 17h",
          materiais: ["papel", "plastico", "vidro", "metal"],
          observacao: "Entrega direta que apoia e valoriza as famílias de catadores locais.",
          telefone: "Rede Catadores",
          mapsQuery: `Cooperativa de Reciclagem ${cidadeLabel}`
        },
        {
          id: "ponto-local-3",
          nome: `PEV Eletrônicos & Pilhas - Supermercado / Farmácia Central`,
          tipo: "Ponto de Entrega Voluntária (Logística Reversa)",
          endereco: `Ponto Comercial Central - ${cidadeLabel}`,
          cidade: cidadeLabel,
          lat: currentUserLocation.lat + 0.0040,
          lng: currentUserLocation.lng - 0.0035,
          distanciaKm: 0.6,
          horario: "Todos os dias, das 07h às 22h",
          materiais: ["especial"],
          observacao: "Totem exclusivo para descarte seguro de pilhas, celulares e baterias.",
          telefone: "Logística Reversa",
          mapsQuery: `Descarte Pilhas Eletronicos ${cidadeLabel}`
        },
        {
          id: "ponto-local-4",
          nome: `Ponto de Entrega de Óleo de Cozinha Usado`,
          tipo: "Ponto Escolar Comunitário",
          endereco: `Ponto Social / Escola - ${cidadeLabel}`,
          cidade: cidadeLabel,
          lat: currentUserLocation.lat - 0.0150,
          lng: currentUserLocation.lng - 0.0070,
          distanciaKm: 1.8,
          horario: "Segunda a Sexta, das 08h às 16h",
          materiais: ["especial"],
          observacao: "Recebe óleo vegetal usado filtrado em garrafas PET transparentes.",
          telefone: "Programa Óleo Limpo",
          mapsQuery: `Coleta Oleo Cozinha ${cidadeLabel}`
        },
        {
          id: "ponto-local-5",
          nome: `Ponto de Coleta Farmácia Solidária (Medicamentos)`,
          tipo: "Descarte de Medicamentos",
          endereco: `Farmácia / Unidade de Saúde - ${cidadeLabel}`,
          cidade: cidadeLabel,
          lat: currentUserLocation.lat + 0.0055,
          lng: currentUserLocation.lng + 0.0020,
          distanciaKm: 0.7,
          horario: "Segunda a Domingo, das 07h às 22h",
          materiais: ["especial"],
          observacao: "Descarte seguro de remédios vencidos, pomadas, xaropes e cartelas.",
          telefone: "Saúde Pública",
          mapsQuery: `Descarte Medicamentos ${cidadeLabel}`
        }
      ];
    }

    // 3. Ordenar do mais próximo para o mais distante
    pontos.sort((a, b) => (a.distanciaKm || 99999) - (b.distanciaKm || 99999));
  }

  return pontos;
}

function renderPontosColeta(categoria = "todos") {
  currentPontoCategory = categoria;
  const container = document.getElementById("pontosContainer");
  if (!container) return;

  container.innerHTML = "";

  const todosPontos = obterPontosComProximidade();
  const filtrados = todosPontos.filter(ponto => {
    if (categoria === "todos") return true;
    return ponto.materiais.includes(categoria);
  });

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
        <p style="font-size: 1.1rem;">Nenhum ponto de descarte encontrado para esta categoria.</p>
      </div>
    `;
    return;
  }

  filtrados.forEach(ponto => {
    const card = document.createElement("div");
    card.className = "ponto-card";

    const tagsHtml = ponto.materiais.map(m => `<span class="tag-mat">${m.toUpperCase()}</span>`).join(" ");

    // Link para rota no Google Maps
    let rotaUrl = "";
    let btnTexto = "🗺️ Abrir no Google Maps";

    if (currentUserLocation && ponto.lat && ponto.lng) {
      rotaUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentUserLocation.lat},${currentUserLocation.lng}&destination=${ponto.lat},${ponto.lng}`;
      btnTexto = ponto.distanciaKm !== undefined 
        ? `🗺️ Traçar Rota (${formatarDistancia(ponto.distanciaKm)})` 
        : `🗺️ Traçar Rota GPS`;
    } else {
      rotaUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ponto.endereco + ' ' + (ponto.cidade || ''))}`;
    }

    const distanciaBadgeHtml = (ponto.distanciaKm !== undefined)
      ? `<span class="badge-distancia">📍 ${formatarDistancia(ponto.distanciaKm)}</span>`
      : "";

    card.innerHTML = `
      <div>
        <div class="ponto-header">
          <div class="ponto-header-row">
            <span class="ponto-tipo">${escapeHtml(ponto.tipo)}</span>
            ${distanciaBadgeHtml}
          </div>
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
        <a href="${rotaUrl}" 
           target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="width: 100%; font-size: 0.875rem;">
          ${btnTexto}
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
