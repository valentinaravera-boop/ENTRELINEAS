const SVGNS = 'http://www.w3.org/2000/svg';
const pages = ['page-cover','page-1','page-2','page-3','page-4','page-5','page-final'];
let currentPage = 0;
const track = document.getElementById('pages-track');

function buildDots(){
  const c = document.getElementById('page-counter'); c.innerHTML='';
  pages.forEach((p,i)=>{ const d=document.createElement('div'); d.className='dot'+(i===0?' active':''); d.onclick=()=>goToPage(i); c.appendChild(d); });
}
function updateDots(){ document.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active', i===currentPage)); }

function goToPage(idx){
  if(idx<0||idx>=pages.length) return;
  currentPage = idx;
  track.classList.add('flipping');
  setTimeout(()=>track.classList.remove('flipping'), 850);
  track.style.transform = `translateX(-${idx*window.innerWidth}px)`;
  document.getElementById('nav-prev').classList.toggle('hidden', idx===0);
  document.getElementById('nav-next').classList.toggle('hidden', idx===pages.length-1);
  updateDots(); onPageEnter(idx);
}
function goNext(){ goToPage(currentPage+1); }
function goPrev(){ goToPage(currentPage-1); }

const initialized={};
function onPageEnter(idx){
  const pid=pages[idx];
  if(pid==='page-1' && !initialized[pid]){ initialized[pid]=true; initRoute(); }
  if(pid==='page-2' && !initialized[pid]){ initialized[pid]=true; initSprayMap(); }
  if(pid==='page-3' && !initialized[pid]){ initialized[pid]=true; initGraffiti(); }
  if(pid==='page-4' && !initialized[pid]){ initialized[pid]=true; initZines(); }
  if(pid==='page-5' && !initialized[pid]){ initialized[pid]=true; initTimeGrid(); }
  if(pid==='page-final' && !initialized[pid]){ initialized[pid]=true; initGrowth(); }
}

document.addEventListener('keydown',e=>{ if(e.key==='ArrowRight') goNext(); if(e.key==='ArrowLeft') goPrev(); });
let tsX=0, tsY=0;
document.addEventListener('touchstart',e=>{ tsX=e.touches[0].clientX; tsY=e.touches[0].clientY; });
document.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-tsX;
  const dy=e.changedTouches[0].clientY-tsY;
  // only treat as a page swipe if the gesture is clearly horizontal,
  // so vertical scrolling inside a panel never flips the page
  if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.5){ dx<0?goNext():goPrev(); }
});
window.addEventListener('resize',()=>{ track.style.transition='none'; track.style.transform=`translateX(-${currentPage*window.innerWidth}px)`; setTimeout(()=>track.style.transition='',50); });

// ============================================================
// PAGE 1 — route line traced with marker
// ============================================================
function initRoute(){
  const path=document.getElementById('route-trace');
  if(path){ path.style.transition='stroke-dashoffset 2.4s ease'; setTimeout(()=>path.style.strokeDashoffset='0',300); }
  document.querySelectorAll('#page-1 .ride-bus').forEach(b=>{
    b.animate([{transform:'translateX(0)'},{transform:'translateX(calc(100vw))'}],{duration:6000,delay:600,easing:'cubic-bezier(.3,.5,.5,.95)',fill:'forwards'});
  });
}

