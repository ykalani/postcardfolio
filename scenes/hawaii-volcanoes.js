import {startScene} from './scene-painter.js';

const VENT = {x:1001, y:842};
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
let sourceLight;

function layer(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  return canvas;
}

function gasSprite(random, warm = false) {
  const sprite=layer(260,380),c=sprite.getContext('2d');
  c.lineCap='butt';
  // Separated loaded-brush dabs retain broken edges instead of accumulating into smooth haze.
  for(let i=0;i<530;i++){
    const y=15+random()*350,v=y/380,center=130+Math.sin(v*7)*15;
    const spread=24+(1-v)*84,x=center+(random()-.5)*spread*2;
    const envelope=Math.max(0,1-Math.abs(x-center)/spread)*Math.sin(v*Math.PI);
    if(random()>envelope)continue;
    const glow=warm?v:0,variation=(random()-.5)*30;
    const rgb=[120+glow*58+variation,132+glow*17+variation,150-glow*42+variation].map(value=>Math.round(value/24)*24);
    const length=7+random()*11,breadth=5+random()*5,angle=-1.1+Math.sin(v*9)*.6+(random()-.5)*.5;
    const dx=Math.cos(angle),dy=Math.sin(angle),nx=-dy,ny=dx;
    c.strokeStyle=`rgba(${rgb.join(',')},${envelope*.38})`;c.lineWidth=breadth*.7;
    c.beginPath();c.moveTo(x,y);c.lineTo(x+dx*length*.9,y+dy*length*.9);c.stroke();
    for(let bristle=0;bristle<5;bristle++){
      const off=(bristle/4-.5)*breadth,cut=random()*length*.18;
      c.strokeStyle=`rgba(${rgb.join(',')},${envelope*(.35+random()*.4)})`;c.lineWidth=breadth/5*(.7+random()*.4);
      c.beginPath();c.moveTo(x+nx*off+dx*cut,y+ny*off+dy*cut);
      c.quadraticCurveTo(x+dx*length*.5+nx*(off+1),y+dy*length*.5+ny*(off+1),x+dx*length+nx*off,y+dy*length+ny*off);c.stroke();
    }
  }
  return sprite;
}

function smokeBank(random) {
  const sprite=layer(600,220),c=sprite.getContext('2d');
  c.lineCap='butt';
  for(let i=0;i<6500;i++){
    const x=random()*600,y=random()*220;
    const center=110+Math.sin(x*.013)*28+Math.sin(x*.031)*9;
    const envelope=Math.max(0,1-Math.abs(y-center)/75)*Math.sin(x/600*Math.PI);
    if(!envelope)continue;
    const tone=76+random()*30;
    c.strokeStyle=`rgba(${tone|0},${(tone+3)|0},${(tone+14)|0},${envelope*(.055+random()*.12)})`;
    c.lineWidth=1+random()*3.5;c.beginPath();c.moveTo(x,y);
    c.quadraticCurveTo(x+8,y-3,x+14+random()*17,y-2+random()*4);c.stroke();
  }
  return sprite;
}

function prepare({pixels, painting, random, W, H}) {
  const heat=layer(W,H), heatContext=heat.getContext('2d');
  const heatPixels=heatContext.createImageData(W,H);
  const fractures=[];
  const warmth=(x,y)=>{
    const at=(clamp(y|0,0,H-1)*W+clamp(x|0,0,W-1))*4;
    return Math.max(0,pixels[at]-pixels[at+1]*1.3-pixels[at+2]*.2);
  };
  for (let y=370;y<915;y++) for (let x=190;x<1280;x++) {
    const at=(y*W+x)*4, r=pixels[at], g=pixels[at+1], b=pixels[at+2];
    if (r<115 || r<g*1.55 || r<b*1.8) continue;
    heatPixels.data[at]=Math.min(255,r+22);
    heatPixels.data[at+1]=Math.min(245,g+25);
    heatPixels.data[at+2]=Math.max(19,b);
    heatPixels.data[at+3]=Math.min(185,(r-g)*1.2);
    if (x%2 || y%2 || random()>.22) continue;
    const dx=warmth(x+2,y)-warmth(x-2,y), dy=warmth(x,y+2)-warmth(x,y-2);
    const angle=Math.atan2(dy,dx)+Math.PI*.5;
    fractures.push({x,y,dx:Math.cos(angle),dy:Math.sin(angle),
      length:1.3+random()*2.4,phase:x*.014-y*.009+random()*.7,
      red:Math.min(255,r+27),green:Math.min(240,g+35),blue:Math.max(20,b)});
  }
  heatContext.putImageData(heatPixels,0,0);
  // These origins follow gas visible along the photographed crater margins.
  const rimVents=[
    {x:162,y:590,size:108,rise:100,strength:.13,phase:.2},
    {x:639,y:371,size:85,rise:105,strength:.12,phase:.8},
    {x:1117,y:482,size:84,rise:100,strength:.12,phase:.45},
    {x:1402,y:562,size:100,rise:130,strength:.12,phase:.68}
  ];
  const shimmer=layer(112,160), shimmerContext=shimmer.getContext('2d');
  shimmerContext.drawImage(painting,VENT.x-56,VENT.y-190,112,160,0,0,112,160);
  const shimmerData=shimmerContext.getImageData(0,0,112,160);
  for(let y=0;y<160;y++)for(let x=0;x<112;x++){
    const edge=Math.sin(x/111*Math.PI)*Math.sin(y/159*Math.PI);
    shimmerData.data[(y*112+x)*4+3]*=edge*.28;
  }
  shimmerContext.putImageData(shimmerData,0,0);
  return {ceilingSmoke:smokeBank(random),heat,fractures,rimVents,gas:gasSprite(random),warmGas:gasSprite(random,true),shimmer};
}

