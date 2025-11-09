import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, success, error } from "@/lib/http";
import { tableUpdateSchema } from "@/lib/validations/table";
import { mockDb } from "@/lib/mockDb";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const table = mockDb.getTable(user.restaurantId, params.id);
    if (!table) {
      return error("Mesa não encontrada", 404);
    }
    return success(table);
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = tableUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return error(parsed.error.errors[0].message, 400);
    }
    const table = mockDb.getTable(user.restaurantId, params.id);
    if (!table) {
      return error("Mesa não encontrada", 404);
    }
    if (parsed.data.number && parsed.data.number !== table.number) {
      const existing = mockDb
        .listTables(user.restaurantId)
        .find((item) => item.number === parsed.data.number && item.id !== table.id);
      if (existing) {
        return error("Número já utilizado", 409);
      }
    }
    const updated = mockDb.updateTable(user.restaurantId, params.id, parsed.data);
    if (!updated) {
      return error("Mesa não encontrada", 404);
    }
    return success(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    const user = await requireUser();
    const table = mockDb.getTable(user.restaurantId, params.id);
    if (!table) {
      return error("Mesa não encontrada", 404);
    }
    if (table.tabs.length > 0) {
      return error("Não é possível remover mesa com comanda aberta", 409);
    }
    const removed = mockDb.deleteTable(user.restaurantId, params.id);
    if (!removed) {
      return error("Mesa não encontrada", 404);
    }
    return success({ id: table.id });
  });
}