// ============================================================
// PAGE 2 — HEATMAP AS SPRAY PAINT ON A HAND-DRAWN MAP
// ============================================================
function initSprayMap(){
  const svg=document.getElementById('map-svg');
  const tip=document.getElementById('spray-tip');

  // defs: spray texture (fuzzy edge) + roughen for the drawn map
  const defs=document.createElementNS(SVGNS,'defs');
  defs.innerHTML=`
    <filter id="spray" x="-40%" y="-40%" width="180%" height="180%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="14"/>
      <feGaussianBlur stdDeviation="1.4"/>
    </filter>
    <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="5"/></filter>
    <filter id="grainy"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="g"/><feColorMatrix in="g" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer><feComposite operator="in" in2="SourceGraphic"/></filter>`;
  svg.appendChild(defs);

  // hand-drawn map base: blocks + a sketchy river/avenue
  const base=document.createElementNS(SVGNS,'g');
  base.setAttribute('filter','url(#rough)');
  base.innerHTML=`
    
    ${gridBlocks()}
    <path d="M250 30 C 235 130, 268 220, 248 300 C 232 380, 270 470, 252 590" fill="none" stroke="rgba(245,238,218,0.22)" stroke-width="4" stroke-dasharray="2 12" stroke-linecap="round"/>
    <text x="270" y="600" font-family="Bebas Neue" font-size="13" fill="rgba(245,238,218,0.3)" transform="rotate(-4 270 600)">av. 107 →</text>
  `;
  svg.appendChild(base);

  const stops=[
    {x:250,y:90,  r:65, n:'Ciudad Universitaria', detail:'Cabecera Norte · inicio de recorrido', writers:130, fanzine:'dibujos',   theme:'estudios',  peak:'mañana 8–10h',   col:'#1d3df0'},
    {x:250,y:240, r:48, n:'Belgrano',             detail:'Blanco Encalada y Cabildo',           writers:120, fanzine:'historias',  theme:'amistad',   peak:'mediodía 13–15h', col:'#1fdb3a'},
    {x:250,y:385, r:26, n:'Villa Urquiza',         detail:'Estación',                            writers:50,  fanzine:'anécdotas', theme:'trabajo',   peak:'tarde 18–21h',   col:'#f0379a'},
    {x:256,y:530, r:16, n:'Parque Avellaneda',    detail:'Eva Perón y Olivera · fin de recorrido', writers:25, fanzine:'dibujos',  theme:'familia',   peak:'tarde 18–20h',   col:'#1d3df0'},
  ];

  stops.forEach((s,i)=>{
    s.displayRadius = s.r;
    setTimeout(()=>sprayStop(svg,s,i,tip),350+i*450);
  });
}

function gridBlocks(){
  let r=''; const rng=(a,b)=>a+Math.random()*(b-a);
  for(let y=20;y<600;y+=70){
    for(let x=20;x<480;x+=80){
      if(Math.abs(x+30-250)<70) continue; // leave avenue clear
      r+=`<rect x="${x}" y="${y}" width="${rng(46,62)}" height="${rng(40,54)}" fill="none" stroke="rgba(245,238,218,0.10)" stroke-width="1.4"/>`;
    }
  }
  return r;
}

function sprayStop(svg,s,i,tip){
  const g=document.createElementNS(SVGNS,'g');
  g.style.cursor='pointer';

  const baseRadius = s.displayRadius || s.r;

  // multiple overlapping spray dabs = aerosol layering
  const dab=document.createElementNS(SVGNS,'g');
  dab.setAttribute('filter','url(#spray)');
  for(let k=0;k<3;k++){
    const c=document.createElementNS(SVGNS,'circle');
    c.setAttribute('cx', s.x+(Math.random()-0.5)*8);
    c.setAttribute('cy', s.y+(Math.random()-0.5)*8);
    c.setAttribute('r', baseRadius * (0.85 + k * 0.12));
    c.setAttribute('fill', s.col);
    c.setAttribute('opacity', 0.20 + k * 0.08);
    dab.appendChild(c);
  }
  // overspray speckle
  const speck=document.createElementNS(SVGNS,'circle');
  speck.setAttribute('cx',s.x);speck.setAttribute('cy',s.y);speck.setAttribute('r',baseRadius * 1.08);
  speck.setAttribute('fill',s.col);speck.setAttribute('opacity','0.45');speck.setAttribute('filter','url(#grainy)');
  g.appendChild(speck);
  g.appendChild(dab);

  // writers count — inside the blob, una sola vez
  const t1=document.createElementNS(SVGNS,'text');
  t1.setAttribute('x',s.x);t1.setAttribute('y',s.y+4);t1.setAttribute('text-anchor','middle');
  t1.setAttribute('font-family','Bebas Neue');
  t1.setAttribute('font-size', Math.max(11, baseRadius*0.28));
  t1.setAttribute('fill','#0d0c0a');
  t1.textContent=s.writers;
  g.appendChild(t1);

  // fanzine type — al costado, no el número otra vez
  const t2=document.createElementNS(SVGNS,'text');
  t2.setAttribute('x',s.x+baseRadius+10);t2.setAttribute('y',s.y+2);
  t2.setAttribute('font-family','Bebas Neue,sans-serif');t2.setAttribute('font-size','13');
  t2.setAttribute('fill','rgba(245,238,218,0.6)');
  t2.setAttribute('letter-spacing','1');
  t2.textContent=s.fanzine;
  g.appendChild(t2);

  // grow-in animation (stop-motion-ish pop)
  g.style.transformOrigin=`${s.x}px ${s.y}px`;
  g.animate([
    {transform:'scale(0)',opacity:0},
    {transform:'scale(1.18)',opacity:1,offset:0.6},
    {transform:'scale(0.94)',offset:0.8},
    {transform:'scale(1)',opacity:1}
  ],{duration:900,easing:'cubic-bezier(.34,1.56,.64,1)',fill:'forwards'});

  g.addEventListener('mouseenter',()=>{
    tip.style.display='block';
    tip.innerHTML=`<strong>${s.n}</strong><br><span style="font-family:Archivo,sans-serif;font-size:12px;opacity:0.8;">${s.writers} escritores · ${s.fanzine}<br>${s.peak} · ${s.theme}</span>`;
  });
  g.addEventListener('mousemove',e=>{ const r=svg.closest('.p-right').getBoundingClientRect(); tip.style.left=(e.clientX-r.left+12)+'px'; tip.style.top=(e.clientY-r.top-30)+'px'; });
  g.addEventListener('mouseleave',()=>tip.style.display='none');

  svg.appendChild(g);
}

