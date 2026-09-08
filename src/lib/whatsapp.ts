const WHATSAPP_NUMBER = "5522981613528";

export function buildWhatsAppLinkPara(numero: string, text: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppLink(text: string): string {
  return buildWhatsAppLinkPara(WHATSAPP_NUMBER, text);
}

export function buildWhatsAppLinkImovel(opts: {
  titulo: string;
  codigo: string;
  url: string;
}): string {
  const texto = [
    `Olá! Tenho interesse no imóvel *${opts.titulo}* (código ${opts.codigo}).`,
    opts.url,
  ].join("\n");
  return buildWhatsAppLink(texto);
}

export function buildWhatsAppLinkGenerico(): string {
  return buildWhatsAppLink("Olá! Vi o site e gostaria de mais informações.");
}
