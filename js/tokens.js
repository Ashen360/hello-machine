/* ============================================================
   07 — TOKEN FIELD (Canvas2D, typography as AI)
   tap or arrow-key a word to see what comes next
============================================================ */
(function(){
  "use strict";
  const reduceMotion = ML.reduceMotion;
  const onScreenGate = ML.onScreenGate;
  const stage = document.getElementById('token-stage');
  const canvas = document.getElementById('token-canvas');
  const caption = document.getElementById('token-caption');
  const ctx = canvas.getContext('2d');
  const FONT = '500 13px "IBM Plex Mono", monospace';
  const words = "the quick machine learns patterns hidden inside human language and begins to predict what comes next".split(' ');
  let particles=[], active=false, raf=null, t=0, sel=-1;

  function resize(){
    const dpr=Math.min(window.devicePixelRatio,1.6);
    canvas.width=stage.clientWidth*dpr; canvas.height=stage.clientHeight*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function build(){
    resize();
    const w=stage.clientWidth,h=stage.clientHeight;
    const cols = Math.max(3, Math.min(9, Math.floor(w/112)));
    const rows = Math.ceil(words.length/cols);
    const top = h/2 - (rows-1)*23;
    ctx.font = FONT;
    particles = words.map((word,i)=>({
      word, width: ctx.measureText(word).width,
      x: Math.random()*w, y: Math.random()*h,
      tx: (i%cols)*(w/cols)+12, ty: Math.floor(i/cols)*46+top,
      cx:0, cy:0,
      phase: Math.random()*Math.PI*2
    }));
  }
  window.addEventListener('resize', ()=>{ if(stage.clientWidth>0){ build(); } });

  function describe(){
    if(sel<0){ caption.textContent='watch, or tap a word'; return; }
    const next = words[sel+1];
    caption.textContent = next
      ? '“'+words[sel]+'” → what comes next: “'+next+'”'
      : '“'+words[sel]+'” is the last token. The machine would predict the next one.';
  }
  function select(i){ sel = i; describe(); if(!active) draw(); }

  function draw(){
    t+=0.016;
    const w=stage.clientWidth,h=stage.clientHeight;
    ctx.clearRect(0,0,w,h);
    const style = getComputedStyle(document.body);
    const fg = style.getPropertyValue('--fg').trim();
    const accent = style.getPropertyValue('--accent').trim();
    ctx.font=FONT;
    ctx.textBaseline='middle';
    const settle = reduceMotion ? 1 : Math.min(1, t/3.2);
    particles.forEach(p=>{
      p.cx = p.x + (p.tx-p.x)*settle;
      p.cy = p.y + (p.ty-p.y)*settle + (reduceMotion?0:Math.sin(t*0.6+p.phase)*3*(1-settle*0.7));
    });
    if(settle>=1 && sel<0){
      ctx.strokeStyle = accent; ctx.globalAlpha=0.12; ctx.lineWidth=1;
      for(let i=0;i<particles.length-1;i+=3){
        const a=particles[i], b=particles[i+1];
        ctx.beginPath(); ctx.moveTo(a.cx+a.width+6,a.cy); ctx.lineTo(b.cx-6,b.cy); ctx.stroke();
      }
    }
    if(sel>=0){
      const s=particles[sel];
      [sel-1, sel+1].forEach((j,k)=>{
        const o=particles[j]; if(!o) return;
        ctx.globalAlpha = k ? 0.9 : 0.35;
        ctx.strokeStyle = accent; ctx.lineWidth = k ? 1.5 : 1;
        const sameRow = Math.abs(o.cy-s.cy) < 8;
        const sx = sameRow ? (k ? s.cx+s.width+8 : s.cx-8) : s.cx+s.width/2;
        const ox = sameRow ? (k ? o.cx-8 : o.cx+o.width+8) : o.cx+o.width/2;
        const sy = sameRow ? s.cy : s.cy+(o.cy>s.cy?14:-14);
        const oy = sameRow ? o.cy : o.cy+(o.cy>s.cy?-14:14);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ox, oy); ctx.stroke();
      });
      ctx.globalAlpha=1; ctx.strokeStyle=accent; ctx.lineWidth=1;
      ctx.strokeRect(s.cx-6, s.cy-12, s.width+12, 24);
    }
    particles.forEach((p,i)=>{
      const near = sel<0 || Math.abs(i-sel)<=1;
      ctx.globalAlpha = sel<0 ? 0.55+0.45*settle : (near ? 1 : 0.28);
      ctx.fillStyle = (sel<0 ? i%7===0 : i===sel+1 || i===sel) ? accent : fg;
      ctx.fillText(p.word, p.cx, p.cy);
    });
    ctx.globalAlpha=1;
    if(active) raf=requestAnimationFrame(draw);
  }

  function hit(clientX, clientY){
    const r = canvas.getBoundingClientRect();
    const x = clientX-r.left, y = clientY-r.top;
    return particles.findIndex(p=> x>=p.cx-8 && x<=p.cx+p.width+8 && y>=p.cy-14 && y<=p.cy+14);
  }
  canvas.addEventListener('pointerdown', e=>{ select(hit(e.clientX,e.clientY)); });
  canvas.addEventListener('pointermove', e=>{ canvas.style.cursor = hit(e.clientX,e.clientY)>=0 ? 'pointer' : 'default'; });
  canvas.addEventListener('keydown', e=>{
    if(e.key==='ArrowRight' || e.key==='ArrowDown'){ e.preventDefault(); select(Math.min(words.length-1, sel+1)); }
    else if(e.key==='ArrowLeft' || e.key==='ArrowUp'){ e.preventDefault(); select(Math.max(0, sel<0 ? 0 : sel-1)); }
    else if(e.key==='Escape'){ select(-1); }
  });

  onScreenGate(stage, ()=>{
    if(!particles.length) build();
    t=0; active=true; if(raf) cancelAnimationFrame(raf); draw();
  }, ()=>{ active=false; if(raf) cancelAnimationFrame(raf); });
})();
