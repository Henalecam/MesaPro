import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { tabCreateSchema, tabFilterSchema } from "@/lib/validations/tab";
import { mockDb } from "@/lib/mockDb";

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
    const filter = {
      status: parsed.data.status,
      waiterId: parsed.data.waiterId,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      search: parsed.data.search ?? undefined
    };
    const tabs = mockDb.listTabs(user.restaurantId, filter);
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
    const table = mockDb.getTable(user.restaurantId, parsed.data.tableId);
    if (!table) {
      return error("Mesa não encontrada", 404);
    }
    if (table.status !== "AVAILABLE") {
      return error("Mesa indisponível", 409);
    }
    const waiter = mockDb.getWaiter(user.restaurantId, parsed.data.waiterId);
    if (!waiter || !waiter.isActive) {
      return error("Garçom inválido", 404);
    }
    const created = mockDb.createTab(user.restaurantId, parsed.data.tableId, parsed.data.waiterId);
    return success(created, 201);
  });
}
