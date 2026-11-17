const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const b=await chromium.launch();const out=path.join(os.tmpdir(),'beaumont-flow-'+(process.env.SCENE_URL?.startsWith('https')?'production':'local'));fs.mkdirSync(out,{recursive:true});try{
for(const width of [1600,390]){
 const p=await b.newPage({viewport:{width,height:width===1600?1000:844}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto((process.env.SCENE_URL||'http://127.0.0.1:5173')+'/tech-blog');await p.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');await p.evaluate(()=>window.pauseScene(true));
 const result=await p.evaluate(()=>{
 const canvas=document.querySelector('#motion'),g=canvas.getContext('2d'),fill=g.fillRect,terrain=document.querySelector('#landscape').toDataURL();let marks=[];
 g.fillRect=function(x,y,w,h){if(y===-2&&h===4){const m=this.getTransform();marks.push({x:m.e,y:m.f,angle:Math.atan2(m.b,m.a),alpha:this.globalAlpha,color:this.fillStyle});}return fill.call(this,x,y,w,h);};
 const frames=[];try{for(const t of [0,.25,.5]){marks=[];window.seekScene(t);frames.push(marks);}}finally{g.fillRect=fill;}
 const visible=frames[0].map((a,i)=>({a,b:frames[1][i]})).filter(({a,b})=>a.alpha>.15&&b.alpha>.15);
 const distance=visible.map(({a,b})=>Math.hypot(b.x-a.x,b.y-a.y));
 const follows=visible.filter(({a,b})=>(b.x-a.x)*Math.cos(a.angle)+(b.y-a.y)*Math.sin(a.angle)>0).length;
 const directions=visible.map(({a,b})=>({dx:b.x-a.x,dy:b.y-a.y}));
 const neutral=frames[0].every(({color})=>{const rgb=color.match(/\w\w/g).map(v=>parseInt(v,16));return Math.max(...rgb)-Math.min(...rgb)<8;});
 return {count:frames[0].length,visible:visible.length,distance,follows,neutral,spirals:directions.some(d=>d.dx>2)&&directions.some(d=>d.dx<-2)&&directions.some(d=>d.dy>2)&&directions.some(d=>d.dy<-2),fixed:terrain===document.querySelector('#landscape').toDataURL()};
 });
 assert.ok(result.count>100);assert.ok(result.visible>result.count*.7);assert.ok(result.distance.every(d=>d>1&&d<40));assert.ok(result.follows>result.visible*.95);assert.ok(result.spirals&&result.neutral&&result.fixed);assert.deepEqual(errors,[]);
 for(const t of [0,.4,.8,1.2]){await p.evaluate(t=>window.seekScene(t),t);await p.screenshot({path:path.join(out,`${width}-${t}.png`)});}
 console.log({width,marks:result.count,moving:result.visible,spirals:result.spirals,follows:result.follows,neutral:result.neutral,fixed:result.fixed});await p.close();
}
console.log(out);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
