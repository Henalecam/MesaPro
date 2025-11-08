import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";

const tabUpdateSchema = z.object({
  waiterId: z.string().cuid().optional(),
  discount: z.number().min(0).optional(),
  status: z.enum(["CANCELLED"]).optional()
});

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const tab = await prisma.tab.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      },
      include: {
        table: true,
        waiter: true,
        orders: {
          include: {
            items: true
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });
    if (!tab) {
      return error("Comanda não encontrada", 404);
    }
    return success(tab);
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = tabUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const tab = await prisma.tab.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      }
    });
    if (!tab) {
      return error("Comanda não encontrada", 404);
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.waiterId && parsed.data.waiterId !== tab.waiterId) {
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
      data.waiterId = waiter.id;
    }
    if (parsed.data.discount !== undefined) {
      data.discount = parsed.data.discount;
    }
    if (parsed.data.status === "CANCELLED") {
      if (tab.status !== "OPEN") {
        return error("Comanda não pode ser cancelada", 409);
      }
      data.status = "CANCELLED";
      data.closedAt = new Date();
      await prisma.table.update({
        where: { id: tab.tableId },
        data: {
          status: "AVAILABLE"
        }
      });
    }
    const updated = await prisma.tab.update({
      where: { id: tab.id },
      data
    });
    return success(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const tab = await prisma.tab.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      }
    });
    if (!tab) {
      return error("Comanda não encontrada", 404);
    }
    if (tab.status !== "OPEN") {
      return error("Comanda não pode ser cancelada", 409);
    }
    await prisma.$transaction(async (tx) => {
      await tx.tab.update({
        where: { id: tab.id },
        data: {
          status: "CANCELLED",
          closedAt: new Date()
        }
      });
      await tx.table.update({
        where: { id: tab.tableId },
        data: {
          status: "AVAILABLE"
        }
      });
    });
    return success({ id: tab.id });
  });
}
