import {startScene} from './scene-painter.js';
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const blossom = (r, g, b) => clamp((r - g - 3) / 19) * clamp((b - g + 7) / 17) * clamp((r - 90) / 70) * clamp((b - r * .65) / 28);
const needle = (r, g, b) => clamp((g - r * .99 - 1) / 18) * clamp((g - b * 1.03) / 16) * clamp((205 - g) / 55);

function paintedFoliage(painting, pixels, W, region) {
  const layer = document.createElement('canvas'); layer.width = region.w; layer.height = region.h;
  const c = layer.getContext('2d');
  c.drawImage(painting, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);
  const image = c.getImageData(0, 0, region.w, region.h);
  for (let y = 0; y < region.h; y++) for (let x = 0; x < region.w; x++) {
    const local = (y * region.w + x) * 4;
    const at = ((region.y + y) * W + region.x + x) * 4;
    const r = pixels[at], g = pixels[at + 1], b = pixels[at + 2];
    const edge = Math.min(x, y, region.w - x - 1, region.h - y - 1);
    const material = region.kind === 'blossom' ? blossom(r, g, b) : needle(r, g, b);
    // Only original petals or needles move; architecture, woody stems, and bright sky are absent.
    image.data[local + 3] *= material * clamp(edge / 13);
  }
  c.putImageData(image, 0, 0);
  return {...region, layer};
}

function prepare({painting, pixels, W, random}) {
  const foliage = [
    {kind:'blossom',x:229,y:34,w:278,h:283,anchorX:345,anchorY:40,strength:.85,phase:.1},
    {kind:'blossom',x:411,y:139,w:194,h:271,anchorX:462,anchorY:138,strength:.65,phase:1.3},
    {kind:'blossom',x:18,y:155,w:250,h:354,anchorX:45,anchorY:174,strength:.85,phase:2.1},
    {kind:'blossom',x:969,y:0,w:380,h:297,anchorX:1319,anchorY:110,strength:.85,phase:1.1},
    {kind:'blossom',x:1079,y:270,w:366,h:348,anchorX:1402,anchorY:360,strength:1,phase:2.5},
    {kind:'blossom',x:1368,y:453,w:232,h:287,anchorX:1490,anchorY:467,strength:1.05,phase:3.3},
    {kind:'blossom',x:925,y:636,w:360,h:309,anchorX:1255,anchorY:711,strength:1.1,phase:4.3},
    {kind:'needle',x:65,y:362,w:298,h:349,anchorX:223,anchorY:434,strength:.72,phase:.4},
    {kind:'needle',x:286,y:466,w:325,h:310,anchorX:333,anchorY:579,strength:.8,phase:2.2},
    {kind:'needle',x:435,y:661,w:248,h:216,anchorX:522,anchorY:720,strength:.7,phase:3.8},
    {kind:'needle',x:824,y:89,w:270,h:329,anchorX:1007,anchorY:119,strength:.5,phase:4.8},
    {kind:'needle',x:1261,y:660,w:339,h:306,anchorX:1515,anchorY:799,strength:.7,phase:5.9},
  ].map(region => paintedFoliage(painting, pixels, W, region));
  const petals=[];
  for(let i=0;i<64;i++){
    const branch=foliage[i%7];let x,y;
    for(let attempt=0;attempt<80;attempt++){
      x=branch.x+random()*branch.w;y=branch.y+random()*branch.h;
      const at=((y|0)*W+(x|0))*4;
      if(blossom(pixels[at],pixels[at+1],pixels[at+2])>.38)break;
    }
    petals.push({x,y,phase:random(),duration:12+random()*10,fall:350+random()*450,
      drift:80+random()*170,size:3+random()*3,turn:random()*6.28,tone:i%3});
  }
  return {foliage,petals};
}

