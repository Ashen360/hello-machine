/* ============================================================
   03 — THE LADDER (signature interaction)
============================================================ */
(function(){
  "use strict";
  const steps = [
    {label:'card', code:'| o . . . . |\n| . o . . . |\n| . . o o . |\n(binary punched as holes)'},
    {label:'binary', code:'01001000 01000101\n01001100 01001100 01001111'},
    {label:'assembly', code:'MOV AX, MSG\nMOV AH, 09h\nINT 21h'},
    {label:'fortran', code:'      WRITE(6,10)\n   10 FORMAT("HELLO")'},
    {label:'basic', code:'10 PRINT "HELLO"\n20 END'},
    {label:'c', code:'printf("HELLO");'},
    {label:'python', code:'print("HELLO")'},
    {label:'javascript', code:'console.log("HELLO")'}
  ];
  const display = document.getElementById('ladder-display');
  const fill = document.getElementById('ladder-fill');
  const handle = document.getElementById('ladder-handle');
  const track = document.getElementById('ladder-track');
  const labelsEl = document.getElementById('ladder-labels');
  steps.forEach((s,i)=>{
    const span=document.createElement('span');
    span.textContent=s.label; span.dataset.i=i; span.setAttribute('aria-hidden','true');
    span.addEventListener('click',()=>setStep(i));
    labelsEl.appendChild(span);
  });
  let current=-1;
  function setStep(i){
    i=Math.max(0,Math.min(steps.length-1,i));
    if(i===current) return;
    current=i;
    const pct = i/(steps.length-1)*100;
    fill.style.width=pct+'%'; handle.style.left=pct+'%';
    handle.setAttribute('aria-valuenow',i);
    handle.setAttribute('aria-valuetext',steps[i].label);
    window.dispatchEvent(new CustomEvent('ml:ladder',{detail:{label:steps[i].label, code:steps[i].code}}));
    display.style.opacity=0;
    setTimeout(()=>{ display.textContent = steps[i].code; display.style.opacity=1; },120);
    [...labelsEl.children].forEach((s,si)=>s.classList.toggle('active',si===i));
  }
  display.style.transition='opacity .18s ease';
  setStep(0);
  let dragging=false;
  function posToStep(clientX){
    const r=track.getBoundingClientRect();
    const pct=Math.max(0,Math.min(1,(clientX-r.left)/r.width));
    return Math.round(pct*(steps.length-1));
  }
  handle.addEventListener('pointerdown',()=>dragging=true);
  track.addEventListener('pointerdown',e=>{dragging=true; setStep(posToStep(e.clientX));});
  window.addEventListener('pointerup',()=>dragging=false);
  window.addEventListener('pointermove',e=>{ if(dragging) setStep(posToStep(e.clientX)); });
  handle.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight' || e.key==='ArrowUp'){ e.preventDefault(); setStep(current+1); }
    if(e.key==='ArrowLeft' || e.key==='ArrowDown'){ e.preventDefault(); setStep(current-1); }
    if(e.key==='Home'){ e.preventDefault(); setStep(0); }
    if(e.key==='End'){ e.preventDefault(); setStep(steps.length-1); }
  });
})();
