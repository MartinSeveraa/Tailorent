// src/lib/utils.ts

/**
 * Spojí třídy dohromady — lightweight alternativa k clsx
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formátování ceny v CZK
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formátování datumu pro CZ uživatele
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Formátování datumu + času
 */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
