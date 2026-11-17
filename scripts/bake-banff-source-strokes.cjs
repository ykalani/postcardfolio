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
    const pixels=sourceCtx.getImageData(0,0,source.width,source.height).data;
    const strokes=document.createElement('canvas');strokes.width=canvas.width;strokes.height=canvas.height;
    let seed=5821;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
    await paintBrushwork({ctx:strokes.getContext('2d'),pixels,width:canvas.width,height:canvas.height,random,
     scale:wood?1.25:.95,pigmentStep:24,
     angle:(x,y)=>wood?(y<canvas.height*.24?-.06:1.55):(x>canvas.width*.55?-.45:.12),
     skip(x,y){
      if(pixels[(y*canvas.width+x)*4+3]<240)return true;
      // Keep the generated eye, nose and paws readable beneath the source-colored body strokes.
      return !wood&&((x>canvas.width*.72&&y<canvas.height*.67)||y>canvas.height*.92);
     }
    });
    ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=wood?.48:.6;ctx.drawImage(strokes,0,0);
    const after=ctx.getImageData(0,0,canvas.width,canvas.height).data;let changed=0,alphaChanges=0;
    for(let at=0;at<after.length;at+=4){if(before[at+3]!==after[at+3])alphaChanges++;if(before[at]!==after[at]||before[at+1]!==after[at+1]||before[at+2]!==after[at+2])changed++;}
    results.push({name,changed,alphaChanges,url:canvas.toDataURL('image/webp',.94)});
   }
   return results;
  });
  for(const result of results){
   assert.equal(result.alphaChanges,0,'Source strokes preserve the generated cutout silhouette');
   assert.ok(result.changed>1000,'Reference brushwork visibly changes the cutout');
   fs.writeFileSync(`assets/banff/${result.name}-source-brush-v4.webp`,Buffer.from(result.url.split(',')[1],'base64'));
   console.log(`${result.name}: ${result.changed} pixels repainted; silhouette preserved`);
  }
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
