import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NotebookPen, Trash2, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { AreaTexto, Botao, Campo, Cartao, Metrica, Selecao, Titulo } from "@/components/ui-app";
import { DISCIPLINAS, getDisciplina } from "@/data/edital";
import { formatarData } from "@/lib/plano";

export const Route = createFileRoute("/erros")({
  head: () => ({
    meta: [
      { title: "Caderno de erros — Anderson Investigador PCBA" },
      {
        name: "description",
        content:
          "Anote cada questão errada, o motivo do erro e a resposta correta. O caderno de erros é a ferramenta que mais aumenta a nota na reta final.",
      },
      { property: "og:title", content: "Caderno de erros — Anderson Investigador PCBA" },
      {
        property: "og:description",
        content: "Registro estruturado de erros com motivo, gabarito correto e controle de revisão.",
      },
    ],
  }),
  component: ErrosPage,
});

const VAZIO = { disciplinaId: DISCIPLINAS[0].id, topico: "", enunciado: "", porqueErrei: "", correto: "" };

function ErrosPage() {
  const { estado, set, hoje } = useStore();
  const [form, setForm] = useState(VAZIO);
  const [filtro, setFiltro] = useState("todos");

  const salvar = () => {
    if (!form.enunciado.trim()) return;
    set((st) => ({
      ...st,
      erros: [{ id: `${Date.now()}`, data: hoje, revisado: false, ...form }, ...st.erros],
    }));
    setForm(VAZIO);
  };

  const alternar = (id: string) =>
    set((st) => ({
      ...st,
      erros: st.erros.map((e) => (e.id === id ? { ...e, revisado: !e.revisado } : e)),
    }));

  const remover = (id: string) => set((st) => ({ ...st, erros: st.erros.filter((e) => e.id !== id) }));

  const lista = estado.erros.filter((e) =>
    filtro === "todos" ? true : filtro === "pendentes" ? !e.revisado : e.disciplinaId === filtro,
  );

  return (
    <div className="space-y-5">
      <Titulo sub="Errar é normal. Não anotar o porquê é que atrasa a aprovação.">Caderno de erros</Titulo>

      <div className="grid gap-4 lg:grid-cols-3">
        <Cartao className="lg:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <NotebookPen className="h-4 w-4 text-primary" /> Novo erro
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Selecao
              label="Disciplina"
              value={form.disciplinaId}
              onChange={(e) => setForm({ ...form, disciplinaId: e.target.value })}
            >
              {DISCIPLINAS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </Selecao>
            <Campo
              label="Tópico"
              value={form.topico}
              placeholder="Ex.: prisão preventiva"
              onChange={(e) => setForm({ ...form, topico: e.target.value })}
            />
          </div>
          <div className="mt-3 space-y-3">
            <AreaTexto
              label="Enunciado / o que caiu"
              rows={2}
              value={form.enunciado}
              onChange={(e) => setForm({ ...form, enunciado: e.target.value })}
            />
            <AreaTexto
              label="Por que eu errei"
              rows={2}
              value={form.porqueErrei}
              onChange={(e) => setForm({ ...form, porqueErrei: e.target.value })}
            />
            <AreaTexto
              label="Resposta correta / fundamento"
              rows={2}
              value={form.correto}
              onChange={(e) => setForm({ ...form, correto: e.target.value })}
            />
          </div>
          <Botao className="mt-3" onClick={salvar}>
            Salvar erro
          </Botao>
        </Cartao>

        <Cartao>
          <h3 className="mb-3 font-bold">Resumo</h3>
          <div className="grid grid-cols-2 gap-3">
            <Metrica label="erros anotados" valor={estado.erros.length} />
            <Metrica
              label="ainda não revisados"
              valor={estado.erros.filter((e) => !e.revisado).length}
              destaque="var(--color-destructive)"
            />
          </div>
          <div className="mt-4">
            <Selecao label="Filtrar" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="pendentes">Só não revisados</option>
              {DISCIPLINAS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </Selecao>
          </div>
        </Cartao>
      </div>

      <div className="space-y-3">
        {lista.length === 0 && (
          <Cartao>
            <p className="text-sm text-muted-foreground">Nenhum erro registrado nesse filtro.</p>
          </Cartao>
        )}
        {lista.map((e) => {
          const d = getDisciplina(e.disciplinaId);
          return (
            <Cartao key={e.id} cor={d?.corForte}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase" style={{ color: d?.corForte }}>
                    {d?.curto} {e.topico && `· ${e.topico}`} · {formatarData(e.data)}
                  </p>
                  <p className="mt-1 text-sm font-medium">{e.enunciado}</p>
                  {e.porqueErrei && (
                    <p className="mt-2 text-sm">
                      <span className="font-semibold text-destructive">Por que errei: </span>
                      {e.porqueErrei}
                    </p>
                  )}
                  {e.correto && (
                    <p className="mt-1 text-sm">
                      <span className="font-semibold text-primary">Correto: </span>
                      {e.correto}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    onClick={() => alternar(e.id)}
                    aria-label="Marcar como revisado"
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                      e.revisado ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remover(e.id)}
                    aria-label="Excluir"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Cartao>
          );
        })}
      </div>
    </div>
  );
}
