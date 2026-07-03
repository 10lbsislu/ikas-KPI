import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind sınıflarını koşullu birleştirir ve çakışmaları çözer. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
