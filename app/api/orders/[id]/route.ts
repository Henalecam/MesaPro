import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      },
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
      }
    });
    if (!order) {
      return error("Pedido não encontrado", 404);
    }
    return success(order);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      },
      include: {
        items: true,
        tab: true
      }
    });
    if (!order) {
      return error("Pedido não encontrado", 404);
    }
    if (order.status === "DELIVERED") {
      return error("Pedido já entregue", 409);
    }
    const deliveredItem = order.items.find((item) => item.status === "DELIVERED");
    if (deliveredItem) {
      return error("Pedido com itens entregues não pode ser cancelado", 409);
    }
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          items: {
            updateMany: {
              where: {},
              data: {
                status: "CANCELLED"
              }
            }
          }
        }
      });
      await tx.tab.update({
        where: { id: order.tabId },
        data: {
          totalAmount: Math.max(order.tab.totalAmount - order.totalAmount, 0)
        }
      });
    });
    return success({ id: order.id });
  });
}
