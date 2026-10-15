import { REWARDS, type RewardId } from './progression';
type Reward=typeof REWARDS[number];
export function rewardMarkup(pool:readonly Reward[]){return `<div class="reward-spinner" aria-live="polite"><div class="spinner-pointer">▼</div><div class="reward-symbol">✦</div><h3 class="reward-name">SPINNING…</h3><p class="reward-description">Supply roulette</p><div class="reward-track">${pool.map(r=>`<span data-reward="${r.id}">${r.icon}<small>${r.name}</small></span>`).join('')}</div><div class="spin-status">SELECTING YOUR REWARD</div></div>`;}
export function spinReward(root:HTMLElement,pool:readonly Reward[],winner:RewardId,isActive:()=>boolean,onTick:()=>void,onWin:()=>void,onDone:()=>void){const final=pool.find(r=>r.id===winner)!;
 let step=0;const steps=18;
 const tick=()=>{if(!isActive())return;const r=step===steps?final:pool[step%pool.length];root.querySelector('.reward-symbol')!.textContent=r.icon;root.querySelector('.reward-name')!.textContent=r.name;root.querySelectorAll('[data-reward]').forEach(el=>el.classList.toggle('active',(el as HTMLElement).dataset.reward===r.id));onTick();
 if(step++<steps){setTimeout(tick,35+step*8);return;}
 onWin();root.querySelector('.reward-spinner')!.classList.add('won');root.querySelector('.reward-description')!.textContent=final.description;root.querySelector('.spin-status')!.textContent='REWARD SECURED';setTimeout(()=>{if(isActive())onDone();},1000);};tick();
}
