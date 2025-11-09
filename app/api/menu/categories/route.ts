import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { categoryCreateSchema } from "@/lib/validations/category";
import { mockDb } from "@/lib/mockDb";

export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    const categories = mockDb.listCategories(user.restaurantId);
    return success(categories);
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = categoryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const category = mockDb.createCategory(user.restaurantId, parsed.data);
    return success(category, 201);
  });
}
