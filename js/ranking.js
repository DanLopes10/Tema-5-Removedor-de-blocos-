const KEY = 'removedor-ranking';

export function getRanking() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

export function addScore(entry) {
  const top = [...getRanking(), entry]
    .sort((a, b) => b.score - a.score || a.time - b.time)
    .slice(0, 10);
  try { localStorage.setItem(KEY, JSON.stringify(top)); } catch {}
  return top.indexOf(entry) + 1; 
}

export function clearRanking() {
  try { localStorage.removeItem(KEY); } catch {}
}
