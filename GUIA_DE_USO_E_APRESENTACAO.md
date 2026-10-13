# GUIA DE USO, EXECUÇÃO E APRESENTAÇÃO DO PROJETO

Bem-vindo(a) ao **Recicla Consciente**! Este guia foi feito para que você consiga executar o seu projeto de extensão do início ao fim com tranquilidade, coletar as métricas necessárias e garantir a aprovação na sua faculdade.

---

## 1. O QUE VOCÊ TEM EM MÃOS

A sua pasta contém uma solução completa:
1. **`index.html`**: O site completo, responsivo para celular e computador.
2. **`css/styles.css`**: Design visual moderno, limpo, acessível e com identidade visual ecológica.
3. **`js/data.js`**: Banco de dados com mais de 20 materiais categorizados, 10 perguntas pedagógicas com explicações e catálogo de pontos de coleta.
4. **`js/app.js`**: Toda a inteligência da aplicação (filtros, busca em tempo real, quiz com modo antes/depois, formulário de pesquisa, persistência no navegador, métricas automáticas e exportação para Excel).
5. **`PROJETO_DE_EXTENSAO.md`**: Proposta formal pronta para cadastrar na coordenação ou no portal do aluno da faculdade.
6. **`RELATORIO_FINAL_MODELO.md`**: Modelo estruturado para você entregar após a ação para validação das horas de extensão.

---

## 2. COMO ABRIR O SITE

Você **não precisa instalar nada nem compilar código**!
* Basta dar **duplo clique no arquivo `index.html`** no seu computador.
* Ele abrirá automaticamente em qualquer navegador moderno (Google Chrome, Microsoft Edge, Firefox, Safari).

### Quer colocar o site na internet gratuitamente para enviar pelo WhatsApp?
Se quiser que as pessoas acessem direto pelo celular de qualquer lugar:
1. **GitHub Pages (Grátis):** Suba esta pasta para um repositório no GitHub e ative o *GitHub Pages* em `Settings > Pages`.
2. **Netlify / Vercel (Grátis):** Basta arrastar a pasta `reciclagem` para o painel do [Netlify Drop](https://app.netlify.com/drop) e em 5 segundos você recebe um link público oficial para compartilhar com a comunidade!

---

## 3. COMO APLICAR O PROJETO COM A COMUNIDADE

Para que sua faculdade aprove com louvor, o segredo é **mostrar que pessoas reais usaram a ferramenta e aprenderam algo**.

Siga este roteiro simples com uma turma de escola, vizinhos, colegas de trabalho ou condomínio:

1. **Passo 1 (Antes):** Peça para as pessoas abrirem o site e clicarem no botão **"1️⃣ Diagnóstico Inicial (Antes)"** do Quiz. Elas responderão sem ler as dicas.
2. **Passo 2 (Exploração):** Peça para navegarem no **Guia de Descarte** e no **Onde Descartar**, pesquisando itens do dia a dia (ex: como descartar caixa de pizza, óleo de cozinha, remédio ou vidro quebrado).
3. **Passo 3 (Depois):** Peça para clicarem em **"2️⃣ Avaliação Final (Depois)"** e refazerem o quiz. O sistema mostrará a evolução do aprendizado!
4. **Passo 4 (Avaliação):** Peça para responderem ao **Questionário de Impacto Comunitário** logo abaixo.

---

## 4. O PAINEL DO ALUNO E AS MÉTRICAS ACADÊMICAS

No final da página, você tem a seção **"Painel do Aluno"**:
* **Total de visualizações e formulários:** Atualizados em tempo real conforme as pessoas respondem no navegador.
* **Média do Quiz Antes vs Depois:** Mostra o ganho em pontos percentuais (ex: +33 p.p.), comprovando impacto pedagógico.
* **Botão "Exportar Relatório para Excel (CSV)":** Baixa uma planilha prontinha com todas as respostas para você anexar ao seu trabalho acadêmico.
* **Botão "Carregar Dados de Demonstração":** Se você for apresentar o projeto em sala de aula ou para uma banca e quiser mostrar os gráficos com 30+ participantes imediatamente preenchidos, basta clicar neste botão!
* **Botão "Zerar Métricas":** Limpa o banco de dados local para quando você for começar a pesquisa real.

---

## 5. COMO PERSONALIZAR O PROJETO COM SEUS DADOS

1. **Seus Dados Acadêmicos:**
   * No site, clique no botão **"✏️ Personalizar Dados"** (na seção *Sobre o Projeto*).
   * Digite seu nome, curso, faculdade e nome do orientador. Os dados salvam automaticamente e já saem na planilha de exportação.

2. **Pontos de Coleta da Sua Cidade:**
   * Abra o arquivo `js/data.js` com qualquer editor de texto (Bloco de Notas ou VS Code).
   * Na seção `locaisColetaPadrao`, basta trocar os endereços e nomes para os ecopontos e cooperativas reais do seu município!

---

## 6. DICAS DE SUCESSO PARA A BANCA AVALIADORA
* **Destaque o ODS 12 (Metas 12.5 e 12.8):** A maioria dos projetos de extensão é avaliada com base nas metas da ONU da Agenda 2030. Seu projeto atende perfeitamente a esses critérios.
* **Destaque a métrica do Quiz Antes vs Depois:** Faculdades adoram evidências científicas de que a intervenção gerou aprendizagem real.
* **Mencione a valorização dos catadores:** Mostre que seu projeto não é apenas "tecnológico", mas tem um viés social de proteção aos trabalhadores da reciclagem.
