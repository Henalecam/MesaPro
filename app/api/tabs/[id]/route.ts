import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { mockDb } from "@/lib/mockDb";

const tabUpdateSchema = z.object({
  waiterId: z.string().cuid().optional(),
  discount: z.number().min(0).optional(),
  status: z.enum(["CANCELLED"]).optional()
});

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const tab = mockDb.getTabDetails(user.restaurantId, params.id);
    if (!tab) {
      return error("Comanda não encontrada", 404);
    }
    return success(tab);
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = tabUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const tab = mockDb.getTabDetails(user.restaurantId, params.id);
    if (!tab) {
      return error("Comanda não encontrada", 404);
    }
    if (parsed.data.waiterId && parsed.data.waiterId !== tab.waiterId) {
      const waiter = mockDb.getWaiter(user.restaurantId, parsed.data.waiterId);
      if (!waiter || !waiter.isActive) {
        return error("Garçom inválido", 404);
      }
    }
    if (parsed.data.status === "CANCELLED" && tab.status !== "OPEN") {
      return error("Comanda não pode ser cancelada", 409);
    }
    const updated = mockDb.updateTab(user.restaurantId, params.id, {
      waiterId: parsed.data.waiterId,
      discount: parsed.data.discount,
      status: parsed.data.status
    });
    if (!updated) {
      return error("Comanda não encontrada", 404);
    }
    return success(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const tab = mockDb.getTabDetails(user.restaurantId, params.id);
    if (!tab) {
      return error("Comanda não encontrada", 404);
    }
    if (tab.status !== "OPEN") {
      return error("Comanda não pode ser cancelada", 409);
    }
    const cancelled = mockDb.cancelTab(user.restaurantId, params.id);
    if (!cancelled) {
      return error("Comanda não encontrada", 404);
    }
    return success({ id: tab.id });
  });
}
