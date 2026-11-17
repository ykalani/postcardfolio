import {startScene} from './scene-painter.js';
const W=1600,H=1000;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const layer=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
// Follow the supplied 990 x 742 reference after its centered cover crop.
const point=([x,y])=>[x*W/990,y*W/990-(742*W/990-H)/2];
const skyline=[[0,270],[30,256],[65,253],[90,259],[128,236],[169,221],[196,198],[223,186],[252,186],[275,216],[303,185],[323,177],[341,183],[366,208],[390,190],[415,205],[445,215],[467,217],[490,237],[520,222],[547,205],[569,172],[592,149],[611,150],[626,172],[645,150],[663,184],[682,205],[702,172],[721,188],[741,184],[758,162],[781,153],[802,159],[820,198],[849,173],[891,160],[921,168],[948,159],[990,151]].map(point);
const contourAt=(line,x)=>{for(let i=1;i<line.length;i++)if(x<=line[i][0]){const a=line[i-1],b=line[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return line.at(-1)[1];};
const skyAt=x=>contourAt(skyline,x);
const hills=[[0,340],[180,300],[360,286],[500,278],[660,246],[800,226],[990,182]].map(point);
const dunes=[[0,485],[150,466],[300,461],[460,445],[600,405],[760,375],[820,387],[990,443]].map(point);
const skyMotion=layer(W,440),skyMask=layer(W,440),sm=skyMask.getContext('2d');
let foregroundBrush,paintedClouds;
for(let x=0;x<W;x++){
  const edge=skyAt(x)-24,fade=sm.createLinearGradient(0,edge-20,0,edge);
  fade.addColorStop(0,'white');fade.addColorStop(1,'transparent');sm.fillStyle=fade;sm.fillRect(x,0,1,440);
}
function prepare({painting,pixels,random}){
  const ridges=[[[55,470],[268,459],[510,419]],[[500,464],[660,437],[760,375]],[[575,434],[687,421],[829,424]],[[150,549],[393,509],[555,486]],[[0,556],[254,565],[460,544]],[[605,535],[754,512],[912,519]]].map(r=>r.map(point));
  const sand=ridges.map(points=>{
    const x0=points[0][0],y0=Math.min(...points.map(p=>p[1]))-40,width=Math.ceil(points[2][0]-x0+90),height=Math.ceil(Math.max(...points.map(p=>p[1]))-y0+20);
    const sprite=layer(width,height),g=sprite.getContext('2d');g.lineCap='butt';
    for(let i=0;i<180;i++){
      const u=random(),lift=random(),x=u*(points[2][0]-x0),y=(1-u)**2*points[0][1]+2*(1-u)*u*points[1][1]+u*u*points[2][1]-y0-lift*20;
      const length=10+random()*25;
      for(let bristle=0;bristle<3;bristle++){
        g.strokeStyle=`rgba(${232+bristle*5},${153+bristle*12},${88+bristle*13},${(1-lift)*(.1+random()*.22)})`;
        g.lineWidth=.7+random();g.beginPath();g.moveTo(x,y+bristle);
        g.quadraticCurveTo(x+length*.5,y-2+bristle,x+length,y-4+bristle);g.stroke();
      }
    }
    return{sprite,x:x0,y:y0,phase:random()};
  });
  const grass=[];
  for(let x=0;x<W;x+=180){
    const w=Math.min(230,W-x),sprite=layer(w,140),g=sprite.getContext('2d');g.drawImage(painting,x,860,w,140,0,0,w,140);
    const data=g.getImageData(0,0,w,140);
    for(let y=0;y<140;y++)for(let xx=0;xx<w;xx++){
      const k=(y*w+xx)*4,at=((y+860)*W+x+xx)*4,r=pixels[at],green=pixels[at+1],b=pixels[at+2];
      data.data[k+3]*=clamp((r-green-8)/25)*clamp((green-b-5)/25)*Math.sin(xx/w*Math.PI)*Math.sin(y/140*Math.PI);
    }
    g.putImageData(data,0,0);grass.push({sprite,x,phase:random()*6.28});
  }
  return{clouds:paintedClouds,sand,grass,brush:foregroundBrush};
}
async function refineBrush({random}){
  const {paintBrushwork}=await import('./brush-painting.js');
  // Reuse Yosemite's actual painted cloud banks; bake them into this scene's own atlas.
  const metadata=await (await fetch('assets/yosemite-live-brush3.json')).json(),atlas=new Image();
  atlas.src=`assets/${metadata.atlas}`;await atlas.decode();
  paintedClouds=metadata.clouds.map((cloud,i)=>{
    const sprite=layer(cloud.w,cloud.h);sprite.getContext('2d').drawImage(atlas,...cloud.rect,0,0,cloud.w,cloud.h);
    return{w:cloud.w,h:cloud.h,y:[14,100,35][i],sprite};
  });
  foregroundBrush=[];
  for(const patch of [{x:-80,y:1010,w:440,h:320},{x:230,y:1015,w:330,h:250},{x:470,y:1015,w:300,h:235},{x:680,y:1010,w:330,h:300},{x:940,y:1010,w:310,h:280},{x:1150,y:1015,w:280,h:250},{x:1350,y:1010,w:350,h:330}]){
    const sprite=layer(patch.w,patch.h),g=sprite.getContext('2d');g.lineCap='butt';
    for(let stem=0;stem<55;stem++){
      const base=patch.w*(.25+random()*.5),tip=patch.w*(.08+random()*.84),top=patch.h*(.08+random()*.48),bend=(random()-.5)*24;
      g.strokeStyle='#42422f';g.lineWidth=1+random()*2;g.beginPath();g.moveTo(base,patch.h);g.quadraticCurveTo(base+bend,patch.h*.6,tip,top);g.stroke();
      for(let leaf=0;leaf<8;leaf++){
        const u=.2+leaf*.095,x=base+(tip-base)*u,y=patch.h+(top-patch.h)*u,length=9+random()*16,side=random()<.5?-1:1;
        const light=random(),rgb=light<.38?[40,58,40]:light<.8?[76,96,52]:[151,150,80];
        g.strokeStyle=`rgb(${rgb.join(',')})`;g.lineWidth=5+random()*5;g.beginPath();g.moveTo(x,y);
        g.quadraticCurveTo(x+side*length*.6,y-5,x+side*length,y-9);g.stroke();
        for(let bristle=0;bristle<3;bristle++){
          g.strokeStyle=`rgba(${rgb[0]+bristle*5},${rgb[1]+bristle*5},${rgb[2]+bristle*3},${.7+random()*.25})`;
          g.lineWidth=1.5+random()*2;g.beginPath();g.moveTo(x,y+bristle*1.3);
          g.quadraticCurveTo(x+side*length*.6,y-5+bristle,x+side*length,y-9+bristle);g.stroke();
        }
      }
    }
    const samples=g.getImageData(0,0,patch.w,patch.h).data,alpha=new Uint8Array(patch.w*patch.h);
    for(let i=0;i<samples.length;i+=4){
      alpha[i/4]=samples[i+3];
      if(!samples[i+3]){samples[i]=55;samples[i+1]=70;samples[i+2]=39;}
    }
    const painted=layer(patch.w,patch.h);
    await paintBrushwork({ctx:painted.getContext('2d'),pixels:samples,width:patch.w,height:patch.h,random,pigmentStep:16,
      angle:()=>-.65,skip:(x,y)=>alpha[y*patch.w+x]<96});
    foregroundBrush.push({...patch,sprite:painted,phase:random()*6.28});
  }
}
function draw({ctx,t,state,wind}){
  const sky=skyMotion.getContext('2d');sky.clearRect(0,0,W,440);sky.globalAlpha=.88;
  for(const [i,cloud] of state.clouds.entries()){
    const age=(t+i*40+12)%120,x=-cloud.w+age*60;
    if(x>=W)continue;
    sky.drawImage(cloud.sprite,x,cloud.y);
  }
  sky.globalAlpha=1;sky.globalCompositeOperation='destination-in';sky.drawImage(skyMask,0,0);sky.globalCompositeOperation='source-over';ctx.drawImage(skyMotion,0,0);
  for(const ridge of state.sand)for(let i=0;i<2;i++){
    const age=(t/7+ridge.phase+i/2)%1,fade=Math.sin(age*Math.PI)**2;
    ctx.save();ctx.globalAlpha=fade*(.72+wind*.1);ctx.drawImage(ridge.sprite,ridge.x+age*68,ridge.y-Math.sin(age*Math.PI)*7);ctx.restore();
  }
  for(const patch of state.grass){
    ctx.save();ctx.translate(patch.x+patch.sprite.width*.5,H);ctx.transform(1,0,(wind+Math.sin(t*2.1+patch.phase)*.15)*.014,1,0,0);
    ctx.drawImage(patch.sprite,-patch.sprite.width*.5,-140);ctx.restore();
  }
  for(const patch of state.brush){
    const sway=Math.sin(t*.9)*.19+wind*.045+Math.sin(t*2.2+patch.phase)*.035;
    ctx.save();ctx.translate(patch.x+patch.w*.5,patch.y);ctx.transform(1,0,sway,1,0,0);
    ctx.drawImage(patch.sprite,-patch.w*.5,-patch.h);ctx.restore();
  }
}
startScene({liveVersion:10,id:'great-sand-dunes',guide:'assets/great-sand-dunes/guide.webp',cache:'assets/great-sand-dunes/painting-v10.webp',background:'#9e8170',focusX:.54,focusY:.5,initialScroll:.7,
  grade(r,g,b,x,y){
    const l=r*.3+g*.55+b*.15;
    if(y<skyAt(x)){
      const depth=clamp(y/skyAt(x)),pigment=(l-170)*.22;
      return[66+depth*32+pigment,133+depth*25+pigment,190+depth*20+pigment];
    }
    const hill=clamp((y-contourAt(hills,x))/30)*clamp((contourAt(dunes,x)-y)/20)*clamp((145-l)/55)*clamp((1.3-r/(g+1))/.25);
    if(y<contourAt(dunes,x))return[(r-110)*1.12+102-hill*26,(g-110)*1.12+108+hill*4,(b-110)*1.12+119-hill*25];
    const shadow=clamp((95-l)/60);
    return[(r-110)*1.18+112-shadow*7,(g-110)*1.12+107-shadow*4,(b-110)*1.08+102+shadow*13];
  },
  angle(x,y){if(y>850)return-.08;if(y>480)return-.15+Math.sin(x*.006+y*.008)*.2;return y<skyAt(x)?-.12:x<900?.9:-.8;},prepare,draw,refine:refineBrush});
