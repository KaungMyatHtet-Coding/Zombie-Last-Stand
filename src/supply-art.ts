import type Phaser from 'phaser';
import {drawHealSupply} from './heal-supply';
type G=Phaser.GameObjects.Graphics;
export function drawCoins(g:G,x:number,y:number){
 for(let i=0;i<3;i++){const px=x+(i-1)*7,py=y-Math.abs(i-1)*3;g.fillStyle(0x98612a);g.lineStyle(2,0x302b26);g.fillEllipse(px,py+3,13,9);g.strokeEllipse(px,py+3,13,9);g.fillStyle(0xffd363);g.fillEllipse(px,py,13,7);g.lineStyle(1,0xffefaf);g.lineBetween(px-3,py-1,px+2,py-1);}
}
export function drawSupply(g:G,x:number,y:number,time:number){drawHealSupply(g,x,y,time);drawCoins(g,x+24,y+21);}
export function drawBeacon(g:G,x:number,y:number,time:number,progress:number){
 const pulse=.5+.5*Math.sin(time*2.4);
 g.fillStyle(0x7be1e5,.04+pulse*.05);g.fillEllipse(x,y,190,110);g.lineStyle(2,0x75c9d5,.35);g.strokeEllipse(x,y,190,110);
 g.lineStyle(4,0xb9fcdf,.9);g.beginPath();for(let i=0;i<=64*Math.min(1,progress/6);i++){const a=-Math.PI/2+i/64*Math.PI*2;if(i===0)g.moveTo(x+95*Math.cos(a),y+55*Math.sin(a));else g.lineTo(x+95*Math.cos(a),y+55*Math.sin(a));}g.strokePath();
 g.fillStyle(0x15262d,.5);g.fillEllipse(x,y+24,56,18);g.fillStyle(0x28424b);g.lineStyle(3,0x14252b);g.fillRoundedRect(x-20,y-2,40,25,5);g.strokeRoundedRect(x-20,y-2,40,25,5);g.fillStyle(0x577b88);g.fillRoundedRect(x-20,y-8,40,22,5);g.strokeRoundedRect(x-20,y-8,40,22,5);
 g.lineStyle(6,0x162c36);g.lineBetween(x,y-7,x,y-34);g.lineStyle(3,0xb6dbe0);g.lineBetween(x,y-7,x,y-34);g.fillStyle(0x97fff0);g.fillCircle(x,y-36,5);
 g.lineStyle(2,0x8af7ee,.4+pulse*.5);for(const side of [-1,1]){g.beginPath();g.arc(x,y-36,17,side===1?-.7:Math.PI-.7,side===1?.7:Math.PI+.7);g.strokePath();}
 for(const dx of [-31,31]){g.fillStyle(0x6ce0e5);g.lineStyle(2,0x1d4c62);g.fillTriangle(x+dx,y+5,x+dx-6,y+17,x+dx+6,y+17);g.strokeTriangle(x+dx,y+5,x+dx-6,y+17,x+dx+6,y+17);}
}
export function drawMagnet(g:G,x:number,y:number,time:number){
 g.fillStyle(0x14252d,.4);g.fillEllipse(x,y+23,52,16);g.fillStyle(0xa0dfee,.08+.08*(1+Math.sin(time*2.4)));g.fillEllipse(x,y+20,70,28);
 g.lineStyle(17,0x172432);g.beginPath();g.moveTo(x-15,y-19);g.lineTo(x-15,y+4);g.arc(x,y+4,15,Math.PI,0,true);g.lineTo(x+15,y-19);g.strokePath();
 g.lineStyle(11,0xd85764);g.lineBetween(x-15,y-19,x-15,y+5);g.beginPath();g.arc(x,y+4,15,Math.PI,Math.PI/2,true);g.strokePath();g.lineStyle(11,0x589bdf);g.beginPath();g.arc(x,y+4,15,Math.PI/2,0,true);g.strokePath();g.lineBetween(x+15,y+4,x+15,y-19);
 for(const dx of [-15,15]){g.fillStyle(0xd9e7e5);g.lineStyle(2,0x253d4a);g.fillRoundedRect(x+dx-6,y-22,12,9,2);g.strokeRoundedRect(x+dx-6,y-22,12,9,2);g.lineStyle(2,0xffffff,.7);g.lineBetween(x+dx-3,y-19,x+dx+3,y-19);}
}
