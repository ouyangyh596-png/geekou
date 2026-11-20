import React, { useRef } from 'react';
import { catalogProducts } from '../catalog.js';
import { useLanguage } from '../language.js';
import './ppf-series.css';

const seriesIds = ['premium', 'econo', 'colored'];
const fields = ['Finish', 'Material', 'Adhesive', 'Liner'];
const validSeries = value => seriesIds.includes(value) ? value : 'premium';

export default function PPFSeries({ series }) {
  const { content, lang } = useLanguage();
  const copy = content.categories.ppf;
  const selected = validSeries(series);
  const heading = useRef(null);
  const cards = useRef([]);
  const items = catalogProducts.filter(product => product.category === 'ppf' && product.group === selected);
  const title = copy.series[seriesIds.indexOf(selected)].name;
  const label = field => content.specLabels[field] || field;
  const finish = value => lang === 'zh' ? (value === 'Glossy' ? '亮光' : '哑光') : value;
  const value = (item, field) => {
    const raw = item.specs.find(([key]) => key === field)[1];
    return field === 'Finish' ? finish(raw) : raw;
  };
  function select(id, pointer = false) {
    // Same-category hash navigation preserves scroll and keeps the router in sync.
    window.location.hash = 'category=ppf&series=' + id;
    if (pointer && window.matchMedia('(max-width: 599px)').matches) {
      requestAnimationFrame(() => {
        const bounds = heading.current?.getBoundingClientRect();
        if (bounds && (bounds.top < 80 || bounds.bottom > window.innerHeight)) {
          window.scrollBy({ top: bounds.top - 96, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        }
      });
    }
  }
  function onKeyDown(event, index) {
    const offset = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    const next = (index + offset + seriesIds.length) % seriesIds.length;
    select(seriesIds[next]);
    cards.current[next]?.focus({ preventScroll: true });
  }
  return <div className="ppf-series container">
    <div className="ppf-series-cards" role="radiogroup" aria-label={content.navigation.families}>
      {seriesIds.map((id, index) => <button key={id} ref={node => { cards.current[index] = node; }} type="button" role="radio"
        aria-checked={selected === id} aria-controls="ppf-detail" tabIndex={selected === id ? 0 : -1}
        className="ppf-series-card" onClick={event => select(id, event.detail > 0)} onKeyDown={event => onKeyDown(event, index)}>
        <span className="ppf-series-name">{copy.series[index].name}</span>
        <span className="ppf-series-hint">{copy.series[index].description}</span>
        <span className="ppf-series-check" aria-hidden="true">{selected === id ? '✓' : ''}</span>
      </button>)}
    </div>
    <section className="ppf-detail" id="ppf-detail" aria-labelledby="ppf-detail-heading">
      <h2 id="ppf-detail-heading" ref={heading}>{title}</h2>
      {selected === 'colored' ? <>
        <ul className="ppf-subtypes">{copy.series[2].description.split(' · ').map(name => <li key={name}><h3>{name}</h3></li>)}</ul>
        <p className="ppf-pending" role="status">{copy.pendingInfo}</p>
      </> : <>
        <table className="ppf-spec-table"><thead><tr><th scope="col">{lang === 'zh' ? '型号' : 'Model'}</th>{fields.map(field => <th scope="col" key={field}>{label(field)}</th>)}</tr></thead>
          <tbody>{items.map(item => <tr key={item.model}><td>{item.model}</td>{fields.map(field => <td key={field}>{value(item, field)}</td>)}</tr>)}</tbody>
        </table>
        <div className="ppf-models">{items.map(item => <article key={item.model}><h3>{item.model}<span>{value(item, 'Finish')}</span></h3>
          <dl>{fields.slice(1).map(field => <div key={field}><dt>{label(field)}</dt><dd>{value(item, field)}</dd></div>)}</dl>
        </article>)}</div>
      </>}
    </section>
  </div>;
}