// ============================================================
// PAGE 3 — THEMES AS GRAFFITI BLOBS THAT FILL PROGRESSIVELY
// ============================================================
const themeData={
  estudios:{phrases:["No entiendo nada de Cálculo pero igual voy. Es una fe extraña.","Cuántas materias para aprender nada que use en la vida real.","El parcial estuvo tremendo. Igual aprobé de alguna manera."],meta:"Ciudad Universitaria · Fanzine Anécdotas",color:'#1d3df0',pct:0.28},
  amistad:{phrases:["Mi mejor amiga y yo nos peleamos por el 107, literalmente.","Vine sola y conocí a alguien en la parada. Eso no pasa.","Gracias a quien dejó el fanzine acá. Me hizo el viaje."],meta:"Belgrano · Fanzine Historias",color:'#f0379a',pct:0.20},
  amor:{phrases:["Vi a alguien leer este fanzine y me enamoré. Ya fue.","¿Amor? Sí, pero primero que llegue el 107.","Le escribí un mensaje y nunca lo mandé. Lo dejé acá."],meta:"Palermo · Fanzine Anécdotas",color:'#ff5a00',pct:0.19},
  sueños:{phrases:["Quiero vivir en algún lugar donde no necesite el bondi.","Soñar en grande desde la parada más chica.","Un día no voy a necesitar este colectivo. Por ahora sí."],meta:"Parque Chas · Fanzine Historias",color:'#1fdb3a',pct:0.15},
  trabajo:{phrases:["Salir a las 7 para llegar a las 9. El colectivo es el trabajo.","Conseguí laburo. El 107 fue testigo de todos los rechazos.","Nada como leer un fanzine yendo a un trabajo que no querés."],meta:"Villa Urquiza · Fanzine Anécdotas",color:'#ffd400',pct:0.10},
  familia:{phrases:["Mi mamá me llama siempre cuando estoy en el colectivo.","Voy a ver a mi abuela. Siempre me hace merendar.","La familia es la que te espera cuando tardás 2 horas."],meta:"Floresta · Fanzine Historias",color:'#8b3fc4',pct:0.08},
};

