import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import {
  orderCreateSchema,
  orderFilterSchema
} from "@/lib/validations/order";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const parsed = orderFilterSchema.safeParse({
      status: searchParams.get("status") ?? undefined,
      tabId: searchParams.get("tabId") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined
    });
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const where: Record<string, unknown> = {
      restaurantId: user.restaurantId
    };
    if (parsed.data.status) {
      where.status = parsed.data.status;
    }
    if (parsed.data.tabId) {
      where.tabId = parsed.data.tabId;
    }
    if (parsed.data.startDate || parsed.data.endDate) {
      where.createdAt = {
        gte: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        lte: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined
      };
    }
    const orders = await prisma.order.findMany({
      where,
      include: {
        tab: {
          include: {
            table: true,
            waiter: true
          }
        },
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return success(orders);
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = orderCreateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const tab = await prisma.tab.findFirst({
      where: {
        id: parsed.data.tabId,
        restaurantId: user.restaurantId
      },
      include: {
        table: true
      }
    });
    if (!tab) {
      return error("Comanda não encontrada", 404);
    }
    if (tab.status !== "OPEN") {
      return error("Comanda fechada ou cancelada", 409);
    }
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: parsed.data.items.map((item) => item.menuItemId)
        },
        restaurantId: user.restaurantId,
        isAvailable: true
      },
      include: {
        ingredients: {
          include: {
            stockItem: true
          }
        }
      }
    });
    if (menuItems.length !== parsed.data.items.length) {
      return error("Item do cardápio inválido", 400);
    }
    for (const item of parsed.data.items) {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      if (!menuItem) {
        return error("Item do cardápio inválido", 400);
      }
      for (const ingredient of menuItem.ingredients) {
        const required = ingredient.quantity * item.quantity;
        if (ingredient.stockItem.quantity < required) {
          return error(`Estoque insuficiente para ${menuItem.name}`, 409);
        }
      }
    }
    const orderTotal = parsed.data.items.reduce((acc, item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
      return acc + menuItem.price * item.quantity;
    }, 0);
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          tabId: tab.id,
          restaurantId: user.restaurantId,
          notes: parsed.data.notes,
          totalAmount: orderTotal,
          items: {
            create: parsed.data.items.map((item) => {
              const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
              return {
                menuItemId: menuItem.id,
                quantity: item.quantity,
                unitPrice: menuItem.price,
                totalPrice: menuItem.price * item.quantity,
                notes: item.notes
              };
            })
          }
        },
        include: {
          items: {
            include: {
              menuItem: true
            }
          }
        }
      });
      await tx.tab.update({
        where: { id: tab.id },
        data: {
          totalAmount: tab.totalAmount + orderTotal,
          updatedAt: new Date()
        }
      });
      return createdOrder;
    });
    return success(order, 201);
  });
}
