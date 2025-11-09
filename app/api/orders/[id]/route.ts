import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { mockDb } from "@/lib/mockDb";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const order = mockDb.getOrderDetails(user.restaurantId, params.id);
    if (!order) {
      return error("Pedido não encontrado", 404);
    }
    return success(order);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const order = mockDb.getOrderDetails(user.restaurantId, params.id);
    if (!order) {
      return error("Pedido não encontrado", 404);
    }
    if (order.status === "DELIVERED") {
      return error("Pedido já entregue", 409);
    }
    const deliveredItem = order.items.find((item) => item.status === "DELIVERED");
    if (deliveredItem) {
      return error("Pedido com itens entregues não pode ser cancelado", 409);
    }
    const cancelled = mockDb.cancelOrder(user.restaurantId, params.id);
    if (!cancelled) {
      return error("Pedido não encontrado", 404);
    }
    return success({ id: params.id });
  });
}
