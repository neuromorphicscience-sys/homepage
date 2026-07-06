export const YUAN_TO_CENTS = 100;
export const WAN_YUAN_TO_CENTS = 10_000 * YUAN_TO_CENTS;

export function parseWanYuanToCents(value: string | number): number {
  const raw = String(value ?? "").replace(/,/g, "").trim();
  if (!raw) return 0;
  const normalized = Number(raw);
  if (!Number.isFinite(normalized)) return 0;
  return Math.round(normalized * WAN_YUAN_TO_CENTS);
}

export function centsToYuan(cents: number): number {
  return cents / YUAN_TO_CENTS;
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centsToYuan(cents));
}

export function formatPlainMoney(cents: number): string {
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centsToYuan(cents));
}

export function formatWan(value: string | number): string {
  const cents = parseWanYuanToCents(value);
  if (cents <= 0) return "";
  return `折合 ${formatMoney(cents)}`;
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value * 100)}%`;
}

export function allocateByBasisPoints(totalCents: number, basisPoints: number): number {
  return Math.round((totalCents * basisPoints) / 10_000);
}

export function prorateCents(totalCents: number, partCents: number, basisCents: number): number {
  if (basisCents <= 0) return 0;
  return Math.round((totalCents * partCents) / basisCents);
}

export function downloadTextFile(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
