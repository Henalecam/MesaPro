import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { waiterUpdateSchema } from "@/lib/validations/waiter";
import { mockDb } from "@/lib/mockDb";

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const waiter = mockDb.getWaiter(user.restaurantId, params.id);
    if (!waiter) {
      return error("Garçom não encontrado", 404);
    }
    const body = await req.json();
    const parsed = waiterUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const updated = mockDb.updateWaiter(user.restaurantId, params.id, parsed.data);
    if (!updated) {
      return error("Garçom não encontrado", 404);
    }
    return success(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const waiter = mockDb.getWaiter(user.restaurantId, params.id);
    if (!waiter) {
      return error("Garçom não encontrado", 404);
    }
    const updated = mockDb.deactivateWaiter(user.restaurantId, params.id);
    if (!updated) {
      return error("Garçom não encontrado", 404);
    }
    return success(updated);
  });
}
