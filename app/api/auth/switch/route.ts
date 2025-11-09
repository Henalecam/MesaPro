import { NextRequest } from "next/server";
import { handle, success, error } from "@/lib/http";
import { listUsers, switchUser } from "@/lib/auth";

export async function GET() {
  return handle(async () => {
    const users = listUsers();
    return success(users);
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const body = await req.json();
    const userId = typeof body?.userId === "string" ? body.userId : null;
    if (!userId) {
      return error("Usuário inválido", 400);
    }
    const user = switchUser(userId);
    return success(user);
  });
}
