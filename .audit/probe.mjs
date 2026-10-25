import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--disable-gpu'],defaultViewport:{width:1440,height:900}});
const p = await b.newPage();
await p.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200)); await p.keyboard.press('Escape'); await new Promise(r=>setTimeout(r,4000));
const out = await p.evaluate(()=>{
  const cs=getComputedStyle(document.documentElement);
  const pick=(el)=>{const s=getComputedStyle(el);return {bg:s.backgroundColor,bgImage:s.backgroundImage.slice(0,80),color:s.color};};
  const q=(sel)=>{const el=document.querySelector(sel);return el?pick(el):null;};
  const vars={}; ['--navy','--navy-2','--ivory','--paper','--ink','--silver','--charcoal','--signal','--gold','--line','--muted','--green-deep','--display','--mono'].forEach(v=>vars[v]=cs.getPropertyValue(v).trim());
  return {
    vars,
    html:pick(document.documentElement), body:pick(document.body),
    site:q('.site'), hero:q('.hero'), work:q('.ec-work'), about:q('.ec-about'),
    siteClass:document.querySelector('.site').className,
    sheets:[...document.styleSheets].map(s=>s.href||'inline'),
    bgEl:(()=>{const e=document.querySelector('.hz-bg');return e?pick(e):'none'})(),
    hzGrain:q('.hz-grain'),
  };
});
console.log(JSON.stringify(out,null,1));
await b.close();
