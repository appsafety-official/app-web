export const WHATSAPP_NUMBER = "6287824604747";

export const DEFAULT_WA_MESSAGE = "Halo APP Safety! Saya ingin bertanya tentang produk Anda.";

export function buildWaUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
