import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import {wrapIndex,carouselOffset} from '../src/carouselPosition.ts';
const modes=Array.from({length:12},(_,i)=>({id:'mode'+i,title:'MODE '+i,tag:'Description '+i,image:'art'+i}));
function mount(initial='mode0') {
 class Element {
  constructor(){this.children=[];this.dataset={};this.attributes={};this.style={setProperty(){}};this.classList={toggle(){},remove(){}};}
  append(...elements){this.children.push(...elements)}
  setAttribute(key,value){this.attributes[key]=value}
  focus(){} click(){this.onclick?.()}
 }
 const parts=Object.fromEntries(['.mode-carousel-title','.mode-carousel-viewport','.mode-carousel-description','.mode-carousel-pips','.mode-carousel-count','[data-confirm]','[data-back]','[data-pad-button="4"]','[data-pad-button="5"]'].map(k=>[k,new Element()]));
 const selected=[];
 const exports={};
 runInNewContext(ts.transpile(readFileSync(new URL('../src/modeCarousel.ts',import.meta.url),'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}),{exports,require:name=>name.includes('carouselPosition')?{wrapIndex,carouselOffset}:name.includes('matchAudio')?{audio:{menu(){}}}:{},document:{createElement:()=>new Element()},performance:{now:()=>1000}});
 const nav=exports.mountModeCarousel({querySelector:key=>parts[key]},modes,initial,id=>selected.push(id));
 return {nav,parts,selected};
}
test('circular layout keeps focus centered and five unique cards visible at every position',()=>{
 for(let selected=0;selected<12;selected++){
  const offsets=modes.map((_,i)=>carouselOffset(i,selected,12));
  assert.equal(offsets[selected],0);assert.equal(new Set(offsets).size,12);
  assert.deepEqual(offsets.filter(n=>Math.abs(n)<=2).sort((a,b)=>a-b),[-2,-1,0,1,2]);
 }
 assert.equal(wrapIndex(-1,12),11);assert.equal(wrapIndex(14,12),2);
});
test('rapid movement and reversal confirm logical selection immediately, with no animation wait',()=>{
 const {nav,selected,parts}=mount();
 nav.move('l');nav.confirm();assert.equal(selected.pop(),'mode11');
 nav.move('r');nav.move('r');nav.move('r');nav.move('l');nav.confirm();assert.equal(selected.pop(),'mode1');
 nav.move('u');nav.move('d');nav.confirm();assert.equal(selected.pop(),'mode1');
 assert.equal(parts['.mode-carousel-description'].textContent,'Description 1');
});
test('shoulder jumps wrap and restoration starts on the requested mode',()=>{
 const {nav,parts,selected}=mount('mode11');
 assert.equal(parts['.mode-carousel-count'].textContent,'12 / 12');
 parts['[data-pad-button="5"]'].click();nav.confirm();assert.equal(selected.pop(),'mode2');
 parts['[data-pad-button="4"]'].click();nav.confirm();assert.equal(selected.pop(),'mode11');
});
test('neighbor clicks focus, center click confirms, pips reach all twelve modes',()=>{
 const {nav,parts,selected}=mount();const cards=parts['.mode-carousel-viewport'].children;
 cards[1].click();assert.equal(selected.length,0);cards[1].click();assert.equal(selected.pop(),'mode1');
 parts['.mode-carousel-pips'].children.forEach((pip,i)=>{pip.click();nav.confirm();assert.equal(selected.pop(),'mode'+i)});
});
test('swiping browses without also confirming the synthetic tap',()=>{
 const {parts,selected}=mount();const viewport=parts['.mode-carousel-viewport'];
 viewport.onpointerdown({pointerType:'touch',pointerId:1,clientX:200,clientY:100});
 viewport.onpointerup({pointerId:1,clientX:100,clientY:100});
 assert.equal(parts['.mode-carousel-count'].textContent,'02 / 12');
 viewport.children[1].click();assert.equal(selected.length,0);
});
