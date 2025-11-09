import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { tableCreateSchema, tableFilterSchema } from "@/lib/validations/table";
import { mockDb } from "@/lib/mockDb";

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
    const tables = mockDb.listTables(user.restaurantId, parsed.data.status);
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
    const existing = mockDb
      .listTables(user.restaurantId)
      .find((table) => table.number === parsed.data.number);
    if (existing) {
      return error("Mesa já cadastrada", 409);
    }
    const table = mockDb.createTable(user.restaurantId, parsed.data);
    return success(table, 201);
  });
}