const blobShapes={
  estudios:'M120 60 C 200 30, 300 50, 330 130 C 360 200, 300 250, 220 240 C 150 232, 80 200, 70 140 C 64 100, 80 72, 120 60 Z',
  amistad:'M250 120 C 320 110, 360 170, 340 230 C 320 285, 250 295, 210 255 C 175 220, 185 150, 250 120 Z',
  amor:'M150 250 C 210 230, 280 255, 285 310 C 288 355, 230 380, 175 365 C 125 350, 105 290, 150 250 Z',
  sueños:'M70 270 C 120 250, 175 280, 168 330 C 162 372, 110 388, 70 365 C 35 345, 30 295, 70 270 Z',
  trabajo:'M60 150 C 100 130, 145 155, 140 195 C 136 230, 95 242, 65 222 C 38 204, 30 172, 60 150 Z',
  familia:'M80 80 C 120 65, 160 88, 152 122 C 146 150, 110 160, 85 142 C 60 126, 52 98, 80 80 Z',
};

function initGraffiti(){
  const svg=document.getElementById('graffiti-svg');
  const defs=document.createElementNS(SVGNS,'defs');
  defs.innerHTML=`
    <filter id="gspray" x="-45%" y="-45%" width="190%" height="190%">
      <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="22"/>
      <feGaussianBlur stdDeviation="0.7"/>
    </filter>
    <filter id="drip">
      <feTurbulence type="fractalNoise" baseFrequency="0.009 0.055" numOctaves="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="16" yChannelSelector="G"/>
    </filter>
    <filter id="gshadow" x="-35%" y="-35%" width="170%" height="170%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>`;
  svg.appendChild(defs);

  const order=['estudios','amistad','amor','sueños','trabajo','familia'];
  order.forEach((key,i)=>{
    setTimeout(()=>paintBlob(svg,key,i),300+i*350);
  });

  // animate the side meters too
  setTimeout(()=>{ document.querySelectorAll('#theme-list .theme-meter > span').forEach(s=>{ s.style.width=s.dataset.pct+'%'; }); },500);
}

// puntos de goteo (x=posición horizontal, y=donde empieza el chorro, h=largo, w=ancho)
const blobDrips={
  estudios:[{x:158,y:239,h:30,w:4},{x:218,y:242,h:18,w:3},{x:278,y:238,h:26,w:3.5}],
  amistad: [{x:258,y:292,h:22,w:3.5},{x:316,y:283,h:16,w:2.8}],
  amor:    [{x:192,y:377,h:28,w:4},{x:248,y:381,h:18,w:3}],
  sueños:  [{x:92, y:386,h:22,w:3.5},{x:132,y:389,h:32,w:4.5}],
  trabajo: [{x:76, y:240,h:18,w:3},{x:110,y:242,h:13,w:2.5}],
  familia: [{x:98, y:158,h:16,w:2.5},{x:128,y:156,h:24,w:3}],
};

