/**
 * WhatsApp Business link helpers (wa.me).
 * Use social_whatsapp or contact_phone from CMS; numbers assumed Ghana (233) if no country code.
 */

export function formatPhoneForWa(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits.length) return '';
  // Ghana: 10 digits starting with 0 -> 233 + 9 digits
  if (digits.length === 10 && digits.startsWith('0')) return '233' + digits.slice(1);
  if (digits.length === 9 && digits.startsWith('5')) return '233' + digits;
  if (digits.startsWith('233')) return digits;
  return '233' + digits.slice(-9);
}

export function whatsAppUrl(phone: string, prefillText?: string): string {
  const num = formatPhoneForWa(phone);
  if (!num) return '';
  const base = `https://wa.me/${num}`;
  if (prefillText && prefillText.trim()) {
    return `${base}?text=${encodeURIComponent(prefillText.trim())}`;
  }
  return base;
}
