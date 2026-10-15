import {comboHint} from './combat-feel';
import {combatHud,buildDetails,abilityIcons} from './combat-hud';
import {cardEvolutionGuide,weaponEvolutionGuide} from './guide-ui';
import {CARD_EVOLUTIONS} from './card-evolutions';
import {HERO_IDENTITIES,EVOLUTION_STAGES,encounterRhythm,deathTip} from './run-design';
import {heroTechniques,techniqueName,techniqueDemo} from './mastery';
import {visualUpgradeCard} from './upgrade-ui';
import {evolutionPreview} from './evolution-preview';
import {BUILDS,dailySetup,masteryMilestones,techniqueUnlocked,incomingThreats,edgePosition,type RunMode,type BuildId,type TechniqueId,type RunOptions} from './retention';
import { evolutionOptions, type EvolutionId } from './progression';
import { TouchControls } from './touch';
import { PLAYTEST } from './config';
import { artImage, ART_NAMES } from './art';
import Phaser from 'phaser';
import './style.css';
import { ArenaScene } from './combat';
import { HEROES, WEAPONS, ENEMIES, PERMANENT, type HeroId, type WeaponId } from './config';
import { loadSave, storeSave, purchase, freshSave, compatible } from './save';
import { UPGRADES,upgradeChoices, type Upgrade } from './upgrades';
import { AudioManager } from './audio';
let save = loadSave(), game: Phaser.Game | undefined, scene: ArenaScene | undefined, choices: Upgrade[] = [], waveChoice = false, menuState = 'menu', purchasePending = false;
if (PLAYTEST.unlimitedGold) save.gold = PLAYTEST.goldReserve;
let selectedMode:RunMode='endless',selectedBuild:BuildId='assault';
let touchControls: TouchControls | undefined;
let guideTab='enemies',guideReturn='menu',guideHero:HeroId=save.hero,guideWeapon:WeaponId=save.weapon;

