interface LogoMarkProps {
  size?: number;
  className?: string;
}

/**
 * Substituto codificado do ícone da placa (casa dentro de um círculo laranja)
 * até termos os arquivos reais de logo da Lara. Mantém a mesma API pública
 * para trocar por um <Image> depois sem mexer em quem usa o componente.
 */
export function LogoMark({ size = 40, className = "" }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="20" fill="var(--orange)" />
      <path
        d="M20 9 L32 19.5 V31 H24 V22 H16 V31 H8 V19.5 Z"
        fill="white"
      />
    </svg>
  );
}

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export function Logo({ variant = "dark", className = "" }: LogoProps) {
  const wordmarkColor = variant === "light" ? "text-white" : "text-charcoal";
  const captionColor = variant === "light" ? "text-orange-tint" : "text-orange";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark />
      <div className="leading-tight">
        <div className={`text-2xl font-extrabold tracking-tight ${wordmarkColor}`}>
          LARA
        </div>
        <div
          className={`text-[10px] font-semibold uppercase tracking-widest ${captionColor}`}
        >
          Negócios Imobiliários
        </div>
      </div>
    </div>
  );
}
