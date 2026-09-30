/* ============================================================
   01 — PUNCH CARD (Three.js)
============================================================ */
(function(){
  "use strict";
  const reduceMotion = ML.reduceMotion;
  const hasWebGL = ML.hasWebGL;
  const onScreenGate = ML.onScreenGate;
  const stage = document.getElementById('punchcard-stage');
  if(!hasWebGL){
    stage.innerHTML = '<div id="punchcard-fallback"></div>';
    const fb = stage.querySelector('#punchcard-fallback');
    for(let i=0;i<24;i++){
      const h=document.createElement('div'); h.className='hole';
      h.style.left = (8+ (i%12)*7.5 + (Math.random()*1.4))+'%';
      h.style.top = (20 + Math.floor(i/12)*40 + Math.random()*6)+'%';
      if(Math.random()>0.4) fb.appendChild(h);
    }
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
    const holePositions=[];
    for(let row=0; row<4; row++){
      for(let col=0; col<11; col++){
        if(Math.random()<0.42){
          const x=-cw/2+0.35+col*0.34+(Math.random()-0.5)*0.03;
          const y=ch/2-0.45-row*0.5+(Math.random()-0.5)*0.03;
          holePositions.push([x,y]);
        }
      }
    }
    holePositions.forEach(([x,y])=>{
      const hole = new THREE.Path();
      hole.absellipse(x,y,0.075,0.11,0,Math.PI*2,false,0);
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
