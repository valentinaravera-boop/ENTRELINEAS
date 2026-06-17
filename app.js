/* ================= ESTADO ================= */
const estado = {
  apodo: null,
  tokens: 3,
  modo: null,          // 'parada' | 'viaje'
  linea: null,
  abordo: false,
  votoHecho: false,
  timerLlegada: null,
  timerMsjs: null,
  minutos: 8,
};

const LINEAS = [
  {num:'28',  color:'verde', img:'linea 28.png',  ramal:'Ramal Retiro',               sentido:'HACIA RETIRO',               dato:'Ideal para mirar por la ventana y descubrir rincones que siempre pasan desapercibidos.'},
  {num:'33',  color:'verde', img:'linea 33.png',  ramal:'Ramal Ciudad Universitaria', sentido:'HACIA CIUDAD UNIVERSITARIA', dato:'Si levantás la vista del celular, el río aparece cuando menos lo esperás.'},
  {num:'34',  color:'azul',  img:'linea 34.png',  ramal:'Ramal Liniers',              sentido:'HACIA LINIERS',              dato:'Probá mirar por la ventana durante un minuto. Siempre aparece algo inesperado.'},
  {num:'37',  color:'verde', img:'linea 37.png',  ramal:'Ramal Lanús',                sentido:'HACIA LANÚS',                dato:'Cada barrio cambia el paisaje, pero las historias siguen viajando.'},
  {num:'160', color:'rojo',  img:'linea 160.png', ramal:'Ramal Palermo',              sentido:'HACIA PALERMO',              dato:'Un viaje largo para perderse mirando la ciudad entre semáforo y semáforo.'},
  {num:'166', color:'rojo',  img:'linea 166.png', ramal:'Ramal Palermo',              sentido:'HACIA PALERMO',              dato:'Las mejores observaciones suelen ocurrir cuando no estás buscando nada.'},
  {num:'107', color:'verde', img:'linea 107.png', ramal:'Ramal Ciudad Universitaria', sentido:'HACIA CIUDAD UNIVERSITARIA', dato:'Entre mochilas, apuntes y apurados, siempre aparece alguna escena para recordar.'},
  {num:'45',  color:'verde', img:'linea 45.png',  ramal:'Ramal Retiro',               sentido:'HACIA RETIRO',               dato:'Cada mañana suben decenas de historias distintas a este recorrido.'},
];

const APODOS_FAKE = ['fantasma_del_60','la_ventanilla','che_bondi','ruido_blanco','asiento_37','tinta_violeta','el_de_atras','morocha_fm','pibe_termo','sube_agotada'];
const MSJS_FAKE = [
'Mucho lugar para sentarse, aprovechen.',
'El tránsito está parado en Plaza Italia.',
'Hoy el viaje está sorprendentemente tranquilo.',
'Alguien subió con un perro salchicha con pulóver. Día ganado.',
'El chofer puso cumbia. Nivel de viaje: superior.',
'Desvío por corte en Cabildo, vamos por Ciudad de la Paz.',
'Se largó a llover y las ventanillas empañadas son un cine.',
'Dos señoras debatiendo la mejor factura. Ganó la vigilante.',
'Quedan asientos al fondo, no se amontonen adelante.',
'Atardecer brutal a la derecha. Miren ahora.',
'Subió alguien corriendo y llegó justo. Final feliz.',
'Hay olor a café recién hecho entrando por la ventana.',
'Un bebé está observando todo como si fuera un documental.',
'Acabamos de esquivar un pozo importante.',
'La ciudad se ve distinta cuando no mirás el celular.',
'Hay una conversación sobre fútbol en curso.',
'La fila de la panadería de la esquina promete cosas buenas.',
'Miren los balcones de esta cuadra. Ninguno es igual al otro.',
'Acaba de liberarse un asiento. Aprovechen la oportunidad.',
'El cielo de hoy merece una foto.',
'Hay alguien leyendo un libro. ¿Qué estará pasando en esa historia?',
'El colectivo está más silencioso de lo habitual.',
'Pasamos una plaza llena de gente tomando mate.',
'Las sombras de esta hora hacen que todo se vea distinto.',
'Hay más mochilas que personas en este sector.',
'El semáforo decidió tomarse su tiempo.',
'Ventanilla libre. Vista privilegiada.',
'Una bici roja acaba de pasar a toda velocidad.',
'La ciudad también se descubre viajando.',
'Un perro acaba de ignorar por completo a su dueño.',
'Hay una ventana llena de plantas en el edificio de la izquierda.',
'Este trayecto nunca ocurre dos veces igual.',
'Olor a lluvia en el aire.',
'Alguien acaba de bostezar y contagió a media fila.',
'Momento ideal para mirar por la ventana.',
'El kiosco de la esquina sigue resistiendo.',
'Hay un gato durmiendo en un balcón. Vida resuelta.',
'Pasamos una calle llena de jacarandás.',
'La luz de esta hora mejora cualquier vista.',
'Elegí un edificio. Imaginá quién vive ahí.',
'Una pareja acaba de discutir qué pedir para cenar.',
'La ciudad está escribiendo historias mientras viajamos.',
'Se escuchó un "permiso" perfectamente ejecutado.',
'Hay alguien escuchando música tan fuerte que casi compartimos playlist.',
'Próxima misión: encontrar algo amarillo antes de la siguiente parada.',
'El tránsito avanza a ritmo de tortuga optimista.',
'Acabamos de pasar una esquina que parece sacada de una película.',
'Viajar también puede ser una forma de observar.',
'Las mejores escenas suelen durar apenas un semáforo.',
];


