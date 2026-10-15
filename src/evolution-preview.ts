import {artImage} from './art';
import {WEAPONS,type HeroId,type WeaponId} from './config';
import type { EvolutionId } from './progression';
export function evolutionPreview(hero:HeroId,id:EvolutionId,stage=2,weapon?:WeaponId){
 const equipped=weapon||Object.entries(WEAPONS).find(([,w])=>w.hero===hero)![0];
 const shape=id==='reach'?`<path d="m34 46 20-7 5 10 17-11 4 9 20-4"/>${stage===2?'<path d="m99 44 9-17 8 4 15-12m-31 25 13 15-4 8 22 8"/>':''}`:id==='power'?`<path d="M90 23Q110 44 99 59Q86 69 76 57Q65 43 81 33Q75 51 87 52Q96 44 90 23Z"/>${stage===2?'<circle cx="90" cy="47" r="30"/><path d="m62 70 14-6m24 0 20 8M61 29l10 7m35-5 15-5"/>':''}`:`<path d="m52 60 29-32m-15 37 29-32"/>${stage===2?'<path d="m82 67 29-32"/>':''}`;
 return `<div class="evolution-scene element-${id} stage-${stage}" role="img" aria-label="${id==='reach'?'Chain lightning preview':id==='power'?'Wildfire preview':'Spectral echo preview'} · ${stage===1?'awakening':'full evolution'}"><span class="evolution-source">${artImage('weapon',equipped)}</span><span class="evolution-target">${artImage('enemy','basic')}</span>${stage===2&&id==='reach'?`<span class="evolution-target extra top">${artImage('enemy','runner')}</span><span class="evolution-target extra bottom">${artImage('enemy','basic')}</span>`:''}<svg class="evolution-preview preview-${id}" viewBox="0 0 160 90" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">${shape}</g></svg><small>${stage===1?'AWAKENING':'FULL EVOLUTION'}</small></div>`;
}
