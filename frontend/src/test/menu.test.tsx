import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Menu } from "../menu/Menu";

describe("Menu", () => {
    it("muestra el título de la sección", () => {
        render(<Menu />);

        expect(
            screen.getByRole("heading", { name: "Menú" }),
        ).toBeInTheDocument();
    });

    it("no muestra un listado de productos", () => {
        render(<Menu />);

        expect(screen.queryByText("Expreso")).not.toBeInTheDocument();
        expect(screen.queryByText("Muffin")).not.toBeInTheDocument();
    });
});