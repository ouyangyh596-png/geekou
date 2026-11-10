import { useEffect, useState } from 'react';
import { chineseSiteContent } from './content/site-content.zh.js';
import { englishSiteContent } from './content/site-content.js';

export const languageOptions = [['English', 'en'], ['中文', 'zh']];
export const copy = Object.fromEntries([['en', englishSiteContent], ['zh', chineseSiteContent]].map(([code, content]) => [code, {
  ...content.navigation, ...content.products, companyKicker:content.company.eyebrow,
  companyTitle:content.company.title, companyText:'', techKicker:content.technology.kicker,
  techTitle:content.technology.title, contactKicker:content.contact.kicker, contactTitle:content.contact.title
}]));
export function normalizeLanguage(value) { return value === 'zh' ? 'zh' : 'en'; }

export function resolveContent(language, base = englishSiteContent, translations = language === 'zh' ? chineseSiteContent : {}) {
  if (typeof base === 'string') return typeof translations === 'string' && translations.trim() ? translations : base;
  if (Array.isArray(base)) return base.map((value,index) => resolveContent(language,value,translations?.[index]));
  return Object.fromEntries(Object.entries(base).map(([key,value]) => [key,resolveContent(language,value,translations?.[key])]));
}
const contentCache = Object.fromEntries(languageOptions.map(([,code]) => [code,resolveContent(code)]));
function savedLanguage() {
  try { return normalizeLanguage(localStorage.getItem('sofine-language')); } catch { return 'en'; }
}
export function useLanguage() {
  const [lang,setLang] = useState(savedLanguage);
  useEffect(() => {
    const onChange = event => setLang(event.detail ? normalizeLanguage(event.detail) : savedLanguage());
    window.addEventListener('sofine-language-change',onChange);
    window.addEventListener('storage',onChange);
    return () => { window.removeEventListener('sofine-language-change',onChange); window.removeEventListener('storage',onChange); };
  },[]);
  useEffect(() => { document.documentElement.lang = lang; },[lang]);
  const change = value => {
    if (!languageOptions.some(([,code]) => code === value)) return;
    try { localStorage.setItem('sofine-language',value); } catch { /* Storage may be disabled. */ }
    setLang(value);
    window.dispatchEvent(new CustomEvent('sofine-language-change', { detail: value }));
  };
  return {lang,change,content:contentCache[lang],t:key => (lang === 'zh' ? contentCache.zh.navigation[key] || contentCache.zh.products[key] : copy[lang]?.[key]) || copy.en[key] || key};
}