function paintBlob(svg,key,i){
  const d=themeData[key];
  const g=document.createElementNS(SVGNS,'g');
  g.id='blob-'+key;
  g.style.cursor='pointer';
  g.dataset.theme=key;

  const path=blobShapes[key];

  // 1. SOMBRA — copia oscura desplazada, borrosa (efecto 3D sobre la pared)
  const shadow=document.createElementNS(SVGNS,'path');
  shadow.setAttribute('d',path);
  shadow.setAttribute('fill','#060504');
  shadow.setAttribute('opacity','0.65');
  shadow.setAttribute('transform','translate(7,10)');
  shadow.setAttribute('filter','url(#gshadow)');
  g.appendChild(shadow);

  // 2. OUTLINE NEGRO GRUESO — el "sketch" de marcador que define la forma
  const outerLine=document.createElementNS(SVGNS,'path');
  outerLine.setAttribute('d',path);
  outerLine.setAttribute('fill','none');
  outerLine.setAttribute('stroke','#080605');
  outerLine.setAttribute('stroke-width','11');
  outerLine.setAttribute('stroke-linejoin','round');
  outerLine.setAttribute('stroke-linecap','round');
  outerLine.setAttribute('opacity','0.9');
  outerLine.setAttribute('filter','url(#drip)');
  g.appendChild(outerLine);

  // 3. RELLENO SPRAY — color principal, anima de 0 a opacidad según frecuencia
  const fill=document.createElementNS(SVGNS,'path');
  fill.setAttribute('d',path);
  fill.setAttribute('fill',d.color);
  fill.setAttribute('filter','url(#gspray)');
  fill.setAttribute('opacity','0');
  const target=(0.68+d.pct*0.9).toFixed(2);
  fill.style.transition='opacity 1.2s ease';
  g.appendChild(fill);

  // 4. GOTEOS (DRIPS) — chorros de pintura que bajan de la mancha
  (blobDrips[key]||[]).forEach(dp=>{
    const w=dp.w||3.5;
    const dr=document.createElementNS(SVGNS,'path');
    dr.setAttribute('d',`M ${dp.x-w} ${dp.y} C ${dp.x-w*1.15} ${dp.y+dp.h*0.42} ${dp.x-w*0.38} ${dp.y+dp.h*0.88} ${dp.x} ${dp.y+dp.h+5} C ${dp.x+w*0.38} ${dp.y+dp.h*0.88} ${dp.x+w*1.15} ${dp.y+dp.h*0.42} ${dp.x+w} ${dp.y} Z`);
    dr.setAttribute('fill',d.color);
    dr.setAttribute('opacity','0.82');
    g.appendChild(dr);
  });

  // 5. LINER DE COLOR — línea fina sobre el relleno, define el contorno final
  const liner=document.createElementNS(SVGNS,'path');
  liner.setAttribute('d',path);
  liner.setAttribute('fill','none');
  liner.setAttribute('stroke',d.color);
  liner.setAttribute('stroke-width','3');
  liner.setAttribute('stroke-linejoin','round');
  liner.setAttribute('opacity','0.95');
  liner.setAttribute('filter','url(#drip)');
  g.appendChild(liner);

  // 6. HIGHLIGHT — reflejo blanco en la parte superior izquierda
  const bb=blobCenter(key);
  const hi=document.createElementNS(SVGNS,'ellipse');
  hi.setAttribute('cx',bb.x-14); hi.setAttribute('cy',bb.y-24);
  hi.setAttribute('rx','22'); hi.setAttribute('ry','9');
  hi.setAttribute('fill','rgba(255,255,255,0.18)');
  hi.setAttribute('transform',`rotate(-25,${bb.x-14},${bb.y-24})`);
  g.appendChild(hi);

  // 7. LABELS — nombre del tema con sombra de texto (estilo "throw-up")
  const tShadow=document.createElementNS(SVGNS,'text');
  tShadow.setAttribute('x',bb.x+2);tShadow.setAttribute('y',bb.y+2);
  tShadow.setAttribute('text-anchor','middle');tShadow.setAttribute('font-family','Bebas Neue');
  tShadow.setAttribute('font-size','17');tShadow.setAttribute('fill','rgba(0,0,0,0.55)');
  tShadow.textContent=key.toUpperCase();
  g.appendChild(tShadow);

  const t=document.createElementNS(SVGNS,'text');
  t.setAttribute('x',bb.x);t.setAttribute('y',bb.y);t.setAttribute('text-anchor','middle');
  t.setAttribute('font-family','Bebas Neue');t.setAttribute('font-size','17');
  t.setAttribute('fill','#f2ecd9');t.setAttribute('opacity','0.92');
  t.textContent=key.toUpperCase();
  g.appendChild(t);

  const t2=document.createElementNS(SVGNS,'text');
  t2.setAttribute('x',bb.x);t2.setAttribute('y',bb.y+17);t2.setAttribute('text-anchor','middle');
  t2.setAttribute('font-family','Bebas Neue');t2.setAttribute('font-size','13');
  t2.setAttribute('fill','rgba(255,255,255,0.55)');
  t2.textContent=Math.round(d.pct*100)+'%';
  g.appendChild(t2);

  svg.appendChild(g);
  requestAnimationFrame(()=>{ fill.style.opacity=target; });
  g.addEventListener('click',()=>showThemeByKey(key,g));
}

function blobCenter(key){
  const map={estudios:{x:200,y:150},amistad:{x:270,y:205},amor:{x:200,y:310},sueños:{x:115,y:320},trabajo:{x:90,y:190},familia:{x:108,y:115}};
  return map[key];
}

