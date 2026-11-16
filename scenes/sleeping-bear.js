import {startScene} from './scene-painter.js';
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const W = 1600, H = 1000;
// Coordinates follow the supplied 800×599 source, doubled and center-cropped by 99px.
const SHORE = [[0,667],[155,687],[660,691],[810,681],[920,673],[1040,667],[1350,695],[1600,711]];
const BOATS = [{x:136,y:655,w:147,h:83},{x:784,y:650,w:174,h:58},{x:1154,y:651,w:268,h:91}];
function canvas(width, height) {
  const layer=document.createElement('canvas'); layer.width=width; layer.height=height; return layer;
}
function shoreAt(x) {
  for(let i=1;i<SHORE.length;i++)if(x<=SHORE[i][0]){
    const a=SHORE[i-1],b=SHORE[i],u=(x-a[0])/(b[0]-a[0]); return a[1]+(b[1]-a[1])*u;
  }
  return SHORE.at(-1)[1];
}
function fixedBoat(x,y) {return BOATS.some(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);}

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
  // Only alpha-masked, source-painted leaves receive the warm foreground lift.
  c.putImageData(image,0,0);
  return {...region,layer};
}

function prepare({painting,pixels,random}) {
  const water=canvas(W,H),mask=canvas(W,H),m=mask.getContext('2d');
  const alpha=m.createImageData(W,H);
  const wavelets=[];
  for(let y=660;y<H;y++)for(let x=0;x<W;x++){
    if(fixedBoat(x,y))continue;
    const distance=y-shoreAt(x); if(distance<=0)continue;
    const at=(y*W+x)*4;
    alpha.data[at]=alpha.data[at+1]=alpha.data[at+2]=255;
    alpha.data[at+3]=Math.round(clamp(distance/5)*255);
  }
  m.putImageData(alpha,0,0);
  for(let i=0;i<380;i++){
    const x=random()*W,y=674+random()*326;
    if(y<shoreAt(x)+5||fixedBoat(x,y))continue;
    const at=((y|0)*W+(x|0))*4,depth=clamp((y-665)/335);
    wavelets.push({x,y,depth,length:2+random()*(4+depth*27),phase:random()*Math.PI*2,
      bright:random()>.46,color:[pixels[at],pixels[at+1],pixels[at+2]]});
  }
  const foliage=[
    {x:16,y:135,w:271,h:201,anchorX:164,anchorY:306,strength:.75,phase:.3},
    {x:285,y:0,w:290,h:305,anchorX:440,anchorY:282,strength:1,phase:1.3},
    {x:529,y:0,w:284,h:265,anchorX:664,anchorY:245,strength:1.05,phase:2.4},
    {x:792,y:0,w:278,h:182,anchorX:938,anchorY:158,strength:.7,phase:3.2},
    {x:1006,y:0,w:275,h:142,anchorX:1174,anchorY:121,strength:.6,phase:4.7},
    {x:1199,y:0,w:311,h:105,anchorX:1310,anchorY:93,strength:.45,phase:5.6}
  ].map(region=>foliageCutout(painting,pixels,region));
  return {water,mask,wavelets,foliage,painting};
}

function draw({ctx,t,state,wind}) {
  const c=state.water.getContext('2d');c.clearRect(0,0,W,H);
  // The real painted reflections move only inside the mapped water, never the arch's sky opening.
  for(let y=660;y<H;y+=4){
    const depth=clamp((y-660)/340);
    const cross=Math.sin(y*.073-t*1.05)+Math.sin(y*.031+t*.48)*.38;
    const dx=cross*(.15+depth*1.85);
    const sy=clamp(y+Math.sin(y*.046-t*.85)*depth*.9,660,H-4);
    c.drawImage(state.painting,0,sy,W,4,dx,y,W,4);
  }
  c.lineCap='round';
  for(const wave of state.wavelets){
    const crest=.5+.5*Math.sin(t*(.84+wave.depth*.12)-wave.y*.055+wave.phase);
    const x=wave.x+Math.sin(t*.71+wave.phase)*wave.depth*1.8;
    const y=wave.y+Math.sin(t*.96+wave.phase)*wave.depth*.65;
    const value=wave.bright?23:-24;
    const color=wave.color.map(channel=>clamp(channel+value,0,255));
    c.strokeStyle=`rgba(${color[0]},${color[1]},${color[2]},${(.035+wave.depth*.11)*crest})`;
    c.lineWidth=.4+wave.depth*.75;
    c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+wave.length*.5,y-.3,x+wave.length,y);c.stroke();
  }
  c.globalCompositeOperation='destination-in';c.drawImage(state.mask,0,0);
  c.globalCompositeOperation='source-over';ctx.save();ctx.globalAlpha=.76;ctx.drawImage(state.water,0,0);ctx.restore();
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
}

startScene({
  liveVersion:4,
  id:'sleeping-bear',guide:'assets/sleeping-bear/guide.webp',cache:'assets/sleeping-bear/painting-v4.webp',
  background:'#9cb8ad',focusX:.645,focusY:.53,initialScroll:.54,
  grade:(r,g,b,x,y)=>{
    const light=r*.3+g*.55+b*.15;
    const leaf=clamp((g-r*.94-2)/30)*clamp((g-b*1.02)/28)*clamp((360-y)/160);
    const nearRock=clamp((x-1050)/430)*clamp((r-b)/70)*clamp((670-y)/150);
    return [r*(.9+leaf*.16+nearRock*.11)+light*.045+9-leaf*17+nearRock*5,
      g*(.91+leaf*.15+nearRock*.06)+light*.035+8-leaf*8-nearRock*5,
      b*(.89+leaf*.08)+light*.045+10-leaf*21-nearRock*15];
  },
  angle:(x,y)=>y>665?-.025:x>1270?1.3:.045+Math.sin(x*.011+y*.005)*.19,
  prepare,draw
});
