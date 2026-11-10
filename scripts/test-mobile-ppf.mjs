import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const source=readFileSync(process.cwd()+'/src/components/PPFLayerAnimation.jsx','utf8')
const fn=source.slice(source.indexOf('function cubicBezier('),source.indexOf('\nexport default'))
const {rawExpansionAt,layerExpansion}=new Function(`${fn}; return {rawExpansionAt,layerExpansion}`)()
const effect=source.slice(source.indexOf('    const section = sectionRef.current'),source.indexOf('\n  }, [mobile, lang])'))
let p=0, next=0, now=0
const callbacks=new Map(), events=new Map()
const motion={matches:false,addEventListener:(k,f)=>events.set('motion',f),removeEventListener:()=>events.delete('motion')}
const layers=Array.from({length:4},()=>({style:{},label:{style:{}},querySelector(){return this.label}}))
const track={offsetHeight:2400,getBoundingClientRect:()=>({top:-p*1600})}, sticky={offsetHeight:800}
const legend=Array.from({length:4},()=>({current:null,setAttribute(k,v){this.current=v},removeAttribute(){this.current=null}}))
const section={querySelector:s=>s.endsWith('track')?track:sticky,querySelectorAll:()=>legend}
const viewport={matchMedia:()=>motion,addEventListener:(k,f)=>events.set(k,f),removeEventListener:k=>events.delete(k)}
const sheen={style:{}}, background={style:{}}
const runEffect=new Function('mobile','stackRef','sectionRef','layersRef','sheenRef','backgroundRef','window','ResizeObserver','requestAnimationFrame','cancelAnimationFrame','rawExpansionAt','layerExpansion',effect)
const cleanup=runEffect(
 true,null,{current:section},{current:layers},{current:[sheen,sheen,sheen,sheen]},{current:background},viewport,class{observe(){} disconnect(){}},f=>{callbacks.set(++next,f);return next},id=>callbacks.delete(id),rawExpansionAt,layerExpansion)
const flush=()=>{const pending=[...callbacks.values()];callbacks.clear();now+=16;pending.forEach(f=>f(now))}
const renderedProgress=()=> (Number(background.style.transform.match(/, ([-\d.]+)px/)[1])+40)/80
const settle=()=>{
 let frames=0
 while(callbacks.size){assert.ok(frames++<200,'effect converges and becomes idle within 200 frames');flush()}
 return frames
}
const assertLayers=raw=>layers.forEach((layer,index)=>{
 const expansion=layerExpansion(raw,index)
 assert.equal(layer.style.transform,`translate3d(0, ${-((4-index)*51*expansion)}px, 0)`)
 assert.equal(layer.label.style.opacity,Math.min(1,expansion*1.6))
})
flush();assertLayers(0)
for(const value of [.15,.375,.6,.85,1,.6,0]){
 const before=renderedProgress()
 p=value;events.get('scroll')();events.get('scroll')();assert.equal(callbacks.size,1);flush()
 const first=renderedProgress()
 assert.ok(first>Math.min(before,p) && first<Math.max(before,p),'first frame moves toward target without jumping')
 assert.equal(callbacks.size,1,'smoothing schedules another frame')
 let previous=first, frames=1
 while(callbacks.size){
  assert.ok(frames++<200,'scroll target converges within 200 frames')
  flush()
  const current=renderedProgress()
  assert.ok(Math.abs(p-current)<=Math.abs(p-previous)+1e-12,'each frame approaches target')
  previous=current
 }
 assertLayers(rawExpansionAt(p))
 assert.equal(background.style.transform,`translate3d(0, ${-40+p*80}px, 0)`)
}
motion.matches=true;events.get('motion')();flush();assertLayers(1);assert.equal(callbacks.size,0)
p=1;events.get('scroll')();flush();assertLayers(1);assert.equal(background.style.transform,'translate3d(0, 0px, 0)')
motion.matches=false;events.get('motion')();settle();assertLayers(0)
events.get('scroll')();cleanup();assert.equal(callbacks.size,0);assert.equal(events.size,0)
console.log('Actual effect: forward/reverse, RAF coalescing/idle, reduced motion toggle and cleanup PASS')

// Desktop centers measured artwork (including the labels) at every scroll phase.
let translation = ''
const stack = {
 getBBox: () => ({x:12,y:42,width:380,height:232}),
 setAttribute: (name,value) => { assert.equal(name,'transform'); translation=value }
}
motion.matches=true
const desktopCleanup=runEffect(false,{current:stack},{current:section},{current:layers},{current:[sheen,sheen,sheen,sheen]},{current:background},viewport,class{observe(){} disconnect(){}},f=>{callbacks.set(++next,f);return next},id=>callbacks.delete(id),rawExpansionAt,layerExpansion)
flush()
assert.equal(translation,'translate(-2 32)')
assert.equal(sheen.style.transform,'translateX(0px)')
motion.matches=false;p=.6;events.get('scroll')();settle()
assert.equal(sheen.style.transform,'translateX(14px)')
stack.getBBox=()=>({x:12,y:218,width:380,height:100})
p=0;events.get('scroll')();settle()
assert.equal(translation,'translate(-2 -78)')
for (const [progress,active] of [[0,0],[.3,1],[.55,2],[.8,3],[1,3],[.3,1]]) {
 p=progress;events.get('scroll')();settle()
 assert.deepEqual(legend.map(item=>item.current),legend.map((_,index)=>index===active?'step':null))
}
desktopCleanup()
console.log('Desktop artwork centering and shared scroll reflection PASS')
