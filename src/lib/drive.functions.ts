import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  authorizeAppUserOAuth,
  callAsAppUser,
  disconnectAppUser,
  exchangeAppUserOAuthCode,
} from "@/integrations/lovable/appUserConnector";
import {
  deleteConnectionForUser,
  getConnectionKeyForUser,
  saveConnectionKeyForUser,
} from "@/lib/appUserConnections.server";

const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";
const CONNECTOR_ID = "google_drive";
const NOME_ARQUIVO = "pcba-investigador-backup.json";

async function acharArquivo(chave: string): Promise<string | null> {
  const q = encodeURIComponent(`name='${NOME_ARQUIVO}' and trashed=false`);
  const res = await callAsAppUser({
    gatewayBaseUrl: GATEWAY_BASE_URL,
    connectionAPIKey: chave,
    connectorId: CONNECTOR_ID,
    path: `/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)&pageSize=1`,
  });
  if (!res.ok) throw new Error(`Drive busca falhou [${res.status}]: ${await res.text()}`);
  const body = (await res.json()) as { files?: Array<{ id: string }> };
  return body.files?.[0]?.id ?? null;
}

export const iniciarConexaoDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientAPIKey = process.env['GOOGLE_DRIVE_APP_USER_CONNECTOR_CLIENT_API_KEY'];
    if (!clientAPIKey) throw new Error("Google Drive não está configurado neste projeto.");
    const request = getRequest();
    if (!request) throw new Error("OAuth precisa iniciar a partir do app.");
    const returnUrl = new URL("/oauth/google-drive/return", request.url).toString();
    const chaveAtual = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    const { authorizationUrl } = await authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectorId: CONNECTOR_ID,
      appUserId: context.userId,
      clientAPIKey,
      returnUrl,
      connectionAPIKey: chaveAtual ?? undefined,
      credentialsConfiguration: {
        scopes: [
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/drive.file",
        ],
      },
    });
    return { authorizationUrl };
  });

export const concluirConexaoDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => {
    if (!input?.code) throw new Error("Código ausente");
    return { code: input.code };
  })
  .handler(async ({ data, context }) => {
    const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(GATEWAY_BASE_URL, data.code);
    if (connectorId !== CONNECTOR_ID) throw new Error("Conector inesperado");
    await saveConnectionKeyForUser(context.userId, connectorId, connectionAPIKey);
    return { ok: true };
  });

export const statusDrive = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const chave = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (!chave) return { conectado: false, ultimoBackup: null as string | null };
    const q = encodeURIComponent(`name='${NOME_ARQUIVO}' and trashed=false`);
    const res = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey: chave,
      connectorId: CONNECTOR_ID,
      path: `/drive/v3/files?q=${q}&fields=files(id,modifiedTime)&pageSize=1`,
    });
    if (!res.ok) return { conectado: true, ultimoBackup: null as string | null };
    const body = (await res.json()) as { files?: Array<{ modifiedTime?: string }> };
    return { conectado: true, ultimoBackup: body.files?.[0]?.modifiedTime ?? null };
  });

export const salvarNoDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { conteudo: string }) => {
    if (typeof input?.conteudo !== "string") throw new Error("Conteúdo inválido");
    return { conteudo: input.conteudo };
  })
  .handler(async ({ data, context }) => {
    const chave = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (!chave) throw new Error("Google Drive não conectado.");
    const existente = await acharArquivo(chave);

    if (existente) {
      const res = await callAsAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionAPIKey: chave,
        connectorId: CONNECTOR_ID,
        path: `/upload/drive/v3/files/${existente}?uploadType=media&fields=id,modifiedTime`,
        init: { method: "PATCH", headers: { "Content-Type": "application/json" }, body: data.conteudo },
      });
      if (!res.ok) throw new Error(`Falha ao salvar no Drive [${res.status}]: ${await res.text()}`);
      const body = (await res.json()) as { modifiedTime?: string };
      return { ok: true, modifiedTime: body.modifiedTime ?? null };
    }

    const boundary = "pcba-" + Math.random().toString(36).slice(2);
    const corpo =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify({ name: NOME_ARQUIVO, mimeType: "application/json" }) +
      `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
      data.conteudo +
      `\r\n--${boundary}--`;
    const res = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey: chave,
      connectorId: CONNECTOR_ID,
      path: `/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime`,
      init: {
        method: "POST",
        headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
        body: corpo,
      },
    });
    if (!res.ok) throw new Error(`Falha ao criar backup no Drive [${res.status}]: ${await res.text()}`);
    const body = (await res.json()) as { modifiedTime?: string };
    return { ok: true, modifiedTime: body.modifiedTime ?? null };
  });

export const lerDoDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const chave = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (!chave) throw new Error("Google Drive não conectado.");
    const id = await acharArquivo(chave);
    if (!id) return { conteudo: null as string | null };
    const res = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey: chave,
      connectorId: CONNECTOR_ID,
      path: `/drive/v3/files/${id}?alt=media`,
    });
    if (!res.ok) throw new Error(`Falha ao ler backup [${res.status}]: ${await res.text()}`);
    return { conteudo: await res.text() };
  });

export const desconectarDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const chave = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (chave) {
      await disconnectAppUser({ gatewayBaseUrl: GATEWAY_BASE_URL, connectionAPIKey: chave, connectorId: CONNECTOR_ID });
      await deleteConnectionForUser(context.userId, CONNECTOR_ID);
    }
    return { ok: true };
  });
