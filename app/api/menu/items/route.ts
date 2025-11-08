import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import {
  menuItemCreateSchema,
  menuItemFilterSchema
} from "@/lib/validations/menuItem";

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
    const where: Record<string, unknown> = {
      restaurantId: user.restaurantId
    };
    if (parsed.data.categoryId) {
      where.categoryId = parsed.data.categoryId;
    }
    if (parsed.data.isAvailable !== undefined) {
      where.isAvailable = parsed.data.isAvailable;
    }
    if (parsed.data.search) {
      where.name = {
        contains: parsed.data.search,
        mode: "insensitive"
      };
    }
    const items = await prisma.menuItem.findMany({
      where,
      include: {
        category: true,
        ingredients: {
          include: {
            stockItem: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    });
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
    const category = await prisma.category.findFirst({
      where: {
        id: parsed.data.categoryId,
        restaurantId: user.restaurantId,
        isActive: true
      }
    });
    if (!category) {
      return error("Categoria inválida", 404);
    }
    if (parsed.data.ingredients) {
      const stockItems = await prisma.stockItem.findMany({
        where: {
          id: {
            in: parsed.data.ingredients.map((ingredient) => ingredient.stockItemId)
          },
          restaurantId: user.restaurantId,
          isActive: true
        }
      });
      if (stockItems.length !== parsed.data.ingredients.length) {
        return error("Ingrediente inválido", 400);
      }
    }
    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.menuItem.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          price: parsed.data.price,
          image: parsed.data.image,
          isAvailable: parsed.data.isAvailable,
          preparationTime: parsed.data.preparationTime,
          categoryId: category.id,
          restaurantId: user.restaurantId
        },
        include: {
          category: true,
          ingredients: true
        }
      });
      if (parsed.data.ingredients) {
        await Promise.all(
          parsed.data.ingredients.map((ingredient) =>
            tx.menuItemIngredient.create({
              data: {
                menuItemId: created.id,
                stockItemId: ingredient.stockItemId,
                quantity: ingredient.quantity
              }
            })
          )
        );
      }
      return tx.menuItem.findUnique({
        where: { id: created.id },
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
    return success(item, 201);
  });
}
