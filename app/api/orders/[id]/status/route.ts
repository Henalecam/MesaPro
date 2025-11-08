import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { orderStatusSchema } from "@/lib/validations/order";

type Params = {
  params: {
    id: string;
  };
};

async function deductStock(
  orderItemId: string,
  quantity: number,
  tx: typeof prisma
) {
  const item = await tx.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      menuItem: {
        include: {
          ingredients: {
            include: {
              stockItem: true
            }
          }
        }
      }
    }
  });
  if (!item) {
    throw new Error("Item não encontrado");
  }
  for (const ingredient of item.menuItem.ingredients) {
    const required = ingredient.quantity * quantity;
    if (ingredient.stockItem.quantity < required) {
      throw new Error(`Estoque insuficiente para ${item.menuItem.name}`);
    }
    await tx.stockItem.update({
      where: { id: ingredient.stockItemId },
      data: {
        quantity: {
          decrement: required
        }
      }
    });
  }
}

async function recomputeTotals(
  orderId: string,
  tabId: string,
  restaurantId: string,
  tx: typeof prisma
) {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: {
      totalPrice: true,
      status: true
    }
  });
  const orderTotal = items.reduce((acc, item) => {
    if (item.status === "CANCELLED") {
      return acc;
    }
    return acc + item.totalPrice;
  }, 0);
  await tx.order.update({
    where: { id: orderId },
    data: {
      totalAmount: orderTotal,
      status:
        items.every((item) => item.status === "DELIVERED")
          ? "DELIVERED"
          : items.some((item) => item.status === "PREPARING")
          ? "PREPARING"
          : items.some((item) => item.status === "READY")
          ? "READY"
          : items.every((item) => item.status === "CANCELLED")
          ? "CANCELLED"
          : "PENDING"
    }
  });
  const tabOrders = await tx.order.findMany({
    where: {
      tabId,
      restaurantId,
      status: {
        not: "CANCELLED"
      }
    },
    select: {
      totalAmount: true
    }
  });
  const tabTotal = tabOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  await tx.tab.update({
    where: { id: tabId },
    data: {
      totalAmount: tabTotal
    }
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = orderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      },
      include: {
        items: true
      }
    });
    if (!order) {
      return error("Pedido não encontrado", 404);
    }
    const result = await prisma.$transaction(async (tx) => {
      if (parsed.data.itemId) {
        const orderItem = await tx.orderItem.findFirst({
          where: {
            id: parsed.data.itemId,
            orderId: order.id
          }
        });
        if (!orderItem) {
          throw new Error("Item não encontrado");
        }
        if (parsed.data.status === "CANCELLED" && orderItem.status === "DELIVERED") {
          throw new Error("Item entregue não pode ser cancelado");
        }
        if (parsed.data.status === "DELIVERED" && orderItem.status !== "DELIVERED") {
          await deductStock(orderItem.id, orderItem.quantity, tx);
        }
        await tx.orderItem.update({
          where: { id: orderItem.id },
          data: {
            status: parsed.data.status
          }
        });
      } else {
        if (parsed.data.status === "DELIVERED") {
          const pendingItem = order.items.find(
            (item) => item.status !== "DELIVERED"
          );
          if (pendingItem) {
            for (const item of order.items) {
              if (item.status !== "DELIVERED") {
                await deductStock(item.id, item.quantity, tx);
              }
            }
          }
          await tx.orderItem.updateMany({
            where: {
              orderId: order.id
            },
            data: {
              status: "DELIVERED"
            }
          });
        } else if (parsed.data.status === "CANCELLED") {
          const hasDelivered = order.items.some(
            (item) => item.status === "DELIVERED"
          );
          if (hasDelivered) {
            throw new Error("Pedido com itens entregues não pode ser cancelado");
          }
          await tx.orderItem.updateMany({
            where: {
              orderId: order.id
            },
            data: {
              status: "CANCELLED"
            }
          });
        } else {
          await tx.orderItem.updateMany({
            where: {
              orderId: order.id,
              status: {
                not: "CANCELLED"
              }
            },
            data: {
              status: parsed.data.status
            }
          });
        }
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: parsed.data.status
          }
        });
      }
      await recomputeTotals(order.id, order.tabId, user.restaurantId, tx);
      return tx.order.findFirst({
        where: { id: order.id },
        include: {
          items: true
        }
      });
    });
    return success(result);
  });
}
