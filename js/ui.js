import { getRanking, clearRanking } from './ranking.js';

const $ = (id) => document.getElementById(id);
const show = (id, on = true) => $(id).classList.toggle('hidden', !on);
let last = { mode: 'easy', name: 'Jogador' };

export function initUI({ onStart }) {
  const play = (mode, name) => {
    last = { mode, name };
    show('menu', false); show('end', false); show('cards', false); show('hud');
    onStart(mode, name);
  };
  document.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.onclick = () => play(btn.dataset.mode, $('name').value.trim() || 'Jogador');
  });
  $('again').onclick = () => play(last.mode, last.name);
  $('back').onclick = showMenu;
  $('clear').onclick = () => { clearRanking(); renderRanking(); };
  showMenu();
}

export function showMenu() {
  show('hud', false); show('end', false); show('cards', false); show('menu');
  renderRanking();
}

function renderRanking() {
  const list = getRanking().slice(0, 8);
  const body = $('rank');
  body.replaceChildren();
  list.forEach((r, i) => {
    const row = body.insertRow();
    [`${i + 1}º`, r.name, r.mode, `${r.score} pts`, `${r.time}s`].forEach((v) => { row.insertCell().textContent = v; });
  });
  if (!list.length) body.insertRow().insertCell().textContent = 'Ninguém jogou ainda.';
}

export function updateHud(s) {
  $('score').textContent = s.score;
  $('time').textContent = Math.ceil(s.time);
  $('left').textContent = s.left;
  $('combo').textContent = s.combo;
  $('swatch').style.background = s.target.css;
  $('tname').textContent = s.target.name;
  $('time').classList.toggle('low', s.time <= 10);
  renderPerks(s.perks);
}

let perksKey = '';

function renderPerks(perks) {
  const key = perks.map((p) => p.icon + p.count).join();
  if (key === perksKey) return;
  perksKey = key;
  $('perks').replaceChildren(...perks.map((p) => {
    const tag = document.createElement('span');
    tag.title = p.name;
    tag.textContent = `${p.icon} ${p.count}`;
    return tag;
  }));
}

export function showCards(options, onPick) {
  const list = $('cardList');
  list.replaceChildren(...options.map((opt) => {
    const btn = document.createElement('button');
    btn.className = 'upgrade';
    const icon = document.createElement('span');
    icon.className = 'upgrade-icon';
    icon.textContent = opt.icon;
    const name = document.createElement('b');
    name.textContent = opt.name;
    const desc = document.createElement('small');
    desc.textContent = opt.desc;
    btn.append(icon, name, desc);
    btn.onclick = () => onPick(opt.id);
    return btn;
  }));
  show('cards');
}

export function hideCards() {
  show('cards', false);
}

export function showEnd(r) {
  show('hud', false); show('end');
  $('endTitle').textContent = r.win ? 'Você limpou tudo!' : 'Tempo esgotado!';
  $('endText').textContent = `${r.score} pontos em ${r.time}s (${r.mode})` + (r.rank ? `. ${r.rank}º no ranking!` : '.');
}

export function flash(kind = 'wrong') {
  $('flash').classList.toggle('shield', kind === 'shield');
  $('flash').classList.add('on');
  setTimeout(() => $('flash').classList.remove('on'), 80);
}
