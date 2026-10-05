import test from 'node:test';import assert from 'node:assert/strict';import {JSDOM,VirtualConsole} from 'jsdom';import {readFile} from 'node:fs/promises';
test('preserved adventure initializes with account and guest story chat',async()=>{
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(e.type==='unhandled-exception')errors.push(e.message);});
 const dom=new JSDOM(await readFile(new URL('../index.html',import.meta.url),'utf8'),{url:'https://ranger.example',runScripts:'dangerously',virtualConsole:vc,pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});w.ResizeObserver=class{observe(){} disconnect(){}};}});
 const w=dom.window;await new Promise(r=>setTimeout(r,100));
 assert.ok(w.RangerBridge,'adventure bridge initialized: '+JSON.stringify(errors));
 w.eval(await readFile(new URL('../public/account.js',import.meta.url),'utf8'));
 assert.match(w.document.getElementById('accountStatus').textContent,/not configured/);
 w.RangerBridge.restore({rangerName:'Test Ranger',mode:'college',oathTaken:true,visitedOrder:['berk'],stamped:{berk:true},triviaAnswered:{berk:true},ecoPoints:20,interests:[],plannedOrder:[]},{berk:'A lovely flower'});
 for(const screen of ['map','passport','food','eco','plushie','recap','chat','more']){w.RangerBridge.show(screen);assert.ok(w.document.getElementById('screen-'+screen).classList.contains('visible'));}
 w.RangerBridge.show('chat');w.document.getElementById('chatInput').value='How many stamps?';w.document.getElementById('chatForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,10));assert.match(w.document.getElementById('chatLog').textContent,/1 of 5 stamps/);
 assert.deepEqual(errors,[]);w.close();
});
