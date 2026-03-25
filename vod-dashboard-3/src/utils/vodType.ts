export function normalizeVodType(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]/g, "")
    .toUpperCase();
}

export function isCatchVodType(value: string): boolean {
  const normalized = normalizeVodType(value);
  return /CATCH|CATCHUP|FVOD/.test(normalized);
}

export function isFastVodType(value: string): boolean {
  return /FAST/.test(normalizeVodType(value));
}
