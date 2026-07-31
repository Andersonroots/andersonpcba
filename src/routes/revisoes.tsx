import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { RotateCcw, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { Cartao, Metrica, Titulo } from "@/components/ui-app";
import { getDisciplina, selo } from "@/data/edital";
import { TIPO_LABEL, formatarData } from "@/lib/plano";

export const Route = createFileRoute("/revisoes")({
  head: () => ({
    meta: [
      { title: "Revisões espaçadas — Anderson Investigador PCBA" },
      {
        name: "description",
        content:
          "Todas as revisões programadas do plano PC-BA Investigador: revisão de 7 e de 21 dias e baterias de questões por tópico.",
      },
      { property: "og:title", content: "Revisões espaçadas — Anderson Investigador PCBA" },
      {
        property: "og:description",
        content: "Acompanhe as revisões espaçadas e as baterias de questões agendadas para cada tópico do edital.",
      },
    ],
  }),
  component: RevisoesPage,
});

function RevisoesPage() {
  const { plano, hoje, estado, concluir } = useStore();

  const revisoes = useMemo(
    () =>
      plano
        .filter((d) => d.data >= hoje)
        .flatMap((d) =>
          d.slots
            .filter((s) => s.tipo === "revisao" || s.tipo === "questoes" || s.tipo === "revisaoSemanal")
            .map((s) => ({ ...s, data: d.data })),
        )
        .slice(0, 60),
    [plano, hoje],
  );

  const atrasadas = useMemo(
    () =>
      plano
        .filter((d) => d.data < hoje)
        .flatMap((d) => d.slots.map((s) => ({ ...s, data: d.data })))
        .filter((s) => !estado.progresso[s.id]?.feito && (s.tipo === "revisao" || s.tipo === "questoes")),
    [plano, hoje, estado.progresso],
  );

  const feitasRevisao = Object.keys(estado.progresso).filter((id) => id.includes("::")).length;

  return (
    <div className="space-y-5">
      <Titulo sub="A revisão vem 7 dias depois da teoria e a segunda passada por volta de 21 dias — é o que fixa o conteúdo.">
        Revisões
      </Titulo>

      <Cartao>
        <div className="grid grid-cols-3 gap-3">
          <Metrica label="revisões agendadas" valor={revisoes.length} />
          <Metrica label="em atraso" valor={atrasadas.length} destaque="var(--color-destructive)" />
          <Metrica label="sessões concluídas" valor={feitasRevisao} destaque="var(--color-primary)" />
        </div>
      </Cartao>

      {atrasadas.length > 0 && (
        <Cartao cor="var(--color-destructive)">
          <h3 className="mb-3 font-bold">Em atraso — recupere primeiro</h3>
          <div className="space-y-2">
            {atrasadas.slice(0, 12).map((s) => (
              <LinhaRevisao key={s.id} slot={s} onCheck={() => concluir(s.id, hoje, true)} />
            ))}
          </div>
        </Cartao>
      )}

      <Cartao>
        <h3 className="mb-3 flex items-center gap-2 font-bold">
          <RotateCcw className="h-4 w-4 text-primary" /> Próximas revisões
        </h3>
        <div className="space-y-2">
          {revisoes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma revisão pendente.</p>}
          {revisoes.map((s) => (
            <LinhaRevisao key={s.id} slot={s} onCheck={() => concluir(s.id, s.data, true)} />
          ))}
        </div>
      </Cartao>
    </div>
  );
}

function LinhaRevisao({
  slot,
  onCheck,
}: {
  slot: { id: string; data: string; titulo: string; disciplinaId: string; disciplinaNome: string; tipo: string; minutos: number; peso: number };
  onCheck: () => void;
}) {
  const d = getDisciplina(slot.disciplinaId);
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border p-3">
      <button
        onClick={onCheck}
        aria-label="Marcar revisão como feita"
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
      >
        <Check className="h-4 w-4" />
      </button>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase" style={{ color: d?.corForte ?? "var(--color-primary)" }}>
          {formatarData(slot.data)} · {d?.curto ?? slot.disciplinaNome} ·{" "}
          {TIPO_LABEL[slot.tipo as keyof typeof TIPO_LABEL]} · {slot.minutos}min {selo(slot.peso)}
        </p>
        <p className="text-sm font-medium">{slot.titulo}</p>
      </div>
    </div>
  );
}
