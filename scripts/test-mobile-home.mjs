import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const main = read('src/main.jsx');
assert.match(main, /\{isMobile \? <PPFScrollSequence \/> : <PPFLayerAnimation \/>\}/);
assert.match(main, /<main className="home-page">/);
assert.doesNotMatch(main, /home-page is-mobile|closest\('\.is-mobile'\)|import '\.\/mobile\.css'/);
const hook = read('src/use-is-mobile.js');
assert.match(hook, /max-width: 820px/);
assert.match(hook, /pointer: coarse/);
assert.doesNotMatch(hook, /userAgent/);
const css = read('src/mobile.css');
for (const rule of css.replace(/@media[^\{]+\{/g, '').split('}').filter(rule => rule.includes('{'))) {
  assert.ok(rule.slice(0, rule.indexOf('{')).trim().split(',').every(selector => selector.trim().startsWith('.is-mobile')), 'every rule is mobile scoped');
}
console.log('Mobile branch and CSS isolation PASS');

// Evaluate the actual device hook without requiring a browser/server.
const query = hook.match(/const query = '([^']+)'/)[1];
const body = hook.slice(hook.indexOf('  const [isMobile'), hook.lastIndexOf('}'));
for (const [width, coarse, expected] of [[390,false,true],[820,false,true],[821,false,false],[1024,true,true],[1025,true,false],[1280,false,false]]) {
  let state, change, cleanup;
  const media = {matches: width <= 820 || coarse && width <= 1024,
    addEventListener: (_, fn) => {change = fn}, removeEventListener: () => {change = null}};
  const result = new Function('window','useState','useEffect','query',body)(
    {matchMedia:q => {assert.equal(q,query); return media}},
    init => [state = init(), value => {state = value}],
    effect => {cleanup = effect()}, query);
  assert.equal(result,expected, `${width}px coarse=${coarse}`);
  media.matches = !expected; change(); assert.equal(state,!expected,'resize/orientation media change');
  cleanup(); assert.equal(change,null);
}

const { createHash } = await import('node:crypto');
const mobileMarkup = main.slice(main.indexOf('  return <main className="home-page"'), main.indexOf('\nfunction MaterialStory')).replace('{isMobile ? <PPFScrollSequence /> : <PPFLayerAnimation />}', '<PPFScrollSequence />');
assert.equal(createHash('sha256').update(mobileMarkup).digest('hex'), '846cc04954adbca01287385ab0955c866151ae05fa993ac9c5eac38c76ea0847', 'mobile Home markup is byte-for-byte baseline');
console.log('390/1280 device classification, resize cleanup and mobile markup baseline PASS');

const { createTouchGesture } = await import('../src/product-wheel-navigation.js');
const handlers = main.slice(main.indexOf('    const handleTouchStart'), main.indexOf("    wheelTarget.addEventListener('wheel'"));
for (const mobile of [true,false]) {
  let selected = 0, prevented = false;
  const {start,move,end} = new Function('wheelTarget','touchMoved','createTouchGesture','selectedIndexRef','categories','applyGesture',
    'let touch = null;' + handlers + ';return {start:handleTouchStart,move:handleTouchMove,end:handleTouchEnd}')(
    {closest:()=>mobile},{current:false},createTouchGesture,{current:0},Array(11),
    (_,action)=>{prevented=true;if(action.type==='select')selected=action.index});
  const event = (x,y) => ({touches:[{clientX:x,clientY:y}],target:{closest:()=>null}});
  start(event(300,300));move(event(299,298));

  move(event(295,100));
  assert.equal(selected,1,'vertical swipe preserves main card selection behavior');
  end(); selected=0;start(event(300,300));move(event(100,295));
  assert.equal(selected,1,'horizontal swipe selects next card');
}
console.log('Main vertical and horizontal card swipe behavior PASS');
