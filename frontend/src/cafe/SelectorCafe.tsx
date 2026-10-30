
import { useEffect, useState } from "react";
import { obtenerProductos } from "../api/productos.api";
import type { Producto } from "../api/productos.schema";
import { useCarrito } from "../carrito/CarritoContext";

type TipoCafe = "expreso" | "filtrado";

type Cafe = Extract<Producto, { tipo: TipoCafe }>;

export function SelectorCafe() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [tipo, setTipo] = useState<TipoCafe | null>(null);
    const [tamanio, setTamanio] = useState("");
    const [origen, setOrigen] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    const { dispatch } = useCarrito();

    useEffect(() => {
        async function cargarProductos() {
            try {
                const resultado = await obtenerProductos();
                setProductos(resultado);
                setError(false);
            } catch {
                setError(true);
            } finally {
                setCargando(false);
            }
        }

        void cargarProductos();
    }, []);

    const cafes = productos.filter(
        (producto): producto is Cafe =>
            producto.tipo === "expreso" || producto.tipo === "filtrado"
    );

    const cafesTipo = cafes.filter(
        (producto) => producto.tipo === tipo
    );

    const tamanios = [
        ...new Set(cafesTipo.map((producto) => producto.tamanio))
    ];

    const cafesTamanio = cafesTipo.filter(
        (producto) => producto.tamanio === tamanio
    );

    const origenes = [
        ...new Set(
            cafesTamanio.map((producto) => producto.variedad.nombre)
        )
    ];

    const productoSeleccionado = cafesTamanio.find(
        (producto) => producto.variedad.nombre === origen
    );

    function seleccionarTipo(nuevoTipo: TipoCafe) {
        setTipo(nuevoTipo);
        setTamanio("");
        setOrigen("");
    }

    function agregarAlCarrito() {
        if (!productoSeleccionado) {
            return;
        }

        dispatch({
            tipo: "agregar",
            producto: {
                productoId: productoSeleccionado.id,
                nombre: productoSeleccionado.nombre,
                precioUnitario: productoSeleccionado.precio
            }
        });

        setTipo(null);
        setTamanio("");
        setOrigen("");
    }

    if (cargando) {
        return <p>Cargando opciones de café...</p>;
    }

    if (error) {
        return <p>No se pudieron cargar las opciones de café.</p>;
    }

    return (
        <section aria-labelledby="titulo-selector-cafe">
            <h2 id="titulo-selector-cafe">Seleccioná tu café</h2>

            <div className="d-flex gap-2 mb-3">
                <button
                    type="button"
                    className="btn btn-primary"
                    aria-pressed={tipo === "expreso"}
                    onClick={() => seleccionarTipo("expreso")}
                >
                    Expreso
                </button>

                <button
                    type="button"
                    className="btn btn-primary"
                    aria-pressed={tipo === "filtrado"}
                    onClick={() => seleccionarTipo("filtrado")}
                >
                    Filtrado
                </button>
            </div>

            {tipo !== null && (
                <div className="mb-3">
                    <label htmlFor="tamanio-cafe" className="form-label">
                        Tamaño
                    </label>

                    <select
                        id="tamanio-cafe"
                        className="form-select"
                        value={tamanio}
                        onChange={(event) => {
                            setTamanio(event.target.value);
                            setOrigen("");
                        }}
                    >
                        <option value="">Seleccioná un tamaño</option>

                        {tamanios.map((opcion) => (
                            <option key={opcion} value={opcion}>
                                {opcion}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {tamanio !== "" && (
                <div className="mb-3">
                    <label htmlFor="origen-cafe" className="form-label">
                        Origen
                    </label>

                    <select
                        id="origen-cafe"
                        className="form-select"
                        value={origen}
                        onChange={(event) => setOrigen(event.target.value)}
                    >
                        <option value="">Seleccioná un origen</option>

                        {origenes.map((opcion) => (
                            <option key={opcion} value={opcion}>
                                {opcion}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {productoSeleccionado && (
                <p aria-live="polite">
                    Precio: ${productoSeleccionado.precio}
                </p>
            )}

            <button
                type="button"
                className="btn btn-primary"
                disabled={!productoSeleccionado}
                onClick={agregarAlCarrito}
            >
                Agregar al carrito
            </button>
        </section>
    );
}