/* ================= SPLASH ================= */
function abrirMasInfo(){
  const card = document.getElementById('mas-info');
  const bondi = document.getElementById('bondi-click');
  const label = document.getElementById('mas-info-label');
  card.classList.toggle('abierto');
  bondi.classList.toggle('encogido');
  const abierto = card.classList.contains('abierto');
  label.className = abierto ? 'mas-info-label-abierto' : 'mas-info-label';
  label.textContent = abierto ? 'Cerrar ×' : 'Más info +';
}

/* ================= NAVEGACIÓN ================= */
function ir(id){
  document.querySelectorAll('.pantalla').forEach(p=>p.classList.remove('activa'));
  document.getElementById(id).classList.add('activa');
  const conBarra = !['p-splash','p-registro'].includes(id);
  document.getElementById('barra').classList.toggle('visible', conBarra);
  document.getElementById(id).scrollTop = 0;
}

function toast(txt){
  const t=document.getElementById('toast');
  t.textContent=txt;
  t.classList.add('ver');
  clearTimeout(t._k);
  t._k=setTimeout(()=>t.classList.remove('ver'),3200);
}

function pintarTokens(){
  document.getElementById('num-tokens').textContent=estado.tokens;
}
function pintarQuien(){
  document.getElementById('barra-quien').innerHTML =
    'a bordo como<br><b>@'+estado.apodo+'</b>';
}

/* ================= REGISTRO ================= */
function registrar(){
  const apodo=document.getElementById('in-apodo').value.trim();
  const pass=document.getElementById('in-pass').value;
  const err=document.getElementById('error-registro');
  if(apodo.length<3){err.textContent='⚠ El apodo necesita al menos 3 caracteres.';return false;}
  if(pass.length<4){err.textContent='⚠ La contraseña necesita al menos 4 caracteres.';return false;}
  err.textContent='';
  estado.apodo=apodo;
  pintarQuien();
  pintarTokens();
  ir('p-modo');
  toast('Cuenta creada. Arrancás con 3 tokens 🎟 — cada mensaje cuesta 1, cada viaje te da +1.');
}
['in-apodo','in-pass'].forEach(id=>{
  document.getElementById(id).addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();registrar();}
  });
});

/* ================= MODO ================= */
function elegirModo(m){
  estado.modo=m;
  const cinta=document.getElementById('cinta-linea');
  const sub=document.getElementById('sub-linea');
  if(m==='parada'){
    cinta.textContent='QR ESCANEADO · PARADA #2841 · AV. CABILDO Y JURAMENTO';
    sub.textContent='Detectamos las líneas que pasan por esta parada. Elegí cuál estás esperando.';
  }else{
    cinta.textContent='ENTRASTE DESDE EL BONDI · UBICACIÓN ACTIVA';
    sub.textContent='Elegí la línea que estás usando. Detectamos el colectivo activo más cercano y lo asociamos a tu viaje.';
  }
  pintarLineas();
  ir('p-linea');
}

