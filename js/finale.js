/* ============================================================
   FINAL — visitor's words become the artifact
============================================================ */
(function(){
  "use strict";
  const input = document.getElementById('final-input');
  const wrap = document.getElementById('final-canvas-wrap');
  const canvas = document.getElementById('final-canvas');
  const closeLine = document.getElementById('final-close');
  const ctx = canvas.getContext('2d');
  function resize(){
    const dpr=Math.min(window.devicePixelRatio,1.6);
    canvas.width = wrap.clientWidth*dpr; canvas.height=280*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  input.addEventListener('keydown',e=>{
    if(e.key!=='Enter' || !input.value.trim()) return;
    const text = input.value.trim();
    input.blur();
    window.dispatchEvent(new CustomEvent('ml:final',{detail:{text}}));
    wrap.classList.add('show');
    setTimeout(()=>{ resize(); animate(text); },820);
  });
  function animate(text){
    const letters = text.split('');
    const tokens = text.split(/\s+/);
    const w = wrap.clientWidth, h=280;
    let start=null;
    function frame(ts){
      if(!start) start=ts;
      const el = (ts-start)/1000;
      ctx.clearRect(0,0,w,h);
      const stage = Math.min(4, Math.floor(el/1.15));
      const localT = (el%1.15)/1.15;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      if(stage===0){
        ctx.font='400 22px "IBM Plex Mono", monospace';
        ctx.fillStyle='#F2F0EA';
        ctx.globalAlpha=1;
        ctx.fillText(letters.join(' '), w/2, h/2);
      } else if(stage===1){
        ctx.font='400 15px "IBM Plex Mono", monospace';
        tokens.forEach((tok,i)=>{
          const x = w/2 + (i-(tokens.length-1)/2)*70;
          ctx.fillStyle='#C9C4B4';
          ctx.fillText('['+tok+']', x, h/2);
        });
      } else if(stage===2){
        ctx.font='400 13px "IBM Plex Mono", monospace';
        ctx.fillStyle='#8a877e';
        ctx.fillText('vector( ' + tokens.map(()=>((Math.sin(text.length)*100)|0)).slice(0,1) + ' ... )', w/2, h/2-14);
        tokens.forEach((tok,i)=>{
          const x = w/2 + (i-(tokens.length-1)/2)*70;
          const y = h/2+16 + Math.sin(el*2+i)*6;
          ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fillStyle='#EDEDED'; ctx.fill();
        });
      } else {
        const alpha = Math.min(1, localT*1.6);
        ctx.globalAlpha=alpha;
        ctx.font='300 26px "Fraunces", serif';
        ctx.fillStyle='#F2F0EA';
        ctx.fillText(text, w/2, h/2);
        ctx.globalAlpha = alpha*0.5;
        ctx.font='400 11px "IBM Plex Mono", monospace';
        ctx.fillStyle='#7A7A7A';
      }
      if(el<5) requestAnimationFrame(frame);
      else { closeLine.classList.add('on'); }
    }
    requestAnimationFrame(frame);
  }
})();
