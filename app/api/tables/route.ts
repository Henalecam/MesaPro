import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { tableCreateSchema, tableFilterSchema } from "@/lib/validations/table";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") ?? undefined;
    const parsed = tableFilterSchema.safeParse({
      status: statusParam
    });
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const tables = await prisma.table.findMany({
      where: {
        restaurantId: user.restaurantId,
        status: parsed.data.status
      },
      include: {
        tabs: {
          where: {
            status: "OPEN"
          },
          orderBy: {
            openedAt: "desc"
          }
        }
      },
      orderBy: {
        number: "asc"
      }
    });
    return success(tables);
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = tableCreateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const existing = await prisma.table.findFirst({
      where: {
        restaurantId: user.restaurantId,
        number: parsed.data.number
      }
    });
    if (existing) {
      return error("Mesa já cadastrada", 409);
    }
    const table = await prisma.table.create({
      data: {
        ...parsed.data,
        restaurantId: user.restaurantId
      }
    });
    return success(table, 201);
  });
}
