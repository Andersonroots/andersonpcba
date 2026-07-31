import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, ListChecks } from "lucide-react";
import { useStore } from "@/lib/store";
import { Barra, Botao, Cartao, Metrica, Titulo, Selecao, Campo } from "@/components/ui-app";
import { DISCIPLINAS, getDisciplina } from "@/data/edital";
import { formatarData } from "@/lib/plano";

export const Route = createFileRoute("/questoes")({
  head: () => ({
    meta: [
      { title: "Questões e desempenho — Anderson Investigador PCBA" },
      {
        name: "description",
        content:
          "Registre acertos e erros por disciplina, acompanhe a meta diária de questões e descubra seus pontos fracos para a prova da PC-BA.",
      },
      { property: "og:title", content: "Questões e desempenho — Anderson Investigador PCBA" },
      {
        property: "og:description",
        content: "Controle diário de questões resolvidas com percentual de acerto por disciplina.",
      },
    ],
  }),
  component: QuestoesPage,
});

function QuestoesPage() {
  const { estado, set, hoje } = useStore();
  const [disciplinaId, setDisciplinaId] = useState(DISCIPLINAS[0].id);
  const [acertos, setAcertos] = useState("");
  const [erros, setErros] = useState("");

  const adicionar = () => {
    const a = Number(acertos) || 0;
    const e = Number(erros) || 0;
    if (a + e === 0) return;
    set((st) => ({
      ...st,
      questoes: [
        { id: `${Date.now()}`, data: hoje, disciplinaId, acertos: a, erros: e },
        ...st.questoes,
      ],
    }));
    setAcertos("");
    setErros("");
  };

  const remover = (id: string) =>
    set((st) => ({ ...st, questoes: st.questoes.filter((q) => q.id !== id) }));

  const porDisciplina = useMemo(() => {
    return DISCIPLINAS.map((d) => {
      const regs = estado.questoes.filter((q) => q.disciplinaId === d.id);
      const a = regs.reduce((x, q) => x + q.acertos, 0);
      const e = regs.reduce((x, q) => x + q.erros, 0);
      return { d, a, e, total: a + e, pct: a + e ? Math.round((a / (a + e)) * 100) : 0 };
    })
      .filter((x) => x.total > 0)
      .sort((x, y) => x.pct - y.pct);
  }, [estado.questoes]);

  const doDia = estado.questoes.filter((q) => q.data === hoje);
  const totalDia = doDia.reduce((a, q) => a + q.acertos + q.erros, 0);
  const totalGeral = estado.questoes.reduce((a, q) => a + q.acertos + q.erros, 0);
  const acertosGeral = estado.questoes.reduce((a, q) => a + q.acertos, 0);

  return (
    <div className="space-y-5">
      <Titulo sub="Questão é treino de prova. Registre todo dia — o app aponta suas matérias mais fracas.">
        Questões
      </Titulo>

      <div className="grid gap-4 lg:grid-cols-3">
        <Cartao className="lg:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <Plus className="h-4 w-4 text-primary" /> Registrar questões de hoje
          </h3>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <Selecao label="Disciplina" value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)}>
                {DISCIPLINAS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </Selecao>
            </div>
            <Campo label="Acertos" type="number" min={0} value={acertos} onChange={(e) => setAcertos(e.target.value)} />
            <Campo label="Erros" type="number" min={0} value={erros} onChange={(e) => setErros(e.target.value)} />
          </div>
          <Botao className="mt-3" onClick={adicionar}>
            <Plus className="h-4 w-4" /> Adicionar
          </Botao>
        </Cartao>

        <Cartao>
          <h3 className="mb-3 font-bold">Meta do dia</h3>
          <Barra valor={(totalDia / (estado.metaQuestoesDia || 1)) * 100} />
          <p className="mt-1 text-xs text-muted-foreground">
            {totalDia} de {estado.metaQuestoesDia} questões hoje
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Metrica label="questões no total" valor={totalGeral} />
            <Metrica
              label="acerto geral"
              valor={totalGeral ? Math.round((acertosGeral / totalGeral) * 100) : 0}
              sufixo="%"
              destaque="var(--color-primary)"
            />
          </div>
        </Cartao>
      </div>

      <Cartao>
        <h3 className="mb-3 flex items-center gap-2 font-bold">
          <ListChecks className="h-4 w-4 text-primary" /> Desempenho por disciplina (piores primeiro)
        </h3>
        {porDisciplina.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma questão registrada ainda.</p>
        )}
        <div className="space-y-3">
          {porDisciplina.map(({ d, a, e, pct }) => (
            <div key={d.id}>
              <div className="flex justify-between text-xs">
                <span className="font-semibold">{d.nome}</span>
                <span className={pct < 60 ? "text-destructive" : "text-muted-foreground"}>
                  {a} acertos · {e} erros · {pct}%
                </span>
              </div>
              <div className="mt-1">
                <Barra valor={pct} cor={d.corForte} />
              </div>
            </div>
          ))}
        </div>
      </Cartao>

      <Cartao>
        <h3 className="mb-3 font-bold">Histórico</h3>
        <div className="space-y-2">
          {estado.questoes.slice(0, 30).map((q) => {
            const d = getDisciplina(q.disciplinaId);
            const total = q.acertos + q.erros;
            return (
              <div key={q.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5 text-sm">
                <span className="h-8 w-1.5 rounded-full" style={{ background: d?.corForte }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d?.nome}</p>
                  <p className="text-[11px] text-muted-foreground">{formatarData(q.data)}</p>
                </div>
                <span className="text-xs font-semibold">
                  {q.acertos}/{total} ({total ? Math.round((q.acertos / total) * 100) : 0}%)
                </span>
                <button onClick={() => remover(q.id)} aria-label="Remover" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          {estado.questoes.length === 0 && <p className="text-sm text-muted-foreground">Sem registros.</p>}
        </div>
      </Cartao>
    </div>
  );
}
