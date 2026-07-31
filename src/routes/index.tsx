import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Flame, Target, Clock, CheckCircle2, TrendingUp, Quote } from "lucide-react";
import { useStore } from "@/lib/store";
import { Barra, Cartao, Metrica, Titulo } from "@/components/ui-app";
import { DISCIPLINAS, getDisciplina, selo } from "@/data/edital";
import { SESSOES_MESTRE, TIPO_LABEL, addDays, formatarData } from "@/lib/plano";
import { VERSICULOS } from "@/data/motivacao";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — Anderson Investigador PCBA" },
      {
        name: "description",
        content:
          "Painel de estudos para o concurso de Investigador da Polícia Civil da Bahia: metas do dia, sequência de estudos, progresso do edital e estatísticas.",
      },
      { property: "og:title", content: "Home — Anderson Investigador PCBA" },
      {
        property: "og:description",
        content: "Painel de estudos para o concurso de Investigador da Polícia Civil da Bahia: metas do dia, sequência de estudos, progresso do edital e estatísticas.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { estado, plano, hoje } = useStore();

  const diaHoje = plano.find((d) => d.data === hoje);
  const proximos = plano.filter((d) => d.data > hoje).slice(0, 3);

  const stats = useMemo(() => {
    const feitos = Object.entries(estado.progresso).filter(([, p]) => p.feito);
    const minutos = feitos.reduce((acc, [id]) => {
      const s = SESSOES_MESTRE.find((x) => x.id === id);
      return acc + (s?.minutos ?? 60);
    }, 0);
    const topicosEstudados = new Set(
      feitos.map(([id]) => SESSOES_MESTRE.find((x) => x.id === id)?.topicoId).filter(Boolean),
    ).size;
    const totalTopicos = DISCIPLINAS.reduce((a, d) => a + d.topicos.length, 0);
    const acertos = estado.questoes.reduce((a, q) => a + q.acertos, 0);
    const erros = estado.questoes.reduce((a, q) => a + q.erros, 0);
    const total = acertos + erros;

    // sequência de dias estudados sem parar
    const dias = new Set(feitos.map(([, p]) => p.data));
    let seq = 0;
    let cursor = dias.has(hoje) ? hoje : addDays(hoje, -1);
    while (dias.has(cursor)) {
      seq++;
      cursor = addDays(cursor, -1);
    }

    return {
      minutos,
      topicosEstudados,
      totalTopicos,
      acertos,
      erros,
      total,
      desempenho: total ? Math.round((acertos / total) * 100) : 0,
      seq,
      sessoesFeitas: feitos.length,
      totalSessoes: SESSOES_MESTRE.length,
    };
  }, [estado, hoje]);

  const versiculo = useMemo(() => {
    const n = new Date(hoje).getDate() + new Date(hoje).getMonth() * 31;
    return VERSICULOS[n % VERSICULOS.length];
  }, [hoje]);

  const feitosHoje = diaHoje?.slots.filter((s) => estado.progresso[s.id]?.feito).length ?? 0;
  const totalHoje = diaHoje?.slots.length ?? 0;
  const pctHoje = totalHoje ? Math.round((feitosHoje / totalHoje) * 100) : 0;
  const fim = plano.length ? plano[plano.length - 1].data : hoje;

  return (
    <div className="space-y-5">
      <Titulo sub="Foco total: 500 vagas, prova em 06/12/2026. Um dia de cada vez.">
        Bom estudo, Anderson 👊
      </Titulo>

      <Cartao className="border-l-4" cor="var(--color-primary)">
        <div className="flex gap-3">
          <Quote className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-[15px] font-medium italic">“{versiculo.texto}”</p>
            <p className="mt-1 text-xs font-semibold text-primary">{versiculo.ref}</p>
          </div>
        </div>
      </Cartao>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Cartao>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-warning/20 p-2">
              <Flame className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.seq}</p>
              <p className="text-[11px] text-muted-foreground">dias sem parar</p>
            </div>
          </div>
        </Cartao>
        <Cartao>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/15 p-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.floor(stats.minutos / 60)}h{String(stats.minutos % 60).padStart(2, "0")}
              </p>
              <p className="text-[11px] text-muted-foreground">horas de estudo</p>
            </div>
          </div>
        </Cartao>
        <Cartao>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-chart-2/15 p-2">
              <CheckCircle2 className="h-5 w-5" style={{ color: "var(--color-chart-2)" }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-[11px] text-muted-foreground">questões resolvidas</p>
            </div>
          </div>
        </Cartao>
        <Cartao>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-chart-4/15 p-2">
              <TrendingUp className="h-5 w-5" style={{ color: "var(--color-chart-4)" }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.desempenho}%</p>
              <p className="text-[11px] text-muted-foreground">desempenho</p>
            </div>
          </div>
        </Cartao>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Cartao className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold">Metas de hoje</h3>
              <p className="text-xs text-muted-foreground">{formatarData(hoje)}</p>
            </div>
            <Link to="/cronograma" className="text-xs font-semibold text-primary">
              abrir cronograma →
            </Link>
          </div>
          <Barra valor={pctHoje} />
          <p className="mt-1 text-xs text-muted-foreground">
            {feitosHoje} de {totalHoje} metas concluídas ({pctHoje}%)
          </p>
          <div className="mt-4 space-y-2">
            {diaHoje?.slots.length ? (
              diaHoje.slots.map((s) => {
                const d = getDisciplina(s.disciplinaId);
                const feito = estado.progresso[s.id]?.feito;
                return (
                  <div
                    key={s.id}
                    className="rounded-xl p-3"
                    style={{
                      background: d?.cor ?? "var(--color-muted)",
                      borderLeft: `4px solid ${d?.corForte ?? "var(--color-primary)"}`,
                      opacity: feito ? 0.55 : 1,
                    }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: d?.corForte }}>
                      {d?.curto ?? s.disciplinaNome} · {TIPO_LABEL[s.tipo]} · {s.minutos}min {selo(s.peso)}
                    </p>
                    <p className="text-sm font-medium text-neutral-800">{s.titulo}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Nada programado — aproveite para revisar flashcards.</p>
            )}
          </div>
          {diaHoje && (
            <div className="mt-4 rounded-xl border border-dashed border-border p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Sugestão de discursiva de hoje
              </p>
              <p className="mt-1 text-sm">{diaHoje.discursiva}</p>
            </div>
          )}
        </Cartao>

        <div className="space-y-4">
          <Cartao>
            <h3 className="mb-3 font-bold">Progresso do edital</h3>
            <Barra valor={(stats.topicosEstudados / stats.totalTopicos) * 100} />
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.topicosEstudados} de {stats.totalTopicos} tópicos iniciados
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metrica label="sessões feitas" valor={stats.sessoesFeitas} />
              <Metrica label="sessões totais" valor={stats.totalSessoes} />
              <Metrica label="cards Anki" valor={estado.cards.length} />
            </div>
          </Cartao>

          <Cartao>
            <h3 className="mb-2 flex items-center gap-2 font-bold">
              <Target className="h-4 w-4 text-primary" /> Metas a bater
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Questões por dia</span>
                <span className="font-semibold">{estado.metaQuestoesDia}</span>
              </li>
              <li className="flex justify-between">
                <span>Sequência de 30 dias</span>
                <span className="font-semibold">{stats.seq}/30</span>
              </li>
              <li className="flex justify-between">
                <span>Desempenho ≥ 70%</span>
                <span className="font-semibold">{stats.desempenho}%</span>
              </li>
              <li className="flex justify-between">
                <span>Simulados feitos</span>
                <span className="font-semibold">{estado.simulados.length}</span>
              </li>
              <li className="flex justify-between">
                <span>Fim previsto do edital</span>
                <span className="font-semibold">{formatarData(fim)}</span>
              </li>
            </ul>
          </Cartao>
        </div>
      </div>

      <Cartao>
        <h3 className="mb-3 font-bold">Próximos dias</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {proximos.map((d) => (
            <div key={d.data} className="rounded-xl border border-border p-3">
              <p className="text-xs font-bold text-primary">{formatarData(d.data)}</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {d.slots.map((s) => (
                  <li key={s.id} className="truncate">
                    • {getDisciplina(s.disciplinaId)?.curto ?? s.disciplinaNome} — {s.minutos}min
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Cartao>
    </div>
  );
}
