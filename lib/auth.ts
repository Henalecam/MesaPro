import type { Role } from "@prisma/client";
import { mockDb } from "@/lib/mockDb";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  restaurantId: string;
};

export type Session = {
  user: SessionUser;
};

type InternalUser = SessionUser & { password: string };

function sanitizeUser(user: InternalUser): SessionUser {
  const { password: _password, ...safe } = user;
  return safe;
}

function getInternalActiveUser(): InternalUser {
  const active = mockDb.getActiveUser();
  if (!active) {
    throw new Error("Usuário padrão não encontrado");
  }
  return active as InternalUser;
}

export async function auth(): Promise<Session> {
  return {
    user: sanitizeUser(getInternalActiveUser())
  };
}

export async function requireUser(): Promise<SessionUser> {
  return sanitizeUser(getInternalActiveUser());
}

export function listUsers(): Array<SessionUser> {
  return mockDb.listUsers().map((user) => sanitizeUser(user as InternalUser));
}

export function switchUser(userId: string): SessionUser {
  const updated = mockDb.setActiveUser(userId);
  if (!updated) {
    throw new Error("Usuário inválido");
  }
  return sanitizeUser(updated as InternalUser);
}

export async function signIn(userId?: string): Promise<SessionUser> {
  if (userId) {
    return switchUser(userId);
  }
  return sanitizeUser(getInternalActiveUser());
}

export async function signOut(): Promise<void> {
  return;
}
