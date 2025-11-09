import { requireUser } from "@/lib/auth";
import { handle, success } from "@/lib/http";
import { mockDb } from "@/lib/mockDb";

export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    const metrics = mockDb.getDashboardMetrics(user.restaurantId);
    return success(metrics);
  });
}
