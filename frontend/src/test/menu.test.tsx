
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { obtenerProductos } from "../api/productos.api";
import { Menu } from "../menu/Menu";

vi.mock("../api/productos.api", () => ({
    obtenerProductos: vi.fn(),
}));

const productos = [
    {
        id: 1,
        nombre: "Expreso",
        precio: 1500,
        tipo: "expreso" as const,
        tamanio: "chico",
        gramosCafe: 10,
        variedad: {
            nombre: "Brasil",
            precioPorGramo: 20,
            descripcion: "Café brasileño",
        },
    },
    {
        id: 2,
        nombre: "Muffin",
        precio: 1200,
        tipo: "pasteleria" as const,
    },
];

describe("Menu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("muestra un mensaje mientras carga los productos", () => {
        vi.mocked(obtenerProductos).mockReturnValue(
            new Promise(() => {}),
        );

        render(<Menu />);

        expect(
            screen.getByText("Cargando productos..."),
        ).toBeInTheDocument();
    });

    it("muestra los productos cuando la consulta finaliza correctamente", async () => {
        vi.mocked(obtenerProductos).mockResolvedValue(productos);

        render(<Menu />);

        expect(await screen.findByText("Expreso")).toBeInTheDocument();
        expect(screen.getByText("Muffin")).toBeInTheDocument();
    });

    it("muestra un mensaje cuando ocurre un error", async () => {
        vi.mocked(obtenerProductos).mockRejectedValue(
            new Error("Error de conexión"),
        );

        render(<Menu />);

        expect(
            await screen.findByText(/no se pudieron cargar los productos/i),
        ).toBeInTheDocument();
    });

    it("vuelve a consultar los productos al presionar reintentar", async () => {
        const user = userEvent.setup();

        vi.mocked(obtenerProductos)
            .mockRejectedValueOnce(new Error("Error de conexión"))
            .mockResolvedValueOnce(productos);

        render(<Menu />);

        await user.click(
            await screen.findByRole("button", { name: /reintentar/i }),
        );

        expect(await screen.findByText("Expreso")).toBeInTheDocument();

        await waitFor(() => {
            expect(obtenerProductos).toHaveBeenCalledTimes(2);
        });
    });
});
