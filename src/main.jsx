import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import './styles.css';
import './polish.css';
import { catalogProducts } from './catalog.js';
import { brochureSeries } from './brochure-data.js';
import { companyProfile, capabilities, contactDetails } from './content/company.js';
import { englishSiteContent } from './content/site-content.js';
import { readInquiryError } from './inquiry-errors.js';
import { decideHashNavigation, isHomeRoute } from './scroll-navigation.js';
import { languageOptions, useLanguage } from './language.js';
import { familyMedia, homeMedia } from './media-manifest.js';
import { productImageAlt } from './product-media.js';
import PPFScrollSequence from './components/PPFScrollSequence.jsx';
import PreviewBoundary from './components/PreviewBoundary.jsx';
import { classicColours, DEFAULT_CLASSIC_COLOUR } from './cybertruck-colours.js';
const LazyCybertruckViewer = React.lazy(() => import('./components/CybertruckViewer.jsx'));
function CybertruckViewer(props) {
  return <PreviewBoundary><React.Suspense fallback={<div className="cybertruck-viewer viewer-placeholder" role="status">Loading 3D preview…</div>}><LazyCybertruckViewer {...props} /></React.Suspense></PreviewBoundary>;
}

const products = catalogProducts;
const content = englishSiteContent;
const categories = Object.entries(brochureSeries).map(([slug, info]) => ({
  slug,
  name: info.displayName,
  description: info.intro,
  info
}));

function productDescription(product) {
  return product.description;
}

function Logo() {
  return <a className="logo" href="#top"><img src="/so-fine-logo.svg" alt="SO-FINE" /></a>;
}

function Header() {
  const [open, setOpen] = useState(false);
  const { lang, change, t } = useLanguage();
  const go = (target, event) => {
    setOpen(false);
    if (window.location.hash === target) {
      event.preventDefault();
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  };
  return <header className="header"><div className="header-inner">
    <Logo />
    <nav id="primary-navigation" className={open ? 'nav-open' : ''}>
      <a href="#products" onClick={event => go('#products', event)}>{t('products')}</a>
      <a href="#technology" onClick={event => go('#technology', event)}>{t('technology')}</a>
      <a href="#company" onClick={event => go('#company', event)}>{t('company')}</a>
      <a href="#contact" onClick={event => go('#contact', event)}>{t('contact')}</a>
    </nav>
    <div className="header-actions">
      <select className="language-select" aria-label={content.navigation.languageLabel} value={lang} onChange={event => change(event.target.value)}>
        {languageOptions.map(([label, value]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <a className="header-cta" href="#contact" onClick={event => go('#contact', event)}>{t('talk')} <ArrowUpRight size={15} /></a>
    </div>
    <button className="menu" type="button" aria-label={open ? content.navigation.closeLabel : content.navigation.openLabel} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
  </div></header>;
}

function Lines({ text }) {
  return <>{text.split('\n').map((line, index) => <React.Fragment key={line}>{line}{index === 0 && <br />}</React.Fragment>)}</>;
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const fallbackError = `${content.contact.errorPrefix} ${contactDetails.email}.`;
  const submit = async event => {
    event.preventDefault();
    setState('sending');
    setError('');
    try {
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!response.ok) {
        setError(await readInquiryError(response, fallbackError));
        setState('error');
        return;
      }
      setState('sent');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setError(fallbackError);
      setState('error');
    }
  };
  return <form className="inquiry-form" onSubmit={submit}>
    <div className="form-heading"><span className="kicker">{content.contact.formKicker}</span><p>{content.contact.formIntroduction}</p></div>
    <div className="form-grid">
      <label>{content.contact.nameLabel}<input required maxLength="120" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>
      <label>{content.contact.emailLabel}<input required type="email" maxLength="254" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label>
      <label>{content.contact.phoneLabel}<input maxLength="60" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} /></label>
      <label>{content.contact.subjectLabel}<input required maxLength="200" value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })} /></label>
    </div>
    <label>{content.contact.messageLabel}<textarea required rows="4" maxLength="5000" value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} /></label>
    <div className="form-actions"><button type="submit" disabled={state === 'sending'}>{state === 'sending' ? content.contact.sendingLabel : content.contact.sendLabel} <ArrowUpRight size={16} /></button>{state === 'sent' && <span className="form-success">{content.contact.successMessage}</span>}{state === 'error' && <span className="form-error">{error || fallbackError}</span>}</div>
  </form>;
}

