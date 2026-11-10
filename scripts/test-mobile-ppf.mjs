import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const source=readFileSync(process.cwd()+'/src/components/MobilePPFScrollSequence.jsx','utf8')
assert.ok(source.includes('function expansionAt('), 'code-drawn sequence exposes deterministic scroll phases')
const fn=source.slice(source.indexOf('function expansionAt('),source.indexOf('\nexport default'))
const expansionAt=new Function(`${fn}; return expansionAt`)()
for (const [p,v] of [[0,0],[.15,0],[.375,.5],[.6,1],[.7,1],[.85,1],[.925,.5],[1,0]]) assert.ok(Math.abs(expansionAt(p)-v)<1e-8,`phase ${p}`)
for(let i=0;i<=100;i++) assert.ok(expansionAt(i/100)>=0 && expansionAt(i/100)<=1)
console.log('Scroll phase boundaries, easing and reverse-deterministic mapping PASS')
const effect=source.slice(source.indexOf('    const section = sectionRef.current'),source.indexOf('\n  }, [])'))
let p=0, next=0
const callbacks=new Map(), events=new Map()
const motion={matches:false,addEventListener:(k,f)=>events.set('motion',f),removeEventListener:()=>events.delete('motion')}
const layers=Array.from({length:4},()=>({style:{},label:{style:{}},querySelector(){return this.label}}))
const track={offsetHeight:2400,getBoundingClientRect:()=>({top:-p*1600})}, sticky={offsetHeight:800}
const section={querySelector:s=>s.endsWith('track')?track:sticky}
const viewport={matchMedia:()=>motion,addEventListener:(k,f)=>events.set(k,f),removeEventListener:k=>events.delete(k)}
const sheen={style:{}}
const cleanup=new Function('sectionRef','layersRef','sheenRef','window','ResizeObserver','requestAnimationFrame','cancelAnimationFrame','expansionAt',effect)(
 {current:section},{current:layers},{current:sheen},viewport,class{observe(){} disconnect(){}},f=>{callbacks.set(++next,f);return next},id=>callbacks.delete(id),expansionAt)
const flush=()=>{const pending=[...callbacks.values()];callbacks.clear();pending.forEach(f=>f())}
flush();assert.equal(layers[0].style.transform,'translateY(-28px)')
for(const value of [.15,.375,.6,.85,1,.6,0]){
 p=value;events.get('scroll')();events.get('scroll')();assert.equal(callbacks.size,1);flush()
 assert.equal(layers[0].style.transform,`translateY(${-(28+176*expansionAt(p))}px)`)
 assert.equal(callbacks.size,0)
}
motion.matches=true;events.get('motion')();flush();assert.equal(layers[0].style.transform,'translateY(-204px)');assert.equal(layers[0].label.style.opacity,1)
p=1;events.get('scroll')();flush();assert.equal(layers[0].style.transform,'translateY(-204px)')
events.get('scroll')();cleanup();assert.equal(callbacks.size,0);assert.equal(events.size,0)
console.log('Actual effect: forward/reverse, RAF coalescing/idle, reduced motion toggle and cleanup PASS')
