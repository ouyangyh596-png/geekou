import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const main = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');

assert.match(
  main,
  /<h1 className="landing-title"><span>Innovation \/ Quality<\/span><br \/><span>Service \/ Commitment<\/span><\/h1>/,
  'the complete visible hero heading must live in semantic markup'
);
assert.doesNotMatch(styles, /\.landing h1(?::after|::after)[^{]*\{[^}]*content\s*:/, 'CSS must not inject hero heading content');

assert.match(main, /<nav id="primary-navigation"/, 'the primary navigation must expose a stable controlled id');
assert.match(main, /aria-controls="primary-navigation"/, 'the menu button must identify the controlled navigation');
assert.match(main, /aria-expanded=\{open\}/, 'the menu button must expose its expanded state');
assert.match(main, /aria-label=\{open \? 'Close navigation' : 'Open navigation'\}/, 'the menu button label must track its state');

assert.doesNotMatch(styles, /https?:\/\//, 'production CSS must not load remote assets');
assert.doesNotMatch(styles, /@import\s+url/, 'production CSS must not depend on remote font stylesheets');
assert.match(styles, /body\{[^}]*font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif/, 'body text must use an intentional local system stack');
assert.match(styles, /\.kicker\{[^}]*ui-monospace/, 'technical labels must use an intentional local monospace stack');

assert.match(
  styles,
  /@media\(prefers-reduced-motion:reduce\)\{[^}]*html\{scroll-behavior:auto\}/,
  'reduced motion must disable smooth scrolling'
);
assert.match(
  styles,
  /@media\(prefers-reduced-motion:reduce\)\{[\s\S]*?\*,\*::before,\*::after\{animation:none!important;transition:none!important/,
  'reduced motion must comprehensively disable animation and transitions'
);

const sourceDirectory = new URL('../src/', import.meta.url);
for (const entry of await readdir(sourceDirectory, { recursive: true })) {
  if (!/\.(?:css|js|jsx)$/.test(entry)) continue;
  const source = await readFile(new URL(entry, sourceDirectory), 'utf8');
  assert.doesNotMatch(source, /(?:src|href)=["'{][^\n]*(?:https?:)?\/\//, `${entry}: production resources must be project-local`);
}

console.log('PASS: validated semantic heading, mobile navigation, reduced motion and local production assets');
