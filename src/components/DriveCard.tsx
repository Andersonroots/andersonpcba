import { useCallback, useEffect, useRef, useState } from "react";
import { HardDrive, RefreshCw, Save, Unplug } from "lucide-react";
import { dataHoraBrasilia } from "@/lib/plano";
import { useStore } from "@/lib/store";
import { Botao, Cartao } from "@/components/ui-app";
import {
  desconectarDrive,
  iniciarConexaoDrive,
  lerDoDrive,
  salvarNoDrive,
  statusDrive,
} from "@/lib/drive.functions";

function esperarOAuth(popup: Window) {
  return new Promise<void>((resolve, reject) => {
    let poll: number | undefined;
    const limpar = () => {
      window.removeEventListener("message", onMessage);
      if (poll !== undefined) window.clearInterval(poll);
    };
    const onMessage = (event: MessageEvent) => {
      const type = (event.data as { type?: string; connectorId?: string })?.type;
      if (
        event.origin !== window.location.origin ||
        (event.data as { connectorId?: string })?.connectorId !== "google_drive" ||
        (type !== "appUserConnectorOAuthComplete" && type !== "appUserConnectorOAuthFailed")
      )
        return;
      limpar();
      if (type === "appUserConnectorOAuthComplete") return resolve();
      popup.close();
      reject(new Error("Autorização não concluída."));
    };
    window.addEventListener("message", onMessage);
    poll = window.setInterval(() => {
      if (!popup.closed) return;
      limpar();
      reject(new Error("A janela foi fechada antes de concluir."));
    }, 500);
  });
}

export function DriveCard() {
  const { estado, set } = useStore();
  const [conectado, setConectado] = useState(false);
  const [ultimo, setUltimo] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const primeiro = useRef(true);

  const carregarStatus = useCallback(async () => {
    try {
      const s = await statusDrive();
      setConectado(s.conectado);
      setUltimo(s.ultimoBackup);
    } catch {
      /* silencioso */
    }
  }, []);

  useEffect(() => {
    void carregarStatus();
  }, [carregarStatus]);

  const salvar = useCallback(async () => {
    const r = await salvarNoDrive({ data: { conteudo: JSON.stringify(estado) } });
    setUltimo(r.modifiedTime ?? new Date().toISOString());
  }, [estado]);

  // backup automático no Drive quando algo muda
  useEffect(() => {
    if (!conectado) return;
    if (primeiro.current) {
      primeiro.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      void salvar().catch(() => undefined);
    }, 20000);
    return () => window.clearTimeout(t);
  }, [estado, conectado, salvar]);

  const conectar = async () => {
    setMsg(null);
    const popup = window.open("", "drive-oauth", "width=600,height=720");
    if (!popup) {
      setMsg("Libere os pop-ups para autorizar o Google Drive.");
      return;
    }
    setOcupado(true);
    try {
      const { authorizationUrl } = await iniciarConexaoDrive();
      const fim = esperarOAuth(popup);
      popup.location.href = authorizationUrl;
      await fim;
      await carregarStatus();
      setConectado(true);
      setMsg("Google Drive conectado! Seu progresso será salvo lá automaticamente.");
    } catch (e) {
      popup.close();
      setMsg(e instanceof Error ? e.message : "Não foi possível conectar.");
    } finally {
      setOcupado(false);
    }
  };

  const salvarAgora = async () => {
    setOcupado(true);
    setMsg(null);
    try {
      await salvar();
      setMsg("Backup salvo no seu Google Drive.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Falha ao salvar no Drive.");
    } finally {
      setOcupado(false);
    }
  };

  const restaurar = async () => {
    if (!window.confirm("Restaurar os dados do Google Drive? Isso substitui o progresso atual deste aparelho.")) return;
    setOcupado(true);
    setMsg(null);
    try {
      const { conteudo } = await lerDoDrive();
      if (!conteudo) {
        setMsg("Ainda não há backup no Drive.");
        return;
      }
      set(() => JSON.parse(conteudo));
      setMsg("Dados restaurados do Google Drive.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Falha ao restaurar.");
    } finally {
      setOcupado(false);
    }
  };

  const desconectar = async () => {
    setOcupado(true);
    try {
      await desconectarDrive();
      setConectado(false);
      setUltimo(null);
      setMsg("Google Drive desconectado.");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Cartao>
      <h3 className="mb-3 flex items-center gap-2 font-bold">
        <HardDrive className="h-4 w-4 text-primary" /> Backup no Google Drive
      </h3>
      {conectado ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {ultimo
              ? `Último backup no Drive: ${dataHoraBrasilia(ultimo)}`
              : "Nenhum backup enviado ainda."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Botao onClick={salvarAgora} disabled={ocupado}>
              <Save className="h-4 w-4" /> Salvar agora
            </Botao>
            <Botao variante="contorno" onClick={restaurar} disabled={ocupado}>
              <RefreshCw className="h-4 w-4" /> Restaurar do Drive
            </Botao>
            <Botao variante="contorno" onClick={desconectar} disabled={ocupado}>
              <Unplug className="h-4 w-4" /> Desconectar
            </Botao>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Conecte seu Google Drive para guardar uma cópia do progresso em um arquivo na sua própria conta.
          </p>
          <Botao onClick={conectar} disabled={ocupado}>
            <HardDrive className="h-4 w-4" /> Conectar Google Drive
          </Botao>
        </div>
      )}
      {msg && <p className="mt-3 text-xs font-medium text-primary">{msg}</p>}
    </Cartao>
  );
}
