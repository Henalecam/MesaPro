import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { tableUpdateSchema } from "@/lib/validations/table";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const table = await prisma.table.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      },
      include: {
        tabs: {
          where: {
            status: "OPEN"
          }
        }
      }
    });
    if (!table) {
      return error("Mesa não encontrada", 404);
    }
    return success(table);
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = tableUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const table = await prisma.table.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      },
      include: {
        tabs: {
          where: {
            status: "OPEN"
          }
        }
      }
    });
    if (!table) {
      return error("Mesa não encontrada", 404);
    }
    if (parsed.data.number && parsed.data.number !== table.number) {
      const existing = await prisma.table.findFirst({
        where: {
          restaurantId: user.restaurantId,
          number: parsed.data.number
        }
      });
      if (existing) {
        return error("Número já utilizado", 409);
      }
    }
    const updated = await prisma.table.update({
      where: { id: table.id },
      data: parsed.data
    });
    return success(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const table = await prisma.table.findFirst({
      where: {
        id: params.id,
        restaurantId: user.restaurantId
      },
      include: {
        tabs: {
          where: {
            status: "OPEN"
          }
        }
      }
    });
    if (!table) {
      return error("Mesa não encontrada", 404);
    }
    if (table.tabs.length > 0) {
      return error("Não é possível remover mesa com comanda aberta", 409);
    }
    await prisma.table.delete({
      where: { id: table.id }
    });
    return success({ id: table.id });
  });
}
