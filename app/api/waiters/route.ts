import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { waiterCreateSchema } from "@/lib/validations/waiter";
import { mockDb } from "@/lib/mockDb";

export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    const waiters = mockDb.listWaiters(user.restaurantId);
    return success(waiters);
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
    const waiter = mockDb.createWaiter(user.restaurantId, parsed.data);
    return success(waiter, 201);
  });
}
