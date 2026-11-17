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
    // Lay distinct opaque marks last so downscaling cannot blend away the brushwork.
    let boldMarks=0;
    const gap=wood?30:23;
    for(let gy=12;gy<canvas.height;gy+=gap)for(let gx=12;gx<canvas.width;gx+=gap){
     const x=Math.min(canvas.width-1,Math.max(0,gx+(random()-.5)*gap)),y=Math.min(canvas.height-1,Math.max(0,gy+(random()-.5)*gap));
     const at=((y|0)*canvas.width+(x|0))*4;
     if(pixels[at+3]<240||before[at+3]<240)continue;
     if(!wood&&((x>canvas.width*.72&&y<canvas.height*.67)||y>canvas.height*.92))continue;
     const shift=random()>.5?32:-26;
     const rgb=[pixels[at],pixels[at+1],pixels[at+2]].map(v=>Math.max(0,Math.min(255,Math.round(v/28)*28+shift)));
     const length=(wood?50:34)+random()*(wood?38:30),breadth=(wood?12:8)+random()*10;
     const direction=(wood?(y<canvas.height*.24?-.06:1.55):(x>canvas.width*.55?-.45:.12))+(random()-.5)*.5;
     ctx.save();ctx.translate(x,y);ctx.rotate(direction);ctx.globalAlpha=.96;
     ctx.fillStyle=`rgb(${rgb.join(',')})`;
     ctx.beginPath();ctx.moveTo(-length*.5,-breadth*.3);ctx.lineTo(-length*.36,-breadth*.5);
     ctx.lineTo(length*.44,-breadth*.42);ctx.lineTo(length*.5,-breadth*.12);
     ctx.lineTo(length*.37,breadth*.1);ctx.lineTo(length*.47,breadth*.38);
     ctx.lineTo(-length*.42,breadth*.5);ctx.lineTo(-length*.35,breadth*.13);ctx.closePath();ctx.fill();
     ctx.strokeStyle=`rgb(${rgb.map(v=>Math.min(255,v+22)).join(',')})`;ctx.lineWidth=breadth*.09;ctx.globalAlpha=.75;
     for(let i=0;i<4;i++){
      const offset=(i/3-.5)*breadth*.75;
      ctx.beginPath();ctx.moveTo(-length*(.3+random()*.15),offset);
      ctx.lineTo(length*(.25+random()*.2),offset+(random()-.5)*breadth*.12);ctx.stroke();
     }
     ctx.restore();boldMarks++;
    }
    const after=ctx.getImageData(0,0,canvas.width,canvas.height).data;let changed=0,alphaChanges=0;
    for(let at=0;at<after.length;at+=4){if(before[at+3]!==after[at+3])alphaChanges++;if(before[at]!==after[at]||before[at+1]!==after[at+1]||before[at+2]!==after[at+2])changed++;}
    results.push({name,changed,alphaChanges,boldMarks,url:canvas.toDataURL('image/webp',.94)});
   }
   return results;
  });
  for(const result of results){
   assert.equal(result.alphaChanges,0,'Source strokes preserve the generated cutout silhouette');
   assert.ok(result.changed>1000,'Reference brushwork visibly changes the cutout');
   assert.ok(result.boldMarks>70,'Bold strokes remain visible at display size');
   fs.writeFileSync(`assets/banff/${result.name}-source-brush-v5.webp`,Buffer.from(result.url.split(',')[1],'base64'));
   console.log(`${result.name}: ${result.boldMarks} bold marks; ${result.changed} pixels repainted; silhouette preserved`);
  }
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