function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem('sofine-admin-token') ?? '');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const load = async () => {
    if (!token.trim()) {
      setError('Enter an admin token.');
      return;
    }
    localStorage.setItem('sofine-admin-token', token);
    const response = await fetch('/api/inquiries', { headers: { 'x-admin-token': token } });
    const data = await response.json();
    if (!response.ok) return setError(data.error);
    setError('');
    setItems(data.inquiries);
  };
  const update = async (id, status) => {
    if (!token.trim()) return setError('Enter an admin token.');
    await fetch('/api/inquiries/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ status }) });
    load();
  };
  return <main className="admin-page"><Header /><div className="admin-inner">
    <p className="kicker">INTERNAL CRM</p><h1>Inquiry <em>inbox.</em></h1>
    <div className="admin-login"><input value={token} onChange={event => setToken(event.target.value)} placeholder="Admin token" /><button onClick={load}>Load inquiries</button></div>
    {error && <p className="form-error">{error}</p>}
    <div className="inquiry-list">{items.map(item => <article key={item.id}><div><small>{new Date(item.created_at).toLocaleString()}</small><h2>{item.subject}</h2><p>{item.message}</p></div><aside><b>{item.name}</b><a href={'mailto:' + item.email}>{item.email}</a><span>{item.phone}</span><select value={item.status} onChange={event => update(item.id, event.target.value)}><option>new</option><option>read</option><option>replied</option><option>archived</option></select></aside></article>)}{!items.length && !error && <p>No inquiries yet.</p>}</div>
  </div></main>;
}

