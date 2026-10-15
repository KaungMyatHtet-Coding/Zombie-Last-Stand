import Phaser from 'phaser';
import {ArenaVisuals} from '../src/visuals';
import {WEAPONS,type WeaponId,type HeroId} from '../src/config';
import {WEAPON_EFFECTS} from '../src/weapon-effects';
class Gallery extends Phaser.Scene{
 slots:{v:ArenaVisuals;id:WeaponId;x:number;y:number}[]=[];
 create(){this.add.text(28,18,'WEAPON MOTION · trails follow actual striking points',{fontFamily:'monospace',fontSize:'20px',color:'#c6d1ca'});let i=0;for(const id of Object.keys(WEAPONS) as WeaponId[]){const x=140+i%4*300,y=160+Math.floor(i/4)*230;this.add.text(x-95,y+78,WEAPONS[id].name,{fontFamily:'monospace',fontSize:'18px',color:'#b8c3c6'});this.slots.push({v:new ArenaVisuals(this),id,x,y});i++;}}
 update(time:number){for(const s of this.slots){const d=WEAPON_EFFECTS[s.id].duration,period=d+.55,t=time/1000%period,remaining=t<d?d-t:0;s.v.render([],WEAPONS[s.id].hero as HeroId,s.id,s.x,s.y,0,time/1000,remaining,0,0,false,0,20,Math.floor(time/1000/period));}}
}
new Phaser.Game({type:Phaser.CANVAS,parent:'fixture',width:1200,height:760,backgroundColor:'#182935',scene:[Gallery],audio:{noAudio:true}});
