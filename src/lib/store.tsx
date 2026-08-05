import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Card } from "@/lib/srs";
import { gerarPlano, hojeIso, type Dia, type ProgressoItem } from "@/lib/plano";

export interface RegistroQuestoes {
  id: string;
  data: string;
  disciplinaId: string;
  topicoId?: string | null;
  acertos: number;
  erros: number;
}

export interface Erro {
  id: string;
  data: string;
  disciplinaId: string;
  topico: string;
  enunciado: string;
  porqueErrei: string;
  correto: string;
  revisado: boolean;
  imagens?: string[];
}

export interface Simulado {
  id: string;
  data: string;
  nome: string;
  acertos: number;
  total: number;
  minutos: number;
}

export interface SessaoPomodoro {
  data: string;
  minutos: number;
}

export interface Estado {
  inicio: string;
  progresso: Record<string, ProgressoItem>;
  pins: Record<string, string>;
  questoes: RegistroQuestoes[];
  erros: Erro[];
  simulados: Simulado[];
  cards: Card[];
  pomodoros: SessaoPomodoro[];
  tema: string;
  metaQuestoesDia: number;
  notas: string;
}

const ESTADO_INICIAL: Estado = {
  inicio: hojeIso(),
  progresso: {},
  pins: {},
  questoes: [],
  erros: [],
  simulados: [],
  cards: [],
  pomodoros: [],
  tema: "verde",
  metaQuestoesDia: 40,
  notas: "",
};

const CHAVE = "pcba-anderson-v1";

interface Ctx {
  estado: Estado;
  set: (fn: (e: Estado) => Estado) => void;
  plano: Dia[];
  hoje: string;
  usuario: { id: string; email?: string; nome?: string; avatar?: string } | null;
  authPronto: boolean;
  sincronizando: boolean;
  ultimaSync: string | null;
  concluir: (slotId: string, data: string, feito: boolean) => void;
  moverSlot: (slotId: string, data: string) => void;
  reorganizar: () => void;
  zerarTudo: () => Promise<void>;
  pronto: boolean;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(ESTADO_INICIAL);
  const [pronto, setPronto] = useState(false);
  const [usuario, setUsuario] = useState<{ id: string; email?: string; nome?: string; avatar?: string } | null>(null);
  const [authPronto, setAuthPronto] = useState(false);

  const [sincronizando, setSincronizando] = useState(false);
  const [ultimaSync, setUltimaSync] = useState<string | null>(null);
  const [hoje, setHoje] = useState(hojeIso());
  const primeiraCarga = useRef(true);

  // carrega do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAVE);
      if (raw) setEstado({ ...ESTADO_INICIAL, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setPronto(true);
    const t = setInterval(() => setHoje(hojeIso()), 60000);
    return () => clearInterval(t);
  }, []);

  // sessão da nuvem
  useEffect(() => {
    const mapear = (u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null) =>
      u
        ? {
            id: u.id,
            email: u.email ?? undefined,
            nome: (u.user_metadata?.full_name as string | undefined) ?? (u.user_metadata?.name as string | undefined),
            avatar: (u.user_metadata?.avatar_url as string | undefined) ?? (u.user_metadata?.picture as string | undefined),
          }
        : null;
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(mapear(data.session?.user ?? null));
      setAuthPronto(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUsuario(mapear(session?.user ?? null));
      setAuthPronto(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);


  // baixa da nuvem ao logar
  useEffect(() => {
    if (!usuario || !pronto) return;
    let cancelado = false;
    (async () => {
      setSincronizando(true);
      const { data } = await supabase.from("estudo_estado").select("dados").eq("user_id", usuario.id).maybeSingle();
      if (!cancelado && data?.dados && Object.keys(data.dados).length > 0) {
        setEstado((atual) => {
          const nuvem = data.dados as Partial<Estado>;
          const localVazio = Object.keys(atual.progresso).length === 0 && atual.questoes.length === 0;
          return localVazio ? { ...ESTADO_INICIAL, ...nuvem } : atual;
        });
      }
      if (!cancelado) {
        setSincronizando(false);
        setUltimaSync(new Date().toLocaleTimeString("pt-BR"));
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [usuario, pronto]);

  // salva local + nuvem (debounce)
  useEffect(() => {
    if (!pronto) return;
    localStorage.setItem(CHAVE, JSON.stringify(estado));
    if (primeiraCarga.current) {
      primeiraCarga.current = false;
      return;
    }
    if (!usuario) return;
    const t = setTimeout(async () => {
      setSincronizando(true);
      await supabase
        .from("estudo_estado")
        .upsert({ user_id: usuario.id, dados: estado as never, atualizado_em: new Date().toISOString() });
      setSincronizando(false);
      setUltimaSync(new Date().toLocaleTimeString("pt-BR"));
    }, 1200);
    return () => clearTimeout(t);
  }, [estado, usuario, pronto]);

  // tema
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.dataset.tema = estado.tema;
  }, [estado.tema]);

  const set = useCallback((fn: (e: Estado) => Estado) => setEstado((e) => fn(e)), []);

  const plano = useMemo(
    () => gerarPlano({ inicio: estado.inicio, progresso: estado.progresso, pins: estado.pins, hoje }),
    [estado.inicio, estado.progresso, estado.pins, hoje],
  );

  const concluir = useCallback((slotId: string, data: string, feito: boolean) => {
    setEstado((e) => {
      const progresso = { ...e.progresso };
      if (feito) progresso[slotId] = { feito: true, data };
      else delete progresso[slotId];
      return { ...e, progresso };
    });
  }, []);

  const moverSlot = useCallback((slotId: string, data: string) => {
    setEstado((e) => ({ ...e, pins: { ...e.pins, [slotId]: data } }));
  }, []);

  const reorganizar = useCallback(() => {
    setEstado((e) => ({ ...e, pins: {}, inicio: e.inicio }));
  }, []);

  const zerarTudo = useCallback(async () => {
    const novo: Estado = { ...ESTADO_INICIAL, inicio: hojeIso(), tema: estado.tema };
    setEstado(novo);
    try {
      localStorage.removeItem(CHAVE);
      localStorage.setItem(CHAVE, JSON.stringify(novo));
    } catch {
      /* ignore */
    }
    if (usuario) {
      setSincronizando(true);
      await supabase
        .from("estudo_estado")
        .upsert({ user_id: usuario.id, dados: novo as never, atualizado_em: new Date().toISOString() });
      setSincronizando(false);
      setUltimaSync(new Date().toLocaleTimeString("pt-BR"));
    }
  }, [usuario, estado.tema]);

  return (
    <StoreCtx.Provider
      value={{ estado, set, plano, hoje, usuario, authPronto, sincronizando, ultimaSync, concluir, moverSlot, reorganizar, zerarTudo, pronto }}
    >

      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore fora do StoreProvider");
  return c;
}
