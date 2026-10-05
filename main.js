const MODES = {
  easy: { label: 'Fácil', size: 3, colors: 4, time: 90 },
  medium: { label: 'Médio', size: 4, colors: 5, time: 120 },
  hard: { label: 'Difícil', size: 5, colors: 6, time: 150 }
};

const PALETTE = [0xff4757, 0x2ed573, 0x1e90ff, 0xffa502, 0xa55eea, 0xffeb3b];

const el = (id) => document.getElementById(id);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
const VIEW = 5;
const camera = new THREE.OrthographicCamera(-VIEW, VIEW, VIEW, -VIEW, 0.1, 100);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

const world = new THREE.Group();
scene.add(world);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const edgeGeometry = new THREE.EdgesGeometry(cubeGeometry);
const edgeMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.5
});

function createLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(6, 12, 8);
  scene.add(sun);
}

function createStars() {
  const positions = [];
  for (let i = 0; i < 500; i++) {
    const radius = 14 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.12 })
  );
  scene.add(points);
  return points;
}

function createPlatform() {
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(4.2, 4.2, 0.25, 48),
    new THREE.MeshLambertMaterial({ color: 0x2d2d6b })
  );
  base.position.y = -3.2;
  scene.add(base);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(4.4, 0.06, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x6c5ce7 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -3.05;
  scene.add(ring);
  return ring;
}

function resizeScene() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;
  const vertical = aspect < 1 ? VIEW / aspect : VIEW;
  renderer.setSize(width, height);
  camera.left = -vertical * Math.max(aspect, 1);
  camera.right = vertical * Math.max(aspect, 1);
  camera.top = vertical;
  camera.bottom = -vertical;
  camera.updateProjectionMatrix();
}

createLights();
const stars = createStars();
const ring = createPlatform();
window.addEventListener('resize', resizeScene);
resizeScene();

const game = {
  state: 'menu',
  mode: 'easy',
  score: 0,
  streak: 0,
  timeLeft: 0,
  target: 0,
  cubes: [],
  removing: [],
  hovered: null,
  lastTick: 0
};

function hexToCss(value) {
  return '#' + value.toString(16).padStart(6, '0');
}

function buildCubes(modeKey) {
  world.clear();
  game.cubes = [];
  game.removing = [];
  const { size, colors } = MODES[modeKey];
  const spacing = 1.12;
  const offset = ((size - 1) * spacing) / 2;
  const scale = size > 4 ? 0.8 : 1;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        const colorIndex = Math.floor(Math.random() * colors);
        const material = new THREE.MeshLambertMaterial({
          color: PALETTE[colorIndex],
          emissive: 0x000000
        });
        const cube = new THREE.Mesh(cubeGeometry, material);
        cube.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));
        cube.position.set(x * spacing - offset, y * spacing - offset, z * spacing - offset);
        cube.scale.setScalar(scale);
        cube.userData = { colorIndex, removed: false };
        world.add(cube);
        game.cubes.push(cube);
      }
    }
  }
}

function aliveCubes() {
  return game.cubes.filter((cube) => !cube.userData.removed);
}

function chooseTarget() {
  const colors = [...new Set(aliveCubes().map((cube) => cube.userData.colorIndex))];
  game.target = colors[Math.floor(Math.random() * colors.length)];
  el('swatch').style.background = hexToCss(PALETTE[game.target]);
}

function refreshHud() {
  el('score').textContent = game.score;
  el('timer').textContent = Math.ceil(game.timeLeft);
}

function removeCube(cube) {
  cube.userData.removed = true;
  game.removing.push(cube);
  game.streak += 1;
  game.score += 100 + (game.streak - 1) * 20;
  if (aliveCubes().length === 0) {
    finishGame(true);
    return;
  }
  chooseTarget();
}

function penalize(cube) {
  game.streak = 0;
  game.score = Math.max(0, game.score - 50);
  game.timeLeft = Math.max(0, game.timeLeft - 3);
  cube.material.emissive.setHex(0xff0000);
  setTimeout(() => {
    if (!cube.userData.removed) cube.material.emissive.setHex(0x000000);
  }, 200);
}

function startGame(modeKey) {
  game.mode = modeKey;
  game.score = 0;
  game.streak = 0;
  game.timeLeft = MODES[modeKey].time;
  buildCubes(modeKey);
  chooseTarget();
  el('overlay').style.display = 'none';
  el('hud').style.display = 'flex';
  refreshHud();
  game.lastTick = performance.now();
  game.state = 'play';
}

