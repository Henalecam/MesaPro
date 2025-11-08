import { z } from "zod";

export const tableCreateSchema = z.object({
  number: z.number().int().min(1),
  capacity: z.number().int().min(1)
});

export const tableUpdateSchema = z.object({
  number: z.number().int().min(1).optional(),
  capacity: z.number().int().min(1).optional(),
  status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED"]).optional()
});

export const tableFilterSchema = z.object({
  status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED"]).optional()
});

export type TableCreateInput = z.infer<typeof tableCreateSchema>;
export type TableUpdateInput = z.infer<typeof tableUpdateSchema>;
