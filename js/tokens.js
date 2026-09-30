/* ============================================================
   07 — TOKEN FIELD (Canvas2D, typography as AI)
============================================================ */
(function(){
  "use strict";
  const reduceMotion = ML.reduceMotion;
  const onScreenGate = ML.onScreenGate;
  const stage = document.getElementById('token-stage');
  const canvas = document.getElementById('token-canvas');
  const ctx = canvas.getContext('2d');
  const words = "the quick machine learns patterns hidden inside human language and begins to predict what comes next".split(' ');
  let particles=[], active=false, raf=null, t=0;
  function resize(){
    const dpr=Math.min(window.devicePixelRatio,1.6);
    canvas.width=stage.clientWidth*dpr; canvas.height=stage.clientHeight*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function build(){
    resize();
    const w=stage.clientWidth,h=stage.clientHeight;
    particles = words.map((word,i)=>({
      word,
      x: Math.random()*w, y: Math.random()*h,
      tx: (i%9)*(w/9)+30, ty: Math.floor(i/9)*46+h*0.42,
      vx:0, vy:0, size: 13+Math.random()*4,
      phase: Math.random()*Math.PI*2
    }));
  }
  window.addEventListener('resize', ()=>{ if(stage.clientWidth>0){ build(); } });
  function draw(){
    if(!active) return;
    t+=0.016;
    const w=stage.clientWidth,h=stage.clientHeight;
    ctx.clearRect(0,0,w,h);
    const style = getComputedStyle(document.body);
    const fg = style.getPropertyValue('--fg').trim();
    const accent = style.getPropertyValue('--accent').trim();
    ctx.font='500 13px "IBM Plex Mono", monospace';
    ctx.textBaseline='middle';
    const settle = Math.min(1, t/3.2);
    particles.forEach((p,i)=>{
      const x = p.x + (p.tx-p.x)*settle;
      const y = p.y + (p.ty-p.y)*settle + (reduceMotion?0:Math.sin(t*0.6+p.phase)*3*(1-settle*0.7));
      ctx.globalAlpha = 0.55+0.45*settle;
      ctx.fillStyle = i%7===0? accent: fg;
      ctx.fillText(p.word, x, y);
    });
    if(settle>=1){
      ctx.globalAlpha=1;
      ctx.strokeStyle = accent; ctx.globalAlpha=0.12;
      for(let i=0;i<particles.length-1;i+=3){
        ctx.beginPath();
        ctx.moveTo(particles[i].tx+20,particles[i].ty);
        ctx.lineTo(particles[i+1]? particles[i+1].tx-6:particles[i].tx, particles[i+1]?particles[i+1].ty:particles[i].ty);
        ctx.stroke();
      }
    }
    raf=requestAnimationFrame(draw);
  }
  onScreenGate(stage, ()=>{
    if(!particles.length) build();
    t=0; active=true; draw();
  }, ()=>{ active=false; if(raf) cancelAnimationFrame(raf); });
})();
