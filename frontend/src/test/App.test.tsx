import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";

describe("App", () => {
    afterEach(() => {
        window.history.pushState({}, "", "/");
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
});