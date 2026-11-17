import {startScene} from './scene-painter.js';
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const W = 1600, H = 1000;
// Sprite crops retain the natural painted edges; depth determines scale and overlap.
const BOATS = [
  {crop:[50,190,694,240],x:100,bottom:775,w:190,depth:1},
  {crop:[868,224,615,157],x:800,bottom:755,w:185,depth:1},
  {crop:[92,688,587,158],x:1050,bottom:734,w:112,depth:0},
  {crop:[804,614,686,256],x:1150,bottom:770,w:255,depth:2}
];
const SHORE = [[0,713],[155,724],[660,724],[810,720],[920,714],[1040,714],[1280,720],[1500,742],[1600,747]];
let kayakStudy;

async function paintGouache({ctx,sourcePixels}) {
  const [art,boats]=await Promise.all(['gouache-master.png','kayak-study.png'].map(async file=>{
    const image=new Image();image.src='assets/sleeping-bear/'+file;await image.decode();return image;
  }));
  // Bake the art-directed master before extracting foliage and water layers.
  ctx.drawImage(art,0,0,W,H);sourcePixels.set(ctx.getImageData(0,0,W,H).data);kayakStudy=boats;
}

function canvas(width, height) {
  const layer=document.createElement('canvas'); layer.width=width; layer.height=height; return layer;
}
function shoreAt(x) {
  for(let i=1;i<SHORE.length;i++)if(x<=SHORE[i][0]){
    const a=SHORE[i-1],b=SHORE[i],u=(x-a[0])/(b[0]-a[0]); return a[1]+(b[1]-a[1])*u;
  }
  return SHORE.at(-1)[1];
}
function prepareBoats(){
  return BOATS.map((boat,index)=>{
    const {x,w,depth,crop,bottom}=boat,h=Math.round(crop[3]*w/crop[2]);
    const sprite=canvas(w,h);sprite.getContext('2d').drawImage(kayakStudy,...crop,0,0,w,h);
    return {sprite,x,y:bottom-h,w,h,depth,phase:index*1.9,range:depth===0?2.2:3.5+index*.3};
  });
}

function foliageCutout(painting,pixels,region) {
  const layer=canvas(region.w,region.h),c=layer.getContext('2d');
  c.drawImage(painting,region.x,region.y,region.w,region.h,0,0,region.w,region.h);
  const image=c.getImageData(0,0,region.w,region.h);
  for(let y=0;y<region.h;y++)for(let x=0;x<region.w;x++){
    const local=(y*region.w+x)*4,at=((region.y+y)*W+region.x+x)*4;
    const r=pixels[at],g=pixels[at+1],b=pixels[at+2];
    const green=clamp((g-r*.97-4)/19)*clamp((g-b*1.04-3)/23);
    const edge=Math.min(x,y,region.w-x-1,region.h-y-1);
    image.data[local+3]*=green*clamp(edge/14);
  }
  // Preserve the painted silhouette while the leaf tips flex.
  c.putImageData(image,0,0);
  return {...region,layer};
}

function prepare({painting,pixels,random}) {
  const boats=prepareBoats();
  const waterColors=painting.getContext('2d').getImageData(0,0,W,H).data;
  const water=canvas(W,H),mask=canvas(W,H),m=mask.getContext('2d');
  const alpha=m.createImageData(W,H);
  const wavelets=[];
  for(let y=710;y<H;y++)for(let x=0;x<W;x++){
    const distance=y-shoreAt(x); if(distance<=0)continue;
    const at=(y*W+x)*4;
    alpha.data[at]=alpha.data[at+1]=alpha.data[at+2]=255;
    alpha.data[at+3]=Math.round(clamp(distance/5)*255);
  }
  m.putImageData(alpha,0,0);
  for(let i=0;i<380;i++){
    const x=random()*W,y=716+random()*284;
    if(y<shoreAt(x)+5)continue;
    const at=((y|0)*W+(x|0))*4,depth=clamp((y-710)/290);
    wavelets.push({x,y,depth,length:2+random()*(4+depth*27),phase:random()*Math.PI*2,
      bright:random()>.46,color:[waterColors[at],waterColors[at+1],waterColors[at+2]]});
  }
  const foliage=[
    {x:16,y:135,w:271,h:201,anchorX:164,anchorY:306,strength:.75,phase:.3},
    {x:285,y:0,w:290,h:305,anchorX:440,anchorY:282,strength:1,phase:1.3},
    {x:529,y:0,w:284,h:265,anchorX:664,anchorY:245,strength:1.05,phase:2.4},
    {x:792,y:0,w:278,h:182,anchorX:938,anchorY:158,strength:.7,phase:3.2},
    {x:1006,y:0,w:275,h:142,anchorX:1174,anchorY:121,strength:.6,phase:4.7},
    {x:1199,y:0,w:311,h:105,anchorX:1310,anchorY:93,strength:.45,phase:5.6}
  ].map(region=>foliageCutout(painting,pixels,region));
  const leaves=[];
  const leafSprites=['#465c38','#647347','#394f32','#7c8050'].map(color=>{
    const sprite=canvas(22,14),c=sprite.getContext('2d');
    c.strokeStyle=color;c.lineCap='butt';
    for(let i=0;i<16;i++){
      const x=7+random()*7,y=5+random()*4;
      c.globalAlpha=.55+random()*.35;c.lineWidth=.6+random()*1.2;
      c.beginPath();c.moveTo(x-2-random()*3,y-1);c.lineTo(x+2+random()*3,y+random()*2-1);c.stroke();
    }
    return sprite;
  });
  for(let i=0;i<10;i++){
    const region=foliage[i%foliage.length];let x,y;
    for(let attempt=0;attempt<80;attempt++){
      x=region.x+random()*region.w;y=region.y+random()*region.h;
      const at=((y|0)*W+(x|0))*4;
      if(pixels[at+1]>pixels[at]*1.02&&pixels[at+1]>pixels[at+2]*1.1)break;
    }
    leaves.push({x,y,phase:random(),duration:21+random()*12,fall:280+random()*220,
      drift:80+random()*150,size:3+random()*3,turn:random()*6.28,tone:i%leafSprites.length});
  }
  return {water,mask,wavelets,foliage,painting,boats,leaves,leafSprites};
}

