import type { ReactNode } from "react";

export function Cartao({
  children,
  className = "",
  cor,
}: {
  children: ReactNode;
  className?: string;
  cor?: string;
}) {
  return (
    <div
      className={`card-app p-4 ${className}`}
      style={cor ? { borderLeft: `4px solid ${cor}` } : undefined}
    >
      {children}
    </div>
  );
}

export function Barra({ valor, cor }: { valor: number; cor?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, valor))}%`, background: cor || "var(--color-primary)" }}
      />
    </div>
  );
}

export function Titulo({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold lg:text-2xl">{children}</h2>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Metrica({
  label,
  valor,
  destaque,
  sufixo,
}: {
  label: string;
  valor: string | number;
  destaque?: string;
  sufixo?: string;
}) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold" style={destaque ? { color: destaque } : undefined}>
        {valor}
        {sufixo && <span className="text-sm font-semibold">{sufixo}</span>}
      </p>
      <p className="text-[11px] leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}

export function Botao({
  children,
  onClick,
  variante = "primario",
  className = "",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variante?: "primario" | "suave" | "contorno" | "perigo";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const estilos: Record<string, string> = {
    primario: "bg-primary text-primary-foreground hover:opacity-90",
    suave: "bg-secondary text-secondary-foreground hover:bg-accent",
    contorno: "border border-border bg-transparent hover:bg-muted",
    perigo: "bg-destructive text-destructive-foreground hover:opacity-90",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${estilos[variante]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Campo({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

export function AreaTexto({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-muted-foreground">{label}</span>
      <textarea
        {...props}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

export function Selecao({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-muted-foreground">{label}</span>
      <select
        {...props}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      >
        {children}
      </select>
    </label>
  );
}
