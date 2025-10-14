export function fmt(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(n);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function leftStr(now: Date, due: Date): string {
  const left = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (isNaN(left)) return "—";
  if (left < 0) return `마감 지남 (${Math.abs(left)}일)`;
  if (left === 0) return "오늘 마감";
  return `${left}일 남음`;
}
