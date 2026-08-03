import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { NotebookPen, Trash2, Check, ImagePlus, ChevronDown, ChevronRight, X } from "lucide-react";
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

const VAZIO = {
  disciplinaId: DISCIPLINAS[0].id,
  topico: "",
  enunciado: "",
  porqueErrei: "",
  correto: "",
  imagens: [] as string[],
};

// Reduz a imagem para caber no salvamento na nuvem sem perder legibilidade.
function comprimirImagem(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("falha ao ler imagem"));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("imagem inválida"));
      img.onload = () => {
        const max = 1400;
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(String(leitor.result));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = String(leitor.result);
    };
    leitor.readAsDataURL(file);
  });
}

function TextoFormatado({ children }: { children: string }) {
  return <span className="whitespace-pre-wrap break-words">{children}</span>;
}

function ErrosPage() {
  const { estado, set, hoje } = useStore();
  const [form, setForm] = useState(VAZIO);
  const [filtro, setFiltro] = useState("todos");
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const [zoom, setZoom] = useState<string | null>(null);
  const inputArquivo = useRef<HTMLInputElement>(null);

  const adicionarArquivos = async (files: FileList | File[] | null) => {
    if (!files) return;
    const imagens: string[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      try {
        imagens.push(await comprimirImagem(f));
      } catch {
        /* ignore */
      }
    }
    if (imagens.length) setForm((f) => ({ ...f, imagens: [...f.imagens, ...imagens] }));
  };

  const colar = (e: React.ClipboardEvent) => {
    const arquivos = Array.from(e.clipboardData?.files ?? []);
    if (arquivos.length) {
      e.preventDefault();
      void adicionarArquivos(arquivos);
    }
  };

  const salvar = () => {
    if (!form.enunciado.trim() && form.imagens.length === 0) return;
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
    <div className="space-y-5" onPaste={colar}>
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
              label="Enunciado / o que caiu (cole com quebras de linha, parágrafos e imagens)"
              rows={5}
              value={form.enunciado}
              onChange={(e) => setForm({ ...form, enunciado: e.target.value })}
            />
            <AreaTexto
              label="Por que eu errei"
              rows={3}
              value={form.porqueErrei}
              onChange={(e) => setForm({ ...form, porqueErrei: e.target.value })}
            />
            <AreaTexto
              label="Resposta correta / fundamento"
              rows={3}
              value={form.correto}
              onChange={(e) => setForm({ ...form, correto: e.target.value })}
            />
          </div>

          <div className="mt-3">
            <input
              ref={inputArquivo}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                void adicionarArquivos(e.target.files);
                e.target.value = "";
              }}
            />
            <Botao variante="contorno" onClick={() => inputArquivo.current?.click()}>
              <ImagePlus className="h-4 w-4" /> Anexar imagem / print
            </Botao>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Dica: você também pode colar (Ctrl+V) o print direto nesta página.
            </p>
            {form.imagens.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.imagens.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt={`Anexo ${i + 1}`} className="h-20 w-20 rounded-lg border border-border object-cover" />
                    <button
                      onClick={() => setForm((f) => ({ ...f, imagens: f.imagens.filter((_, j) => j !== i) }))}
                      aria-label="Remover imagem"
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
          const aberto = !!abertos[e.id];
          const imagens = e.imagens ?? [];
          return (
            <Cartao key={e.id} cor={d?.corForte}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => setAbertos((a) => ({ ...a, [e.id]: !a[e.id] }))}
                    aria-expanded={aberto}
                    className="w-full text-left"
                  >
                    <p className="flex items-center gap-1 text-[11px] font-bold uppercase" style={{ color: d?.corForte }}>
                      {aberto ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      {d?.curto} {e.topico && `· ${e.topico}`} · {formatarData(e.data)}
                      {imagens.length > 0 && ` · ${imagens.length} img`}
                    </p>
                    <p className={`mt-1 text-sm font-medium ${aberto ? "" : "line-clamp-2"}`}>
                      <TextoFormatado>{e.enunciado || "(somente imagem)"}</TextoFormatado>
                    </p>
                    {!aberto && <span className="text-[11px] text-muted-foreground">Clique para ver a questão completa</span>}
                  </button>

                  {aberto && (
                    <div className="mt-2 space-y-2">
                      {imagens.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {imagens.map((src, i) => (
                            <button key={i} onClick={() => setZoom(src)} className="shrink-0">
                              <img
                                src={src}
                                alt={`Anexo ${i + 1} da questão`}
                                loading="lazy"
                                className="max-h-64 rounded-lg border border-border object-contain"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                      {e.porqueErrei && (
                        <p className="text-sm">
                          <span className="font-semibold text-destructive">Por que errei: </span>
                          <TextoFormatado>{e.porqueErrei}</TextoFormatado>
                        </p>
                      )}
                      {e.correto && (
                        <p className="text-sm">
                          <span className="font-semibold text-primary">Correto: </span>
                          <TextoFormatado>{e.correto}</TextoFormatado>
                        </p>
                      )}
                    </div>
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

      {zoom && (
        <div
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <img src={zoom} alt="Imagem da questão ampliada" className="max-h-full max-w-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}
