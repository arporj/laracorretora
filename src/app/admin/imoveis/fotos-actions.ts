"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type FotoActionResultado = { ok: true } | { ok: false; erro: string };

export async function uploadFoto(
  imovelId: string,
  formData: FormData,
): Promise<FotoActionResultado> {
  await requireAuth();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, erro: "Selecione uma imagem." };
  }

  const admin = createAdminClient();
  const supabase = await createClient();

  const extensao = file.type === "image/png" ? "png" : "jpg";
  const path = `${imovelId}/${crypto.randomUUID()}.${extensao}`;

  const { error: uploadError } = await admin.storage
    .from("imovel-fotos")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("Erro ao enviar foto:", uploadError);
    return { ok: false, erro: "Não foi possível enviar a foto." };
  }

  const { data: publicUrlData } = admin.storage.from("imovel-fotos").getPublicUrl(path);

  const { count } = await supabase
    .from("imovel_fotos")
    .select("*", { count: "exact", head: true })
    .eq("imovel_id", imovelId);

  const { error: insertError } = await supabase.from("imovel_fotos").insert({
    imovel_id: imovelId,
    url: publicUrlData.publicUrl,
    storage_path: path,
    ordem: count ?? 0,
  });

  if (insertError) {
    await admin.storage.from("imovel-fotos").remove([path]);
    console.error("Erro ao salvar foto:", insertError);
    return { ok: false, erro: "Não foi possível salvar a foto." };
  }

  revalidatePath(`/admin/imoveis/${imovelId}/editar`);
  revalidatePath("/");
  return { ok: true };
}

export async function deleteFoto(imovelId: string, fotoId: string, storagePath: string) {
  await requireAuth();

  const admin = createAdminClient();
  const supabase = await createClient();

  await admin.storage.from("imovel-fotos").remove([storagePath]);

  const { error } = await supabase.from("imovel_fotos").delete().eq("id", fotoId);
  if (error) throw error;

  revalidatePath(`/admin/imoveis/${imovelId}/editar`);
  revalidatePath("/");
}

export async function reorderFotos(imovelId: string, fotoIdsEmOrdem: string[]) {
  await requireAuth();
  const supabase = await createClient();

  await Promise.all(
    fotoIdsEmOrdem.map((fotoId, index) =>
      supabase.from("imovel_fotos").update({ ordem: index }).eq("id", fotoId),
    ),
  );

  revalidatePath(`/admin/imoveis/${imovelId}/editar`);
  revalidatePath("/");
}
