import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--disable-gpu'],defaultViewport:{width:1440,height:900}});
const p = await b.newPage();
await p.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200)); await p.keyboard.press('Escape'); await new Promise(r=>setTimeout(r,4500));
const out = await p.evaluate(()=>{
  const chain=(x,y)=>{const r=[];let el=document.elementFromPoint(x,y);while(el&&r.length<8){const s=getComputedStyle(el);r.push({tag:el.tagName,cls:(el.className&&el.className.baseVal!==undefined?el.className.baseVal:el.className||'').toString().slice(0,40),bg:s.backgroundColor,bgi:s.backgroundImage.slice(0,60),op:s.opacity,z:s.zIndex,pos:s.position});el=el.parentElement;}return r;};
  const broken=[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>({src:i.src,cls:i.className,rect:i.getBoundingClientRect().toJSON()}));
  const curtains=[...document.querySelectorAll('.hz-curtain,.hz-fx,.ec-intro-aura,.ec-wipe-ring')].map(e=>({cls:e.className,disp:getComputedStyle(e).display,op:getComputedStyle(e).opacity}));
  const rootRule=[...document.styleSheets].filter(s=>!s.href).map(s=>{try{return [...s.cssRules].filter(r=>r.selectorText===':root'||r.selectorText==='html').map(r=>r.cssText.slice(0,200))}catch(e){return ['ERR']}}).flat();
  return {at300_400:chain(300,400), at1100_250:chain(1100,250), broken, curtains, rootRule, bodyH:document.body.scrollHeight, htmlBg:getComputedStyle(document.documentElement).backgroundColor, rootBgVar:getComputedStyle(document.documentElement).getPropertyValue('--paper')};
});
console.log(JSON.stringify(out,null,1));
await b.close();
