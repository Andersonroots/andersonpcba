// Edital verticalizado — PC-BA / Investigador de Polícia Civil (Instituto AOCP, 2026)
// peso: 1 (🧊 baixa incidência) ... 5 (🔥🔥🔥 altíssima incidência na banca AOCP)
// modo: como o tópico deve ser estudado (aula, pdf, lei seca, exercícios)

export type Modo = "aula" | "pdf" | "lei" | "exercicios";

export interface Topico {
  id: string;
  t: string;
  p: 1 | 2 | 3 | 4 | 5;
  m: Modo;
  f: string[]; // pontos de foco / o que mais cai
}

export interface Disciplina {
  id: string;
  nome: string;
  curto: string;
  cor: string; // token hsl-like usado direto no style (pastel do card)
  corForte: string;
  peso: 1 | 2 | 3 | 4 | 5;
  topicos: Topico[];
}

export const MODO_LABEL: Record<Modo, string> = {
  aula: "Aula",
  pdf: "PDF",
  lei: "Lei seca",
  exercicios: "Questões",
};

export function selo(p: number) {
  if (p >= 5) return "🔥🔥🔥";
  if (p === 4) return "🔥🔥";
  if (p === 3) return "🔥";
  if (p === 2) return "❄️";
  return "🧊";
}

export function seloTexto(p: number) {
  if (p >= 5) return "Altíssima incidência";
  if (p === 4) return "Alta incidência";
  if (p === 3) return "Incidência média";
  if (p === 2) return "Baixa incidência";
  return "Incidência rara";
}

