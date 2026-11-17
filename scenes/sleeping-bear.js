import {startScene} from './scene-painter.js';
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const W = 1600, H = 1000;
// Traced directly in the reference's 1600x1000 center crop; no generated poses or rescaling.
const BOATS = [
  {depth:1,parts:[
    [[130,695],[167,700],[218,701],[264,695],[269,700],[256,712],[194,720],[151,724],[135,719]],
    [[173,697],[176,687],[182,683],[183,675],[186,669],[194,670],[199,677],[198,683],[207,688],[213,697]],
    [[217,696],[218,686],[225,680],[225,668],[231,663],[241,664],[245,669],[244,678],[249,685],[254,695]],
    [[100,702],[121,697],[137,698],[138,704],[121,711],[100,709]],
    [[164,670],[177,672],[186,679],[181,686],[169,681],[162,677]],
    [[253,695],[275,694],[279,700],[257,705]]
  ],shafts:[[[132,702],[191,689],[262,698]],[[178,681],[204,696],[225,714]]]},
  {depth:1,parts:[
    [[789,672],[831,677],[882,681],[932,681],[972,683],[961,690],[911,694],[841,695],[799,687]],
    [[854,681],[858,676],[869,672],[870,664],[875,662],[880,666],[879,672],[885,678],[890,682]],
    [[905,683],[910,674],[916,670],[916,662],[921,659],[925,663],[924,670],[932,676],[938,683]],
    [[847,660],[852,660],[861,674],[859,680],[855,676]],
    [[932,673],[943,671],[948,676],[942,682]]
  ],shafts:[[[854,670],[865,678],[881,685]],[[915,682],[933,676],[943,675]]]},
  // The small kayak behind the right-hand yellow one has its own float/depth.
  {depth:0,parts:[
    [[1168,675],[1201,675],[1240,678],[1289,674],[1300,677],[1288,683],[1207,686],[1175,683]],
    [[1189,677],[1192,667],[1196,660],[1203,659],[1208,665],[1208,671],[1217,675],[1220,682]],
    [[1248,677],[1250,668],[1255,664],[1256,657],[1263,656],[1267,662],[1266,668],[1274,675],[1276,680]],
    [[1167,674],[1180,672],[1186,676],[1181,681]]
  ],shafts:[[[1178,676],[1200,670],[1220,678]],[[1257,675],[1273,677],[1292,678]]]},
  {depth:2,parts:[
    [[1155,697],[1190,692],[1235,694],[1280,691],[1330,686],[1370,679],[1398,675],[1401,681],[1394,699],[1363,708],[1230,711],[1175,707]],
    [[1207,695],[1205,683],[1212,679],[1216,671],[1223,666],[1230,669],[1231,676],[1238,680],[1246,687],[1242,696]],
    [[1254,694],[1257,684],[1269,681],[1270,673],[1276,668],[1283,669],[1286,676],[1283,682],[1290,686],[1295,693]],
    [[1214,653],[1220,647],[1226,649],[1233,664],[1229,672],[1222,669]]
  ],shafts:[[[1226,664],[1232,681],[1242,704]],[[1275,684],[1287,688],[1307,696]]]}
];
const SHORE = [[0,667],[155,687],[660,691],[810,681],[920,673],[1040,667],[1350,695],[1600,711]];
let kayakSprites;

