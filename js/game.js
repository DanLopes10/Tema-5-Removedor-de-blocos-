import { PALETTE, createBlocks, removeBlock, setXray } from './blocks.js';
import { Timer } from './timer.js';
import { addScore } from './ranking.js';
import { emptyPerks, drawCards, nextDelay, activePerks } from './cards.js';


export const MODES = {
  easy:   { blocks: 30, colors: 4, time: 100, penalty: 3, mult: 1,   spin: 0.04 },
  medium: { blocks: 45, colors: 6, time: 90,  penalty: 5, mult: 1.5, spin: 0.10 },
  hard:   { blocks: 60, colors: 8, time: 90,  penalty: 8, mult: 2,   spin: 0.20 },
};

const BLAST_RADIUS = 67;
const BLAST_GROWTH = 20;
const SLOW_FACTOR = 0.7;
const HOURGLASS_SECONDS = 2;
const EXTRA_TIME_SECONDS = 10;
const COMBO_BONUS = 0.5;

export class Game {
  constructor(scene, hooks) {
    this.scene = scene;
    this.hooks = hooks;                       
    this.timer = new Timer();
    this.state = 'menu';                       
    this.spin = 0.08;                          
    this.perks = emptyPerks();
    this.blocks = createBlocks(scene, 30, 6); 
  }

  start(mode, name) {
    this.mode = mode;
    this.name = name;
    this.cfg = MODES[mode];
    this.blocks = createBlocks(this.scene, this.cfg.blocks, this.cfg.colors);
    this.score = 0;
    this.combo = 0;
    this.elapsed = 0;
    this.nextCard = nextDelay();
    this.perks = emptyPerks();
    this.spin = this.cfg.spin;
    this.timer.start(this.cfg.time);
    this.pickTarget();
    this.state = 'playing';
  }

  pickTarget() {
    const left = [...new Set(this.blocks.map((b) => b.userData.color))];
    this.target = PALETTE[left[Math.floor(Math.random() * left.length)]];
    setXray(this.blocks, this.perks.xray > 0, this.target);
  }

  collectHits(block) {
    const hits = new Set([block]);
    const sameColor = this.blocks.filter((b) => b !== block && PALETTE[b.userData.color] === this.target);
    if (this.perks.explosion > 0) {
      const radius = BLAST_RADIUS + BLAST_GROWTH * (this.perks.explosion - 1);
      sameColor.forEach((b) => {
        if (b.position.distanceTo(block.position) <= radius) hits.add(b);
      });
    }
    sameColor
      .filter((b) => !hits.has(b))
      .sort(() => Math.random() - 0.5)
      .slice(0, this.perks.double)
      .forEach((b) => hits.add(b));
    return [...hits];
  }

  click(block) {
    if (this.state !== 'playing' || !block) return;
    if (PALETTE[block.userData.color] === this.target) {
      this.combo++;
      const broken = this.collectHits(block);
      const comboBonus = 1 + COMBO_BONUS * this.perks.combo;
      const each = (100 + 10 * Math.min(this.combo, 10)) * this.cfg.mult * comboBonus;
      this.score += Math.round(each * broken.length);
      broken.forEach((b) => removeBlock(b));
      this.blocks = this.blocks.filter((b) => !broken.includes(b));
      this.timer.add(HOURGLASS_SECONDS * this.perks.hourglass);
      if (this.blocks.length === 0) return this.end(true);
      this.pickTarget();
    } else if (this.perks.shield > 0) {
      this.perks.shield--;
      this.hooks.onShield();
    } else {
      this.combo = 0;
      this.score = Math.max(0, this.score - 50);
      this.timer.penalty(this.cfg.penalty);
      this.hooks.onWrong();
    }
  }

  openCards() {
    this.state = 'choosing';
    this.hooks.onCards(drawCards(this.perks));
  }

  pickCard(id) {
    if (this.state !== 'choosing') return;
    if (id === 'time') this.timer.add(EXTRA_TIME_SECONDS);
    else this.perks[id]++;
    this.nextCard = this.elapsed + nextDelay();
    setXray(this.blocks, this.perks.xray > 0, this.target);
    this.state = 'playing';
  }

  update(dt) {
    if (this.state !== 'playing') return;
    this.elapsed += dt;
    this.timer.update(dt * Math.pow(SLOW_FACTOR, this.perks.slow));
    if (this.timer.left <= 0) return this.end(false);
    if (this.elapsed >= this.nextCard) this.openCards();
  }

  end(win) {
    this.state = 'over';
    this.spin = 0.08;
    this.timer.stop();
    const left = this.timer.left;
    if (win) this.score += Math.round(left * 10 * this.cfg.mult); 
    const time = Math.round((this.cfg.time - left) * 10) / 10;  
    const rank = this.score > 0 ? addScore({ name: this.name, mode: this.mode, score: this.score, time }) : 0;
    this.hooks.onEnd({ win, score: this.score, time, mode: this.mode, rank });
  }

  info() {
    return {
      score: this.score,
      time: this.timer.left,
      left: this.blocks.length,
      combo: this.combo,
      target: this.target,
      perks: activePerks(this.perks),
    };
  }
}
