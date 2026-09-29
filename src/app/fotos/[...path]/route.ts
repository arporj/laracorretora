import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { aplicarMarcaDagua } from "@/lib/fotos/marca-dagua";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
/** Formato gerado em uploadFoto: `<imovelId>/<uuid>.<jpg|png>`. */
const STORAGE_PATH_REGEX = new RegExp(`^${UUID}/${UUID}\\.(jpg|png)$`);

/**
 * Entrega a foto de um imóvel com marca d'água. É o único caminho de exibição:
 * o bucket `imovel-fotos` é privado, então a original só é lida aqui, com o
 * service-role client. O caminho no storage tem dois UUIDs aleatórios, então
 * não dá pra adivinhar fotos que não estão publicadas no site.
 *
 * O cache é longo e imutável: a mesma foto nunca muda de conteúdo, e quando
 * a marca muda o `?v=` da URL muda junto (ver VERSAO_MARCA_DAGUA).
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/fotos/[...path]">) {
  const { path } = await ctx.params;
  const storagePath = path.join("/");

  if (!STORAGE_PATH_REGEX.test(storagePath)) {
    return new Response("Foto não encontrada.", { status: 404 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from("imovel-fotos").download(storagePath);

  if (error || !data) {
    console.error(`Erro ao baixar foto do storage (${storagePath}):`, error);
    return new Response("Foto não encontrada.", { status: 404 });
  }

  let marcada: Buffer;
  try {
    marcada = await aplicarMarcaDagua(Buffer.from(await data.arrayBuffer()));
  } catch (err) {
    // Nunca cai para a original sem marca: melhor não exibir do que vazar.
    console.error("Erro ao aplicar marca d'água:", err);
    return new Response("Não foi possível exibir a foto.", { status: 500 });
  }

  return new Response(new Uint8Array(marcada), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
