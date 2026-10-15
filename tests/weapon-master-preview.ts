import '../src/style.css';
import {artImage} from '../src/art';
import {WEAPONS} from '../src/config';
import {UPGRADES} from '../src/upgrades';
import {visualUpgradeCard} from '../src/upgrade-ui';
document.querySelector('#weapons')!.innerHTML=['kama','naginata','smg','hammer'].map(id=>`<article class="upgrade"><div class="weapon-art">${artImage('weapon',id)}</div><h3>${WEAPONS[id as keyof typeof WEAPONS].name}</h3></article>`).join('');
document.querySelector('#cards')!.innerHTML=['damage','wide','regen'].map((id,i)=>visualUpgradeCard(UPGRADES.find(u=>u.id===id)!,i,'ninja','kama',0)).join('');

if(location.search.includes('cards')){document.querySelector<HTMLElement>('#weapons')!.style.display='none';document.querySelector('h2')!.remove();}else document.querySelector<HTMLElement>('#weapons')!.style.gridTemplateColumns='repeat(4,minmax(0,1fr))';
