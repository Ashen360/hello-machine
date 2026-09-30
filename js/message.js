/* ============================================================
   THE MESSAGE — one sentence, re-encoded for every era
============================================================ */
(function(){
  "use strict";
  const box = document.getElementById('message');
  const out = document.getElementById('message-v');
  const WORD = 'HELLO';
  const bits = c => c.charCodeAt(0).toString(2).padStart(8,'0');
  const binary = WORD.split('').map(bits).join(' ');

  function holes(){
    const cols = WORD.split('').map(c=>{
      const b = bits(c);
      return '<span class="msg-col">' + b.split('').map(x=>'<i class="'+(x==='1'?'on':'')+'"></i>').join('') + '</span>';
    }).join('');
    return '<span class="msg-card">' + cols + '</span>';
  }
  function esc(t){ return t.replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  const state = { ladder:null, valves:null, final:null };
  let current = null;

  const views = {
    ch01: ()=> holes(),
    ch02: ()=> state.valves
      ? esc(state.valves.bin + ' → ' + state.valves.chr)
      : binary,
    ch03: ()=> state.ladder
      ? (state.ladder.label==='card' ? holes() : '<b>'+esc(state.ladder.label)+'</b> '+esc(state.ladder.code.replace(/\s*\n\s*/g,' ; ')))
      : binary,
    ch04: ()=> '10 PRINT "HELLO"',
    ch05: ()=> esc('<h1>HELLO</h1>'),
    ch06: ()=> esc('GET /hello → 200 OK'),
    ch07: ()=> '[HELLO] [,] [MACHINE] [.]',
    final: ()=> state.final ? esc(state.final) : '<em>your words</em>'
  };

  function render(){
    const view = views[current];
    box.classList.toggle('empty', !view);
    if(!view) return;
    out.innerHTML = view();
    box.classList.toggle('lit', current==='ch02' && !!(state.valves && state.valves.solved));
  }

  window.addEventListener('chapter-active', e=>{ if(e.detail!==current){ current=e.detail; render(); } });
  window.addEventListener('ml:ladder', e=>{ state.ladder=e.detail; if(current==='ch03') render(); });
  window.addEventListener('ml:valves', e=>{ state.valves=e.detail; if(current==='ch02') render(); });
  window.addEventListener('ml:final', e=>{ state.final=e.detail.text; if(current==='final') render(); });
})();
