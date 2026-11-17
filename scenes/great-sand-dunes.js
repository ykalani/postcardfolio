import {startScene} from './scene-painter.js';
const W=1600,H=1000,TOP=725,DEPTH=165;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const layer=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const skyline=[[0,205],[120,185],[190,175],[280,137],[350,109],[424,73],[467,91],[503,88],[549,68],[600,91],[665,107],[709,134],[747,123],[779,104],[810,114],[852,112],[905,109],[941,113],[1008,97],[1049,116],[1120,140],[1160,103],[1195,85],[1250,91],[1290,114],[1370,119],[1460,101],[1510,88],[1600,79]];
const skyAt=x=>{for(let i=1;i<skyline.length;i++)if(x<=skyline[i][0]){const a=skyline[i-1],b=skyline[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return 56;};
const skyMotion=layer(W,205),skyMask=layer(W,205),sm=skyMask.getContext('2d');
let fogSource,fogBanks;
// Feather traveling pigment before the peaks so the sky has no hard polygon edge.
for(let x=0;x<W;x++){
  const edge=skyAt(x)-24,fade=sm.createLinearGradient(0,edge-24,0,edge);
  fade.addColorStop(0,'white');fade.addColorStop(1,'transparent');sm.fillStyle=fade;sm.fillRect(x,0,1,205);
}
async function refineSnow({ctx,sourcePixels,random}){
  const x0=190,y0=60,w=930,h=170,mask=layer(W,H),m=mask.getContext('2d'),snow=layer(w,h),samples=new Uint8ClampedArray(w*h*4);
  const ridge=skyline.filter(([x])=>x>=190&&x<=1120);
  m.beginPath();ridge.forEach(([x,y],i)=>i?m.lineTo(x,y+8):m.moveTo(x,y+8));
  for(const [x,y] of [[1120,144],[1020,156],[960,160],[900,184],[810,195],[710,199],[600,195],[490,189],[380,189],[280,177],[190,175]])m.lineTo(x,y);
  m.closePath();m.clip();
  m.strokeStyle='white';m.lineCap='butt';m.lineWidth=5;
  // Snow follows the guide's pale, neutral deposits; exposed violet rock stays between them.
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const at=((y+y0)*W+x+x0)*4,k=(y*w+x)*4,r=sourcePixels[at],g=sourcePixels[at+1],b=sourcePixels[at+2];
    const light=clamp((Math.min(r,g,b)-145)/65,0,1);
    samples[k]=199+light*44;samples[k+1]=215+light*30;samples[k+2]=232+light*15;
    if(x%5===0&&y%5===0&&Math.min(r,g,b)>150&&Math.max(r,g,b)-Math.min(r,g,b)<42){
      const angle=x+x0<424?-.55:x+x0<780?.85:-.6,length=3+random()*3;
      const cx=x+x0+(random()-.5)*2,cy=y+y0+(random()-.5)*2,dx=Math.cos(angle)*length,dy=Math.sin(angle)*length;
      m.lineWidth=3+random()*4;m.beginPath();m.moveTo(cx-dx,cy-dy);m.lineTo(cx+dx,cy+dy);m.stroke();
    }
  }
  const alpha=m.getImageData(x0,y0,w,h).data;
  const {paintBrushwork}=await import('./brush-painting.js');
  await paintBrushwork({ctx:snow.getContext('2d'),pixels:samples,width:w,height:h,random,pigmentStep:12,
    angle:x=>x+x0<424?-.55:x+x0<780?.85:-.6,skip:(x,y)=>!alpha[(y*w+x)*4+3]});
  const painted=layer(W,H),p=painted.getContext('2d');p.drawImage(snow,x0,y0);
  p.globalCompositeOperation='destination-in';p.drawImage(mask,0,0);ctx.drawImage(painted,0,0);return mask;
}
function prepare({painting,pixels,random}){
  const mask=layer(W,DEPTH),water=layer(W,DEPTH),m=mask.getContext('2d'),alpha=m.createImageData(W,DEPTH),ripples=[];
  for(let y=0;y<DEPTH;y++)for(let x=0;x<W;x++){
    const at=((y+TOP)*W+x)*4,r=pixels[at],g=pixels[at+1],b=pixels[at+2];
    if(b<r*.98||g<r*.94||b<78)continue;
    const k=(y*W+x)*4;alpha.data[k]=alpha.data[k+1]=alpha.data[k+2]=255;alpha.data[k+3]=210;
    if(x%10===0&&y%4===0&&random()<.45)ripples.push({x,y,phase:random()*6.28,length:4+random()*15,r,g,b});
  }
  m.putImageData(alpha,0,0);
  const foliage=[];
  for(let y=780;y<H;y+=65)for(let x=0;x<W;x+=110){
    const w=Math.min(165,W-x),h=Math.min(120,H-y),sprite=layer(w,h),c=sprite.getContext('2d');
    c.drawImage(painting,x,y,w,h,0,0,w,h);const data=c.getImageData(0,0,w,h);let count=0;
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
      const i=((y+yy)*W+x+xx)*4,k=(yy*w+xx)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
      const leaf=(r>g*1.01&&g>b*1.18)||(g>r*.94&&g>b*1.08);
      const edge=Math.max(0,1-((xx/w-.5)/.5)**2-((yy/h-.5)/.5)**2);
      data.data[k+3]=leaf?Math.min(220,edge*500):0;if(data.data[k+3])count++;
    }
    c.putImageData(data,0,0);if(count>150)foliage.push({sprite,x,y,phase:random()*6.28});
  }
  const ridges=[[[30,365],[175,357],[316,364]],[[326,373],[468,371],[600,406]],[[780,449],[920,409],[1047,423]],[[1070,424],[1213,389],[1355,413]],[[355,527],[433,520],[515,545]],[[926,586],[1040,568],[1151,585]]];
  const sand=ridges.map(points=>{
    const width=points[2][0]-points[0][0]+110,sprite=layer(width,90),c=sprite.getContext('2d');
    // A connected wind-combed veil reads as spindrift rather than isolated floating grains.
    for(let i=0;i<210;i++){
      const u=random(),lift=random(),x=u*(width-95),y=(1-u)**2*points[0][1]+2*(1-u)*u*points[1][1]+u*u*points[2][1]-points[0][1]+45-lift*25;
      const length=12+random()*30,alpha=(1-lift)*(.09+random()*.27);
      for(let bristle=0;bristle<3;bristle++){
        c.strokeStyle=`rgba(${234+bristle*4},${204+bristle*4},${160+bristle*6},${alpha})`;
        c.lineWidth=.7+random()*1.1;c.lineCap='butt';c.beginPath();c.moveTo(x,y+bristle*1.2);
        c.quadraticCurveTo(x+length*.5,y-2-bristle,x+length,y-3-bristle);c.stroke();
      }
    }
    return {sprite,x:points[0][0],y:points[0][1]-45,phase:random()};
  });
  const clouds=[];
  for(const region of [{x:0,y:0,w:620,h:180},{x:490,y:0,w:650,h:160},{x:1000,y:0,w:600,h:160}]){
    const sprite=layer(region.w,region.h),c=sprite.getContext('2d');
    c.drawImage(painting,region.x,region.y,region.w,region.h,0,0,region.w,region.h);
    const data=c.getImageData(0,0,region.w,region.h);
    for(let y=0;y<region.h;y++)for(let x=0;x<region.w;x++){
      const at=((region.y+y)*W+region.x+x)*4,k=(y*region.w+x)*4;
      const light=Math.min(pixels[at],pixels[at+1],pixels[at+2]);
      const edge=Math.sin(x/region.w*Math.PI)*Math.sin(y/region.h*Math.PI);
      data.data[k+3]*=clamp((light-130)/65,0,1)*edge*clamp((skyAt(region.x+x)-region.y-y-24)/16,0,1);
    }
    c.putImageData(data,0,0);clouds.push({...region,sprite});
  }
  const fog=layer(1600,140),fc=fog.getContext('2d');fc.drawImage(painting,0,250,1600,140,0,0,1600,140);
  const fd=fc.getImageData(0,0,1600,140);
  for(let y=0;y<140;y++)for(let x=0;x<1600;x++){
    const at=((y+250)*W+x)*4,k=(y*1600+x)*4,white=clamp((Math.min(pixels[at],pixels[at+1],pixels[at+2])-145)/60,0,1);
    fd.data[k+3]*=white*Math.sin(y/140*Math.PI)*.3;
  }
  fc.putImageData(fd,0,0);return{mask,water,ripples,foliage,sand,fog,clouds,painting};
}
function draw({ctx,t,state,wind}){
  const{water,mask}=state,c=water.getContext('2d');c.clearRect(0,0,W,DEPTH);c.lineCap='round';
  for(let y=0;y<DEPTH;y+=5)for(let i=0;i<2;i++){
    const band=Math.min(5,DEPTH-y),age=(t*.5+i/2)%1,flow=-age*64;
    c.globalAlpha=Math.sin(age*Math.PI)**2*.85;
    c.drawImage(state.painting,0,TOP+y,W,band,flow,y,W,band);
  }
  c.globalAlpha=1;
  for(const r of state.ripples){
    const pulse=.5+.5*Math.sin(t*1.7+r.phase),x=(r.x+W-(t*42)%W)%W,y=r.y+Math.sin(t*1.3+r.phase)*.75;
    c.strokeStyle=`rgba(${Math.min(255,r.r+28)},${Math.min(255,r.g+27)},${Math.min(255,r.b+22)},${.16+pulse*.35})`;c.lineWidth=.55+pulse*.55;
    c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+r.length*.5,y-1,x+r.length,y);c.stroke();
  }
  for(let i=0;i<22;i++){
    const age=(t*.11+i/22)%1,x=1650-age*1850,y=91-x*.055+Math.sin(i*2.9)*14;
    const fade=Math.sin(age*Math.PI)**2;
    for(let bristle=0;bristle<3;bristle++){
      c.strokeStyle=bristle===0?`rgba(62,94,107,${fade*.48})`:`rgba(237,237,216,${fade*.74})`;
      c.lineWidth=bristle===0?2.3:1.25;c.beginPath();c.moveTo(x-34,y+bristle*2);
      c.quadraticCurveTo(x,y-3+bristle*2,x+27,y-4+bristle*2);c.stroke();
    }
  }
  c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0);c.globalCompositeOperation='source-over';ctx.save();ctx.globalAlpha=.92;ctx.drawImage(water,0,TOP);ctx.restore();
  if(fogSource!==state.fog){
    fogSource=state.fog;
    fogBanks=[100,600,1100].map(x=>{
      const sprite=layer(500,140),g=sprite.getContext('2d');g.filter='brightness(1.24)';
      for(let coat=0;coat<7;coat++)g.drawImage(state.fog,x,0,500,140,0,0,500,140);
      g.filter='none';g.globalCompositeOperation='destination-in';
      const edge=g.createLinearGradient(0,0,500,0);
      for(const [at,color] of [[0,'transparent'],[.18,'white'],[.82,'white'],[1,'transparent']])edge.addColorStop(at,color);
      g.fillStyle=edge;g.fillRect(0,0,500,140);return sprite;
    });
  }
  // Each bank enters at the left and leaves completely before its next pass.
  for(let i=0;i<fogBanks.length;i++){
    const age=(t+i*40+12)%120,x=-500+age*66;
    if(x<W)ctx.drawImage(fogBanks[i],x,250);
  }
  const sky=skyMotion.getContext('2d');sky.clearRect(0,0,W,205);
  sky.filter='brightness(1.18)';
  for(const [i,cloud] of state.clouds.entries()){
    const age=(t+i*40+12)%120,x=-cloud.w+age*66;
    if(x>=W)continue;
    for(let coat=0;coat<4;coat++)sky.drawImage(cloud.sprite,x,cloud.y);
  }
  sky.filter='none';
  sky.globalCompositeOperation='destination-in';sky.drawImage(skyMask,0,0);sky.globalCompositeOperation='source-over';
  ctx.save();ctx.globalAlpha=.95;ctx.drawImage(skyMotion,0,0);ctx.restore();
  for(const ridge of state.sand)for(let i=0;i<2;i++){
    const age=(t/7+ridge.phase+i/2)%1,fade=Math.sin(age*Math.PI)**2;
    ctx.save();ctx.globalAlpha=fade*(.78+wind*.1);
    ctx.drawImage(ridge.sprite,ridge.x+age*72,ridge.y-Math.sin(age*Math.PI)*9);ctx.restore();
  }
  for(const patch of state.foliage){const sway=wind+Math.sin(t*2.4+patch.phase)*.2;ctx.save();ctx.translate(patch.x+patch.sprite.width*.5,patch.y+patch.sprite.height);ctx.transform(1,0,sway*.045,1,0,0);ctx.drawImage(patch.sprite,-patch.sprite.width*.5,-patch.sprite.height);ctx.restore();}
}
startScene({liveVersion:7,id:'great-sand-dunes',guide:'assets/great-sand-dunes/guide.jpg',cache:'assets/great-sand-dunes/painting-v7.webp',background:'#b9b0a4',focusX:.54,focusY:.5,initialScroll:.82,
  grade(r,g,b,x,y){
    const l=r*.3+g*.55+b*.15,near=clamp((y-805)/100,0,1);
    const brush=near*clamp((Math.max(r,g)-b*1.15)/35,0,1);
    const far=clamp((340-y)/180,0,1)*clamp((205-l)/65,0,1);
    return[r*(.84+brush*.2-far*.08)+l*.1+10-brush*18+far*8,
      g*(.84+brush*.2-far*.08)+l*.1+10-brush*13+far*15,
      b*(.8+brush*.08-far*.08)+l*.12+11-brush*19+far*25];
  },
  angle(x,y){if(y>730&&y<850)return-.04;if(y>330&&y<745)return.12+Math.sin(x*.007+y*.008)*.24;return y<330?1.2:-1.1;},prepare,draw,refine:refineSnow});
