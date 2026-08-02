// SERVER ONLY — never import from browser code.
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

async function acharArquivo(chave: string): Promise<{ id: string; modifiedTime?: string } | null> {
  const q = encodeURIComponent(`name='${NOME_ARQUIVO}' and trashed=false`);
  const res = await callAsAppUser({
    gatewayBaseUrl: GATEWAY_BASE_URL,
    connectionAPIKey: chave,
    connectorId: CONNECTOR_ID,
    path: `/drive/v3/files?q=${q}&fields=files(id,modifiedTime)&pageSize=1`,
  });
  if (!res.ok) throw new Error(`Busca no Drive falhou [${res.status}]: ${await res.text()}`);
  const body = (await res.json()) as { files?: Array<{ id: string; modifiedTime?: string }> };
  return body.files?.[0] ?? null;
}

export async function driveIniciarConexao(userId: string, returnUrl: string) {
  const clientAPIKey = process.env['GOOGLE_DRIVE_APP_USER_CONNECTOR_CLIENT_API_KEY'];
  if (!clientAPIKey) throw new Error("Google Drive não está configurado neste projeto.");
  const chaveAtual = await getConnectionKeyForUser(userId, CONNECTOR_ID);
  const { authorizationUrl } = await authorizeAppUserOAuth({
    gatewayBaseUrl: GATEWAY_BASE_URL,
    connectorId: CONNECTOR_ID,
    appUserId: userId,
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
}

export async function driveConcluirConexao(userId: string, code: string) {
  const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(GATEWAY_BASE_URL, code);
  if (connectorId !== CONNECTOR_ID) throw new Error("Conector inesperado");
  await saveConnectionKeyForUser(userId, connectorId, connectionAPIKey);
  return { ok: true };
}

export async function driveStatus(userId: string) {
  const chave = await getConnectionKeyForUser(userId, CONNECTOR_ID);
  if (!chave) return { conectado: false, ultimoBackup: null as string | null };
  try {
    const arq = await acharArquivo(chave);
    return { conectado: true, ultimoBackup: arq?.modifiedTime ?? null };
  } catch {
    return { conectado: true, ultimoBackup: null as string | null };
  }
}

export async function driveSalvar(userId: string, conteudo: string) {
  const chave = await getConnectionKeyForUser(userId, CONNECTOR_ID);
  if (!chave) throw new Error("Google Drive não conectado.");
  const existente = await acharArquivo(chave);

  if (existente) {
    const res = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey: chave,
      connectorId: CONNECTOR_ID,
      path: `/upload/drive/v3/files/${existente.id}?uploadType=media&fields=id,modifiedTime`,
      init: { method: "PATCH", headers: { "Content-Type": "application/json" }, body: conteudo },
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
    conteudo +
    `\r\n--${boundary}--`;
  const res = await callAsAppUser({
    gatewayBaseUrl: GATEWAY_BASE_URL,
    connectionAPIKey: chave,
    connectorId: CONNECTOR_ID,
    path: `/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime`,
    init: { method: "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body: corpo },
  });
  if (!res.ok) throw new Error(`Falha ao criar backup no Drive [${res.status}]: ${await res.text()}`);
  const body = (await res.json()) as { modifiedTime?: string };
  return { ok: true, modifiedTime: body.modifiedTime ?? null };
}

export async function driveLer(userId: string) {
  const chave = await getConnectionKeyForUser(userId, CONNECTOR_ID);
  if (!chave) throw new Error("Google Drive não conectado.");
  const arq = await acharArquivo(chave);
  if (!arq) return { conteudo: null as string | null };
  const res = await callAsAppUser({
    gatewayBaseUrl: GATEWAY_BASE_URL,
    connectionAPIKey: chave,
    connectorId: CONNECTOR_ID,
    path: `/drive/v3/files/${arq.id}?alt=media`,
  });
  if (!res.ok) throw new Error(`Falha ao ler backup [${res.status}]: ${await res.text()}`);
  return { conteudo: await res.text() };
}

export async function driveDesconectar(userId: string) {
  const chave = await getConnectionKeyForUser(userId, CONNECTOR_ID);
  if (chave) {
    await disconnectAppUser({ gatewayBaseUrl: GATEWAY_BASE_URL, connectionAPIKey: chave, connectorId: CONNECTOR_ID });
    await deleteConnectionForUser(userId, CONNECTOR_ID);
  }
  return { ok: true };
}
