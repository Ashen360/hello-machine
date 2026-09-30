/* ============================================================
   05 — NETWORK (Three.js)
============================================================ */
(function(){
  "use strict";
  const reduceMotion = ML.reduceMotion;
  const hasWebGL = ML.hasWebGL;
  const onScreenGate = ML.onScreenGate;
  const stage = document.getElementById('network-stage');
  if(!hasWebGL){
    stage.style.display='none';
    document.getElementById('network-zoom').hidden = true;
    document.querySelector('#network-caption .how').textContent = 'the 3D network needs WebGL, which this browser has turned off';
    return;
  }
  let scene,camera,renderer,group,raf=null,active=false;
  let rotY=0, rotX=-0.15, dragging=false,lastX=0,lastY=0,velY=0.0009,velX=0;
  let camZ=42;

  function makeNode(type, pos){
    let geo;
    if(type==='doc') geo=new THREE.PlaneGeometry(0.55,0.75);
    else if(type==='server') geo=new THREE.BoxGeometry(0.4,0.4,0.4);
    else geo=new THREE.SphereGeometry(0.16,10,10);
    const colors = {doc:0x2B4C7E, server:0x333333, person:0x9C7A3C};
    const mat = new THREE.MeshStandardMaterial({color:colors[type], roughness:0.6, metalness:0.1, side:THREE.DoubleSide});
    const m = new THREE.Mesh(geo,mat);
    m.position.set(...pos);
    m.userData.type=type;
    return m;
  }

  function init(){
    scene = new THREE.Scene();
    const w=stage.clientWidth, h=stage.clientHeight;
    camera = new THREE.PerspectiveCamera(38, w/h, 0.1, 300);
    renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));
    renderer.setSize(w,h);
    stage.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff,0.7));
    const dl = new THREE.DirectionalLight(0xffffff,0.7); dl.position.set(4,6,8); scene.add(dl);

    group = new THREE.Group(); scene.add(group);
    group.position.set(offsetX(), -1.5, 0);
    const nodes=[]; const N=90;
    for(let i=0;i<N;i++){
      const r = 14+Math.random()*10;
      const theta = Math.random()*Math.PI*2, phi=Math.acos((Math.random()*2)-1);
      const pos=[r*Math.sin(phi)*Math.cos(theta), r*Math.sin(phi)*Math.sin(theta)*0.6, r*Math.cos(phi)];
      const type = Math.random()<0.55?'doc':(Math.random()<0.7?'server':'person');
      const n = makeNode(type,pos);
      group.add(n); nodes.push(n);
    }
    const lineMat = new THREE.LineBasicMaterial({color:0x999999, transparent:true, opacity:0.28});
    const linePositions=[];
    nodes.forEach((n,i)=>{
      const links = 1+Math.floor(Math.random()*2);
      for(let l=0;l<links;l++){
        const other = nodes[Math.floor(Math.random()*nodes.length)];
        if(other!==n){
          linePositions.push(n.position.x,n.position.y,n.position.z, other.position.x,other.position.y,other.position.z);
        }
      }
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions,3));
    const lines = new THREE.LineSegments(lineGeo,lineMat);
    group.add(lines);
    camera.position.set(0,0,camZ);

    const pointers = new Map();
    let pinchDist = 0;
    const spread = () => { const [a,b] = [...pointers.values()]; return Math.hypot(a.x-b.x, a.y-b.y); };
    stage.addEventListener('pointerdown',e=>{
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.size===2){ dragging=false; pinchDist=spread(); return; }
      dragging=true; lastX=e.clientX; lastY=e.clientY;
    });
    const release = e=>{ pointers.delete(e.pointerId); if(pointers.size<2) pinchDist=0; if(!pointers.size) dragging=false; };
    window.addEventListener('pointerup',release);
    window.addEventListener('pointercancel',release);
    window.addEventListener('pointermove',e=>{
      if(pointers.has(e.pointerId)) pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.size===2 && pinchDist){
        const d=spread(); zoomBy((pinchDist-d)*0.06); pinchDist=d; return;
      }
      if(!dragging) return;
      const dx=e.clientX-lastX, dy=e.clientY-lastY;
      velY=dx*0.004; velX=dy*0.003;
      rotY+=velY; rotX=Math.max(-1,Math.min(0.4,rotX+velX));
      lastX=e.clientX; lastY=e.clientY;
    });
    stage.addEventListener('wheel',e=>{
      if(!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      zoomBy(e.deltaY*0.02);
    },{passive:false});
    stage.addEventListener('keydown',e=>{
      const turn={ArrowLeft:[-0.02,0],ArrowRight:[0.02,0],ArrowUp:[0,-0.08],ArrowDown:[0,0.08]}[e.key];
      if(turn){ e.preventDefault(); velY=turn[0]; rotX=Math.max(-1,Math.min(0.4,rotX+turn[1])); }
      if(e.key==='+' || e.key==='='){ e.preventDefault(); zoomBy(-8); }
      if(e.key==='-' || e.key==='_'){ e.preventDefault(); zoomBy(8); }
    });
    window.addEventListener('resize',()=>{
      const w2=stage.clientWidth,h2=stage.clientHeight;
      camera.aspect=w2/h2; camera.updateProjectionMatrix(); renderer.setSize(w2,h2);
      group.position.x = offsetX();
    });
  }
  function offsetX(){ return stage.clientWidth > 820 ? 6 : 0; }
  function zoomBy(d){ camZ = Math.max(6, Math.min(50, camZ + d)); }
  document.querySelectorAll('#network-zoom button').forEach(b=>{
    b.addEventListener('click',()=>zoomBy(-8*Number(b.dataset.z)));
  });
  function loop(){
    if(!active) return;
    if(!dragging){ velY*=0.95; velX*=0.95; rotY+=velY+(reduceMotion?0:0.0006); }
    group.rotation.y=rotY; group.rotation.x=rotX;
    camera.position.z += (camZ-camera.position.z)*0.08;
    renderer.render(scene,camera);
    raf=requestAnimationFrame(loop);
  }
  onScreenGate(stage, ()=>{ if(!scene) init(); if(!active){active=true; loop();} }, ()=>{ active=false; if(raf) cancelAnimationFrame(raf); });
})();
