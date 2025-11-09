import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import {
  stockAdjustmentSchema,
  stockItemUpdateSchema
} from "@/lib/validations/stockItem";
import { mockDb } from "@/lib/mockDb";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const item = mockDb.getStockItem(user.restaurantId, params.id);
    if (!item) {
      return error("Item não encontrado", 404);
    }
    return success(item);
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const item = mockDb.getStockItem(user.restaurantId, params.id);
    if (!item) {
      return error("Item não encontrado", 404);
    }
    const action = req.nextUrl.searchParams.get("action");
    const body = await req.json();
    if (action === "adjust") {
      const parsed = stockAdjustmentSchema.safeParse(body);
      if (!parsed.success) {
        return error(parsed.error.errors[0].message, 400);
      }
      const updated = mockDb.adjustStockItem(user.restaurantId, params.id, parsed.data.quantity);
      if (!updated) {
        return error("Item não encontrado", 404);
      }
      return success(updated);
    }
    const parsed = stockItemUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const updated = mockDb.updateStockItem(user.restaurantId, params.id, parsed.data);
    if (!updated) {
      return error("Item não encontrado", 404);
    }
    return success(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const item = mockDb.getStockItem(user.restaurantId, params.id);
    if (!item) {
      return error("Item não encontrado", 404);
    }
    if (item.menuItems.length > 0) {
      return error("Item vinculado ao cardápio", 409);
    }
    const removed = mockDb.deleteStockItem(user.restaurantId, params.id);
    if (!removed) {
      return error("Item não encontrado", 404);
    }
    return success({ id: item.id });
  });
}
