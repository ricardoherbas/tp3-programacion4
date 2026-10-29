
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CarritoProvider } from "../carrito/CarritoContext";
import { Carrito } from "../carrito/Carrito";

function prepararCarrito() {
    return render(
        <CarritoProvider>
            <Carrito />
        </CarritoProvider>,
    );
}

describe("Carrito", () => {
    it("muestra un mensaje cuando el carrito está vacío", () => {
        prepararCarrito();

        expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
    });

    it("muestra nombre, cantidad y precio unitario del producto", async () => {
        const usuario = userEvent.setup();
        prepararCarrito();

        // Este botón de prueba permite cargar un producto mediante el Context.
        // Se agregará en la siguiente iteración usando un consumidor auxiliar.
    });

    it("permite sumar unidades de un producto", async () => {
        prepararCarrito();

        // Se completará cuando el test pueda cargar un producto.
    });

    it("permite restar unidades y quitar el producto al llegar a cero", async () => {
        prepararCarrito();

        // Se completará cuando el test pueda cargar un producto.
    });

    it("permite quitar un producto directamente", async () => {
        prepararCarrito();

        // Se completará cuando el test pueda cargar un producto.
    });

    it("identifica accesiblemente los controles de cada producto", async () => {
        prepararCarrito();

        // Se completará cuando el test pueda cargar un producto.
    });
});
