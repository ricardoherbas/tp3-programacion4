import { useCarrito } from "./CarritoContext";

export function Carrito() {
    const { estado, dispatch } = useCarrito();

    if (estado.items.length === 0) {
        return (
            <section aria-labelledby="titulo-carrito">
                <h2 id="titulo-carrito">Carrito</h2>
                <p>Tu carrito está vacío</p>
            </section>
        );
    }

    return (
        <section aria-labelledby="titulo-carrito">
            <h2 id="titulo-carrito">Carrito</h2>

            <ul>
                {estado.items.map((item) => (
                    <li key={item.productoId} aria-label={item.nombre}>
                        <h3>{item.nombre}</h3>
                        <p>Cantidad: {item.cantidad}</p>
                        <p>Precio unitario: ${item.precioUnitario}</p>

                        <button
                            type="button"
                            aria-label={`Sumar ${item.nombre}`}
                            onClick={() =>
                                dispatch({ tipo: "sumar", productoId: item.productoId })
                            }
                        >
                            +
                        </button>

                        <button
                            type="button"
                            aria-label={`Restar ${item.nombre}`}
                            onClick={() =>
                                dispatch({ tipo: "restar", productoId: item.productoId })
                            }
                        >
                            -
                        </button>

                        <button
                            type="button"
                            aria-label={`Quitar ${item.nombre}`}
                            onClick={() =>
                                dispatch({ tipo: "quitar", productoId: item.productoId })
                            }
                        >
                            Quitar
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}