async function prepareKayakArt({ctx,sourcePixels,random}) {
  const {paintBrushwork}=await import('./brush-painting.js');
  kayakSprites=[];
  for(const boat of BOATS){
    const points=[...boat.parts.flat(),...boat.shafts.flat()],xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
    const x=Math.min(...xs)-16,y=Math.min(...ys)-16,w=Math.max(...xs)-x+17,h=Math.max(...ys)-y+17;
    const mask=canvas(w,h),m=mask.getContext('2d'),sprite=canvas(w,h),c=sprite.getContext('2d');
    for(const points of boat.parts){
      m.beginPath();points.forEach(([px,py],i)=>i?m.lineTo(px-x,py-y):m.moveTo(px-x,py-y));m.closePath();m.fill();
    }
    const silhouette=m.getImageData(0,0,w,h),samples=new Uint8ClampedArray(w*h*4);
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
      const local=(yy*w+xx)*4,at=((y+yy)*W+x+xx)*4;
      for(let k=0;k<3;k++)samples[local+k]=sourcePixels[at+k];
      samples[local+3]=255;
      const r=samples[local],g=samples[local+1],b=samples[local+2];
      if(b>r*1.12&&b>g*.99&&r+g+b>350)silhouette.data[local+3]=0;
    }
    // The trace places stroke centers only; full bristle marks form every visible edge.
    await paintBrushwork({ctx:c,pixels:samples,width:w,height:h,random,scale:.65,pigmentStep:32,
      skip:(px,py)=>silhouette.data[(py*w+px)*4+3]<200,
      angle:(px,py)=>y+py>=boat.parts[0][0][1]-3?-.04:1.2});
    c.strokeStyle='#34473c';c.lineCap='butt';
    for(const points of boat.shafts)for(let i=1;i<points.length;i++){
      const [ax,ay]=points[i-1],[bx,by]=points[i],length=Math.hypot(bx-ax,by-ay);
      for(let d=0;d<length;d+=5){
        c.save();c.translate(ax-x+(bx-ax)*d/length,ay-y+(by-ay)*d/length);c.rotate(Math.atan2(by-ay,bx-ax));
        for(let bristle=-1;bristle<=1;bristle++){
          c.globalAlpha=.5+random()*.35;c.lineWidth=.4+random()*.4;
          c.beginPath();c.moveTo(-1,bristle*.65);c.lineTo(2+random()*3,bristle*.65+(random()-.5)*.4);c.stroke();
        }
        c.restore();
      }
    }
    kayakSprites.push({sprite,x,y,w,h});
  }
  // Remove the reference kayakers from the original painting before adding independent sprites.
  const original=ctx.getImageData(0,0,W,H),clean=ctx.getImageData(0,0,W,H);
  const repairs=[[80,640,215,100,300],[775,640,220,80,650],[1135,632,290,108,1430]];
  for(const [left,top,width,height,cliffX] of repairs){
    for(let y=top;y<top+height;y++)for(let x=left;x<left+width;x++){
      const at=(y*W+x)*4,edge=Math.min(x-left,y-top,left+width-x-1,top+height-y-1),blend=clamp(edge/12);
      const wet=y>=shoreAt(x),sky=x>910-(y-620)*.9&&x<1270+(y-620)*.1;
      const island=sky&&x>1100&&x<1250&&y<665;
      const u=Math.floor((x-left)*35/width);
      const sampleX=wet?x:island?1080+u:sky?940+u:cliffX+u;
      const from=((wet?y+74:y)*W+sampleX)*4;
      for(let k=0;k<3;k++)clean.data[at+k]=original.data[at+k]*(1-blend)+original.data[from+k]*blend;
    }
  }
  const study=canvas(W,H),studyContext=study.getContext('2d');studyContext.putImageData(clean,0,0);
  for(const [left,top,width,height] of repairs){
    const patch=canvas(width,height),c=patch.getContext('2d');
    await paintBrushwork({ctx:c,pixels:studyContext.getImageData(left,top,width,height).data,
      width,height,random,angle:(x,y)=>top+y>shoreAt(left+x)?-.025:left+x>1270?1.3:.05});
    const paint=c.getImageData(0,0,width,height);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++)paint.data[(y*width+x)*4+3]*=clamp(Math.min(x,y,width-x-1,height-y-1)/12);
    c.putImageData(paint,0,0);ctx.drawImage(patch,left,top);
  }
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
function prepareBoats(){
  return BOATS.map((boat,index)=>({...kayakSprites[index],depth:boat.depth,phase:index*1.9,range:boat.depth===0?2.2:3.5+index*.3}));
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
  // Preserve the painted silhouette while the leaf tips flex.
  c.putImageData(image,0,0);
  return {...region,layer};
}

