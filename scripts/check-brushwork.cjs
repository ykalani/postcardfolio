const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});
  try {
    const page = await browser.newPage();
    await page.goto((process.env.SCENE_URL||'http://127.0.0.1:5178')+'/credits.html');
    const result = await page.evaluate(async () => {
      const {paintBrushwork} = await import('./scenes/brush-painting.js');
      const width=37,height=23,pixels=new Uint8ClampedArray(width*height*4);
      for(let y=0;y<height;y++)for(let x=0;x<width;x++){
        const at=(y*width+x)*4;pixels.set(x<18?[190,90,40,255]:[40,100,175,255],at);
      }
      async function render(seed) {
        const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
        const ctx=canvas.getContext('2d');let strokes=0;
        ctx.drawImage=()=>{throw new Error('The painter must not blit a source image');};
        const stroke=ctx.stroke.bind(ctx);ctx.stroke=()=>{strokes++;stroke();};
        const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
        await paintBrushwork({ctx,pixels,width,height,random,angle:()=>.2,background:'#e0d6c4'});
        const rgba=ctx.getImageData(0,0,width,height).data;
        return {image:canvas.toDataURL(),strokes,opaque:Array.from(rgba).filter((_,i)=>i%4===3).every(a=>a===255)};
      }
      const first=await render(17),same=await render(17),different=await render(29);
      let rejected=false;
      try{await paintBrushwork({ctx:document.createElement('canvas').getContext('2d'),pixels,width:0,height,random:Math.random});}catch{rejected=true;}
      return {deterministic:first.image===same.image,varied:first.image!==different.image,strokes:first.strokes,opaque:first.opaque,rejected};
    });
    assert.ok(result.deterministic&&result.varied&&result.opaque&&result.rejected);
    assert.ok(result.strokes>25,'Artwork is reconstructed with brush strokes');
    console.log('Passed: seeded brush marks, partial edge cells, opaque underpainting, invalid input, and no source-image blitting.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
