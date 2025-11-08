import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success } from "@/lib/http";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const categoryId = searchParams.get("categoryId");
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: user.restaurantId,
        status: {
          not: "CANCELLED"
        },
        createdAt: {
          gte: startDateParam ? new Date(startDateParam) : undefined,
          lte: endDateParam ? new Date(endDateParam) : undefined
        },
        items: {
          some: {
            menuItem: {
              categoryId: categoryId ?? undefined
            }
          }
        }
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });
    const map = new Map<
      string,
      {
        name: string;
        category: string;
        quantity: number;
        total: number;
      }
    >();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.menuItemId;
        const entry = map.get(key) ?? {
          name: item.menuItem.name,
          category: item.menuItem.category.name,
          quantity: 0,
          total: 0
        };
        entry.quantity += item.quantity;
        entry.total += item.totalPrice;
        map.set(key, entry);
      });
    });
    const items = Array.from(map.values()).sort((a, b) => b.quantity - a.quantity);
    return success({
      items
    });
  });
}
