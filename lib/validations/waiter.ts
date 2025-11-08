import { z } from "zod";
import { validateCpf } from "@/lib/utils";

const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

export const waiterCreateSchema = z.object({
  name: z.string().min(1),
  phone: z
    .string()
    .regex(phoneRegex, { message: "Telefone inválido" })
    .optional(),
  cpf: z
    .string()
    .refine((value) => !value || validateCpf(value), { message: "CPF inválido" })
    .optional(),
  isActive: z.boolean().default(true)
});

export const waiterUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z
    .string()
    .regex(phoneRegex, { message: "Telefone inválido" })
    .optional(),
  cpf: z
    .string()
    .refine((value) => !value || validateCpf(value), { message: "CPF inválido" })
    .optional(),
  isActive: z.boolean().optional()
});

export type WaiterCreateInput = z.infer<typeof waiterCreateSchema>;
export type WaiterUpdateInput = z.infer<typeof waiterUpdateSchema>;
