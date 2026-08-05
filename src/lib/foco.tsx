import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";

export interface Ciclo {
  id: string;
  nome: string;
  foco: number;
  pausa: number;
}

export const CICLOS: Ciclo[] = [
  { id: "50", nome: "50 / 10", foco: 50, pausa: 10 },
  { id: "25", nome: "25 / 5", foco: 25, pausa: 5 },
  { id: "90", nome: "90 / 20", foco: 90, pausa: 20 },
];

interface FocoCtx {
  ciclo: Ciclo;
  trocarCiclo: (c: Ciclo) => void;
  emPausa: boolean;
  alternarModo: () => void;
  restante: number;
  rodando: boolean;
  alternarPlay: () => void;
  zerar: () => void;
  ruidoAtivo: string | null;
  tocarRuido: (id: string, tipo: "white" | "pink" | "brown") => void;
  lofi: string | null;
  setLofi: (url: string | null) => void;
}

const Ctx = createContext<FocoCtx | null>(null);

export function FocoProvider({ children }: { children: ReactNode }) {
  const { set, hoje } = useStore();
  const [ciclo, setCiclo] = useState<Ciclo>(CICLOS[0]);
  const [emPausa, setEmPausa] = useState(false);
  const [restante, setRestante] = useState(CICLOS[0].foco * 60);
  const [rodando, setRodando] = useState(false);
  const [ruidoAtivo, setRuidoAtivo] = useState<string | null>(null);
  const [lofi, setLofi] = useState<string | null>(null);

  const fimEm = useRef<number | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const fonte = useRef<AudioBufferSourceNode | null>(null);
  const estadoRef = useRef({ emPausa, ciclo });
  estadoRef.current = { emPausa, ciclo };

  // relógio baseado em timestamp: não sofre throttling ao trocar de aba
  useEffect(() => {
    if (!rodando) return;
    const tick = () => {
      const fim = fimEm.current;
      if (fim == null) return;
      const seg = Math.max(0, Math.round((fim - Date.now()) / 1000));
      setRestante(seg);
      if (seg > 0) return;
      const { emPausa: pausa, ciclo: c } = estadoRef.current;
      fimEm.current = null;
      setRodando(false);
      if (!pausa) {
        set((st) => ({ ...st, pomodoros: [...st.pomodoros, { data: hoje, minutos: c.foco }] }));
        setEmPausa(true);
        setRestante(c.pausa * 60);
      } else {
        setEmPausa(false);
        setRestante(c.foco * 60);
      }
    };
    const t = setInterval(tick, 250);
    const aoVoltar = () => tick();
    document.addEventListener("visibilitychange", aoVoltar);
    window.addEventListener("focus", aoVoltar);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", aoVoltar);
      window.removeEventListener("focus", aoVoltar);
    };
  }, [rodando, hoje, set]);

  const alternarPlay = useCallback(() => {
    setRodando((r) => {
      if (r) {
        const fim = fimEm.current;
        if (fim != null) setRestante(Math.max(0, Math.round((fim - Date.now()) / 1000)));
        fimEm.current = null;
        return false;
      }
      fimEm.current = Date.now() + restante * 1000;
      return true;
    });
  }, [restante]);

  const zerar = useCallback(() => {
    fimEm.current = null;
    setRodando(false);
    setRestante((emPausa ? ciclo.pausa : ciclo.foco) * 60);
  }, [emPausa, ciclo]);

  const trocarCiclo = useCallback((c: Ciclo) => {
    fimEm.current = null;
    setRodando(false);
    setCiclo(c);
    setEmPausa(false);
    setRestante(c.foco * 60);
  }, []);

  const alternarModo = useCallback(() => {
    fimEm.current = null;
    setRodando(false);
    setEmPausa((p) => {
      setRestante((!p ? ciclo.pausa : ciclo.foco) * 60);
      return !p;
    });
  }, [ciclo]);

  const pararRuido = useCallback(() => {
    fonte.current?.stop();
    fonte.current = null;
    setRuidoAtivo(null);
  }, []);

  const tocarRuido = useCallback(
    (id: string, tipo: "white" | "pink" | "brown") => {
      if (ruidoAtivo === id) {
        pararRuido();
        return;
      }
      pararRuido();
      audioCtx.current ||= new AudioContext();
      const ctx = audioCtx.current;
      void ctx.resume();
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
    },
    [ruidoAtivo, pararRuido],
  );

  return (
    <Ctx.Provider
      value={{
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
      }}
    >
      {children}
      {lofi && (
        <div className="fixed bottom-3 right-3 z-50 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold">
            <span>Lo-fi tocando</span>
            <button onClick={() => setLofi(null)} aria-label="Fechar player">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <iframe
            src={`${lofi}?autoplay=1`}
            title="Lo-fi para estudar"
            allow="autoplay; encrypted-media"
            className="aspect-video w-full"
          />
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useFoco() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFoco fora do FocoProvider");
  return c;
}
