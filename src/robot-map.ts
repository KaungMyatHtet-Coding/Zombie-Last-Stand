import type {Wreck} from './map-ground';
export type RobotOrigin={x:number;y:number};
export type RobotProp=Wreck&{robotKind:'assembly'|'cargo'|'reactor'|'charger'|'planter'};
/** The first robot-sector entry is permanent: walking back always returns to the factory. */
export function reactorBlend(x:number,y:number,origin:RobotOrigin){
 const t=Math.max(0,Math.min(1,(Math.hypot(x-origin.x,y-origin.y)-1250)/850));return t*t*(3-2*t);
}
export function robotPropsNear(x:number,y:number,origin:RobotOrigin,radius=1000):RobotProp[]{
 const props:RobotProp[]=[];
 const reactors=[[2700,-220],[-2700,220],[220,2700],[-220,-2700]].map(([dx,dy])=>({x:origin.x+dx,y:origin.y+dy}));
 for(let row=Math.floor((y-radius)/800);row<=Math.floor((y+radius)/800);row++)for(let col=Math.floor((x-radius)/800);col<=Math.floor((x+radius)/800);col++){
  const seed=(Math.imul(col,73856093)^Math.imul(row,19349663))>>>0;
  if(seed%5===0)continue;
  const px=col*800+180+seed%260,py=row*800+180+(seed>>>9)%260;
  if(Math.hypot(px-origin.x,py-origin.y)<260||reactors.some(r=>Math.hypot(px-r.x,py-r.y)<420))continue;
  const garden=reactorBlend(px,py,origin);if(garden>.1&&garden<.9)continue;
  const robotKind=garden>.9?(seed%7===0?'reactor':seed%2?'charger':'planter'):(seed%3?'assembly':'cargo');
  const halfW=robotKind==='reactor'?112:robotKind==='assembly'?80:robotKind==='planter'?64:32;
  const halfH=robotKind==='reactor'?112:robotKind==='assembly'?105:robotKind==='planter'?28:48;
  props.push({x:px,y:py,halfW,halfH,horizontal:false,variant:seed%3,robotKind});
 }
 for(const r of reactors)if(Math.abs(r.x-x)<radius+100&&Math.abs(r.y-y)<radius+100)props.push({...r,halfW:112,halfH:112,horizontal:false,variant:0,robotKind:'reactor'});
 return props;
}
