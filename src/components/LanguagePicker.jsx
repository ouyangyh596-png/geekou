import { languageOptions, useLanguage } from '../language.js';

export default function LanguagePicker() {
  const { lang, change, t } = useLanguage();
  return <div className="language-picker" role="group" aria-label={t('languageLabel')}>
    {languageOptions.map(([label, code], index) => <span key={code}>
      {index > 0 && <span className="language-divider" aria-hidden="true">|</span>}
      <button type="button" lang={code} aria-label={lang === 'zh' ? (code === 'en' ? '切换为英语' : '简体中文') : label} aria-pressed={code === lang} onClick={() => change(code)}>{code === 'en' ? 'EN' : label}</button>
    </span>)}
  </div>;
}
