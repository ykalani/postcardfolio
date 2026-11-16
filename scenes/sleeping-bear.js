import {startScene} from './scene-painter.js';
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const W = 1600, H = 1000;
// Coordinates follow the supplied 800×599 source, doubled and center-cropped by 99px.
const SHORE = [[0,667],[155,687],[660,691],[810,681],[920,673],[1040,667],[1350,695],[1600,711]];
const BOATS = [
  {fillX:300,parts:[
    [[94,706],[130,697],[169,698],[214,700],[264,695],[278,701],[261,714],[191,726],[137,721]],
    [[173,697],[176,687],[182,683],[183,675],[186,669],[194,670],[199,677],[198,683],[207,688],[213,697]],
    [[217,696],[218,686],[225,680],[225,668],[231,663],[241,664],[245,669],[244,678],[249,685],[254,695]],
    [[151,679],[156,671],[164,670],[175,681],[169,686]],[[253,695],[275,694],[279,700],[257,705]]
  ]},
  {fillX:780,parts:[
    [[789,676],[836,680],[883,682],[929,683],[971,685],[957,697],[842,699],[800,689]],
    [[854,681],[858,676],[869,672],[870,664],[875,662],[880,666],[879,672],[885,678],[890,682]],
    [[905,683],[910,674],[916,670],[916,662],[921,659],[925,663],[924,670],[932,676],[938,683]],
    [[932,673],[943,671],[948,676],[942,682]]
  ]},
  {fillX:1430,parts:[
    [[1155,701],[1190,693],[1230,696],[1270,695],[1327,690],[1370,681],[1398,675],[1404,681],[1395,702],[1364,714],[1227,718]],
    [[1189,686],[1193,677],[1198,673],[1198,666],[1205,664],[1211,669],[1210,675],[1217,681],[1217,688]],
    [[1207,695],[1205,683],[1212,679],[1214,667],[1221,661],[1227,664],[1229,674],[1238,679],[1246,687],[1242,696]],
    [[1254,694],[1257,684],[1265,681],[1263,670],[1269,664],[1278,665],[1281,672],[1278,680],[1290,685],[1295,693]],
    [[1167,680],[1181,677],[1188,681],[1184,686]]
  ]}
];
const PEOPLE = BOATS.map((boat,index)=>boat.parts.slice(1,index===2?4:3));
function trace(c,points,ox=0,oy=0){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x-ox,y-oy):c.moveTo(x-ox,y-oy));c.closePath();}

async function refinePeople({ctx,pixels,sourcePixels,random,W,H}){
  const mask=canvas(W,H),m=mask.getContext('2d');
  for(const people of PEOPLE)for(const points of people){trace(m,points);m.fill();}
  const {paintBrushwork}=await import('./brush-painting.js');
  for(const [x,y,w,h] of [[170,659,86,43],[850,654,93,32],[1187,650,112,48]]){
    const samples=new Uint8ClampedArray(w*h*4),alpha=m.getImageData(x,y,w,h).data;
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)samples.set(pixels.subarray(((y+yy)*W+x+xx)*4,((y+yy)*W+x+xx)*4+4),(yy*w+xx)*4);
    const detail=canvas(w,h),d=detail.getContext('2d');
    await paintBrushwork({ctx:d,pixels:samples,width:w,height:h,random,scale:.12,pigmentStep:12,angle:()=>1.4});
    d.globalCompositeOperation='destination-in';d.drawImage(mask,x,y,w,h,0,0,w,h);ctx.drawImage(detail,x,y);
  }
  return mask;
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
function prepareBoats(painting,pixels){
  const c=painting.getContext('2d'),original=c.getImageData(0,0,W,H),clean=c.getImageData(0,0,W,H);
  const boats=BOATS.map((boat,index)=>{
    const points=boat.parts.flat(),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
    const x=Math.min(...xs)-12,y=Math.min(...ys)-20,w=Math.max(...xs)-x+13,h=Math.max(...ys)-y+13;
    const sprite=canvas(w,h),s=sprite.getContext('2d'),erase=canvas(w,h),e=erase.getContext('2d');
    for(const part of boat.parts){trace(s,part,x,y);s.fill();trace(e,part,x,y);e.fill();e.lineWidth=14;e.lineJoin='round';e.stroke();}
    if(index===2){trace(e,[[1234,660],[1239,652],[1244,650],[1248,659],[1244,668]],x,y);e.fill();e.stroke();}
    const mask=s.getImageData(0,0,w,h),clear=e.getImageData(0,0,w,h),image=s.createImageData(w,h);
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
      const local=(yy*w+xx)*4,at=((y+yy)*W+x+xx)*4;
      for(let k=0;k<3;k++)image.data[local+k]=original.data[at+k];const r=pixels[at],g=pixels[at+1],b=pixels[at+2];
      const sky=b>r*1.12&&b>g*.99&&r+g+b>350;
      image.data[local+3]=sky?0:mask.data[local+3];
      if(!clear.data[local+3])continue;
      // Clear paint overshoot separately from the tight moving silhouette; no cliff travels with a person.
      const wet=y+yy>=shoreAt(x+xx),sampleY=wet?Math.min(H-1,y+yy+74):y+yy;
      const behindSky=index===1&&y+yy<670||index===2&&x+xx>1230&&y+yy<674;
      const sampleX=wet?x+xx:behindSky?990+xx%35:Math.min(W-1,boat.fillX+xx%60),from=(sampleY*W+sampleX)*4;
      const blend=clear.data[local+3]/255;
      for(let k=0;k<3;k++)clean.data[at+k]=original.data[at+k]*(1-blend)+original.data[from+k]*blend;
    }
    s.putImageData(image,0,0);
    return {sprite,x,y,w,h,phase:index*1.9,range:4+index};
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
  const boats=prepareBoats(painting,pixels);
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
    const drift=Math.sin(t*.13+boat.phase)*boat.range,bob=Math.sin(t*.65+boat.phase)*.65;
    ctx.save();ctx.translate(boat.x+boat.w*.5+drift,boat.y+boat.h*.8+bob);
    ctx.rotate(Math.sin(t*.43+boat.phase)*.0015);ctx.drawImage(boat.sprite,-boat.w*.5,-boat.h*.8);
    ctx.strokeStyle='rgba(204,220,190,.23)';ctx.lineWidth=.9;ctx.lineCap='butt';
    for(let k=0;k<5;k++){const x=-boat.w*.3+k*boat.w*.12,y=boat.h*.2-7+Math.sin(k*2+boat.phase)*1.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+boat.w*.065,y-.5);ctx.stroke();}ctx.restore();
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
  liveVersion:5,
  id:'sleeping-bear',guide:'assets/sleeping-bear/guide.webp',cache:'assets/sleeping-bear/painting-v5.webp',
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
  prepare,draw,refine:refinePeople
});
