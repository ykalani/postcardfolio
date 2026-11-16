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
  for(let y=840;y<H;y+=80)for(let x=0;x<W;x+=130){
    const w=Math.min(165,W-x),h=Math.min(120,H-y),sprite=layer(w,h),c=sprite.getContext('2d');
    c.drawImage(painting,x,y,w,h,0,0,w,h);const data=c.getImageData(0,0,w,h);let count=0;
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
      const i=((y+yy)*W+x+xx)*4,k=(yy*w+xx)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
      const leaf=(r>g*1.03&&g>b*1.3)||(g>r*1.04&&g>b*1.12);
      const edge=Math.max(0,1-((xx/w-.5)/.5)**2-((yy/h-.5)/.5)**2);
      data.data[k+3]=leaf?Math.min(220,edge*500):0;if(data.data[k+3])count++;
    }
    c.putImageData(data,0,0);if(count>150)foliage.push({sprite,x,y,phase:random()*6.28});
  }
  const ridges=[[[30,365],[175,357],[316,364]],[[326,373],[468,371],[600,406]],[[780,449],[920,409],[1047,423]],[[1070,424],[1213,389],[1355,413]],[[355,527],[433,520],[515,545]],[[926,586],[1040,568],[1151,585]]];
  const sand=ridges.map(points=>{
    const start=points[0],end=points[2],sprite=layer(end[0]-start[0]+45,110),c=sprite.getContext('2d');
    for(let i=0;i<650;i++){
      const u=random(),lift=random(),x=u*(end[0]-start[0]),y=(1-u)**2*start[1]+2*(1-u)*u*points[1][1]+u*u*end[1];
      c.strokeStyle=`rgba(215,195,166,${(1-lift)*(.03+random()*.12)})`;c.lineWidth=.4+random()*.7;
      c.beginPath();c.moveTo(x+lift*17,y-start[1]+27-lift*12);c.lineTo(x+lift*17+2+random()*6,y-start[1]+26-lift*12);c.stroke();
    }
    return{sprite,x:start[0],y:start[1]-27,phase:random()*6.28};
  });
  const fog=layer(1600,140),fc=fog.getContext('2d');fc.drawImage(painting,0,250,1600,140,0,0,1600,140);
  const fd=fc.getImageData(0,0,1600,140);
  for(let y=0;y<140;y++)for(let x=0;x<1600;x++){
    const at=((y+250)*W+x)*4,k=(y*1600+x)*4,white=clamp((Math.min(pixels[at],pixels[at+1],pixels[at+2])-145)/60,0,1);
    fd.data[k+3]*=white*Math.sin(y/140*Math.PI)*.3;
  }
  fc.putImageData(fd,0,0);return{mask,water,ripples,foliage,sand,fog};
}
function draw({ctx,t,state,wind}){
  const{water,mask}=state,c=water.getContext('2d');c.clearRect(0,0,W,DEPTH);c.lineCap='round';
  for(const r of state.ripples){
    const pulse=.5+.5*Math.sin(t*1.7+r.phase),x=r.x+Math.sin(t*.8+r.phase)*3,y=r.y+Math.sin(t*1.3+r.phase)*.75;
    c.strokeStyle=`rgba(${Math.min(255,r.r+28)},${Math.min(255,r.g+27)},${Math.min(255,r.b+22)},${.08+pulse*.23})`;c.lineWidth=.55+pulse*.55;
    c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+r.length*.5,y-1,x+r.length,y);c.stroke();
  }
  for(let i=0;i<9;i++){
    const phase=(t*.045+i/9)%1,x=1600-phase*1800,y=100-x*.055;
    c.strokeStyle=`rgba(225,229,221,${Math.sin(phase*Math.PI)*.22})`;c.lineWidth=1.2;
    c.beginPath();c.moveTo(x-110,y+5);c.quadraticCurveTo(x,y-2,x+100,y-6);c.stroke();
  }
  c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0);c.globalCompositeOperation='source-over';ctx.drawImage(water,0,TOP);
  ctx.save();ctx.globalAlpha=.8;ctx.drawImage(state.fog,Math.sin(t*.045)*13+wind*1.2,250);ctx.restore();
  for(const ridge of state.sand){const gust=clamp(.25+wind*.25+Math.sin(t*.5+ridge.phase)*.1,.02,.65);ctx.save();ctx.globalAlpha=gust;ctx.drawImage(ridge.sprite,ridge.x+gust*9,ridge.y-gust*3);ctx.restore();}
  for(const patch of state.foliage){const sway=wind+Math.sin(t*2.4+patch.phase)*.2;ctx.save();ctx.translate(patch.x+patch.sprite.width*.5,patch.y+patch.sprite.height);ctx.transform(1,0,sway*.009,1,0,0);ctx.drawImage(patch.sprite,-patch.sprite.width*.5,-patch.sprite.height);ctx.restore();}
}
startScene({liveVersion:3,id:'great-sand-dunes',guide:'assets/great-sand-dunes/guide.jpg',cache:'assets/great-sand-dunes/painting-v3.webp',background:'#b9b0a4',focusX:.54,focusY:.5,initialScroll:.62,
  grade(r,g,b,x,y){const l=r*.3+g*.55+b*.15,near=clamp((y-820)/180,0,1);return[r*.84+l*.1+10-near*4,g*.84+l*.1+10-near*5,b*.8+l*.12+11-near*3];},
  angle(x,y){if(y>730&&y<850)return-.04;if(y>330&&y<745)return.12+Math.sin(x*.007+y*.008)*.24;return y<330?1.2:-1.1;},prepare,draw});