function pintarLineas(){
  const cont=document.getElementById('lista-lineas');
  cont.innerHTML='';
  const lista = estado.modo==='viaje'
    ? LINEAS.slice().sort(()=>Math.random()-0.5).slice(0,3)
    : LINEAS;
  lista.forEach(l=>{
    const d=document.createElement('div');
    d.className='bondi';
    d.dataset.color=l.color;
    d.onclick=()=>elegirLinea(l);
    d.innerHTML='<img src="'+l.img+'" alt="Colectivo línea '+l.num+'">'+
      '<div class="num-linea">'+l.num+'</div>'+
      '<div class="datos"><b>'+l.ramal+' · '+l.sentido+'</b>'+l.dato+'</div>';
    cont.appendChild(d);
  });
}

function elegirLinea(l){
  estado.linea=l;
  document.getElementById('mapa-num-linea').textContent=l.num;
  document.getElementById('mapa-ramal').textContent=l.ramal;
  document.getElementById('mapa-sentido').textContent=l.sentido;
  document.querySelector('#p-mapa .cabeza-mapa').dataset.color=l.color;
  document.querySelectorAll('.ficha-num-linea').forEach(e=>e.textContent=l.num);
  document.getElementById('espera-linea').textContent=l.num;
  document.getElementById('bita-meta').textContent='LÍNEA '+l.num+' · INTERNO 343 · SALIÓ DE TERMINAL '+horaHaceMin(23);
  if(estado.modo==='viaje'){
    estado.abordo=true;
    toast('🚍 Interno 343 detectado y asociado a tu viaje.');
    abrirBitacora();
  }else{
    ir('p-mapa');
    setTimeout(()=>toast('Tocá el punto rojo: es el único bondi que te mostramos — el más cercano a vos.'),500);
  }
}

/* ================= MAPA / FICHA ================= */
function abrirFicha(){
  document.getElementById('ficha-bondi').classList.add('abierta');
}
function irEspera(){
  document.getElementById('ficha-bondi').classList.remove('abierta');
  arrancarEspera();
}

/* ================= ESPERA ================= */
function arrancarEspera(){
  ir('p-espera');
  estado.minutos = parseInt(document.getElementById('min-llegada').textContent)||8;
  pintarEspera();
  clearInterval(estado.timerLlegada);
  estado.timerLlegada=setInterval(()=>{
    estado.minutos--;
    document.getElementById('min-llegada').textContent=Math.max(estado.minutos,0);
    pintarEspera();
    if(estado.minutos<=0){
      clearInterval(estado.timerLlegada);
      document.getElementById('cuenta-llegada').textContent='🚍 ¡TU '+estado.linea.num+' ESTÁ LLEGANDO A LA PARADA!';
    }
  },9000); // 9s = "1 minuto" para la demo
}
function pintarEspera(){
  document.getElementById('espera-min').textContent=Math.max(estado.minutos,0);
  if(estado.minutos>0){
    document.getElementById('cuenta-llegada').textContent='🚍 TU '+(estado.linea?estado.linea.num:'107')+' ESTÁ A '+estado.minutos+' MIN — HAY TIEMPO DE FANZINE';
  }
}
function llegoBondi(){
  clearInterval(estado.timerLlegada);
  estado.abordo=true;
  toast('Subiste al interno 343. Ahora sí: podés escribir en la bitácora ✍');
  abrirBitacora();
}

/* ================= BITÁCORA ================= */
function abrirBitacora(){
  ir('p-bitacora');
  const muro=document.getElementById('muro');
  if(!muro.dataset.cargada){
    muro.dataset.cargada='1';
    sistema('La bitácora nació cuando el interno 343 salió de la terminal ('+horaHaceMin(23)+').');
    msjAjeno(0,-19);msjAjeno(1,-14);msjAjeno(3,-9);msjAjeno(4,-4);
    sistema('Desaparece al final del recorrido — o si te alejás +45 min del trazado.');
  }
  pintarZonaEscribir();
  document.getElementById('btn-bajar').style.display = estado.abordo ? 'block':'none';
  document.getElementById('btn-volver-mapa').style.display = estado.abordo ? 'none':'block';
  // mensajes que van llegando
  clearInterval(estado.timerMsjs);
  estado.timerMsjs=setInterval(()=>{
    msjAjeno(Math.floor(Math.random()*MSJS_FAKE.length),0);
  },3000);
  setTimeout(()=>{muro.scrollTop=muro.scrollHeight;},50);
}
function volverDeBitacora(){
  clearInterval(estado.timerMsjs);
  ir('p-mapa');
  abrirFicha();
}

