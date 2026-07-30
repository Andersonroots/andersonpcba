import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Home,
  CalendarDays,
  CalendarRange,
  RotateCcw,
  Layers,
  ListChecks,
  NotebookPen,
  FileCheck2,
  Timer,
  BarChart3,
  BookOpen,
  Settings,
  Menu,
  X,
  Shield,
  CloudCheck,
  CloudOff,
} from "lucide-react";
import { useStore } from "@/lib/store";

const ITENS = [
  { to: "/", label: "Home", icon: Home, sub: "Resumo e metas" },
  { to: "/cronograma", label: "Cronograma", icon: CalendarDays, sub: "Metas diárias" },
  { to: "/planejamento", label: "Planejamento", icon: CalendarRange, sub: "Calendário" },
  { to: "/revisoes", label: "Revisões", icon: RotateCcw, sub: "Espaçadas" },
  { to: "/flashcards", label: "Anki Flashcards", icon: Layers, sub: "APKG + SRS" },
  { to: "/questoes", label: "Questões", icon: ListChecks, sub: "Desempenho" },
  { to: "/erros", label: "Caderno de Erros", icon: NotebookPen, sub: "Revisar erros" },
  { to: "/simulados", label: "Simulados", icon: FileCheck2, sub: "Domingos" },
  { to: "/foco", label: "Pomodoro & Ruídos", icon: Timer, sub: "Concentração" },
  { to: "/estatisticas", label: "Estatísticas", icon: BarChart3, sub: "Gráficos" },
  { to: "/edital", label: "Edital verticalizado", icon: BookOpen, sub: "14 disciplinas" },
  { to: "/configuracoes", label: "Configurações", icon: Settings, sub: "Tema e nuvem" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [aberta, setAberta] = useState(false);
  const [recolhida, setRecolhida] = useState(false);
  const { usuario, sincronizando } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setAberta(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {aberta && (
        <button
          aria-label="Fechar menu"
          onClick={() => setAberta(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 lg:sticky lg:top-0 lg:h-screen ${
          aberta ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${recolhida ? "w-[76px]" : "w-[264px]"}`}
      >
        <div className="flex items-center gap-3 px-4 py-5">
          <button
            onClick={() => {
              setRecolhida((r) => !r);
              setAberta(false);
            }}
            className="rounded-lg p-2 transition-colors hover:bg-sidebar-accent"
            aria-label="Recolher menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          {!recolhida && (
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold leading-tight">Anderson</p>
              <p className="truncate text-[11px] opacity-80">Investigador PCBA</p>
            </div>
          )}
        </div>

        <nav className="scroll-fino flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {ITENS.map((it) => {
            const ativo = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
            const Icone = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                title={it.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  ativo ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"
                }`}
              >
                <Icone className="h-[18px] w-[18px] shrink-0" />
                {!recolhida && (
                  <span className="min-w-0 flex-1">
                    <span className="block truncate leading-tight">{it.label}</span>
                    <span className={`block truncate text-[11px] ${ativo ? "opacity-70" : "opacity-70"}`}>
                      {it.sub}
                    </span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {!recolhida && (
          <div className="border-t border-sidebar-border px-4 py-3 text-[11px]">
            <div className="flex items-center gap-2">
              {usuario ? <CloudCheck className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
              <span className="truncate">
                {usuario ? (sincronizando ? "Salvando na nuvem…" : "Salvo na nuvem") : "Salvando no aparelho"}
              </span>
            </div>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:px-8">
          <button
            onClick={() => setAberta((a) => !a)}
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-muted lg:hidden"
            aria-label="Abrir menu"
          >
            {aberta ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Shield className="h-5 w-5 text-primary" />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold leading-tight">Anderson Investigador PCBA</h1>
            <p className="truncate text-[11px] text-muted-foreground">
              PC-BA · Instituto AOCP · prova em 06/12/2026
            </p>
          </div>
          <div className="ml-auto">
            <Link
              to="/configuracoes"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              {usuario?.email ? usuario.email.split("@")[0] : "Entrar"}
            </Link>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-5 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
