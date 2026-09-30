/* ============================================================
   NAV + ERA TRACKING
============================================================ */
(function(){
  "use strict";
  const reduceMotion = ML.reduceMotion;
  const sections = [...document.querySelectorAll('main section, #final')];
  const labels = {ch01:'01 · Before Code',ch02:'02 · Machines Learn',ch03:'03 · We Invent Languages',
    ch04:'04 · The Personal Computer',ch05:'05 · The Web',ch06:'06 · Software Everywhere',
    ch07:'07 · Language Turns Around',final:'— · Your Turn'};
  const navEl = document.getElementById('nav');
  const eraEl = document.getElementById('era-label');
  const scan = document.getElementById('scanline');
  sections.forEach(s=>{
    const b=document.createElement('button');
    b.setAttribute('aria-label',labels[s.id]||s.id);
    b.addEventListener('click',()=>s.scrollIntoView({behavior: reduceMotion?'auto':'smooth'}));
    navEl.appendChild(b);
  });
  const dots=[...navEl.children];
  function applyEra(target){
    const era = target.getAttribute('data-era');
    document.body.setAttribute('data-era', era);
    eraEl.textContent = labels[target.id]||'';
    dots.forEach(d=>d.classList.remove('active'));
    dots[sections.indexOf(target)].classList.add('active');
    scan.classList.toggle('on', ['02','04'].includes(era));
    window.dispatchEvent(new CustomEvent('chapter-active',{detail:target.id}));
  }
  function track(){
    const vh = window.innerHeight;
    let best = null, bestVis = -1;
    sections.forEach(s=>{
      const r = s.getBoundingClientRect();
      const vis = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      if(vis > bestVis){ bestVis = vis; best = s; }
    });
    if(best) applyEra(best);
  }
  window.addEventListener('scroll', track, {passive:true});
  window.addEventListener('resize', track);
  track();
})();
