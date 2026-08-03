import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Cloud, Download, LogOut, Palette, Trash2, Upload } from "lucide-react";
import { useStore } from "@/lib/store";
import { AreaTexto, Botao, Campo, Cartao, Titulo } from "@/components/ui-app";
import { supabase } from "@/integrations/supabase/client";
import { DriveCard } from "@/components/DriveCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Anderson Investigador PCBA" },
      {
        name: "description",
        content:
          "Escolha o tema escuro, defina a meta diária de questões, sincronize o progresso na nuvem e exporte seus dados de estudo.",
      },
      { property: "og:title", content: "Configurações — Anderson Investigador PCBA" },
      {
        property: "og:description",
        content: "Temas, meta diária de questões, conta na nuvem, backup e restauração dos dados de estudo.",
      },
    ],
  }),
  component: ConfiguracoesPage,
});

const TEMAS = [
  { id: "verde", nome: "Menta (claro)" },
  { id: "grafite", nome: "Grafite" },
  { id: "meianoite", nome: "Meia-noite" },
  { id: "oceano", nome: "Oceano" },
  { id: "vinho", nome: "Vinho" },
  { id: "floresta", nome: "Floresta" },
  { id: "carvao", nome: "Carvão" },
];

function ConfiguracoesPage() {
  const { estado, set, usuario, ultimaSync, sincronizando, zerarTudo } = useStore();
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmarZerar, setConfirmarZerar] = useState(false);
  const [zerando, setZerando] = useState(false);





  const exportar = () => {
    const blob = new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pcba-estudos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importar = async (f: File) => {
    try {
      const dados = JSON.parse(await f.text());
      set(() => dados);
      setMsg("Backup restaurado com sucesso.");
    } catch {
      setMsg("Arquivo inválido.");
    }
  };

  return (
    <div className="space-y-5">
      <Titulo sub="Ajuste o visual, a meta diária e mantenha tudo salvo na nuvem.">Configurações</Titulo>

      <Cartao>
        <h3 className="mb-3 flex items-center gap-2 font-bold">
          <Palette className="h-4 w-4 text-primary" /> Tema
        </h3>
        <div className="flex flex-wrap gap-2">
          {TEMAS.map((t) => (
            <button
              key={t.id}
              onClick={() => set((st) => ({ ...st, tema: t.id }))}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                estado.tema === t.id ? "bg-primary text-primary-foreground" : "border border-border"
              }`}
            >
              {t.nome}
            </button>
          ))}
        </div>
      </Cartao>

      <Cartao>
        <h3 className="mb-3 font-bold">Metas e anotações</h3>
        <div className="max-w-xs">
          <Campo
            label="Meta de questões por dia"
            type="number"
            value={String(estado.metaQuestoesDia)}
            onChange={(e) => set((st) => ({ ...st, metaQuestoesDia: Number(e.target.value) || 0 }))}
          />
        </div>
        <div className="mt-3">
          <AreaTexto
            label="Bloco de anotações"
            rows={4}
            value={estado.notas}
            onChange={(e) => set((st) => ({ ...st, notas: e.target.value }))}
          />
        </div>
      </Cartao>

      <Cartao>
        <h3 className="mb-3 flex items-center gap-2 font-bold">
          <Cloud className="h-4 w-4 text-primary" /> Conta e sincronização
        </h3>
        {usuario ? (
          <div className="space-y-3">
            <p className="text-sm">
              Conectado como <span className="font-semibold">{usuario.nome ?? usuario.email ?? "usuário"}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {sincronizando ? "Sincronizando…" : ultimaSync ? `Último salvamento: ${ultimaSync}` : "Aguardando alterações."}
            </p>
            <p className="text-xs text-muted-foreground">
              Seus dados ficam salvos na nuvem e aparecem iguais no celular, tablet e computador ao entrar com esta mesma conta Google.
            </p>
            <Botao variante="contorno" onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-4 w-4" /> Sair
            </Botao>
          </div>
        ) : null}
        {msg && <p className="mt-3 text-xs font-medium text-primary">{msg}</p>}
      </Cartao>

      <DriveCard />



      <Cartao>
        <h3 className="mb-3 font-bold">Backup dos dados</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Botao variante="contorno" onClick={exportar}>
            <Download className="h-4 w-4" /> Exportar JSON
          </Botao>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold">
            <Upload className="h-4 w-4" /> Importar backup
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importar(f);
                e.target.value = "";
              }}
            />
          </label>
          <Botao variante="perigo" onClick={() => setConfirmarZerar(true)}>
            <Trash2 className="h-4 w-4" /> Zerar tudo
          </Botao>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Zerar apaga cronograma, questões, erros, simulados, flashcards e pomodoro — neste aparelho e na nuvem.
        </p>
      </Cartao>

      <AlertDialog open={confirmarZerar} onOpenChange={setConfirmarZerar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zerar todos os dados?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso apaga definitivamente o progresso do cronograma, o histórico de questões, o caderno de erros, os
              simulados, os flashcards e os minutos de pomodoro — neste aparelho e também na nuvem. Não dá para desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={zerando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={zerando}
              onClick={async (e) => {
                e.preventDefault();
                setZerando(true);
                await zerarTudo();
                setZerando(false);
                setConfirmarZerar(false);
                setMsg("Tudo zerado com sucesso.");
              }}
            >
              {zerando ? "Zerando…" : "Sim, zerar tudo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

