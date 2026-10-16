import {ENEMIES,type EnemyId} from './config';

const enemyDetails:Record<EnemyId,string>={
 shooterBoss:'A siege shooter backs away and fires short, aimed volleys. Close the gap or break line of sight.',
 commander:'A battle-worn officer rallies the horde and calls in reinforcements. Break its signal before the crowd closes in.',
 cleaver:'A butcher swings a wide, heavy cleaver. Step outside the warning arc before it lands.',
 spear:'A fallen guard thrusts down a narrow lane. Sidestep the aim line before it strikes.',
 rifle:'A fallen soldier holds back and fires after a clear aiming warning. Move out of the marked shot lane.',
 basic:'A shambling infected civilian. Keep moving so the crowd cannot surround you.',
 runner:'A lean infected that sprints in from the edges. Watch your flanks.',
 spitter:'A swollen infected spits a poison glob after a brief warning. Keep moving when it rears back.',
 armoured:'Heavy plates blunt gunfire. Close in with a blade to cut through its armour.',
 brute:'A hulking infected winds up a heavy slam. Step clear of the impact.',
 elite:'Bone growths mark a dangerous elite. Its glowing aura shows the active mutation.',
 boss:'The Zombie General slams the ground, charges, and calls reinforcements. Watch its warning marks and sidestep the charge.',
 abomination:'A mass of fused infected with too many arms. Its slow, crushing blows hit hard, so keep clear when it winds up.',
 bioScreer:'A toxic carrier loaded with glowing chemical canisters. It spits corrosive bile from a distance; dodge when the green warning appears.',
 shadowLurker:'A hooded infected that darts through the dark and closes distance quickly. Keep moving and turn to face it before it reaches you.',
};

export function enemyGuide(){
 return `<div class="bestiary">${(Object.keys(ENEMIES) as EnemyId[]).filter(id=>!['cleaver','spear','shooterBoss'].includes(id)).map(id=>{const e=ENEMIES[id];return `<article class="enemy-card"><div class="enemy-art"><img class="enemy-reference-art" src="/assets/enemy-guide/${id}.webp" alt="${e.name}" loading="lazy"></div><small>THREAT / ${e.cost}</small><h3>${e.name}</h3><p>${enemyDetails[id]}</p><div class="mini-stats"><span>♥ ${e.hp}</span><span>⚔ ${e.damage}</span><span>↗ ${e.speed}</span></div></article>`;}).join('')}</div>`;
}
