/**
 * Suba este número sempre que a marca d'água mudar (ex: logo oficial): ele
 * entra na URL das fotos, então navegadores e CDN buscam a versão nova em vez
 * de reaproveitar o cache de um ano.
 */
export const VERSAO_MARCA_DAGUA = 1;

/**
 * URL para exibir uma foto de imóvel — sempre pela rota /fotos, que aplica a
 * marca d'água. Nunca use `foto.url` (link direto do storage) para exibir:
 * o bucket é privado e a original não deve ser acessível.
 *
 * Exceção: fotos do modo demonstração (`storage_path` começando com "mock/"),
 * que não existem no storage.
 */
export function urlFoto(foto: { url: string; storage_path: string }): string {
  if (foto.storage_path.startsWith("mock/")) return foto.url;
  return `/fotos/${foto.storage_path}?v=${VERSAO_MARCA_DAGUA}`;
}
