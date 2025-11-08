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
    const tabs = await prisma.tab.findMany({
      where: {
        restaurantId: user.restaurantId,
        status: "CLOSED",
        closedAt: {
          gte: startDateParam ? new Date(startDateParam) : undefined,
          lte: endDateParam ? new Date(endDateParam) : undefined
        }
      },
      include: {
        waiter: true
      }
    });
    const map = new Map<
      string,
      {
        waiterName: string;
        total: number;
        tabsCount: number;
      }
    >();
    tabs.forEach((tab) => {
      const entry = map.get(tab.waiterId) ?? {
        waiterName: tab.waiter.name,
        total: 0,
        tabsCount: 0
      };
      entry.total += tab.totalAmount;
      entry.tabsCount += 1;
      map.set(tab.waiterId, entry);
    });
    const items = Array.from(map.values()).map((entry) => ({
      waiterName: entry.waiterName,
      tabsCount: entry.tabsCount,
      total: entry.total,
      averageTicket: entry.tabsCount > 0 ? entry.total / entry.tabsCount : 0
    }));
    items.sort((a, b) => b.total - a.total);
    return success({
      items
    });
  });
}
