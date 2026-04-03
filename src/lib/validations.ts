// src/lib/validations.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  email: z.string().email("Neplatný formát e-mailu"),
  password: z.string().min(8, "Heslo musí mít alespoň 8 znaků"),
});

export const loginSchema = z.object({
  email: z.string().email("Neplatný formát e-mailu"),
  password: z.string().min(1, "Heslo je povinné"),
});

export const createOrderSchema = z.object({
  serviceType: z.enum(["ALTERATION", "CUSTOM_SEWING", "EXPRESS"]),
  description: z.string().optional(),
  address: z.string().min(5, "Adresa je povinná"),
  city: z.string().min(2, "Město je povinné"),
  scheduledAt: z.string().datetime({ message: "Neplatný datum a čas" }),
  tailorId: z.string().uuid().optional(),
});

export const updateOrderSchema = z.object({
  serviceType: z.enum(["ALTERATION", "CUSTOM_SEWING", "EXPRESS"]).optional(),
  description: z.string().optional(),
  status: z
    .enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .optional(),
  tailorId: z.string().uuid().optional(),
  price: z.number().positive().optional(),
  notes: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
