'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useParams } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';

const languageNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  pt: 'Português'
};

const languageFlags: Record<Locale, string> = {
  en: '🇺🇸',
  fr: '🇫🇷',
  es: '🇪🇸',
  pt: '🇵🇹'
};

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as Locale;

  const switchLanguage = (newLocale: Locale) => {
    // Replace the current locale in the pathname with the new one
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <div style={{ position: 'relative' }}>
      <select 
        value={currentLocale}
        onChange={(e) => switchLanguage(e.target.value as Locale)}
        style={{
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          fontSize: '14px',
          background: 'white',
          cursor: 'pointer'
        }}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {languageFlags[locale]} {languageNames[locale]}
          </option>
        ))}
      </select>
    </div>
  );
}