function pintarZonaEscribir(){
  const z=document.getElementById('zona-escribir');
  if(!estado.abordo){
    z.innerHTML='<div class="solo-lectura">👀 MODO LECTURA — estás en la parada.<br>Para escribir tenés que estar arriba del bondi. Mientras: leé, espiá, anticipá tu viaje.</div>';
    return;
  }
  if(estado.tokens<=0){
    z.innerHTML='<div class="solo-lectura">🎟 TE QUEDASTE SIN TOKENS.<br>Podés seguir leyendo, pero para publicar necesitás completar viajes (+1 token cada uno).</div>';
    return;
  }
  z.innerHTML=
    '<div class="fila-input">'+
    '<textarea id="input-msj" maxlength="120" placeholder="¿Qué está pasando en este viaje? (máx. 120)" oninput="contar()"></textarea>'+
    '<button id="btn-publicar" onclick="publicar()">PUBLICAR<br>−1 🎟</button>'+
    '</div>'+
    '<div class="contador-chars"><span>1 MENSAJE = 1 TOKEN · SIN LIKES · SIN RESPUESTAS · CONVERSACIÓN LINEAL</span><span id="cuenta-chars">0/120</span></div>';
}
function contar(){
  const v=document.getElementById('input-msj').value;
  document.getElementById('cuenta-chars').textContent=v.length+'/120';
}
function publicar(){
  const inp=document.getElementById('input-msj');
  const txt=inp.value.trim();
  if(!txt)return;
  if(estado.tokens<=0){pintarZonaEscribir();return;}
  estado.tokens--;
  pintarTokens();
  agregarMsj(estado.apodo,txt,ahora(),true);
  inp.value='';contar();
  toast('Mensaje publicado · −1 token 🎟 (te quedan '+estado.tokens+')');
  if(estado.tokens<=0)pintarZonaEscribir();
}
function agregarMsj(quien,txt,hora,mio){
  const muro=document.getElementById('muro');
  const d=document.createElement('div');
  d.className='msj'+(mio?' mio':'');
  d.innerHTML='<div class="quien-msj"><span>@'+quien+'</span><time>'+hora+'</time></div>'+esc(txt);
  muro.appendChild(d);
  muro.scrollTop=muro.scrollHeight;
}
function msjAjeno(i,offsetMin){
  agregarMsj(APODOS_FAKE[i%APODOS_FAKE.length],MSJS_FAKE[i%MSJS_FAKE.length],horaHaceMin(-offsetMin),false);
}
function sistema(txt){
  const muro=document.getElementById('muro');
  const d=document.createElement('div');
  d.className='msj-sistema';
  d.textContent=txt;
  muro.appendChild(d);
}
function esc(s){return s.replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));}

/* ================= FIN DE VIAJE ================= */
function finDeViaje(){
  clearInterval(estado.timerMsjs);
  estado.votoHecho=false;
  document.querySelectorAll('.voto').forEach(b=>{b.classList.remove('elegido');b.disabled=false;});
  document.getElementById('fin-gracias').style.display='none';
  document.getElementById('btn-otro-viaje').style.display='none';
  ir('p-fin');
}
function votar(btn,emoji,nombre){
  if(estado.votoHecho)return;
  estado.votoHecho=true;
  btn.classList.add('elegido');
  document.querySelectorAll('.voto').forEach(b=>b.disabled=true);
  estado.tokens++;
  pintarTokens();
  document.getElementById('fin-gracias').style.display='block';
  document.getElementById('btn-otro-viaje').style.display='block';
  toast('Viaje completado. Ganaste +1 token 🎟 — total: '+estado.tokens);
}
function reiniciar(){
  estado.modo=null;estado.linea=null;estado.abordo=false;
  const muro=document.getElementById('muro');
  muro.innerHTML='';delete muro.dataset.cargada;
  document.getElementById('ficha-bondi').classList.remove('abierta');
  document.getElementById('min-llegada').textContent='8';
  ir('p-modo');
}

/* ================= UTIL ================= */
function ahora(){const d=new Date();return p(d.getHours())+':'+p(d.getMinutes());}
function horaHaceMin(m){const d=new Date(Date.now()-m*60000);return p(d.getHours())+':'+p(d.getMinutes());}
function p(n){return String(n).padStart(2,'0');}

/* logo del header vuelve al inicio del flujo */
document.getElementById('logo-home').onclick=()=>{ if(estado.apodo) ir('p-modo'); };
