// Algoritmo de repetição espaçada SM-2 (o mesmo usado pelo Anki)
export interface Card {
  id: string;
  frente: string;
  verso: string;
  baralho: string;
  ease: number;
  intervalo: number;
  repeticoes: number;
  proxima: string; // yyyy-mm-dd
  lapsos: number;
}

export function novoCard(frente: string, verso: string, baralho: string, hoje: string): Card {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    frente,
    verso,
    baralho,
    ease: 2.5,
    intervalo: 0,
    repeticoes: 0,
    proxima: hoje,
    lapsos: 0,
  };
}

/** qualidade: 0 = errei, 3 = difícil, 4 = bom, 5 = fácil */
export function revisar(card: Card, qualidade: 0 | 3 | 4 | 5, hoje: string): Card {
  let { ease, intervalo, repeticoes, lapsos } = card;
  if (qualidade < 3) {
    repeticoes = 0;
    intervalo = 1;
    lapsos += 1;
  } else {
    repeticoes += 1;
    if (repeticoes === 1) intervalo = 1;
    else if (repeticoes === 2) intervalo = 6;
    else intervalo = Math.round(intervalo * ease);
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - qualidade) * (0.08 + (5 - qualidade) * 0.02)));
  const d = new Date(hoje + "T00:00:00");
  d.setDate(d.getDate() + intervalo);
  return {
    ...card,
    ease,
    intervalo,
    repeticoes,
    lapsos,
    proxima: d.toISOString().slice(0, 10),
  };
}
