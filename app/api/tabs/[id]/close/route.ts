import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { tabCloseSchema } from "@/lib/validations/tab";

type Params = {
  params: {
    id: string;
  };
};

export async function POST(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = tabCloseSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const tab = await prisma.tab.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      },
      include: {
        orders: {
          include: {
            items: true
          }
        }
      }
    });
    if (!tab) {
      return error("Comanda não encontrada", 404);
    }
    if (tab.status !== "OPEN") {
      return error("Comanda não pode ser fechada", 409);
    }
    const pending = tab.orders.filter((order) =>
      order.status !== "DELIVERED" && order.status !== "CANCELLED"
    );
    if (pending.length > 0) {
      return error("Existem pedidos pendentes", 409);
    }
    const total = tab.orders.reduce((acc, order) => {
      const itemsTotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
      return acc + itemsTotal;
    }, 0);
    let discountValue = parsed.data.discountValue ?? 0;
    if (parsed.data.discountType === "percentage") {
      discountValue = (total * discountValue) / 100;
    }
    const finalTotal = Math.max(total - discountValue, 0);
    const result = await prisma.$transaction(async (tx) => {
      const updatedTab = await tx.tab.update({
        where: { id: tab.id },
        data: {
          status: "CLOSED",
          discount: discountValue,
          totalAmount: finalTotal,
          paymentMethod: parsed.data.paymentMethod,
          closedAt: new Date()
        },
        include: {
          table: true
        }
      });
      await tx.table.update({
        where: { id: tab.tableId },
        data: {
          status: "AVAILABLE"
        }
      });
      await tx.order.updateMany({
        where: {
          tabId: tab.id,
          status: "READY"
        },
        data: {
          status: "DELIVERED"
        }
      });
      return updatedTab;
    });
    return success(result);
  });
}
