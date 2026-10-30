import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const events={};const context=vm.createContext({window:{addEventListener(){}},document:{addEventListener:(n,f)=>events[n]=f,body:{}},navigator:{},matchMedia:()=>({matches:false}),innerWidth:400,getComputedStyle:()=>({overflowX:'auto'})});
vm.runInContext(readFileSync(new URL('../src/mobile-shell.js',import.meta.url),'utf8'),context);
function gesture(x,y,x2,y2,extra={}){let prevented=false;events.touchstart({touches:[{clientX:x,clientY:y}],target:{parentElement:null,...extra}});events.touchmove({touches:[{clientX:x2,clientY:y2}],cancelable:true,preventDefault:()=>prevented=true});return prevented}
assert(gesture(2,50,80,55),'Left-edge horizontal gesture');assert(gesture(398,50,320,55),'Right-edge horizontal gesture');assert(!gesture(2,50,5,120),'Preserve vertical scroll');assert(!gesture(100,50,200,55),'Preserve center instrument gestures');assert(!gesture(398,50,320,55,{scrollWidth:1000,clientWidth:400,scrollLeft:0}),'Preserve horizontal piano scroll');events.touchcancel();assert.doesNotThrow(()=>events.touchmove({touches:[]}));
const manifest=JSON.parse(readFileSync(new URL('../src/manifest.webmanifest',import.meta.url)));assert.equal(manifest.display,'standalone');assert.equal(manifest.scope,'/');assert.equal(manifest.start_url,'/plataforma.html');console.log('6 mobile gesture checks and standalone manifest passed.');
