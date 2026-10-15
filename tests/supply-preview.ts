import Phaser from 'phaser';
import {drawSupply,drawBeacon,drawMagnet} from '../src/supply-art';
class Preview extends Phaser.Scene {create(){const g=this.add.graphics();g.setScale(2);drawSupply(g,80,100,0);drawBeacon(g,230,100,0,3);drawMagnet(g,380,100,0);for(const [x,t] of [[160,'HEAL + GOLD'],[460,'XP BEACON'],[760,'XP & GOLD MAGNET']] as const)this.add.text(x,290,t,{fontFamily:'Arial',fontSize:'17px',color:'#e7f1e3'}).setOrigin(.5);}}
new Phaser.Game({type:Phaser.CANVAS,width:920,height:360,backgroundColor:'#34414d',scene:Preview,audio:{noAudio:true}});
