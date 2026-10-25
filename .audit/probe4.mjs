import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--disable-gpu'],defaultViewport:{width:1440,height:900}});
const p = await b.newPage();
await p.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200)); await p.keyboard.press('Escape'); await new Promise(r=>setTimeout(r,4500));
const out = await p.evaluate(()=>{
  const els=document.elementsFromPoint(300,400).map(e=>({t:e.tagName,c:(e.className.baseVal!==undefined?e.className.baseVal:e.className||'').toString().slice(0,50),z:getComputedStyle(e).zIndex,pos:getComputedStyle(e).position,op:getComputedStyle(e).opacity}));
  const cvs=[...document.querySelectorAll('canvas')].map(cv=>{const r=cv.getBoundingClientRect();let px='n/a';try{const g=cv.getContext('2d');if(g){const d=g.getImageData(Math.floor(cv.width/2),Math.floor(cv.height/2),1,1).data;px=`${d[0]},${d[1]},${d[2]},${d[3]}`;}else{px='no-2d-ctx';}}catch(e){px='ERR '+e.message}return {cls:cv.className,w:cv.width,h:cv.height,rect:[r.x|0,r.y|0,r.width|0,r.height|0],px};});
  // hide canvases one at a time and sample the screenshot? do a cheap test: check which overlay is white
  return {els,cvs};
});
console.log(JSON.stringify(out,null,1));
await b.close();