function prepare({painting,pixels,random}) {
  const boats=prepareBoats();
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
  const leafSprites=['#465c38','#647347','#394f32','#7c8050'].map(color=>{
    const sprite=canvas(22,14),c=sprite.getContext('2d');
    c.strokeStyle=color;c.lineCap='butt';
    for(let i=0;i<16;i++){
      const x=7+random()*7,y=5+random()*4;
      c.globalAlpha=.55+random()*.35;c.lineWidth=.6+random()*1.2;
      c.beginPath();c.moveTo(x-2-random()*3,y-1);c.lineTo(x+2+random()*3,y+random()*2-1);c.stroke();
    }
    return sprite;
  });
  for(let i=0;i<10;i++){
    const region=foliage[i%foliage.length];let x,y;
    for(let attempt=0;attempt<80;attempt++){
      x=region.x+random()*region.w;y=region.y+random()*region.h;
      const at=((y|0)*W+(x|0))*4;
      if(pixels[at+1]>pixels[at]*1.02&&pixels[at+1]>pixels[at+2]*1.1)break;
    }
    leaves.push({x,y,phase:random(),duration:21+random()*12,fall:280+random()*220,
      drift:80+random()*150,size:3+random()*3,turn:random()*6.28,tone:i%leafSprites.length});
  }
  return {water,mask,wavelets,foliage,painting,boats,leaves,leafSprites};
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
  for(const boat of [...state.boats].sort((a,b)=>a.depth-b.depth)){
    const drift=(Math.sin(t*.22+boat.phase)-Math.sin(boat.phase))*boat.range*3;
    const depth=.7+boat.depth*.35;
    const wave=((Math.sin(t*.85+boat.phase)-Math.sin(boat.phase))*1.25+(Math.sin(t*1.3+boat.phase*1.7)-Math.sin(boat.phase*1.7))*.35)*depth;
    const roll=(Math.cos(t*.85+boat.phase)-Math.cos(boat.phase))*.004*depth;
    ctx.save();ctx.translate(boat.x+boat.w*.5+drift,boat.y+boat.h*.8+wave);
    ctx.rotate(roll);ctx.drawImage(boat.sprite,-boat.w*.5,-boat.h*.8);ctx.restore();
    // Small broken pressure ripples follow the hull, with independent fade rather than a dashed outline.
    for(let ring=0;ring<3;ring++){
      const age=(t*.12+boat.phase*.1+ring/3)%1,fade=Math.sin(age*Math.PI)**2;
      const cx=boat.x+boat.w*.5+drift,cy=boat.y+boat.h-10+age*7;
      ctx.save();ctx.globalAlpha=fade*.16;ctx.lineCap='butt';ctx.lineWidth=.65;
      for(let part=0;part<4;part++){
        const x=cx-boat.w*.3+part*boat.w*.18+Math.sin(part*2.3+boat.phase)*3;
        ctx.strokeStyle=part%2?'#315e59':'#bbcbb0';ctx.beginPath();ctx.moveTo(x,cy);
        ctx.quadraticCurveTo(x+boat.w*.03,cy+1.2,x+boat.w*.075,cy+.3);ctx.stroke();
      }
      ctx.restore();
    }
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
    ctx.scale(leaf.size/7,leaf.size/7);
    ctx.drawImage(state.leafSprites[leaf.tone],-11,-7);ctx.restore();
  }
}

startScene({
  liveVersion:12,
  id:'sleeping-bear',guide:'assets/sleeping-bear/guide.webp',cache:'assets/sleeping-bear/painting-v12.webp',
  background:'#9cb8ad',focusX:.645,focusY:.53,initialScroll:.72,
  grade:(r,g,b,x,y)=>{
    const light=r*.3+g*.55+b*.15;
    const leaf=clamp((g-r*.94-2)/30)*clamp((g-b*1.02)/28)*clamp((360-y)/160);
    const nearRock=clamp((x-1050)/430)*clamp((r-b)/70)*clamp((670-y)/150);
    return [r*(.9+leaf*.28+nearRock*.11)+light*.045+9-leaf*49+nearRock*5,
      g*(.91+leaf*.27+nearRock*.06)+light*.035+8-leaf*43-nearRock*5,
      b*(.89+leaf*.18)+light*.045+10-leaf*42-nearRock*15];
  },
  angle:(x,y)=>y>665?-.025:x>1270?1.3:.045+Math.sin(x*.011+y*.005)*.19,
  prepare,draw,refine:prepareKayakArt
});
