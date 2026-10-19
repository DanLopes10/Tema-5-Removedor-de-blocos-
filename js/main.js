import * as THREE from 'three';
import { buildEnvironment, updateEnvironment } from './environment.js';
import { pickBlock, hover, updateBlocks } from './blocks.js';
import { Game } from './game.js';
import * as ui from './ui.js';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 3000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.prepend(renderer.domElement);

buildEnvironment(scene);
const game = new Game(scene, {
  onEnd: ui.showEnd,
  onWrong: () => ui.flash('wrong'),
  onShield: () => ui.flash('shield'),
  onCards: (options) => ui.showCards(options, (id) => { ui.hideCards(); game.pickCard(id); }),
});
ui.initUI({ onStart: (mode, name) => game.start(mode, name) });

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const setPointer = (e) => pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
addEventListener('pointermove', setPointer);
renderer.domElement.addEventListener('pointerdown', (e) => {
  setPointer(e);
  raycaster.setFromCamera(pointer, camera);
  game.click(pickBlock(raycaster, game.blocks));
});

function resize() {
  const aspect = innerWidth / innerHeight;
  const size = Math.max(700, 600 / aspect);
  camera.left = (-size * aspect) / 2;
  camera.right = (size * aspect) / 2;
  camera.top = size / 2;
  camera.bottom = -size / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
addEventListener('resize', resize);
resize();

let angle = 0;
let last = 0;
renderer.setAnimationLoop((now) => {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  const t = now / 1000;

  angle += game.spin * dt;
  camera.position.set(Math.sin(angle) * 800, 500, Math.cos(angle) * 800);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();

  game.update(dt);
  updateBlocks(game.blocks, t, dt);
  updateEnvironment(t);

  raycaster.setFromCamera(pointer, camera);
  hover(game.state === 'playing' ? pickBlock(raycaster, game.blocks) : null);
  if (game.state === 'playing') ui.updateHud(game.info());

  renderer.render(scene, camera);
});
