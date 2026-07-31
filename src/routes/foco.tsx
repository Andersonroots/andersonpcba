import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Timer, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useStore } from "@/lib/store";
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

const CICLOS = [
  { id: "50", nome: "50 / 10", foco: 50, pausa: 10 },
  { id: "25", nome: "25 / 5", foco: 25, pausa: 5 },
  { id: "90", nome: "90 / 20", foco: 90, pausa: 20 },
];

function FocoPage() {
  const { estado, set, hoje } = useStore();
  const [ciclo, setCiclo] = useState(CICLOS[0]);
  const [emPausa, setEmPausa] = useState(false);
  const [restante, setRestante] = useState(CICLOS[0].foco * 60);
  const [rodando, setRodando] = useState(false);
  const [ruidoAtivo, setRuidoAtivo] = useState<string | null>(null);
  const [lofi, setLofi] = useState<string | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const fonte = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(() => {
      setRestante((r) => {
        if (r > 1) return r - 1;
        clearInterval(t);
        setRodando(false);
        if (!emPausa) {
          set((st) => ({
            ...st,
            pomodoros: [...st.pomodoros, { data: hoje, minutos: ciclo.foco }],
          }));
          setEmPausa(true);
          return ciclo.pausa * 60;
        }
        setEmPausa(false);
        return ciclo.foco * 60;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [rodando, emPausa, ciclo, hoje, set]);

  useEffect(() => {
    setRestante((emPausa ? ciclo.pausa : ciclo.foco) * 60);
    setRodando(false);
  }, [ciclo, emPausa]);

  const pararRuido = () => {
    fonte.current?.stop();
    fonte.current = null;
    setRuidoAtivo(null);
  };

  const tocarRuido = (id: string, tipo: "white" | "pink" | "brown") => {
    if (ruidoAtivo === id) {
      pararRuido();
      return;
    }
    pararRuido();
    audioCtx.current ||= new AudioContext();
    const ctx = audioCtx.current;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const dados = buffer.getChannelData(0);
    let ultimo = 0;
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < dados.length; i++) {
      const branco = Math.random() * 2 - 1;
      if (tipo === "white") dados[i] = branco * 0.25;
      else if (tipo === "brown") {
        ultimo = (ultimo + 0.02 * branco) / 1.02;
        dados[i] = ultimo * 3.2;
      } else {
        b0 = 0.99765 * b0 + branco * 0.099;
        b1 = 0.963 * b1 + branco * 0.2965;
        b2 = 0.57 * b2 + branco * 1.0526;
        dados[i] = (b0 + b1 + b2 + branco * 0.1848) * 0.09;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0.6;
    src.connect(gain).connect(ctx.destination);
    src.start();
    fonte.current = src;
    setRuidoAtivo(id);
  };

  useEffect(() => () => void fonte.current?.stop(), []);

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
              <Botao onClick={() => setRodando((r) => !r)}>
                {rodando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {rodando ? "Pausar" : "Iniciar"}
              </Botao>
              <Botao
                variante="contorno"
                onClick={() => {
                  setRodando(false);
                  setRestante((emPausa ? ciclo.pausa : ciclo.foco) * 60);
                }}
              >
                <RotateCcw className="h-4 w-4" /> Zerar
              </Botao>
              <Botao variante="suave" onClick={() => setEmPausa((p) => !p)}>
                Ir para {emPausa ? "foco" : "pausa"}
              </Botao>
            </div>
            <div className="mt-5 flex gap-2">
              {CICLOS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCiclo(c)}
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
        {lofi && (
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl">
            <iframe
              src={`${lofi}?autoplay=1`}
              title="Lo-fi para estudar"
              allow="autoplay; encrypted-media"
              className="h-full w-full"
            />
          </div>
        )}
      </Cartao>
    </div>
  );
}
