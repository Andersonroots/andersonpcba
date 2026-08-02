import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const iniciarConexaoDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { driveIniciarConexao } = await import("@/lib/drive.server");
    const request = getRequest();
    if (!request) throw new Error("OAuth precisa iniciar a partir do app.");
    const returnUrl = new URL("/oauth/google-drive/return", request.url).toString();
    return driveIniciarConexao(context.userId, returnUrl);
  });

export const concluirConexaoDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => {
    if (!input?.code) throw new Error("Código ausente");
    return { code: input.code };
  })
  .handler(async ({ data, context }) => {
    const { driveConcluirConexao } = await import("@/lib/drive.server");
    return driveConcluirConexao(context.userId, data.code);
  });

export const statusDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { driveStatus } = await import("@/lib/drive.server");
    return driveStatus(context.userId);
  });

export const salvarNoDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { conteudo: string }) => {
    if (typeof input?.conteudo !== "string") throw new Error("Conteúdo inválido");
    return { conteudo: input.conteudo };
  })
  .handler(async ({ data, context }) => {
    const { driveSalvar } = await import("@/lib/drive.server");
    return driveSalvar(context.userId, data.conteudo);
  });

export const lerDoDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { driveLer } = await import("@/lib/drive.server");
    return driveLer(context.userId);
  });

export const desconectarDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { driveDesconectar } = await import("@/lib/drive.server");
    return driveDesconectar(context.userId);
  });
