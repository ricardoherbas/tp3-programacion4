import { EncabezadoMesa } from "./mesa/EncabezadoMesa";
import { leerMesa } from "./mesa/leerMesa";

export default function App() {
    const mesa = leerMesa(window.location.search);

    return (
        <main className="container py-3">
            <EncabezadoMesa mesa={mesa} />
        </main>
    );
}