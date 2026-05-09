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
  tailorId: z.string().uuid().nullable().optional(),
  price: z.number().min(0).optional(),
  notes: z.string().optional(),
  priceAccepted: z.boolean().optional(),
});

export const createTailorSchema = z.object({
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  email: z.string().email("Neplatný formát e-mailu"),
  password: z.string().min(8, "Heslo musí mít alespoň 8 znaků"),
  locality: z.string().min(2, "Lokalita je povinná"),
  specializations: z
    .array(z.enum(["ALTERATION", "CUSTOM_SEWING", "EXPRESS"]))
    .min(1, "Vyberte alespoň jednu specializaci"),
  bio: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

export const updateTailorSchema = z.object({
  name: z.string().min(2).optional(),
  locality: z.string().min(2).optional(),
  specializations: z
    .array(z.enum(["ALTERATION", "CUSTOM_SEWING", "EXPRESS"]))
    .min(1)
    .optional(),
  bio: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

const SERVICE_TYPE_KEYS = ["ALTERATION", "CUSTOM_SEWING", "EXPRESS"] as const;

export const createServiceSchema = z.object({
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  description: z.string().optional(),
  icon: z.string().optional(),
  basePrice: z.number().min(0, "Cena musí být kladná"),
  isActive: z.boolean().optional(),
  showOnHomepage: z.boolean().optional(),
  typeKey: z.enum(SERVICE_TYPE_KEYS).nullable().optional(),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  basePrice: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  showOnHomepage: z.boolean().optional(),
  typeKey: z.enum(SERVICE_TYPE_KEYS).nullable().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CreateTailorInput = z.infer<typeof createTailorSchema>;
export type UpdateTailorInput = z.infer<typeof updateTailorSchema>;
