import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
const base = readFileSync('src/styles.css','utf8');
const polish = readFileSync('src/polish.css','utf8');
const main = readFileSync('src/main.jsx','utf8');
for (const [token,value] of Object.entries({'colour-navy':'#0B1F3A','colour-blue':'#0A60C8','colour-mist':'#F4F7FB','colour-ink':'#4A5568','colour-muted':'#6B7280','colour-line':'#E5E9F0','type-display':'72px','type-hero':'56px','type-section':'40px','type-card':'24px','type-body':'17px','type-small':'14px','type-label':'12px','content-width':'1280px'})) assert.ok(base.includes(`--${token}: ${value}`),token);
for (const css of [base,polish]) assert.doesNotMatch(css,/font(?:-size)?:\s*(?:[0-9]|1[01])px\b/,'no undersized text');
assert.match(polish,/scrollbar-gutter: stable/);
assert.match(polish,/\.container\s*\{[^}]*max-width:1280px;[^}]*padding-inline:32px/s);
assert.match(polish,/transition:transform 400ms/);
assert.match(polish,/prefers-reduced-motion:reduce/);
assert.equal((polish.match(/font-display: swap/g)||[]).length,3);
for (const file of ['barlow-semi-condensed-500-latin.woff2','barlow-semi-condensed-600-latin.woff2','manrope-latin.woff2']) assert.ok(statSync(`public/fonts/${file}`).size>1000);
assert.doesNotMatch(polish,/font-family:\s*"(?:DM Mono|Space Grotesk)"/);
console.log('Typography tokens, local fonts, containers and accessible motion passed');

assert.doesNotMatch(polish, /--(?:type-(?:display|hero|section|card|body|small|label)|page-gutter)\s*:/, 'polish must consume shared typography and gutter tokens');
assert.match(base, /--type-display:54px; --type-hero:42px; --type-section:30px; --type-card:18px; --type-body:12\.75px; --type-small:12px; --section-space:72px/, 'mobile scale respects the 12px minimum');
assert.match(main, /threshold: 0, rootMargin: '0px 0px -10% 0px'/, 'reveal starts early without a visibility threshold');
