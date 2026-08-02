import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { concluirConexaoDrive } from "@/lib/drive.functions";

export const Route = createFileRoute("/oauth/google-drive/return")({
  head: () => ({
    meta: [
      { title: "Conectando o Google Drive — Anderson Investigador PCBA" },
      { name: "description", content: "Finalizando a autorização do backup no Google Drive." },
      { property: "og:title", content: "Conectando o Google Drive" },
      { property: "og:description", content: "Finalizando a autorização do backup no Google Drive." },
    ],
  }),
  component: RetornoDrive,
});

function RetornoDrive() {
  const [msg, setMsg] = useState("Finalizando a conexão…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const avisar = (type: "appUserConnectorOAuthComplete" | "appUserConnectorOAuthFailed") => {
      window.opener?.postMessage({ type, connectorId: "google_drive" }, window.location.origin);
      window.close();
    };
    if (params.get("success") !== "true") {
      setMsg(params.get("error") ?? "A autorização não foi concluída.");
      avisar("appUserConnectorOAuthFailed");
      return;
    }
    const code = params.get("code");
    if (!code) {
      if (params.get("offline_access_allowed") === "false") {
        avisar("appUserConnectorOAuthComplete");
        return;
      }
      setMsg("A autorização terminou sem código de troca.");
      avisar("appUserConnectorOAuthFailed");
      return;
    }
    void concluirConexaoDrive({ data: { code } })
      .then(() => avisar("appUserConnectorOAuthComplete"))
      .catch(() => {
        setMsg("Não foi possível concluir a conexão.");
        avisar("appUserConnectorOAuthFailed");
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">{msg}</p>
    </div>
  );
}
