import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import {
  orderCreateSchema,
  orderFilterSchema
} from "@/lib/validations/order";
import { mockDb } from "@/lib/mockDb";

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
    const filter = {
      status: parsed.data.status,
      tabId: parsed.data.tabId,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined
    };
    const orders = mockDb.listOrders(user.restaurantId, filter);
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
    const tab = mockDb.getTabDetails(user.restaurantId, parsed.data.tabId);
    if (!tab) {
      return error("Comanda não encontrada", 404);
    }
    if (tab.status !== "OPEN") {
      return error("Comanda fechada ou cancelada", 409);
    }
    const menuItems = mockDb.findMenuItemsByIds(
      user.restaurantId,
      parsed.data.items.map((item) => item.menuItemId)
    );
    if (menuItems.length !== parsed.data.items.length) {
      return error("Item do cardápio inválido", 400);
    }
    for (const item of parsed.data.items) {
      const menuItem = mockDb.getMenuItem(user.restaurantId, item.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        return error("Item do cardápio inválido", 400);
      }
      for (const ingredient of menuItem.ingredients ?? []) {
        if (!ingredient?.stockItem) {
          return error("Item do cardápio inválido", 400);
        }
        const required = ingredient.quantity * item.quantity;
        if (ingredient.stockItem.quantity < required) {
          return error(`Estoque insuficiente para ${menuItem.name}`, 409);
        }
      }
    }
    const order = mockDb.createOrder(user.restaurantId, parsed.data);
    return success(order, 201);
  });
}
