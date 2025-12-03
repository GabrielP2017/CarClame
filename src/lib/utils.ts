import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "-";
  }
  return new Intl.NumberFormat("ko-KR").format(value);
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysBetween(start: Date, end: Date) {
  const startTime = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  ).getTime();
  const endTime = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  ).getTime();

  return Math.round((endTime - startTime) / MS_PER_DAY);
}

export function leftStr(from: Date, to: Date) {
  const diff = Math.ceil((to.getTime() - from.getTime()) / MS_PER_DAY);
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "오늘 마감";
  return `만료 ${Math.abs(diff)}일`;
}
