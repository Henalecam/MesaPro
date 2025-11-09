import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { categoryUpdateSchema } from "@/lib/validations/category";
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
    const parsed = categoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const category = mockDb.getCategoryWithMenuItems(user.restaurantId, params.id);
    if (!category) {
      return error("Categoria não encontrada", 404);
    }
    const updated = mockDb.updateCategory(user.restaurantId, params.id, parsed.data);
    if (!updated) {
      return error("Categoria não encontrada", 404);
    }
    return success(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const category = mockDb.getCategoryWithMenuItems(user.restaurantId, params.id);
    if (!category) {
      return error("Categoria não encontrada", 404);
    }
    if (category.menuItems.length > 0) {
      return error("Categoria contém itens", 409);
    }
    const removed = mockDb.deleteCategory(user.restaurantId, params.id);
    if (!removed) {
      return error("Categoria não encontrada", 404);
    }
    return success({ id: category.id });
  });
}
