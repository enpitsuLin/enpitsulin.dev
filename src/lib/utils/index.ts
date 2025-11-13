import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'

export function cn(...classes: ClassValue[]) {
  return clsx(classes)
}