function draw({ctx, t, state, wind}) {
  for (const branch of state.foliage) {
    const delayed = t - branch.x * .0013;
    const gust = Math.sin(delayed * .73) * .47 + wind * .5;
    const rustle = Math.sin(t * 2.6 + branch.phase) * .085 + Math.sin(t * 4.1 + branch.phase * 2) * .035;
    const bend = (gust + rustle) * branch.strength;
    ctx.save(); ctx.translate(branch.anchorX, branch.anchorY);
    // A shear pivots the photographed cluster around its fixed woody attachment.
    ctx.transform(1, 0, bend * .016, 1, 0, 0);
    ctx.rotate(bend * .0025);
    ctx.globalAlpha = .93;
    ctx.drawImage(branch.layer, branch.x - branch.anchorX, branch.y - branch.anchorY);
    ctx.restore();
  }
  for(const petal of state.petals){
    const age=(t/petal.duration+petal.phase)%1,flutter=Math.sin(t*2.3+petal.turn);
    const x=petal.x+age*petal.drift+Math.sin(age*10+petal.turn)*24*age;
    const y=petal.y+age*petal.fall;
    ctx.save();ctx.globalAlpha=clamp(age/.07)*clamp((1-age)/.18)*.94;
    ctx.translate(x,y);ctx.rotate(age*7+petal.turn+flutter*.5);
    ctx.scale(.4+Math.abs(Math.cos(t*1.7+petal.turn))*.6,1);
    ctx.fillStyle=['#f1a7c3','#ffd0db','#d77ca9'][petal.tone];
    ctx.beginPath();ctx.moveTo(-petal.size,0);ctx.quadraticCurveTo(-petal.size,-petal.size,0,-petal.size*.7);
    ctx.quadraticCurveTo(petal.size*1.5,-petal.size*.2,petal.size*.6,petal.size*.5);
    ctx.quadraticCurveTo(0,petal.size, -petal.size,0);ctx.fill();
    ctx.strokeStyle='rgba(255,226,231,.65)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-petal.size*.6,0);ctx.lineTo(petal.size*.5,-petal.size*.3);ctx.stroke();ctx.restore();
  }
  // Small chalky curls make the breeze visible between the flowering branches.
  for(const [i,origin] of [[390,500],[1050,420],[670,550]].entries()){
    const age=(t/15+(i===2?.18:i/3))%1,fade=Math.sin(age*Math.PI)**2;
    ctx.save();ctx.globalAlpha=fade*.72;ctx.translate(origin[0]+age*95,origin[1]+Math.sin(age*6.28)*16);
    ctx.strokeStyle='#f5e7d5';ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-90,9);
    ctx.bezierCurveTo(-54,-12,-20,-8,5,5);
    for(let j=0;j<=50;j++){
      const u=j/50,a=-Math.PI*.5+u*Math.PI*2.3,r=23*(1-u)+2;
      ctx.lineTo(5+Math.cos(a)*r,30+Math.sin(a)*r);
    }
    ctx.stroke();ctx.restore();
  }
}

startScene({
  liveVersion:4,
  id:'beaumont', guide:'assets/beaumont/guide.webp', cache:'assets/beaumont/painting-v4.webp',
  background:'#7b8d72', focusX:.445, focusY:.47, initialScroll:.25,
  grade:(r, g, b, x, y) => {
    const light = r * .3 + g * .55 + b * .15;
    const flower=blossom(r,g,b),pine=needle(r,g,b);
    const front=Math.max(flower,pine);
    const architecture=x>545&&x<850?clamp((r-g+16)/42)*clamp((r-b+20)/50):0;
    return [r*(.87+front*.15-architecture*.08)+light*.06+12-front*8+architecture*10,
      g*(.87+front*.13-architecture*.08)+light*.06+12-front*9+architecture*13,
      b*(.84+front*.1-architecture*.08)+light*.08+12-front*11+architecture*19];
  },
  angle:(x, y) => x > 545 && x < 850 && y > 70 && y < 920 ? 1.56 : -.7 + Math.sin(x * .015 + y * .008) * .55,
  prepare, draw,
});
