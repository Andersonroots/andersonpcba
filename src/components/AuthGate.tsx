import { useState, type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { lovable } from "@/integrations/lovable/index";

export function AuthGate({ children }: { children: ReactNode }) {
  const { usuario, authPronto } = useStore();
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  if (!authPronto) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (usuario) return <>{children}</>;

  const entrar = async () => {
    setOcupado(true);
    setErro(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setErro("Não foi possível entrar com o Google. Tente novamente.");
      setOcupado(false);
      return;
    }
    if (result.redirected) return;
    setOcupado(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-lg font-bold">Anderson — Investigador PCBA</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entre com sua conta Google para acessar o cronograma e manter tudo sincronizado no celular, tablet e computador.
        </p>
        <button
          onClick={entrar}
          disabled={ocupado}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {ocupado ? "Abrindo o Google…" : "Entrar com Google"}
        </button>
        {erro && <p className="mt-3 text-xs font-medium text-destructive">{erro}</p>}
      </div>
    </div>
  );
}
