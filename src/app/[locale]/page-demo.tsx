'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import LanguageSwitcher from '@/components/language-switcher'
import Link from 'next/link'

export default function Home() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Simple Navigation */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #eee',
        marginBottom: '40px'
      }}>
        <Link href={`/${locale}`} style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#333',
          textDecoration: 'none'
        }}>
          Glamfric
        </Link>
        <LanguageSwitcher />
      </nav>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{
          display: 'inline-block',
          background: '#f0f9ff',
          color: '#1e40af',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          marginBottom: '20px'
        }}>
          {t('hero.trustedBy')}
        </div>
        
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: '#111',
          marginBottom: '20px',
          lineHeight: '1.2'
        }}>
          {t('hero.title')} <span style={{ color: '#6366f1' }}>{t('hero.titleHighlight')}</span>
        </h1>
        
        <p style={{ 
          fontSize: '20px', 
          color: '#666',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          {t('hero.description')}
        </p>

        {/* Simple Search Form */}
        <div style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '500px',
          margin: '0 auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                fontSize: '16px',
                marginBottom: '10px'
              }}
            />
            <input
              type="text"
              placeholder={t('hero.locationPlaceholder')}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>
          <button style={{
            width: '100%',
            background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
            color: 'white',
            border: 'none',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            {t('hero.findServices')}
          </button>
        </div>
      </section>

      {/* Popular Services */}
      <section style={{ textAlign: 'center', marginBottom: '60px' }}>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '15px' }}>
          {t('hero.popularSearches')}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { key: 'hairBraiding', term: t('services.hairBraiding') },
            { key: 'nailArt', term: t('services.nailArt') },
            { key: 'spaDay', term: t('services.spaDay') },
            { key: 'lashExtensions', term: t('services.lashExtensions') },
            { key: 'makeup', term: t('services.makeup') }
          ].map(({ key, term }) => (
            <button
              key={key}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                color: '#374151'
              }}
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: '36px', 
          fontWeight: 'bold',
          marginBottom: '40px',
          color: '#111'
        }}>
          {t('valueProps.title')} <span style={{ color: '#6366f1' }}>{t('valueProps.titleHighlight')}</span>
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#111' }}>
              {t('valueProps.saveUp.title')}
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              {t('valueProps.saveUp.description')}
            </p>
          </div>
          
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#111' }}>
              {t('valueProps.skipCalls.title')}
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              {t('valueProps.skipCalls.description')}
            </p>
          </div>
          
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#111' }}>
              {t('valueProps.trusted.title')}
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              {t('valueProps.trusted.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#111' }}>
          🌍 Localization Demo
        </h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Current locale: <strong>{locale}</strong>
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/en" style={{ 
            padding: '8px 16px', 
            background: locale === 'en' ? '#6366f1' : '#e5e7eb',
            color: locale === 'en' ? 'white' : '#374151',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            🇺🇸 English
          </Link>
          <Link href="/fr" style={{ 
            padding: '8px 16px', 
            background: locale === 'fr' ? '#6366f1' : '#e5e7eb',
            color: locale === 'fr' ? 'white' : '#374151',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            🇫🇷 Français
          </Link>
          <Link href="/es" style={{ 
            padding: '8px 16px', 
            background: locale === 'es' ? '#6366f1' : '#e5e7eb',
            color: locale === 'es' ? 'white' : '#374151',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            🇪🇸 Español
          </Link>
          <Link href="/pt" style={{ 
            padding: '8px 16px', 
            background: locale === 'pt' ? '#6366f1' : '#e5e7eb',
            color: locale === 'pt' ? 'white' : '#374151',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            🇵🇹 Português
          </Link>
        </div>
      </section>
    </div>
  )
}