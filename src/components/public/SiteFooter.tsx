import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-charcoal text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Logo variant="light" />
          <p className="mt-3 text-xs text-white/60">CRECI RJ / 01072759</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <a
            href="https://wa.me/5522981613528"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-tint"
          >
            WhatsApp: (22) 98161-3528
          </a>
          <a
            href="https://instagram.com/laraferreira.corretora"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-tint"
          >
            @laraferreira.corretora
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} LARA Negócios Imobiliários
      </div>
    </footer>
  );
}
