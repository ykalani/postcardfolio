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
let paintedClouds;
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
  const brush=[];
  for(let x=0;x<W;x+=270){
    const w=Math.min(320,W-x),h=160,sprite=layer(w,h),g=sprite.getContext('2d');
    g.drawImage(painting,x,H-h,w,h,0,0,w,h);const data=g.getImageData(0,0,w,h);
    // Lift the reference's dry, irregular scrub rather than inventing leafy shrubs.
    for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){
      const k=(y*w+xx)*4,at=((y+H-h)*W+x+xx)*4,r=pixels[at],green=pixels[at+1],b=pixels[at+2];
      data.data[k+3]*=clamp((r-green-4)/18)*clamp((green-b-3)/18)*Math.sin(xx/w*Math.PI)*clamp((y-25)/35);
    }
    g.putImageData(data,0,0);g.lineCap='butt';
    for(let tuft=0;tuft<16;tuft++){
      const base=12+random()*(w-24),foot=125+random()*30,k=(Math.floor(foot)*w+Math.floor(base))*4;
      for(let stem=0;stem<4;stem++){
        const height=18+random()*43,lean=(random()-.5)*35;
        for(let bristle=0;bristle<3;bristle++){
          g.strokeStyle=`rgba(${Math.min(255,data.data[k]+15+bristle*3)},${Math.min(255,data.data[k+1]+12+bristle*2)},${Math.min(255,data.data[k+2]+6)},${.45+random()*.3})`;
          g.lineWidth=.55+random();g.beginPath();g.moveTo(base+bristle,foot);
          g.quadraticCurveTo(base+lean*.35+bristle,foot-height*.6,base+lean+bristle,foot-height);g.stroke();
        }
        // Short, ragged sprays make dry brush tips rather than smooth stalk ends.
        for(let sprig=0;sprig<5;sprig++){
          const angle=-Math.PI*.9+random()*Math.PI*.8,length=4+random()*8;
          const tipX=base+lean+(random()-.5)*4,tipY=foot-height+random()*9;
          g.strokeStyle=`rgba(${Math.min(255,data.data[k]+25)},${Math.min(255,data.data[k+1]+21)},${Math.min(255,data.data[k+2]+12)},${.5+random()*.3})`;
          g.lineWidth=.8+random()*1.3;g.beginPath();g.moveTo(tipX,tipY);
          g.lineTo(tipX+Math.cos(angle)*length,tipY+Math.sin(angle)*length);g.stroke();
        }
      }
    }
    brush.push({x,y:H,w,h,sprite,phase:random()*6.28});
  }
  return{clouds:paintedClouds,sand,brush};
}
async function refineLandscape({ctx,sourcePixels,random}){
  // Reuse Yosemite's actual painted cloud banks; bake them into this scene's own atlas.
  const metadata=await (await fetch('assets/yosemite-live-brush3.json')).json(),atlas=new Image();
  atlas.src=`assets/${metadata.atlas}`;await atlas.decode();
  paintedClouds=metadata.clouds.map((cloud,i)=>{
    const sprite=layer(cloud.w,cloud.h);sprite.getContext('2d').drawImage(atlas,...cloud.rect,0,0,cloud.w,cloud.h);
    return{w:cloud.w,h:cloud.h,y:[14,100,35][i],sprite};
  });
  const greenery=layer(W,H),g=greenery.getContext('2d');g.lineCap='butt';
  for(let cluster=0;cluster<85;cluster++){
    const x=80+random()*(W-160),top=contourAt(hills,x)+25,bottom=contourAt(dunes,x)-35,y=top+random()*(bottom-top);
    const at=((y|0)*W+(x|0))*4,r=sourcePixels[at],green=sourcePixels[at+1],b=sourcePixels[at+2],light=r*.3+green*.55+b*.15;
    if(bottom<=top||light<45||light>150||r>green*1.2)continue;
    for(let dab=0;dab<5;dab++){
      const xx=x+(random()-.5)*24,yy=y+(random()-.5)*13,length=6+random()*10;
      for(let bristle=0;bristle<3;bristle++){
        g.strokeStyle=`rgba(${light*.5+26+bristle*3},${light*.55+39+bristle*3},${light*.34+22+bristle*2},${.5+random()*.3})`;
        g.lineWidth=.8+random()*1.5;g.beginPath();g.moveTo(xx,yy+bristle*1.3);
        g.quadraticCurveTo(xx+length*.5,yy-2+bristle,xx+length,yy-4+bristle);g.stroke();
      }
    }
  }
  ctx.drawImage(greenery,0,0);return greenery;
}
function draw({ctx,t,state,wind}){
  const sky=skyMotion.getContext('2d');sky.clearRect(0,0,W,440);sky.globalAlpha=.74;
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
  for(const patch of state.brush){
    const sway=Math.sin(t*.9)*.19+wind*.045+Math.sin(t*2.2+patch.phase)*.035;
    ctx.save();ctx.translate(patch.x+patch.w*.5,patch.y);ctx.transform(1,0,sway,1,0,0);
    ctx.drawImage(patch.sprite,-patch.w*.5,-patch.h);ctx.restore();
  }
}
startScene({liveVersion:12,id:'great-sand-dunes',guide:'assets/great-sand-dunes/guide.webp',cache:'assets/great-sand-dunes/painting-v12.webp',background:'#9e8170',focusX:.54,focusY:.5,initialScroll:.7,
  grade(r,g,b,x,y){
    const l=r*.3+g*.55+b*.15;
    if(y<skyAt(x)){
      const depth=clamp(y/skyAt(x)),pigment=(l-170)*.22;
      return[110+depth*30+pigment,158+depth*25+pigment,191+depth*18+pigment];
    }
    const hill=clamp((y-contourAt(hills,x))/30)*clamp((contourAt(dunes,x)-y)/20)*clamp((145-l)/55)*clamp((1.3-r/(g+1))/.25);
    if(y<contourAt(dunes,x))return[(r-110)*1.12+102-hill*4,(g-110)*1.12+108-hill*8,(b-110)*1.12+119-hill*20];
    const shadow=clamp((95-l)/60);
    return[(r-110)*1.08+110-shadow*5,(g-110)*1.08+110-shadow*3,(b-110)*1.04+108+shadow*10];
  },
  angle(x,y){if(y>850)return-.08;if(y>480)return-.15+Math.sin(x*.006+y*.008)*.2;return y<skyAt(x)?-.12:x<900?.9:-.8;},prepare,draw,refine:refineLandscape});
