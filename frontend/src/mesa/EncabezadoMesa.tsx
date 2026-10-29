interface EncabezadoMesaProps {
    mesa: number | null;
}

export function EncabezadoMesa({ mesa }: EncabezadoMesaProps) {
    return (
        <header className="mb-3">
            <h1 className="h3 mb-1">Cafetería Origen</h1>
            <p className="text-muted mb-0">{mesa === null ? "Pedido sin mesa" : `Mesa ${mesa}`}</p>
        </header>
    );
}