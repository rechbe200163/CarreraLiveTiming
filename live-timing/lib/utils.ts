import { type ClassValue, clsx } from "clsx"
import { format } from "path"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format time function provided in milliseconds
export function formatTime(time: number) {
  const minutes = Math.floor(time / 60000)
  const seconds = ((time % 60000) / 1000).toFixed(3)
  return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`
}