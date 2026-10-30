
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { obtenerProductos } from "../api/productos.api";

vi.mock("../api/productos.api", () => ({
    obtenerProductos: vi.fn(),
}));

const productos = [
    {
        id: 1,
        nombre: "Expreso Pocillo",
        precio: 5020,
        tipo: "expreso" as const,
        tamanio: "Pocillo",
        gramosCafe: 18,
        variedad: {
            nombre: "Brasil",
            precioPorGramo: 140,
            descripcion: "Café brasileño",
        },
    },
];

describe("App", () => {
    beforeEach(() => {
        vi.mocked(obtenerProductos).mockResolvedValue(productos);
    });

    afterEach(() => {
        window.history.pushState({}, "", "/");
        vi.clearAllMocks();
    });

    it("muestra la mesa que viene en la URL", () => {
        window.history.pushState({}, "", "/?mesa=5");

        render(<App />);

        expect(screen.getByText("Mesa 5")).toBeInTheDocument();
    });

    it("muestra pedido sin mesa si la URL no la trae", () => {
        render(<App />);

        expect(screen.getByText("Pedido sin mesa")).toBeInTheDocument();
    });

    it("muestra el menú de productos", async () => {
        render(<App />);

        expect(
            await screen.findByRole("heading", { name: "Menú" }),
        ).toBeInTheDocument();

        expect(screen.getByText("Expreso Pocillo")).toBeInTheDocument();
        expect(screen.getByText("$5020")).toBeInTheDocument();
    });
});
