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

    const productoSeleccionado = cafesTamanio.find(
        (producto) => producto.variedad.nombre === origen
    );

    function seleccionarTipo(nuevoTipo: TipoCafe) {
        setTipo(nuevoTipo);
        setTamanio("");
        setOrigen("");
    }

    function seleccionarOrigen(nuevoOrigen: string) {
        setOrigen(nuevoOrigen);
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
        return <p role="status">Cargando opciones de café...</p>;
    }

    if (error) {
        return <p role="alert">No se pudieron cargar las opciones de café.</p>;
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
                    <h3>Elegí el origen de tu café</h3>

                    <div className="row g-3">
                        {cafesTamanio.map((producto) => (
                            <div className="col-12 col-md-4" key={producto.id}>
                                <article
                                    className={`card h-100 ${
                                        origen === producto.variedad.nombre
                                            ? "border-primary"
                                            : ""
                                    }`}
                                >
                                    <div className="card-body">
                                        <h4 className="card-title">
                                            {producto.variedad.nombre}
                                        </h4>

                                        <p className="card-text">
                                            {producto.variedad.descripcion}
                                        </p>

                                        <p className="card-text">
                                            Precio: ${producto.precio}
                                        </p>

                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            aria-pressed={
                                                origen === producto.variedad.nombre
                                            }
                                            onClick={() =>
                                                seleccionarOrigen(
                                                    producto.variedad.nombre
                                                )
                                            }
                                        >
                                            {producto.variedad.nombre}
                                        </button>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                </div>
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