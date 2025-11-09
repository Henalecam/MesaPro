import { NextResponse } from "next/server";

export function success<T>(data: T, init?: number | ResponseInit) {
  const responseInit = typeof init === "number" ? { status: init } : init;
  return NextResponse.json({ success: true, data }, responseInit);
}

export function error(message: string, init?: number | ResponseInit) {
  const status = typeof init === "number" ? init : init?.status ?? 400;
  const initObj = typeof init === "number" ? { status: init } : init ?? { status };
  return NextResponse.json({ success: false, error: message }, initObj);
}

type Handler<T> = () => Promise<Response>;

export async function handle<T>(callback: Handler<T>) {
  try {
    return await callback();
  } catch (err) {
    if (err instanceof Error) {
      return error(err.message, 400);
    }
    return error("Erro inesperado", 500);
  }
}
