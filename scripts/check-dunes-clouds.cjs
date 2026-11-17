const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});
  const output=process.env.QA_OUTPUT||path.join(os.tmpdir(),'postcardfolio-dunes-clouds');fs.mkdirSync(output,{recursive:true});
  try{
    for(const width of [1600,390]){
      const page=await browser.newPage({viewport:{width,height:width===1600?1000:844}}),errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(`${process.env.SCENE_URL||'http://127.0.0.1:5178'}/projects`);
      await page.waitForFunction(()=>document.documentElement.dataset.sceneComplete==='true');
      await page.evaluate(()=>{window.pauseScene(true);window.seekScene(0);});
      await page.screenshot({path:path.join(output,`${width}-initial.png`)});
      await page.evaluate(()=>scrollTo(0,0));
      for(const t of [0,3,6,24,31]){
        await page.evaluate(t=>window.seekScene(t),t);
        await page.screenshot({path:path.join(output,`${width}-t${t}.png`)});
      }
      if(width===1600){
        const report=await page.evaluate(()=>{
          const c=document.querySelector('#motion').getContext('2d');
          const read=()=>[c.getImageData(0,100,1600,140).data,c.getImageData(450,300,400,150).data,c.getImageData(300,600,1000,220).data,c.getImageData(0,860,1600,140).data];
          const delta=(a,b)=>a.reduce((sum,v,i)=>sum+Math.abs(v-b[i]),0);
          window.seekScene(0);const first=read();window.seekScene(3);const next=read();
          const movement=first.map((v,i)=>delta(v,next[i]));
          const seams=[28,68,108].map(t=>{
            window.seekScene(t-.001);const a=read()[0];window.seekScene(t+.001);return delta(a,read()[0]);
          });
          const proto=CanvasRenderingContext2D.prototype,draw=proto.drawImage;
          const ids=new WeakMap();let serial=0,positions=new Map(),last=new Map(),backwards=0,gaps=0,frames=0;
          const roots=new WeakMap();let rootDrift=0,swayMin=0,swayMax=0,mountainLeak=0;
          proto.drawImage=function(sprite,...args){
            const sky=this.canvas.width===1600&&this.canvas.height===440&&sprite.width<1000;
            if(sky&&args[0]+sprite.width>0&&args[0]<1600){
              if(!ids.has(sprite))ids.set(sprite,serial++);positions.set(ids.get(sprite),args[0]);
            }
            if(this.canvas===document.querySelector('#motion')&&args[0]===-sprite.width/2&&args[1]===-sprite.height){
              const matrix=this.getTransform(),root=[matrix.e,matrix.f];
              if(roots.has(sprite)&&Math.hypot(...root.map((v,i)=>v-roots.get(sprite)[i]))>.1)rootDrift++;
              roots.set(sprite,root);swayMin=Math.min(swayMin,matrix.c);swayMax=Math.max(swayMax,matrix.c);
            }
            return draw.call(this,sprite,...args);
          };
          try{
            for(let t=0;t<120;t+=.5){
              positions=new Map();window.seekScene(t);frames++;if(!positions.size)gaps++;
              const mountain=c.getImageData(950,175,40,50).data;
              for(let i=3;i<mountain.length;i+=4)if(mountain[i])mountainLeak++;
              for(const [id,x] of positions)if(last.has(id)&&x<last.get(id))backwards++;
              last=positions;
            }
          }finally{proto.drawImage=draw;}
          const stream={backwards,gaps,frames};
          return{movement,seams,stream,brush:{rootDrift,swayMin,swayMax},mountainLeak};
        });
        assert.ok(report.movement[0]>10000,'Sky clouds visibly change within three seconds');
        assert.equal(report.movement[1],0,'Mountains stay fixed');
        assert.ok(report.movement[2]>10000,'Wind moves painted sand on the new dune ridges');
        assert.ok(report.movement[3]>10000,'Foreground brush moves');
        assert.ok(report.seams.every(energy=>energy<report.movement[0]*.05),'Cloud wrapping has no visible pop');
        assert.equal(report.stream.backwards,0,'Every cloud bank travels left to right');
        assert.ok(report.stream.gaps>=12&&report.stream.gaps<report.stream.frames/2,'Cloud stream has recurring clear intervals');
        assert.equal(report.mountainLeak,0,'Clouds stay behind the mountain faces');
        assert.equal(report.brush.rootDrift,0,'Foreground brush roots stay fixed');
        assert.ok(report.brush.swayMin<-.15&&report.brush.swayMax>.15,'Foreground brush bends visibly in both directions');
        console.log(JSON.stringify(report));
      }
      assert.deepEqual(errors,[]);await page.close();
    }
    console.log(`Passed: intermittent clouds, windblown sand, dry brush and fixed mountains. Screenshots: ${output}`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