function finishGame(won) {
  game.state = 'over';
  const bonus = won ? Math.round(game.timeLeft) * 10 : 0;
  game.score += bonus;
  el('hud').style.display = 'none';
  el('overlay').style.display = 'flex';
  el('box').innerHTML = `
    <h1>${won ? '🎉 Você venceu!' : '⏰ Tempo esgotado'}</h1>
    <div class="msg">Pontuação final: <b>${game.score}</b>${won ? ` (bônus de tempo: +${bonus})` : ''}</div>
    <input id="playerName" maxlength="12" placeholder="Seu nome" value="Jogador">
    <div><button onclick="submitScore()">Salvar no ranking</button></div>
  `;
}

function updateTimer(now) {
  game.timeLeft -= (now - game.lastTick) / 1000;
  game.lastTick = now;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    refreshHud();
    finishGame(false);
    return;
  }
  refreshHud();
}

function animateRemoved() {
  for (let i = game.removing.length - 1; i >= 0; i--) {
    const cube = game.removing[i];
    cube.scale.multiplyScalar(0.85);
    cube.rotation.y += 0.3;
    if (cube.scale.x < 0.03) {
      world.remove(cube);
      game.removing.splice(i, 1);
    }
  }
}

function loadRanking(modeKey) {
  try {
    return JSON.parse(localStorage.getItem('ranking_' + modeKey)) || [];
  } catch (error) {
    return [];
  }
}

function addToRanking(modeKey, name, points) {
  const list = loadRanking(modeKey);
  list.push({ name, points });
  list.sort((a, b) => b.points - a.points);
  try {
    localStorage.setItem('ranking_' + modeKey, JSON.stringify(list.slice(0, 5)));
  } catch (error) {
    return;
  }
}

function rankingHtml() {
  return Object.keys(MODES)
    .map((modeKey) => {
      const list = loadRanking(modeKey);
      const body = list.length
        ? '<ol>' + list.map((item) => `<li>${item.name} — ${item.points}</li>`).join('') + '</ol>'
        : '<div class="msg">Sem registros</div>';
      return `<h2>🏆 ${MODES[modeKey].label}</h2>${body}`;
    })
    .join('');
}

function submitScore() {
  const name = (el('playerName').value || 'Jogador').slice(0, 12);
  addToRanking(game.mode, name, game.score);
  showMenu();
}

function showMenu() {
  game.state = 'menu';
  el('hud').style.display = 'none';
  el('overlay').style.display = 'flex';
  const buttons = Object.keys(MODES)
    .map((key) => `<button onclick="startGame('${key}')">${MODES[key].label}</button>`)
    .join('');
  el('box').innerHTML = `
    <h1>🧊 Magico </h1>
    <div class="msg">Remova os cubos da cor pedida antes do tempo acabar.<br>Arraste para girar e clique para remover.</div>
    <h2>Escolha o modo</h2>
    ${buttons}
    ${rankingHtml()}
  `;
  buildCubes('medium');
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const canvas = renderer.domElement;
let drag = null;

function cubeAt(event) {
  pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(aliveCubes())[0];
  return hit ? hit.object : null;
}

function rotateWorld(dx, dy) {
  world.rotation.y += dx * 0.01;
  world.rotation.x = Math.max(-1, Math.min(1, world.rotation.x + dy * 0.01));
}

function updateHover(event) {
  const cube = cubeAt(event);
  if (game.hovered && game.hovered !== cube && !game.hovered.userData.removed) {
    game.hovered.material.emissive.setHex(0x000000);
  }
  if (cube) cube.material.emissive.setHex(0x444444);
  game.hovered = cube;
}

canvas.addEventListener('pointerdown', (event) => {
  drag = { x: event.clientX, y: event.clientY, moved: false };
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  if (drag) {
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
    rotateWorld(dx, dy);
    drag.x = event.clientX;
    drag.y = event.clientY;
    return;
  }
  if (game.state === 'play') updateHover(event);
});

canvas.addEventListener('pointerup', (event) => {
  const finished = drag;
  drag = null;
  if (!finished || finished.moved || game.state !== 'play') return;
  const cube = cubeAt(event);
  if (!cube) return;
  if (cube.userData.colorIndex === game.target) {
    removeCube(cube);
  } else {
    penalize(cube);
  }
  if (game.state === 'play') refreshHud();
});

function loop(now) {
  requestAnimationFrame(loop);
  stars.rotation.y += 0.0006;
  ring.rotation.z += 0.003;
  if (game.state !== 'play' && !drag) world.rotation.y += 0.004;
  if (game.state === 'play') updateTimer(now);
  animateRemoved();
  renderer.render(scene, camera);
}

showMenu();
requestAnimationFrame(loop);
