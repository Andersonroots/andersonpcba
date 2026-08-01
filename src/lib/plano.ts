import { DISCIPLINAS, TODOS_TOPICOS, type Modo } from "@/data/edital";
import { DISCURSIVAS } from "@/data/motivacao";

export type TipoSessao = "teoria" | "revisao" | "questoes" | "leiseca" | "simulado" | "revisaoSemanal";

export interface Sessao {
  id: string;
  topicoId: string;
  disciplinaId: string;
  tipo: TipoSessao;
  minutos: number;
  modo: Modo;
  passe: number;
}

export interface Slot extends Sessao {
  titulo: string;
  disciplinaNome: string;
  peso: number;
}

export interface Dia {
  data: string; // yyyy-mm-dd
  diaSemana: number;
  tipo: "semana" | "sabado" | "domingo";
  capacidade: number;
  slots: Slot[];
  discursiva: string;
}

export const iso = (d: Date) => {
  const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return x.toISOString().slice(0, 10);
};

export const parseIso = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s: string, n: number) => {
  const d = parseIso(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const hojeIso = () => iso(new Date());

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const PASSES: Record<number, { tipo: TipoSessao; min: number }[]> = {
  5: [
    { tipo: "teoria", min: 90 },
    { tipo: "revisao", min: 45 },
    { tipo: "questoes", min: 60 },
  ],
  4: [
    { tipo: "teoria", min: 90 },
    { tipo: "revisao", min: 30 },
    { tipo: "questoes", min: 60 },
  ],
  3: [
    { tipo: "teoria", min: 60 },
    { tipo: "questoes", min: 45 },
  ],
  2: [
    { tipo: "teoria", min: 60 },
    { tipo: "revisao", min: 30 },
  ],
  1: [{ tipo: "teoria", min: 45 }],
};

/** Lista mestra ordenada de todas as sessões do edital (teoria + revisões espaçadas + questões). */
export function construirSessoes(): Sessao[] {
  const novos: Sessao[] = [];
  // ordena tópicos por peso desc, alternando disciplinas (round-robin ponderado)
  const porDisc = DISCIPLINAS.map((d) => ({
    id: d.id,
    peso: d.peso,
    fila: [...d.topicos].sort((a, b) => b.p - a.p),
  })).sort((a, b) => b.peso - a.peso);

  let restante = TODOS_TOPICOS.length;
  const contador: Record<string, number> = {};
  porDisc.forEach((d) => (contador[d.id] = 0));
  while (restante > 0) {
    for (const d of porDisc) {
      // disciplinas mais pesadas entram mais vezes por rodada
      const vezes = d.peso >= 5 ? 2 : 1;
      for (let v = 0; v < vezes; v++) {
        const t = d.fila.shift();
        if (!t) break;
        restante--;
        const passes = PASSES[t.p];
        novos.push({
          id: `${t.id}::0`,
          topicoId: t.id,
          disciplinaId: d.id,
          tipo: passes[0].tipo,
          minutos: passes[0].min,
          modo: t.m,
          passe: 0,
        });
      }
    }
  }

  // agora intercala as revisões espaçadas (7 e 21 dias ≈ 21 e 63 posições)
  const saida: Sessao[] = [];
  const pendentes: { sessao: Sessao; apartirDe: number }[] = [];
  let i = 0;
  let idx = 0;
  while (idx < novos.length || pendentes.length > 0) {
    const pronta = pendentes.findIndex((p) => p.apartirDe <= i);
    let escolhida: Sessao | undefined;
    if (pronta >= 0 && (i % 3 === 2 || idx >= novos.length)) {
      escolhida = pendentes.splice(pronta, 1)[0].sessao;
    } else if (idx < novos.length) {
      escolhida = novos[idx++];
    } else if (pendentes.length) {
      escolhida = pendentes.shift()!.sessao;
    }
    if (!escolhida) break;
    saida.push(escolhida);
    const topico = TODOS_TOPICOS.find((t) => t.id === escolhida!.topicoId)!;
    const passes = PASSES[topico.p];
    const prox = escolhida.passe + 1;
    if (prox < passes.length) {
      pendentes.push({
        sessao: {
          id: `${topico.id}::${prox}`,
          topicoId: topico.id,
          disciplinaId: escolhida.disciplinaId,
          tipo: passes[prox].tipo,
          minutos: passes[prox].min,
          modo: passes[prox].tipo === "questoes" ? "exercicios" : topico.m,
          passe: prox,
        },
        apartirDe: i + (prox === 1 ? 21 : 60),
      });
    }
    i++;
  }
  return saida;
}

export const SESSOES_MESTRE = construirSessoes();

function enriquecer(s: Sessao): Slot {
  const t = TODOS_TOPICOS.find((x) => x.id === s.topicoId)!;
  return {
    ...s,
    titulo: t.t,
    disciplinaNome: t.disciplinaNome,
    peso: t.p,
  };
}

function slotFixo(id: string, tipo: TipoSessao, titulo: string, minutos: number, data: string): Slot {
  return {
    id: `${id}@${data}`,
    topicoId: "",
    disciplinaId: "geral",
    tipo,
    minutos,
    modo: "exercicios",
    passe: 0,
    titulo,
    disciplinaNome: tipo === "simulado" ? "Simulado" : "Revisão",
    peso: 5,
  };
}

export interface ProgressoItem {
  feito: boolean;
  data: string;
}

export interface PlanoInput {
  inicio: string;
  progresso: Record<string, ProgressoItem>;
  pins: Record<string, string>;
  hoje: string;
  dias?: number;
}

/**
 * Gera o cronograma completo.
 * - Dias passados mostram exatamente o que foi concluído naquele dia.
 * - A partir de hoje o plano é recalculado com o que sobrou → se você adianta
 *   as metas, os dias seguintes são puxados automaticamente.
 */
export function gerarPlano({ inicio, progresso, pins, hoje }: PlanoInput): Dia[] {
  const concluidosPorDia: Record<string, string[]> = {};
  const feitos = new Set<string>();
  Object.entries(progresso).forEach(([id, p]) => {
    if (!p.feito) return;
    feitos.add(id);
    (concluidosPorDia[p.data] ||= []).push(id);
  });

  const pool = SESSOES_MESTRE.filter((s) => !feitos.has(s.id));
  const pinPorData: Record<string, string[]> = {};
  Object.entries(pins).forEach(([slotId, data]) => {
    if (feitos.has(slotId)) return;
    (pinPorData[data] ||= []).push(slotId);
  });

  const dias: Dia[] = [];
  let cursor = inicio < hoje ? inicio : hoje;
  const inicioReal = inicio;
  cursor = inicioReal;
  let restantes = [...pool];
  let guarda = 0;

  const semanaCount: Record<string, Record<string, number>> = {};
  let ontemDiscs: string[] = [];

  while ((restantes.length > 0 || cursor <= hoje) && guarda < 600) {
    guarda++;
    const d = parseIso(cursor);
    const dow = d.getDay();
    const tipo: Dia["tipo"] = dow === 0 ? "domingo" : dow === 6 ? "sabado" : "semana";
    const capacidade = tipo === "semana" ? 180 : 240;
    const semanaKey = `${new Date(d.getTime() - ((dow + 6) % 7) * 86400000).toDateString()}`;
    semanaCount[semanaKey] ||= {};

    const slots: Slot[] = [];
    const passado = cursor < hoje;

    // metas já concluídas continuam visíveis no dia em que foram marcadas
    const concluidosDoDia: Slot[] = (concluidosPorDia[cursor] || [])
      .map((id) => {
        const s = SESSOES_MESTRE.find((x) => x.id === id);
        if (s) return enriquecer(s);
        if (id.includes("@")) {
          const [base] = id.split("@");
          if (base === "simulado")
            return slotFixo("simulado", "simulado", "Simulado completo — 60 questões (4h)", 180, cursor);
          if (base === "correcao")
            return slotFixo("correcao", "revisaoSemanal", "Correção do simulado + caderno de erros", 60, cursor);
          return slotFixo("revsem", "revisaoSemanal", "Revisão em questões das matérias da semana", 60, cursor);
        }
        return null;
      })
      .filter((x): x is Slot => !!x);

    if (passado) {
      slots.push(...concluidosDoDia);
    } else if (tipo === "domingo") {
      const sim = slotFixo("simulado", "simulado", "Simulado completo — 60 questões (4h)", 180, cursor);
      const corr = slotFixo("correcao", "revisaoSemanal", "Correção do simulado + caderno de erros", 60, cursor);
      slots.push(...concluidosDoDia);
      if (!feitos.has(sim.id)) slots.push(sim);
      if (!feitos.has(corr.id)) slots.push(corr);
    } else {
      let usados = 0;
      const discsHoje: string[] = [];
      const maxSlots = tipo === "semana" ? 3 : 4;

      // 0) metas já concluídas neste dia ocupam suas vagas
      concluidosDoDia.forEach((slot) => {
        slots.push(slot);
        usados += slot.minutos;
        discsHoje.push(slot.disciplinaId);
        semanaCount[semanaKey][slot.disciplinaId] = (semanaCount[semanaKey][slot.disciplinaId] || 0) + 1;
      });

      // 1) slots fixados manualmente (arrastados) nesta data
      (pinPorData[cursor] || []).forEach((id) => {
        const s = restantes.find((x) => x.id === id);
        if (!s) return;
        restantes = restantes.filter((x) => x.id !== id);
        const slot = enriquecer(s);
        slots.push(slot);
        usados += slot.minutos;
        discsHoje.push(slot.disciplinaId);
        semanaCount[semanaKey][slot.disciplinaId] = (semanaCount[semanaKey][slot.disciplinaId] || 0) + 1;
      });

      // 2) no sábado, sempre reservar uma revisão em questões da semana
      if (tipo === "sabado") {
        const rev = slotFixo("revsem", "revisaoSemanal", "Revisão em questões das matérias da semana", 60, cursor);
        if (!feitos.has(rev.id)) {
          slots.push(rev);
          usados += rev.minutos;
        }
      }

      let tentativa = 0;
      while (slots.length < maxSlots && usados < capacidade && tentativa < restantes.length) {
        const idx = restantes.findIndex((s, k) => {
          if (k < tentativa) return false;
          if (pins[s.id] && pins[s.id] !== cursor) return false;
          if (discsHoje.includes(s.disciplinaId)) return false;
          if (ontemDiscs.includes(s.disciplinaId)) return false;
          if ((semanaCount[semanaKey][s.disciplinaId] || 0) >= 3) return false;
          if (usados + s.minutos > capacidade + 15) return false;
          // alterna pesado/leve: evita dois "pesados" (90min) seguidos no mesmo dia
          const pesadosHoje = slots.filter((x) => x.minutos >= 90).length;
          if (s.minutos >= 90 && pesadosHoje >= 1 && slots.length > 0) return false;
          return true;
        });
        if (idx < 0) {
          // relaxa a regra do dia anterior se travou
          const idx2 = restantes.findIndex(
            (s) =>
              !discsHoje.includes(s.disciplinaId) &&
              (!pins[s.id] || pins[s.id] === cursor) &&
              usados + s.minutos <= capacidade + 30,
          );
          if (idx2 < 0) break;
          const s = restantes.splice(idx2, 1)[0];
          const slot = enriquecer(s);
          slots.push(slot);
          usados += slot.minutos;
          discsHoje.push(slot.disciplinaId);
          semanaCount[semanaKey][slot.disciplinaId] = (semanaCount[semanaKey][slot.disciplinaId] || 0) + 1;
          continue;
        }
        const s = restantes.splice(idx, 1)[0];
        const slot = enriquecer(s);
        slots.push(slot);
        usados += slot.minutos;
        discsHoje.push(slot.disciplinaId);
        semanaCount[semanaKey][slot.disciplinaId] = (semanaCount[semanaKey][slot.disciplinaId] || 0) + 1;
      }
      ontemDiscs = discsHoje;
    }

    dias.push({
      data: cursor,
      diaSemana: dow,
      tipo,
      capacidade,
      slots,
      discursiva: DISCURSIVAS[hash(cursor) % DISCURSIVAS.length],
    });

    cursor = addDays(cursor, 1);
    if (cursor > hoje && restantes.length === 0) break;
  }

  return dias;
}

export const NOMES_DIA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const NOMES_MES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function formatarData(dataIso: string) {
  const d = parseIso(dataIso);
  return `${NOMES_DIA[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")} de ${NOMES_MES[d.getMonth()]}`;
}

export const TIPO_LABEL: Record<TipoSessao, string> = {
  teoria: "Teoria",
  revisao: "Revisão ativa",
  questoes: "Bateria de questões",
  leiseca: "Lei seca",
  simulado: "Simulado",
  revisaoSemanal: "Revisão",
};
