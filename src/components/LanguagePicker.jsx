import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { languageOptions, useLanguage } from '../language.js';

export default function LanguagePicker() {
  const { lang, change, t } = useLanguage();
  const ref = useRef(null);
  useEffect(() => {
    const dismiss = event => { if (!ref.current?.contains(event.target)) ref.current?.removeAttribute('open'); };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);
  return <details className="language-picker" ref={ref} onKeyDown={event => {
    if (event.key === 'Escape') { ref.current.removeAttribute('open'); ref.current.querySelector('summary').focus(); }
  }}>
    <summary aria-label={t('languageLabel')}><span lang={lang} dir="auto">{languageOptions.find(([,code]) => code === lang)?.[0] || 'English'}</span><ChevronDown size={14} aria-hidden="true" /></summary>
    <ul aria-label={t('languageLabel')}>{languageOptions.map(([label,code]) => <li key={code}><button type="button" lang={code} dir="auto" aria-current={code === lang ? 'true' : undefined} onClick={() => {
      change(code); ref.current.removeAttribute('open'); ref.current.querySelector('summary').focus();
    }}>{label}</button></li>)}</ul>
  </details>;
}
