import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { generateSequentialCode } from "@/lib/utils";
import { tabCreateSchema, tabFilterSchema } from "@/lib/validations/tab";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const parsed = tabFilterSchema.safeParse({
      status: searchParams.get("status") ?? undefined,
      waiterId: searchParams.get("waiterId") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      search: searchParams.get("search") ?? undefined
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
    if (parsed.data.waiterId) {
      where.waiterId = parsed.data.waiterId;
    }
    if (parsed.data.search) {
      where.code = {
        contains: parsed.data.search,
        mode: "insensitive"
      };
    }
    if (parsed.data.startDate || parsed.data.endDate) {
      where.openedAt = {
        gte: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        lte: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined
      };
    }
    const tabs = await prisma.tab.findMany({
      where,
      include: {
        table: true,
        waiter: true,
        orders: {
          include: {
            items: true
          }
        }
      },
      orderBy: {
        openedAt: "desc"
      }
    });
    return success(tabs);
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = tabCreateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const table = await prisma.table.findFirst({
      where: {
        id: parsed.data.tableId,
        restaurantId: user.restaurantId
      }
    });
    if (!table) {
      return error("Mesa não encontrada", 404);
    }
    if (table.status !== "AVAILABLE") {
      return error("Mesa indisponível", 409);
    }
    const waiter = await prisma.waiter.findFirst({
      where: {
        id: parsed.data.waiterId,
        restaurantId: user.restaurantId,
        isActive: true
      }
    });
    if (!waiter) {
      return error("Garçom inválido", 404);
    }
    const lastTab = await prisma.tab.findFirst({
      where: {
        restaurantId: user.restaurantId
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    const code = generateSequentialCode(lastTab?.code ?? null, "C");
    const result = await prisma.$transaction(async (tx) => {
      const createdTab = await tx.tab.create({
        data: {
          code,
          tableId: table.id,
          waiterId: waiter.id,
          restaurantId: user.restaurantId
        },
        include: {
          table: true,
          waiter: true
        }
      });
      await tx.table.update({
        where: { id: table.id },
        data: {
          status: "OCCUPIED"
        }
      });
      return createdTab;
    });
    return success(result, 201);
  });
}
