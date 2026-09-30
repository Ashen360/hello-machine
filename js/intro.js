/* ============================================================
   INTRO SEQUENCE
============================================================ */
(function(){
  "use strict";
  const el = document.getElementById('intro-typed');
  const cue = document.getElementById('intro-cue');
  const wrap = document.getElementById('intro');
  const lines = ['_','HELLO, MACHINE.'];
  let li=0, ci=0;
  function typeStep(){
    if(li===0){ el.textContent='_'; li=1; ci=0; setTimeout(typeStep, 900); return; }
    const target = lines[1];
    if(ci<=target.length){ el.textContent = target.slice(0,ci); ci++; setTimeout(typeStep, 55); }
    else { cue.classList.add('on'); }
  }
  setTimeout(typeStep, 400);
  let dismissed=false;
  function dismiss(){
    if(dismissed) return; dismissed=true;
    wrap.classList.add('hide');
    document.getElementById('nav').classList.add('on');
    document.getElementById('era-label').classList.add('on');
    window.removeEventListener('keydown',dismiss);
    window.removeEventListener('wheel',dismiss);
    window.removeEventListener('touchstart',dismiss);
  }
  window.addEventListener('keydown',dismiss);
  window.addEventListener('wheel',dismiss,{passive:true});
  window.addEventListener('touchstart',dismiss,{passive:true});
})();
