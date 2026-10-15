import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
import {wrecksNear,separateWrecks} from '../src/map-ground';
const scene=new ArenaScene(freshSave(),new AudioManager(),()=>{},()=>{},()=>{});
new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:innerWidth,height:innerHeight,scene:[scene],scale:{mode:Phaser.Scale.RESIZE},audio:{noAudio:true}});
const ready=setInterval(()=>{if(!scene.visuals)return;clearInterval(ready);scene.paused=true;const car=wrecksNear(300,300).find(c=>c.x>0&&c.y>0)!;scene.x=car.x+115;scene.y=car.y+60;for(let i=0;i<3;i++){scene.spawn(i===1?'runner':'basic');const e=scene.enemies.filter(e=>e.active).at(-1)!;e.x=scene.x+65-i*55;e.y=scene.y-110-i*45;}scene.render();const p=separateWrecks(car.x,car.y,17,[car]);document.body.dataset.collision=String(p.x!==car.x||p.y!==car.y);},50);
document.querySelector('#sector')!.addEventListener('click',()=>{scene.stats.wave=scene.stats.wave>10?1:11;scene.drawFloor();scene.render();document.querySelector('#sector')!.textContent=scene.stats.wave>10?'Show city streets':'Show robotics sector';});

document.querySelector('#park')!.addEventListener('click',()=>{scene.x=scene.x>2000?600:3600;scene.y=380;scene.render();setTimeout(()=>scene.render(),80);document.querySelector('#park')!.textContent=scene.x>2000?'Return to streets':'Travel to park';});
