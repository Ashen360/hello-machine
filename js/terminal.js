/* ============================================================
   04 — MINI BASIC TERMINAL
============================================================ */
(function(){
  "use strict";
  const out = document.getElementById('terminal-out');
  const input = document.getElementById('terminal-input');
  const program = {};
  function println(t=''){ out.textContent += '\n'+t; out.parentElement.scrollTop=out.parentElement.scrollHeight; }
  function run(line){
    const numMatch = line.match(/^(\d+)\s+(.*)$/);
    if(numMatch){ program[numMatch[1]] = numMatch[2]; println('OK'); return; }
    const cmd = line.trim();
    if(/^PRINT\s+"(.*)"$/i.test(cmd)){
      println(cmd.match(/^PRINT\s+"(.*)"$/i)[1]);
    } else if(/^LIST$/i.test(cmd)){
      const keys = Object.keys(program).sort((a,b)=>a-b);
      if(!keys.length) println('(no program lines yet — try 10 PRINT "HI")');
      keys.forEach(k=>println(k+' '+program[k]));
    } else if(/^RUN$/i.test(cmd)){
      const keys = Object.keys(program).sort((a,b)=>a-b);
      keys.forEach(k=>{
        const l=program[k];
        const p=l.match(/^PRINT\s+"(.*)"$/i);
        if(p) println(p[1]); else println('?SYNTAX ERROR AT '+k);
      });
    } else if(/^HELP$/i.test(cmd)){
      println('PRINT "text"   — print text');
      println('10 PRINT "hi"  — add a numbered program line');
      println('LIST           — show your program');
      println('RUN            — run your program');
      println('NEW            — clear program');
    } else if(/^NEW$/i.test(cmd)){
      Object.keys(program).forEach(k=>delete program[k]); println('OK');
    } else if(cmd===''){
      /* noop */
    } else {
      println('?SYNTAX ERROR — try HELP');
    }
  }
  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      println('> '+input.value);
      run(input.value);
      input.value='';
      println('READY.');
    }
  });
})();
