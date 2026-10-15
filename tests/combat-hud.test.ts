import test from 'node:test';
import assert from 'node:assert/strict';
import {equippedEffects} from '../src/combat-hud';
test('equipped effects show actual levels and evolution names without empty upgrades',()=>{const effects=equippedEffects({levels:{damage:5,orbit:3,speed:0},cardEvolutions:{orbit:true}});assert.equal(effects.length,2);assert.equal(effects.find(e=>e.id==='orbit')?.name,'Phantom Blades');assert.equal(effects.find(e=>e.id==='damage')?.level,5);});
