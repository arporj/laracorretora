import type { ImovelComFotos, Lead } from "@/lib/domain/types";
import { criarSeedImoveis, criarSeedLeads } from "./data";

interface MockStore {
  imoveis: ImovelComFotos[];
  leads: Lead[];
  proximoCodigo: number;
}

// Sobrevive a hot-reload do Next dev (módulos são recarregados, globalThis não).
const globalForMock = globalThis as unknown as { __laraMockStore?: MockStore };

export function getMockStore(): MockStore {
  if (!globalForMock.__laraMockStore) {
    globalForMock.__laraMockStore = {
      imoveis: criarSeedImoveis(),
      leads: criarSeedLeads(),
      proximoCodigo: 1005,
    };
  }
  return globalForMock.__laraMockStore;
}
