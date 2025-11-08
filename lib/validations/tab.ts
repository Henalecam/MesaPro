import { z } from "zod";

export const tabCreateSchema = z.object({
  tableId: z.string().cuid(),
  waiterId: z.string().cuid()
});

export const tabCloseSchema = z.object({
  discountType: z.enum(["value", "percentage"]).optional(),
  discountValue: z.number().min(0).default(0),
  paymentMethod: z.enum(["CASH", "PIX", "DEBIT", "CREDIT"])
});

export const tabFilterSchema = z.object({
  status: z.enum(["OPEN", "CLOSED", "CANCELLED"]).optional(),
  waiterId: z.string().cuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional()
});

export type TabCreateInput = z.infer<typeof tabCreateSchema>;
export type TabCloseInput = z.infer<typeof tabCloseSchema>;
