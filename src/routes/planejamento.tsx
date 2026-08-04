import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { Botao, Cartao, Titulo } from "@/components/ui-app";
import { DISCIPLINAS, getDisciplina } from "@/data/edital";
import { NOMES_DIA, NOMES_MES, formatarData, parseIso } from "@/lib/plano";

export const Route = createFileRoute("/planejamento")({
  head: () => ({
    meta: [
      { title: "Planejamento mensal — Anderson Investigador PCBA" },
      {
        name: "description",
        content:
          "Visão de calendário do plano de estudos para Investigador da PC-BA: veja o mês inteiro, a carga de cada dia e as disciplinas distribuídas.",
      },
      { property: "og:title", content: "Planejamento mensal — Anderson Investigador PCBA" },
      {
        property: "og:description",
        content: "Calendário completo com a carga horária diária e as disciplinas de cada dia até a prova.",
      },
    ],
  }),
  component: PlanejamentoPage,
});

function PlanejamentoPage() {
  const { plano, hoje, estado } = useStore();
  const [mesRef, setMesRef] = useState(() => hoje.slice(0, 7));
  const [selecionado, setSelecionado] = useState<string | null>(hoje);
  const [busca, setBusca] = useState("");

  const buscaNorm = busca.trim().toLowerCase();
  const matchBusca = (s: { titulo: string; disciplinaNome: string; disciplinaId: string; topicoId?: string | null }) => {
    if (!buscaNorm) return true;
    const d = getDisciplina(s.disciplinaId);
    return (
      s.titulo.toLowerCase().includes(buscaNorm) ||
      s.disciplinaNome.toLowerCase().includes(buscaNorm) ||
      (d?.curto?.toLowerCase().includes(buscaNorm) ?? false) ||
      (d?.nome?.toLowerCase().includes(buscaNorm) ?? false)
    );
  };

  const [ano, mes] = mesRef.split("-").map(Number);

  const celulas = useMemo(() => {
    const primeiro = new Date(ano, mes - 1, 1);
    const totalDias = new Date(ano, mes, 0).getDate();
    const vazios = primeiro.getDay();
    const lista: (string | null)[] = Array(vazios).fill(null);
    for (let i = 1; i <= totalDias; i++) {
      lista.push(`${ano}-${String(mes).padStart(2, "0")}-${String(i).padStart(2, "0")}`);
    }
    return lista;
  }, [ano, mes]);

  const porData = useMemo(() => Object.fromEntries(plano.map((d) => [d.data, d])), [plano]);
  const diaSel = selecionado ? porData[selecionado] : undefined;

  const mudarMes = (n: number) => {
    const d = new Date(ano, mes - 1 + n, 1);
    setMesRef(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  return (
    <div className="space-y-5">
      <Titulo sub="Clique em um dia para ver as metas. As cores mostram as disciplinas daquele dia.">
        Planejamento
      </Titulo>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar tema, disciplina ou palavra-chave..."
          className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      <Cartao>
        <div className="mb-4 flex items-center gap-3">
          <Botao variante="contorno" onClick={() => mudarMes(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Botao>
          <h3 className="flex-1 text-center font-bold">
            {NOMES_MES[mes - 1]} de {ano}
          </h3>
          <Botao variante="contorno" onClick={() => mudarMes(1)}>
            <ChevronRight className="h-4 w-4" />
          </Botao>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted-foreground">
          {NOMES_DIA.map((n) => (
            <div key={n} className="py-1">
              {n}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {celulas.map((data, i) => {
            if (!data) return <div key={`v${i}`} />;
            const dia = porData[data];
            const feitos = dia?.slots.filter((s) => estado.progresso[s.id]?.feito).length ?? 0;
            const total = dia?.slots.length ?? 0;
            const completo = total > 0 && feitos === total;
            return (
              <button
                key={data}
                onClick={() => setSelecionado(data)}
                className={`min-h-[64px] rounded-xl border p-1 text-left transition-colors ${
                  selecionado === data ? "border-primary" : "border-border"
                } ${data === hoje ? "bg-primary/10" : "bg-card"} hover:bg-muted`}
              >
                <span className={`text-[11px] font-bold ${completo ? "text-primary" : ""}`}>
                  {Number(data.slice(8))}
                </span>
                <span className="mt-1 flex flex-wrap gap-0.5">
                  {dia?.slots.map((s) => (
                    <span
                      key={s.id}
                      className="h-1.5 w-4 rounded-full"
                      style={{ background: getDisciplina(s.disciplinaId)?.corForte ?? "var(--color-primary)" }}
                    />
                  ))}
                </span>
                {total > 0 && (
                  <span className="mt-0.5 block text-[9px] text-muted-foreground">
                    {feitos}/{total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Cartao>

      {diaSel && (
        <Cartao>
          <h3 className="mb-3 font-bold">{formatarData(diaSel.data)}</h3>
          <div className="space-y-2">
            {diaSel.slots.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma meta nesse dia.</p>}
            {diaSel.slots.map((s) => {
              const d = getDisciplina(s.disciplinaId);
              return (
                <div
                  key={s.id}
                  className="rounded-xl p-3 text-neutral-800"
                  style={{
                    background: d?.cor ?? "var(--color-muted)",
                    borderLeft: `4px solid ${d?.corForte ?? "var(--color-primary)"}`,
                  }}
                >
                  <p className="text-[11px] font-bold uppercase" style={{ color: d?.corForte }}>
                    {d?.curto ?? s.disciplinaNome} · {s.minutos}min
                  </p>
                  <p className="text-sm font-medium">{s.titulo}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Dia da semana: {parseIso(diaSel.data).getDay() === 0 ? "domingo (simulado)" : diaSel.tipo}
          </p>
        </Cartao>
      )}

      <Cartao>
        <h3 className="mb-3 font-bold">Legenda das disciplinas</h3>
        <div className="flex flex-wrap gap-2">
          {DISCIPLINAS.map((d) => (
            <span
              key={d.id}
              className="rounded-full px-3 py-1 text-[11px] font-semibold text-neutral-800"
              style={{ background: d.cor, border: `1px solid ${d.corForte}` }}
            >
              {d.curto}
            </span>
          ))}
        </div>
      </Cartao>
    </div>
  );
}
