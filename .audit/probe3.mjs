import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--disable-gpu'],defaultViewport:{width:1440,height:900}});
const p = await b.newPage();
await p.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,1200)); await p.keyboard.press('Escape'); await new Promise(r=>setTimeout(r,4500));
const shot = await p.screenshot({encoding:'base64'});
const avg = await p.evaluate(async (b64)=>{
  const img = new Image(); img.src='data:image/png;base64,'+b64;
  await img.decode();
  const c=document.createElement('canvas'); c.width=img.width;c.height=img.height;
  const g=c.getContext('2d'); g.drawImage(img,0,0);
  const px=(x,y)=>{const d=g.getImageData(x,y,1,1).data;return `${x},${y}: ${d[0]},${d[1]},${d[2]}`;};
  return {size:[img.width,img.height], samples:[px(300,400),px(60,300),px(720,60),px(1200,820),px(700,700)]};
}, shot);
console.log(JSON.stringify(avg,null,1));
await b.close();
