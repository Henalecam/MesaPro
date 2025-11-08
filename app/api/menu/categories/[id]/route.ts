import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { categoryUpdateSchema } from "@/lib/validations/category";

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
    const category = await prisma.category.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      }
    });
    if (!category) {
      return error("Categoria não encontrada", 404);
    }
    const updated = await prisma.category.update({
      where: { id: category.id },
      data: parsed.data
    });
    return success(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const category = await prisma.category.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      },
      include: {
        menuItems: true
      }
    });
    if (!category) {
      return error("Categoria não encontrada", 404);
    }
    if (category.menuItems.length > 0) {
      return error("Categoria contém itens", 409);
    }
    await prisma.category.delete({
      where: { id: category.id }
    });
    return success({ id: category.id });
  });
}
