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
  const shimmer=layer(112,160), shimmerContext=shimmer.getContext('2d');
  shimmerContext.drawImage(painting,VENT.x-56,VENT.y-190,112,160,0,0,112,160);
  const shimmerData=shimmerContext.getImageData(0,0,112,160);
  for(let y=0;y<160;y++)for(let x=0;x<112;x++){
    const edge=Math.sin(x/111*Math.PI)*Math.sin(y/159*Math.PI);
    shimmerData.data[(y*112+x)*4+3]*=edge*.28;
  }
  shimmerContext.putImageData(shimmerData,0,0);
  return {heat,fractures,gas:gasSprite(random),warmGas:gasSprite(random,true),shimmer};
}

function draw({ctx,t,state,wind}) {
  ctx.save();
  // Molten pigment rolls in uneven currents; the heat mask anchors the cold crust.
  const flow=state.lavaFlow??=layer(1600,1000),lava=flow.getContext('2d');
  lava.clearRect(0,0,1600,1000);lava.lineCap='round';
  for(let y=370;y<915;y+=8){
    const drift=Math.sin(y*.035-t*1.8)*9+Math.sin(y*.08+t*.9)*4;
    lava.drawImage(state.heat,190,y,1090,8,190+drift,y+Math.sin(t*1.5+y*.04)*3,1090,8);
  }
  for (let i=0;i<state.fractures.length;i+=5) {
    const crack=state.fractures[i];
    const age=(t*.55+crack.phase)%1,pulse=Math.sin(age*Math.PI)**2;
    const surge=(Math.sin(crack.x*.025+crack.y*.017-t*2.4)+1)*.5;
    const travel=(age-.5)*34;
    const x=crack.x+crack.dx*travel,y=crack.y+crack.dy*travel;
    const length=crack.length*(4+surge*4),curl=Math.sin(t*2+crack.phase)*7;
    lava.strokeStyle=`rgba(238,${55+surge*65},12,${pulse*.95})`;
    lava.lineWidth=5+surge*5;
    lava.beginPath();lava.moveTo(x,y);
    lava.quadraticCurveTo(x+crack.dx*length*.5-crack.dy*curl,y+crack.dy*length*.5+crack.dx*curl,x+crack.dx*length,y+crack.dy*length);lava.stroke();
    lava.strokeStyle=`rgba(255,${150+surge*90},${35+surge*90},${pulse*(.4+surge*.6)})`;
    lava.lineWidth=1.5+surge*2;lava.stroke();
  }
  lava.globalCompositeOperation='destination-in';lava.drawImage(state.heat,0,0);
  lava.globalCompositeOperation='source-over';
  ctx.globalAlpha=1;ctx.drawImage(flow,0,0);
  ctx.globalCompositeOperation='screen';
  ctx.globalAlpha=.32+.2*Math.sin(t*1.7)+.08*Math.sin(t*3.1);ctx.drawImage(state.heat,0,0);
  ctx.restore();
  // A narrow, feathered strip of painted crust bends above the fixed hot vent.
  ctx.save();
  for (let y=0;y<160;y+=10) {
    const displacement=Math.sin(t*2.8+y*.075)*(.5+y/160*1.4);
    ctx.drawImage(state.shimmer,0,y,112,10,VENT.x-56+displacement,VENT.y-190+y,112,10);
  }
  ctx.restore();
  // A continuous stem fixes the source; overlapping expanding wisps carry it upward and left.
  ctx.save();ctx.globalAlpha=.5;
  ctx.drawImage(state.warmGas,VENT.x-105,VENT.y-165,200,175);
  for(let i=0;i<30;i++){
    const age=(t/11+i/30)%1,fade=Math.sin(age*Math.PI)**2;
    const w=160+age*430,h=130+age*170;
    const billow=Math.sin(t*.85+age*8+i*2.4)*age*52;
    const x=VENT.x-8-age*138+wind*age*35+billow;
    const y=VENT.y-age*420;
    ctx.globalAlpha=fade*.66;
    ctx.drawImage(age<.32?state.warmGas:state.gas,x-w*.5,y-h*.96,w,h);
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
