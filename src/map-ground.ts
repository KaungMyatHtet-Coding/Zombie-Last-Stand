/** Stable, sparse wreck placement leaves broad connected routes in the endless city. */
export type Wreck = {x:number;y:number;halfW:number;halfH:number;horizontal:boolean;variant:number;kind?:'stump'|'log'};
export function wrecksNear(x:number,y:number,radius=850):Wreck[]{
 const result:Wreck[]=[];
 for(let row=Math.floor((y-radius)/640);row<=Math.floor((y+radius)/640);row++)
 for(let col=Math.floor((x-radius)/640);col<=Math.floor((x+radius)/640);col++){
  const seed=((Math.imul(col,73856093)^Math.imul(row,19349663))>>>0);
  if(seed%4===0)continue;
  const horizontal=seed%2===0;
  result.push({x:col*640+140+seed%240,y:row*640+140+(seed>>>8)%240,halfW:horizontal?64:29,halfH:horizontal?29:64,horizontal,variant:seed%3});
 }
 return result;
}
/** Circle against the visible rectangular chassis; resolves along the nearest edge. */
export function separateWrecks(x:number,y:number,r:number,cars:Wreck[]){
 for(const c of cars){
  const nx=Math.max(c.x-c.halfW,Math.min(x,c.x+c.halfW)),ny=Math.max(c.y-c.halfH,Math.min(y,c.y+c.halfH));
  const dx=x-nx,dy=y-ny,d=Math.hypot(dx,dy);
  if(d>=r)continue;
  if(d>0){x+=dx/d*(r-d);y+=dy/d*(r-d);}else{
   const px=c.halfW+r-Math.abs(x-c.x),py=c.halfH+r-Math.abs(y-c.y);
   if(px<py)x=c.x+(x<c.x?-1:1)*(c.halfW+r);else y=c.y+(y<c.y?-1:1)*(c.halfH+r);
  }
 }
 return {x,y};
}
/** Choose a clearance corner when a wreck intersects the route to the hero. */
export function wreckSteering(x:number,y:number,tx:number,ty:number,r:number,cars:Wreck[]){
 for(const c of cars){
  const hw=c.halfW+r+12,hh=c.halfH+r+12,dx=tx-x,dy=ty-y;
  let lo=0,hi=1;
  for(const [p,v,min,max] of [[x,dx,c.x-hw,c.x+hw],[y,dy,c.y-hh,c.y+hh]]){
   if(Math.abs(v)<.001){if(p<min||p>max){lo=2;break;}}
   else{const a=(min-p)/v,b=(max-p)/v;lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));}
  }
  if(lo>hi||lo>1||hi<0)continue;
  const corners=[[-hw,-hh],[hw,-hh],[-hw,hh],[hw,hh]].map(([cx,cy])=>({x:c.x+cx,y:c.y+cy}));
  const visible=corners.filter(p=>!(Math.abs(x-c.x)>hw&&Math.sign(p.x-c.x)!==Math.sign(x-c.x))&&!(Math.abs(y-c.y)>hh&&Math.sign(p.y-c.y)!==Math.sign(y-c.y)));
  const best=(visible.length?visible:corners).sort((a,b)=>(Math.hypot(a.x-x,a.y-y)+Math.hypot(tx-a.x,ty-a.y))-(Math.hypot(b.x-x,b.y-y)+Math.hypot(tx-b.x,ty-b.y)))[0];
  return Math.atan2(best.y-y,best.x-x);
 }
 return Math.atan2(ty-y,tx-x);
}

/** Smooth geographic transition anchored to the original run spawn, independent of waves. */
export function parkBlend(x:number,y:number){
 const t=Math.max(0,Math.min(1,(Math.hypot(x-600,y-380)-1500)/1000));
 return t*t*(3-2*t);
}
export function mapObstaclesNear(x:number,y:number,radius=850):Wreck[]{
 const nearby=wrecksNear(x,y,radius),city=nearby.filter(c=>parkBlend(c.x,c.y)<.25);
 const park=nearby.filter(c=>parkBlend(c.x,c.y)>.85).map(c=>{
  const log=c.variant===1;
  return {...c,kind:log?'log' as const:'stump' as const,halfW:log?42:20,halfH:log?14:20};
 });
 return [...city,...park];
}
