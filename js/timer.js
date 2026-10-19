export class Timer {
  constructor() { this.left = 0; this.running = false; }
  start(seconds) { this.left = seconds; this.running = true; }
  stop() { this.running = false; }
  add(seconds) { this.left += seconds; }
  penalty(seconds) { this.left = Math.max(0, this.left - seconds); }
  update(dt) { if (this.running) this.left = Math.max(0, this.left - dt); }
}
