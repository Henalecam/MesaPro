import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { menuItemUpdateSchema } from "@/lib/validations/menuItem";
import { mockDb } from "@/lib/mockDb";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const item = mockDb.getMenuItem(user.restaurantId, params.id);
    if (!item) {
      return error("Item não encontrado", 404);
    }
    return success(item);
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = menuItemUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const existing = mockDb.getMenuItem(user.restaurantId, params.id);
    if (!existing) {
      return error("Item não encontrado", 404);
    }
    if (parsed.data.categoryId) {
      const category = mockDb.getCategoryWithMenuItems(user.restaurantId, parsed.data.categoryId);
      if (!category || !category.isActive) {
        return error("Categoria inválida", 404);
      }
    }
    if (parsed.data.ingredients) {
      const stockItems = mockDb.findStockItemsByIds(
        user.restaurantId,
        parsed.data.ingredients.map((ingredient) => ingredient.stockItemId)
      );
      if (
        stockItems.length !== parsed.data.ingredients.length ||
        stockItems.some((item) => !item.isActive)
      ) {
        return error("Ingrediente inválido", 400);
      }
    }
    const updated = mockDb.updateMenuItem(user.restaurantId, params.id, parsed.data);
    if (!updated) {
      return error("Item não encontrado", 404);
    }
    return success(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const existing = mockDb.getMenuItem(user.restaurantId, params.id);
    if (!existing) {
      return error("Item não encontrado", 404);
    }
    const removed = mockDb.deleteMenuItem(user.restaurantId, params.id);
    if (!removed) {
      return error("Item não encontrado", 404);
    }
    return success({ id: params.id });
  });
}
