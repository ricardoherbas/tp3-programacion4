import { http } from "./http";
import { PedidoSchema, type NuevoPedido, type Pedido } from "./pedidos.schema";

export async function crearPedido(nuevo: NuevoPedido): Promise<Pedido> {
  const datos = await http.post<unknown>("/pedidos", nuevo);

  return PedidoSchema.parse(datos);
}