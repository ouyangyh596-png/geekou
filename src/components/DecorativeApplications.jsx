import React from 'react';
import { useLanguage } from '../language.js';
import images from './decorative-applications.json';
import './decorative-applications.css';

const mediaRoot = '/media/decorative-applications/';
const positions = ['50% 58%', '50% 50%', '50% 48%', '50% 50%', '50% 58%', '50% 55%', '50% 50%', '50% 55%', '50% 60%'];
export default function DecorativeApplications() {
  const { lang } = useLanguage();
  const zh = lang === 'zh';
  return <section className="decorative-applications" aria-labelledby="decorative-applications-title">
    <div className="decorative-applications-heading">
      <h2 id="decorative-applications-title">{zh ? '应用场景' : 'Applications'}</h2>
      <p>{zh ? 'AI生成应用示意图' : 'AI-generated application inspiration'}</p>
    </div>
    <div className="decorative-applications-grid">
      {images.applications.map((item, index) => <figure className="decorative-application" key={item.file}>
        <img src={mediaRoot + item.file} alt={item[lang]} width={item.width} height={item.height} loading="lazy" decoding="async" style={{ objectPosition: positions[index] }} />
        <figcaption>{item[lang]}</figcaption>
      </figure>)}
    </div>
    <div className="decorative-textures">
      {images.textures.map(item => <figure className="decorative-texture" key={item.file}>
        <img src={mediaRoot + item.file} alt={item[lang]} width={item.width} height={item.height} loading="lazy" decoding="async" />
        <figcaption>{item[lang]}</figcaption>
      </figure>)}
    </div>
  </section>;
}
