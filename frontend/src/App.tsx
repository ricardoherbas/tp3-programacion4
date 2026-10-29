import { EncabezadoMesa } from "./mesa/EncabezadoMesa";
import { leerMesa } from "./mesa/leerMesa";
import { CarritoProvider } from "./carrito/CarritoContext";
import { Carrito } from "./carrito/Carrito";

export default function App() {
    const mesa = leerMesa(window.location.search);

    return (
        <CarritoProvider>
            <main className="container py-3">
                <EncabezadoMesa mesa={mesa} />
                <Carrito />
            </main>
        </CarritoProvider>
    );
}