/** Normalise un numéro en format international. Sans préfixe, le numéro est considéré comme pakistanais (+92). */
export function normalizePhone(raw: string): string | null {
  const s = raw.trim();
  const digits = s.replace(/\D/g, "");
  if (s.startsWith("+") || s.startsWith("00")) {
    const intl = s.startsWith("00") ? digits.slice(2) : digits;
    return intl.length >= 8 && intl.length <= 15 ? `+${intl}` : null;
  }
  const local = digits.startsWith("92") && digits.length >= 11 ? digits.slice(2) : digits.replace(/^0/, "");
  return local.length >= 9 && local.length <= 10 ? `+92${local}` : null;
}