function draw({ctx,t,state,wind}) {
  // Overlapping painted banks drift through the existing gray ceiling and fade at each cycle end.
  ctx.save();
  for(let i=0;i<5;i++){
    const age=(t/28+i/5)%1,fade=Math.sin(age*Math.PI)**2;
    const width=760+age*390,height=200+age*85;
    ctx.globalAlpha=fade*.58;
    ctx.drawImage(state.ceilingSmoke,1420-age*2200,-90+Math.sin(age*6.28)*28,width,height);
  }
  ctx.restore();

  ctx.save(); ctx.globalCompositeOperation='screen';
  // Incandescence follows real source fractures, with spatially traveling slow heat variation.
  ctx.globalAlpha=.13+.025*Math.sin(t*.61); ctx.drawImage(state.heat,0,0);
  ctx.globalAlpha=1;ctx.lineCap='round';
  for (const crack of state.fractures) {
    const pulse=(Math.sin(crack.phase-t*.84)+1)*.5;
    ctx.strokeStyle=`rgba(${crack.red},${crack.green},${crack.blue},${.06+pulse*.3})`;
    ctx.lineWidth=.45+pulse*.5;
    ctx.beginPath();ctx.moveTo(crack.x,crack.y);
    ctx.lineTo(crack.x+crack.dx*crack.length,crack.y+crack.dy*crack.length);ctx.stroke();
  }
  ctx.restore();
  // A narrow, feathered strip of painted crust bends above the fixed hot vent.
  ctx.save();
  for (let y=0;y<160;y+=10) {
    const displacement=Math.sin(t*2.2+y*.075)*(.25+y/160*.65);
    ctx.drawImage(state.shimmer,0,y,112,10,VENT.x-56+displacement,VENT.y-190+y,112,10);
  }
  ctx.restore();
  // A continuous stem fixes the source; overlapping expanding wisps carry it upward and left.
  ctx.save();ctx.globalAlpha=.3;
  ctx.drawImage(state.warmGas,VENT.x-56,VENT.y-140,100,145);
  for(let i=0;i<6;i++){
    const age=(t/11+i/6)%1,fade=Math.sin(age*Math.PI)**2;
    const w=74+age*146,h=120+age*140;
    const x=VENT.x-8-age*138+wind*age*22;
    const y=VENT.y-age*420;
    ctx.globalAlpha=fade*.66;
    ctx.drawImage(age<.32?state.warmGas:state.gas,x-w*.5,y-h*.96,w,h);
  }
  for(const vent of state.rimVents)for(let i=0;i<3;i++){
    const age=(t*.045+vent.phase+i/3)%1;
    const w=vent.size*(.35+age*.65),h=w*1.4;
    ctx.globalAlpha=Math.sin(age*Math.PI)*vent.strength;
    ctx.drawImage(state.gas,vent.x-age*22+wind*age*5-w*.5,vent.y-age*vent.rise-h*.92,w,h);
  }
  ctx.restore();
}

startScene({liveVersion:5,
  id:'hawaii-volcanoes',
  guide:'assets/hawaii-volcanoes/guide.jpg',
  cache:'assets/hawaii-volcanoes/painting-v5.webp',
  background:'#252532',focusX:.61,focusY:.57,initialScroll:.86,
  grade:(r,g,b,x,y)=>{
    sourceLight ??= new Float32Array(1600 * 1000);
    sourceLight[y*1600+x]=r*.3+g*.55+b*.15;
    const hot=r>g*1.55&&r>b*1.8&&r>90;
    if(hot)return [Math.min(255,r*1.025+4),Math.min(255,g*1.075+4),b*.92+8];
    // Lift real terraces out of darkness without turning the night scene gray.
    const dusk=y<145?1:.92;
    const near=clamp((y-660)/230,0,1),far=clamp((450-y)/350,0,1);
    return [r*(.98+near*.13-far*.09)+13*dusk-near*10+far*4,
      g*(.98+near*.1-far*.09)+14*dusk-near*9+far*7,
      b*(.99+near*.04-far*.09)+19*dusk-near*16+far*16];
  },
  angle:(x,y)=>{
    if(y<145)return -.035;
    const at=y*1600+x;
    const dx=sourceLight[Math.min(1599999,at+2)]-sourceLight[Math.max(0,at-2)];
    const dy=sourceLight[Math.min(1599999,at+3200)]-sourceLight[Math.max(0,at-3200)];
    return Math.abs(dx)+Math.abs(dy)>2?Math.atan2(dy,dx)+Math.PI*.5:.08;
  },
  prepare,draw
});
