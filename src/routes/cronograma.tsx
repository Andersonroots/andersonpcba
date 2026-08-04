import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, CalendarDays, RefreshCw, ChevronLeft, ChevronRight, Search } from "lucide-react";
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
  const [aba, setAba] = useState<"agenda" | "estudados">("agenda");
  const [busca, setBusca] = useState("");

  const buscaNorm = busca.trim().toLowerCase();
  const matchBusca = (s: { titulo: string; disciplinaNome: string; topicoId?: string | null; disciplinaId: string }) => {
    if (!buscaNorm) return true;
    const d = getDisciplina(s.disciplinaId);
    const t = s.topicoId ? getTopico(s.topicoId) : null;
    return (
      s.titulo.toLowerCase().includes(buscaNorm) ||
      s.disciplinaNome.toLowerCase().includes(buscaNorm) ||
      (d?.curto?.toLowerCase().includes(buscaNorm) ?? false) ||
      (d?.nome?.toLowerCase().includes(buscaNorm) ?? false) ||
      (t?.f?.some((f) => f.toLowerCase().includes(buscaNorm)) ?? false)
    );
  };

  const inicio = addDays(hoje, offset);
  const dias = useMemo(
    () => plano.filter((d) => d.data >= inicio).slice(0, quantos),
    [plano, inicio, quantos],
  );

  const estudados = useMemo(() => {
    const lista = plano
      .flatMap((d) => d.slots.map((s) => ({ slot: s, data: estado.progresso[s.id]?.data ?? d.data })))
      .filter(({ slot }) => estado.progresso[slot.id]?.feito);
    const grupos = new Map<string, typeof lista>();
    lista.forEach((item) => {
      const atual = grupos.get(item.data) ?? [];
      atual.push(item);
      grupos.set(item.data, atual);
    });
    return [...grupos.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [plano, estado.progresso]);

  const totalEstudados = estudados.reduce((a, [, itens]) => a + itens.length, 0);
  const minutosEstudados = estudados.reduce(
    (a, [, itens]) => a + itens.reduce((x, i) => x + i.slot.minutos, 0),
    0,
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

      <div className="flex gap-2">
        {([
          ["agenda", "Agenda"],
          ["estudados", `Já estudados (${totalEstudados})`],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              aba === id ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

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

      {aba === "estudados" ? (
        <div className="space-y-4">
          <Cartao>
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-2xl font-bold text-primary">{totalEstudados}</p>
                <p className="text-[11px] text-muted-foreground">metas concluídas</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.floor(minutosEstudados / 60)}h{String(minutosEstudados % 60).padStart(2, "0")}
                </p>
                <p className="text-[11px] text-muted-foreground">tempo estudado</p>
              </div>
            </div>
          </Cartao>

          {estudados.length === 0 && (
            <Cartao>
              <p className="text-sm text-muted-foreground">
                Nenhum tópico concluído ainda. Marque metas na aba Agenda para vê-las aqui.
              </p>
            </Cartao>
          )}

          {estudados.map(([data, itens]) => (
            <Cartao key={data}>
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h3 className="font-bold">{formatarData(data)}</h3>
                <span className="ml-auto text-xs text-muted-foreground">{itens.length} concluídas</span>
              </div>
              <div className="space-y-2">
                {itens.map(({ slot }) => {
                  const d = getDisciplina(slot.disciplinaId);
                  return (
                    <div
                      key={slot.id}
                      className="flex items-start gap-3 rounded-xl p-3"
                      style={{
                        background: d?.cor ?? "var(--color-muted)",
                        borderLeft: `4px solid ${d?.corForte ?? "var(--color-primary)"}`,
                      }}
                    >
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: d?.corForte ?? "var(--color-primary)" }}
                      >
                        <Check className="h-4 w-4 text-white" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[11px] font-bold uppercase tracking-wide"
                          style={{ color: d?.corForte ?? "#333" }}
                        >
                          {d?.curto ?? slot.disciplinaNome} · {TIPO_LABEL[slot.tipo]} · {MODO_LABEL[slot.modo]} ·{" "}
                          {slot.minutos}min {selo(slot.peso)}
                        </p>
                        <p className="text-sm font-medium text-neutral-800 line-through">{slot.titulo}</p>
                      </div>
                      <button
                        onClick={() => concluir(slot.id, data, false)}
                        className="shrink-0 rounded-lg border border-white/70 bg-white/70 px-2 py-1 text-[11px] font-semibold text-neutral-700"
                      >
                        Desmarcar
                      </button>
                    </div>
                  );
                })}
              </div>
            </Cartao>
          ))}
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>

  );
}
