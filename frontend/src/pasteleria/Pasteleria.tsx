
import { useEffect, useState } from "react";
import { obtenerProductos } from "../api/productos.api";
import type { Producto } from "../api/productos.schema";
import { useCarrito } from "../carrito/CarritoContext";

type ProductoPasteleria = Extract<Producto, { tipo: "pasteleria" }>;

export function Pasteleria() {
    const [productos, setProductos] = useState<ProductoPasteleria[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    const { dispatch } = useCarrito();

    useEffect(() => {
        async function cargarProductos() {
            try {
                const resultado = await obtenerProductos();

                setProductos(
                    resultado.filter(
                        (producto): producto is ProductoPasteleria =>
                            producto.tipo === "pasteleria"
                    )
                );
                setError(false);
            } catch {
                setError(true);
            } finally {
                setCargando(false);
            }
        }

        void cargarProductos();
    }, []);

    function agregarAlCarrito(producto: ProductoPasteleria) {
        dispatch({
            tipo: "agregar",
            producto: {
                productoId: producto.id,
                nombre: producto.nombre,
                precioUnitario: producto.precio
            }
        });
    }

    if (cargando) {
        return <p>Cargando productos de pastelería...</p>;
    }

    if (error) {
        return <p>No se pudieron cargar los productos de pastelería.</p>;
    }

    return (
        <section aria-labelledby="titulo-pasteleria">
            <h2 id="titulo-pasteleria">Pastelería</h2>

            {productos.length === 0 ? (
                <p>No hay productos de pastelería disponibles.</p>
            ) : (
                <ul>
                    {productos.map((producto) => (
                        <li key={producto.id}>
                            <h3>{producto.nombre}</h3>

                            <p>Precio: ${producto.precio}</p>

                            <button
                                type="button"
                                onClick={() => agregarAlCarrito(producto)}
                                aria-label={`Agregar ${producto.nombre} al carrito`}
                            >
                                Agregar al carrito
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
