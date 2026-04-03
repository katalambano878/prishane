'use client';

import { useCMS } from '@/context/CMSContext';
import { whatsAppUrl } from '@/lib/whatsapp';

const DEFAULT_MESSAGE = "Hi! I'd like to know more about your products.";

export default function WhatsAppFloatingButton() {
  const { getSetting } = useCMS();
  const phone = getSetting('social_whatsapp') || getSetting('contact_phone') || '';
  const url = whatsAppUrl(phone, DEFAULT_MESSAGE);

  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20BD5A] flex items-center justify-center transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 md:bottom-6 md:right-6"
      aria-label="Chat on WhatsApp"
    >
      <i className="ri-whatsapp-fill text-2xl" />
    </a>
  );
}
