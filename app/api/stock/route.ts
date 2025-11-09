import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { stockItemCreateSchema } from "@/lib/validations/stockItem";
import { mockDb } from "@/lib/mockDb";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const lowStock = searchParams.get("lowStock") === "true";
    const items = mockDb.listStockItems(user.restaurantId, lowStock);
    const filtered = items;
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
    const item = mockDb.createStockItem(user.restaurantId, parsed.data);
    return success(item, 201);
  });
}
