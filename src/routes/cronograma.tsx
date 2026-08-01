import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, CalendarDays, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { Barra, Botao, Cartao, Titulo } from "@/components/ui-app";
import { getDisciplina, getTopico, MODO_LABEL, selo } from "@/data/edital";
import { TIPO_LABEL, formatarData, addDays } from "@/lib/plano";

export const Route = createFileRoute("/cronograma")({
  head: () => ({
    meta: [
      { title: "Cronograma diário — Anderson Investigador PCBA" },
      {
        name: "description",
        content:
          "Metas de estudo dia a dia para o concurso de Investigador da PC-BA, com marcação de concluído, remanejamento de metas e reorganização automática.",
      },
      { property: "og:title", content: "Cronograma diário — Anderson Investigador PCBA" },
      {
        property: "og:description",
        content: "Metas diárias com teoria, revisão e questões distribuídas pelo peso de cada tópico na banca AOCP.",
      },
    ],
  }),
  component: CronogramaPage,
});

function CronogramaPage() {
  const { plano, hoje, estado, set, concluir, moverSlot, reorganizar } = useStore();
  const [offset, setOffset] = useState(0);
  const [quantos, setQuantos] = useState(10);

  const inicio = addDays(hoje, offset);
  const dias = useMemo(
    () => plano.filter((d) => d.data >= inicio).slice(0, quantos),
    [plano, inicio, quantos],
  );

  const restantes = plano
    .filter((d) => d.data >= hoje)
    .reduce((a, d) => a + d.slots.filter((s) => !estado.progresso[s.id]?.feito).length, 0);

  const adiantar = (data: string) => {
    // procura o próximo dia que tenha metas movíveis (tópicos do edital)
    const prox = plano.find(
      (d) => d.data > data && d.slots.some((s) => s.topicoId && !estado.progresso[s.id]?.feito),
    );
    if (!prox) return;
    const ids = prox.slots.filter((s) => s.topicoId && !estado.progresso[s.id]?.feito).map((s) => s.id);
    if (ids.length === 0) return;
    set((e) => {
      const pins = { ...e.pins };
      ids.forEach((id) => (pins[id] = data));
      return { ...e, pins };
    });
  };



  return (
    <div className="space-y-5">
      <Titulo sub="Marque cada meta ao terminar. Se adiantar, o plano se recompacta sozinho para os próximos dias.">
        Cronograma
      </Titulo>

      <Cartao>
        <div className="flex flex-wrap items-center gap-3">
          <Botao variante="contorno" onClick={() => setOffset((o) => o - 7)}>
            <ChevronLeft className="h-4 w-4" /> 7 dias
          </Botao>
          <Botao variante="contorno" onClick={() => setOffset(0)}>
            Hoje
          </Botao>
          <Botao variante="contorno" onClick={() => setOffset((o) => o + 7)}>
            7 dias <ChevronRight className="h-4 w-4" />
          </Botao>
          <span className="text-xs text-muted-foreground">{restantes} metas ainda pendentes no edital</span>
          <Botao
            variante="suave"
            className="ml-auto"
            onClick={() => {
              if (confirm("Reorganizar o cronograma? As metas que você arrastou voltam para a ordem automática.")) {
                reorganizar();
              }
            }}
          >
            <RefreshCw className="h-4 w-4" /> Reorganizar
          </Botao>
        </div>
      </Cartao>

      <div className="space-y-4">
        {dias.map((dia) => {
          const feitos = dia.slots.filter((s) => estado.progresso[s.id]?.feito).length;
          const pct = dia.slots.length ? (feitos / dia.slots.length) * 100 : 0;
          const total = dia.slots.reduce((a, s) => a + s.minutos, 0);
          return (
            <Cartao key={dia.data} cor={dia.data === hoje ? "var(--color-primary)" : undefined}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h3 className="font-bold">{formatarData(dia.data)}</h3>
                {dia.data === hoje && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    HOJE
                  </span>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {Math.floor(total / 60)}h{String(total % 60).padStart(2, "0")} · {feitos}/{dia.slots.length}
                </span>
              </div>
              <Barra valor={pct} />

              <div className="mt-3 space-y-2">
                {dia.slots.length === 0 && (
                  <p className="text-sm text-muted-foreground">Dia livre — revise flashcards ou descanse.</p>
                )}
                {dia.slots.map((s) => {
                  const d = getDisciplina(s.disciplinaId);
                  const t = getTopico(s.topicoId);
                  const feito = !!estado.progresso[s.id]?.feito;
                  return (
                    <div
                      key={s.id}
                      className="rounded-xl p-3"
                      style={{
                        background: d?.cor ?? "var(--color-muted)",
                        borderLeft: `4px solid ${d?.corForte ?? "var(--color-primary)"}`,
                        opacity: feito ? 0.6 : 1,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => concluir(s.id, dia.data, !feito)}
                          aria-label="Concluir meta"
                          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2"
                          style={{
                            borderColor: d?.corForte ?? "var(--color-primary)",
                            background: feito ? (d?.corForte ?? "var(--color-primary)") : "transparent",
                          }}
                        >
                          {feito && <Check className="h-4 w-4 text-white" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-[11px] font-bold uppercase tracking-wide"
                            style={{ color: d?.corForte ?? "#333" }}
                          >
                            {d?.curto ?? s.disciplinaNome} · {TIPO_LABEL[s.tipo]} · {MODO_LABEL[s.modo]} · {s.minutos}
                            min {selo(s.peso)}
                          </p>
                          <p
                            className={`text-sm font-medium text-neutral-800 ${feito ? "line-through" : ""}`}
                          >
                            {s.titulo}
                          </p>
                          {t?.f?.length ? (
                            <ul className="mt-1 space-y-0.5 text-[11px] text-neutral-600">
                              {t.f.map((foco) => (
                                <li key={foco}>• {foco}</li>
                              ))}
                            </ul>
                          ) : null}
                          {s.topicoId && dia.data >= hoje && (
                            <label className="mt-2 flex items-center gap-2 text-[11px] text-neutral-700">
                              mover para:
                              <input
                                type="date"
                                min={hoje}
                                value={estado.pins[s.id] ?? dia.data}
                                onChange={(e) => moverSlot(s.id, e.target.value)}
                                className="rounded-lg border border-white/70 bg-white/70 px-2 py-1 text-[11px] text-neutral-800"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {dia.data >= hoje && dia.slots.length > 0 && feitos === dia.slots.length && (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-primary/10 p-3">
                  <p className="text-sm font-semibold">
                    Dia concluído! Quer adiantar as metas do próximo dia para hoje?
                  </p>
                  <Botao className="ml-auto" onClick={() => adiantar(dia.data)}>
                    Adiantar metas
                  </Botao>
                </div>
              )}



              {dia.data >= hoje && (
                <div className="mt-3 rounded-xl border border-dashed border-border p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Discursiva do dia
                  </p>
                  <p className="mt-1 text-sm">{dia.discursiva}</p>
                </div>
              )}
            </Cartao>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Botao variante="contorno" onClick={() => setQuantos((q) => q + 10)}>
          Mostrar mais dias
        </Botao>
      </div>
    </div>
  );
}