function Home() {
  const [companyYears, companyYearsUnit, , companyIndustry, companyExpertise] = content.company.title.replace('.', '').split(' ');
  const [technologyTitleLead, technologyTitleEmphasis] = content.technology.title.split('\n');
  const [contactTitleLead, contactTitleEmphasis] = content.contact.title.split('\n');
  useEffect(() => {
    const onScroll = () => {
      const progress = Math.min(window.scrollY / 520, 1);
      document.documentElement.style.setProperty('--hero-progress', progress.toFixed(3));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);
  return <main className="home-page">
    <section className="landing" id="top"><Header /><div className="landing-copy"><div className="landing-brand-lockup"><div className="landing-brand-logos"><img src="/so-fine-logo.svg" alt="SO-FINE" /><span>&amp;</span><img src="/media/home/autoface-logo.png" alt="AUTOFACE" /></div><h1 className="landing-title">{content.home.heroTitle}</h1><a className="landing-product-button" href="#category=car-wrapping">{content.home.heroAction} <ArrowUpRight size={16} /></a></div></div><div className="landing-image"><video className="landing-video" autoPlay muted loop playsInline preload="none" aria-label={content.home.heroVideoLabel}><source src="/media/home/hero-factory.mp4" type="video/mp4" /></video><span>01 / 05</span></div></section>
    <PPFScrollSequence />
    <section className="statement" id="company"><figure className="company-evidence reveal"><video className="company-evidence-video" autoPlay muted playsInline preload="metadata" aria-label={content.home.companyVideoLabel}><source src="/media/home/factory-aerial.mp4" type="video/mp4" /></video><figcaption>{content.home.companyVideoCaption}</figcaption></figure><div className="statement-inner"><div className="statement-heading"><p className="kicker">{companyProfile.eyebrow}</p><h2 className="reveal"><span className="company-title-years">{companyYears}</span> {companyYearsUnit} of<br />{companyIndustry}<br /><em>{companyExpertise}.</em></h2></div><div className="company-layout"><div className="statement-copy reveal">{companyProfile.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></div></div></section>
    <ProductShowcase />
    <section className="technology" id="technology"><div className="wide-heading"><p className="kicker">{content.technology.kicker}</p><h2 className="reveal">{technologyTitleLead}<br /><em>{technologyTitleEmphasis}</em></h2></div><div className="tech-grid scroll-art-trigger reveal"><div className="tech-intro"><span className="tech-intro-copy">{content.technology.introduction}</span><img className="tech-intro-material" src="/media/home/clear-polymer-pellets.png" alt="" aria-hidden="true" /></div>{capabilities.map(([number, title, description]) => <div className={'tech-card' + (number === '01' ? ' tech-card-years' : '') + (number === '02' ? ' tech-card-lab' : '') + (number === '04' ? ' tech-card-application' : '')} key={number}>{number === '01' && <img className="tech-card-years-art" src="/media/home/years-20.png" alt="" aria-hidden="true" />}{number === '02' && <img className="tech-card-lab-art" src="/media/home/dionhva-lab-2303931.svg" alt="" aria-hidden="true" />}{number === '04' && <img className="tech-card-application-art" src="/media/home/application-device.png" alt="" aria-hidden="true" />}<span>{number}</span><h3 className="reveal">{title}</h3><p>{description}</p></div>)}</div></section>
    <section className="contact" id="contact"><div className="contact-inner"><p className="kicker">{content.contact.kicker}</p><h2 className="reveal">{contactTitleLead}<br /><em>{contactTitleEmphasis}</em></h2><a className="mail-link reveal" href={'mailto:' + contactDetails.email}>{contactDetails.email} <ArrowUpRight /></a><ContactForm /><footer className="contact-companies"><div className="contact-company"><b>{contactDetails.factoryName}</b><span>{contactDetails.factoryAddress}</span></div><div className="contact-company"><b>{contactDetails.salesName}</b><span>{contactDetails.salesAddress}</span></div><div className="contact-company contact-methods"><a href={'tel:' + contactDetails.phones[0]}>Tel: {contactDetails.phones[0]}</a><a href={'tel:' + contactDetails.phones[1]}>Tel: {contactDetails.phones[1]}</a><span>Fax: {contactDetails.fax}</span><a href={'mailto:' + contactDetails.email}>{contactDetails.email}</a></div></footer></div></section>
  </main>;
}

function MaterialStory() {
  const [materialTitleLead, materialTitleEmphasis] = content.home.materialTitle.split('\n');
  return <section className="material-story" aria-labelledby="material-story-title">
    <div className="material-story-head"><p className="kicker">{content.home.materialKicker}</p><h2 id="material-story-title" className="reveal">{materialTitleLead}<br /><em>{materialTitleEmphasis}</em></h2></div>
    <div className="material-story-grid">
      <article className="material-tile material-tile-detail reveal"><img src={homeMedia.materialDetail} alt={content.home.materialItems[0].description} width="1440" height="960" loading="lazy" decoding="async" /><span>{content.home.materialItems[0].name}</span></article>
      <article className="material-tile material-tile-signage reveal"><img src={homeMedia.signage} alt={content.home.materialItems[1].description} width="1440" height="960" loading="lazy" decoding="async" /><span>{content.home.materialItems[1].name}</span></article>
      <article className="material-tile material-tile-automotive reveal"><img src={homeMedia.automotive} alt={content.home.materialItems[2].description} width="1440" height="960" loading="lazy" decoding="async" /><span>{content.home.materialItems[2].name}</span></article>
    </div>
  </section>;
}

function ProductShowcase() {
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedColour, setSelectedColour] = useState(DEFAULT_CLASSIC_COLOUR);
  const [isShuffling, setIsShuffling] = useState(false);
  const selectedCategory = categories[selectedIndex];
  const isClassicColours = selectedCategory.slug === 'car-wrapping' && selectedCategory.info.series.some(([name]) => name === 'Super Chrome Film Classic Colours');
  const selectedMedia = familyMedia[selectedCategory.slug];
  const previousIndex = (selectedIndex - 1 + categories.length) % categories.length;
  const nextIndex = (selectedIndex + 1) % categories.length;
  const previousCategory = categories[previousIndex];
  const nextCategory = categories[nextIndex];
  const touchStartX = useRef(0);
  const touchMoved = useRef(false);
  const shuffleTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(shuffleTimer.current), []);
  const selectOffset = offset => {
    window.clearTimeout(shuffleTimer.current);
    setIsShuffling(true);
    setSelectedIndex(index => (index + offset + categories.length) % categories.length);
    shuffleTimer.current = window.setTimeout(() => setIsShuffling(false), 650);
  };
  const handleKeyDown = event => {
    if (event.target.closest('input, select, textarea, .cybertruck-viewer')) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectOffset(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectOffset(1);
    }
  };
  const handleTouchStart = event => {
    touchStartX.current = event.touches[0].clientX;
    touchMoved.current = false;
  };
  const handleTouchEnd = event => {
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) < 48) return;
    touchMoved.current = true;
    selectOffset(distance < 0 ? 1 : -1);
  };
  const handleActiveClick = event => {
    if (touchMoved.current) {
      event.preventDefault();
      touchMoved.current = false;
    }
  };

  const activeCard = <div className={'stack-card-content' + (isClassicColours ? ' stack-card-content-interactive' : '')} key={selectedCategory.slug}>
    {isClassicColours ? <CybertruckViewer colour={selectedColour} /> : <img src={selectedMedia.preview} alt={selectedMedia.alt} width="1200" height="800" loading="lazy" decoding="async" />}
    <div className="stack-card-copy"><span className="stack-index">{String(selectedIndex + 1).padStart(2, '0')}</span><strong>{selectedCategory.name}</strong><small>{selectedCategory.description}</small>{isClassicColours && <div className="cybertruck-swatches" aria-label={content.cybertruck.colourChoicesLabel}>{classicColours.map(colour => <button key={colour.id} type="button" className={selectedColour === colour.hex ? 'is-selected' : ''} aria-pressed={selectedColour === colour.hex} aria-label={colour.name} title={colour.name} style={{ '--swatch': colour.hex }} onClick={() => setSelectedColour(colour.hex)} />)}</div>}{isClassicColours ? <a className="stack-cta" href={'#category=' + selectedCategory.slug}>{content.products.exploreProducts} <ArrowUpRight size={20} /></a> : <span className="stack-cta">{content.products.exploreProducts} <ArrowUpRight size={20} /></span>}</div>
  </div>;
  return <section className="showcase category-showcase" id="products"><div className="showcase-head"><div><p className="kicker">{t('productLibrary')} / {categories.length} {content.products.familyCountLabel}</p><h2 className="reveal">{t('choose')}<br /><em>{t('surface')}</em></h2></div><p className="reveal">{t('start')}</p></div><div className={'stack-selector' + (isShuffling ? ' is-shuffling' : '')} tabIndex="0" onKeyDown={handleKeyDown} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}><button className="stack-card stack-card-prev" type="button" aria-label={`${content.products.selectPrefix} ${previousCategory.name}`} onClick={() => selectOffset(-1)}><img src={familyMedia[previousCategory.slug].preview} alt={familyMedia[previousCategory.slug].alt} /><span>{previousCategory.name}</span></button>{isClassicColours ? <article className="stack-card stack-card-active stack-card-interactive">{activeCard}</article> : <a href={'#category=' + selectedCategory.slug} className="stack-card stack-card-active" onClick={handleActiveClick}>{activeCard}</a>}<button className="stack-card stack-card-next" type="button" aria-label={`${content.products.selectPrefix} ${nextCategory.name}`} onClick={() => selectOffset(1)}><img src={familyMedia[nextCategory.slug].preview} alt={familyMedia[nextCategory.slug].alt} /><span>{nextCategory.name}</span></button><div className="stack-controls"><button type="button" aria-label={content.products.previousFamily} onClick={() => selectOffset(-1)}><span aria-hidden="true">←</span></button><button type="button" aria-label={content.products.nextFamily} onClick={() => selectOffset(1)}><span aria-hidden="true">→</span></button></div></div></section>;
}

