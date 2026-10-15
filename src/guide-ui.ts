import {artImage} from './art';
import {CARD_EVOLUTIONS} from './card-evolutions';
import {HEROES,WEAPONS,type HeroId,type WeaponId} from './config';
import {UPGRADES} from './upgrades';
import {upgradeVisual} from './upgrade-ui';
import {evolutionOptions} from './progression';
import {evolutionPreview} from './evolution-preview';
import {EVOLUTION_STAGES} from './run-design';
import type {Save} from './save';
const status=(value:number|undefined)=>value===2?'✓ USED':value===1?'◉ DISCOVERED':'◇ UNDISCOVERED · PREVIEW';
export function cardEvolutionGuide(save:Save,hero:HeroId){
 const weapon=Object.entries(WEAPONS).find(([,w])=>w.hero===hero)![0] as WeaponId;
 return `<p class="guide-explainer">Max a card first. From wave 11, its evolution can appear in level-up choices alongside ordinary upgrades. Choose it once to transform its effect.</p><div class="guide-grid">${UPGRADES.filter(u=>!u.hero||u.hero===hero).map(u=>{const e=CARD_EVOLUTIONS[u.id],evo={...u,id:'evolve:'+u.id,evolves:u.id,name:e.name,icon:e.icon};return `<article class="guide-evolution"><small class="archive-state">${status(save.archive['card:'+u.id])}</small>${upgradeVisual(evo,hero,weapon)}<div class="evolution-path"><span>${u.icon} ${u.name}<small>LEVEL ${u.max} · MAX</small></span><b>→</b><span>${e.icon} ${e.name}<small>CARD EVOLUTION</small></span></div><p>${e.effect}</p><small>Requires max level ${u.max} · Wave 11+ · Level-up choice${u.hero?' · '+HEROES[u.hero].name:''}</small></article>`;}).join('')}</div>`;
}
export function weaponEvolutionGuide(save:Save,weapon:WeaponId){
 const w=WEAPONS[weapon],hero=w.hero as HeroId;return `<div class="guide-weapon"><div class="weapon-art">${artImage('weapon',weapon)}</div><div><h3>${w.name}</h3><p>${HEROES[hero].name} · Choose one element after clearing wave 10. The same element reaches full evolution after clearing wave 20.</p><small>10-wave missions end at the awakening milestone. Continue in Endless to reach full evolution.</small></div></div><div class="guide-grid">${evolutionOptions(hero).map(e=>`<article class="guide-evolution"><small class="archive-state">${status(save.archive[`weapon:${weapon}:${e.id}`])}</small>${evolutionPreview(hero,e.id,1,weapon)}<h3>${e.name}</h3><div class="evolution-step"><b>01 · BASE WEAPON</b><p>${w.name} · ${w.damage} base damage</p></div><div class="evolution-step"><b>02 · WAVE 10 AWAKENING</b><p>${EVOLUTION_STAGES[e.id].awakening}</p></div><div class="evolution-step full"><b>03 · WAVE 20 FULL EVOLUTION</b>${evolutionPreview(hero,e.id,2,weapon)}<p>${EVOLUTION_STAGES[e.id].full}</p></div></article>`).join('')}</div>`;
}