function showTheme(el){ showThemeByKey(el.dataset.theme,null); }
function showThemeByKey(theme,blobEl){
  const d=themeData[theme];
  const q=document.getElementById('spray-quote');
  const txt=document.getElementById('quote-text');
  const meta=document.getElementById('quote-meta');
  txt.textContent='"'+d.phrases[Math.floor(Math.random()*d.phrases.length)]+'"';
  meta.textContent='— '+d.meta;
  q.classList.add('show');
  q.style.boxShadow='5px 6px 0 '+d.color;

  // dim other blobs, pop selected
  Object.keys(themeData).forEach(k=>{
    const b=document.getElementById('blob-'+k);
    if(!b) return;
    b.style.transition='opacity 0.3s, transform 0.3s';
    if(k===theme){ b.style.opacity='1'; b.style.transform='scale(1.05)'; b.style.transformOrigin='center'; }
    else { b.style.opacity='0.4'; b.style.transform='scale(1)'; }
  });
}

// ============================================================
// PAGE 4 — ZINES AS WORN PHYSICAL BOOKLETS
// ============================================================
function initZines(){
  const row=document.getElementById('zines');
  row.innerHTML='';
  // decorative thin worn zines on the left
  ['#7a6f55','#8a7d5f','#6b6049'].forEach((c,i)=>row.appendChild(makeZine({title:'',thickness:14+Math.random()*8,height:120+Math.random()*50,color:c,deco:true})));

  const data=[
    {title:'historias',aportes:34,pages:21,color:'#1fdb3a',thickness:30,textColor:'#0d0c0a'},
    {title:'anécdotas',aportes:52,pages:38,color:'#f0379a',thickness:46,textColor:'#fff'},
    {title:'dibujos',aportes:84,pages:57,color:'#1d3df0',thickness:70,textColor:'#fff'},
  ];
  data.forEach(d=>row.appendChild(makeZine(d)));

  ['#9a8e70','#857a5e'].forEach(c=>row.appendChild(makeZine({title:'',thickness:12+Math.random()*8,height:100+Math.random()*40,color:c,deco:true})));

  setTimeout(()=>document.querySelectorAll('.tally-fill').forEach(b=>b.style.width=b.dataset.pct+'%'),450);
}

function makeZine(d){
  const z=document.createElement('div');
  z.className='zine';
  const h=d.height||(150+d.pages*1.6);
  z.style.cssText=`width:${d.thickness}px; height:${h}px; background:linear-gradient(90deg, rgba(0,0,0,0.25), ${d.color} 30%, ${d.color} 70%, rgba(0,0,0,0.3));`;
  // worn top edge (torn) + use marks
  const wear=`
    <div style="position:absolute;top:0;left:0;right:0;height:6px;background:rgba(0,0,0,0.25);clip-path:polygon(0 0,100% 0,100% 40%,90% 100%,80% 30%,68% 90%,55% 35%,42% 100%,30% 40%,18% 95%,8% 45%,0 90%);"></div>
    <div style="position:absolute;bottom:8px;left:2px;right:2px;height:1px;background:rgba(0,0,0,0.3);"></div>
    <div style="position:absolute;bottom:14px;left:2px;right:2px;height:1px;background:rgba(0,0,0,0.2);"></div>`;
  if(d.deco){
    z.innerHTML=wear+`<div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,0.12) 0 1px,transparent 1px 3px);"></div>`;
    return z;
  }
  z.innerHTML=`
    ${wear}
    <div class="zine-spine" style="color:${d.textColor};">${d.title.toUpperCase()}</div>
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.06) 0 1px,transparent 1px 4px);pointer-events:none;"></div>
    <div class="zine-tip">${d.title} · ${d.aportes} aportes<br>${d.pages} páginas · bien usado</div>
  `;
  // a little tape on the spine of the most-used one
  if(d.aportes>80){ const t=document.createElement('div'); t.className='tape pink'; t.style.cssText='top:30%;left:-6px;width:30px;height:16px;transform:rotate(-12deg);'; z.appendChild(t); }
  return z;
}

