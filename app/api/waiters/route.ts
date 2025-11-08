import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { waiterCreateSchema } from "@/lib/validations/waiter";

export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    const waiters = await prisma.waiter.findMany({
      where: {
        restaurantId: user.restaurantId
      },
      include: {
        tabs: {
          where: {
            openedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    });
    const enriched = waiters.map((waiter) => ({
      ...waiter,
      tabsToday: waiter.tabs.length
    }));
    return success(enriched);
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = waiterCreateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const waiter = await prisma.waiter.create({
      data: {
        ...parsed.data,
        restaurantId: user.restaurantId
      }
    });
    return success(waiter, 201);
  });
}
