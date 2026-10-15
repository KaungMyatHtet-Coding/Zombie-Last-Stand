import test from 'node:test';
import assert from 'node:assert/strict';
import {UPGRADES,upgradeChoices} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {wavePlan} from '../src/waves';
import {seededRandom} from '../src/retention';
test('every regular upgrade has a named evolution',()=>{for(const u of UPGRADES)assert.ok(CARD_EVOLUTIONS[u.id]?.effect);});
test('maxed cards evolve from wave 11 alongside regular choices',()=>{
 const levels={damage:5};assert.ok(upgradeChoices('ninja',levels,()=>0,'katana',10,{}).every(u=>!u.evolves));
 const options=upgradeChoices('ninja',levels,()=>0,'katana',11,{});assert.ok(options.some(u=>u.evolves==='damage'));assert.ok(options.some(u=>!u.evolves));assert.ok(upgradeChoices('ninja',levels,()=>0,'katana',50,{damage:true}).every(u=>u.evolves!=='damage'));
});
test('mini bosses spawn after wave 10 and alternate before major bosses',()=>{
 for(let w=1;w<=10;w++)assert.ok(wavePlan(w).every(s=>!['shooterBoss','commander'].includes(s.type)));
 assert.ok(wavePlan(11,seededRandom(1)).some(s=>s.type==='shooterBoss'));assert.ok(wavePlan(13,seededRandom(1)).some(s=>s.type==='commander'));assert.ok(wavePlan(15).some(s=>s.type==='boss'));
});