function ProductTable({ items }) {
  const columns = [...new Set(items.flatMap(item => item.specs.map(([label]) => label)))];
  return <div className="product-spec-table" style={{ '--table-columns': columns.length }}><div className="product-spec-table-head"><span>{content.products.productCode}</span>{columns.map(column => <span key={column}>{column}</span>)}</div>{items.map(item => <div className="product-spec-table-row" key={item.slug}><strong><a href={'#product=' + item.slug}>{item.model}</a></strong>{columns.map(column => <span key={column}>{item.specs.find(([label]) => label === column)?.[1] || '-'}</span>)}</div>)}</div>;
}

function CategoryPage({ category, series }) {
  const { t } = useLanguage();
  const [selectedColour, setSelectedColour] = useState(DEFAULT_CLASSIC_COLOUR);
  const { info } = category;
  const activeSeries = series || (info.series.length === 1 ? info.series[0][0] : '');
  const items = products.filter(product => product.category === category.slug && (!activeSeries || product.group === activeSeries));
  const media = familyMedia[category.slug];
  const isClassicColours = activeSeries === 'Super Chrome Film Classic Colours';
  const selectedColourName = classicColours.find(colour => colour.hex === selectedColour)?.name || content.cybertruck.customColour;
  const [cybertruckTitleLead, cybertruckTitleEmphasis] = content.cybertruck.title.split('\n');
  return <main className="category-page"><Header /><div className="category-page-head"><div className="category-page-copy"><p className="kicker">{info.eyebrow}</p><h1>{category.name}</h1><p>{info.intro}</p></div><div className={'category-page-media category-page-media-' + category.slug}><img src={media.hero} alt={media.alt} width="1600" height="900" decoding="async" /><span aria-hidden="true">{String(categories.findIndex(item => item.slug === category.slug) + 1).padStart(2, '0')} / {String(categories.length).padStart(2, '0')}</span></div></div><div className="series-grid">{info.series.map(([name, description], index) => <a href={'#category=' + category.slug + '&series=' + encodeURIComponent(name)} className={'series-card reveal' + (activeSeries === name ? ' series-card-selected' : '')} key={name}><span>{String(index + 1).padStart(2, '0')}</span><h2>{name}</h2><p>{description}</p><b className="text-link">{activeSeries === name ? content.products.selected : content.products.viewModels} <ArrowUpRight size={16} /></b></a>)}</div>{isClassicColours && <section className="cybertruck-config"><div><p className="kicker">{content.cybertruck.kicker}</p><h2>{cybertruckTitleLead}<br /><em>{cybertruckTitleEmphasis}</em></h2><p>{content.cybertruck.description}</p><label className="cybertruck-picker-label" htmlFor="cybertruck-colour">{content.cybertruck.surfaceColour} <span>{selectedColourName}</span></label><input id="cybertruck-colour" className="cybertruck-color-picker" type="color" value={selectedColour} onChange={event => setSelectedColour(event.target.value.toUpperCase())} /><div className="cybertruck-swatches" aria-label={content.cybertruck.colourChoicesLabel}>{classicColours.map(colour => <button key={colour.id} type="button" className={selectedColour === colour.hex ? 'is-selected' : ''} aria-label={colour.name} title={colour.name} style={{ '--swatch': colour.hex }} onClick={() => setSelectedColour(colour.hex)} />)}</div></div><CybertruckViewer colour={selectedColour} /></section>}{items.length > 0 && <ProductTable items={items} />}<div className="detail-next category-back"><a href="#products">← {t('allFamilies')}</a></div></main>;
}

