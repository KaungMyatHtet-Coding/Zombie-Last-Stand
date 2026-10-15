import type {HeroId} from './config';
type Target={active:boolean;x:number;y:number;r:number};
const wrap=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
/** Prefer deliberate forward aim, but allow close pursuers when retreating. */
export function assistedAim(x:number,y:number,moveAngle:number,range:number,targets:Target[]){
 const inRange=targets.filter(e=>e.active&&Math.hypot(e.x-x,e.y-y)<range+e.r);
 const forward=inRange.filter(e=>Math.abs(wrap(Math.atan2(e.y-y,e.x-x)-moveAngle))<.8);
 const pool=forward.length?forward:inRange;
 const target=pool.sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
 return target?Math.atan2(target.y-y,target.x-x):moveAngle;
}
export function escapeDirection(x:number,y:number,enemies:Target[],preferred=0){
 let best=preferred,bestScore=Infinity;
 for(let i=0;i<8;i++){const angle=preferred+i*Math.PI/4;let score=0;
 for(const e of enemies)if(e.active){const distance=Math.hypot(e.x-x,e.y-y);if(distance>550)continue;const diff=Math.abs(wrap(Math.atan2(e.y-y,e.x-x)-angle));if(diff<.7)score+=(550-distance)*(1-diff/.7);}
 if(score<bestScore){bestScore=score;best=angle;}}
 return wrap(best);
}
export function routedSpawn(side:number,offset:number,width:number,height:number,escape:number){
 const x=side===0?-width/2-70:side===1?width/2+70:width*(offset-.5),y=side===2?-height/2-70:side===3?height/2+70:height*(offset-.5);
 return Math.abs(wrap(Math.atan2(y,x)-escape))<.65?{side:side^1,offset:1-offset}:{side,offset};
}
export function buildSynergies(hero:HeroId,levels:Record<string,number>,evolution:{reach:number;power:number;tempo:number}){
 return [
 {id:'firewind',name:'Firestorm',needs:'Ember Circle or Wildfire + a wind attack',effect:'Wind hits spread fire to two nearby enemies.',available:hero!=='gunner',active:hero!=='gunner'&&!!(levels.fire||evolution.power)&&!!(levels.wind||evolution.reach>=2||hero==='samurai')},
 {id:'reversal',name:'Steel Reversal',needs:'Samurai + Storm Blade',effect:'Perfect counters return up to five nearby enemy shots.',available:hero==='samurai',active:hero==='samurai'&&!!levels.wind},
 {id:'crossfire',name:'Crossfire',needs:'Through the Dark + Trick Shot',effect:'Piercing rounds keep flying and split one weaker shot toward a nearby enemy.',available:hero==='gunner',active:hero==='gunner'&&!!levels.pierce&&!!levels.ricochet},
 {id:'aftershock',name:'Burning Aftershock',needs:'Ground Slam + Ember Circle',effect:'Ground Slam leaves burning ground beneath you for 3 seconds.',available:hero==='tank',active:hero==='tank'&&!!levels.rush&&!!levels.fire},
 {id:'shadow',name:'Shadow Harvest',needs:'Ninja + Echo Slash, Phantom Ally or Phantom evolution',effect:'Dash kills summon or extend a fighting shadow, up to 8 seconds.',available:hero==='ninja',active:hero==='ninja'&&!!(levels.double||levels.clone||evolution.tempo)}
 ].filter(s=>s.available);
}
export const COMBAT_CACHE_KILLS=[10,25,50,100,200,350,550];
export function comboHint(hero:HeroId,id:string,levels:Record<string,number>,evolution:{reach:number;power:number;tempo:number}){
 const base=id.replace('evolve:','');
 if(hero==='gunner'&&(['pierce','ricochet'].includes(base))&&(levels.pierce||levels.ricochet))return 'CROSSFIRE';
 if(hero==='tank'&&base==='fire'&&levels.rush||hero==='tank'&&base==='rush'&&levels.fire)return 'BURNING AFTERSHOCK';
 if(hero==='samurai'&&base==='wind')return 'STEEL REVERSAL';
 if(hero==='ninja'&&['double','clone'].includes(base))return 'SHADOW HARVEST';
 if(hero!=='gunner'&&base==='fire'&&(hero==='samurai'||levels.wind||evolution.reach>=2)||base==='wind'&&(levels.fire||evolution.power))return 'FIRESTORM';
 return '';
}
