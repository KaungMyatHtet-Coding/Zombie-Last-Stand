import Phaser from 'phaser';
import '../src/style.css';
import { ArenaScene } from '../src/combat';
import { freshSave } from '../src/save';
import { AudioManager } from '../src/audio';
import { REWARDS } from '../src/progression';
import { rewardMarkup, spinReward } from '../src/reward-ui';
const save=freshSave();save.hero=location.search.includes('hammer')?'tank':'gunner';save.weapon=location.search.includes('hammer')?'hammer':'pistols';
const scene=new ArenaScene(save,new AudioManager(),()=>{},()=>{},()=>{});
const root=document.querySelector<HTMLElement>('#overlay')!;
const game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:1200,height:760,scene:[scene],scale:{mode:Phaser.Scale.RESIZE},audio:{noAudio:true}});
game.events.once('ready',()=>setTimeout(()=>{
 scene.stats.wave=15;scene.startWave();scene.x=600;scene.y=380;scene.render();for(const e of scene.enemies)e.active=false;
 scene.spawn('boss');const boss=scene.enemies.find(e=>e.active&&e.type==='boss')!;boss.x=850;boss.y=370;boss.targetX=660;boss.targetY=410;boss.telegraph=.5;boss.phase=2;
 for(let i=0;i<8;i++){scene.spawn(i%2?'runner':'basic');const e=scene.enemies.find(e=>e.active&&e.type!=='boss'&&e.x!==400+i*65)!;e.x=400+i*65;e.y=180+i%3*50;}
 scene.elapsed=10;scene.paused=true;scene.render();root.style.display='none';
 const controls=document.createElement('div');controls.style.cssText='position:fixed;bottom:24px;left:24px;z-index:100';controls.innerHTML='<button id="spin">Preview reward spin</button><span id="proof"></span>';document.body.append(controls);
 document.querySelector('#spin')!.addEventListener('click',()=>{root.style.display='grid';root.innerHTML=`<section class="panel"><div class="eyebrow">WAVE 15 CLEARED</div><h2>Supply roulette</h2>${rewardMarkup(REWARDS)}</section>`;let wins=0,ticks=0;spinReward(root,REWARDS,'shield',()=>true,()=>ticks++,()=>{wins++;scene.grantReward('shield');},()=>{document.querySelector('#proof')!.textContent=wins===1&&ticks===19&&scene.rewardShield===3?'PASS · one reward applied after visible spin':'FAIL';const close=document.createElement('button');close.textContent='Back to desert';close.onclick=()=>{root.style.display='none';scene.render();};root.querySelector('.panel')!.append(close);});});
},100));
