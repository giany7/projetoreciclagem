// Base de dados do projeto Recicla Consciente
// Referência: Política Nacional de Resíduos Sólidos (Lei Federal nº 12.305/2010)

const RECICLA_DATA = {
  materiais: [
    // PAPEL
    {
      id: "papel-1",
      nome: "Caixa de Papelão e Cartolina",
      categoria: "papel",
      reciclavel: true,
      comoPreparar: "Desmonte para economizar espaço e mantenha seco. Não precisa tirar fitas em excesso, mas retire restos de alimentos.",
      atencao: "Se estiver molhado ou engordurado, deve ser descartado no lixo comum ou compostagem.",
      icone: "📦"
    },
    {
      id: "papel-2",
      nome: "Caixa de Pizza com Gordura",
      categoria: "papel",
      reciclavel: false,
      comoPreparar: "A tampa que estiver limpa pode ser reciclada. O fundo engordurado vai para o lixo comum (rejeito).",
      atencao: "A gordura impregna as fibras do papel e impede a reciclagem no processo industrial de polpação.",
      icone: "🍕"
    },
    {
      id: "papel-3",
      nome: "Folhas de Caderno, Sulfite e Impressos",
      categoria: "papel",
      reciclavel: true,
      comoPreparar: "Mantenha limpo e seco. Pode conter grampos comuns de grampeador (os ímãs da triagem separam).",
      atencao: "Papel carbono, papel térmico (extrato de banco e cupom fiscal) NÃO são recicláveis.",
      icone: "📄"
    },
    {
      id: "papel-4",
      nome: "Embalagem Longa Vida (Tetra Pak)",
      categoria: "papel",
      reciclavel: true,
      comoPreparar: "Enxágue com um pouco de água de reúso para retirar restos de leite/suco, amasse e tampe.",
      atencao: "É um material composto (cartão, plástico e alumínio), 100% reaproveitável em fábricas especializadas.",
      icone: "🧃"
    },
    {
      id: "papel-5",
      nome: "Papel Higiênico, Guardanapos Usados e Fitas Adesivas",
      categoria: "papel",
      reciclavel: false,
      comoPreparar: "Descarte diretamente no lixo comum (rejeito).",
      atencao: "Material contaminado biologicamente ou com resinas adesivas que inviabilizam a reciclagem.",
      icone: "🧻"
    },

    // PLÁSTICO
    {
      id: "plastico-1",
      nome: "Garrafas PET (Refrigerante, Água)",
      categoria: "plastico",
      reciclavel: true,
      comoPreparar: "Esvazie o líquido, enxágue rapidamente se houver açúcar, amasse e tampe (a tampinha também é reciclada).",
      atencao: "Um dos plásticos com maior valor de mercado para as cooperativas de catadores.",
      icone: "🧴"
    },
    {
      id: "plastico-2",
      nome: "Frascos de Shampoo, Detergente e Amaciante (PEAD)",
      categoria: "plastico",
      reciclavel: true,
      comoPreparar: "Escorra o conteúdo restante com um pingo de água para não atrair insetos.",
      atencao: "Plástico de alta densidade altamente valorizado na indústria de reciclagem.",
      icone: "🧼"
    },
    {
      id: "plastico-3",
      nome: "Sacolas de Mercado e Embalagens Plásticas Flexíveis",
      categoria: "plastico",
      reciclavel: true,
      comoPreparar: "Junte várias sacolas dentro de uma só para facilitar a triagem na esteira das cooperativas.",
      atencao: "Devem estar limpas e sem resíduos orgânicos.",
      icone: "🛍️"
    },
    {
      id: "plastico-4",
      nome: "Potes de Iogurte, Sorvete e Margarina (PP e PS)",
      categoria: "plastico",
      reciclavel: true,
      comoPreparar: "Passe água rápida para remover o excesso de laticínio/gordura.",
      atencao: "Evite deixar azedar na lixeira, pois causa mau cheiro e contamina outros materiais secos.",
      icone: "🍨"
    },
    {
      id: "plastico-5",
      nome: "Esponja de Lavar Louça Sintética",
      categoria: "plastico",
      reciclavel: false,
      comoPreparar: "Descarte no lixo comum, a menos que entregue em programas específicos de logística reversa (ex: TerraCycle).",
      atencao: "Composta de poliuretano e abrasivos difíceis de separar na reciclagem convencional.",
      icone: "🧽"
    },

    // VIDRO
    {
      id: "vidro-1",
      nome: "Garrafas de Bebidas e Molhos",
      categoria: "vidro",
      reciclavel: true,
      comoPreparar: "Retire o excesso do líquido e descarte seco. Tampas metálicas devem ser recicladas no metal.",
      atencao: "O vidro é 100% e infinitamente reciclável sem perda de qualidade.",
      icone: "🍾"
    },
    {
      id: "vidro-2",
      nome: "Potes de Conserva, Geléia e Alimentos",
      categoria: "vidro",
      reciclavel: true,
      comoPreparar: "Lave para retirar restos de comida.",
      atencao: "Tampas de metal podem ser separadas e também enviadas para a reciclagem.",
      icone: "🫙"
    },
    {
      id: "vidro-3",
      nome: "Vidro Quebrado (Copos, Frascos)",
      categoria: "vidro",
      reciclavel: true,
      comoPreparar: "ATENÇÃO DE SEGURANÇA: Coloque dentro de uma caixa de leite cortada, garrafa PET cortada ou embrulhe em jornal grosso e escreva 'VIDRO QUEBRADO' bem visível.",
      atencao: "Protege a integridade física dos coletores e catadores contra cortes graves e contaminação.",
      icone: "⚠️"
    },
    {
      id: "vidro-4",
      nome: "Espelhos, Cristais, Cerâmicas e Pirex",
      categoria: "vidro",
      reciclavel: false,
      comoPreparar: "Descarte no lixo comum bem embalado para não quebrar na mão do coletor.",
      atencao: "Têm ponto de fusão e composições químicas diferentes do vidro comum de embalagens (chumbo, boro).",
      icone: "🪞"
    },

    // METAL
    {
      id: "metal-1",
      nome: "Lata de Alumínio (Refrigerante, Cerveja, Suco)",
      categoria: "metal",
      reciclavel: true,
      comoPreparar: "Escorra o líquido e, se possível, amasse. Não retire o lacre da latinha.",
      atencao: "O Brasil é líder mundial na reciclagem de latinhas de alumínio (mais de 98% de reaproveitamento).",
      icone: "🥫"
    },
    {
      id: "metal-2",
      nome: "Latas de Aço (Milho, Ervilha, Leite em Pó, Sardinha)",
      categoria: "metal",
      reciclavel: true,
      comoPreparar: "Lave para remover restos de óleo ou molho. Se a tampa for serrilhada, dobre-a para dentro.",
      atencao: "Reciclável por siderúrgicas; ímãs industriais separam facilmente o aço nas centrais.",
      icone: "🍲"
    },
    {
      id: "metal-3",
      nome: "Folha de Alumínio Doméstica Limpa",
      categoria: "metal",
      reciclavel: true,
      comoPreparar: "Faça uma bolinha compacta com as sobras limpas.",
      atencao: "Se estiver muito impregnada com gordura carbonizada de assado, descarte no comum.",
      icone: "✨"
    },
    {
      id: "metal-4",
      nome: "Esponja de Aço (Bombril / Assolan)",
      categoria: "metal",
      reciclavel: false,
      comoPreparar: "Descarte no lixo comum.",
      atencao: "Fios finos oxidam muito rápido (enferrujam) e não têm valor comercial para reciclagem.",
      icone: "🍳"
    },

    // ESPECIAIS & ELETRÔNICOS
    {
      id: "especial-1",
      nome: "Pilhas, Baterias e Celulares Antigos",
      categoria: "especial",
      reciclavel: true,
      comoPreparar: "NUNCA descarte no lixo comum. Guarde em local seco e entregue em farmácias, supermercados ou ecopontos.",
      atencao: "Contêm metais pesados tóxicos (cádmio, chumbo, mercúrio) que contaminam o solo e os lençóis freáticos.",
      icone: "🔋"
    },
    {
      id: "especial-2",
      nome: "Óleo de Cozinha Usado",
      categoria: "especial",
      reciclavel: true,
      comoPreparar: "Espere esfriar, coe com um funil e armazene em garrafas PET limpas bem fechadas.",
      atencao: "NUNCA jogue na pia! 1 litro de óleo pode poluir até 25.000 litros de água. É transformado em sabão e biodiesel.",
      icone: "🛢️"
    },
    {
      id: "especial-3",
      nome: "Medicamentos Vencidos e Cartelas (Blísters)",
      categoria: "especial",
      reciclavel: true,
      comoPreparar: "Leve à farmácia ou posto de saúde com ponto de coleta de logística reversa.",
      atencao: "Não jogue no vaso nem na pia: contaminam a água tratada e os ecossistemas aquáticos.",
      icone: "💊"
    },
    {
      id: "especial-4",
      nome: "Lâmpadas Fluorescentes e LED",
      categoria: "especial",
      reciclavel: true,
      comoPreparar: "Leve de volta em lojas de materiais de construção ou eletrodomésticos que possuam PEV.",
      atencao: "Lâmpadas fluorescentes contêm vapor de mercúrio cancerígeno se quebradas.",
      icone: "💡"
    }
  ],

  quizPerguntas: [
    {
      id: 1,
      pergunta: "Uma caixa de pizza com o fundo cheio de gordura pode ir inteira para a lixeira de papel reciclável?",
      opcoes: [
        { texto: "Sim, qualquer tipo de papel pode ser reciclado.", correta: false },
        { texto: "Não. A parte engordurada deve ir para o lixo comum (rejeito), mas a tampa limpa pode ser reciclada.", correta: true },
        { texto: "Sim, desde que seja lavada com água e sabão antes.", correta: false },
        { texto: "Não, caixa de pizza é tóxica e precisa de descarte especial.", correta: false }
      ],
      explicacao: "A gordura impregna as fibras do papelão e não sai na água do processo de reciclagem. O correto é rasgar: a parte limpa vai para a reciclagem e a parte suja para o rejeito/compostagem."
    },
    {
      id: 2,
      pergunta: "O que deve ser feito com potes plásticos de alimentos (como margarina ou iogurte) antes do descarte?",
      opcoes: [
        { texto: "Devem ser lavados profundamente com bastante sabão e água sanitária.", correta: false },
        { texto: "Não se deve fazer nada, podem ir cheios de restos de comida.", correta: false },
        { texto: "Basta escorrer e passar um rápido enxágue com água de reúso para tirar o excesso.", correta: true },
        { texto: "Devem ser fervidos para eliminar bactérias antes de descartar.", correta: false }
      ],
      explicacao: "Não gaste água limpa potável! Basta uma rápida passada com água de reúso da louça ou guardanapo usado para remover o excesso grosseiro, evitando mau cheiro e insetos nas cooperativas."
    },
    {
      id: 3,
      pergunta: "Qual destes tipos de vidro NÃO pode ser reciclado junto com garrafas e potes comuns?",
      opcoes: [
        { texto: "Potes de azeitona e palmito.", correta: false },
        { texto: "Garrafas transparentes de suco.", correta: false },
        { texto: "Espelhos, cerâmicas, porcelanas e pratos de pirex.", correta: true },
        { texto: "Frascos de molho de tomate.", correta: false }
      ],
      explicacao: "Espelhos, louças de cerâmica e pirex possuem produtos químicos e temperaturas de derretimento diferentes das embalagens normais de vidro, estragando o lote na vidraria."
    },
    {
      id: 4,
      pergunta: "Ao descartar um copo de vidro quebrado, qual é a atitude correta para proteger os coletores?",
      opcoes: [
        { texto: "Jogar diretamente no saco preto de lixo para não se cortar.", correta: false },
        { texto: "Colocar dentro de uma garrafa PET ou caixa de leite cortada, selar e identificar 'VIDRO QUEBRADO'.", correta: true },
        { texto: "Quebrar em pedaços ainda menores para ocupar menos espaço.", correta: false },
        { texto: "Enterrar no quintal da sua casa.", correta: false }
      ],
      explicacao: "Acidentes com cacos de vidro furando sacos são a maior causa de cortes graves em garis e catadores. Protegê-los em recipientes rígidos e rotular salva vidas!"
    },
    {
      id: 5,
      pergunta: "Onde devem ser descartadas pilhas comuns, baterias e celulares velhos?",
      opcoes: [
        { texto: "Na lixeira de metal comum da coleta seletiva.", correta: false },
        { texto: "No lixo orgânico do banheiro.", correta: false },
        { texto: "Em pontos de entrega voluntária de lixo eletrônico (farmácias, lojas ou ecopontos).", correta: true },
        { texto: "No meio do papel para amortecer a queda.", correta: false }
      ],
      explicacao: "Pilhas e baterias contêm metais pesados (mercúrio, chumbo, lítio) que vazam e poluem a água subterrânea se forem para aterros comuns. Devem passar por logística reversa."
    },
    {
      id: 6,
      pergunta: "Por que 1 litro de óleo de cozinha usado NUNCA deve ser jogado no ralo da pia?",
      opcoes: [
        { texto: "Porque pode contaminar até 25.000 litros de água e entupir a rede de esgoto.", correta: true },
        { texto: "Porque evapora e gera fumaça perigosa para os vizinhos.", correta: false },
        { texto: "Porque atrai cupins para a encanação de PVC.", correta: false },
        { texto: "Não há problema, o sabão da louça neutraliza totalmente o óleo.", correta: false }
      ],
      explicacao: "O óleo gruda nos canos formando placas duras que entopem o esgoto e, ao atingir rios e represas, cria uma camada que bloqueia o oxigênio e mata a fauna aquática."
    },
    {
      id: 7,
      pergunta: "Embalagens cartonadas tipo longa vida (leite e suco - Tetra Pak) são recicláveis?",
      opcoes: [
        { texto: "Não, pois misturam papel, plástico e alumínio e viram lixo comum.", correta: false },
        { texto: "Sim, são 100% aproveitáveis em indústrias que separam as fibras e fazem telhas e papel novo.", correta: true },
        { texto: "Apenas a tampinha de plástico é reciclável, a caixa não.", correta: false },
        { texto: "Apenas se você conseguir descolar a folha de alumínio com a mão.", correta: false }
      ],
      explicacao: "As embalagens Tetra Pak são plenamente recicláveis por hidropolpação industrial: o papel vira caixas novas e o plástico com alumínio vira chapas e telhas térmicas."
    },
    {
      id: 8,
      pergunta: "Qual das opções a seguir é considerada REJEITO (não reciclável convencionalmente)?",
      opcoes: [
        { texto: "Papel higiênico, adesivos e esponjas de lavar louça.", correta: true },
        { texto: "Lata de milho vazia e limpa.", correta: false },
        { texto: "Garrafa pet de refrigerante.", correta: false },
        { texto: "Caderno velho sem a capa dura.", correta: false }
      ],
      explicacao: "Papéis sanitários, fitas adesivas, etiquetas térmicas e esponjas de louça são rejeitos no sistema brasileiro tradicional e devem ir para o lixo comum."
    },
    {
      id: 9,
      pergunta: "O que a meta 12.5 dos Objetivos de Desenvolvimento Sustentável (ODS da ONU) propõe?",
      opcoes: [
        { texto: "Aumentar o consumo de embalagens descartáveis plásticas.", correta: false },
        { texto: "Reduzir substancialmente a geração de resíduos por meio da prevenção, redução, reciclagem e reuso.", correta: true },
        { texto: "Proibir completamente a fabricação de computadores e smartphones.", correta: false },
        { texto: "Substituir todas as latas de alumínio por caixas de isopor.", correta: false }
      ],
      explicacao: "A meta 12.5 visa diminuir a produção de resíduos priorizando os 5 R's: Repensar, Recusar, Reduzir, Reutilizar e Reciclar até 2030."
    },
    {
      id: 10,
      pergunta: "Qual o benefício social direto da separação correta dos resíduos nas casas?",
      opcoes: [
        { texto: "Evita que os catadores de materiais recicláveis tenham trabalho.", correta: false },
        { texto: "Gera renda digna e segurança sanitária para cooperativas e famílias de catadores.", correta: true },
        { texto: "Nenhum benefício social, apenas marketing de empresas.", correta: false },
        { texto: "Diminui a quantidade de árvores plantadas nas cidades.", correta: false }
      ],
      explicacao: "Mais de 80% do material reciclado no Brasil passa pelas mãos de catadores e cooperativas. Entregar resíduos secos e limpos valoriza o trabalho e a saúde dessas famílias."
    }
  ],

  locaisColetaPadrao: [
    {
      id: "ponto-1",
      nome: "Ecoponto Central Municipal",
      tipo: "Ecoponto Público",
      endereco: "Av. do Estado, 900 - Centro",
      cidade: "São Paulo - SP",
      lat: -23.5489,
      lng: -46.6388,
      horario: "Segunda a Sábado, das 08h às 18h",
      materiais: ["papel", "plastico", "vidro", "metal", "entulho", "moveis"],
      observacao: "Gratuito para munícipes. Aceita até 1m³ de entulho por dia.",
      telefone: "(11) 3333-1234",
      mapsQuery: "Ecoponto Central"
    },
    {
      id: "ponto-2",
      nome: "Cooperativa de Catadores 'Futuro Verde'",
      tipo: "Cooperativa de Reciclagem",
      endereco: "Rua Sérgio Tomás, 320 - Bom Retiro",
      cidade: "São Paulo - SP",
      lat: -23.5234,
      lng: -46.6450,
      horario: "Segunda a Sexta, das 07h às 17h",
      materiais: ["papel", "plastico", "vidro", "metal"],
      observacao: "Entrega direta que apoia 35 famílias de catadores locais.",
      telefone: "(11) 98765-4321",
      mapsQuery: "Cooperativa de Reciclagem"
    },
    {
      id: "ponto-3",
      nome: "PEV Eletrônicos & Pilhas - Supermercado Modelo",
      tipo: "Ponto de Entrega Voluntária (Logística Reversa)",
      endereco: "Rua Augusta, 1200 - Consolação",
      cidade: "São Paulo - SP",
      lat: -23.5539,
      lng: -46.6575,
      horario: "Todos os dias, das 07h às 22h",
      materiais: ["especial"],
      observacao: "Totem exclusivo para pilhas, celulares velhos, baterias e lâmpadas.",
      telefone: "(11) 4004-0000",
      mapsQuery: "Coleta Pilhas Eletronicos"
    },
    {
      id: "ponto-4",
      nome: "Ponto de Entrega de Óleo Usado - Escola Estadual Santos Dumont",
      tipo: "Ponto Escolar Comunitário",
      endereco: "Praça dos Estudantes, 50 - Portão 2 - Bela Vista",
      cidade: "São Paulo - SP",
      lat: -23.5640,
      lng: -46.6490,
      horario: "Segunda a Sexta, das 08h às 16h",
      materiais: ["especial"],
      observacao: "Recebe óleo de cozinha filtrado em garrafas PET transparentes.",
      telefone: "(11) 2222-7890",
      mapsQuery: "Coleta Oleo Cozinha Usado"
    },
    {
      id: "ponto-5",
      nome: "Ponto de Coleta Farmácia Solidária",
      tipo: "Descarte de Medicamentos",
      endereco: "Av. Brigadeiro Luís Antônio, 1800 - Bela Vista",
      cidade: "São Paulo - SP",
      lat: -23.5685,
      lng: -46.6470,
      horario: "Segunda a Domingo, das 07h às 23h",
      materiais: ["especial"],
      observacao: "Descarte seguro de remédios vencidos, pomadas, colírios e blísters.",
      telefone: "(11) 3100-5555",
      mapsQuery: "Descarte Medicamentos Farmacia"
    },
    {
      id: "ponto-6",
      nome: "Ecoponto Bairro & Reciclagem Oeste",
      tipo: "Ecoponto Público",
      endereco: "Rua Guaicurus, 1000 - Lapa",
      cidade: "São Paulo - SP",
      lat: -23.5220,
      lng: -46.6900,
      horario: "Segunda a Sábado, das 08h às 18h",
      materiais: ["papel", "plastico", "vidro", "metal", "entulho", "moveis"],
      observacao: "Ponto amplo com caçambas para madeira, papelão, entulho e sucata metálica.",
      telefone: "(11) 3641-0000",
      mapsQuery: "Ecoponto Lapa"
    }
  ],

  // Cidades para busca rápida offline
  cidadesReferencia: {
    "sao paulo": { lat: -23.5505, lng: -46.6333, label: "São Paulo, SP" },
    "rio de janeiro": { lat: -22.9068, lng: -43.1729, label: "Rio de Janeiro, RJ" },
    "belo horizonte": { lat: -19.9167, lng: -43.9345, label: "Belo Horizonte, MG" },
    "curitiba": { lat: -25.4290, lng: -49.2671, label: "Curitiba, PR" },
    "porto alegre": { lat: -30.0346, lng: -51.2177, label: "Porto Alegre, RS" },
    "salvador": { lat: -12.9777, lng: -38.5016, label: "Salvador, BA" },
    "fortaleza": { lat: -3.7319, lng: -38.5267, label: "Fortaleza, CE" },
    "brasilia": { lat: -15.7975, lng: -47.8919, label: "Brasília, DF" },
    "recife": { lat: -8.0476, lng: -34.8770, label: "Recife, PE" },
    "campinas": { lat: -22.9071, lng: -47.0632, label: "Campinas, SP" },
    "goiania": { lat: -16.6869, lng: -49.2648, label: "Goiânia, GO" },
    "manaus": { lat: -3.1190, lng: -60.0217, label: "Manaus, AM" },
    "florianopolis": { lat: -27.5954, lng: -48.5480, label: "Florianópolis, SC" },
    "vitoria": { lat: -20.3155, lng: -40.3128, label: "Vitória, ES" },
    "santos": { lat: -23.9608, lng: -46.3336, label: "Santos, SP" }
  }
};
