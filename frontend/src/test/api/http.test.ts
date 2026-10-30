
import { afterEach, describe, expect, it, vi } from "vitest";
import { http } from "../../api/http";

describe("Cliente HTTP", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("realiza una petición GET y devuelve el JSON", async () => {
    const respuesta = { mensaje: "OK" };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(respuesta),
      }),
    );

    const resultado = await http.get<typeof respuesta>("/productos");

    expect(resultado).toEqual(respuesta);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/productos"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("realiza una petición POST enviando datos JSON", async () => {
    const datos = { nombre: "Expreso" };
    const respuesta = { id: 1, ...datos };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(respuesta),
      }),
    );

    const resultado = await http.post<typeof respuesta>("/productos", datos);

    expect(resultado).toEqual(respuesta);
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(datos),
      }),
    );
  });

  it("lanza un error cuando el servidor responde con un estado HTTP fallido", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    );

    await expect(http.get("/productos/999")).rejects.toThrow();
  });

  it("propaga los errores cuando falla la conexión", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Error de conexión")),
    );

    await expect(http.get("/productos")).rejects.toThrow(
      "Error de conexión",
    );
  });
});
