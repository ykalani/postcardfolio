import {startScene} from './scene-painter.js';
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const W = 1600, H = 1000;
// Coordinates follow the supplied 800×599 source, doubled and center-cropped by 99px.
const SHORE = [[0,667],[155,687],[660,691],[810,681],[920,673],[1040,667],[1350,695],[1600,711]];
const BOATS = [
  {outline:[[94,706],[139,693],[160,690],[165,680],[169,670],[181,669],[190,680],[197,695],[218,693],[221,678],[226,667],[238,667],[245,680],[252,694],[278,701],[261,718],[191,727],[137,722]],fillX:300},
  {outline:[[788,677],[836,679],[851,676],[857,665],[868,663],[875,670],[880,681],[907,681],[915,670],[918,660],[927,659],[934,671],[938,682],[970,686],[954,698],[842,699]],fillX:780},
  {outline:[[1155,701],[1185,687],[1200,683],[1204,674],[1206,665],[1218,662],[1229,670],[1236,683],[1258,683],[1263,671],[1265,661],[1277,660],[1287,671],[1292,683],[1348,683],[1365,678],[1396,675],[1403,684],[1393,703],[1363,714],[1228,718]],fillX:1430}
];
function canvas(width, height) {
  const layer=document.createElement('canvas'); layer.width=width; layer.height=height; return layer;
}
function shoreAt(x) {
  for(let i=1;i<SHORE.length;i++)if(x<=SHORE[i][0]){
    const a=SHORE[i-1],b=SHORE[i],u=(x-a[0])/(b[0]-a[0]); return a[1]+(b[1]-a[1])*u;
  }
  return SHORE.at(-1)[1];
}
function prepareBoats(painting){
  const c=painting.getContext('2d'),original=c.getImageData(0,0,W,H),clean=c.getImageData(0,0,W,H);
  const boats=BOATS.map((boat,index)=>{
    const xs=boat.outline.map(p=>p[0]),ys=boat.outline.map(p=>p[1]);
    const x=Math.min(...xs)-3,y=Math.min(...ys)-3,w=Math.max(...xs)-x+4,h=Math.max(...ys)-y+4;
    const sprite=canvas(w,h),s=sprite.getContext('2d');
    s.beginPath();boat.outline.forEach(([px,py],i)=>i?s.lineTo(px-x,py-y):s.moveTo(px-x,py-y));s.closePath();
    s.fill();const mask=s.getImageData(0,0,w,h),image=s.createImageData(w,h);
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
      const local=(yy*w+xx)*4,at=((y+yy)*W+x+xx)*4,alpha=mask.data[local+3];
      for(let k=0;k<3;k++)image.data[local+k]=original.data[at+k];image.data[local+3]=alpha;
      if(!alpha)continue;
      // Continue neighboring painted cliff above the shoreline and open water below the hull.
      const wet=y+yy>=shoreAt(x+xx),sampleY=wet?Math.min(H-1,y+yy+74):y+yy;
      const sampleX=wet?x+xx:Math.min(W-1,boat.fillX+xx%60);
      const from=(sampleY*W+sampleX)*4;
      for(let k=0;k<3;k++)clean.data[at+k]=original.data[from+k];
    }
    s.putImageData(image,0,0);
    return {sprite,x,y,w,h,phase:index*1.9,range:14+index*5};
  });
  c.putImageData(clean,0,0);return boats;
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
  // Only alpha-masked, source-painted leaves receive the warm foreground lift.
  c.putImageData(image,0,0);
  return {...region,layer};
}

function prepare({painting,pixels,random}) {
  const boats=prepareBoats(painting);
  const waterColors=painting.getContext('2d').getImageData(0,0,W,H).data;
  const water=canvas(W,H),mask=canvas(W,H),m=mask.getContext('2d');
  const alpha=m.createImageData(W,H);
  const wavelets=[];
  for(let y=660;y<H;y++)for(let x=0;x<W;x++){
    const distance=y-shoreAt(x); if(distance<=0)continue;
    const at=(y*W+x)*4;
    alpha.data[at]=alpha.data[at+1]=alpha.data[at+2]=255;
    alpha.data[at+3]=Math.round(clamp(distance/5)*255);
  }
  m.putImageData(alpha,0,0);
  for(let i=0;i<380;i++){
    const x=random()*W,y=674+random()*326;
    if(y<shoreAt(x)+5)continue;
    const at=((y|0)*W+(x|0))*4,depth=clamp((y-665)/335);
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
  for(let i=0;i<42;i++){
    const region=foliage[i%foliage.length];let x,y;
    for(let attempt=0;attempt<80;attempt++){
      x=region.x+random()*region.w;y=region.y+random()*region.h;
      const at=((y|0)*W+(x|0))*4;
      if(pixels[at+1]>pixels[at]*1.02&&pixels[at+1]>pixels[at+2]*1.1)break;
    }
    leaves.push({x,y,phase:random(),duration:14+random()*12,fall:410+random()*310,
      drift:80+random()*150,size:3+random()*3,turn:random()*6.28,tone:i%3});
  }
  return {water,mask,wavelets,foliage,painting,boats,leaves};
}

function draw({ctx,t,state,wind}) {
  const c=state.water.getContext('2d');c.clearRect(0,0,W,H);
  // The real painted reflections move only inside the mapped water, never the arch's sky opening.
  for(let y=660;y<H;y+=4){
    const depth=clamp((y-660)/340);
    const cross=Math.sin(y*.073-t*1.05)+Math.sin(y*.031+t*.48)*.38;
    const dx=cross*(.25+depth*4.2);
    const sy=clamp(y+Math.sin(y*.046-t*.85)*depth*1.6,660,H-4);
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
  for(const boat of state.boats){
    const drift=Math.sin(t*.24+boat.phase)*boat.range,bob=Math.sin(t*1.25+boat.phase)*1.7;
    ctx.save();ctx.translate(boat.x+boat.w*.5+drift,boat.y+boat.h*.8+bob);
    ctx.rotate(Math.sin(t*.78+boat.phase)*.007);ctx.drawImage(boat.sprite,-boat.w*.5,-boat.h*.8);
    ctx.strokeStyle='rgba(219,232,202,.36)';ctx.lineWidth=1.2;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-boat.w*.4,boat.h*.2+3);ctx.quadraticCurveTo(0,boat.h*.2+7,boat.w*.4,boat.h*.2+2);ctx.stroke();ctx.restore();
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
    ctx.fillStyle=['#95a545','#c1b95c','#6d8d42'][leaf.tone];
    ctx.beginPath();ctx.moveTo(0,-leaf.size);ctx.quadraticCurveTo(leaf.size*1.2,-leaf.size*.3,0,leaf.size);ctx.quadraticCurveTo(-leaf.size*.8,0,0,-leaf.size);ctx.fill();
    ctx.strokeStyle='rgba(223,219,146,.7)';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(0,-leaf.size*.7);ctx.lineTo(0,leaf.size*.7);ctx.stroke();ctx.restore();
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
