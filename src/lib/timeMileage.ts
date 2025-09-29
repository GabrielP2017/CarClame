// src/lib/timeMileage.ts
export type DDay = { daysLeft: number | null; label: string };
export type KmWindow = { kmLeft: number | null; label: string };

const DAY_MS = 24 * 60 * 60 * 1000;

function parseLocalDate(yyyyMmDd: string): Date | null {
  if (!yyyyMmDd) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd);
  if (!m) return null;
  const y = +m[1], mon = +m[2] - 1, d = +m[3];
  const dt = new Date(y, mon, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mon || dt.getDate() !== d) return null;
  return dt;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function todayLocal(): Date {
  return startOfDay(new Date());
}

export function normalizeDate(yyyyMmDd: string): Date {
  const t = todayLocal();
  const p = parseLocalDate(yyyyMmDd) ?? t;
  return p > t ? t : p;
}

export function daysSince(yyyyMmDd: string): number {
  const t = todayLocal().getTime();
  const p = normalizeDate(yyyyMmDd).getTime();
  return Math.floor((t - p) / DAY_MS);
}

export function ddayLabel(targetDays: number, elapsedDays: number): string {
  const remain = targetDays - elapsedDays;
  return remain >= 0 ? `D-${remain}` : `D+${Math.abs(remain)}`;
}

export function mileageDelta(
  purchaseMileage: number | null | undefined,
  currentMileage: number
): number | null {
  if (purchaseMileage == null || isNaN(purchaseMileage)) return null;
  const used = Math.max(0, Math.round(currentMileage) - Math.round(purchaseMileage));
  return used;
}

export function kmLeftLabel(limitKm: number, usedKm: number | null): KmWindow {
  if (usedKm == null) return { kmLeft: null, label: '미입력' };
  const left = limitKm - usedKm;
  return { kmLeft: left, label: left >= 0 ? `남은 ${left}km` : `초과 ${Math.abs(left)}km` };
}

// ---- Deadline windows ----
export function window30d(purchaseDate: string): DDay {
  const elapsed = daysSince(purchaseDate);
  return { daysLeft: 30 - elapsed, label: ddayLabel(30, elapsed) };
}

export function window3d(purchaseDate: string): DDay {
  const elapsed = daysSince(purchaseDate);
  return { daysLeft: 3 - elapsed, label: ddayLabel(3, elapsed) };
}

export function window7d(purchaseDate: string): DDay {
  const elapsed = daysSince(purchaseDate);
  return { daysLeft: 7 - elapsed, label: ddayLabel(7, elapsed) };
}

export function window90d(purchaseDate: string): DDay {
  const elapsed = daysSince(purchaseDate);
  return { daysLeft: 90 - elapsed, label: ddayLabel(90, elapsed) };
}

export function window2000km(
  purchaseMileage: number | null | undefined,
  currentMileage: number
): KmWindow {
  const used = mileageDelta(purchaseMileage, currentMileage);
  return kmLeftLabel(2000, used);
}
