import * as THREE from 'three';

const rings = [];

export function buildEnvironment(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#0b1026');
  grad.addColorStop(1, '#4a2377');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random()})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 400, 2, 2);
  }
  const bg = new THREE.CanvasTexture(canvas);
  bg.colorSpace = THREE.SRGBColorSpace;
  scene.background = bg;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x334466, 1.5));
  const sun = new THREE.DirectionalLight(0xffffff, 2.5);
  sun.position.set(200, 400, 150);
  scene.add(sun);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(420, 440, 24, 64), new THREE.MeshStandardMaterial({ color: 0x1b1f3b, roughness: 0.8 }));
  base.position.y = -112;
  scene.add(base);
  const grid = new THREE.GridHelper(560, 14, 0x8a7dff, 0x3b3f78);
  grid.position.y = -99;
  scene.add(grid);

  const pillarGeo = new THREE.CylinderGeometry(10, 12, 80, 16);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x6c63ff, roughness: 0.4 });
  for (const [x, z] of [[-280, -280], [280, -280], [-280, 280], [280, 280]]) {
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(x, -60, z);
    scene.add(pillar);
  }


}

export function updateEnvironment(t) {
  rings.forEach((ring, i) => {
    ring.rotation.x = Math.PI / 2 + Math.sin(t * 0.5 + i) * 0.08;
    ring.position.y = ring.userData.baseY + Math.sin(t + i * 2) * 12;
  });
}