// ============================================================
// PAGE 5 — TIME GRID AS INK PRESS + ROVING BUS
// ============================================================
function initTimeGrid(){
  const canvas=document.getElementById('time-canvas');
  const ctx=canvas.getContext('2d');
  const days=['L','M','X','J','V','S','D'];
  const hours=Array.from({length:19},(_,i)=>i+6);
  function act(di,h){ let b=Math.random()*0.28+0.05; if(h>=8&&h<=10)b+=0.55+Math.random()*0.2; else if(h>=13&&h<=15)b+=0.42+Math.random()*0.2; else if(h>=18&&h<=21)b+=0.5+Math.random()*0.25; if(di<5)b+=0.1; return Math.min(1,b); }
  const data=days.map((d,di)=>hours.map(h=>act(di,h)));
  const M={l:44,t:44,r:24,b:24};
  let raf, bx, by, dir=1, row=0;

  function draw(busX,busY){
    const W=canvas.width,H=canvas.height;
    const gw=W-M.l-M.r, gh=H-M.t-M.b;
    const cw=gw/days.length, ch=gh/hours.length;
    ctx.fillStyle='#100c08'; ctx.fillRect(0,0,W,H);

    data.forEach((arr,di)=>arr.forEach((a,hi)=>{
      const x=M.l+di*cw, y=M.t+hi*ch;
      let col;
      if(a>0.6) col=`rgba(31,219,58,${a*0.85})`;
      else if(a>0.32) col=`rgba(29,61,240,${a*0.8})`;
      else col=`rgba(60,52,40,${0.3+a*0.5})`;
      // ink stamp block with slightly irregular edges
      ctx.fillStyle=col;
      ctx.fillRect(x+1.5,y+1.5,cw-3,ch-3);
      // press texture
      if(a>0.45){
        ctx.strokeStyle=`rgba(13,12,10,${a*0.4})`; ctx.lineWidth=0.7;
        for(let k=0;k<5;k++){ const lx=x+2+Math.random()*(cw-4); ctx.beginPath(); ctx.moveTo(lx,y+2); ctx.lineTo(lx+(Math.random()-0.5)*5,y+ch-2); ctx.stroke(); }
      }
      // uneven ink: lighten random corners
      ctx.fillStyle='rgba(16,12,8,0.18)';
      ctx.fillRect(x+1.5,y+1.5,cw*Math.random()*0.4,ch*Math.random()*0.4);
    }));

    // labels — handwritten
    ctx.fillStyle='rgba(245,238,218,0.6)'; ctx.font="14px 'Bebas Neue'"; ctx.textAlign='center';
    days.forEach((d,di)=>ctx.fillText(d,M.l+di*cw+cw/2,M.t-12));
    ctx.font="12px 'Archivo', sans-serif"; ctx.textAlign='right'; ctx.fillStyle='rgba(245,238,218,0.45)';
    hours.forEach((h,hi)=>{ if(hi%2===0) ctx.fillText(h+'h',M.l-6,M.t+hi*ch+ch/2+4); });

    // roving bus leaving a trail
    if(busX!==undefined){
      ctx.font='22px sans-serif'; ctx.fillText('🚌',busX-11,busY+8);
    }
  }

  function resize(){ canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight; }
  resize();
  const W=()=>canvas.width,H=()=>canvas.height;
  const gw=()=>W()-M.l-M.r, gh=()=>H()-M.t-M.b;
  bx=M.l+5; by=M.t+(gh()/hours.length)*2;

  function step(){
    const cw=gw()/days.length, ch=gh()/hours.length;
    draw(bx,by);
    bx+=dir*(cw/12);
    if(dir>0 && bx>M.l+days.length*cw-8){ dir=-1; by+=ch; if(by>M.t+gh()) by=M.t; }
    else if(dir<0 && bx<M.l+8){ dir=1; by+=ch; if(by>M.t+gh()) by=M.t; }
    raf=requestAnimationFrame(step);
  }
  step();
  window.addEventListener('resize',()=>{ cancelAnimationFrame(raf); resize(); bx=M.l+5; by=M.t+(gh()/hours.length)*2; step(); });
}

