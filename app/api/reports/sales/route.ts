import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success } from "@/lib/http";
import { mockDb } from "@/lib/mockDb";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const report = mockDb.getSalesReport(
      user.restaurantId,
      startDateParam ? new Date(startDateParam) : undefined,
      endDateParam ? new Date(endDateParam) : undefined
    );
    return success(report);
  });
}
