const wasmUrl = "/wasm/sql-wasm.wasm";

export interface CartaoBruto {
  frente: string;
  verso: string;
}

const limpar = (s: string) =>
  s
    .replace(/\[sound:[^\]]*\]/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr)>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/** Lê um .apkg (formato antigo .anki2/.anki21 e novo .anki21b comprimido em zstd). */
export async function lerApkg(arquivo: File): Promise<CartaoBruto[]> {
  const [{ default: JSZip }, sqlMod] = await Promise.all([
    import("jszip"),
    import("sql.js"),
  ]);
  const initSqlJs = (sqlMod as unknown as { default: typeof import("sql.js").default }).default;

  const zip = await JSZip.loadAsync(await arquivo.arrayBuffer());
  const nomeDb = ["collection.anki21b", "collection.anki21", "collection.anki2"].find((n) =>
    zip.file(n),
  );
  if (!nomeDb) throw new Error("Arquivo .apkg sem banco de dados reconhecido.");

  let bytes = await zip.file(nomeDb)!.async("uint8array");
  if (nomeDb.endsWith("b")) {
    const { decompress } = await import("fzstd");
    bytes = decompress(bytes);
  }

  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  const db = new SQL.Database(bytes);
  const cartoes: CartaoBruto[] = [];
  try {
    const res = db.exec("SELECT flds FROM notes");
    res[0]?.values.forEach((linha) => {
      const campos = String(linha[0] ?? "").split("\u001f");
      const frente = limpar(campos[0] ?? "");
      const verso = limpar(campos.slice(1).filter(Boolean).join("\n\n"));
      if (frente && verso) cartoes.push({ frente, verso });
      else if (frente && campos.length === 1) {
        // cartão cloze com um único campo
        const semCloze = frente.replace(/\{\{c\d+::(.*?)(::.*?)?\}\}/g, "$1");
        const comLacuna = frente.replace(/\{\{c\d+::(.*?)(::.*?)?\}\}/g, "[...]");
        if (semCloze !== frente) cartoes.push({ frente: comLacuna, verso: semCloze });
      }
    });
  } finally {
    db.close();
  }
  if (!cartoes.length) throw new Error("Nenhum cartão encontrado no arquivo.");
  return cartoes;
}
