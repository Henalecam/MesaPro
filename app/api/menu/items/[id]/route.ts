import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { menuItemUpdateSchema } from "@/lib/validations/menuItem";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const item = await prisma.menuItem.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      },
      include: {
        category: true,
        ingredients: {
          include: {
            stockItem: true
          }
        }
      }
    });
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
    const item = await prisma.menuItem.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      }
    });
    if (!item) {
      return error("Item não encontrado", 404);
    }
    if (parsed.data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: parsed.data.categoryId,
          restaurantId: user.restaurantId
        }
      });
      if (!category) {
        return error("Categoria inválida", 404);
      }
    }
    if (parsed.data.ingredients) {
      const stockItems = await prisma.stockItem.findMany({
        where: {
          id: {
            in: parsed.data.ingredients.map((ingredient) => ingredient.stockItemId)
          },
          restaurantId: user.restaurantId
        }
      });
      if (stockItems.length !== parsed.data.ingredients.length) {
        return error("Ingrediente inválido", 400);
      }
    }
    const updated = await prisma.$transaction(async (tx) => {
      const baseUpdate = await tx.menuItem.update({
        where: { id: item.id },
        data: {
          name: parsed.data.name ?? item.name,
          description: parsed.data.description ?? item.description,
          price: parsed.data.price ?? item.price,
          image: parsed.data.image ?? item.image,
          isAvailable:
            parsed.data.isAvailable !== undefined ? parsed.data.isAvailable : item.isAvailable,
          preparationTime: parsed.data.preparationTime ?? item.preparationTime,
          categoryId: parsed.data.categoryId ?? item.categoryId
        }
      });
      if (parsed.data.ingredients) {
        await tx.menuItemIngredient.deleteMany({
          where: { menuItemId: baseUpdate.id }
        });
        await Promise.all(
          parsed.data.ingredients.map((ingredient) =>
            tx.menuItemIngredient.create({
              data: {
                menuItemId: baseUpdate.id,
                stockItemId: ingredient.stockItemId,
                quantity: ingredient.quantity
              }
            })
          )
        );
      }
      return tx.menuItem.findUnique({
        where: { id: baseUpdate.id },
        include: {
          category: true,
          ingredients: {
            include: {
              stockItem: true
            }
          }
        }
      });
    });
    return success(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const item = await prisma.menuItem.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      }
    });
    if (!item) {
      return error("Item não encontrado", 404);
    }
    await prisma.$transaction(async (tx) => {
      await tx.menuItemIngredient.deleteMany({
        where: { menuItemId: item.id }
      });
      await tx.menuItem.delete({
        where: { id: item.id }
      });
    });
    return success({ id: item.id });
  });
}
