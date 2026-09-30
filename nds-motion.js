(function(){
const E='cubic-bezier(.2,.7,.2,1)';
const up=[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'none'}];
function countUp(el){const orig=el.textContent;const m=orig.match(/^(\d+)(.*)$/);if(!m)return;const end=+m[1],suf=m[2],t0=performance.now(),d=1400;
 const step=t=>{const p=Math.min(1,(t-t0)/d),e=1-Math.pow(1-p,3);el.textContent=Math.round(end*e)+suf;if(p<1)requestAnimationFrame(step);else el.textContent=orig;};requestAnimationFrame(step);}
function flows(scope){scope.querySelectorAll('[data-flow]').forEach(el=>{if(el.__f)return;el.__f=1;const dly=+el.getAttribute('data-flow')||0;
 el.animate([{left:'0%',opacity:0},{opacity:1,offset:.08},{opacity:1,offset:.92},{left:'100%',opacity:0}],{duration:+(el.getAttribute('data-dur')||4200),delay:dly,iterations:Infinity,easing:'cubic-bezier(.45,0,.55,1)'});});}
function init(root){
 if(root.__m)return;root.__m=1;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const secs=[...root.children].filter(c=>c.tagName!=='FOOTER');
 const h1=root.querySelector('h1');const hero=(h1&&secs.find(s=>s.contains(h1)))||secs[1];
 const bar=document.createElement('div');Object.assign(bar.style,{position:'fixed',left:0,top:0,height:'2px',width:'100%',background:'#c1121f',transformOrigin:'0 50%',transform:'scaleX(0)',zIndex:9999,pointerEvents:'none'});document.body.appendChild(bar);
 const prog=()=>{const d=document.documentElement,m=(d.scrollHeight-innerHeight)||1;bar.style.transform=`scaleX(${Math.min(1,scrollY/m)})`;};addEventListener('scroll',prog,{passive:true});prog();
 root.querySelectorAll('h1').forEach(h=>{if(h.__w)return;h.__w=1;const words=h.textContent.trim().split(/\s+/);h.textContent='';words.forEach((w,i)=>{const o=document.createElement('span');o.style.cssText='display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.06em';const s=document.createElement('span');s.style.display='inline-block';s.textContent=w;o.appendChild(s);h.appendChild(o);if(i<words.length-1)h.appendChild(document.createTextNode(' '));s.animate([{transform:'translateY(105%)'},{transform:'none'}],{duration:900,delay:250+i*90,easing:E,fill:'backwards'});});});
 [...root.querySelectorAll('div')].filter(d=>d.style.width==='14px'&&d.style.height==='14px'&&d.style.position==='absolute').forEach((c,i)=>c.animate([{opacity:0,transform:'scale(2.2)'},{opacity:1,transform:'none'}],{duration:700,delay:100+i*80,easing:E,fill:'backwards'}));
 root.querySelectorAll('figure').forEach(f=>{const im=f.querySelector('img');if(!im)return;f.__anims=[f.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:1100,easing:E,fill:'backwards'}),im.animate([{transform:'scale(1.15)'},{transform:'scale(1)'}],{duration:1800,easing:E,fill:'backwards'})];f.__anims.forEach(a=>a.pause());im.style.transition='transform 1.2s cubic-bezier(.2,.7,.2,1)';f.addEventListener('mouseenter',()=>im.style.transform='scale(1.05)');f.addEventListener('mouseleave',()=>im.style.transform='');});
 const CH='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#';
 const scramble=el=>{if(el.__s)return;el.__s=1;const fin=el.textContent;let f=0;const tot=fin.length*1.6+10;const tick=()=>{f++;el.textContent=fin.split('').map((c,i)=>c===' '||c==='/'||c==='·'?c:(f>i*1.6+8?c:CH[(Math.random()*CH.length)|0])).join('');if(f<tot)requestAnimationFrame(tick);else el.textContent=fin;};tick();};
 root.animate([{opacity:0},{opacity:1}],{duration:500,easing:E});
 root.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.metaKey||e.ctrlKey)return;const h=a.getAttribute('href')||'';if(!h.startsWith('/')||h.startsWith('//')||h.startsWith('/#')||a.target)return;e.preventDefault();root.animate([{opacity:1},{opacity:0,transform:'translateY(-8px)'}],{duration:280,easing:'ease-in',fill:'forwards'}).onfinish=()=>location.href=h;});
 root.querySelectorAll('div[style*="transform:rotate(45deg)"]').forEach((d,i)=>d.animate([{transform:'rotate(45deg) scale(1)',boxShadow:'0 0 0 0 rgba(193,18,31,0)'},{transform:'rotate(45deg) scale(1.35)',boxShadow:'0 0 0 8px rgba(193,18,31,.25)',offset:.12},{transform:'rotate(45deg) scale(1)',boxShadow:'0 0 0 14px rgba(193,18,31,0)',offset:.3},{transform:'rotate(45deg) scale(1)'}],{duration:4200,delay:i*1050,iterations:Infinity,easing:'ease-out'}));
 [...root.querySelectorAll('div')].filter(d=>d.style.padding==='32px 40px 36px').forEach(c=>{c.style.position='relative';c.style.transition='background .35s';const tl=document.createElement('div');Object.assign(tl.style,{position:'absolute',left:0,right:0,top:0,height:'2px',background:'#c1121f',transform:'scaleX(0)',transformOrigin:'0 50%',transition:'transform .45s cubic-bezier(.2,.7,.2,1)',pointerEvents:'none'});c.appendChild(tl);c.addEventListener('mouseenter',()=>{c.style.background='rgba(155,176,181,.06)';tl.style.transform='scaleX(1)';});c.addEventListener('mouseleave',()=>{c.style.background='';tl.style.transform='scaleX(0)';});});
 if(hero){
  const sp=document.createElement('div');Object.assign(sp.style,{position:'absolute',inset:0,pointerEvents:'none',opacity:0,transition:'opacity .5s',background:'radial-gradient(420px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.07),transparent 70%)'});hero.appendChild(sp);
  hero.addEventListener('mousemove',e=>{const r=hero.getBoundingClientRect(),z=r.width/hero.offsetWidth||1;sp.style.setProperty('--mx',(e.clientX-r.left)/z+'px');sp.style.setProperty('--my',(e.clientY-r.top)/z+'px');sp.style.opacity=1;});
  hero.addEventListener('mouseleave',()=>sp.style.opacity=0);
  const hh=hero.querySelector('h1');if(hh){addEventListener('scroll',()=>{const y=Math.min(400,scrollY);hh.style.transform=`translateY(${y*.18}px)`;hh.style.opacity=String(1-y/700);},{passive:true});}
 }
 root.querySelectorAll('a').forEach(a=>{
  const cs=getComputedStyle(a);if(cs.backgroundColor==='rgb(193, 18, 31)'||/rgba\(255, 255, 255/.test(cs.borderTopColor)&&cs.borderTopStyle==='solid'){a.style.transition='transform .25s cubic-bezier(.2,.7,.2,1)';
   a.addEventListener('mousemove',e=>{const r=a.getBoundingClientRect();a.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.3}px)`;});
   a.addEventListener('mouseleave',()=>a.style.transform='');}
  if(a.parentElement&&a.parentElement.tagName==='NAV'&&!a.style.borderBottomStyle){a.style.position='relative';const u=document.createElement('span');Object.assign(u.style,{position:'absolute',left:0,right:0,bottom:'-5px',height:'1px',background:'#c1121f',transform:'scaleX(0)',transformOrigin:'0 50%',transition:'transform .35s cubic-bezier(.2,.7,.2,1)'});a.appendChild(u);a.addEventListener('mouseenter',()=>u.style.transform='scaleX(1)');a.addEventListener('mouseleave',()=>u.style.transform='scaleX(0)');}
 });
 if(hero){
  [...hero.children].filter(c=>c.style.position!=='absolute'&&c.tagName!=='H1'&&!c.querySelector('h1')).forEach((c,i)=>c.animate(up,{duration:1000,delay:150+i*160,easing:E,fill:'backwards'}));
  hero.animate([{backgroundPosition:'0 0'},{backgroundPosition:'60px 60px'}],{duration:30000,iterations:Infinity});
  const s=document.createElement('div');Object.assign(s.style,{position:'absolute',left:0,right:0,top:0,height:'1px',background:'linear-gradient(90deg,transparent,rgba(193,18,31,.55) 50%,transparent)',pointerEvents:'none'});
  hero.appendChild(s);s.animate([{top:'0%',opacity:0},{opacity:1,offset:.15},{opacity:1,offset:.85},{top:'100%',opacity:0}],{duration:7000,iterations:Infinity,easing:'linear'});
 }
 flows(root);
 const pending=new Set();
 const fire=t=>{if(!pending.has(t))return;pending.delete(t);(t.__anims||[]).forEach(a=>a.play());const hs=t.children[0]&&t.children[0].querySelector('span');if(hs&&!hs.children.length)scramble(hs);t.querySelectorAll('[data-count]').forEach(countUp);};
 const check=()=>{const vh=window.innerHeight||document.documentElement.clientHeight;pending.forEach(t=>{if(t.getBoundingClientRect().top<vh*0.9)fire(t);});if(!pending.size){window.removeEventListener('scroll',check,true);window.removeEventListener('resize',check);}};
 const io={observe:t=>pending.add(t)};
 secs.slice(2).forEach(t=>{
  let cells;
  if(getComputedStyle(t).display==='grid')cells=[...t.children];
  else{const g=[...t.querySelectorAll('div')].find(d=>getComputedStyle(d).display==='grid');cells=g?(g.parentElement===t?[...t.children].slice(1):[...g.children]):[...t.children].slice(1);}
  const head=t.children[0];
  const anims=[];
  if(head&&!cells.includes(head)){anims.push(head.animate([{opacity:0},{opacity:1}],{duration:700,easing:E,fill:'backwards'}));
   const ln=document.createElement('div');Object.assign(ln.style,{position:'absolute',left:0,right:0,height:'1px',background:'#c1121f',transformOrigin:'0 50%',pointerEvents:'none',opacity:.8});if(getComputedStyle(t).position==='static')t.style.position='relative';ln.style.top=(head.offsetHeight-1)+'px';t.appendChild(ln);anims.push(ln.animate([{transform:'scaleX(0)',opacity:.9},{transform:'scaleX(1)',opacity:.9,offset:.6},{transform:'scaleX(1)',opacity:0}],{duration:1600,easing:E,fill:'forwards'}));}
  cells.slice(0,16).forEach((c,i)=>anims.push(c.animate(up,{duration:800,delay:80+i*90,easing:E,fill:'backwards'})));
  anims.forEach(a=>a.pause());t.__anims=anims;io.observe(t);
 });
 root.querySelectorAll('figure').forEach(f=>{if(f.__anims)io.observe(f);});
 window.addEventListener('scroll',check,{passive:true,capture:true});window.addEventListener('resize',check);
 setInterval(check,400);check();
 setTimeout(()=>{[...pending].forEach(t=>{if(t.getBoundingClientRect().top<(window.innerHeight||0)*1.5)fire(t);});},2500);
}
function findRoot(){const r=document.querySelector('[data-screen-label]');if(r)return r;const h=document.querySelector('h1');if(!h)return null;let n=h;while(n&&n.parentElement){if(n.style&&n.style.width==='1440px'&&n.children.length>2&&[...n.children].some(c=>c.tagName==='FOOTER'))return n;n=n.parentElement;}return null;}
function wait(){const r=findRoot();if(r&&r.children.length>2)setTimeout(()=>init(r),250);else setTimeout(wait,120);}
wait();
})();
