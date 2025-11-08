import { z } from "zod";

export const orderItemSchema = z.object({
  menuItemId: z.string().cuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  notes: z.string().max(255).optional()
});

export const orderCreateSchema = z.object({
  tabId: z.string().cuid(),
  notes: z.string().max(255).optional(),
  items: z.array(orderItemSchema).min(1)
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PREPARING", "READY", "DELIVERED", "CANCELLED"]),
  itemId: z.string().cuid().optional()
});

export const orderFilterSchema = z.object({
  status: z.enum(["PENDING", "PREPARING", "READY", "DELIVERED", "CANCELLED"]).optional(),
  tabId: z.string().cuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
