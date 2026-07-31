import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Barra, Cartao, Campo, Metrica, Titulo } from "@/components/ui-app";
import { DISCIPLINAS, MODO_LABEL, selo, seloTexto } from "@/data/edital";
import { useStore } from "@/lib/store";
import { SESSOES_MESTRE } from "@/lib/plano";

export const Route = createFileRoute("/edital")({
  head: () => ({
    meta: [
      { title: "Edital verticalizado — Anderson Investigador PCBA" },
      {
        name: "description",
        content:
          "Edital verticalizado do concurso de Investigador da Polícia Civil da Bahia com as 14 disciplinas, peso de cada tópico na banca AOCP e pontos de foco.",
      },
      { property: "og:title", content: "Edital verticalizado — Anderson Investigador PCBA" },
      {
        property: "og:description",
        content: "Todas as disciplinas e tópicos do edital PC-BA Investigador com incidência e progresso de estudo.",
      },
    ],
  }),
  component: EditalPage,
});

function EditalPage() {
  const { estado } = useStore();
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState<string | null>(DISCIPLINAS[0].id);

  const topicoIniciado = (topicoId: string) =>
    SESSOES_MESTRE.some((s) => s.topicoId === topicoId && estado.progresso[s.id]?.feito);

  const totalTopicos = DISCIPLINAS.reduce((a, d) => a + d.topicos.length, 0);
  const iniciados = DISCIPLINAS.reduce(
    (a, d) => a + d.topicos.filter((t) => topicoIniciado(t.id)).length,
    0,
  );

  const termo = busca.trim().toLowerCase();

  return (
    <div className="space-y-5">
      <Titulo sub="Peso 🔥🔥🔥 = altíssima incidência na banca Instituto AOCP. Comece sempre pelos mais quentes.">
        Edital verticalizado
      </Titulo>

      <Cartao>
        <div className="grid gap-4 sm:grid-cols-3">
          <Metrica label="disciplinas" valor={DISCIPLINAS.length} />
          <Metrica label="tópicos" valor={totalTopicos} />
          <Metrica label="tópicos iniciados" valor={iniciados} destaque="var(--color-primary)" />
        </div>
        <div className="mt-4">
          <Barra valor={(iniciados / totalTopicos) * 100} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <Campo label="Buscar tópico" value={busca} placeholder="prisão, crase, licitação…" onChange={(e) => setBusca(e.target.value)} />
          </div>
        </div>
      </Cartao>

      <div className="space-y-3">
        {DISCIPLINAS.map((d) => {
          const topicos = termo
            ? d.topicos.filter((t) => t.t.toLowerCase().includes(termo) || t.f.join(" ").toLowerCase().includes(termo))
            : d.topicos;
          if (termo && topicos.length === 0) return null;
          const abertoAgora = termo ? true : aberta === d.id;
          const feitos = d.topicos.filter((t) => topicoIniciado(t.id)).length;
          return (
            <Cartao key={d.id} cor={d.corForte}>
              <button
                className="flex w-full items-center gap-3 text-left"
                onClick={() => setAberta(aberta === d.id ? null : d.id)}
              >
                <BookOpen className="h-4 w-4" style={{ color: d.corForte }} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {d.nome} {selo(d.peso)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {feitos}/{d.topicos.length} tópicos iniciados · {seloTexto(d.peso)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{abertoAgora ? "−" : "+"}</span>
              </button>

              {abertoAgora && (
                <ul className="mt-3 space-y-2">
                  {topicos.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-xl p-3 text-neutral-800"
                      style={{ background: d.cor, opacity: topicoIniciado(t.id) ? 0.7 : 1 }}
                    >
                      <p className="text-[11px] font-bold uppercase" style={{ color: d.corForte }}>
                        {selo(t.p)} {seloTexto(t.p)} · {MODO_LABEL[t.m]}
                      </p>
                      <p className="text-sm font-medium">{t.t}</p>
                      <ul className="mt-1 space-y-0.5 text-[11px] text-neutral-600">
                        {t.f.map((f) => (
                          <li key={f}>• {f}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </Cartao>
          );
        })}
      </div>
    </div>
  );
}
