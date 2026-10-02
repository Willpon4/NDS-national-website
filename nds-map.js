(function(){
const CH=[
 {id:'purdue',name:'Purdue',city:'West Lafayette, IN',lat:40.4237,lon:-86.9212,hq:true,dx:-14,dy:0,anchor:'end'},
 {id:'alabama',name:'Alabama',city:'Tuscaloosa, AL',lat:33.2098,lon:-87.5692},
 {id:'gwu',name:'George Washington',city:'Washington, DC',lat:38.8997,lon:-77.0486,dx:14,dy:16,anchor:'start'},
 {id:'harvard',name:'Harvard',city:'Cambridge, MA',lat:42.3770,lon:-71.1167,dx:14,dy:-6,anchor:'start'},
 {id:'jmu',name:'James Madison',city:'Harrisonburg, VA',lat:38.4353,lon:-78.8690,dx:-14,dy:14,anchor:'end'},
 {id:'manhattan',name:'Manhattan',city:'Riverdale, NY',lat:40.8903,lon:-73.9014,dx:14,dy:8,anchor:'start'},
 {id:'miami',name:'Miami',city:'Coral Gables, FL',lat:25.7215,lon:-80.2793},
 {id:'vanderbilt',name:'Vanderbilt',city:'Nashville, TN',lat:36.1447,lon:-86.8027},
 {id:'wisconsin',name:'Wisconsin–Madison',city:'Madison, WI',lat:43.0766,lon:-89.4125},
 {id:'ncstate',name:'NC State',city:'Raleigh, NC',lat:35.7847,lon:-78.6821,dx:14,dy:12,anchor:'start'}
];
window.NDS_CHAPTERS=CH;
const INK='#0b1b23',SLATE='#9bb0b5',RED='#c1121f';
// State fills: steps between the brand ink (#0b1b23) and slate (#9bb0b5)
const CAMO=['#15272f','#1b2f38','#213741','#283f49','#2f4852','#36505a','#3d5963','#44616b'];
function loadScript(src,integrity){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.integrity=integrity;s.crossOrigin='anonymous';s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
function libs(){
 if(!window.__ndsLibs){
  window.__ndsLibs=(async()=>{
   if(!window.d3) await loadScript('https://unpkg.com/d3@7.9.0/dist/d3.min.js','sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i');
   if(!window.topojson) await loadScript('https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js','sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67');
   const topo=await (await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-10m.json')).json();
   const states=topojson.feature(topo,topo.objects.states).features.filter(f=>!['72','78','66','69','60'].includes(f.id));
   const nation=topojson.feature(topo,topo.objects.nation);
   return {nation,states};
  })();
 }
 return window.__ndsLibs;
}
const fmt=(v,p,n)=>Math.abs(v).toFixed(4)+(v<0?n:p);
class NdsMap extends HTMLElement{
 static get observedAttributes(){return ['selected','variant'];}
 connectedCallback(){this.style.display='block';this.style.width='100%';this.style.height='100%';this.render();}
 attributeChangedCallback(){if(this._ready)this.draw();}
 async render(){
  const W=+this.getAttribute('width')||1440,H=+this.getAttribute('height')||860;
  this.W=W;this.H=H;
  this.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" style="display:block" preserveAspectRatio="xMidYMid meet"></svg>`;
  try{const g=await libs();this.us=g.nation;this.states=g.states;}catch(e){this.innerHTML='<div style="font:12px monospace;color:#9bb0b5;padding:24px">map geometry unavailable</div>';return;}
  const pad=+this.getAttribute('pad')||40;
  this.proj=d3.geoAlbersUsa().fitExtent([[pad,pad],[W-pad,H-pad]],this.us);
  this.path=d3.geoPath(this.proj);
  this._ready=true;this.draw();
 }
 draw(){
  const svg=d3.select(this.querySelector('svg'));svg.selectAll('*').remove();
  const v=this.getAttribute('variant')||'network',sel=this.getAttribute('selected')||'',W=this.W,H=this.H,plot=v==='plot';
  const pts=CH.map(c=>({...c,xy:this.proj([c.lon,c.lat])})).filter(c=>c.xy);
  // graticule / grid
  if(plot){
   const g=svg.append('g');
   const step=60;
   for(let x=0;x<=W;x+=step)g.append('line').attr('x1',x).attr('x2',x).attr('y1',0).attr('y2',H).attr('stroke',SLATE).attr('stroke-opacity',.12);
   for(let y=0;y<=H;y+=step)g.append('line').attr('x1',0).attr('x2',W).attr('y1',y).attr('y2',y).attr('stroke',SLATE).attr('stroke-opacity',.12);
   for(let x=0;x<=W;x+=step)g.append('text').attr('x',x+3).attr('y',10).text(String(x/step).padStart(2,'0')).attr('fill',SLATE).attr('font-size',9).attr('font-family','Barlow, sans-serif').attr('opacity',.6);
   for(let y=step;y<=H;y+=step)g.append('text').attr('x',3).attr('y',y-3).text(String.fromCharCode(64+y/step)).attr('fill',SLATE).attr('font-size',9).attr('font-family','Barlow, sans-serif').attr('opacity',.6);
   svg.append('path').datum(d3.geoGraticule().step([5,5])()).attr('d',this.path).attr('fill','none').attr('stroke',SLATE).attr('stroke-opacity',.2).attr('stroke-width',.6);
  }else{
   svg.append('path').datum(d3.geoGraticule().step([10,10])()).attr('d',this.path).attr('fill','none').attr('stroke',SLATE).attr('stroke-opacity',.08);
  }
  const first=!this._drawn;this._drawn=true;
  const defs=svg.append('defs');
  defs.append('filter').attr('id','nds-soft').attr('x','-5%').attr('y','-5%').attr('width','110%').attr('height','110%').append('feGaussianBlur').attr('stdDeviation',.6);
  const sg=svg.append('g').attr('filter','url(#nds-soft)').selectAll('path').data(this.states).join('path').attr('d',this.path).attr('fill',d=>CAMO[(+d.id*7+3)%CAMO.length]).attr('fill-opacity',1).attr('stroke',d=>CAMO[(+d.id*7+3)%CAMO.length]).attr('stroke-width',1.2);
  svg.append('g').selectAll('path').data(this.states).join('path').attr('d',this.path).attr('fill','none').attr('stroke',SLATE).attr('stroke-opacity',.35).attr('stroke-width',.6);
  // hover highlight for the state under a pin
  const hl=svg.append('path').attr('fill',SLATE).attr('fill-opacity',0).attr('stroke','#fff').attr('stroke-opacity',0).attr('stroke-width',1).style('pointer-events','none').style('transition','fill-opacity .35s, stroke-opacity .35s');
  if(first&&!matchMedia('(prefers-reduced-motion: reduce)').matches)sg.attr('opacity',0).transition().delay((d,i)=>200+((+d.id*37)%50)*18).duration(700).attr('opacity',1);
  // network lines from HQ
  let ln=null;
  if(!plot){
   const hq=pts.find(p=>p.hq);
   ln=svg.append('g').selectAll('line').data(pts.filter(p=>!p.hq)).join('line')
    .attr('x1',hq.xy[0]).attr('y1',hq.xy[1]).attr('x2',d=>d.xy[0]).attr('y2',d=>d.xy[1])
    .attr('stroke',d=>d.id===sel?RED:'#fff').attr('stroke-opacity',d=>d.id===sel?.9:.35).attr('stroke-width',d=>d.id===sel?1.4:.8);
   if(first){ln.each(function(d){const L=Math.hypot(d.xy[0]-hq.xy[0],d.xy[1]-hq.xy[1]);d3.select(this).attr('stroke-dasharray',L).attr('stroke-dashoffset',L).transition().delay(1200+Math.random()*500).duration(1100).ease(d3.easeCubicOut).attr('stroke-dashoffset',0).on('end',function(){d3.select(this).attr('stroke-dasharray',null);});});}
   pts.filter(p=>!p.hq).forEach((d,i)=>{const c=svg.append('circle').attr('r',2.5).attr('fill',RED);c.append('animateMotion').attr('dur',(3.2+i%4*.6)+'s').attr('begin',(2.4+i*.35)+'s').attr('repeatCount','indefinite').attr('path',`M${hq.xy[0]},${hq.xy[1]}L${d.xy[0]},${d.xy[1]}`);c.attr('opacity',0).append('animate').attr('attributeName','opacity').attr('values','0;1;1;0').attr('dur',(3.2+i%4*.6)+'s').attr('begin',(2.4+i*.35)+'s').attr('repeatCount','indefinite');});
  }
  // pins
  const self=this;
  const stateOf=d=>this.states.find(f=>d3.geoContains(f,[d.lon,d.lat]));
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const g=svg.append('g').selectAll('g').data(pts).join('g').attr('transform',d=>`translate(${d.xy[0]},${d.xy[1]})`).style('cursor','pointer')
   .on('click',(e,d)=>{self.dispatchEvent(new CustomEvent('nds-select',{detail:d.id,bubbles:true,composed:true}));window.dispatchEvent(new CustomEvent('nds-select',{detail:d.id}));})
   .on('mouseenter',function(e,d){
    d3.select(this).raise();
    const m=this.querySelector('.nds-mk');if(m)m.style.transform='scale(1.7)';
    d3.select(this).selectAll('.nds-lbl').attr('fill','#fff').style('transform','translateX('+(d.anchor==='end'?-8:8)+'px)');
    const st=stateOf(d);if(st){hl.attr('d',self.path(st)).attr('fill-opacity',.28).attr('stroke-opacity',.6);}
    if(!reduce){const b=d3.select(this).insert('circle',':first-child').attr('r',8).attr('fill','none').attr('stroke',d.id===sel?RED:'#fff').attr('stroke-width',1.2).style('pointer-events','none');
     b.transition().duration(700).ease(d3.easeCubicOut).attr('r',34).attr('stroke-opacity',0).remove();}
    ln&&ln.filter(x=>x.id===d.id).attr('stroke',RED).attr('stroke-opacity',.9);
   })
   .on('mouseleave',function(e,d){
    const m=this.querySelector('.nds-mk');if(m)m.style.transform='';
    d3.select(this).selectAll('.nds-lbl').attr('fill',x=>x.id===sel?'#fff':SLATE).style('transform','');
    hl.attr('fill-opacity',0).attr('stroke-opacity',0);
    ln&&ln.filter(x=>x.id===d.id&&x.id!==sel).attr('stroke','#fff').attr('stroke-opacity',.35);
   });
  // generous invisible hit area so small pins are easy to hover and tap
  g.append('circle').attr('r',18).attr('fill','transparent');
  const mk=g.append('g').attr('class','nds-mk').style('transition','transform .3s cubic-bezier(.2,.7,.2,1.4)').style('transform-origin','0 0');
  if(plot){
   // slow ambient ping so the stations read as live
   if(!reduce)g.each(function(d,i){const r=d3.select(this).insert('circle',':first-child').attr('r',6).attr('fill','none').attr('stroke',d.id===sel?RED:SLATE).attr('stroke-width',1).style('pointer-events','none');
    r.append('animate').attr('attributeName','r').attr('values','6;22').attr('dur','3.2s').attr('begin',(i*.32)+'s').attr('repeatCount','indefinite');
    r.append('animate').attr('attributeName','stroke-opacity').attr('values','.7;0').attr('dur','3.2s').attr('begin',(i*.32)+'s').attr('repeatCount','indefinite');});
   mk.append('rect').attr('x',-6).attr('y',-6).attr('width',12).attr('height',12).attr('fill',d=>d.id===sel?RED:INK).attr('stroke',d=>d.id===sel?RED:SLATE).attr('stroke-width',1);
   mk.append('line').attr('x1',-12).attr('x2',-7).attr('stroke',SLATE);mk.append('line').attr('x1',7).attr('x2',12).attr('stroke',SLATE);
   mk.append('line').attr('y1',-12).attr('y2',-7).attr('stroke',SLATE);mk.append('line').attr('y1',7).attr('y2',12).attr('stroke',SLATE);
   const px=d=>d.anchor==='end'?-14:(d.anchor==='middle'?0:14),pa=d=>d.anchor||'start',py=d=>d.anchor==='middle'?(d.dy<0?-16:20):-6;
   g.append('text').attr('class','nds-lbl').style('transition','transform .3s cubic-bezier(.2,.7,.2,1)').attr('x',px).attr('y',py).attr('text-anchor',pa).text(d=>d.name.toUpperCase()).attr('fill',d=>d.id===sel?'#fff':SLATE).attr('font-size',10).attr('font-family','Barlow, sans-serif').attr('font-weight',600).attr('letter-spacing','.08em');
   g.append('text').attr('class','nds-lbl').style('transition','transform .3s cubic-bezier(.2,.7,.2,1)').attr('x',px).attr('y',d=>py(d)+12).attr('text-anchor',pa).text(d=>fmt(d.lat,'N','S')+'  '+fmt(d.lon,'E','W')).attr('fill',SLATE).attr('font-size',9).attr('font-family','Barlow, sans-serif').attr('opacity',.8);
  }else{
   g.each(function(d,i){const r=d3.select(this).append('circle').attr('r',6).attr('fill','none').attr('stroke',d.id===sel?RED:'#fff').attr('stroke-width',1);r.append('animate').attr('attributeName','r').attr('values','6;26').attr('dur','2.6s').attr('begin',(i*.26)+'s').attr('repeatCount','indefinite');r.append('animate').attr('attributeName','stroke-opacity').attr('values','.6;0').attr('dur','2.6s').attr('begin',(i*.26)+'s').attr('repeatCount','indefinite');});
   mk.append('circle').attr('r',d=>d.id===sel?16:(d.hq?11:9)).attr('fill','none').attr('stroke',d=>d.id===sel?RED:'#fff').attr('stroke-opacity',d=>d.id===sel?.8:.3);
   mk.append('circle').attr('r',d=>d.id===sel?6:(d.hq?5:4)).attr('fill',d=>d.id===sel?RED:'#fff');
   g.append('text').attr('x',d=>d.hq?0:(d.dx||0)).attr('y',d=>(d.dx!=null&&!d.hq)?(d.dy||0)+4:(d.id===sel?-24:-19)).attr('text-anchor',d=>d.hq?'middle':(d.anchor||'middle')).text(d=>d.name).attr('fill','#fff').attr('opacity',d=>(sel&&d.id!==sel)?.55:1).attr('font-size',d=>d.id===sel?15:12).attr('font-family','Barlow, sans-serif').attr('font-weight',500);
  }
 }
}
if(!customElements.get('nds-map'))customElements.define('nds-map',NdsMap);
})();
