import test from 'node:test';
import assert from 'node:assert/strict';
import {wrecksNear,separateWrecks,wreckSteering,type Wreck} from '../src/map-ground';
const car:Wreck={x:0,y:0,halfW:30,halfH:64,horizontal:false,variant:0};
test('wreck placement is stable across neighboring views and negative coordinates',()=>{
 const a=wrecksNear(-300,-300),b=wrecksNear(-301,-300);
 for(const c of a.filter(c=>Math.abs(c.x+300)<400&&Math.abs(c.y+300)<400))assert.ok(b.some(d=>d.x===c.x&&d.y===c.y));
});
test('car blocks circles at edges and resolves an actor inside the chassis',()=>{
 assert.deepEqual(separateWrecks(40,0,17,[car]),{x:47,y:0});
 const inside=separateWrecks(0,0,17,[car]);assert.ok(Math.abs(inside.x)>=47||Math.abs(inside.y)>=81);
 assert.deepEqual(separateWrecks(100,0,17,[car]),{x:100,y:0});
});
test('enemy routes toward a clearance corner instead of directly into a car',()=>{
 const a=wreckSteering(-150,0,150,0,17,[car]);assert.ok(Math.abs(a)>.1);
 assert.equal(wreckSteering(-150,200,150,200,17,[car]),0);
});
test('sparse placement leaves hundreds of units between wrecks',()=>{
 const cars=wrecksNear(0,0,1800);
 for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++)assert.ok(Math.hypot(cars[i].x-cars[j].x,cars[i].y-cars[j].y)>350);
});

test('park is anchored to spawn, blends in all directions, and preserves return locations',async()=>{
 const {parkBlend,mapObstaclesNear}=await import('../src/map-ground');
 assert.equal(parkBlend(600,380),0);assert.equal(parkBlend(2100,380),0);
 assert.equal(parkBlend(3100,380),1);assert.equal(parkBlend(-1900,380),1);
 assert.equal(parkBlend(2600,380),.5);assert.equal(parkBlend(600,2380),.5);
 const origin=mapObstaclesNear(600,380,400);mapObstaclesNear(4000,380,400);
 assert.deepEqual(mapObstaclesNear(600,380,400),origin);
 const park=mapObstaclesNear(4000,380,400);assert.ok(park.length>0);assert.ok(park.every(c=>c.kind));
 for(const c of park){const p=separateWrecks(c.x,c.y,17,[c]);assert.ok(p.x!==c.x||p.y!==c.y);}
});
