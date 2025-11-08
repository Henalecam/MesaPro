import { z } from "zod";

const ingredientSchema = z.object({
  stockItemId: z.string().cuid(),
  quantity: z.number().min(0.01)
});

export const menuItemCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0.01),
  image: z.string().url().optional(),
  isAvailable: z.boolean().default(true),
  preparationTime: z.number().int().min(1),
  categoryId: z.string().cuid(),
  ingredients: z.array(ingredientSchema).optional()
});

export const menuItemUpdateSchema = menuItemCreateSchema.partial();

export const menuItemFilterSchema = z.object({
  categoryId: z.string().cuid().optional(),
  isAvailable: z.boolean().optional(),
  search: z.string().optional()
});

export type MenuItemCreateInput = z.infer<typeof menuItemCreateSchema>;
export type MenuItemUpdateInput = z.infer<typeof menuItemUpdateSchema>;
