import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { tabCloseSchema } from "@/lib/validations/tab";
import { mockDb } from "@/lib/mockDb";

type Params = {
  params: {
    id: string;
  };
};

export async function POST(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = tabCloseSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const tab = mockDb.getTabDetails(user.restaurantId, params.id);
    if (!tab) {
      return error("Comanda não encontrada", 404);
    }
    if (tab.status !== "OPEN") {
      return error("Comanda não pode ser fechada", 409);
    }
    const pending = tab.orders.filter(
      (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED"
    );
    if (pending.length > 0) {
      return error("Existem pedidos pendentes", 409);
    }
    const result = mockDb.closeTab(user.restaurantId, params.id, parsed.data);
    if (!result) {
      return error("Erro ao fechar comanda", 500);
    }
    return success(result);
  });
}
