import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import {
  menuItemCreateSchema,
  menuItemFilterSchema
} from "@/lib/validations/menuItem";
import { mockDb } from "@/lib/mockDb";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const parsed = menuItemFilterSchema.safeParse({
      categoryId: searchParams.get("categoryId") ?? undefined,
      isAvailable:
        searchParams.get("isAvailable") !== null
          ? searchParams.get("isAvailable") === "true"
          : undefined,
      search: searchParams.get("search") ?? undefined
    });
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const items = mockDb.listMenuItems(user.restaurantId, parsed.data);
    return success(items);
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = menuItemCreateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const category = mockDb.getCategoryWithMenuItems(user.restaurantId, parsed.data.categoryId);
    if (!category) {
      return error("Categoria inválida", 404);
    }
    if (!category.isActive) {
      return error("Categoria inválida", 404);
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
    const item = mockDb.createMenuItem(user.restaurantId, parsed.data);
    return success(item, 201);
  });
}
