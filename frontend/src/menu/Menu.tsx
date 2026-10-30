
import { useEffect, useState } from "react";
import { obtenerProductos } from "../api/productos.api";
import type { Producto } from "../api/productos.schema";

export function Menu() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    async function cargarProductos() {
        setCargando(true);
        setError(false);

        try {
            const resultado = await obtenerProductos();
            setProductos(resultado);
        } catch {
            setError(true);
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        void cargarProductos();
    }, []);

    if (cargando) {
        return <p>Cargando productos...</p>;
    }

    if (error) {
        return (
            <section>
                <p>No se pudieron cargar los productos.</p>
                <button type="button" onClick={() => void cargarProductos()}>
                    Reintentar
                </button>
            </section>
        );
    }

    return (
        <section>
            <h2>Menú</h2>

            {productos.map((producto) => (
                <article key={producto.id}>
                    <h3>{producto.nombre}</h3>
                    <p>${producto.precio}</p>
                </article>
            ))}
        </section>
    );
}
