export interface Comodidade {
  value: string;
  label: string;
}

export const COMODIDADES: Comodidade[] = [
  { value: "piscina", label: "Piscina" },
  { value: "churrasqueira", label: "Churrasqueira / espaço gourmet" },
  { value: "academia", label: "Academia" },
  { value: "salao_festas", label: "Salão de festas" },
  { value: "playground", label: "Playground" },
  { value: "portaria_24h", label: "Portaria 24h" },
  { value: "elevador", label: "Elevador" },
  { value: "portao_eletronico", label: "Portão eletrônico" },
  { value: "seguranca_cftv", label: "Segurança / CFTV" },
  { value: "varanda", label: "Varanda / sacada" },
  { value: "mobiliado", label: "Mobiliado" },
  { value: "armarios_planejados", label: "Armários planejados" },
  { value: "aceita_pets", label: "Aceita pets" },
  { value: "quadra_esportiva", label: "Quadra poliesportiva" },
  { value: "coworking", label: "Espaço coworking" },
  { value: "gerador", label: "Gerador de energia" },
];

export const COMODIDADE_LABELS: Record<string, string> = Object.fromEntries(
  COMODIDADES.map((c) => [c.value, c.label]),
);
