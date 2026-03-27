// src/types/index.ts

export type UserRole = "CUSTOMER" | "TAILOR" | "ADMIN";
export type ServiceType = "ALTERATION" | "CUSTOM_SEWING" | "EXPRESS";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type TUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
};

export type TTailorProfile = {
  id: string;
  userId: string;
  bio: string | null;
  locality: string;
  specializations: ServiceType[];
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  user: Pick<TUser, "id" | "name" | "email">;
};

export type TOrder = {
  id: string;
  customerId: string;
  tailorId: string | null;
  serviceType: ServiceType;
  description: string | null;
  address: string;
  city: string;
  scheduledAt: Date;
  status: OrderStatus;
  price: number | null;
  notes: string | null;
  createdAt: Date;
  customer?: Pick<TUser, "id" | "name" | "email">;
  tailor?: TTailorProfile | null;
};

// API response obálky
export type ApiSuccess<T> = {
  data: T;
  message?: string;
};

export type ApiError = {
  error: string;
  details?: unknown;
};

// Labely pro UI (CZ)
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  ALTERATION: "Úprava oblečení",
  CUSTOM_SEWING: "Šití na míru",
  EXPRESS: "Expresní služba",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Čeká na přiřazení",
  CONFIRMED: "Potvrzeno",
  IN_PROGRESS: "Probíhá",
  COMPLETED: "Dokončeno",
  CANCELLED: "Zrušeno",
};
