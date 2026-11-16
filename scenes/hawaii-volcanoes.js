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
  const sprite = layer(260, 380), c = sprite.getContext('2d');
  // Dry, overlapping wisps retain a coherent tapered volume without blurred smoke circles.
  for (let i=0; i<5200; i++) {
    const y=random()*380, vertical=y/380;
    const center=130+Math.sin(vertical*7)*15;
    const spread=20+(1-vertical)*94;
    const x=center+(random()-.5)*spread*2;
    const envelope=Math.max(0,1-Math.abs(x-center)/spread)*Math.sin(vertical*Math.PI);
    const glow=warm?vertical:0;
    const r=134+glow*70, g=141+glow*22, b=160-glow*59;
    c.strokeStyle=`rgba(${r|0},${g|0},${b|0},${envelope*(.035+random()*.075)})`;
    c.lineWidth=.5+random()*3.2; c.lineCap='round';
    const length=3+random()*18;
    c.beginPath(); c.moveTo(x,y);
    c.quadraticCurveTo(x+length*.3,y-length*.5,x+length*.7,y-length); c.stroke();
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
  return {heat,fractures,rimVents,gas:gasSprite(random),warmGas:gasSprite(random,true),shimmer};
}

function draw({ctx,t,state,wind}) {
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
  ctx.save();ctx.globalAlpha=.18;
  ctx.drawImage(state.warmGas,VENT.x-56,VENT.y-140,100,145);
  for(let i=0;i<9;i++){
    const age=(t*.07+i/9)%1,fade=Math.sin(age*Math.PI);
    const w=66+age*220,h=100+age*235;
    const x=VENT.x-8-age*139+wind*age*16;
    const y=VENT.y-age*345;
    ctx.globalAlpha=fade*.36;
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

startScene({
  id:'hawaii-volcanoes',
  guide:'assets/hawaii-volcanoes/guide.jpg',
  cache:'assets/hawaii-volcanoes/painting.webp',
  background:'#252532',focusX:.61,focusY:.57,initialScroll:.86,
  grade:(r,g,b,x,y)=>{
    sourceLight ??= new Float32Array(1600 * 1000);
    sourceLight[y*1600+x]=r*.3+g*.55+b*.15;
    const hot=r>g*1.55&&r>b*1.8&&r>90;
    if(hot)return [Math.min(255,r*1.025+4),Math.min(255,g*1.075+4),b*.92+8];
    // Lift real terraces out of darkness without turning the night scene gray.
    const dusk=y<145?1:.92;
    return [r*.98+13*dusk,g*.98+14*dusk,b*.99+19*dusk];
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