const audio = new AudioManager(), overlay = document.querySelector<HTMLDivElement>('#overlay')!, hud = document.querySelector<HTMLDivElement>('#hud')!;
// Suppress long-press selection and context menus without blocking touch scrolling.
for(const event of ['contextmenu','selectstart','dragstart'])document.addEventListener(event,e=>{
    if(e.target instanceof Element&&e.target.closest('#game,#hud,#overlay,#touch-controls'))e.preventDefault();
});
function persist() { if (PLAYTEST.unlimitedGold) save.gold = PLAYTEST.goldReserve;
    if (!storeSave(save))
        toast('Browser storage is unavailable. Progress lasts for this session.');
}
function syncAudio() { audio.sound = save.settings.sound; audio.music = save.settings.music; }
function toast(message: string) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = message; document.body.append(t); setTimeout(() => t.remove(), 3000); }
const button = (label: string, action: string, cls = '') => `<button class="${cls}" data-action="${action}">${label}</button>`;
function shell(content: string, wide = false) { overlay.style.display = 'grid'; overlay.innerHTML = `<section class="panel ${wide ? 'wide' : ''}">${content}</section>`; }
function header(title: string, sub: string) { return `<div class="eyebrow">ZOMBIE LAST STAND <span>● OFFLINE / SOLO</span></div><h2>${title}</h2><p class="muted">${sub}</p>`; }
function back() { return button('← Back', 'menu', 'quiet'); }
function menu() { menuState = 'menu'; hud.innerHTML = ''; overlay.className = ''; shell(`<div class="menu-top"><span class="brand">ZLS / 07</span><span class="coin">◈ ${PLAYTEST.unlimitedGold ? '∞' : save.gold.toLocaleString()} GOLD</span></div><div class="hero-art"><div class="moon"></div><div class="city"></div><div class="menu-survivor">${artImage('hero', save.hero)}</div><div class="art-caption">THE CITY IS GONE.<br>YOUR STAND ISN’T.</div></div><div class="eyebrow">AN ENDLESS SURVIVAL ROGUELITE</div><h1>ZOMBIE<br><em>LAST STAND</em></h1><p class="intro">An endless world. An endless horde. Make every second count.</p><div class="loadout"><span class="portrait" style="--hero:#${HEROES[save.hero].color.toString(16)}">${artImage('hero', save.hero)}</span><div><b>${HEROES[save.hero].name}</b><small>${WEAPONS[save.weapon].name} · ${HEROES[save.hero].ability}</small></div>${button('Change ↗', 'characters', 'quiet')}</div><div class="menu-actions">${button('ENTER THE ARENA →', 'play', 'primary')}${button('Daily challenge', 'daily')}${button('Survivor mastery', 'mastery')}${button('Armoury & shop', 'shop')}${button('Field guide', 'guide', 'quiet')}${button('Settings', 'settings', 'quiet')}</div><div class="records"><div><b>${save.bestWave || '—'}</b><small>BEST WAVE</small></div><div><b>${format(save.bestTime)}</b><small>LONGEST STAND</small></div><div><b>${save.bestKills}</b><small>MOST KILLS</small></div><div><b>${save.shortWins}</b><small>MISSIONS WON</small></div></div><footer><span><kbd>WASD</kbd> Move <kbd>JOYSTICK</kbd> Move & aim · auto attack <kbd>SPACE</kbd> Ability</span><span>HOLD THE LINE.</span></footer>`, true); }
function runMenu(mode:RunMode='endless'){
 selectedMode=mode;menuState='run-menu';const daily=dailySetup();const kills=save.mastery[save.hero]?.kills||0;
 shell(`${header('Choose your stand','A short victory, an endless record, or today’s fixed challenge.')}<div class="run-modes">${(['short','endless','daily'] as RunMode[]).map(m=>`<button class="${m===mode?'selected':''}" data-action="mode:${m}"><b>${m==='short'?'LAST STAND':m==='daily'?'DAILY CHALLENGE':'ENDLESS'}</b><small>${m==='short'?'10 waves · defeat the final boss · about 10 minutes':m==='daily'?`${daily.date} UTC · 10 waves · fixed loadout`:'Awakening after wave 10 · full evolution after wave 20'}</small></button>`).join('')}</div>${mode==='daily'?`<div class="daily-loadout"><span class="portrait">${artImage('hero',daily.hero!)}</span><div><h3>${HEROES[daily.hero!].name} · ${WEAPONS[daily.weapon!].name}</h3><p>${BUILDS.find(b=>b.id===daily.build)!.name} build · standard ability · no permanent bonuses</p><small>TODAY’S PERSONAL BEST · ${save.daily[daily.date!]?.score||0} POINTS · ${save.daily[daily.date!]?.wins||0} WINS</small></div></div>`:`<div class="hero-identity"><b>${HERO_IDENTITIES[save.hero].icon} ${HERO_IDENTITIES[save.hero].name}</b><small>${HERO_IDENTITIES[save.hero].trigger} → ${HERO_IDENTITIES[save.hero].benefit}</small></div><div class="eyebrow">STARTING BUILD · ${HEROES[save.hero].name.toUpperCase()}</div><div class="cards build-cards">${BUILDS.map(b=>`<button class="upgrade ${b.id===selectedBuild?'selected':''}" data-action="build:${b.id}"><span class="card-icon">${b.icon}</span><h3>${b.name}</h3><p>${b.description}</p></button>`).join('')}</div><p class="muted">Technique: ${techniqueName(save.hero,save.techniques[save.hero]||'standard')} · ${kills} mastery kills. Change techniques in Survivor mastery.</p>`}<p class="muted">${mode==='endless'?'Level-ups continue throughout the run. From wave 11, maxed cards can evolve alongside regular upgrade choices.':'Defeat the wave-10 boss to win. Endless adds awakening at wave 10 and full evolution at wave 20. Victory requires defeating the wave-10 boss. Optional objectives earn extra rewards.'}</p><div class="actions">${back()}${button('Begin run →','begin','primary')}</div>`,true);
}
function masteryMenu(){
 menuState='mastery';const hero=save.hero,kills=save.mastery[hero]?.kills||0,techniques=heroTechniques(hero),equipped=save.techniques[hero]||'standard',next=techniques.find(t=>t.kills>kills);
 shell(`${header(`${HEROES[hero].name} mastery`,'Watch each technique. Equip one for your next run.')}<div class="mastery-banner"><span class="portrait">${artImage('hero',hero)}</span><div><h3>${kills} MASTERY KILLS</h3><p>${next?`${next.kills-kills} kills to ${next.name}`:kills<500?`${500-kills} kills to Veteran appearance`:'Veteran mastery complete'}</p><div class="bar xp"><i style="width:${Math.min(100,kills/(next?.kills||500)*100)}%"></i></div></div></div><div class="cards mastery-cards">${techniques.map(t=>`<article class="mastery-technique ${equipped===t.id?'selected':''}">${techniqueDemo(hero,t.id)}<small>${t.kills===0?'BASE ABILITY':kills>=t.kills?'UNLOCKED':`${kills} / ${t.kills} KILLS`}</small><h3>${t.name}</h3><p><b>What happens</b>${t.effect}</p><p><b>When</b>${t.trigger}</p><div class="bar xp"><i style="width:${t.kills?Math.min(100,kills/t.kills*100):100}%"></i></div><button data-action="technique:${t.id}" ${kills<t.kills?'disabled':''} class="${equipped===t.id?'active':''}">${equipped===t.id?'✓ EQUIPPED':kills<t.kills?`${t.kills-kills} KILLS TO UNLOCK`:'EQUIP TECHNIQUE'}</button></article>`).join('')}</div><div class="mastery-bonuses"><h3>Permanent mastery bonuses</h3><span class="${kills>=100?'earned':''}">${kills>=100?'✓':'◇'} 100 kills · +5% maximum health</span><span class="${kills>=250?'earned':''}">${kills>=250?'✓':'◇'} 250 kills · +5% ability damage</span><span class="${kills>=500?'earned':''}">${kills>=500?'✓':'◇'} 500 kills · Veteran tint & insignia</span><small>Bonuses apply automatically when this hero starts a run. Daily challenges use standard abilities without mastery bonuses.</small></div><div class="actions">${back()}${button('Choose survivor','characters')}${button('Choose run →','play','primary')}</div>`,true);
}
function characters() { menuState = 'characters'; shell(`${header('Choose your survivor', 'Each survivor changes how you fight. Unlock new styles in the armoury.')}<div class="cards character-cards">${Object.entries(HEROES).map(([id, h]) => { const owned = save.heroes.includes(id as HeroId); return `<button class="character ${save.hero === id ? 'selected' : ''}" data-action="hero:${id}" ${!owned ? 'disabled' : ''}><div class="character-icon" style="--hero:#${h.color.toString(16)}">${artImage('hero', id)}</div><small>${h.tag}</small><h3>${h.name}</h3><p>${h.description}</p><div class="hero-identity"><b>${HERO_IDENTITIES[id as HeroId].icon} ${HERO_IDENTITIES[id as HeroId].name}</b><small>${HERO_IDENTITIES[id as HeroId].trigger} → ${HERO_IDENTITIES[id as HeroId].benefit}</small></div><div class="mini-stats"><span>♥ ${h.hp}</span><span>↗ ${h.speed}</span><span>⚔ ×${h.damage}</span></div><strong>${owned ? (save.hero === id ? 'SELECTED' : 'SELECT') : `LOCKED · ◈ ${h.price}`}</strong></button>`; }).join('')}</div><div class="actions">${back()}${button('Visit shop', 'shop')}${button('Choose weapon →', 'weapons', 'primary')}</div>`, true); }
function weapons() { menuState = 'weapons'; shell(`${header('Your weapon, your rules', `Choose compatible equipment for ${HEROES[save.hero].name}.`)}<div class="cards">${Object.entries(WEAPONS).filter(([id]) => compatible(save.hero, id as WeaponId)).map(([id, w]) => `<button class="upgrade ${save.weapon === id ? 'selected' : ''}" data-action="weapon:${id}" ${save.weapons.includes(id as WeaponId) ? '' : 'disabled'}><div class="weapon-art">${artImage('weapon', id)}</div><small>${ART_NAMES[id as WeaponId]}</small><h3>${w.name}</h3><p>${w.damage} damage · ${w.cooldown}s attack interval<br>${w.range} range · ${HEROES[save.hero].name}</p><strong>${save.weapons.includes(id as WeaponId) ? save.weapon === id ? 'EQUIPPED' : 'EQUIP' : `LOCKED · ◈ ${w.price}`}</strong></button>`).join('')}</div><div class="actions">${button('← Survivors', 'characters', 'quiet')}${button('Armoury', 'shop')}${button('Evolution previews','guide-weapons','quiet')}${button('Enter the arena →', 'play', 'primary')}</div>`, true); }
function shop(tab = 'heroes') {
    menuState = 'shop';
    const names = { heroes: 'Characters', weapons: 'Weapons', permanent: 'Permanent upgrades', cosmetics: 'Cosmetics' };
    let items = '';
    if (tab === 'heroes')
        items = Object.entries(HEROES).map(([id, h]) => `<article class="shop-item"><span class="card-icon" style="color:#${h.color.toString(16)}">${artImage('hero', id)}</span><h3>${h.name}</h3><p>${h.description}</p><small>♥ ${h.hp} · ↗ ${h.speed} · ⚔ ×${h.damage}<br>${h.ability} · ${h.cooldown}s<br>Weapons: ${Object.values(WEAPONS).filter(w => w.hero === id).map(w => w.name).join(', ')}</small>${save.heroes.includes(id as HeroId) ? button('Owned · Select', `hero:${id}`) : button(`Unlock · ◈ ${h.price}`, `buy:heroes:${id}`, save.gold >= h.price ? 'primary' : '')}</article>`).join('');
    if (tab === 'weapons')
        items = Object.entries(WEAPONS).map(([id, w]) => `<article class="shop-item"><div class="weapon-art">${artImage('weapon', id)}</div><h3>${w.name}</h3><p>For ${HEROES[w.hero as HeroId].name}<br>${w.damage} damage · ${w.range} reach · ${w.cooldown}s cooldown</p>${save.weapons.includes(id as WeaponId) ? '<strong class="owned">✓ OWNED</strong>' : button(`Unlock · ◈ ${w.price}`, `buy:weapons:${id}`, save.gold >= w.price ? 'primary' : '')}</article>`).join('');
    if (tab === 'permanent') {
        const designs: Record<string, {color:string;label:string;description:string;icon:string}> = {
            health:{color:'#ef8b9b',label:'SURVIVAL',description:'A stronger heart for every stand.',icon:'<path d="M32 49 12 29C1 12 23 4 32 20 41 4 63 12 52 29Z"/><path d="m14 30 10 0 5-10 6 20 5-10h11"/>'},
            damage:{color:'#e7b879',label:'OFFENCE',description:'Hone every blade. Empower every shot.',icon:'<path d="m20 43 27-30 6-3-1 9-28 29Z"/><path d="m14 38 15 15M10 54l10-11M8 56l4 4"/><path d="M11 12v9M7 16h9M45 43v12M39 49h12"/>'},
            speed:{color:'#a8a0f3',label:'MOBILITY',description:'Stay one step ahead of the horde.',icon:'<path d="M38 9 18 35h15l-7 21 23-30H34Z"/><path d="M8 25h10M5 36h8M43 47h13"/>'},
            magnet:{color:'#81d1c9',label:'COLLECTION',description:'Bring distant gold within your reach.',icon:'<path d="M15 12v24a17 17 0 0 0 34 0V12H38v24a6 6 0 0 1-12 0V12Z"/><path d="M15 23h11M38 23h11M6 8l-3-4M58 8l3-4"/><circle cx="32" cy="9" r="4"/>'},
            reroll:{color:'#d5b2ed',label:'TACTICS',description:'A fresh choice when the stakes are high.',icon:'<path d="M49 24a19 19 0 0 0-34-5l-5 8M10 13v14h14M15 40a19 19 0 0 0 34 5l5-8M54 51V37H40"/><path d="m32 25 7 7-7 7-7-7Z"/>'}
        };
        items = `<div class="permanent-intro"><span class="permanent-seal">✦</span><div><small>BUILT TO LAST</small><h3>Invest in your next stand.</h3><p>Permanent bonuses follow every survivor into every run.</p></div><span class="training-total">${Object.entries(PERMANENT).reduce((n,[id])=>n+(save.permanent[id]||0),0)} / ${Object.values(PERMANENT).reduce((n,p)=>n+p.cap,0)}<small>TRAINING LEVELS</small></span></div>` + Object.entries(PERMANENT).map(([id,p])=>{
            const level=save.permanent[id]||0,d=designs[id],maxed=level===p.cap;
            const benefit=(n:number)=>id==='reroll'?`+${n} reroll${n===1?'':'s'}`:`+${Math.round(n*p.value*100)}%`;
            return `<article class="shop-item permanent-card ${maxed?'maxed':''}" style="--upgrade-color:${d.color}"><div class="permanent-top"><span class="upgrade-category">${d.label}</span><span class="level-badge">${maxed?'MASTERED':`LEVEL ${level} / ${p.cap}`}</span></div><div class="permanent-emblem"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${d.icon}</svg></div><h3>${p.name}</h3><p>${d.description}</p><div class="level-segments" aria-label="${level} of ${p.cap} levels purchased">${Array.from({length:p.cap},(_,i)=>`<span class="${i<level?'filled':''}"></span>`).join('')}</div><div class="upgrade-benefit"><div><small>CURRENT BONUS</small><b>${benefit(level)}</b></div><span aria-hidden="true">→</span><div><small>${maxed?'MAXIMUM BONUS':'NEXT LEVEL'}</small><b>${benefit(maxed?level:level+1)}</b></div></div><div class="upgrade-cap">${id==='reroll'?'One additional choice reroll per run':`Up to ${benefit(p.cap)} · stacks across every run`}</div>${maxed?'<div class="mastered-label">✓ FULLY TRAINED</div>':button(`Train level ${level+1} <span>◈ ${250+150*level}</span>`,`buy:permanent:${id}`,'train-button')}</article>`;
        }).join('');
    }
    if (tab === 'cosmetics')
        items = '<p class="muted">Field archive coming soon. Character mastery is already tracked in your save.</p>';
    shell(`${header('The armoury', 'Keep the gold. Change the odds.')}<div class="shop-top"><span class="coin">◈ ${PLAYTEST.unlimitedGold ? '∞' : save.gold.toLocaleString()} GOLD</span><nav>${Object.entries(names).map(([id, name]) => button(name, `tab:${id}`, tab === id ? 'active' : 'quiet')).join('')}</nav></div><div class="shop-grid">${items}</div><div class="actions">${back()}${button('Choose survivor', 'characters')}${button('Enter the arena →', 'play', 'primary')}</div>`, true);
}
function guide(){
 menuState='guide';const content=guideTab==='cards'?cardEvolutionGuide(save,guideHero):guideTab==='weapons'?weaponEvolutionGuide(save,guideWeapon):`<div class="bestiary">${Object.entries(ENEMIES).map(([id, e]) => `<article class="enemy-card"><div class="enemy-art">${artImage('enemy', id)}</div><small>THREAT / ${e.cost}</small><h3>${e.name}</h3><p>${{ shooterBoss:'Mini-boss: locks a thin aim line before bursts and spread volleys. Defeat it for guaranteed gold and recovery.',commander:'Mini-boss: summons reinforcements and boosts nearby zombies for four seconds. Kill it to break the aura.', cleaver:'A butcher with a rusted cleaver. Step outside its broad swing. Appears from wave 11.', spear:'A fallen guard with a long pike. Sidestep the narrow thrust. Appears from wave 12.', rifle:'An infected soldier carrying a rifle. Its aim line locks before a slow, dodgeable shot. Appears from wave 13.', basic: 'A shambling infected civilian. Never let a crowd surround you.', runner: 'Fast, lean, unpredictable. Watch your flanks.', spitter: 'The swollen throat lights up before a poison shot.', armoured: 'Riot armour resists bullets. Heavy steel cuts through.', brute: 'Oversized fists. Step outside the red warning before impact.', elite: 'Bone growths mark an elite. Its aura reveals its modifier.', boss: 'Slams use shrinking circles. Summons mark reinforcement entries. Sidestep the arrow lane before the General charges.' }[id as keyof typeof ENEMIES]}</p><div class="mini-stats"><span>♥ ${e.hp}</span><span>⚔ ${e.damage}</span><span>↗ ${e.speed}</span></div></article>`).join('')}</div>`;
 shell(`${header('Field guide','Learn the threats. Preview your next build.')}<nav class="guide-tabs">${[['enemies','Zombies'],['cards','Card evolutions'],['weapons','Weapon evolutions']].map(([id,name])=>button(name,'guide-tab:'+id,id===guideTab?'active':'quiet')).join('')}</nav>${guideTab==='cards'?`<nav class="guide-filters">${Object.entries(HEROES).map(([id,h])=>button(h.name,'guide-hero:'+id,guideHero===id?'active':'quiet')).join('')}</nav>`:guideTab==='weapons'?`<label class="guide-filter">WEAPON <select data-guide-weapon>${Object.entries(WEAPONS).map(([id,w])=>`<option value="${id}" ${guideWeapon===id?'selected':''}>${w.name} · ${HEROES[w.hero as HeroId].name}</option>`).join('')}</select></label>`:''}${content}<div class="actions">${button('← Back','guide-back','quiet')}</div>`,true);
}
function openGuide(tab='enemies'){
 guideReturn=menuState;guideTab=tab;guideHero=scene&&!scene.ended?scene.hero:save.hero;guideWeapon=scene&&!scene.ended?scene.weapon:save.weapon;
 if(scene&&!scene.ended)scene.paused=true;guide();
}

