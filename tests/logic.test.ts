import { test } from 'node:test';
import assert from 'node:assert/strict';
import { waveBudget, scaling, wavePlan, damageValue, cooldownValue } from '../src/waves';
import { freshSave, validateSave, purchase, compatible } from '../src/save';
import { upgradeChoices } from '../src/upgrades';
test('wave one exact roster and spawn timing', () => { const p = wavePlan(1); for (const [type, n] of [['basic', 16], ['runner', 4], ['brute', 1]])
    assert.equal(p.filter(s => s.type === type).reduce((a, s) => a + s.count, 0), n); assert.ok(p.every(s => s.time < 40)); });
test('wave budget and moderate scaling', () => { assert.equal(waveBudget(1), 100); assert.equal(waveBudget(11), 800); assert.deepEqual(scaling(1), { health: 1, damage: 1, speed: 1 }); assert.equal(scaling(100).speed, 1.3); for (let w = 2; w < 30; w++)
    assert.ok(waveBudget(w) > waveBudget(w - 1)); });
test('all handcrafted waves and endless waves have bounded schedules', () => { for (let w = 1; w < 30; w++) {
    const p = wavePlan(w);
    assert.ok(p.length > 0);
    assert.ok(p.every(s => s.time >= 0 && s.time < 40));
} assert.equal(wavePlan(10).filter(s => s.type === 'boss').length, 1); });
test('corrupt saves recover and sanitize', () => { assert.deepEqual(validateSave(null), freshSave()); assert.deepEqual(validateSave({ version: 99 }), freshSave()); const s = validateSave({ version: 1, gold: -500, heroes: ['ninja', 'fake'], weapons: ['fake'], hero: 'gunner', weapon: 'pistols', permanent: { health: 900 }, bestWave: Infinity, settings: { sound: false } }); assert.equal(s.gold, 0); assert.equal(s.hero, 'ninja'); assert.equal(s.weapon, 'katana'); assert.equal(s.permanent.health, 3); assert.equal(s.bestWave, 0); assert.equal(s.settings.sound, false); });
test('purchases never overdraw or duplicate', () => { const s = freshSave(); assert.equal(purchase(s, 'heroes', 'samurai'), false); s.gold = 1000; assert.equal(purchase(s, 'heroes', 'samurai'), true); assert.equal(s.gold, 200); assert.equal(purchase(s, 'heroes', 'samurai'), false); assert.equal(purchase(s, 'heroes', 'unknown'), false); s.gold = 10000; for (let i = 0; i < 3; i++)
    assert.equal(purchase(s, 'permanent', 'health'), true); assert.equal(purchase(s, 'permanent', 'health'), false); });
test('weapon compatibility and valid owned loadout', () => { assert.ok(compatible('ninja', 'katana')); assert.equal(compatible('gunner', 'katana'), false); const s = freshSave(); s.heroes.push('samurai'); s.hero = 'samurai'; assert.equal(validateSave(s).weapon, 'nodachi'); });
test('upgrade choices unique, class restricted and level capped', () => { for (let i = 0; i < 40; i++) {
    const choices = upgradeChoices('ninja', { double: 1 });
    assert.equal(new Set(choices.map(u => u.id)).size, choices.length);
    assert.ok(choices.every(u => (!u.hero || u.hero === 'ninja') && u.id !== 'double'));
} });
test('damage critical armour and cooldown bounds', () => { assert.equal(damageValue(100, 1, true), 180); assert.equal(damageValue(100, 1, false, true), 55); assert.equal(cooldownValue(7, 1, .2), 5.6000000000000005); assert.ok(cooldownValue(.01, 100, 1) >= .08); });

test('early waves exclude armed late enemies and retain one final boss',()=>{
 for(let w=1;w<=10;w++){
  const plan=wavePlan(w);
  assert.ok(plan.every(p=>!['cleaver','spear','shooterBoss'].includes(p.type)));
  assert.equal(plan.filter(p=>p.type==='boss').reduce((n,p)=>n+p.count,0),w===10?1:0);
 }
});
