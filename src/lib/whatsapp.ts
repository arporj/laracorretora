const WHATSAPP_NUMBER = "5522981613528";

/** Normaliza um telefone digitado pelo visitante para o formato do wa.me (DDI 55 + DDD + número). */
export function normalizarNumeroWhatsApp(telefone: string): string {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.startsWith("55")) return digitos;
  return `55${digitos}`;
}

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
