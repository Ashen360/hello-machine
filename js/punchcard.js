/* ============================================================
   01 — PUNCH CARD (Three.js)
============================================================ */
(function(){
  "use strict";
  const reduceMotion = ML.reduceMotion;
  const hasWebGL = ML.hasWebGL;
  const onScreenGate = ML.onScreenGate;
  const stage = document.getElementById('punchcard-stage');
  const TEXT = 'HELLO, MACHINE.';
  const COLS = TEXT.length, ROWS = 8;
  const punched = [];
  TEXT.split('').forEach((c,col)=>{
    c.charCodeAt(0).toString(2).padStart(ROWS,'0').split('').forEach((bit,row)=>{
      if(bit==='1') punched.push([col,row]);
    });
  });
  stage.setAttribute('role','img');
  stage.setAttribute('aria-label','A punched card. Each column is one character in binary, and together the holes spell HELLO, MACHINE.');
  if(!hasWebGL){
    stage.innerHTML = '<div id="punchcard-fallback"></div>';
    const fb = stage.querySelector('#punchcard-fallback');
    punched.forEach(([col,row])=>{
      const h=document.createElement('div'); h.className='hole';
      h.style.left = (6 + col*(84/(COLS-1)))+'%';
      h.style.top = (10 + row*(78/(ROWS-1)))+'%';
      fb.appendChild(h);
    });
    return;
  }
  let scene,camera,renderer,card,raf=null,active=false;
  let rotY=0.35, rotX=0.12, dragging=false, lastX=0,lastY=0, velY=0,velX=0;

  function init(){
    scene = new THREE.Scene();
    const w = stage.clientWidth, h = stage.clientHeight;
    camera = new THREE.PerspectiveCamera(32, w/h, 0.1, 100);
    camera.position.set(0,0,7);
    renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));
    renderer.setSize(w,h);
    stage.appendChild(renderer.domElement);

    const key = new THREE.DirectionalLight(0xfff2d9, 1.1); key.position.set(3,4,5); scene.add(key);
    const fill = new THREE.AmbientLight(0x6b5c3a, 0.7); scene.add(fill);

    const shape = new THREE.Shape();
    const cw=4.2, ch=2.5;
    shape.moveTo(-cw/2,-ch/2); shape.lineTo(cw/2,-ch/2); shape.lineTo(cw/2,ch/2-0.4);
    shape.lineTo(cw/2-0.4,ch/2); shape.lineTo(-cw/2,ch/2); shape.closePath();
    const x0=-cw/2+0.3, dx=(cw-0.78)/(COLS-1);
    const y0=ch/2-0.32, dy=(ch-0.64)/(ROWS-1);
    punched.forEach(([col,row])=>{
      const x=x0+col*dx, y=y0-row*dy;
      const hole = new THREE.Path();
      hole.absellipse(x,y,0.055,0.085,0,Math.PI*2,false,0);
      shape.holes.push(hole);
    });
    const geo = new THREE.ExtrudeGeometry(shape,{depth:0.06,bevelEnabled:true,bevelThickness:0.01,bevelSize:0.01,bevelSegments:1});
    geo.center();
    const mat = new THREE.MeshStandardMaterial({color:0xE6DCC2, roughness:0.85, metalness:0.02});
    card = new THREE.Mesh(geo,mat);
    scene.add(card);

    stage.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;});
    window.addEventListener('pointerup',()=>dragging=false);
    window.addEventListener('pointermove',e=>{
      if(!dragging) return;
      const dx=e.clientX-lastX, dy=e.clientY-lastY;
      velY = dx*0.005; velX=-dy*0.005;
      rotY+=velY; rotX=Math.max(-0.6,Math.min(0.6,rotX+velX));
      lastX=e.clientX; lastY=e.clientY;
    });
    stage.tabIndex = 0;
    stage.addEventListener('keydown',e=>{
      const k={ArrowLeft:[-0.03,0],ArrowRight:[0.03,0],ArrowUp:[0,-0.08],ArrowDown:[0,0.08]}[e.key];
      if(!k) return;
      e.preventDefault();
      velY = k[0]; rotX = Math.max(-0.6,Math.min(0.6,rotX+k[1]));
    });
    window.addEventListener('resize',()=>{
      const w2=stage.clientWidth,h2=stage.clientHeight;
      camera.aspect=w2/h2; camera.updateProjectionMatrix(); renderer.setSize(w2,h2);
    });
  }
  function loop(){
    if(!active) return;
    if(!dragging){ velY*=0.94; velX*=0.94; rotY+=velY*0.4+ (reduceMotion?0:0.0015); }
    card.rotation.y = rotY; card.rotation.x = rotX;
    renderer.render(scene,camera);
    raf = requestAnimationFrame(loop);
  }
  onScreenGate(stage, ()=>{
    if(!scene) init();
    if(!active){ active=true; loop(); }
  }, ()=>{ active=false; if(raf) cancelAnimationFrame(raf); });
})();
