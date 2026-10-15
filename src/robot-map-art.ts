import type Phaser from 'phaser';
import {reactorBlend,type RobotOrigin,type RobotProp} from './robot-map';
/** Illustrated terrain and independent sprites share the collision world's coordinates. */
export class RobotMapArt {
 private factory:Phaser.GameObjects.Image[]=[];
 private garden:Phaser.GameObjects.Image[]=[];
 private props:Phaser.GameObjects.Image[]=[];
 constructor(private scene:Phaser.Scene){
  for(const key of ['robot-factory-ground','robot-garden-ground']){
   const texture=scene.textures.get(key),source=texture.getSourceImage(),w=source.width/8,h=source.height/8;
   for(let y=0;y<8;y++)for(let x=0;x<8;x++)texture.add(`${x}-${y}`,0,Math.floor(x*w),Math.floor(y*h),Math.ceil(w),Math.ceil(h));
  }
  const sheets={
   'robot-factory-props':[[78,108,703,546],[823,231,507,433],[1463,327,645,228]],
   'robot-garden-props':[[64,41,722,645],[924,168,406,499],[1444,289,710,375]]
  };
  for(const [key,frames] of Object.entries(sheets))frames.forEach(([x,y,w,h],i)=>scene.textures.get(key).add(String(i),0,x,y,w,h));
 }
 hide(){for(const pool of [this.factory,this.garden,this.props])for(const image of pool)image.setVisible(false);}
 render(view:{x:number;y:number;right:number;bottom:number},origin:RobotOrigin,props:RobotProp[]){
  let i=0;
  for(let row=Math.floor(view.y/1024)-1;row<=Math.ceil(view.bottom/1024)+1;row++)for(let col=Math.floor(view.x/1024)-1;col<=Math.ceil(view.right/1024)+1;col++){
   let image=this.factory[i];if(!image){image=this.scene.add.image(0,0,'robot-factory-ground','__BASE').setOrigin(0).setDepth(-5);this.factory.push(image);}
   image.setVisible(true).setPosition(col*1024,row*1024).setDisplaySize(1025,1025).setFlip(col%2!==0,row%2!==0);i++;
  }
  for(let n=i;n<this.factory.length;n++)this.factory[n].setVisible(false);
  i=0;
  for(let row=Math.floor(view.y/128)-1;row<=Math.ceil(view.bottom/128)+1;row++)for(let col=Math.floor(view.x/128)-1;col<=Math.ceil(view.right/128)+1;col++){
   const alpha=reactorBlend(col*128+64,row*128+64,origin);if(alpha===0)continue;
   let image=this.garden[i];if(!image){image=this.scene.add.image(0,0,'robot-garden-ground').setOrigin(0).setDepth(-4.5);this.garden.push(image);}
   const flipX=Math.floor(col/8)%2!==0,flipY=Math.floor(row/8)%2!==0,cx=((col%8)+8)%8,cy=((row%8)+8)%8;
   image.setVisible(true).setTexture('robot-garden-ground',`${flipX?7-cx:cx}-${flipY?7-cy:cy}`).setPosition(col*128,row*128).setDisplaySize(129,129).setFlip(flipX,flipY).setAlpha(alpha);i++;
  }
  for(let n=i;n<this.garden.length;n++)this.garden[n].setVisible(false);
  i=0;
  for(const prop of props){
   if(prop.x+prop.halfW*2<view.x||prop.x-prop.halfW*2>view.right||prop.y+prop.halfH*2<view.y||prop.y-prop.halfH*2>view.bottom)continue;
   const factory=['assembly','cargo'].includes(prop.robotKind),key=factory?'robot-factory-props':'robot-garden-props',frame=prop.robotKind==='assembly'||prop.robotKind==='reactor'?'0':prop.robotKind==='cargo'||prop.robotKind==='charger'?'1':'2';
   let image=this.props[i];if(!image){image=this.scene.add.image(0,0,key,frame).setDepth(-1);this.props.push(image);}
   const size=prop.robotKind==='assembly'?248:prop.robotKind==='cargo'?145:prop.robotKind==='reactor'?280:prop.robotKind==='charger'?100:190;
   const source=this.scene.textures.get(key).get(frame);const height=size*source.height/source.width;
   image.setVisible(true).setTexture(key,frame).setOrigin(prop.robotKind==='assembly'?.31:.5,prop.robotKind==='assembly'?.65:.5).setPosition(prop.x,prop.y).setDisplaySize(size,height);i++;
   if(prop.robotKind==='assembly'){
    let belt=this.props[i];if(!belt){belt=this.scene.add.image(0,0,'robot-factory-props','2').setDepth(-1);this.props.push(belt);}
    belt.setVisible(true).setTexture('robot-factory-props','2').setPosition(prop.x,prop.y+78).setOrigin(.5).setDisplaySize(160,57);i++;
   }
  }
  for(let n=i;n<this.props.length;n++)this.props[n].setVisible(false);
 }
}
