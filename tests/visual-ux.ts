import '../src/style.css';
import {actorCanvas} from '../src/art';
import {evolutionPreview} from '../src/evolution-preview';
import {evolutionOptions} from '../src/progression';
import {TouchControls} from '../src/touch';
const cards=document.querySelector('#cards')!;cards.innerHTML=evolutionOptions('samurai').map(e=>`<button class="upgrade">${evolutionPreview('samurai',e.id)}<small>EVOLUTION 1</small><h3>${e.name}</h3><p>${e.description}</p><strong>SELECT →</strong></button>`).join('');
const c=document.querySelector<HTMLCanvasElement>('#actors')!.getContext('2d')!;const heroes=['ninja','samurai','gunner','tank'] as const;for(let row=0;row<4;row++){c.fillStyle='#c6ceca';c.font='13px sans-serif';c.fillText(heroes[row].toUpperCase(),10,row*75+40);for(let col=0;col<4;col++){c.save();c.translate(170+col*155,38+row*75);c.rotate(col*Math.PI/2);c.drawImage(actorCanvas('hero',heroes[row],row%3),-36,-36,72,72);c.restore();}}const touch=new TouchControls(()=>{});touch.state.enabled=true;touch.setLayout('left',115);touch.update(true,0,'ABILITY');
