import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Gabungkan class Tailwind dengan aman (menghindari konflik utility,
 * mis. "px-2" vs "px-4" yang sama-sama diberikan — twMerge pilih yang terakhir).
 * Dipakai di semua komponen UI untuk menerima override class dari parent.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