export const DISCIPLINAS: Disciplina[] = [
  {
    id: "port",
    nome: "Língua Portuguesa",
    curto: "Português",
    cor: "#fde7ef",
    corForte: "#e35d8a",
    peso: 5,
    topicos: [
      {
        id: "port-1",
        t: "Compreensão e interpretação de texto; tipologia e gêneros; funções da linguagem",
        p: 5,
        m: "aula",
        f: [
          "AOCP adora inferência x informação explícita — treine marcar o trecho que sustenta a alternativa",
          "Tipologia (narrativo, descritivo, dissertativo, injuntivo, expositivo) x gênero textual",
          "Funções da linguagem: referencial, conativa, emotiva, fática, metalinguística, poética",
          "Intenção/finalidade do texto e do autor",
        ],
      },
      {
        id: "port-2",
        t: "Semântica: sinonímia, antonímia, figuras de linguagem, reescrita",
        p: 4,
        m: "pdf",
        f: [
          "Substituição de palavra sem alterar o sentido (a pegadinha clássica da banca)",
          "Ambiguidade, polissemia, denotação x conotação",
          "Metáfora, metonímia, eufemismo, ironia, hipérbole, antítese, paradoxo",
        ],
      },
      {
        id: "port-3",
        t: "Morfologia: estrutura e formação de palavras, ortografia, acentuação",
        p: 3,
        m: "pdf",
        f: [
          "Derivação (prefixal, sufixal, parassintética, regressiva) x composição",
          "Regras de acentuação: oxítonas, paroxítonas, proparoxítonas, hiatos, monossílabos",
          "Novo acordo ortográfico: hífen e casos que ainda caem",
        ],
      },
      {
        id: "port-4",
        t: "Classes de palavras variáveis e invariáveis e seus empregos no texto",
        p: 4,
        m: "aula",
        f: [
          "Pronomes relativos (função sintática do 'que') — campeão de questões",
          "Conjunções e o valor semântico que introduzem",
          "Verbo: tempo, modo, aspecto e vozes verbais",
        ],
      },
      {
        id: "port-5",
        t: "Sintaxe: termos da oração, período composto por coordenação e subordinação",
        p: 5,
        m: "aula",
        f: [
          "Classificar orações subordinadas (substantivas, adjetivas, adverbiais)",
          "Oração adjetiva restritiva x explicativa e a vírgula",
          "Sujeito, predicado, complementos, adjunto adnominal x complemento nominal",
        ],
      },
      {
        id: "port-6",
        t: "Concordância verbal e nominal",
        p: 5,
        m: "pdf",
        f: [
          "Sujeito composto posposto, expressões partitivas, 'mais de um', porcentagens",
          "Verbos impessoais: haver, fazer (tempo), verbos de fenômeno natural",
          "Concordância com 'é proibido', 'anexo', 'obrigado', 'meio', 'bastante'",
        ],
      },
      {
        id: "port-7",
        t: "Regência verbal e nominal; uso da crase; colocação pronominal",
        p: 5,
        m: "pdf",
        f: [
          "Verbos: assistir, aspirar, visar, implicar, obedecer, esquecer, preferir",
          "Crase: antes de pronomes, nomes de lugar, 'à distância', 'à moda de'",
          "Próclise obrigatória: palavras atrativas (não, nunca, que, quem, ninguém)",
        ],
      },
      {
        id: "port-8",
        t: "Funções do 'que' e do 'se'; reescrita de orações e parágrafos",
        p: 4,
        m: "exercicios",
        f: [
          "'Se': pronome apassivador x índice de indeterminação do sujeito",
          "'Que': pronome relativo, conjunção integrante, partícula expletiva",
          "Reescrita mantendo sentido e correção — comparar voz ativa/passiva",
        ],
      },
      {
        id: "port-9",
        t: "Emprego dos sinais de pontuação e sua função no texto",
        p: 5,
        m: "pdf",
        f: [
          "Vírgula em adjuntos deslocados, apostos e orações intercaladas",
          "Proibição de vírgula entre sujeito e verbo / verbo e complemento",
          "Ponto e vírgula, dois-pontos e travessão: efeito de sentido",
        ],
      },
      {
        id: "port-10",
        t: "Coesão e coerência: referenciação e sequenciação",
        p: 4,
        m: "aula",
        f: [
          "Retomada anafórica e catafórica — a que termo o pronome se refere",
          "Conectivos e a relação lógica (causa, consequência, concessão, conclusão)",
          "Substituição de conectivo sem mudar o sentido",
        ],
      },
      {
        id: "port-11",
        t: "Redação Oficial (Manual da Presidência da República)",
        p: 3,
        m: "pdf",
        f: [
          "Padrão ofício: partes, fecho, vocativo e pronomes de tratamento",
          "Atributos: clareza, concisão, impessoalidade, formalidade, uniformidade",
          "Diferença entre ofício, memorando (extinto/unificado), exposição de motivos",
        ],
      },
      {
        id: "port-12",
        t: "Variação linguística e norma culta; função textual dos vocábulos",
        p: 2,
        m: "pdf",
        f: [
          "Variação diatópica, diastrática, diafásica e diacrônica",
          "Adequação da linguagem ao contexto formal do documento policial",
        ],
      },
    ],
  },
  {
    id: "penal",
    nome: "Noções de Direito Penal",
    curto: "D. Penal",
    cor: "#ffe6e0",
    corForte: "#e05c3e",
    peso: 5,
    topicos: [
      {
        id: "penal-1",
        t: "Princípios do Direito Penal",
        p: 3,
        m: "aula",
        f: [
          "Legalidade, anterioridade, intervenção mínima, fragmentariedade",
          "Insignificância: requisitos do STF (MARI) e crimes que não admitem",
          "Culpabilidade, ofensividade, adequação social",
        ],
      },
      {
        id: "penal-2",
        t: "Aplicação da lei penal: tempo, espaço, territorialidade e extraterritorialidade",
        p: 4,
        m: "lei",
        f: [
          "Teoria da atividade (tempo) x teoria da ubiquidade (lugar)",
          "Extraterritorialidade incondicionada x condicionada (art. 7º CP) — decore o rol",
          "Lei penal no tempo: novatio legis in mellius, abolitio criminis, lei temporária",
        ],
      },
      {
        id: "penal-3",
        t: "Infração penal: conceito, elementos, espécies, sujeitos",
        p: 3,
        m: "aula",
        f: [
          "Crime x contravenção; classificação (material, formal, mera conduta)",
          "Crimes próprios, de mão própria, comissivos por omissão",
        ],
      },
      {
        id: "penal-4",
        t: "Fato típico: conduta, resultado, nexo causal e tipicidade",
        p: 4,
        m: "aula",
        f: [
          "Teoria da equivalência dos antecedentes e a superveniência causal (art. 13, §1º)",
          "Omissão imprópria e o dever de agir (art. 13, §2º)",
          "Tipicidade formal x material x conglobante",
        ],
      },
      {
        id: "penal-5",
        t: "Crime doloso e culposo; erro de tipo",
        p: 4,
        m: "pdf",
        f: [
          "Dolo direto, eventual e a teoria do assentimento",
          "Culpa consciente x dolo eventual (diferença cobradíssima)",
          "Erro de tipo essencial escusável x inescusável; erro acidental (aberratio ictus)",
        ],
      },
      {
        id: "penal-6",
        t: "Consumação, tentativa, desistência voluntária, arrependimento e crime impossível",
        p: 5,
        m: "lei",
        f: [
          "Tentativa: redução de 1/3 a 2/3 e crimes que não admitem",
          "Desistência voluntária x arrependimento eficaz (responde pelos atos praticados)",
          "Arrependimento posterior: até o recebimento da denúncia, crime sem violência",
          "Crime impossível: ineficácia absoluta do meio e impropriedade absoluta do objeto (Súm. 145 STF)",
        ],
      },
      {
        id: "penal-7",
        t: "Ilicitude e causas de exclusão",
        p: 5,
        m: "lei",
        f: [
          "Legítima defesa: requisitos e a legítima defesa do agente de segurança pública",
          "Estado de necessidade: teoria unitária adotada pelo CP",
          "Estrito cumprimento do dever legal — essencial para a atividade policial",
          "Excesso doloso e culposo",
        ],
      },
      {
        id: "penal-8",
        t: "Culpabilidade: imputabilidade, potencial consciência da ilicitude, exigibilidade",
        p: 4,
        m: "aula",
        f: [
          "Menoridade, doença mental, embriaguez (actio libera in causa)",
          "Erro de proibição: escusável exclui; inescusável reduz de 1/6 a 1/3",
          "Coação moral irresistível e obediência hierárquica",
        ],
      },
      {
        id: "penal-9",
        t: "Concurso de pessoas",
        p: 4,
        m: "pdf",
        f: [
          "Teoria monista e suas exceções pluralísticas",
          "Participação de menor importância e cooperação dolosamente distinta",
          "Comunicabilidade de elementares (art. 30 CP)",
        ],
      },
      {
        id: "penal-10",
        t: "Concurso de crimes: material, formal e crime continuado",
        p: 4,
        m: "lei",
        f: [
          "Formal próprio x impróprio (cúmulo material quando há desígnios autônomos)",
          "Continuidade delitiva: requisitos objetivos e o específico (crimes dolosos contra vítimas diferentes)",
        ],
      },
      {
        id: "penal-11",
        t: "Penas: espécies, aplicação, regimes, substituição, sursis e livramento condicional",
        p: 4,
        m: "lei",
        f: [
          "Dosimetria trifásica (art. 59, 68) e a Súmula 231 do STJ",
          "Regras dos regimes (art. 33) e requisitos da substituição (art. 44)",
          "Livramento condicional: frações e requisitos subjetivos",
        ],
      },
      {
        id: "penal-12",
        t: "Extinção da punibilidade e prescrição",
        p: 4,
        m: "lei",
        f: [
          "Rol do art. 107 CP",
          "Prescrição da pretensão punitiva x executória; marcos interruptivos (art. 117)",
          "Prescrição em abstrato, retroativa e a redução pela idade (art. 115)",
        ],
      },
      {
        id: "penal-13",
        t: "Crimes contra a pessoa",
        p: 5,
        m: "lei",
        f: [
          "Homicídio: qualificadoras, feminicídio, homicídio funcional (§2º, VII)",
          "Lesão corporal: gravidade, violência doméstica (§9º) e a lesão contra agente de segurança",
          "Ameaça, perseguição (stalking, art. 147-A), violência psicológica (147-B)",
        ],
      },
      {
        id: "penal-14",
        t: "Crimes contra o patrimônio",
        p: 5,
        m: "lei",
        f: [
          "Furto x roubo: momento da violência; furto qualificado e o §4º-A (explosivo)",
          "Roubo majorado (arma de fogo, concurso, restrição de liberdade) e latrocínio (Súm. 610 STF)",
          "Extorsão x extorsão mediante sequestro; estelionato e a ação penal após a Lei 13.964/19",
        ],
      },
      {
        id: "penal-15",
        t: "Crimes contra a dignidade sexual",
        p: 4,
        m: "lei",
        f: [
          "Estupro e estupro de vulnerável (Súm. 593 STJ)",
          "Importunação sexual (215-A) x assédio; registro não autorizado (216-B)",
          "Ação penal pública incondicionada (art. 225)",
        ],
      },
      {
        id: "penal-16",
        t: "Crimes contra a fé pública e a incolumidade/paz pública",
        p: 3,
        m: "lei",
        f: [
          "Falsidade ideológica x falsidade material; uso de documento falso",
          "Associação criminosa (art. 288) x organização criminosa (Lei 12.850)",
          "Moeda falsa e petrechos",
        ],
      },
      {
        id: "penal-17",
        t: "Crimes contra a Administração Pública",
        p: 5,
        m: "lei",
        f: [
          "Peculato (espécies), concussão, corrupção passiva e ativa",
          "Prevaricação, condescendência criminosa, advocacia administrativa",
          "Conceito de funcionário público para fins penais (art. 327)",
          "Resistência, desobediência e desacato",
        ],
      },
      {
        id: "penal-18",
        t: "Crimes contra o Estado Democrático de Direito e jurisprudência aplicada",
        p: 2,
        m: "lei",
        f: [
          "Arts. 359-L a 359-T (abolição violenta, golpe de Estado)",
          "Súmulas do STF/STJ mais cobradas em Direito Penal",
        ],
      },
    ],
  },
  {
    id: "pp",
    nome: "Noções de Direito Processual Penal",
    curto: "D. Proc. Penal",
    cor: "#e4edff",
    corForte: "#3f6fd8",
    peso: 5,
    topicos: [
      {
        id: "pp-1",
        t: "Noções introdutórias: princípios, sistemas processuais, lei processual no tempo e espaço",
        p: 3,
        m: "aula",
        f: [
          "Sistema acusatório e o juiz das garantias",
          "Princípio da aplicação imediata (tempus regit actum)",
          "Interpretação e analogia no processo penal (art. 3º CPP)",
        ],
      },
      {
        id: "pp-2",
        t: "Inquérito policial e investigações preliminares",
        p: 5,
        m: "lei",
        f: [
          "Características: inquisitivo, sigiloso, dispensável, indisponível",
          "Formas de instauração, prazos (10/30 dias) e prorrogação",
          "Indiciamento privativo do delegado (Lei 12.830) e Súmula Vinculante 14",
          "Arquivamento após a Lei 13.964/19 e o controle externo pelo MP",
        ],
      },
      {
        id: "pp-3",
        t: "Acordo de não persecução penal (ANPP)",
        p: 4,
        m: "lei",
        f: [
          "Requisitos do art. 28-A: pena mínima < 4 anos, sem violência ou grave ameaça",
          "Confissão formal e circunstanciada; homologação judicial",
          "Vedações e efeitos do descumprimento",
        ],
      },
      {
        id: "pp-4",
        t: "Ação penal e ação civil ex delicto",
        p: 4,
        m: "lei",
        f: [
          "Pública incondicionada, condicionada e privada (subsidiária da pública)",
          "Prazos: representação (6 meses), decadência, perempção, renúncia e perdão",
          "Princípios: obrigatoriedade, indisponibilidade, oportunidade",
        ],
      },
      {
        id: "pp-5",
        t: "Jurisdição e competência criminal",
        p: 3,
        m: "pdf",
        f: [
          "Competência pelo lugar da infração x domicílio do réu",
          "Conexão e continência; prevalência do júri",
          "Foro por prerrogativa de função",
        ],
      },
      {
        id: "pp-6",
        t: "Provas: teoria geral, meios de prova e de obtenção de prova",
        p: 5,
        m: "lei",
        f: [
          "Prova ilícita e ilícita por derivação; teorias limitadoras",
          "Cadeia de custódia (arts. 158-A a 158-F) — tema queridinho da AOCP",
          "Interrogatório, testemunhas, reconhecimento de pessoas (novo entendimento STJ art. 226)",
          "Busca e apreensão domiciliar e pessoal; flagrante em domicílio (RE 603.616)",
        ],
      },
      {
        id: "pp-7",
        t: "Prisões e medidas cautelares pessoais",
        p: 5,
        m: "lei",
        f: [
          "Prisão em flagrante: espécies, lavratura do APF e nota de culpa (24h)",
          "Audiência de custódia (24h) e conversão em preventiva",
          "Preventiva: requisitos (art. 312/313) e a vedação à decretação de ofício",
          "Temporária (Lei 7.960) — prazos e rol de crimes",
        ],
      },
      {
        id: "pp-8",
        t: "Liberdade provisória e fiança",
        p: 4,
        m: "lei",
        f: [
          "Quem pode arbitrar fiança (delegado até 4 anos)",
          "Crimes inafiançáveis e as hipóteses de quebra/perda",
          "Medidas cautelares diversas da prisão (art. 319)",
        ],
      },
      {
        id: "pp-9",
        t: "Questões e processos incidentes; medidas assecuratórias",
        p: 2,
        m: "pdf",
        f: [
          "Exceções, incidente de falsidade e de insanidade mental",
          "Sequestro, arresto e especialização de hipoteca legal",
        ],
      },
      {
        id: "pp-10",
        t: "Sujeitos do processo e comunicação dos atos processuais",
        p: 2,
        m: "pdf",
        f: ["Juiz, MP, acusado, defensor, assistente", "Citação por hora certa e por edital; intimações"],
      },
      {
        id: "pp-11",
        t: "Procedimento comum: ordinário, sumário e sumaríssimo",
        p: 3,
        m: "lei",
        f: [
          "Prazos e rito; resposta à acusação e absolvição sumária",
          "Rito do Júri: fases (sumário da culpa e plenário)",
        ],
      },
      {
        id: "pp-12",
        t: "Nulidades",
        p: 2,
        m: "pdf",
        f: ["Absoluta x relativa; pas de nullité sans grief", "Momento da arguição (art. 571)"],
      },
      {
        id: "pp-13",
        t: "Sentença, recursos e ações autônomas de impugnação",
        p: 3,
        m: "pdf",
        f: [
          "Emendatio x mutatio libelli",
          "Prazos recursais (RESE 5 dias, apelação 5 dias)",
          "Habeas corpus, revisão criminal e mandado de segurança",
        ],
      },
    ],
  },
  {
    id: "legext",
    nome: "Legislação Penal e Processual Extravagante",
    curto: "Leg. Extravagante",
    cor: "#f3e8ff",
    corForte: "#8b5cf6",
    peso: 5,
    topicos: [
      {
        id: "legext-1",
        t: "Lei 13.869/2019 — Abuso de Autoridade",
        p: 5,
        m: "lei",
        f: [
          "Dolo específico do art. 1º, §1º (finalidade específica)",
          "Crimes mais cobrados: arts. 9º, 10, 12, 13, 15, 22 e 25",
          "Sujeito ativo, ação penal e efeitos da condenação",
        ],
      },
      {
        id: "legext-2",
        t: "Lei 11.343/2006 — Lei de Drogas",
        p: 5,
        m: "lei",
        f: [
          "Art. 28: natureza jurídica e ausência de pena privativa",
          "Tráfico (art. 33) e o tráfico privilegiado (§4º)",
          "Associação para o tráfico x organização criminosa; art. 35",
          "Procedimento investigatório e prazos processuais próprios",
        ],
      },
      {
        id: "legext-3",
        t: "Lei 10.826/2003 — Estatuto do Desarmamento",
        p: 5,
        m: "lei",
        f: [
          "Posse x porte; uso permitido x restrito (arts. 12, 14, 16)",
          "Crimes equiparados e o porte funcional do policial civil",
          "Disparo de arma de fogo e comércio ilegal",
        ],
      },
      {
        id: "legext-4",
        t: "Lei 11.340/2006 — Maria da Penha",
        p: 5,
        m: "lei",
        f: [
          "Formas de violência (art. 7º) e âmbito de aplicação (art. 5º)",
          "Medidas protetivas de urgência e o descumprimento (art. 24-A)",
          "Atuação da autoridade policial (arts. 11 e 12) e a medida protetiva pelo delegado",
        ],
      },
      {
        id: "legext-5",
        t: "Lei 8.072/1990 — Crimes Hediondos",
        p: 4,
        m: "lei",
        f: [
          "Rol taxativo do art. 1º (atenção às alterações do Pacote Anticrime)",
          "Progressão de regime: frações do art. 112 da LEP",
          "Vedações: anistia, graça, indulto e fiança",
        ],
      },
      {
        id: "legext-6",
        t: "Lei 12.850/2013 — Organizações Criminosas",
        p: 5,
        m: "lei",
        f: [
          "Conceito de ORCRIM (4 ou mais pessoas, penas > 4 anos)",
          "Colaboração premiada: requisitos, legitimidade do delegado e valor probatório",
          "Infiltração de agentes, ação controlada e captação ambiental",
        ],
      },
      {
        id: "legext-7",
        t: "Lei 9.296/1996 — Interceptação telefônica",
        p: 4,
        m: "lei",
        f: [
          "Requisitos e vedações (art. 2º); prazo de 15 dias renováveis",
          "Serendipidade (encontro fortuito de provas)",
          "Crime do art. 10",
        ],
      },
      {
        id: "legext-8",
        t: "Lei 9.099/1995 — Juizados Especiais Criminais",
        p: 4,
        m: "lei",
        f: [
          "Infração de menor potencial ofensivo e o TCO",
          "Composição civil, transação penal e suspensão condicional do processo",
          "Princípios da oralidade, informalidade, economia e celeridade",
        ],
      },
      {
        id: "legext-9",
        t: "Lei 7.960/1989 — Prisão Temporária e Lei 12.830/2013 — Investigação Criminal",
        p: 4,
        m: "lei",
        f: [
          "Hipóteses cumulativas da temporária e prazos (5+5 / 30+30)",
          "Funções de polícia judiciária e a autonomia do delegado",
        ],
      },
      {
        id: "legext-10",
        t: "Lei 8.069/1990 — ECA (parte infracional)",
        p: 4,
        m: "lei",
        f: [
          "Ato infracional, medidas socioeducativas e prazo da internação",
          "Apreensão do adolescente e garantias processuais",
          "Crimes em espécie do ECA (arts. 228 a 244-B)",
        ],
      },
      {
        id: "legext-11",
        t: "Lei 9.455/1997 — Tortura e Lei 7.716/1989 — Crimes raciais",
        p: 4,
        m: "lei",
        f: [
          "Tortura-prova, tortura-crime, tortura-discriminação e tortura-omissão",
          "Injúria racial x racismo após a Lei 14.532/2023 (imprescritível e inafiançável)",
        ],
      },
      {
        id: "legext-12",
        t: "Lei 9.613/1998 — Lavagem de Dinheiro",
        p: 3,
        m: "lei",
        f: [
          "Fases: colocação, ocultação e integração",
          "Autonomia do processo e a alienação antecipada de bens",
          "Comunicação ao COAF e a teoria da cegueira deliberada",
        ],
      },
      {
        id: "legext-13",
        t: "Lei 9.503/1997 — Crimes de trânsito",
        p: 3,
        m: "lei",
        f: [
          "Homicídio culposo na direção (art. 302) e as causas de aumento",
          "Embriaguez ao volante (art. 306) e a recusa ao teste",
          "Fuga do local do acidente e omissão de socorro",
        ],
      },
      {
        id: "legext-14",
        t: "Lei 12.037/2009 — Identificação Criminal e Lei 5.553/1968",
        p: 3,
        m: "lei",
        f: [
          "Hipóteses de identificação criminal do civilmente identificado",
          "Coleta de perfil genético e o banco de dados",
          "Retenção de documento de identificação — proibição",
        ],
      },
      {
        id: "legext-15",
        t: "Lei 7.210/1984 — Execução Penal e Lei 9.807/1999 — Proteção a vítimas e testemunhas",
        p: 3,
        m: "lei",
        f: [
          "Direitos e deveres do preso; faltas graves",
          "Progressão e regressão de regime; remição",
          "Delação premiada da Lei 9.807 e o programa de proteção",
        ],
      },
      {
        id: "legext-16",
        t: "Lei 10.741/2003 (Idoso), Lei 13.146/2015 (PcD) e Lei 14.344/2022 (Henry Borel)",
        p: 3,
        m: "lei",
        f: [
          "Crimes em espécie do Estatuto da Pessoa Idosa",
          "Crimes do Estatuto da Pessoa com Deficiência",
          "Medidas protetivas da Lei Henry Borel e a violência doméstica contra criança",
        ],
      },
      {
        id: "legext-17",
        t: "Lei 9.605/1998 (Ambientais), Lei 8.137/1990, CDC (Título II) e Lei 7.492/1986",
        p: 2,
        m: "lei",
        f: [
          "Responsabilidade penal da pessoa jurídica",
          "Crimes contra a ordem tributária e o Enunciado 24 do STF",
          "Infrações penais de consumo e crimes contra o SFN",
        ],
      },
      {
        id: "legext-18",
        t: "Lei 8.429/1992 — Improbidade e Lei 3.688/1941 — Contravenções Penais",
        p: 3,
        m: "lei",
        f: [
          "Modalidades de improbidade após a Lei 14.230/2021 (só dolo)",
          "Contravenções mais cobradas: vias de fato, porte de arma branca, jogo do bicho",
        ],
      },
      {
        id: "legext-19",
        t: "DUDH, Lei 10.259/2001, Código Eleitoral, Lei Geral do Esporte e Lei 15.358/2026",
        p: 2,
        m: "lei",
        f: [
          "Declaração Universal dos Direitos Humanos: artigos mais cobrados",
          "Crimes eleitorais mais comuns",
          "Marco Legal de Combate ao Crime Organizado (novidade — leia a lei seca)",
        ],
      },
    ],
  },
  {
    id: "const",
    nome: "Noções de Direito Constitucional",
    curto: "D. Constitucional",
    cor: "#e6f7ef",
    corForte: "#2eaa78",
    peso: 4,
    topicos: [
      {
        id: "const-1",
        t: "Direitos e deveres individuais e coletivos (art. 5º)",
        p: 5,
        m: "lei",
        f: [
          "Incisos sobre prisão, domicílio, comunicação e inviolabilidades (XI, XII, LXI a LXVIII)",
          "Remédios constitucionais: HC, MS, HD, mandado de injunção, ação popular",
          "Direitos do preso e a vedação à prova ilícita",
        ],
      },
      {
        id: "const-2",
        t: "Direitos sociais, nacionalidade, cidadania e direitos políticos",
        p: 3,
        m: "lei",
        f: [
          "Art. 6º e 7º: direitos sociais e trabalhistas mais cobrados",
          "Brasileiro nato x naturalizado e os cargos privativos",
          "Condições de elegibilidade e perda/suspensão de direitos políticos",
        ],
      },
      {
        id: "const-3",
        t: "Organização político-administrativa do Estado",
        p: 3,
        m: "lei",
        f: [
          "Competências da União, Estados e Municípios (arts. 21, 22, 23, 24, 30)",
          "Intervenção federal e estadual",
        ],
      },
      {
        id: "const-4",
        t: "Administração Pública na CF (arts. 37 a 41) e servidores públicos",
        p: 4,
        m: "lei",
        f: [
          "Princípios LIMPE e a regra do concurso público",
          "Acumulação de cargos, teto remuneratório e estabilidade",
          "Responsabilidade civil do Estado (art. 37, §6º)",
        ],
      },
      {
        id: "const-5",
        t: "Poderes Executivo, Legislativo e Judiciário",
        p: 3,
        m: "pdf",
        f: [
          "Processo legislativo e espécies normativas",
          "CPI e seus poderes (não pode determinar busca domiciliar nem interceptação)",
          "Organização do Judiciário e funções essenciais à Justiça",
        ],
      },
      {
        id: "const-6",
        t: "Defesa do Estado, instituições democráticas e segurança pública (art. 144)",
        p: 5,
        m: "lei",
        f: [
          "Art. 144: órgãos, atribuições da polícia civil e da polícia federal",
          "Diferença entre polícia judiciária e polícia ostensiva",
          "Estado de defesa x estado de sítio",
        ],
      },
    ],
  },
  {
    id: "adm",
    nome: "Noções de Direito Administrativo",
    curto: "D. Administrativo",
    cor: "#fff4de",
    corForte: "#d99a24",
    peso: 4,
    topicos: [
      {
        id: "adm-1",
        t: "Organização administrativa: centralização, descentralização, administração direta e indireta",
        p: 4,
        m: "aula",
        f: [
          "Desconcentração x descentralização (a pegadinha mais recorrente)",
          "Autarquia, fundação, empresa pública e sociedade de economia mista — regime jurídico",
          "Entes de cooperação e terceiro setor",
        ],
      },
      {
        id: "adm-2",
        t: "Atos administrativos: conceito, requisitos, atributos, classificação e espécies",
        p: 5,
        m: "aula",
        f: [
          "Requisitos COM-FI-FO-MO-OB e os vícios de cada um",
          "Atributos: presunção de legitimidade, imperatividade, autoexecutoriedade, tipicidade",
          "Convalidação, anulação e revogação; vinculação x discricionariedade",
        ],
      },
      {
        id: "adm-3",
        t: "Agentes públicos: espécies, cargo, emprego e função",
        p: 4,
        m: "pdf",
        f: [
          "Classificação dos agentes públicos",
          "Provimento, vacância, posse e exercício",
          "Regime disciplinar e responsabilidades (civil, penal, administrativa)",
        ],
      },
      {
        id: "adm-4",
        t: "Poderes administrativos",
        p: 5,
        m: "aula",
        f: [
          "Poder de polícia: ciclo, atributos e delegação (Tema 532 STF)",
          "Poder disciplinar e hierárquico",
          "Abuso de poder: excesso x desvio de finalidade",
        ],
      },
      {
        id: "adm-5",
        t: "Licitações e contratos: princípios, modalidades e Lei 14.133/2021",
        p: 4,
        m: "lei",
        f: [
          "Modalidades da nova lei (pregão, concorrência, concurso, leilão, diálogo competitivo)",
          "Dispensa (art. 75) e inexigibilidade (art. 74)",
          "Fases do procedimento e critérios de julgamento",
        ],
      },
      {
        id: "adm-6",
        t: "Controle da Administração Pública",
        p: 3,
        m: "pdf",
        f: ["Controle interno, externo (TCU) e judicial", "Súmulas 346 e 473 do STF"],
      },
      {
        id: "adm-7",
        t: "Responsabilidade civil do Estado",
        p: 4,
        m: "aula",
        f: [
          "Teoria do risco administrativo e excludentes",
          "Ato comissivo x omissivo (responsabilidade subjetiva na omissão genérica)",
          "Direito de regresso e denunciação da lide",
        ],
      },
      {
        id: "adm-8",
        t: "Regime jurídico-administrativo e princípios expressos e implícitos",
        p: 4,
        m: "aula",
        f: [
          "Supremacia do interesse público e indisponibilidade",
          "Princípios implícitos: razoabilidade, proporcionalidade, autotutela, segurança jurídica",
        ],
      },
      {
        id: "adm-9",
        t: "Lei de Improbidade Administrativa (Lei 8.429/1992)",
        p: 3,
        m: "lei",
        f: [
          "Atos que importam enriquecimento ilícito, prejuízo ao erário e violação de princípios",
          "Exigência de dolo específico após a Lei 14.230/2021",
          "Sanções e prazos prescricionais",
        ],
      },
    ],
  },
  {
    id: "medleg",
    nome: "Medicina Legal",
    curto: "Medicina Legal",
    cor: "#ffe9f0",
    corForte: "#c9457f",
    peso: 4,
    topicos: [
      {
        id: "medleg-1",
        t: "Conceito, divisões, corpo de delito, perícia e peritos",
        p: 3,
        m: "aula",
        f: [
          "Corpo de delito direto x indireto; exame complementar",
          "Perito oficial e perito nomeado (art. 159 CPP)",
        ],
      },
      {
        id: "medleg-2",
        t: "Documentos médico-legais",
        p: 3,
        m: "pdf",
        f: ["Laudo, auto, parecer, atestado e relatório", "Partes do laudo pericial"],
      },
      {
        id: "medleg-3",
        t: "Identidade, identificação e principais métodos",
        p: 4,
        m: "aula",
        f: [
          "Requisitos técnicos da identificação (unicidade, imutabilidade, praticabilidade, classificabilidade)",
          "Datiloscopia: tipos fundamentais de Vucetich e a fórmula datiloscópica",
          "Antropologia forense, odontologia legal e DNA",
        ],
      },
      {
        id: "medleg-4",
        t: "Traumatologia: lesões por ação contundente, cortante, perfurante e perfurocortante",
        p: 5,
        m: "aula",
        f: [
          "Equimose, hematoma, escoriação, rubefação — cronologia da equimose (espectro de Legrand du Saulle)",
          "Feridas incisas x perfuroincisas x contusas (características diferenciais)",
          "Energias de ordem mecânica",
        ],
      },
      {
        id: "medleg-5",
        t: "Lesões e mortes por projéteis de arma de fogo",
        p: 5,
        m: "aula",
        f: [
          "Orifício de entrada x saída: orla de escoriação, enxugo, tatuagem, esfumaçamento",
          "Sinais de Werkgärtner, Benassi, Bonnet, câmara de mina de Hoffmann",
          "Distância do disparo: tiro encostado, curta, média e longa distância",
        ],
      },
      {
        id: "medleg-6",
        t: "Tanatologia: conceito e diagnóstico da morte, fenômenos cadavéricos",
        p: 5,
        m: "aula",
        f: [
          "Fenômenos abióticos imediatos e consecutivos",
          "Algor, livor e rigor mortis — cronologia (essencial)",
          "Fenômenos transformativos: putrefação (4 fases), maceração, mumificação, saponificação",
        ],
      },
      {
        id: "medleg-7",
        t: "Cronotanatognose, comoriência, exumação, causa jurídica da morte, morte súbita e suspeita",
        p: 4,
        m: "pdf",
        f: [
          "Estimativa do tempo de morte pelos fenômenos cadavéricos e entomologia forense",
          "Comoriência x premoriência",
          "Causa jurídica: morte natural, violenta (homicida, suicida, acidental) e suspeita",
        ],
      },
      {
        id: "medleg-8",
        t: "Asfixiologia forense",
        p: 5,
        m: "aula",
        f: [
          "Enforcamento, estrangulamento e esganadura — diferenças no sulco",
          "Sufocação direta/indireta, afogamento (cogumelo de espuma), soterramento",
          "Sinais gerais das asfixias (manchas de Tardieu, cianose)",
        ],
      },
      {
        id: "medleg-9",
        t: "Sexologia forense e crimes contra a dignidade sexual",
        p: 4,
        m: "pdf",
        f: [
          "Conjunção carnal, vestígios e a coleta/preservação de material",
          "Himen: tipos, rotura recente x antiga, himen complacente",
          "Kit de coleta em violência sexual e a cadeia de custódia",
        ],
      },
      {
        id: "medleg-10",
        t: "Energias térmica, elétrica, barométrica e química; toxicomanias e embriaguez",
        p: 3,
        m: "pdf",
        f: [
          "Queimaduras: classificação de Hoffmann; zonas de Jellinek na eletricidade",
          "Fases da embriaguez alcoólica",
          "Sinais de Lichtenberg e marcas elétricas",
        ],
      },
      {
        id: "medleg-11",
        t: "Local de crime, cadeia de custódia, vestígios e evidências",
        p: 4,
        m: "lei",
        f: [
          "Etapas da cadeia de custódia (arts. 158-A a 158-F CPP)",
          "Preservação do local e as atribuições da autoridade policial",
          "Vestígio, evidência e indício",
        ],
      },
      {
        id: "medleg-12",
        t: "Psicopatologia forense, imputabilidade e aspectos médico-legais do aborto e infanticídio",
        p: 3,
        m: "pdf",
        f: [
          "Doença mental, desenvolvimento incompleto, emoção e paixão",
          "Docimasias (hidrostática de Galeno) e a prova de vida extrauterina",
          "Aborto: espécies e o exame pericial",
        ],
      },
      {
        id: "medleg-13",
        t: "Violência doméstica, contra mulheres, crianças, idosos e PcD; testemunho, confissão e acareação",
        p: 3,
        m: "pdf",
        f: [
          "Síndrome do bebê sacudido e maus-tratos",
          "Lesões de defesa e lesões autoinfligidas",
          "Aspectos médico-legais do falso testemunho",
        ],
      },
    ],
  },
  {
    id: "leggeral",
    nome: "Legislação Geral",
    curto: "Leg. Geral",
    cor: "#e8f4ff",
    corForte: "#2a80c4",
    peso: 4,
    topicos: [
      {
        id: "leggeral-1",
        t: "Lei Estadual 11.370/2009 — Lei Orgânica da Polícia Civil da Bahia",
        p: 5,
        m: "lei",
        f: [
          "Estrutura da PC-BA e as atribuições do investigador",
          "Carreira, ingresso, promoção e regime disciplinar próprio",
          "Deveres, proibições e transgressões disciplinares",
        ],
      },
      {
        id: "leggeral-2",
        t: "Lei Estadual 6.677/1994 — Estatuto do Servidor Público da Bahia (parte 1)",
        p: 5,
        m: "lei",
        f: [
          "Provimento, posse, exercício, estágio probatório",
          "Vacância, remoção, redistribuição e substituição",
          "Direitos e vantagens: vencimento, adicionais, gratificações",
        ],
      },
      {
        id: "leggeral-3",
        t: "Lei Estadual 6.677/1994 — Estatuto do Servidor (parte 2: deveres e processo disciplinar)",
        p: 5,
        m: "lei",
        f: [
          "Deveres e proibições",
          "Penalidades disciplinares e prazos prescricionais",
          "Processo administrativo disciplinar e sindicância",
        ],
      },
      {
        id: "leggeral-4",
        t: "Lei Estadual 12.209/2011 — Processo administrativo no Estado da Bahia",
        p: 3,
        m: "lei",
        f: ["Princípios do processo administrativo estadual", "Prazos, recursos e nulidades"],
      },
      {
        id: "leggeral-5",
        t: "Lei Estadual 14.634/2023 — Licitações e contratos na Bahia",
        p: 2,
        m: "lei",
        f: ["Diferenças em relação à Lei 14.133/2021", "Modalidades e procedimentos estaduais"],
      },
      {
        id: "leggeral-6",
        t: "Lei Federal 8.906/1994 — Estatuto da Advocacia",
        p: 3,
        m: "lei",
        f: [
          "Prerrogativas do advogado relevantes à atividade policial (art. 7º)",
          "Acesso a autos de inquérito e a Súmula Vinculante 14",
          "Prisão em flagrante de advogado",
        ],
      },
    ],
  },
  {
    id: "igual",
    nome: "Promoção da Igualdade Racial e de Gênero",
    curto: "Igualdade",
    cor: "#f0eaff",
    corForte: "#6d4bd0",
    peso: 4,
    topicos: [
      {
        id: "igual-1",
        t: "CF/88 (arts. 1º, 3º, 4º e 5º) e Constituição da Bahia (Cap. XXIII — Do Negro)",
        p: 4,
        m: "lei",
        f: [
          "Fundamentos e objetivos da República e a dignidade da pessoa humana",
          "Repúdio ao racismo como princípio das relações internacionais",
          "Dispositivos específicos da Constituição baiana sobre o negro",
        ],
      },
      {
        id: "igual-2",
        t: "Lei 12.288/2010 — Estatuto da Igualdade Racial",
        p: 5,
        m: "lei",
        f: [
          "Conceitos do art. 1º (discriminação racial, desigualdade de gênero e raça, população negra)",
          "Direitos fundamentais assegurados (saúde, educação, cultura, trabalho)",
          "Sistema Nacional de Promoção da Igualdade Racial (SINAPIR)",
        ],
      },
      {
        id: "igual-3",
        t: "Lei 7.716/1989, art. 140 do CP e Lei 7.437/1985 (Lei Caó)",
        p: 5,
        m: "lei",
        f: [
          "Crimes de racismo em espécie e a injúria racial após a Lei 14.532/2023",
          "Imprescritibilidade e inafiançabilidade",
          "Racismo recreativo e o entendimento do STF (ADO 26)",
        ],
      },
      {
        id: "igual-4",
        t: "Lei 11.340/2006 e Decreto 4.377/2002 (CEDAW) — perspectiva de gênero",
        p: 4,
        m: "lei",
        f: [
          "Convenção sobre eliminação de todas as formas de discriminação contra a mulher",
          "Atendimento policial humanizado à mulher em situação de violência",
        ],
      },
      {
        id: "igual-5",
        t: "Lei 9.455/1997, Lei 2.889/1956 (Genocídio) e Decreto 65.810/1969",
        p: 3,
        m: "lei",
        f: [
          "Convenção internacional sobre eliminação da discriminação racial",
          "Genocídio: condutas típicas",
          "Tortura com motivação discriminatória",
        ],
      },
      {
        id: "igual-6",
        t: "Legislação estadual e federal complementar (13.182/2014, 14.521/2022, 10.678/2003, 13.341/2016, 14.600/2023, Dec. 4.886/03)",
        p: 3,
        m: "lei",
        f: [
          "Estatuto da Igualdade Racial e Combate à Intolerância Religiosa da Bahia",
          "Política Nacional de Promoção da Igualdade Racial",
          "Jurisprudência dos tribunais superiores sobre cotas e ações afirmativas",
        ],
      },
    ],
  },
  {
    id: "rlm",
    nome: "Raciocínio Lógico",
    curto: "Raciocínio Lógico",
    cor: "#e0f7fa",
    corForte: "#1f97ab",
    peso: 4,
    topicos: [
      {
        id: "rlm-1",
        t: "Lógica sentencial: proposições, conectivos e tabelas-verdade",
        p: 5,
        m: "aula",
        f: [
          "Valores lógicos dos conectivos (principalmente o condicional)",
          "Número de linhas da tabela-verdade (2^n)",
          "Tautologia, contradição e contingência",
        ],
      },
      {
        id: "rlm-2",
        t: "Equivalências lógicas e Leis de Morgan",
        p: 5,
        m: "pdf",
        f: [
          "Equivalências do condicional (contrapositiva e disjunção)",
          "Negação de proposições compostas e de quantificadores",
          "Leis de Morgan aplicadas em questões de negação",
        ],
      },
      {
        id: "rlm-3",
        t: "Lógica de argumentação: analogias, inferências, deduções e conclusões",
        p: 4,
        m: "exercicios",
        f: [
          "Validade x veracidade do argumento",
          "Regras de inferência (modus ponens, modus tollens, silogismo)",
        ],
      },
      {
        id: "rlm-4",
        t: "Diagramas lógicos, operações com conjuntos e lógica de primeira ordem",
        p: 4,
        m: "exercicios",
        f: [
          "Diagramas de Venn com 2 e 3 conjuntos",
          "Quantificadores universal e existencial",
          "Problemas com 'todo', 'algum', 'nenhum'",
        ],
      },
      {
        id: "rlm-5",
        t: "Razões, proporções, divisão proporcional, regra de três e porcentagem",
        p: 5,
        m: "exercicios",
        f: [
          "Regra de três composta (direta x inversa)",
          "Porcentagem: aumentos e descontos sucessivos",
          "Divisão proporcional direta e inversa",
        ],
      },
      {
        id: "rlm-6",
        t: "Conjuntos numéricos, sistema legal de medidas, equações e inequações de 1º e 2º graus",
        p: 3,
        m: "pdf",
        f: ["Operações com racionais e reais", "Conversão de unidades", "Bhaskara e análise do discriminante"],
      },
      {
        id: "rlm-7",
        t: "Sistemas lineares, funções e gráficos",
        p: 3,
        m: "pdf",
        f: ["Resolução por substituição e escalonamento", "Função afim e quadrática: leitura de gráficos"],
      },
      {
        id: "rlm-8",
        t: "Princípios de contagem, probabilidade e progressões",
        p: 4,
        m: "exercicios",
        f: [
          "Princípio fundamental da contagem, arranjo, permutação e combinação",
          "Probabilidade da união e condicional",
          "PA e PG: termo geral e soma",
        ],
      },
      {
        id: "rlm-9",
        t: "Raciocínio lógico com problemas aritméticos, geométricos e matriciais",
        p: 3,
        m: "exercicios",
        f: ["Sequências lógicas de números, figuras e letras", "Problemas de associação lógica (verdade/mentira)"],
      },
    ],
  },
  {
    id: "info",
    nome: "Informática",
    curto: "Informática",
    cor: "#e3f2ff",
    corForte: "#2f7fd1",
    peso: 3,
    topicos: [
      {
        id: "info-1",
        t: "Windows 11: fundamentos, janelas, área de trabalho e configurações",
        p: 3,
        m: "pdf",
        f: ["Atalhos de teclado do Windows", "Barra de tarefas, menu iniciar e configurações básicas"],
      },
      {
        id: "info-2",
        t: "Windows Explorer: pastas, arquivos, localização, cópia e exclusão",
        p: 3,
        m: "pdf",
        f: ["Diferença entre mover e copiar (mesmo disco x discos diferentes)", "Lixeira e recuperação de arquivos"],
      },
      {
        id: "info-3",
        t: "Word (Office 365): formatação, estilos, cabeçalhos e configuração de página",
        p: 3,
        m: "pdf",
        f: ["Guias e grupos da faixa de opções", "Atalhos e recursos de formatação", "Estilos e sumário automático"],
      },
      {
        id: "info-4",
        t: "Excel: fórmulas, referências e principais funções",
        p: 5,
        m: "exercicios",
        f: [
          "Referência relativa, absoluta ($) e mista — cai sempre",
          "SE, SOMASE, CONT.SE, PROCV, ÍNDICE/CORRESP, MÉDIA, MÁXIMO, MÍNIMO",
          "Funções de data e texto; erros (#REF!, #DIV/0!, #N/D)",
        ],
      },
      {
        id: "info-5",
        t: "Excel: formatação, edição, classificação de dados e gráficos",
        p: 3,
        m: "pdf",
        f: ["Classificação e filtros", "Tipos de gráficos e quando usar"],
      },
      {
        id: "info-6",
        t: "PowerPoint: apresentações, objetos, slide mestre e integração",
        p: 2,
        m: "pdf",
        f: ["Modos de exibição", "Slide mestre e transições"],
      },
      {
        id: "info-7",
        t: "Redes, Internet, Intranet, navegadores e computação em nuvem",
        p: 4,
        m: "pdf",
        f: [
          "Intranet x extranet x internet",
          "Navegação anônima, cookies, cache e atalhos dos navegadores",
          "Modelos de nuvem: IaaS, PaaS, SaaS",
        ],
      },
      {
        id: "info-8",
        t: "Deep Web, Dark Web e correio eletrônico",
        p: 4,
        m: "pdf",
        f: [
          "Surface x deep x dark web; rede TOR e criptomoedas (tema policial)",
          "Protocolos de e-mail: SMTP, POP3, IMAP; campos Cc e Cco",
        ],
      },
      {
        id: "info-9",
        t: "Segurança da informação: malwares, antivírus, criptografia e backup",
        p: 5,
        m: "pdf",
        f: [
          "Pilares: confidencialidade, integridade, disponibilidade, autenticidade",
          "Vírus, worm, trojan, ransomware, spyware, keylogger, phishing",
          "Criptografia simétrica x assimétrica, certificado e assinatura digital",
          "Tipos de backup: completo, incremental e diferencial",
        ],
      },
    ],
  },
  {
    id: "atual",
    nome: "Atualidades",
    curto: "Atualidades",
    cor: "#fdf1dd",
    corForte: "#c98a1e",
    peso: 3,
    topicos: [
      {
        id: "atual-1",
        t: "Segurança pública, violência e temas policiais na Bahia e no Brasil",
        p: 4,
        m: "pdf",
        f: [
          "Indicadores de criminalidade na Bahia e políticas de segurança do estado",
          "Facções, crime organizado e operações recentes",
          "Anuário Brasileiro de Segurança Pública — dados principais",
        ],
      },
      {
        id: "atual-2",
        t: "Atualidades internacionais: conflitos geopolíticos e relações internacionais",
        p: 3,
        m: "pdf",
        f: ["Principais conflitos em curso", "Blocos econômicos, BRICS e organismos internacionais"],
      },
      {
        id: "atual-3",
        t: "Direitos humanos, democracia, cidadania e desigualdades sociais",
        p: 3,
        m: "pdf",
        f: ["Políticas afirmativas", "Indicadores sociais brasileiros e baianos"],
      },
      {
        id: "atual-4",
        t: "Meio ambiente, mudanças climáticas, saúde, educação, trabalho e economia",
        p: 2,
        m: "pdf",
        f: ["COP e acordos climáticos", "Reformas e indicadores econômicos recentes"],
      },
      {
        id: "atual-5",
        t: "Tecnologia da informação, cultura, problemas urbanos e comunicação",
        p: 2,
        m: "pdf",
        f: ["IA, LGPD e crimes cibernéticos", "Comunicação: conceitos, efeitos e implicações sociais"],
      },
    ],
  },
  {
    id: "cont",
    nome: "Noções de Contabilidade",
    curto: "Contabilidade",
    cor: "#eaf6e9",
    corForte: "#4f9a4a",
    peso: 2,
    topicos: [
      {
        id: "cont-1",
        t: "Fundamentos: conceito, objeto, usuários, princípios e estrutura conceitual",
        p: 3,
        m: "aula",
        f: [
          "Características qualitativas fundamentais e de melhoria",
          "Usuários internos x externos",
          "Regime de competência x caixa",
        ],
      },
      {
        id: "cont-2",
        t: "Patrimônio: ativo, passivo, PL, equação fundamental e situação líquida",
        p: 4,
        m: "aula",
        f: [
          "Equação: A = P + PL e as situações líquidas possíveis",
          "Origens x aplicações de recursos",
          "Representação gráfica do patrimônio",
        ],
      },
      {
        id: "cont-3",
        t: "Atos e fatos administrativos: permutativos, modificativos e mistos",
        p: 4,
        m: "exercicios",
        f: ["Identificar o efeito no PL", "Fatos mistos aumentativos e diminutivos"],
      },
      {
        id: "cont-4",
        t: "Contas contábeis, plano de contas, débito, crédito e funcionamento",
        p: 4,
        m: "aula",
        f: [
          "Método das partidas dobradas",
          "Contas patrimoniais x de resultado e a natureza do saldo",
          "Codificação e elenco de contas",
        ],
      },
      {
        id: "cont-5",
        t: "Escrituração: lançamentos, fórmulas, livros obrigatórios e retificações",
        p: 4,
        m: "exercicios",
        f: [
          "As 4 fórmulas de lançamento",
          "Estorno, transferência e complementação",
          "Livro Diário e Razão",
        ],
      },
      {
        id: "cont-6",
        t: "Operações contábeis diversas: estoques, CMV, depreciação, folha e tributos",
        p: 3,
        m: "exercicios",
        f: [
          "Fórmula do CMV = EI + C - EF",
          "Depreciação, amortização e exaustão",
          "Deduções da receita bruta",
        ],
      },
      {
        id: "cont-7",
        t: "Balancete de verificação, análise e conciliação contábil",
        p: 3,
        m: "exercicios",
        f: ["Estrutura do balancete", "Conciliação bancária e ajustes"],
      },
      {
        id: "cont-8",
        t: "Demonstrações contábeis: Balanço Patrimonial, DRE e notas explicativas",
        p: 4,
        m: "aula",
        f: [
          "Estrutura e classificação de ativos e passivos (circulante x não circulante)",
          "Estrutura da DRE até o lucro líquido",
          "Notas explicativas: finalidade",
        ],
      },
      {
        id: "cont-9",
        t: "Matemática financeira aplicada, finanças, orçamento e tributos",
        p: 2,
        m: "exercicios",
        f: [
          "Juros simples x compostos; taxas equivalentes e proporcionais",
          "Fluxo de caixa e capital de giro",
          "Espécies tributárias e impactos nas empresas",
        ],
      },
    ],
  },
  {
    id: "estat",
    nome: "Estatística",
    curto: "Estatística",
    cor: "#e7f0fb",
    corForte: "#4a6fa5",
    peso: 2,
    topicos: [
      {
        id: "estat-1",
        t: "Estatística descritiva: tabelas, gráficos e medidas de posição",
        p: 4,
        m: "exercicios",
        f: [
          "Média, mediana e moda (inclusive em dados agrupados)",
          "Distribuição de frequências e histograma",
          "Quartis, decis e percentis",
        ],
      },
      {
        id: "estat-2",
        t: "Medidas de dispersão, assimetria e curtose",
        p: 3,
        m: "exercicios",
        f: ["Variância, desvio padrão e coeficiente de variação", "Assimetria positiva/negativa e curtose"],
      },
      {
        id: "estat-3",
        t: "Probabilidade: definições, axiomas, probabilidade condicional e independência",
        p: 4,
        m: "exercicios",
        f: ["Regra da adição e da multiplicação", "Eventos independentes x mutuamente exclusivos"],
      },
      {
        id: "estat-4",
        t: "Teorema de Bayes",
        p: 3,
        m: "exercicios",
        f: ["Aplicação da fórmula em problemas de diagnóstico", "Probabilidade total"],
      },
      {
        id: "estat-5",
        t: "Técnicas de amostragem e tamanho amostral",
        p: 3,
        m: "pdf",
        f: [
          "Aleatória simples, estratificada, sistemática e por conglomerados",
          "Amostragem probabilística x não probabilística",
        ],
      },
    ],
  },
];

export const TODOS_TOPICOS = DISCIPLINAS.flatMap((d) =>
  d.topicos.map((t) => ({ ...t, disciplinaId: d.id, disciplinaNome: d.nome })),
);

export function getDisciplina(id: string) {
  return DISCIPLINAS.find((d) => d.id === id);
}

export function getTopico(id: string) {
  return TODOS_TOPICOS.find((t) => t.id === id);
}