// ============================================================
// PAGE FINAL — NETWORK GROWTH AS MARKER LINES ON A MAP
// ============================================================
function initGrowth(){
  const svg=document.getElementById('growth-svg');
  const W=window.innerWidth,H=window.innerHeight;
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  const CX=W/2, CY=H/2;

  const s1=[{x:CX-70,y:CY-50,l:'Ciu. Univ.'},{x:CX+70,y:CY+50,l:'Belgrano'}];
  const s2=[{x:CX,y:CY-210,l:'Ciu. Univ.'},{x:CX-12,y:CY-130,l:'V. Urquiza'},{x:CX+8,y:CY-55,l:'Belgrano'},{x:CX-6,y:CY+20,l:'Palermo'},{x:CX+10,y:CY+95,l:'Centro'},{x:CX-10,y:CY+170,l:'Pque. Avell.'}];
  const s3=[{stops:s2,color:'#f0379a'},{stops:s2.map(s=>({...s,x:s.x+180,y:s.y-34,l:''})),color:'#1d3df0'},{stops:s2.map(s=>({...s,x:s.x-160,y:s.y+24,l:''})),color:'#1fdb3a'},{stops:s2.map((s,i)=>({...s,x:s.x+(i%2?90:-90),y:s.y-130,l:''})),color:'#ffd400'}];

  function defsOnce(){
    const defs=document.createElementNS(SVGNS,'defs');
    defs.innerHTML=`<filter id="mk"><feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="3" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="7"/></filter>
      <filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    svg.appendChild(defs);
  }

  function drawStage(st){
    svg.innerHTML=''; defsOnce();
    if(st===1) drawLine(s1,'#1fdb3a',5,0);
    else if(st===2) drawLine(s2,'#f0379a',5,0);
    else s3.forEach((ln,i)=>drawLine(ln.stops,ln.color,3.5,i*90));
    document.querySelectorAll('.stage-chip').forEach((c,i)=>c.classList.toggle('active',i+1===st));
    if(st===3) setTimeout(()=>document.getElementById('final-phrase').classList.add('show'),1500);
  }

  function drawLine(stops,color,sw,delay){
    if(stops.length<2) return;
    let d=`M ${stops[0].x} ${stops[0].y}`;
    for(let i=1;i<stops.length;i++) d+=` Q ${stops[i-1].x} ${stops[i-1].y} ${stops[i].x} ${stops[i].y}`;
    const p=document.createElementNS(SVGNS,'path');
    p.setAttribute('d',d);p.setAttribute('fill','none');p.setAttribute('stroke',color);
    p.setAttribute('stroke-width',sw);p.setAttribute('stroke-linecap','round');
    p.setAttribute('filter','url(#mk)');p.setAttribute('opacity','0.9');
    p.style.strokeDasharray=2400;p.style.strokeDashoffset=2400;
    p.style.transition=`stroke-dashoffset 1.8s ease ${delay}ms`;
    svg.appendChild(p);
    setTimeout(()=>p.style.strokeDashoffset='0',60);

    stops.forEach((s,i)=>setTimeout(()=>{
      const c=document.createElementNS(SVGNS,'circle');
      c.setAttribute('cx',s.x);c.setAttribute('cy',s.y);c.setAttribute('r','7');
      c.setAttribute('fill',color);c.setAttribute('filter','url(#gl)');
      c.style.opacity='0';c.style.transition='opacity 0.4s';
      svg.appendChild(c); setTimeout(()=>c.style.opacity='0.95',40);
      if(s.l){ const t=document.createElementNS(SVGNS,'text'); t.setAttribute('x',s.x+13);t.setAttribute('y',s.y+5);
        t.setAttribute('fill','#f2ecd9');t.setAttribute('font-family','Archivo, sans-serif');t.setAttribute('font-size','14');t.setAttribute('opacity','0.8');
        t.textContent=s.l; svg.appendChild(t); }
    },delay+i*240+400));
  }

  drawStage(1);
  setTimeout(()=>drawStage(2),2200);
  setTimeout(()=>drawStage(3),4800);
  document.getElementById('chip-1').onclick=()=>drawStage(1);
  document.getElementById('chip-2').onclick=()=>drawStage(2);
  document.getElementById('chip-3').onclick=()=>drawStage(3);
}

// ============================================================
// INIT
// ============================================================
buildDots();
document.getElementById('nav-prev').classList.add('hidden');