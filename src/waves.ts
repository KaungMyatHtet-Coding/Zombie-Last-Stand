import {encounterRhythm} from './run-design';
import { ENEMIES, type EnemyId } from './config';
export const waveBudget = (wave: number) => 100 + 30 * (wave - 1) + 4 * (wave - 1) ** 2;
export const scaling = (wave: number) => ({ health: 1 + (wave - 1) * .06, damage: 1 + (wave - 1) * .045, speed: 1 + Math.min((wave - 1) * .012, .3) });
export type Spawn = {
    time: number;
    type: EnemyId;
    count: number;
    formation: number;
};
export function wavePlan(w: number, random=Math.random): Spawn[] {
    if (w === 1)
        return [{ time: 0, type: 'basic', count: 4, formation: 0 }, { time: 6, type: 'basic', count: 3, formation: 1 }, { time: 6, type: 'runner', count: 1, formation: 1 }, { time: 12, type: 'basic', count: 3, formation: 2 }, { time: 18, type: 'runner', count: 2, formation: 3 }, { time: 24, type: 'basic', count: 3, formation: 0 }, { time: 24, type: 'runner', count: 1, formation: 0 }, { time: 30, type: 'basic', count: 3, formation: 2 }, { time: 35, type: 'brute', count: 1, formation: 1 }];
    const counts: Partial<Record<EnemyId, number>>[] = [{}, {}, { basic: 20, runner: 6, brute: 1 }, { basic: 18, runner: 5, spitter: 3 }, { basic: 22, runner: 4, brute: 2, elite: 1 }, { basic: 35, runner: 6, spitter: 2 }, { basic: 18, armoured: 6, spitter: 4 }, { basic: 20, runner: 8, spitter: 4, brute: 2 }, { basic: 24, armoured: 5, elite: 1 }, { basic: 40, brute: 5, spitter: 4 }, { boss: 1, basic: 36, runner: 8 }];
    const out: Spawn[] = [];
    if (w <= 10) {
        for (const [type, n] of Object.entries(counts[w])) {
            let left = n;
            let i = 0;
            while (left > 0) {
                const count = Math.min(left, type === 'basic' ? 4 : 2);
                out.push({ time: type === 'boss' ? 0 : Math.min(39, i * 7 + (type === 'basic' ? 0 : 4)), type: type as EnemyId, count, formation: i % 6 });
                left -= count;
                i++;
            }
        }
    }
    else {
        const windows = [[0, 10, .2], [10, 25, .35], [25, 35, .25], [35, 40, .2]];
        for (const [a, b, f] of windows) {
            let budget = Math.floor(waveBudget(w) * f * encounterRhythm(w).density), i = 0;
            while (budget >= 5) {
                const variant=(w-11)%4;
                const keys: EnemyId[] = [...(variant===1?['runner' as EnemyId,'runner' as EnemyId,'runner' as EnemyId]:['basic' as EnemyId,'basic' as EnemyId]), 'runner', 'spitter', 'armoured', 'brute', 'cleaver', ...(w>=12?['spear' as EnemyId]:[]), ...(w>=13?['rifle' as EnemyId]:[]), ...(w % 4 === 0 ? ['elite' as EnemyId] : [])];
                const affordable=keys.filter(type=>ENEMIES[type].cost<=budget);
                const type = affordable.length?affordable[Math.floor(random() * affordable.length)]:'basic';
                if (ENEMIES[type].cost > budget)
                    continue;
                out.push({ time: a + (b - a) * random(), type, count: 1, formation: variant===1?3:i++ % 6 });
                budget -= ENEMIES[type].cost;
            }
        }
        out.push({time:6,type:w===11?'cleaver':w===12?'spear':'rifle',count:1,formation:1});
        if(w%5===1)out.push({time:0,type:'shooterBoss',count:1,formation:0});
        if(w%5===3)out.push({time:0,type:'commander',count:1,formation:0});
        if (w % 5 === 0)
            out.push({ time: 0, type: 'boss', count: 1, formation: 0 });
    }
    // Small extra flanks compensate for early wave-clear cards without raising health.
    if(w>=4&&w<=10){
        out.push({time:18,type:'basic',count:2,formation:1});
        if(w>=6)out.push({time:32,type:'runner',count:1,formation:3});
    }
    if(w>=8){
        // Extra ordinary packs add crowd pressure without multiplying elite or boss counts.
        const extra=Math.round(Math.min(180,80+(w-8)*16)*encounterRhythm(w).density);
        const batches=Math.ceil(extra/8);
        for(let i=0;i<batches;i++){
            const count=Math.min(8,extra-i*8),runners=Math.floor(count/4),time=2+i*37/Math.max(1,batches-1);
            out.push({time,type:'basic',count:count-runners,formation:i%2===0?3:1});
            if(runners)out.push({time:Math.min(39,time+.4),type:'runner',count:runners,formation:3});
        }
    }
    // Three short gaps let players collect drops without stopping the encounter.
    if(w>=8)for(const spawn of out)if(spawn.time>=12&&spawn.time<15||spawn.time>=26&&spawn.time<29)spawn.time+=3;
    return out.sort((a, b) => a.time - b.time);
}
export const damageValue = (base: number, multiplier: number, crit: boolean, armour = false) => Math.round(base * multiplier * (crit ? 1.8 : 1) * (armour ? .55 : 1));
export const cooldownValue = (base: number, rate: number, reduction = 0) => Math.max(.08, base / rate * (1 - Math.min(.75, reduction)));
