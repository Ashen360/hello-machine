/* ============================================================
   04 — MINI BASIC TERMINAL
   PRINT, LET, FOR/NEXT, REM, END, LIST, RUN, NEW, HELP
============================================================ */
(function(){
  "use strict";
  const wrap = document.getElementById('terminal-wrap');
  const out = document.getElementById('terminal-out');
  const input = document.getElementById('terminal-input');
  const program = {};
  const vars = {};
  const history = [];
  let hIndex = 0;
  const MAX_STEPS = 2000;

  function println(t=''){ out.textContent += '\n'+t; out.scrollTop = out.scrollHeight; }
  class BasicError extends Error {}
  const fail = msg => { throw new BasicError(msg); };

  /* ---- expressions: numbers, variables, + - * / and parentheses ---- */
  function evalExpr(src){
    const toks = src.match(/\d+(\.\d+)?|[A-Z][A-Z0-9]*|[-+*/()]|\S/gi) || [];
    let i = 0;
    const peek = () => toks[i];
    function atom(){
      const t = toks[i++];
      if(t===undefined) fail('SYNTAX');
      if(t==='('){ const v = sum(); if(toks[i++]!==')') fail('SYNTAX'); return v; }
      if(t==='-') return -atom();
      if(/^\d/.test(t)) return parseFloat(t);
      if(/^[A-Z]/i.test(t)) return vars[t.toUpperCase()] ?? 0;
      fail('SYNTAX');
    }
    function product(){
      let v = atom();
      while(peek()==='*' || peek()==='/'){
        const op = toks[i++], r = atom();
        if(op==='/' && r===0) fail('DIVISION BY ZERO');
        v = op==='*' ? v*r : v/r;
      }
      return v;
    }
    function sum(){
      let v = product();
      while(peek()==='+' || peek()==='-'){ const op = toks[i++]; const r = product(); v = op==='+' ? v+r : v-r; }
      return v;
    }
    const v = sum();
    if(i < toks.length) fail('SYNTAX');
    return Math.round(v*1e6)/1e6;
  }

  /* ---- PRINT "text";X,"more" ---- */
  function doPrint(args){
    let line = '', rest = args.trim();
    while(rest.length){
      let m;
      if((m = rest.match(/^"([^"]*)"/))){ line += m[1]; rest = rest.slice(m[0].length); }
      else {
        m = rest.match(/^[^;,]+/);
        line += String(evalExpr(m[0]));
        rest = rest.slice(m[0].length);
      }
      rest = rest.trim();
      if(rest[0]===';'){ rest = rest.slice(1).trim(); }
      else if(rest[0]===','){ line += '  '; rest = rest.slice(1).trim(); }
      else if(rest.length) fail('SYNTAX');
    }
    println(line);
  }

  /* ---- one statement; returns a jump target index or null ---- */
  function exec(stmt, ctx){
    const s = stmt.trim();
    let m;
    if(s==='' || /^REM\b/i.test(s)) return null;
    if(/^END$/i.test(s)) return Infinity;
    if((m = s.match(/^PRINT\b(.*)$/i))){ doPrint(m[1]); return null; }
    if((m = s.match(/^(?:LET\s+)?([A-Z][A-Z0-9]*)\s*=\s*(.+)$/i))){ vars[m[1].toUpperCase()] = evalExpr(m[2]); return null; }
    if((m = s.match(/^FOR\s+([A-Z][A-Z0-9]*)\s*=\s*(.+?)\s+TO\s+(.+?)(?:\s+STEP\s+(.+))?$/i))){
      if(!ctx) fail('FOR ONLY WORKS IN A PROGRAM');
      const v = m[1].toUpperCase();
      vars[v] = evalExpr(m[2]);
      ctx.loops.push({ v, to: evalExpr(m[3]), step: m[4] ? evalExpr(m[4]) : 1, body: ctx.pc + 1 });
      return null;
    }
    if((m = s.match(/^NEXT(?:\s+([A-Z][A-Z0-9]*))?$/i))){
      if(!ctx) fail('NEXT ONLY WORKS IN A PROGRAM');
      const loop = ctx.loops[ctx.loops.length-1];
      if(!loop || (m[1] && m[1].toUpperCase()!==loop.v)) fail('NEXT WITHOUT FOR');
      vars[loop.v] += loop.step;
      const going = loop.step >= 0 ? vars[loop.v] <= loop.to : vars[loop.v] >= loop.to;
      if(going) return loop.body;
      ctx.loops.pop();
      return null;
    }
    fail('SYNTAX');
  }

  function run(){
    const keys = Object.keys(program).map(Number).sort((a,b)=>a-b);
    const ctx = { pc: 0, loops: [] };
    let steps = 0;
    Object.keys(vars).forEach(k=>delete vars[k]);
    while(ctx.pc < keys.length){
      if(++steps > MAX_STEPS){ println('?BREAK — TOO MANY STEPS IN '+keys[ctx.pc]); return; }
      try{
        const jump = exec(program[keys[ctx.pc]], ctx);
        if(jump === Infinity) return;
        ctx.pc = jump === null ? ctx.pc + 1 : jump;
      }catch(err){
        if(!(err instanceof BasicError)) throw err;
        println('?'+err.message+' ERROR IN '+keys[ctx.pc]); return;
      }
    }
  }

  function command(line){
    const numbered = line.match(/^\s*(\d+)\s*(.*)$/);
    if(numbered){
      if(numbered[2].trim()==='') { delete program[numbered[1]]; }
      else { program[numbered[1]] = numbered[2]; }
      println('OK'); return;
    }
    const cmd = line.trim();
    if(cmd==='') return;
    if(/^LIST$/i.test(cmd)){
      const keys = Object.keys(program).map(Number).sort((a,b)=>a-b);
      if(!keys.length) println('(no program lines yet — try 10 PRINT "HI")');
      keys.forEach(k=>println(k+' '+program[k]));
    } else if(/^RUN$/i.test(cmd)){
      if(!Object.keys(program).length) println('(nothing to run — type a numbered line first)');
      run();
    } else if(/^NEW$/i.test(cmd)){
      Object.keys(program).forEach(k=>delete program[k]); println('OK');
    } else if(/^HELP$/i.test(cmd)){
      println('PRINT "text";X      — print text and numbers');
      println('X = 2 * (3 + 4)     — set a variable');
      println('10 FOR I=1 TO 3     — numbered lines build a program');
      println('20 PRINT I');
      println('30 NEXT I');
      println('LIST · RUN · NEW    — show, run or clear the program');
    } else {
      try{ exec(cmd, null); }
      catch(err){
        if(!(err instanceof BasicError)) throw err;
        println('?'+err.message+(err.message==='SYNTAX'?' ERROR — try HELP':''));
      }
    }
  }

  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      const v = input.value;
      println('> '+v);
      command(v);
      if(v.trim()) history.push(v);
      hIndex = history.length;
      input.value='';
      println('READY.');
    } else if(e.key==='ArrowUp' && history.length){
      e.preventDefault(); hIndex = Math.max(0,hIndex-1); input.value = history[hIndex];
    } else if(e.key==='ArrowDown' && history.length){
      e.preventDefault(); hIndex = Math.min(history.length,hIndex+1); input.value = history[hIndex] || '';
    }
  });
  wrap.addEventListener('click',()=>{ if(!window.getSelection().toString()) input.focus({preventScroll:true}); });
  document.querySelectorAll('.term-hints .cmd').forEach(b=>{
    b.addEventListener('click',()=>{ input.value = b.textContent; input.focus({preventScroll:true}); });
  });
})();
