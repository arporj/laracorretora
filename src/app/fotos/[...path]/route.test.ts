import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const { createAdminClient } = vi.hoisted(() => ({ createAdminClient: vi.fn() }));
const { aplicarMarcaDagua } = vi.hoisted(() => ({ aplicarMarcaDagua: vi.fn() }));

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient }));
vi.mock("@/lib/fotos/marca-dagua", () => ({ aplicarMarcaDagua }));

const IMOVEL = "914c7a02-9596-4da9-932f-ee4659637190";
const FOTO = "7d1552c6-c88d-42c7-b243-903a031e9aaa";

function fakeStorage(resultado: { data: Blob | null; error: unknown }) {
  const download = vi.fn().mockResolvedValue(resultado);
  const from = vi.fn(() => ({ download }));
  return { client: { storage: { from } }, download, from };
}

async function chamar(path: string[]) {
  const { GET } = await import("./route");
  return GET({} as NextRequest, { params: Promise.resolve({ path }) } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /fotos/[...path]", () => {
  it("baixa a original, aplica a marca e responde com cache longo", async () => {
    const fake = fakeStorage({ data: new Blob([new Uint8Array([1, 2, 3])]), error: null });
    createAdminClient.mockReturnValue(fake.client);
    aplicarMarcaDagua.mockResolvedValue(Buffer.from([9, 9, 9]));

    const res = await chamar([IMOVEL, `${FOTO}.jpg`]);

    expect(res.status).toBe(200);
    expect(fake.from).toHaveBeenCalledWith("imovel-fotos");
    expect(fake.download).toHaveBeenCalledWith(`${IMOVEL}/${FOTO}.jpg`);
    expect(aplicarMarcaDagua).toHaveBeenCalledWith(Buffer.from([1, 2, 3]));
    expect(res.headers.get("Content-Type")).toBe("image/jpeg");
    expect(res.headers.get("Cache-Control")).toContain("immutable");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([9, 9, 9]));
  });

  it.each([
    [["..", "segredo.jpg"]],
    [[IMOVEL, "qualquer.jpg"]],
    [[IMOVEL, `${FOTO}.jpg`, "extra"]],
    [[IMOVEL, `${FOTO}.gif`]],
    [["mock", "x.jpg"]],
  ])("recusa caminho fora do formato esperado (%j) sem tocar no storage", async (path) => {
    const res = await chamar(path);

    expect(res.status).toBe(404);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("foto inexistente: 404", async () => {
    createAdminClient.mockReturnValue(fakeStorage({ data: null, error: { message: "Object not found" } }).client);

    const res = await chamar([IMOVEL, `${FOTO}.jpg`]);

    expect(res.status).toBe(404);
    expect(aplicarMarcaDagua).not.toHaveBeenCalled();
  });

  it("se a marca falhar, NÃO entrega a original: responde 500", async () => {
    createAdminClient.mockReturnValue(
      fakeStorage({ data: new Blob([new Uint8Array([1, 2, 3])]), error: null }).client,
    );
    aplicarMarcaDagua.mockRejectedValue(new Error("sharp falhou"));

    const res = await chamar([IMOVEL, `${FOTO}.jpg`]);

    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Type")).not.toBe("image/jpeg");
    expect(console.error).toHaveBeenCalled();
  });
});
