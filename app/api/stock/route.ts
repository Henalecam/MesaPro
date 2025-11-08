import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { stockItemCreateSchema } from "@/lib/validations/stockItem";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const lowStock = searchParams.get("lowStock") === "true";
    const items = await prisma.stockItem.findMany({
      where: {
        restaurantId: user.restaurantId
      },
      orderBy: {
        name: "asc"
      }
    });
    const filtered = lowStock
      ? items.filter((item) => item.quantity < item.minQuantity)
      : items;
    return success(filtered);
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = stockItemCreateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const item = await prisma.stockItem.create({
      data: {
        ...parsed.data,
        restaurantId: user.restaurantId
      }
    });
    return success(item, 201);
  });
}
