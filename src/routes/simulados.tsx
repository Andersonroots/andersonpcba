import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileCheck2, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Barra, Botao, Campo, Cartao, Metrica, Titulo } from "@/components/ui-app";
import { formatarData } from "@/lib/plano";

export const Route = createFileRoute("/simulados")({
  head: () => ({
    meta: [
      { title: "Simulados de domingo — Anderson Investigador PCBA" },
      {
        name: "description",
        content:
          "Registre os simulados semanais no padrão Instituto AOCP e acompanhe a evolução da sua nota rumo à aprovação na PC-BA.",
      },
      { property: "og:title", content: "Simulados de domingo — Anderson Investigador PCBA" },
      {
        property: "og:description",
        content: "Histórico de simulados com nota, tempo de prova e evolução do percentual de acerto.",
      },
    ],
  }),
  component: SimuladosPage,
});

function SimuladosPage() {
  const { estado, set, hoje } = useStore();
  const [nome, setNome] = useState("");
  const [acertos, setAcertos] = useState("");
  const [total, setTotal] = useState("60");
  const [minutos, setMinutos] = useState("240");

  const salvar = () => {
    const a = Number(acertos) || 0;
    const t = Number(total) || 0;
    if (!t) return;
    set((st) => ({
      ...st,
      simulados: [
        {
          id: `${Date.now()}`,
          data: hoje,
          nome: nome.trim() || `Simulado ${st.simulados.length + 1}`,
          acertos: a,
          total: t,
          minutos: Number(minutos) || 0,
        },
        ...st.simulados,
      ],
    }));
    setNome("");
    setAcertos("");
  };

  const remover = (id: string) => set((st) => ({ ...st, simulados: st.simulados.filter((s) => s.id !== id) }));

  const media = estado.simulados.length
    ? Math.round(
        (estado.simulados.reduce((a, s) => a + s.acertos / (s.total || 1), 0) / estado.simulados.length) * 100,
      )
    : 0;
  const melhor = estado.simulados.reduce(
    (a, s) => Math.max(a, Math.round((s.acertos / (s.total || 1)) * 100)),
    0,
  );

  return (
    <div className="space-y-5">
      <Titulo sub="Todo domingo: 4h de prova cronometrada no padrão AOCP e correção com caderno de erros.">
        Simulados
      </Titulo>

      <div className="grid gap-4 lg:grid-cols-3">
        <Cartao className="lg:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <FileCheck2 className="h-4 w-4 text-primary" /> Registrar simulado
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="Nome" value={nome} placeholder="Simulado AOCP nº 1" onChange={(e) => setNome(e.target.value)} />
            <Campo label="Tempo gasto (min)" type="number" value={minutos} onChange={(e) => setMinutos(e.target.value)} />
            <Campo label="Acertos" type="number" value={acertos} onChange={(e) => setAcertos(e.target.value)} />
            <Campo label="Total de questões" type="number" value={total} onChange={(e) => setTotal(e.target.value)} />
          </div>
          <Botao className="mt-3" onClick={salvar}>
            Salvar simulado
          </Botao>
        </Cartao>

        <Cartao>
          <h3 className="mb-3 font-bold">Evolução</h3>
          <div className="grid grid-cols-3 gap-2">
            <Metrica label="feitos" valor={estado.simulados.length} />
            <Metrica label="média" valor={media} sufixo="%" destaque="var(--color-primary)" />
            <Metrica label="melhor" valor={melhor} sufixo="%" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Meta de corte estimada para investigador: acima de 65% de acerto no geral.
          </p>
        </Cartao>
      </div>

      <div className="space-y-3">
        {estado.simulados.length === 0 && (
          <Cartao>
            <p className="text-sm text-muted-foreground">Nenhum simulado registrado ainda.</p>
          </Cartao>
        )}
        {estado.simulados.map((s) => {
          const pct = Math.round((s.acertos / (s.total || 1)) * 100);
          return (
            <Cartao key={s.id}>
              <div className="mb-2 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{s.nome}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatarData(s.data)} · {s.acertos}/{s.total} · {s.minutos}min
                  </p>
                </div>
                <span className="text-lg font-bold" style={{ color: pct >= 65 ? "var(--color-primary)" : "var(--color-destructive)" }}>
                  {pct}%
                </span>
                <button onClick={() => remover(s.id)} aria-label="Excluir" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Barra valor={pct} cor={pct >= 65 ? "var(--color-primary)" : "var(--color-destructive)"} />
            </Cartao>
          );
        })}
      </div>
    </div>
  );
}
