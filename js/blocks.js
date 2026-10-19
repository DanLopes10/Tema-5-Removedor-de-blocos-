import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const PALETTE = [
  { name: 'Vermelho', css: '#e53935' }, { name: 'Azul', css: '#1e88e5' },
  { name: 'Verde', css: '#43a047' },    { name: 'Amarelo', css: '#fdd835' },
  { name: 'Roxo', css: '#8e24aa' },     { name: 'Laranja', css: '#fb8c00' },
  { name: 'Ciano', css: '#00acc1' },    { name: 'Rosa', css: '#ec407a' },
];

const CELL = 56;                                           
const geometry = new RoundedBoxGeometry(36, 36, 36, 4, 6); 
const group = new THREE.Group();
const vanishing = [];                                      
let hovered = null;

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

export function createBlocks(scene, count, colorCount) {
  clearBlocks();
  if (!group.parent) scene.add(group);
  const cells = []; 
  for (let x = 0; x < 8; x++) for (let y = 0; y < 3; y++) for (let z = 0; z < 8; z++) cells.push([x - 3.5, y - 1, z - 3.5]);
  shuffle(cells);

  const blocks = [];
  for (let i = 0; i < count; i++) {
    const color = i % colorCount;
    const material = new THREE.MeshStandardMaterial({ color: PALETTE[color].css, roughness: 0.35, metalness: 0.1 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cells[i][0] * CELL, cells[i][1] * CELL, cells[i][2] * CELL);
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.scale.setScalar(0.9 + Math.random() * 0.3);
    mesh.userData = { color, baseY: mesh.position.y, phase: Math.random() * 6.28 };
    group.add(mesh);
    blocks.push(mesh);
  }
  return blocks;
}

export function clearBlocks() {
  group.children.forEach((b) => b.material.dispose());
  group.clear();
  vanishing.length = 0;
  hovered = null;
}

export function removeBlock(block) {
  if (hovered === block) hovered = null;
  vanishing.push(block);
}

export function pickBlock(raycaster, blocks) {
  const hit = raycaster.intersectObjects(blocks, false)[0];
  return hit ? hit.object : null;
}

export function hover(block) {
  if (block === hovered) return;
  if (hovered) hovered.material.emissive.setHex(0x000000);
  hovered = block;
  if (block) block.material.emissive.setHex(0x555555);
}

export function updateBlocks(blocks, t, dt) {
  for (const b of blocks) b.position.y = b.userData.baseY + Math.sin(t * 1.5 + b.userData.phase) * 4;
  for (let i = vanishing.length - 1; i >= 0; i--) {
    const b = vanishing[i];
    b.scale.subScalar(dt * 4);
    b.rotation.y += dt * 10;
    if (b.scale.x <= 0.05) { group.remove(b); b.material.dispose(); vanishing.splice(i, 1); }
  }
}

export function setXray(blocks, active, target) {
  for (const b of blocks) {
    const dimmed = active && PALETTE[b.userData.color] !== target;
    b.material.transparent = active;
    b.material.opacity = dimmed ? 0.25 : 1;
    b.material.depthWrite = !dimmed;
    b.material.needsUpdate = true;
  }
}
