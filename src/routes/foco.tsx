import { createFileRoute } from "@tanstack/react-router";
import { Timer, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useStore } from "@/lib/store";
import { useFoco, CICLOS } from "@/lib/foco";
import { Botao, Cartao, Metrica, Titulo } from "@/components/ui-app";
import { LOFI, RUIDOS } from "@/data/motivacao";

export const Route = createFileRoute("/foco")({
  head: () => ({
    meta: [
      { title: "Pomodoro e ruídos — Anderson Investigador PCBA" },
      {
        name: "description",
        content:
          "Cronômetro pomodoro, ruído branco/rosa/marrom e lo-fi para manter o foco nas sessões de estudo do concurso da PC-BA.",
      },
      { property: "og:title", content: "Pomodoro e ruídos — Anderson Investigador PCBA" },
      {
        property: "og:description",
        content: "Ciclos de foco cronometrados com sons ambientes e playlists lo-fi para estudar concentrado.",
      },
    ],
  }),
  component: FocoPage,
});

function FocoPage() {
  const { estado, hoje } = useStore();
  const {
    ciclo,
    trocarCiclo,
    emPausa,
    alternarModo,
    restante,
    rodando,
    alternarPlay,
    zerar,
    ruidoAtivo,
    tocarRuido,
    lofi,
    setLofi,
  } = useFoco();

  const mm = String(Math.floor(restante / 60)).padStart(2, "0");
  const ss = String(restante % 60).padStart(2, "0");
  const minutosHoje = estado.pomodoros.filter((p) => p.data === hoje).reduce((a, p) => a + p.minutos, 0);
  const minutosTotal = estado.pomodoros.reduce((a, p) => a + p.minutos, 0);

  return (
    <div className="space-y-5">
      <Titulo sub="Trabalhe em blocos, descanse de verdade nas pausas e deixe um som de fundo constante.">
        Pomodoro & Ruídos
      </Titulo>

      <div className="grid gap-4 lg:grid-cols-3">
        <Cartao className="lg:col-span-2">
          <div className="flex flex-col items-center py-6">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {emPausa ? "Pausa" : "Foco"}
            </p>
            <p className="my-3 text-6xl font-bold tabular-nums text-primary">
              {mm}:{ss}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Botao onClick={alternarPlay}>
                {rodando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {rodando ? "Pausar" : "Iniciar"}
              </Botao>
              <Botao variante="contorno" onClick={zerar}>
                <RotateCcw className="h-4 w-4" /> Zerar
              </Botao>
              <Botao variante="suave" onClick={alternarModo}>
                Ir para {emPausa ? "foco" : "pausa"}
              </Botao>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              O cronômetro e os ruídos continuam rodando mesmo se você mudar de aba do app ou do navegador.
            </p>
            <div className="mt-5 flex gap-2">
              {CICLOS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => trocarCiclo(c)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                    ciclo.id === c.id ? "bg-primary text-primary-foreground" : "border border-border"
                  }`}
                >
                  {c.nome}
                </button>
              ))}
            </div>
          </div>
        </Cartao>

        <Cartao>
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <Timer className="h-4 w-4 text-primary" /> Tempo focado
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Metrica label="hoje (min)" valor={minutosHoje} destaque="var(--color-primary)" />
            <Metrica label="total (h)" valor={(minutosTotal / 60).toFixed(1)} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Cada bloco de foco concluído é somado automaticamente às suas estatísticas.
          </p>
        </Cartao>
      </div>

      <Cartao>
        <h3 className="mb-3 font-bold">Ruídos de concentração</h3>
        <div className="flex flex-wrap gap-2">
          {RUIDOS.map((r) => (
            <button
              key={r.id}
              onClick={() => tocarRuido(r.id, r.tipo)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                ruidoAtivo === r.id ? "bg-primary text-primary-foreground" : "border border-border"
              }`}
            >
              <span>{r.emoji}</span>
              {r.nome}
              {ruidoAtivo === r.id ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </Cartao>

      <Cartao>
        <h3 className="mb-3 font-bold">Lo-fi para estudar</h3>
        <div className="flex flex-wrap gap-2">
          {LOFI.map((l) => (
            <button
              key={l.id}
              onClick={() => setLofi(lofi === l.url ? null : l.url)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                lofi === l.url ? "bg-primary text-primary-foreground" : "border border-border"
              }`}
            >
              {l.nome}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          O player fica flutuando no canto da tela e continua tocando em qualquer página.
        </p>
      </Cartao>
    </div>
  );
}
