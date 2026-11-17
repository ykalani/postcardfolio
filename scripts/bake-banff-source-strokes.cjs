const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch();
 try {
  const page=await browser.newPage();await page.goto(process.env.SCENE_URL||'http://127.0.0.1:5178');
  const results=await page.evaluate(async()=>{
   const {paintBrushwork}=await import('/scenes/brush-painting.js');
   async function image(url){const img=new Image();img.src=url;await img.decode();return img;}
   const results=[];
   for(const name of ['post','pika']) {
    const wood=name==='post',base=await image(`/assets/banff/${name}-brush-v3.webp`);
    const reference=await image(`/assets/banff/${wood?'wooden-post.jpg':'pika.webp'}`);
    const mask=await image(`/assets/banff/${name}-painted.webp`);
    const canvas=document.createElement('canvas');canvas.width=base.naturalWidth;canvas.height=base.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(base,0,0);
    const before=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const source=document.createElement('canvas');source.width=canvas.width;source.height=canvas.height;
    const sourceCtx=source.getContext('2d');
    const crop=wood?[922,134,256,140]:[280,325,800,550];
    sourceCtx.drawImage(reference,...crop,0,0,source.width,source.height);
    sourceCtx.globalCompositeOperation='destination-in';sourceCtx.drawImage(mask,0,0,source.width,source.height);
    const referencePixels=sourceCtx.getImageData(0,0,source.width,source.height).data;
    const pixels=new Uint8ClampedArray(before);
    for(let at=0;at<pixels.length;at+=4){
     const mix=referencePixels[at+3]>240?.3:0;
     const rgb=[0,1,2].map(j=>before[at+j]*(1-mix)+referencePixels[at+j]*mix);
     const light=rgb[0]*.3+rgb[1]*.55+rgb[2]*.15;
     pixels[at]=rgb[0]*.87+light*.035+6;
     pixels[at+1]=rgb[1]*.91+light*.035+8;
     pixels[at+2]=rgb[2]*.93+light*.035+10;
    }
    const strokes=document.createElement('canvas');strokes.width=canvas.width;strokes.height=canvas.height;
    let seed=5821;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
    await paintBrushwork({ctx:strokes.getContext('2d'),pixels,width:canvas.width,height:canvas.height,random,
     scale:wood?1.55:1.85,pigmentStep:24,
     angle:(x,y)=>wood?(y<canvas.height*.24?-.06:1.55):(x>canvas.width*.55?-.45:.12),
     skip(x,y){
      if(pixels[(y*canvas.width+x)*4+3]<240)return true;
      // Preserve only the tiny eye and nose accents; the rest uses the landscape's same bristle renderer.
      return !wood&&(((x-327)/12)**2+((y-92)/10)**2<1||((x-386)/10)**2+((y-148)/9)**2<1);
     }
    });
    ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=.94;ctx.drawImage(strokes,0,0);
    if(!wood){
     ctx.globalAlpha=.97;ctx.fillStyle='#171e1b';
     for(const [x,y,w,h] of [[327,95,14,13],[385,148,7,5]]){
      ctx.beginPath();ctx.moveTo(x-w*.5,y-h*.3);ctx.lineTo(x+w*.15,y-h*.5);
      ctx.lineTo(x+w*.5,y+h*.2);ctx.lineTo(x-w*.2,y+h*.5);ctx.closePath();ctx.fill();
     }
     ctx.strokeStyle='#242b27';ctx.lineWidth=3;ctx.lineCap='butt';
     for(const [x,y,dx,dy] of [[319,91,13,-1],[321,99,11,2],[325,87,6,2]]){
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke();
     }
    }
    const after=ctx.getImageData(0,0,canvas.width,canvas.height).data;let changed=0,alphaChanges=0;
    for(let at=0;at<after.length;at+=4){if(before[at+3]!==after[at+3])alphaChanges++;if(before[at]!==after[at]||before[at+1]!==after[at+1]||before[at+2]!==after[at+2])changed++;}
    results.push({name,changed,alphaChanges,url:canvas.toDataURL('image/webp',.94)});
   }
   return results;
  });
  for(const result of results){
   assert.equal(result.alphaChanges,0,'Source strokes preserve the generated cutout silhouette');
   assert.ok(result.changed>1000,'Reference brushwork visibly changes the cutout');
   fs.writeFileSync(`assets/banff/${result.name}-source-brush-v${result.name==='post'?6:7}.webp`,Buffer.from(result.url.split(',')[1],'base64'));
   console.log(`${result.name}: ${result.changed} pixels repainted with landscape brushwork; silhouette preserved`);
  }
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
