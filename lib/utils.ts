import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { addMinutes, format, parseISO } from "date-fns";

export function cn(...inputs: Array<string | number | null | undefined | Record<string, boolean>>) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value: Date | string) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "dd/MM/yyyy HH:mm");
}

export function getElapsedTime(start: Date | string) {
  const date = typeof start === "string" ? parseISO(start) : start;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h${remaining.toString().padStart(2, "0")}min`;
}

export function addMinutesToDate(date: Date | string, minutes: number) {
  const base = typeof date === "string" ? parseISO(date) : date;
  return addMinutes(base, minutes);
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
  }
  return phone;
}

export function validateCpf(cpf: string) {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11 || /^(\d)\1+$/.test(clean)) {
    return false;
  }
  const calc = (slice: number) => {
    const numbers = clean.slice(0, slice);
    let sum = 0;
    for (let i = 0; i < numbers.length; i += 1) {
      sum += parseInt(numbers[i], 10) * (slice + 1 - i);
    }
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  return calc(9) === parseInt(clean[9], 10) && calc(10) === parseInt(clean[10], 10);
}

export function calculateOrderTotal(items: Array<{ quantity: number; unitPrice: number }>) {
  return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
}

export function generateSequentialCode(lastCode: string | null, prefix: string) {
  if (!lastCode) {
    return `${prefix}001`;
  }
  const numeric = parseInt(lastCode.replace(/\D/g, ""), 10);
  const next = (numeric + 1).toString().padStart(3, "0");
  return `${prefix}${next}`;
}

export function isLowStock(quantity: number, minQuantity: number) {
  return quantity < minQuantity;
}
