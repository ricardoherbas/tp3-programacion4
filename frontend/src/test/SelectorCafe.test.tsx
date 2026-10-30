
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { obtenerProductos } from "../api/productos.api";
import { SelectorCafe } from "../cafe/SelectorCafe";
import { CarritoProvider } from "../carrito/CarritoContext";
import { Carrito } from "../carrito/Carrito";

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
    {
        id: 2,
        nombre: "Expreso Pocillo",
        precio: 5740,
        tipo: "expreso" as const,
        tamanio: "Pocillo",
        gramosCafe: 18,
        variedad: {
            nombre: "Colombia",
            precioPorGramo: 180,
            descripcion: "Café colombiano",
        },
    },
    {
        id: 4,
        nombre: "Expreso Mediano",
        precio: 6280,
        tipo: "expreso" as const,
        tamanio: "Mediano",
        gramosCafe: 27,
        variedad: {
            nombre: "Brasil",
            precioPorGramo: 140,
            descripcion: "Café brasileño",
        },
    },
    {
        id: 10,
        nombre: "Filtrado Pocillo",
        precio: 4040,
        tipo: "filtrado" as const,
        tamanio: "Pocillo",
        gramosCafe: 6,
        variedad: {
            nombre: "Brasil",
            precioPorGramo: 140,
            descripcion: "Café brasileño",
        },
    },
];

function renderSelector() {
    return render(
        <CarritoProvider>
            <SelectorCafe />
            <Carrito />
        </CarritoProvider>,
    );
}

describe("SelectorCafe", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(obtenerProductos).mockResolvedValue(productos);
    });

    it("muestra las opciones de tipo de café", async () => {
        renderSelector();

        expect(
            await screen.findByRole("button", { name: /expreso/i }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /filtrado/i }),
        ).toBeInTheDocument();
    });

    it("no muestra tamaño ni origen hasta seleccionar el tipo", async () => {
        renderSelector();

        await screen.findByRole("button", { name: /expreso/i });

        expect(screen.queryByLabelText(/tamaño/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/origen/i)).not.toBeInTheDocument();
    });

    it("muestra los tamaños disponibles al seleccionar expreso", async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            await screen.findByRole("button", { name: /expreso/i }),
        );

        expect(screen.getByLabelText(/tamaño/i)).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Pocillo" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Mediano" })).toBeInTheDocument();
    });

    it("muestra las variedades disponibles después de elegir el tamaño", async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            await screen.findByRole("button", { name: /expreso/i }),
        );

        await user.selectOptions(screen.getByLabelText(/tamaño/i), "Pocillo");

        expect(screen.getByLabelText(/origen/i)).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Brasil" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Colombia" })).toBeInTheDocument();
    });

    it("muestra el precio devuelto por la API al completar la selección", async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            await screen.findByRole("button", { name: /expreso/i }),
        );

        await user.selectOptions(screen.getByLabelText(/tamaño/i), "Pocillo");
        await user.selectOptions(screen.getByLabelText(/origen/i), "Brasil");

        expect(screen.getByText("Precio: $5020")).toBeInTheDocument();
    });

    it("mantiene deshabilitado agregar al carrito hasta completar la selección", async () => {
        const user = userEvent.setup();
        renderSelector();

        const boton = await screen.findByRole("button", {
            name: /agregar al carrito/i,
        });

        expect(boton).toBeDisabled();

        await user.click(screen.getByRole("button", { name: /expreso/i }));

        expect(boton).toBeDisabled();
    });

    it("agrega al carrito el producto seleccionado con su precio de la API", async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            await screen.findByRole("button", { name: /expreso/i }),
        );

        await user.selectOptions(screen.getByLabelText(/tamaño/i), "Pocillo");
        await user.selectOptions(screen.getByLabelText(/origen/i), "Brasil");

        await user.click(
            screen.getByRole("button", { name: /agregar al carrito/i }),
        );

        expect(
            await screen.findByText("Precio unitario: $5020"),
        ).toBeInTheDocument();

        expect(screen.getByText("Cantidad: 1")).toBeInTheDocument();
    });
});