function settings() { menuState = 'settings'; shell(`${header('Field settings', 'Tune your last stand.')}<div class="settings">${(['sound', 'music', 'shake','aimAssist'] as const).map(k => `<label><span>${{ sound: 'Sound effects', music: 'Ambient music', shake: 'Screen shake',aimAssist:'Mobile aim assistance' }[k]}</span><input type="checkbox" data-setting="${k}" ${save.settings[k] ? 'checked' : ''}></label>`).join('')}<label><span>Joystick side</span><select data-control="joystickSide"><option value="left" ${save.settings.joystickSide==='left'?'selected':''}>Left</option><option value="right" ${save.settings.joystickSide==='right'?'selected':''}>Right</option></select></label><label><span>Joystick size</span><select data-control="joystickSize">${[95,115,135].map(n=>`<option value="${n}" ${save.settings.joystickSize===n?'selected':''}>${n===95?'Compact':n===115?'Standard':'Large'}</option>`).join('')}</select></label></div><p class="muted">All art and audio are generated locally. Progress saves automatically in this browser.</p><div class="actions">${button('← Back', scene && !scene.ended ? 'pause' : 'menu', 'quiet')}${button('Reset progress', 'reset', 'danger')}</div>`); }
function start(options:RunOptions={mode:selectedMode,build:selectedBuild,technique:save.techniques[save.hero]||'standard'}) { touchControls?.destroy(); game?.destroy(true); scene = undefined; overlay.style.display = 'none'; overlay.className = 'ingame'; menuState = 'game'; syncAudio(); audio.unlock(); const s = new ArenaScene(save, audio, showChoices, results, pause, options); scene = s; touchControls=new TouchControls(()=>{if(!s.paused&&!s.ended&&s.countdown<=0)s.activate(touchControls!.state.x,touchControls!.state.y);});touchControls.setLayout(save.settings.joystickSide,save.settings.joystickSize);s.touch=touchControls.state; game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: 1200, height: 760, backgroundColor: '#101b28', scene: [s], scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }, render: { antialias: true }, audio: { noAudio: true } }); persist(); }
function pause() {
    if (!scene || scene.ended)
        return;
    if (scene.paused && menuState === 'pause') {
        resume();
        return;
    }
    if (scene.paused && menuState !== 'settings')
        return;
    scene.paused = true;
    menuState = 'pause';
    shell(`${header('Hold your ground', 'The horde can wait.')}<div class="pause-records"><span>◈ ${scene.stats.gold} GOLD</span><span>${scene.stats.kills} KILLS</span><span>${format(scene.elapsed)} SURVIVED</span></div><div class="controls"><p><kbd>WASD / ↑↓←→</kbd> Move</p><p><kbd>MOUSE</kbd> Aim · hold left button to attack</p><p><kbd>SPACE</kbd> ${HEROES[scene.hero].ability}</p><p><kbd>1–3</kbd> Choose upgrade <kbd>M</kbd> Sound</p></div><div class="actions">${button('Resume →', 'resume', 'primary')}${button('Your Build','build')}${button('Settings', 'settings')}${button('End run', 'end', 'danger')}</div>`);
}
function buildMenu(){if(!scene||scene.ended)return;scene.paused=true;menuState='build';shell(`${header('Your Build','Plan your next upgrade. The run is paused.')}${buildDetails(scene)}<div class="actions">${button('Evolution guide','guide-cards','quiet')}${button('Pause menu','build-pause','quiet')}${button('Resume →','resume','primary')}</div>`,true);}
function resume() { scene!.paused = false; overlay.style.display = 'none'; menuState = 'game'; }
function showChoices(wave = false) { if(wave){waveClear();return;} waveChoice = false; menuState = 'choice'; choices = upgradeChoices(scene!.hero, scene!.levels,scene!.cardRandom,scene!.weapon,scene!.stats.wave,scene!.cardEvolutions); for(const u of choices)if(u.evolves)save.archive['card:'+u.evolves]=Math.max(save.archive['card:'+u.evolves]||0,1) as 1|2;renderChoices(); persist(); }
function finishIntermission(){if(!scene||scene.ended)return;overlay.style.display='none';menuState='game';scene.nextWave();persist();}
function evolutionMenu(){const s=scene!;for(const e of evolutionOptions(s.hero))save.archive[`weapon:${s.weapon}:${e.id}`]=Math.max(save.archive[`weapon:${s.weapon}:${e.id}`]||0,1) as 1|2;persist();menuState='evolution';shell(`${header(s.awakened?'Full weapon evolution':'Weapon awakening',`Wave ${s.stats.wave} milestone · ${WEAPONS[s.weapon].name}`)}<div class="cards upgrade-cards">${evolutionOptions(s.hero).filter(e=>!s.awakened||e.id===s.awakened).map(e=>`<button class="upgrade" data-action="evolve:${e.id}">${evolutionPreview(s.hero,e.id,s.awakened?2:1,s.weapon)}<small>EVOLUTION ${(s.evolution[e.id]||0)+1}</small><h3>${e.name}</h3><p>${s.awakened?EVOLUTION_STAGES[e.id].full:EVOLUTION_STAGES[e.id].awakening}</p><strong>${s.awakened?'FULLY EVOLVE →':'AWAKEN →'}</strong></button>`).join('')}</div>${button('Preview both stages in Field Guide','guide-weapons','quiet')}`,true);}
function waveClear(){persist();if(scene!.evolutionDue)evolutionMenu();else finishIntermission();}
function renderChoices() { const s = scene!; shell(`${header(waveChoice ? `Wave ${s.stats.wave} survived` : `Level ${s.level} · Evolve`, waveChoice ? 'Recover. Adapt. The next horde is coming.' : 'The city takes everything. Take something back.')} ${waveChoice ? `<div class="wave-recap"><span>${s.waveStats.time.toFixed(1)}s <small>CLEAR TIME</small></span><span>${s.waveStats.kills} <small>KILLS</small></span><span>◈ ${s.waveStats.gold} <small>GOLD</small></span><span>${Math.round(s.waveStats.damage)} <small>DAMAGE TAKEN</small></span></div><p class="badges">${s.waveStats.time < 45 ? '✦ QUICK CLEAR · +15% GOLD' : ''} ${s.waveStats.damage === 0 ? '◇ PERFECT CLEAR · +1 REROLL' : ''}</p>` : ''}<div class="cards upgrade-cards">${choices.map((u,i)=>visualUpgradeCard(u,i,s.hero,s.weapon,s.levels[u.id]||0,comboHint(s.hero,u.id,s.levels,s.evolution))).join('')}</div><div class="card-info-links">${choices.map((u,i)=>button('ⓘ '+u.name,'card-info:'+i,'quiet')).join('')}</div><div class="actions"><span class="muted">${button('Evolution guide','guide-cards','quiet')} · Choose one card</span>${button(`↻ Reroll (${s.rerolls} left)`, 'reroll', 'quiet')}</div>`, true); }
function pick(index: number) {
    if (menuState !== 'choice' || !choices[index])
        return;
    scene!.apply(choices[index].id);if(choices[index].evolves)save.archive['card:'+choices[index].evolves]=2;persist();
    if (waveChoice)
        scene!.nextWave();
    overlay.style.display = 'none';
    menuState = 'game';
}
function results() { const s = scene!, r = s.stats; if(menuState==='results')return;menuState = 'results';audio.play(s.victory?'clear':'over');if(s.victory&&s.options.mode==='short')save.shortWins++;const dailyScore=r.kills*10+s.objectives*100+(s.victory?1000:0)+r.wave*50;if(s.options.mode==='daily'&&s.options.date){const old=save.daily[s.options.date]||{score:0,wins:0};save.daily[s.options.date]={score:Math.max(old.score,dailyScore),wins:old.wins+Number(s.victory)};} const record = r.wave > save.bestWave || r.kills > save.bestKills || r.time > save.bestTime; const previous = save.bestWave; save.bestWave = Math.max(save.bestWave, r.wave); save.bestTime = Math.max(save.bestTime, Math.floor(r.time)); save.bestKills = Math.max(save.bestKills, r.kills); persist(); const next = Object.entries(HEROES).find(([id]) => !save.heroes.includes(id as HeroId)); const strongest=Object.entries(s.damageSources).sort((a,b)=>b[1]-a[1])[0];const top = Object.entries(s.levels).sort((a, b) => b[1] - a[1])[0]; shell(`${header(s.victory?'THE LAST STAND · VICTORY':record?'A stand to remember.':'The night takes another.',s.victory?'The general has fallen. Your survivor made it out.':`Defeated by ${s.lastCause}. Your gold and mastery stay.`)}<div class="result-wave">${String(r.wave).padStart(2, '0')}<span>${s.victory?'MISSION COMPLETE':'WAVE REACHED'}</span></div>${record ? '<div class="new-record">✦ NEW PERSONAL RECORD</div>' : `<p class="muted">Previous best · Wave ${previous}</p>`}<div class="result-grid"><div><b>${format(r.time)}</b><small>SURVIVED</small></div><div><b>${r.kills}</b><small>ZOMBIES DEFEATED</small></div><div class="gold-result"><b>+${r.gold}</b><small>GOLD KEPT</small></div><div><b>${Math.round(r.dealt).toLocaleString()}</b><small>DAMAGE DEALT</small></div><div><b>${Math.round(r.taken)}</b><small>DAMAGE TAKEN</small></div><div><b>${r.combo}</b><small>HIGHEST COMBO</small></div></div><p class="muted">${s.options.mode==='daily'?`Daily score: ${dailyScore} · Personal best: ${save.daily[s.options.date!].score} · `:''}${s.objectives} objectives completed · ${r.elites} elites & bosses defeated · Most invested upgrade: ${top ? (UPGRADES.find(u=>u.id===top[0])?.name||top[0]) + ' ×' + top[1] : 'none'}</p><div class="run-story"><h3>Your build this run</h3><p><b>${WEAPONS[s.weapon].name}</b> · ${s.awakened?`${evolutionOptions(s.hero).find(e=>e.id===s.awakened)!.name} ${s.fullEvolution?'fully evolved':'awakened'}`:'Base weapon'}</p><p>${strongest?`${strongest[0]} contributed ${Math.round(strongest[1]).toLocaleString()} direct damage.`:'Your next stand starts with a fresh build.'} ${s.identity.name} activated ${s.identityProcs} times.</p><p>${Object.keys(s.cardEvolutions).length?'Evolved cards: '+Object.keys(s.cardEvolutions).map(id=>CARD_EVOLUTIONS[id]?.name||id).join(', '):'Max a favourite card to unlock its evolution from wave 11.'}</p>${s.victory?'':`<div class="death-tip"><b>NEXT ATTEMPT</b><p>${deathTip(s.lastCause)}</p></div>`}</div><div class="mastery-result">${HEROES[s.hero].name} mastery · ${save.mastery[s.hero]?.kills||0} kills · ${(()=>{const kills=save.mastery[s.hero]?.kills||0,next=heroTechniques(s.hero).find(t=>t.kills>kills);return next?`${next.kills-kills} kills to ${next.name}`:kills<500?`${500-kills} kills to Veteran appearance`:'Veteran unlocked';})()}</div>${next ? `<div class="unlock-progress"><span>Next survivor: ${next[1].name} <b>${save.gold} / ${next[1].price} gold</b></span><div class="bar"><i style="width:${Math.min(100, save.gold / next[1].price * 100)}%"></i></div></div>` : ''}<div class="actions">${button('Retry this setup →', 'retry', 'primary')}${button('Try another build','play')}${button('Change survivor', 'characters')}${button('Shop', 'shop')}${button('Main menu', 'menu', 'quiet')}</div>`, true); }
function format(seconds: number) { return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`; }
overlay.addEventListener('click', e => {
    const el = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!el || el.disabled)
        return;
    audio.unlock();
    const [a, b, c] = el.dataset.action!.split(':');
    if(a==='evolve'&&menuState==='evolution'&&evolutionOptions(scene!.hero).some(e=>e.id===b)){scene!.evolve(b as EvolutionId);finishIntermission();}
    if(a==='play')runMenu();
    if(a==='daily')runMenu('daily');
    if(a==='mode'&&['short','endless','daily'].includes(b))runMenu(b as RunMode);
    if(a==='build'&&BUILDS.some(build=>build.id===b)){selectedBuild=b as BuildId;runMenu(selectedMode);}
    if(a==='begin')start(selectedMode==='daily'?dailySetup():{mode:selectedMode,build:selectedBuild,technique:save.techniques[save.hero]||'standard'});
    if(a==='retry'&&scene)start({...scene.options});
    if(a==='mastery')masteryMenu();
    if(a==='technique'&&['standard','swift','fortified'].includes(b)&&techniqueUnlocked(save.mastery[save.hero]?.kills||0,b as TechniqueId)){save.techniques[save.hero]=b as TechniqueId;persist();masteryMenu();}
    if (a === 'menu') {
        touchControls?.destroy();touchControls=undefined;game?.destroy(true);
        game = undefined;
        scene = undefined;
        menu();
    }
    if(a==='guide')openGuide();
    if(a==='build')buildMenu();
    if(a==='build-pause'){menuState='settings';pause();}
    if(a==='guide-cards')openGuide('cards');
    if(a==='guide-weapons')openGuide('weapons');
    if(a==='guide-tab'){guideTab=b;guide();}
    if(a==='guide-hero'&&Object.hasOwn(HEROES,b)){guideHero=b as HeroId;guide();}
    if(a==='guide-back'){if(guideReturn==='choice'){menuState='choice';renderChoices();}else if(guideReturn==='evolution')evolutionMenu();else if(guideReturn==='weapons')weapons();else if(guideReturn==='build')buildMenu();else menu();}
    if(a==='card-info'&&choices[Number(b)]){const u=choices[Number(b)];shell(`${header(u.name,u.description)}${visualUpgradeCard(u,Number(b),scene!.hero,scene!.weapon,scene!.levels[u.id]||0)}<p class="muted">${u.evolves?'Evolution · choose once after maxing the base card.':`Level ${(scene!.levels[u.id]||0)+1} / ${u.max}`}</p>${button('← Back to cards','cards-back','quiet')}`,true);}
    if(a==='cards-back'){menuState='choice';renderChoices();}
    if (a === 'characters')
        characters();
    if (a === 'weapons')
        weapons();
    if (a === 'shop')
        shop();
    if (a === 'tab')
        shop(b);
    if (a === 'settings')
        settings();
    if (a === 'resume')
        resume();
    if (a === 'pause') {
        menuState = 'settings';
        pause();
    }
    if (a === 'hero') {
        if (!save.heroes.includes(b as HeroId))
            return;
        save.hero = b as HeroId;
        if (!compatible(save.hero, save.weapon))
            save.weapon = save.weapons.find(w => compatible(save.hero, w))!;
        persist();
        characters();
    }
    if (a === 'weapon') {
        if (!save.weapons.includes(b as WeaponId))
            return;
        save.weapon = b as WeaponId;
        persist();
        weapons();
    }
    if (a === 'buy') {
        if (purchasePending)
            return;
        const kind = b as 'heroes' | 'weapons' | 'permanent';
        const cost = kind === 'heroes' ? HEROES[c as HeroId].price : kind === 'weapons' ? WEAPONS[c as WeaponId].price : 250 + 150 * (save.permanent[c] || 0);
        if (save.gold < cost) {
            toast(`Need ${cost - save.gold} more gold. Keep fighting.`);
            return;
        }
        purchasePending = true;
        if (purchase(save, kind, c)) {
            audio.play('buy');
            persist();
            toast('Unlocked. Make it count.');
        }
        else
            toast('Already owned or unavailable.');
        purchasePending = false;
        shop(b);
    }
    if (a === 'upgrade')
        pick(Number(b));
    if (a === 'reroll') {
        if (scene!.rerolls <= 0) {
            toast('No rerolls remaining.');
            return;
        }
        scene!.rerolls--;
        choices = upgradeChoices(scene!.hero, scene!.levels,scene!.cardRandom,scene!.weapon,scene!.stats.wave,scene!.cardEvolutions);
        renderChoices();
    }
    if (a === 'end' && confirm('End this run? Collected gold is kept.')) {
        scene!.ended = true;
        scene!.stats.time = scene!.elapsed;
        results();
    }
    if (a === 'reset' && confirm('Erase all gold, unlocks, records, and mastery?')) {
        touchControls?.destroy();touchControls=undefined;game?.destroy(true);
        game = undefined;
        scene = undefined;
        save = freshSave();
        persist();
        syncAudio();
        menu();
    }
});
overlay.addEventListener('change',e=>{const el=e.target as HTMLSelectElement;if(el.hasAttribute('data-guide-weapon')&&Object.hasOwn(WEAPONS,el.value)){guideWeapon=el.value as WeaponId;guide();}});
overlay.addEventListener('change', e => {
    const el = e.target as HTMLInputElement, k = el.dataset.setting as 'sound' | 'music' | 'shake' | 'aimAssist';
    if (k) {
        save.settings[k] = el.checked;
        syncAudio();
        persist();
    }
});
overlay.addEventListener('change',e=>{const el=e.target as HTMLSelectElement;if(el.dataset.control==='joystickSide')save.settings.joystickSide=el.value==='right'?'right':'left';else if(el.dataset.control==='joystickSize')save.settings.joystickSize=[95,115,135].includes(Number(el.value))?Number(el.value):115;else return;touchControls?.setLayout(save.settings.joystickSide,save.settings.joystickSize);persist();});
document.addEventListener('keydown', e => {
    if (menuState === 'choice' && ['1', '2', '3'].includes(e.key))
        pick(Number(e.key) - 1);
    if (scene && !scene.ended && [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key))
        e.preventDefault();
});
window.addEventListener('blur', () => {
    if (scene && !scene.ended && !scene.paused)
        pause();
});
window.addEventListener('beforeunload', () => storeSave(save));
hud.addEventListener('click',e=>{const action=(e.target as Element).closest<HTMLElement>('[data-hud]')?.dataset.hud;if(!scene||scene.paused||scene.ended)return;if(action==='build')buildMenu();else if(action==='pause')pause();else if(action==='ability'&&scene.countdown<=0)scene.activate(scene.touch?.x||0,scene.touch?.y||0);});
setInterval(() => {
    const s = scene;
    touchControls?.update(!!s&&!s.ended&&!s.paused&&menuState==='game',s&&s.countdown>0?s.countdown:s?.ability||0,s?techniqueName(s.hero,s.options.technique):HEROES[save.hero].ability,s?HEROES[s.hero].cooldown:1,s?abilityIcons[s.hero]:'➤');
    if (!s || s.ended || menuState !== 'game') {
        if (menuState !== 'game')
            hud.innerHTML = '';
        return;
    }
    const view=s.cameras.main.worldView;const width=s.cameras.main.width,height=s.cameras.main.height;const threats=incomingThreats(s.enemies,view).map(t=>{const p=edgePosition(t.angle,width,height);return `<div class="edge-threat ${t.kind} ${t.urgent?'urgent':''}" style="left:${p.x}px;top:${p.y}px" aria-label="${t.kind} approaching, ${t.count} enemies"><span class="threat-arrow" style="transform:rotate(${t.angle}rad)">➤</span><b>${t.kind==='boss'?'BOSS':t.kind==='elite'?'ELITE':t.count}</b></div>`;}).join('');
    const objectives=s.supplies.filter(c=>c.active).map(c=>({x:c.x,y:c.y,label:'CACHE'}));if(s.eventName==='Hold the zone'&&!s.zone.done)objectives.push({x:s.zone.x,y:s.zone.y,label:'ZONE'});if(s.huntTarget?.active)objectives.push({x:s.huntTarget.x,y:s.huntTarget.y,label:'BOUNTY'});if(s.landmark&&!s.landmark.done)objectives.push({x:s.landmark.x,y:s.landmark.y,label:s.landmark.kind==='cache'?'WRECK · HEAL':s.landmark.kind==='beacon'?'BEACON · XP':'PATROL · SHIELD'});const objectiveMarkers=objectives.filter(o=>!view.contains(o.x,o.y)).slice(0,3).map(o=>{const angle=Math.atan2(o.y-s.y,o.x-s.x),p=edgePosition(angle,width-70,height-30);return `<div class="edge-objective" style="left:${p.x+35}px;top:${p.y+15}px"><span style="display:inline-block;transform:rotate(${angle}rad)">➤</span> ${o.label}</div>`;}).join('');
    hud.innerHTML = `${threats}${objectiveMarkers}${combatHud(s,!!s.touch?.enabled,save.settings.joystickSide==='right')}`;
}, 100);
setInterval(() => {
    if (scene && !scene.ended)
        storeSave(save);
}, 1500);
syncAudio();
menu();