function draw({ctx,t,state,wind}) {
  const c=state.water.getContext('2d');c.clearRect(0,0,W,H);
  // The real painted reflections move only inside the mapped water, never the arch's sky opening.
  for(let y=710;y<H;y+=4){
    const depth=clamp((y-710)/290);
    const cross=Math.sin(y*.073-t*1.05)+Math.sin(y*.031+t*.48)*.38;
    const dx=cross*(.25+depth*4.2);
    const sy=clamp(y+Math.sin(y*.046-t*.85)*depth*1.6,710,H-4);
    c.drawImage(state.painting,0,sy,W,4,dx,y,W,4);
  }
  c.lineCap='round';
  for(const wave of state.wavelets){
    const crest=.5+.5*Math.sin(t*(.84+wave.depth*.12)-wave.y*.055+wave.phase);
    const x=wave.x+Math.sin(t*.71+wave.phase)*wave.depth*3.6;
    const y=wave.y+Math.sin(t*.96+wave.phase)*wave.depth*.65;
    const value=wave.bright?23:-24;
    const color=wave.color.map(channel=>clamp(channel+value,0,255));
    c.strokeStyle=`rgba(${color[0]},${color[1]},${color[2]},${(.06+wave.depth*.18)*crest})`;
    c.lineWidth=.4+wave.depth*.75;
    c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+wave.length*.5,y-.3,x+wave.length,y);c.stroke();
  }
  c.globalCompositeOperation='destination-in';c.drawImage(state.mask,0,0);
  c.globalCompositeOperation='source-over';ctx.save();ctx.globalAlpha=.92;ctx.drawImage(state.water,0,0);ctx.restore();
  for(const boat of [...state.boats].sort((a,b)=>a.depth-b.depth)){
    const drift=Math.sin(t*.22+boat.phase)*boat.range*4;
    const depth=.7+boat.depth*.35;
    const wave=(Math.sin(t*.85+boat.phase)*1.25+Math.sin(t*1.3+boat.phase*1.7)*.35)*depth;
    const roll=Math.cos(t*.85+boat.phase)*.004*depth;
    ctx.save();ctx.translate(boat.x+boat.w*.5+drift,boat.y+boat.h*.8+wave);
    ctx.rotate(roll);ctx.drawImage(boat.sprite,-boat.w*.5,-boat.h*.8);ctx.restore();
    // Small broken pressure ripples follow the hull, with independent fade rather than a dashed outline.
    for(let ring=0;ring<3;ring++){
      const age=(t*.12+boat.phase*.1+ring/3)%1,fade=Math.sin(age*Math.PI)**2;
      const cx=boat.x+boat.w*.5+drift,cy=boat.y+boat.h-10+age*7;
      ctx.save();ctx.globalAlpha=fade*.16;ctx.lineCap='butt';ctx.lineWidth=.65;
      for(let part=0;part<4;part++){
        const x=cx-boat.w*.3+part*boat.w*.18+Math.sin(part*2.3+boat.phase)*3;
        ctx.strokeStyle=part%2?'#315e59':'#bbcbb0';ctx.beginPath();ctx.moveTo(x,cy);
        ctx.quadraticCurveTo(x+boat.w*.03,cy+1.2,x+boat.w*.075,cy+.3);ctx.stroke();
      }
      ctx.restore();
    }
  }
  for(const branch of state.foliage){
    const delayed=t-branch.x*.0014;
    const gust=Math.sin(delayed*.77)*.48+wind*.48;
    const rustle=Math.sin(t*2.65+branch.phase)*.085+Math.sin(t*4.1+branch.phase*2)*.035;
    const flex=(gust+rustle)*branch.strength;
    ctx.save();ctx.translate(branch.anchorX,branch.anchorY);
    // Fixed woody attachments; only masked leaf tips bend and flutter.
    ctx.transform(1,0,flex*.012,1,0,0);ctx.rotate(flex*.0016);
    ctx.drawImage(branch.layer,branch.x-branch.anchorX,branch.y-branch.anchorY);ctx.restore();
  }
  for(const leaf of state.leaves){
    const age=(t/leaf.duration+leaf.phase)%1,x=leaf.x+age*leaf.drift+Math.sin(age*13+leaf.turn)*22*age,y=leaf.y+age*leaf.fall;
    ctx.save();ctx.globalAlpha=clamp(age/.07)*clamp((1-age)/.17)*.94;ctx.translate(x,y);
    ctx.rotate(leaf.turn+age*8+Math.sin(t*1.9+leaf.turn)*.4);ctx.scale(.35+Math.abs(Math.cos(t*1.5+leaf.turn))*.65,1);
    ctx.scale(leaf.size/7,leaf.size/7);
    ctx.drawImage(state.leafSprites[leaf.tone],-11,-7);ctx.restore();
  }
}

startScene({
  liveVersion:8,
  id:'sleeping-bear',guide:'assets/sleeping-bear/guide.webp',cache:'assets/sleeping-bear/painting-v8.webp',
  background:'#244c52',focusX:.63,focusY:.53,initialScroll:.72,
  prepare,draw,refine:paintGouache
});
