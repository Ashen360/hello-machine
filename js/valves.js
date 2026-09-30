/* ============================================================
   02 — VALVES: eight tubes, one byte of memory
============================================================ */
(function(){
  "use strict";
  const rack = document.getElementById('valve-rack');
  const binEl = document.getElementById('valve-bin');
  const decEl = document.getElementById('valve-dec');
  const chrEl = document.getElementById('valve-chr');
  const goal = document.getElementById('valve-goal');
  const TARGET = 72;
  const on = new Array(8).fill(false);

  for(let i=0;i<8;i++){
    const weight = 1 << (7-i);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'valve';
    b.setAttribute('aria-pressed','false');
    b.setAttribute('aria-label','Bit worth '+weight);
    b.innerHTML = '<span class="tube"></span><span class="w">'+weight+'</span>';
    b.addEventListener('click',()=>{ on[i]=!on[i]; update(); });
    rack.appendChild(b);
  }
  const buttons = [...rack.children];

  function update(){
    const bin = on.map(x=>x?'1':'0').join('');
    const dec = parseInt(bin,2);
    const chr = dec>=32 && dec<=126 ? String.fromCharCode(dec) : '·';
    const solved = dec===TARGET;
    buttons.forEach((b,i)=>{ b.classList.toggle('on',on[i]); b.setAttribute('aria-pressed',String(on[i])); });
    binEl.textContent = bin; decEl.textContent = dec; chrEl.textContent = chr;
    rack.parentElement.classList.toggle('solved', solved);
    goal.innerHTML = solved
      ? '<span class="cmd">01001000</span> is <span class="cmd">H</span>. The machine remembers.'
      : 'switch the valves to spell <span class="cmd">H</span>';
    window.dispatchEvent(new CustomEvent('ml:valves',{detail:{bin, dec, chr, solved}}));
  }
  update();
})();
