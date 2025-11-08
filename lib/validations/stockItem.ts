import { z } from "zod";

export const stockItemCreateSchema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  quantity: z.number().min(0),
  minQuantity: z.number().min(0),
  cost: z.number().min(0),
  isActive: z.boolean().default(true)
});

export const stockItemUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
  quantity: z.number().min(0).optional(),
  minQuantity: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  isActive: z.boolean().optional()
});

export const stockAdjustmentSchema = z.object({
  quantity: z.number()
});

export type StockItemCreateInput = z.infer<typeof stockItemCreateSchema>;
export type StockItemUpdateInput = z.infer<typeof stockItemUpdateSchema>;
