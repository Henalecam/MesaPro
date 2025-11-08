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
    const filters: Record<string, unknown> = {
      restaurantId: user.restaurantId,
      status: "CLOSED"
    };
    if (startDateParam || endDateParam) {
      filters.closedAt = {
        gte: startDateParam ? new Date(startDateParam) : undefined,
        lte: endDateParam ? new Date(endDateParam) : undefined
      };
    }
    const tabs = await prisma.tab.findMany({
      where: filters,
      include: {
        table: true,
        waiter: true
      },
      orderBy: {
        closedAt: "desc"
      }
    });
    const totalRevenue = tabs.reduce((acc, tab) => acc + tab.totalAmount, 0);
    const totalOrders = await prisma.order.count({
      where: {
        restaurantId: user.restaurantId,
        tabId: {
          in: tabs.map((tab) => tab.id)
        }
      }
    });
    const averageTicket = tabs.length > 0 ? totalRevenue / tabs.length : 0;
    const totalsByPayment = tabs.reduce<Record<string, number>>((acc, tab) => {
      if (!tab.paymentMethod) {
        return acc;
      }
      acc[tab.paymentMethod] = (acc[tab.paymentMethod] ?? 0) + tab.totalAmount;
      return acc;
    }, {});
    const groupedByDay = new Map<string, number>();
    tabs.forEach((tab) => {
      if (!tab.closedAt) {
        return;
      }
      const key = tab.closedAt.toISOString().split("T")[0];
      groupedByDay.set(key, (groupedByDay.get(key) ?? 0) + tab.totalAmount);
    });
    const dailyTotals = Array.from(groupedByDay.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
    return success({
      totalRevenue,
      totalOrders,
      averageTicket,
      totalsByPayment: Object.entries(totalsByPayment).map(([paymentMethod, total]) => ({
        paymentMethod,
        total
      })),
      dailyTotals,
      details: tabs.map((tab) => ({
        tabCode: tab.code,
        tableNumber: tab.table.number,
        waiterName: tab.waiter.name,
        totalAmount: tab.totalAmount,
        paymentMethod: tab.paymentMethod
      }))
    });
  });
}
