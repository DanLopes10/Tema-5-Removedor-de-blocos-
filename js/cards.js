export const UPGRADES = [
  { id: 'double', icon: '💥', name: 'Golpe duplo', desc: 'Cada acerto quebra +1 bloco da cor pedida', max: 3 },
  { id: 'explosion', icon: '🧨', name: 'Explosão', desc: 'Acertos também quebram vizinhos da mesma cor', max: 2 },
  { id: 'slow', icon: '🐌', name: 'Câmera lenta', desc: 'O relógio corre 30% mais devagar', max: 3 },
  { id: 'hourglass', icon: '⏳', name: 'Ampulheta', desc: '+2s a cada acerto', max: 3 },
  { id: 'shield', icon: '🛡️', name: 'Escudo', desc: 'Bloqueia o próximo erro', max: 3 },
  { id: 'xray', icon: '👁️', name: 'Raio-X', desc: 'Blocos de outras cores ficam translúcidos', max: 1 },
  { id: 'combo', icon: '🔥', name: 'Combo', desc: '+50% de pontos em cada acerto', max: 3 },
  { id: 'time', icon: '🕒', name: 'Tempo extra', desc: '+10 segundos agora', max: Infinity },
];

export const emptyPerks = () => Object.fromEntries(UPGRADES.map((u) => [u.id, 0]));

export const nextDelay = () => 12 + Math.random() * 10;

export function drawCards(perks, amount = 2) {
  return UPGRADES.filter((u) => perks[u.id] < u.max)
    .sort(() => Math.random() - 0.5)
    .slice(0, amount);
}

export function activePerks(perks) {
  return UPGRADES.filter((u) => perks[u.id] > 0).map((u) => ({ icon: u.icon, name: u.name, count: perks[u.id] }));
}
