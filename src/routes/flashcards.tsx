import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Layers, Plus, Upload, Trash2, Eye } from "lucide-react";
import { useStore } from "@/lib/store";
import { AreaTexto, Botao, Campo, Cartao, Metrica, Selecao, Titulo } from "@/components/ui-app";
import { novoCard, revisar, type Card } from "@/lib/srs";

export const Route = createFileRoute("/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards Anki — Anderson Investigador PCBA" },
      {
        name: "description",
        content:
          "Baralhos de flashcards com repetição espaçada SM-2 e importação de arquivos .apkg do Anki para memorizar a lei seca da PC-BA.",
      },
      { property: "og:title", content: "Flashcards Anki — Anderson Investigador PCBA" },
      {
        property: "og:description",
        content: "Revisão espaçada estilo Anki com importação de baralhos .apkg e criação manual de cartões.",
      },
    ],
  }),
  component: FlashcardsPage,
});

function FlashcardsPage() {
  const { estado, set, hoje } = useStore();
  const [baralho, setBaralho] = useState("Todos");
  const [frente, setFrente] = useState("");
  const [verso, setVerso] = useState("");
  const [novoBaralho, setNovoBaralho] = useState("Lei seca");
  const [mostrando, setMostrando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const baralhos = useMemo(
    () => ["Todos", ...Array.from(new Set(estado.cards.map((c) => c.baralho)))],
    [estado.cards],
  );

  const fila = useMemo(
    () =>
      estado.cards.filter(
        (c) => c.proxima <= hoje && (baralho === "Todos" || c.baralho === baralho),
      ),
    [estado.cards, hoje, baralho],
  );
  const atual: Card | undefined = fila[0];

  const responder = (q: 0 | 3 | 4 | 5) => {
    if (!atual) return;
    set((st) => ({
      ...st,
      cards: st.cards.map((c) => (c.id === atual.id ? revisar(c, q, hoje) : c)),
    }));
    setMostrando(false);
  };

  const adicionar = () => {
    if (!frente.trim() || !verso.trim()) return;
    set((st) => ({
      ...st,
      cards: [...st.cards, novoCard(frente.trim(), verso.trim(), novoBaralho.trim() || "Geral", hoje)],
    }));
    setFrente("");
    setVerso("");
  };

  const importarApkg = async (arquivo: File) => {
    setImportando(true);
    setAviso(null);
    try {
      const [{ default: JSZip }, initSqlJs] = await Promise.all([
        import("jszip"),
        import("sql.js").then((m) => m.default),
      ]);
      const zip = await JSZip.loadAsync(await arquivo.arrayBuffer());
      const nomeDb = ["collection.anki21", "collection.anki2"].find((n) => zip.file(n));
      if (!nomeDb) throw new Error("Arquivo .apkg sem banco de dados reconhecido.");
      const bytes = await zip.file(nomeDb)!.async("uint8array");
      const SQL = await initSqlJs({
        locateFile: (f: string) => `https://sql.js.org/dist/${f}`,
      });
      const db = new SQL.Database(bytes);
      const res = db.exec("SELECT flds FROM notes");
      const limpar = (s: string) =>
        s
          .replace(/<[^>]*>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      const nome = arquivo.name.replace(/\.apkg$/i, "");
      const novos: Card[] = [];
      res[0]?.values.forEach((linha) => {
        const campos = String(linha[0]).split("\u001f");
        const f = limpar(campos[0] ?? "");
        const v = limpar(campos.slice(1).join(" — "));
        if (f && v) novos.push(novoCard(f, v, nome, hoje));
      });
      db.close();
      if (!novos.length) throw new Error("Nenhum cartão encontrado no arquivo.");
      set((st) => ({ ...st, cards: [...st.cards, ...novos] }));
      setBaralho(nome);
      setAviso(`${novos.length} cartões importados do baralho "${nome}".`);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "Não consegui ler esse arquivo .apkg.");
    } finally {
      setImportando(false);
    }
  };

  const apagarBaralho = (nome: string) => {
    if (!confirm(`Apagar todos os cartões do baralho "${nome}"?`)) return;
    set((st) => ({ ...st, cards: st.cards.filter((c) => c.baralho !== nome) }));
    setBaralho("Todos");
  };

  return (
    <div className="space-y-5">
      <Titulo sub="Repetição espaçada SM-2, o mesmo algoritmo do Anki. Importe seus baralhos .apkg ou crie os seus.">
        Anki Flashcards
      </Titulo>

      <div className="grid gap-4 lg:grid-cols-3">
        <Cartao className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h3 className="flex items-center gap-2 font-bold">
              <Layers className="h-4 w-4 text-primary" /> Revisar agora
            </h3>
            <div className="ml-auto w-44">
              <Selecao label="" value={baralho} onChange={(e) => setBaralho(e.target.value)}>
                {baralhos.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Selecao>
            </div>
          </div>

          {atual ? (
            <div className="rounded-2xl border border-border p-5 text-center">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">{atual.baralho}</p>
              <p className="mt-3 text-lg font-semibold">{atual.frente}</p>
              {mostrando ? (
                <>
                  <div className="my-4 border-t border-dashed border-border" />
                  <p className="text-base">{atual.verso}</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <Botao variante="perigo" onClick={() => responder(0)}>
                      Errei
                    </Botao>
                    <Botao variante="contorno" onClick={() => responder(3)}>
                      Difícil
                    </Botao>
                    <Botao variante="suave" onClick={() => responder(4)}>
                      Bom
                    </Botao>
                    <Botao onClick={() => responder(5)}>Fácil</Botao>
                  </div>
                </>
              ) : (
                <Botao className="mt-5" onClick={() => setMostrando(true)}>
                  <Eye className="h-4 w-4" /> Mostrar resposta
                </Botao>
              )}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhum cartão para revisar agora. Volte amanhã ou adicione novos.
            </p>
          )}
        </Cartao>

        <div className="space-y-4">
          <Cartao>
            <h3 className="mb-3 font-bold">Seus baralhos</h3>
            <div className="grid grid-cols-2 gap-2">
              <Metrica label="cartões" valor={estado.cards.length} />
              <Metrica label="para hoje" valor={fila.length} destaque="var(--color-primary)" />
            </div>
            <ul className="mt-4 space-y-1 text-sm">
              {baralhos
                .filter((b) => b !== "Todos")
                .map((b) => (
                  <li key={b} className="flex items-center justify-between gap-2">
                    <span className="truncate">{b}</span>
                    <span className="text-xs text-muted-foreground">
                      {estado.cards.filter((c) => c.baralho === b).length}
                    </span>
                    <button onClick={() => apagarBaralho(b)} aria-label="Apagar baralho" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              {estado.cards.length === 0 && <li className="text-muted-foreground">Nenhum baralho ainda.</li>}
            </ul>
          </Cartao>

          <Cartao>
            <h3 className="mb-2 flex items-center gap-2 font-bold">
              <Upload className="h-4 w-4 text-primary" /> Importar .apkg
            </h3>
            <input
              type="file"
              accept=".apkg"
              disabled={importando}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importarApkg(f);
                e.target.value = "";
              }}
              className="w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-secondary-foreground"
            />
            {importando && <p className="mt-2 text-xs text-muted-foreground">Lendo o baralho…</p>}
            {aviso && <p className="mt-2 text-xs font-medium text-primary">{aviso}</p>}
          </Cartao>
        </div>
      </div>

      <Cartao>
        <h3 className="mb-3 flex items-center gap-2 font-bold">
          <Plus className="h-4 w-4 text-primary" /> Criar cartão
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Campo label="Baralho" value={novoBaralho} onChange={(e) => setNovoBaralho(e.target.value)} />
          <div className="sm:col-span-2">
            <Campo label="Frente (pergunta)" value={frente} onChange={(e) => setFrente(e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <AreaTexto label="Verso (resposta)" rows={2} value={verso} onChange={(e) => setVerso(e.target.value)} />
        </div>
        <Botao className="mt-3" onClick={adicionar}>
          Adicionar cartão
        </Botao>
      </Cartao>
    </div>
  );
}
