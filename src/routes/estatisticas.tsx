import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "@/lib/store";
import { Cartao, Metrica, Titulo } from "@/components/ui-app";
import { DISCIPLINAS } from "@/data/edital";
import { SESSOES_MESTRE, addDays } from "@/lib/plano";

export const Route = createFileRoute("/estatisticas")({
  head: () => ({
    meta: [
      { title: "Estatísticas de estudo — Anderson Investigador PCBA" },
      {
        name: "description",
        content:
          "Gráficos de horas estudadas, acertos por disciplina e evolução nos simulados na preparação para Investigador da PC-BA.",
      },
      { property: "og:title", content: "Estatísticas de estudo — Anderson Investigador PCBA" },
      {
        property: "og:description",
        content: "Painel de gráficos com horas, questões, desempenho por disciplina e evolução nos simulados.",
      },
    ],
  }),
  component: EstatisticasPage,
});

function EstatisticasPage() {
  const { estado, hoje } = useStore();

  const ultimos14 = useMemo(() => {
    const dias: { dia: string; minutos: number; questoes: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const data = addDays(hoje, -i);
      const minutos = Object.entries(estado.progresso)
        .filter(([, p]) => p.feito && p.data === data)
        .reduce((a, [id]) => a + (SESSOES_MESTRE.find((s) => s.id === id)?.minutos ?? 60), 0);
      const questoes = estado.questoes
        .filter((q) => q.data === data)
        .reduce((a, q) => a + q.acertos + q.erros, 0);
      dias.push({ dia: data.slice(8) + "/" + data.slice(5, 7), minutos, questoes });
    }
    return dias;
  }, [estado, hoje]);

  const porDisciplina = useMemo(
    () =>
      DISCIPLINAS.map((d) => {
        const regs = estado.questoes.filter((q) => q.disciplinaId === d.id);
        const a = regs.reduce((x, q) => x + q.acertos, 0);
        const e = regs.reduce((x, q) => x + q.erros, 0);
        return { nome: d.curto, cor: d.corForte, pct: a + e ? Math.round((a / (a + e)) * 100) : 0, total: a + e };
      }).filter((x) => x.total > 0),
    [estado.questoes],
  );

  const tempoPorDisciplina = useMemo(() => {
    const mapa: Record<string, number> = {};
    Object.entries(estado.progresso).forEach(([id, p]) => {
      if (!p.feito) return;
      const s = SESSOES_MESTRE.find((x) => x.id === id);
      if (!s) return;
      mapa[s.disciplinaId] = (mapa[s.disciplinaId] || 0) + s.minutos;
    });
    return DISCIPLINAS.filter((d) => mapa[d.id]).map((d) => ({
      name: d.curto,
      value: Math.round((mapa[d.id] / 60) * 10) / 10,
      cor: d.corForte,
    }));
  }, [estado.progresso]);

  const simulados = estado.simulados
    .slice()
    .reverse()
    .map((s, i) => ({ nome: `#${i + 1}`, pct: Math.round((s.acertos / (s.total || 1)) * 100) }));

  const minutosTotais = Object.entries(estado.progresso)
    .filter(([, p]) => p.feito)
    .reduce((a, [id]) => a + (SESSOES_MESTRE.find((s) => s.id === id)?.minutos ?? 60), 0);
  const totalQuestoes = estado.questoes.reduce((a, q) => a + q.acertos + q.erros, 0);
  const acertos = estado.questoes.reduce((a, q) => a + q.acertos, 0);

  return (
    <div className="space-y-5">
      <Titulo sub="Dados não mentem: veja onde você está investindo tempo e onde está perdendo pontos.">
        Estatísticas
      </Titulo>

      <Cartao>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Metrica label="horas estudadas" valor={(minutosTotais / 60).toFixed(1)} destaque="var(--color-primary)" />
          <Metrica label="questões resolvidas" valor={totalQuestoes} />
          <Metrica label="acerto geral" valor={totalQuestoes ? Math.round((acertos / totalQuestoes) * 100) : 0} sufixo="%" />
          <Metrica label="cartões Anki" valor={estado.cards.length} />
        </div>
      </Cartao>

      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao>
          <h3 className="mb-3 font-bold">Minutos estudados (14 dias)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ultimos14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="dia" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="minutos" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Cartao>

        <Cartao>
          <h3 className="mb-3 font-bold">Questões por dia (14 dias)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ultimos14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="dia" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="questoes" stroke="var(--color-chart-2)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Cartao>

        <Cartao>
          <h3 className="mb-3 font-bold">Acerto por disciplina</h3>
          {porDisciplina.length === 0 ? (
            <p className="text-sm text-muted-foreground">Registre questões para ver este gráfico.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porDisciplina} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                  <YAxis type="category" dataKey="nome" width={80} tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                    {porDisciplina.map((d) => (
                      <Cell key={d.nome} fill={d.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Cartao>

        <Cartao>
          <h3 className="mb-3 font-bold">Horas por disciplina</h3>
          {tempoPorDisciplina.length === 0 ? (
            <p className="text-sm text-muted-foreground">Conclua metas no cronograma para ver este gráfico.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tempoPorDisciplina} dataKey="value" nameKey="name" innerRadius={45} outerRadius={90} paddingAngle={2}>
                    {tempoPorDisciplina.map((d) => (
                      <Cell key={d.name} fill={d.cor} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Cartao>
      </div>

      <Cartao>
        <h3 className="mb-3 font-bold">Evolução nos simulados</h3>
        {simulados.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum simulado registrado ainda.</p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulados}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="nome" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="pct" stroke="var(--color-primary)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Cartao>
    </div>
  );
}
