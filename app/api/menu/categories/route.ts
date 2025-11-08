import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { categoryCreateSchema } from "@/lib/validations/category";

export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    const categories = await prisma.category.findMany({
      where: {
        restaurantId: user.restaurantId
      },
      include: {
        menuItems: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        order: "asc"
      }
    });
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
    const category = await prisma.category.create({
      data: {
        ...parsed.data,
        restaurantId: user.restaurantId
      }
    });
    return success(category, 201);
  });
}
