import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success } from "@/lib/http";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function startOfMonth(date: Date) {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const [salesTodayAgg, salesWeekAgg, salesMonthAgg, ordersCount, occupiedTables] = await Promise.all([
      prisma.tab.aggregate({
        where: {
          restaurantId: user.restaurantId,
          status: "CLOSED",
          closedAt: {
            gte: dayStart,
            lte: dayEnd
          }
        },
        _sum: {
          totalAmount: true
        }
      }),
      prisma.tab.aggregate({
        where: {
          restaurantId: user.restaurantId,
          status: "CLOSED",
          closedAt: {
            gte: weekStart,
            lte: dayEnd
          }
        },
        _sum: {
          totalAmount: true
        }
      }),
      prisma.tab.aggregate({
        where: {
          restaurantId: user.restaurantId,
          status: "CLOSED",
          closedAt: {
            gte: monthStart,
            lte: dayEnd
          }
        },
        _sum: {
          totalAmount: true
        }
      }),
      prisma.order.count({
        where: {
          restaurantId: user.restaurantId
        }
      }),
      prisma.table.count({
        where: {
          restaurantId: user.restaurantId,
          status: "OCCUPIED"
        }
      })
    ]);

    const closedTabs = await prisma.tab.findMany({
      where: {
        restaurantId: user.restaurantId,
        status: "CLOSED"
      },
      select: {
        totalAmount: true
      }
    });
    const totalRevenue = closedTabs.reduce((acc, tab) => acc + tab.totalAmount, 0);
    const averageTicket =
      closedTabs.length > 0 ? totalRevenue / closedTabs.length : 0;

    const salesChart: Array<{ date: string; value: number }> = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayS = startOfDay(date);
      const dayE = endOfDay(date);
      const daily = await prisma.tab.aggregate({
        where: {
          restaurantId: user.restaurantId,
          status: "CLOSED",
          closedAt: {
            gte: dayS,
            lte: dayE
          }
        },
        _sum: {
          totalAmount: true
        }
      });
      salesChart.push({
        date: dayS.toISOString().split("T")[0],
        value: daily._sum.totalAmount ?? 0
      });
    }

    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: {
        order: {
          restaurantId: user.restaurantId,
          status: {
            not: "CANCELLED"
          }
        }
      },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          quantity: "desc"
        }
      },
      take: 5
    });

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: topProductsRaw.map((item) => item.menuItemId)
        }
      }
    });

    const topProducts = topProductsRaw.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      return {
        name: menuItem?.name ?? "Item",
        quantity: item._sum.quantity ?? 0,
        total: item._sum.totalPrice ?? 0
      };
    });

    const topWaitersRaw = await prisma.tab.groupBy({
      by: ["waiterId"],
      where: {
        restaurantId: user.restaurantId,
        status: "CLOSED"
      },
      _sum: {
        totalAmount: true
      },
      orderBy: {
        _sum: {
          totalAmount: "desc"
        }
      },
      take: 3
    });

    const waiters = await prisma.waiter.findMany({
      where: {
        id: {
          in: topWaitersRaw.map((item) => item.waiterId)
        }
      }
    });

    const topWaiters = topWaitersRaw.map((item) => {
      const waiter = waiters.find((w) => w.id === item.waiterId);
      return {
        name: waiter?.name ?? "Garçom",
        total: item._sum.totalAmount ?? 0
      };
    });

    const allStockItems = await prisma.stockItem.findMany({
      where: {
        restaurantId: user.restaurantId
      }
    });
    const stockAlerts = allStockItems.filter((item) => item.quantity < item.minQuantity);

    const staleTabs = await prisma.tab.findMany({
      where: {
        restaurantId: user.restaurantId,
        status: "OPEN",
        openedAt: {
          lt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
        }
      },
      include: {
        table: true
      }
    });

    return success({
      salesToday: salesTodayAgg._sum.totalAmount ?? 0,
      salesWeek: salesWeekAgg._sum.totalAmount ?? 0,
      salesMonth: salesMonthAgg._sum.totalAmount ?? 0,
      ordersCount,
      averageTicket,
      occupiedTables,
      salesChart,
      topProducts,
      topWaiters,
      lowStockAlerts: stockAlerts.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        minQuantity: item.minQuantity
      })),
      staleTabs: staleTabs.map((tab) => ({
        code: tab.code,
        tableNumber: tab.table.number,
        openedAt: tab.openedAt
      }))
    });
  });
}
