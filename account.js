import {createClient} from '@supabase/supabase-js';
const cfg=window.CELESTIAL_CONFIG||{}, $=id=>document.getElementById(id);
let client,user=null,ready=false,timer,pending=null,revision=0,inFlight=null,epoch=0;
const status=t=>{$('accountStatus').textContent=t;};
const guest=()=>{try{return {data:JSON.parse(localStorage.getItem('celestialRangerSave')||'{}'),notes:JSON.parse(localStorage.getItem('rangerNotes')||'{}')}}catch{return {data:{},notes:{}}}};
function screen(){window.RangerBridge.show('account');render();}
function render(){
 $('authForm').hidden=!!user;$('profileCard').hidden=!user;$('accountEmail').textContent=user?.email||'';
 const s=window.RangerBridge.snapshot();$('accountName').textContent=s.rangerName||user?.user_metadata?.name||'Ranger';
 $('accountSummary').textContent=`${Object.values(s.stamped||{}).filter(Boolean).length} stamps · ${s.ecoPoints||0} eco points · ${Object.values(s.triviaAnswered||{}).filter(Boolean).length} completed challenges`;
 const out=$('accountNotes');out.replaceChildren();for(const [location,note] of Object.entries(window.RangerBridge.notes())){if(!note)continue;const p=document.createElement('p');p.textContent=location+': '+note;out.append(p);}
}
async function flush(){
 clearTimeout(timer);if(inFlight)await inFlight;if(!pending||!user||!ready)return;
 const job=pending;pending=null;const who=user.id,version=revision,gen=epoch;
 inFlight=(async()=>{const {data,error}=await client.rpc('save_ranger',{payload:job.data,note_data:job.notes,expected_revision:version});if(gen!==epoch)return;if(error){pending=pending||job;status(error.message.includes('conflict')?'Another device changed your progress. Reload before editing further. Your unsynced changes remain here.':'Sync failed. Keep this tab open and tap Retry sync.');ready=false;document.querySelectorAll('.screen:not(#screen-account),#bottomNav').forEach(x=>x.inert=true);screen();return;}revision=data;document.querySelectorAll('.screen,#bottomNav').forEach(x=>x.inert=false);status('All progress saved ✨');render();})();
 try{await inFlight;}finally{inFlight=null;}if(pending&&ready)timer=setTimeout(flush,700);
}
async function hydrate(session){
 const gen=++epoch;ready=false;user=session?.user||null;pending=null;document.body.inert=true;
 try{
 if(!user){window.RangerBridge.restore(guest().data,guest().notes);status('Guest adventure · saved on this device');return;}
 const {data,error}=await client.from('ranger_progress').select('data,notes,revision').eq('user_id',user.id).maybeSingle();if(error)throw error;if(gen!==epoch)return;
 revision=data?.revision||0;
 const initial=data||{data:{rangerName:user.user_metadata?.name||'Ranger'},notes:{}};
 window.RangerBridge.restore(initial.data,initial.notes);ready=true;status('Account ready · progress sync enabled');if(!data){window.RangerAccount.save(window.RangerBridge.snapshot(),{});await flush();}
 }catch{status('Could not load your account. Reload to retry. Progress editing is paused.');screen();}
 finally{document.body.inert=false;render();if(user&&!ready){document.querySelectorAll('.screen:not(#screen-account),#bottomNav').forEach(x=>x.inert=true);}else document.querySelectorAll('.screen,#bottomNav').forEach(x=>x.inert=false);}
}
async function init(){
 document.querySelector('main').insertAdjacentHTML('beforeend',`<section class="screen" id="screen-account"><div class="eyebrow">Your constellation, everywhere</div><h2>Ranger Account</h2><p id="accountStatus" class="notice" role="status"></p><form id="authForm" class="card"><label for="authName">Ranger name</label><input id="authName" class="name-field" maxlength="60" autocomplete="name"><label for="authEmail">Email</label><input id="authEmail" class="name-field" type="email" required autocomplete="email"><label for="authPassword">Password</label><input id="authPassword" class="name-field" type="password" minlength="12" maxlength="128" autocomplete="current-password"><div class="voice-row"><button class="btn btn-primary" type="submit">Log in</button><button class="btn btn-ghost" type="button" id="signup">Create account</button><button class="btn btn-ghost" type="button" id="forgot">Forgot password</button><button class="btn btn-ghost" type="button" id="guest">Continue as guest</button></div></form><div id="profileCard" class="card" hidden><h3 id="accountName"></h3><p id="accountEmail"></p><p id="accountSummary"></p><h3>Field notes</h3><div id="accountNotes"></div><div class="voice-row"><button class="btn btn-ghost" id="importGuest">Import guest adventure</button><button class="btn btn-ghost" id="retrySync">Retry sync</button><button class="btn btn-ghost" id="logout">Log out</button></div><p class="sub">Import replaces account progress with the guest adventure on this device.</p></div><form id="recoveryForm" class="card" hidden><label for="newPassword">New password (12+ characters)</label><input id="newPassword" class="name-field" type="password" minlength="12" maxlength="128" required autocomplete="new-password"><button class="btn btn-primary">Save password</button></form><button class="btn btn-ghost" id="accountBack">Back to adventure</button></section>`);
 const tile=document.createElement('button');tile.className='more-tile';tile.textContent='✦ Account';tile.onclick=screen;document.querySelector('.more-grid').prepend(tile);
 const entry=document.createElement('button');entry.className='btn btn-ghost';entry.textContent='Sign in / Account';entry.onclick=screen;$('screen-onboard').prepend(entry);
 $('accountBack').onclick=()=>{if(user&&!ready)return;window.RangerBridge.show(window.RangerBridge.snapshot().oathTaken?'map':'onboard');};
 $('guest').onclick=()=>window.RangerBridge.show('onboard');
 if(!cfg.url||!cfg.key){status('Account services are not configured yet. Guest mode is available.');$('authForm').querySelectorAll('button:not(#guest)').forEach(b=>b.disabled=true);return;}
 client=createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
 const run=async(fn)=>{try{status('Connecting…');await fn();}catch(e){status(e.message||'Please try again.');}};
 const credentials=()=>({email:$('authEmail').value.trim(),password:$('authPassword').value});
 const check=result=>{if(result.error)throw result.error;return result.data;};
 $('authForm').onsubmit=e=>{e.preventDefault();run(async()=>{check(await client.auth.signInWithPassword(credentials()));});};
 $('signup').onclick=()=>run(async()=>{const c=credentials(),name=$('authName').value.trim();if(!name||c.password.length<12||!$('authEmail').checkValidity())throw Error('Enter a name, valid email, and password of at least 12 characters.');check(await client.auth.signUp({...c,options:{data:{name},emailRedirectTo:location.origin+'/'}}));status('Check your email to confirm your account, then log in.');});
 $('forgot').onclick=()=>run(async()=>{if(!$('authEmail').checkValidity())throw Error('Enter your email first.');check(await client.auth.resetPasswordForEmail(credentials().email,{redirectTo:location.origin+'/?recovery=1'}));status('If an account exists, a reset link has been sent.');});
 $('recoveryForm').onsubmit=e=>{e.preventDefault();run(async()=>{check(await client.auth.updateUser({password:$('newPassword').value}));$('newPassword').value='';$('recoveryForm').hidden=true;history.replaceState(null,'','/');status('Password updated.');});};
 $('logout').onclick=()=>run(async()=>{await flush();if(pending)throw Error('Progress is unsaved. Retry sync before logging out.');check(await client.auth.signOut());});
 $('retrySync').onclick=()=>run(async()=>{if(pending){const {data,error}=await client.from('ranger_progress').select('revision').eq('user_id',user.id).maybeSingle();if(error)throw error;if((data?.revision||0)!==revision)throw Error('Conflict: reload to load the newer cloud adventure. Copy unsaved notes before reloading.');ready=true;await flush();}else await hydrate((await client.auth.getSession()).data.session);});
 $('importGuest').onclick=()=>run(async()=>{if(!ready)throw Error('Wait for your account to load.');if(!confirm('Replace your account adventure with this device’s guest progress?'))return;const g=guest();window.RangerBridge.restore(g.data,g.notes);window.RangerAccount.save(g.data,g.notes);await flush();screen();});
 client.auth.onAuthStateChange((event,session)=>{if(event==='TOKEN_REFRESHED')return;setTimeout(async()=>{await flush();await hydrate(session);if(event==='PASSWORD_RECOVERY'||(session&&new URLSearchParams(location.search).has('recovery'))){screen();$('recoveryForm').hidden=false;}},0);});
 window.RangerAccount={get signedIn(){return !!user;},save(data,notes){if(!ready){status('Sync paused. Reload or retry before continuing.');return;}pending={data,notes};status('Saving progress…');clearTimeout(timer);timer=setTimeout(flush,700);},async chat(character,messages){if(!ready)throw Error('Account unavailable');await flush();const {data}=await client.auth.getSession();const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token},body:JSON.stringify({character,messages}),signal:AbortSignal.timeout(25000)});const result=await response.json();if(!response.ok)throw Error(result.error);return result.text;},async reset(){window.RangerBridge.restore({rangerName:user.user_metadata?.name||'Ranger'},{});this.save(window.RangerBridge.snapshot(),{});await flush();}};
 window.addEventListener('beforeunload',e=>{if(pending||inFlight){e.preventDefault();e.returnValue='';}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();});
}
if(window.RangerBridge)init();else window.addEventListener('ranger-ready',init,{once:true});