function Detail({ product }) {
  const { t } = useLanguage();
  return <main className="detail"><Header /><div className="detail-hero"><div><p className="kicker">{product.family} / {t('productDetail')}</p><div className="detail-model">{product.model}</div><h1><Lines text={product.title} /></h1><p>{product.description}</p></div><div className="detail-gallery">{(product.gallery || [product.image]).map((image, index) => <div className="detail-hero-image" key={image}><img src={image} alt={productImageAlt(product, image, index)} /><span>{product.model}</span></div>)}</div></div><div className="spec-area"><div><p className="kicker">{t('specs')}</p><h2>{t('made')}<br /><em>{t('perform')}</em></h2></div><div className="spec-table">{product.specs.map(([label, value], index) => <div key={label + '-' + index}><span>{label}</span><b>{value}</b></div>)}</div></div><div className="detail-next"><a href="#products">← {t('back')}</a><a href="#contact">{t('request')} <ArrowUpRight size={16} /></a></div></main>;
}

function App() {
  const [hash, setHash] = useState(window.location.hash);
  const previousHash = useRef(window.location.hash);
  useEffect(() => {
    const savedScroll = () => Number(sessionStorage.getItem('sofine-home-scroll') || 0);
    const saveHomeScroll = () => sessionStorage.setItem('sofine-home-scroll', String(window.scrollY));
    const applyNavigation = action => window.setTimeout(() => {
      if (action.type === 'preserve') return;
      if (action.type === 'restore' || action.type === 'top') {
        window.scrollTo({ top: action.type === 'restore' ? action.top : 0, behavior: 'auto' });
      } else {
        document.getElementById(action.id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }, 0);
    const onHashChange = () => {
      const nextHash = window.location.hash;
      const previous = previousHash.current;
      if (isHomeRoute(previous) && !isHomeRoute(nextHash)) saveHomeScroll();
      setHash(nextHash);
      applyNavigation(decideHashNavigation({ previousHash: previous, nextHash, savedHomeScroll: savedScroll() }));
      previousHash.current = nextHash;
    };
    const onScroll = () => {
      if (isHomeRoute(window.location.hash)) saveHomeScroll();
    };
    applyNavigation(decideHashNavigation({ previousHash: '', nextHash: window.location.hash, savedHomeScroll: savedScroll() }));
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  const slug = hash.startsWith('#product=') ? hash.replace('#product=', '') : '';
  const categoryParams = hash.startsWith('#category=') ? new URLSearchParams(hash.slice(1)) : null;
  const categorySlug = categoryParams?.get('category') || '';
  const series = categoryParams?.get('series') || '';
  const product = products.find(item => item.slug === slug);
  const category = categories.find(item => item.slug === categorySlug);
  if (hash === '#admin') return <AdminPage />;
  return product ? <Detail product={product} /> : category ? <CategoryPage category={category} series={series} /> : <Home />;
}

createRoot(document.getElementById('root')).render(<App />);
