import {startScene} from './scene-painter.js';
const W=1600,H=1000,TOP=725,DEPTH=165;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const layer=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
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
  const skyline=[[0,205],[180,124],[330,78],[480,57],[650,124],[800,102],[1000,71],[1130,58],[1290,114],[1460,81],[1600,56]];
  const skyAt=x=>{for(let i=1;i<skyline.length;i++)if(x<=skyline[i][0]){const a=skyline[i-1],b=skyline[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return 56;};
  for(const region of [{x:0,y:0,w:620,h:180},{x:490,y:0,w:650,h:160},{x:1000,y:0,w:600,h:160}]){
    const sprite=layer(region.w,region.h),c=sprite.getContext('2d');
    c.drawImage(painting,region.x,region.y,region.w,region.h,0,0,region.w,region.h);
    const data=c.getImageData(0,0,region.w,region.h);
    for(let y=0;y<region.h;y++)for(let x=0;x<region.w;x++){
      const at=((region.y+y)*W+region.x+x)*4,k=(y*region.w+x)*4;
      const light=Math.min(pixels[at],pixels[at+1],pixels[at+2]);
      const edge=Math.sin(x/region.w*Math.PI)*Math.sin(y/region.h*Math.PI);
      data.data[k+3]*=clamp((light-130)/65,0,1)*edge*clamp((skyAt(region.x+x)-region.y-y-12)/16,0,1);
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
  for(let y=0;y<DEPTH;y+=5){
    const band=Math.min(5,DEPTH-y),flow=Math.sin(y*.08-t*1.25)*8;
    c.drawImage(state.painting,0,TOP+y,W,band,flow,y,W,band);
  }
  for(const r of state.ripples){
    const pulse=.5+.5*Math.sin(t*1.7+r.phase),x=r.x+Math.sin(t*.8+r.phase)*3,y=r.y+Math.sin(t*1.3+r.phase)*.75;
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
  ctx.save();ctx.globalAlpha=.95;ctx.drawImage(state.fog,Math.sin(t*.065)*34+wind*3,250);ctx.restore();
  for(const cloud of state.clouds){
    ctx.save();ctx.globalAlpha=.88;
    ctx.drawImage(cloud.sprite,cloud.x+Math.sin(t*.1+cloud.x*.002)*60,cloud.y+Math.sin(t*.06)*3);
    ctx.restore();
  }
  for(const ridge of state.sand)for(let i=0;i<2;i++){
    const age=(t/7+ridge.phase+i/2)%1,fade=Math.sin(age*Math.PI)**2;
    ctx.save();ctx.globalAlpha=fade*(.78+wind*.1);
    ctx.drawImage(ridge.sprite,ridge.x+age*72,ridge.y-Math.sin(age*Math.PI)*9);ctx.restore();
  }
  for(const patch of state.foliage){const sway=wind+Math.sin(t*2.4+patch.phase)*.2;ctx.save();ctx.translate(patch.x+patch.sprite.width*.5,patch.y+patch.sprite.height);ctx.transform(1,0,sway*.045,1,0,0);ctx.drawImage(patch.sprite,-patch.sprite.width*.5,-patch.sprite.height);ctx.restore();}
}
startScene({liveVersion:5,id:'great-sand-dunes',guide:'assets/great-sand-dunes/guide.jpg',cache:'assets/great-sand-dunes/painting-v5.webp',background:'#b9b0a4',focusX:.54,focusY:.5,initialScroll:.82,
  grade(r,g,b,x,y){
    const l=r*.3+g*.55+b*.15,near=clamp((y-805)/100,0,1);
    const brush=near*clamp((Math.max(r,g)-b*1.15)/35,0,1);
    const far=clamp((340-y)/180,0,1)*clamp((205-l)/65,0,1);
    return[r*(.84+brush*.2-far*.08)+l*.1+10-brush*18+far*8,
      g*(.84+brush*.2-far*.08)+l*.1+10-brush*13+far*15,
      b*(.8+brush*.08-far*.08)+l*.12+11-brush*19+far*25];
  },
  angle(x,y){if(y>730&&y<850)return-.04;if(y>330&&y<745)return.12+Math.sin(x*.007+y*.008)*.24;return y<330?1.2:-1.1;},prepare,draw});
