import { useEffect, useRef, useState } from 'react';
import { languageOptions, useLanguage } from '../language.js';

export default function LanguagePicker() {
  const { lang, change, t } = useLanguage();
  const [pressed, setPressed] = useState(null);
  const pressTimer = useRef();
  useEffect(() => () => clearTimeout(pressTimer.current), []);
  const showPress = code => {
    clearTimeout(pressTimer.current);
    setPressed(code);
    pressTimer.current = setTimeout(() => setPressed(null), 180);
  };
  return <div className="language-picker" role="group" aria-label={t('languageLabel')}>
    {languageOptions.map(([label, code], index) => <span key={code}>
      {index > 0 && <span className="language-divider" aria-hidden="true">|</span>}
      <button type="button" lang={code} aria-label={lang === 'zh' ? (code === 'en' ? '切换为英语' : '简体中文') : label} aria-pressed={code === lang} className={pressed === code ? 'is-pressed' : undefined} onPointerDown={event => { if (event.button === 0) showPress(code); }} onKeyDown={event => { if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) showPress(code); }} onClick={() => { showPress(code); change(code); }}>{code === 'en' ? 'EN' : label}</button>
    </span>)}
  </div>;
}
