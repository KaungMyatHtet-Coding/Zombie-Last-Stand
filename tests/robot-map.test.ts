import test from 'node:test';
import assert from 'node:assert/strict';
import {reactorBlend,robotPropsNear} from '../src/robot-map';
import {separateWrecks} from '../src/map-ground';
const origin={x:600,y:380};
test('factory and gardens connect smoothly and return to the same anchored world',()=>{
 assert.equal(reactorBlend(600,380,origin),0);assert.equal(reactorBlend(3400,380,origin),1);
 let previous=0;for(let d=0;d<=2800;d+=10){const blend=reactorBlend(600+d,380,origin);assert.ok(blend>=previous&&blend-previous<.03);previous=blend;}
 assert.equal(reactorBlend(-2200,380,origin),1);assert.equal(reactorBlend(600,380,origin),0);
});
test('robot landmarks are stable across view changes, sparse, and leave entry and transition clear',()=>{
 const a=robotPropsNear(600,380,origin,3500),b=robotPropsNear(601,380,origin,3500);
 for(const p of a.filter(p=>Math.abs(p.x-600)<2500&&Math.abs(p.y-380)<2500))assert.ok(b.some(q=>q.x===p.x&&q.y===p.y&&q.robotKind===p.robotKind));
 assert.ok(a.some(p=>p.robotKind==='assembly'));assert.ok(a.some(p=>p.robotKind==='charger'));assert.ok(a.some(p=>p.robotKind==='reactor'));
 for(const p of a){assert.ok(Math.hypot(p.x-600,p.y-380)>=260);const blend=reactorBlend(p.x,p.y,origin);assert.ok(blend<=.1||blend>=.9);for(const q of a)if(q!==p)assert.ok(Math.abs(q.x-p.x)>p.halfW+q.halfW+200||Math.abs(q.y-p.y)>p.halfH+q.halfH+200);}
});
test('factory machines and garden props block movement using their visible bases',()=>{
 for(const p of robotPropsNear(600,380,origin,3500)){const clear=separateWrecks(p.x,p.y,20,[p]);assert.ok(Math.abs(clear.x-p.x)>=p.halfW+20||Math.abs(clear.y-p.y)>=p.halfH+20);}
});

test('wide walkable route connects factory to gardens and back without walls or portals',()=>{
 const props=robotPropsNear(2000,380,origin,3500);
 const free=(x:number,y:number)=>props.every(p=>Math.abs(p.x-x)>p.halfW+20||Math.abs(p.y-y)>p.halfH+20);
 const start=[600,380],goal=[3400,380],queue=[start],seen=new Set(['600,380']);let reached=false;
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];if(x===goal[0]&&y===goal[1]){reached=true;break;}for(const [dx,dy] of [[100,0],[-100,0],[0,100],[0,-100]]){const nx=x+dx,ny=y+dy,key=nx+','+ny;if(nx<0||nx>4000||ny< -820||ny>1580||seen.has(key)||!free(nx,ny))continue;seen.add(key);queue.push([nx,ny]);}}assert.ok(reached);
});
