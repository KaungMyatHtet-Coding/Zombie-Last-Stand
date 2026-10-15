import type Phaser from 'phaser';

/** Fixed cartoon cross: only its ground glow pulses, never the pickup itself. */
export function drawHealSupply(g: Phaser.GameObjects.Graphics, x: number, y: number, time: number) {
  const pulse = .5 + .5 * Math.sin(time * 2.4);
  g.fillStyle(0x0c1b19, .35);g.fillEllipse(x, y + 23, 55, 18);
  g.fillStyle(0x8ef59a, .06 + pulse * .08);g.fillEllipse(x, y + 19, 82, 35);
  g.fillStyle(0xb3ffb6, .1 + pulse * .14);g.fillEllipse(x, y + 19, 52, 21);
  const points = [[-7,-23],[7,-23],[7,-9],[21,-9],[21,5],[7,5],[7,19],[-7,19],[-7,5],[-21,5],[-21,-9],[-7,-9]];
  function cross(offset: number, color: number) {
    g.fillStyle(color);g.lineStyle(4,0x142a26,1);
    g.beginPath();g.moveTo(x+points[0][0],y+points[0][1]+offset);
    for(const [px,py] of points.slice(1))g.lineTo(x+px,y+py+offset);
    g.closePath();g.fillPath();g.strokePath();
  }
  cross(6,0x367749);
  cross(0,0x87d95b);
  g.lineStyle(2,0xd8ffb1,.9);
  g.lineBetween(x-4,y-19,x+4,y-19);g.lineBetween(x-17,y-5,x-9,y-5);
  g.lineStyle(2,0x55a848,1);g.lineBetween(x+17,y-5,x+17,y+1);g.lineBetween(x+3,y+8,x+3,y+15);
}
