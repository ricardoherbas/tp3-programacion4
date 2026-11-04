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
            descripcion: "Acidez Baja, cuerpo Denso y notas Avellana",
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
            descripcion: "Acidez Media, cuerpo Equilibrado y notas Cítricas y florales",
        },
    },
    {
        id: 3,
        nombre: "Expreso Pocillo",
        precio: 6820,
        tipo: "expreso" as const,
        tamanio: "Pocillo",
        gramosCafe: 18,
        variedad: {
            nombre: "Etiopía",
            precioPorGramo: 240,
            descripcion: "Acidez Viva, cuerpo Ligero y notas Frutales",
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
            descripcion: "Acidez Baja, cuerpo Denso y notas Avellana",
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
            descripcion: "Acidez Baja, cuerpo Denso y notas Avellana",
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

    it("no muestra el tamaño ni los orígenes hasta seleccionar el tipo", async () => {
        renderSelector();

        await screen.findByRole("button", { name: /expreso/i });

        expect(screen.queryByLabelText(/tamaño/i)).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Brasil" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Colombia" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Etiopía" })).not.toBeInTheDocument();
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

    it("muestra simultáneamente los tres orígenes después de elegir el tamaño", async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            await screen.findByRole("button", { name: /expreso/i }),
        );

        await user.selectOptions(screen.getByLabelText(/tamaño/i), "Pocillo");

        expect(screen.getByRole("button", { name: "Brasil" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Colombia" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Etiopía" })).toBeInTheDocument();

        expect(screen.queryByLabelText(/origen/i)).not.toBeInTheDocument();
    });

    it("muestra la descripción de cada origen", async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            await screen.findByRole("button", { name: /expreso/i }),
        );

        await user.selectOptions(screen.getByLabelText(/tamaño/i), "Pocillo");

        expect(
            screen.getByText("Acidez Baja, cuerpo Denso y notas Avellana"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Acidez Media, cuerpo Equilibrado y notas Cítricas y florales"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Acidez Viva, cuerpo Ligero y notas Frutales"),
        ).toBeInTheDocument();
    });

    it("muestra el precio correspondiente a cada origen", async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            await screen.findByRole("button", { name: /expreso/i }),
        );

        await user.selectOptions(screen.getByLabelText(/tamaño/i), "Pocillo");

        expect(screen.getByText("Precio: $5020")).toBeInTheDocument();
        expect(screen.getByText("Precio: $5740")).toBeInTheDocument();
        expect(screen.getByText("Precio: $6820")).toBeInTheDocument();
    });

    it("mantiene deshabilitado agregar al carrito hasta seleccionar un origen", async () => {
        const user = userEvent.setup();
        renderSelector();

        const boton = await screen.findByRole("button", {
            name: /agregar al carrito/i,
        });

        expect(boton).toBeDisabled();

        await user.click(screen.getByRole("button", { name: /expreso/i }));

        expect(boton).toBeDisabled();

        await user.selectOptions(screen.getByLabelText(/tamaño/i), "Pocillo");

        expect(boton).toBeDisabled();

        await user.click(screen.getByRole("button", { name: "Colombia" }));

        expect(boton).toBeEnabled();
    });

    it("agrega al carrito el origen seleccionado con su precio devuelto por la API", async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            await screen.findByRole("button", { name: /expreso/i }),
        );

        await user.selectOptions(screen.getByLabelText(/tamaño/i), "Pocillo");

        await user.click(screen.getByRole("button", { name: "Colombia" }));

        await user.click(
            screen.getByRole("button", { name: /agregar al carrito/i }),
        );

        expect(
            await screen.findByText("Precio unitario: $5740"),
        ).toBeInTheDocument();

        expect(screen.getByText("Cantidad: 1")).toBeInTheDocument();
    });
});