const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch();try{const page=await browser.newPage();await page.goto(process.env.SCENE_URL||'http://127.0.0.1:5178');
const data=await page.evaluate(async()=>{
 const{paintBrushwork}=await import('/scenes/brush-painting.js');
 async function paint(url,wood){
  const image=new Image();image.src=url;await image.decode();
  const source=document.createElement('canvas');const c=source.getContext('2d',{willReadFrequently:true});
  if(wood){source.width=280;source.height=153;c.drawImage(image,922,134,256,140,0,0,280,153);
   c.globalCompositeOperation='destination-in';c.beginPath();[[8,47],[55,25],[154,17],[249,49],[251,120],[245,130],[251,153],[8,153]].forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
  }else{source.width=420;source.height=290;c.drawImage(image,280,325,800,550,0,0,420,290);
   c.globalCompositeOperation='destination-in';c.beginPath();
   const outline=[[298,833],[287,750],[288,673],[308,600],[344,555],[395,524],[454,493],[530,474],[599,467],[662,479],[670,432],[663,408],[671,385],[698,367],[727,360],[757,371],[784,386],[799,352],[815,335],[840,337],[868,352],[884,378],[897,395],[934,423],[965,447],[990,478],[1012,512],[1034,546],[1052,574],[1052,594],[1035,616],[1011,631],[990,642],[972,665],[949,691],[925,729],[904,768],[892,801],[921,817],[939,833],[925,843],[875,841],[858,836],[839,844],[812,840],[790,836],[777,845],[742,848],[700,844],[665,836],[633,843],[580,838],[521,843],[466,842],[409,839],[353,842],[315,839]];
   outline.forEach(([x,y],i)=>i?c.lineTo((x-280)*420/800,(y-325)*290/550):c.moveTo((x-280)*420/800,(y-325)*290/550));c.closePath();c.fill();
  }
  const pixels=c.getImageData(0,0,source.width,source.height).data;
  // Extend edge pigment for color sampling; restore the original cutout alpha after painting.
  for(let pass=0;pass<8;pass++){const old=new Uint8ClampedArray(pixels);for(let y=1;y<source.height-1;y++)for(let x=1;x<source.width-1;x++){const k=(y*source.width+x)*4;if(old[k+3])continue;for(const d of [-4,4,-source.width*4,source.width*4])if(old[k+d+3]){for(let j=0;j<3;j++)pixels[k+j]=old[k+d+j];pixels[k+3]=1;break;}}}
  const painted=document.createElement('canvas');painted.width=source.width;painted.height=source.height;const brush=painted.getContext('2d');let seed=4863;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
  await paintBrushwork({ctx:brush,pixels,width:painted.width,height:painted.height,random,scale: wood ? .85 : 1,pigmentStep:24,skip:(x,y)=>!pixels[(y*source.width+x)*4+3],angle:(x,y)=>wood?(y<42?-.18:1.55):(x>painted.width*.55?-.45:.12)});
  brush.globalCompositeOperation='destination-in';brush.drawImage(source,0,0);return painted.toDataURL('image/webp',.94);
 }
 return{post:await paint('/assets/banff/wooden-post.jpg',true),pika:await paint('/assets/banff/pika.webp',false)};
});
for(const[name,url]of Object.entries(data))fs.writeFileSync(`assets/banff/${name}-painted.webp`,Buffer.from(url.split(',')[1],'base64'));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
