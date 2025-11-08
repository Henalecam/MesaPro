import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { waiterUpdateSchema } from "@/lib/validations/waiter";

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const waiter = await prisma.waiter.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      }
    });
    if (!waiter) {
      return error("Garçom não encontrado", 404);
    }
    const body = await req.json();
    const parsed = waiterUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const updated = await prisma.waiter.update({
      where: { id: waiter.id },
      data: parsed.data
    });
    return success(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const waiter = await prisma.waiter.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      }
    });
    if (!waiter) {
      return error("Garçom não encontrado", 404);
    }
    const updated = await prisma.waiter.update({
      where: { id: waiter.id },
      data: {
        isActive: false
      }
    });
    return success(updated);
  });
}
