import { NextRequest } from "next/server";
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { orderStatusSchema } from "@/lib/validations/order";
import { mockDb } from "@/lib/mockDb";

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = orderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const order = mockDb.getOrderDetails(user.restaurantId, params.id);
    if (!order) {
      return error("Pedido não encontrado", 404);
    }
    try {
      const result = mockDb.updateOrderStatus(user.restaurantId, params.id, parsed.data);
      if (!result) {
        return error("Pedido não encontrado", 404);
      }
      return success(result);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("não pode ser cancelado") || err.message.includes("Estoque")) {
          return error(err.message, 409);
        }
        return error(err.message, 400);
      }
      throw err;
    }
  });
}
