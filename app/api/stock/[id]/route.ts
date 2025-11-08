import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import {
  stockAdjustmentSchema,
  stockItemUpdateSchema
} from "@/lib/validations/stockItem";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const item = await prisma.stockItem.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      },
      include: {
        menuItems: {
          include: {
            menuItem: true
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
    const item = await prisma.stockItem.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      }
    });
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
      const updated = await prisma.stockItem.update({
        where: { id: item.id },
        data: {
          quantity: item.quantity + parsed.data.quantity
        }
      });
      return success(updated);
    }
    const parsed = stockItemUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const updated = await prisma.stockItem.update({
      where: { id: item.id },
      data: parsed.data
    });
    return success(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const item = await prisma.stockItem.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      },
      include: {
        menuItems: true
      }
    });
    if (!item) {
      return error("Item não encontrado", 404);
    }
    if (item.menuItems.length > 0) {
      return error("Item vinculado ao cardápio", 409);
    }
    await prisma.stockItem.delete({
      where: { id: item.id }
    });
    return success({ id: item.id });
  });
}
