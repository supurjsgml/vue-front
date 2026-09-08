<template>
  <div class="black-hole-bg-container" :class="{ 'is-dark': isDarkTheme }">
    <div ref="mountRef" class="webgl-canvas-mount"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

const mountRef = ref<HTMLDivElement | null>(null);

const isDarkTheme = ref(true);

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let galaxyGroup: THREE.Group | null = null;

let galaxyPoints: THREE.Points | null = null;
let flarePoints: THREE.Points | null = null;
let bgFarPoints: THREE.Points | null = null;
let bgMidPoints: THREE.Points | null = null;
let bgNearPoints: THREE.Points | null = null;

let galaxyGeometry: THREE.BufferGeometry | null = null;
let flareGeometry: THREE.BufferGeometry | null = null;
let bgFarGeometry: THREE.BufferGeometry | null = null;
let bgMidGeometry: THREE.BufferGeometry | null = null;
let bgNearGeometry: THREE.BufferGeometry | null = null;

let galaxyMaterial: THREE.PointsMaterial | null = null;
let flareMaterial: THREE.PointsMaterial | null = null;
let bgFarMaterial: THREE.PointsMaterial | null = null;
let bgMidMaterial: THREE.PointsMaterial | null = null;
let bgNearMaterial: THREE.PointsMaterial | null = null;

let starTexture: THREE.CanvasTexture | null = null;
let flareTexture: THREE.CanvasTexture | null = null;

let animationFrameId = 0;
let isTabVisible = true;

const PARTICLE_COUNT = 32000;
const FLARE_STAR_COUNT = 52;
const GALAXY_RADIUS = 1450;
const CORE_RADIUS = 95;

let particlePositions: Float32Array | null = null;
let starRadii: Float32Array | null = null;
let starSpeeds: Float32Array | null = null;
let starArmOffsets: Float32Array | null = null;
let starPerpOffsets: Float32Array | null = null;
let starAlongOffsets: Float32Array | null = null;
let starAngleNoise: Float32Array | null = null;
let starCoreAngles: Float32Array | null = null;
let starCoreAngularSpeeds: Float32Array | null = null;
let starCoreOffsetX: Float32Array | null = null;
let starCoreOffsetY: Float32Array | null = null;
let starCoreOffsetZ: Float32Array | null = null;
let starZ: Float32Array | null = null;

let flarePositionsArr: Float32Array | null = null;
let flareRadii: Float32Array | null = null;
let flareSpeeds: Float32Array | null = null;
let flareArmOffsets: Float32Array | null = null;
let flarePerpOffsets: Float32Array | null = null;
let flareZ: Float32Array | null = null;

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let currentRotationX = -0.94;
let currentRotationY = -0.05;
let targetRotationX = -0.94;
let targetRotationY = -0.05;



const createSoftStarTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.12, 'rgba(240, 248, 255, 0.95)');
  gradient.addColorStop(0.35, 'rgba(180, 220, 255, 0.5)');
  gradient.addColorStop(0.7, 'rgba(100, 180, 255, 0.12)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const createDiffractionSpikeTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const cx = 64;
  const cy = 64;

  const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 48);
  coreGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
  coreGlow.addColorStop(0.15, 'rgba(220, 240, 255, 0.9)');
  coreGlow.addColorStop(0.4, 'rgba(140, 200, 255, 0.35)');
  coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 1.5;
  const spikeGradientH = ctx.createLinearGradient(4, cy, 124, cy);
  spikeGradientH.addColorStop(0, 'rgba(255, 255, 255, 0)');
  spikeGradientH.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
  spikeGradientH.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.strokeStyle = spikeGradientH;
  ctx.beginPath();
  ctx.moveTo(4, cy);
  ctx.lineTo(124, cy);
  ctx.stroke();

  const spikeGradientV = ctx.createLinearGradient(cx, 4, cx, 124);
  spikeGradientV.addColorStop(0, 'rgba(255, 255, 255, 0)');
  spikeGradientV.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
  spikeGradientV.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.strokeStyle = spikeGradientV;
  ctx.beginPath();
  ctx.moveTo(cx, 4);
  ctx.lineTo(cx, 124);
  ctx.stroke();

  const diagLen = 42;
  ctx.lineWidth = 0.8;
  const diagGrad1 = ctx.createLinearGradient(cx - diagLen, cy - diagLen, cx + diagLen, cy + diagLen);
  diagGrad1.addColorStop(0, 'rgba(255, 255, 255, 0)');
  diagGrad1.addColorStop(0.5, 'rgba(220, 240, 255, 0.6)');
  diagGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.strokeStyle = diagGrad1;
  ctx.beginPath();
  ctx.moveTo(cx - diagLen, cy - diagLen);
  ctx.lineTo(cx + diagLen, cy + diagLen);
  ctx.stroke();

  const diagGrad2 = ctx.createLinearGradient(cx - diagLen, cy + diagLen, cx + diagLen, cy - diagLen);
  diagGrad2.addColorStop(0, 'rgba(255, 255, 255, 0)');
  diagGrad2.addColorStop(0.5, 'rgba(220, 240, 255, 0.6)');
  diagGrad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.strokeStyle = diagGrad2;
  ctx.beginPath();
  ctx.moveTo(cx - diagLen, cy + diagLen);
  ctx.lineTo(cx + diagLen, cy - diagLen);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const randomGaussian = (): number => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

let coreGlowSprite: THREE.Sprite | null = null;
let coreGlowTexture: THREE.CanvasTexture | null = null;

const createCoreGlowTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const cx = 128;
  const cy = 128;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 128);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.12, 'rgba(230, 245, 255, 0.95)');
  grad.addColorStop(0.3, 'rgba(125, 211, 252, 0.55)');
  grad.addColorStop(0.55, 'rgba(56, 189, 248, 0.2)');
  grad.addColorStop(0.8, 'rgba(14, 165, 233, 0.05)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const updateGalaxyCenterPosition = () => {
  if (!galaxyGroup) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const posX = -width * 0.22;
  const posY = -height * 0.18;
  galaxyGroup.position.set(posX, posY, 0);
};

const initGalaxy = () => {
  if (!scene) return;

  galaxyGroup = new THREE.Group();
  scene.add(galaxyGroup);

  updateGalaxyCenterPosition();

  galaxyGroup.rotation.x = -0.94;
  galaxyGroup.rotation.y = -0.05;
  galaxyGroup.rotation.z = 0.15;

  starTexture = createSoftStarTexture();
  flareTexture = createDiffractionSpikeTexture();
  coreGlowTexture = createCoreGlowTexture();

  const coreGlowMat = new THREE.SpriteMaterial({
    map: coreGlowTexture,
    transparent: true,
    opacity: isDarkTheme.value ? 0.95 : 0.6,
    blending: isDarkTheme.value ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: false
  });
  coreGlowSprite = new THREE.Sprite(coreGlowMat);
  coreGlowSprite.scale.set(160, 160, 1);
  galaxyGroup.add(coreGlowSprite);

  particlePositions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  starRadii = new Float32Array(PARTICLE_COUNT);
  starSpeeds = new Float32Array(PARTICLE_COUNT);
  starArmOffsets = new Float32Array(PARTICLE_COUNT);
  starPerpOffsets = new Float32Array(PARTICLE_COUNT);
  starAlongOffsets = new Float32Array(PARTICLE_COUNT);
  starAngleNoise = new Float32Array(PARTICLE_COUNT);
  starCoreAngles = new Float32Array(PARTICLE_COUNT);
  starCoreAngularSpeeds = new Float32Array(PARTICLE_COUNT);
  starCoreOffsetX = new Float32Array(PARTICLE_COUNT);
  starCoreOffsetY = new Float32Array(PARTICLE_COUNT);
  starCoreOffsetZ = new Float32Array(PARTICLE_COUNT);
  starZ = new Float32Array(PARTICLE_COUNT);

  const ARMS = 3;

  const colorDiamondWhite = new THREE.Color('#ffffff');
  const colorIceBlue = new THREE.Color('#7dd3fc');
  const colorCyan = new THREE.Color('#38bdf8');
  const colorDeepBlue = new THREE.Color('#60a5fa');
  const colorAmber = new THREE.Color('#fbbf24');
  const colorWarmOrange = new THREE.Color('#fb923c');
  const colorPeach = new THREE.Color('#fed7aa');
  const colorDustRose = new THREE.Color('#f472b6');

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    let x = 0;
    let y = 0;
    let z = 0;
    const chosenColor = new THREE.Color();

    if (i < 5500) {
      const isAccretionDisk = (i % 3 !== 0);
      let coreR = 0;
      let thickness = 0;
      let ox = 0;
      let oy = 0;
      let oz = 0;

      if (isAccretionDisk) {
        coreR = Math.pow(Math.random(), 2.2) * CORE_RADIUS;
        thickness = Math.pow(coreR / CORE_RADIUS, 0.9) * 5 + 1.8;
        ox = randomGaussian() * 3.5;
        oy = randomGaussian() * 3.5;
        oz = randomGaussian() * thickness;
      } else {
        coreR = Math.pow(Math.random(), 1.6) * CORE_RADIUS;
        thickness = (1 - coreR / CORE_RADIUS) * 44 + 8;
        ox = randomGaussian() * 6;
        oy = randomGaussian() * 6;
        oz = randomGaussian() * thickness;
      }

      const angle = Math.random() * Math.PI * 2;

      x = Math.cos(angle) * coreR + ox;
      y = Math.sin(angle) * coreR + oy;
      z = oz;

      starRadii[i] = coreR;
      starCoreAngles[i] = angle;
      starSpeeds[i] = 0.010 + Math.random() * 0.014;
      starCoreAngularSpeeds[i] = 0.0006 + (1 - coreR / CORE_RADIUS) * 0.0010;
      starCoreOffsetX[i] = ox;
      starCoreOffsetY[i] = oy;
      starCoreOffsetZ[i] = oz;
      starAngleNoise[i] = 0;

      const mixRatio = coreR / CORE_RADIUS;
      if (mixRatio < 0.35) {
        chosenColor.copy(colorDiamondWhite);
      } else if (mixRatio < 0.70) {
        chosenColor.lerpColors(colorDiamondWhite, colorIceBlue, (mixRatio - 0.35) / 0.35);
      } else {
        chosenColor.lerpColors(colorIceBlue, colorAmber, (mixRatio - 0.70) / 0.30);
      }
    } else if (i < 27000) {
      const armIndex = (i - 5500) % ARMS;
      const armAngleOffset = (armIndex * (2 * Math.PI)) / ARMS;

      const progress = Math.pow(Math.random(), 0.80);
      const r = CORE_RADIUS * 0.7 + progress * (GALAXY_RADIUS - CORE_RADIUS * 0.7);
      const rRatio = r / GALAXY_RADIUS;

      const spiralTurns = 3.2;
      const angleNoiseScale = rRatio * 0.16 + 0.06;
      const angleNoise = randomGaussian() * angleNoiseScale;
      const spiralTheta = Math.pow(rRatio, 0.86) * (Math.PI * spiralTurns) + armAngleOffset + angleNoise;

      const spread = Math.pow(rRatio, 1.1) * 115 + 28;
      const perpOffset = randomGaussian() * spread;
      const alongOffset = randomGaussian() * (spread * 0.4);

      const perpAngle = spiralTheta + Math.PI / 2;
      x = Math.cos(spiralTheta) * (r + alongOffset) + Math.cos(perpAngle) * perpOffset;
      y = Math.sin(spiralTheta) * (r + alongOffset) + Math.sin(perpAngle) * perpOffset;

      const verticalSpread = Math.pow(rRatio, 1.1) * 36 + 8;
      z = randomGaussian() * verticalSpread;

      starRadii[i] = r;
      starSpeeds[i] = 0.024 + Math.random() * 0.032;
      starArmOffsets[i] = armAngleOffset;
      starAngleNoise[i] = angleNoise;
      starPerpOffsets[i] = perpOffset;
      starAlongOffsets[i] = alongOffset;
      starZ[i] = z;

      const colorRoll = Math.random();

      if (colorRoll < 0.48) {
        chosenColor.lerpColors(colorIceBlue, colorDiamondWhite, Math.random());
      } else if (colorRoll < 0.72) {
        chosenColor.lerpColors(colorCyan, colorDeepBlue, Math.random());
      } else if (colorRoll < 0.91) {
        chosenColor.lerpColors(colorPeach, colorWarmOrange, Math.random());
      } else if (colorRoll < 0.97) {
        chosenColor.lerpColors(colorAmber, colorPeach, Math.random());
      } else {
        chosenColor.lerpColors(colorDustRose, colorIceBlue, Math.random());
      }

      if (rRatio > 0.8) {
        chosenColor.multiplyScalar(0.75 + Math.random() * 0.25);
      }
    } else {
      const outerProgress = Math.pow(Math.random(), 0.75);
      const minOuterR = GALAXY_RADIUS * 0.35;
      const r = minOuterR + outerProgress * (GALAXY_RADIUS * 1.05 - minOuterR);
      const rRatio = r / GALAXY_RADIUS;

      const diskAngle = Math.random() * Math.PI * 2;
      const spiralTurns = 3.0;
      const spiralTheta = diskAngle + Math.pow(rRatio, 0.86) * (Math.PI * spiralTurns);

      const spread = Math.pow(rRatio, 1.2) * 110 + 30;
      const perpOffset = randomGaussian() * spread;
      const alongOffset = randomGaussian() * (spread * 0.4);

      const perpAngle = spiralTheta + Math.PI / 2;
      x = Math.cos(spiralTheta) * (r + alongOffset) + Math.cos(perpAngle) * perpOffset;
      y = Math.sin(spiralTheta) * (r + alongOffset) + Math.sin(perpAngle) * perpOffset;

      const verticalSpread = Math.pow(rRatio, 1.1) * 40 + 10;
      z = randomGaussian() * verticalSpread;

      starRadii[i] = r;
      starSpeeds[i] = 0.022 + Math.random() * 0.030;
      starArmOffsets[i] = diskAngle;
      starAngleNoise[i] = 0;
      starPerpOffsets[i] = perpOffset;
      starAlongOffsets[i] = alongOffset;
      starZ[i] = z;

      const colorRoll = Math.random();

      if (colorRoll < 0.45) {
        chosenColor.lerpColors(colorCyan, colorIceBlue, Math.random());
      } else if (colorRoll < 0.75) {
        chosenColor.lerpColors(colorIceBlue, colorDiamondWhite, Math.random());
      } else if (colorRoll < 0.92) {
        chosenColor.lerpColors(colorAmber, colorPeach, Math.random());
      } else {
        chosenColor.lerpColors(colorDeepBlue, colorDustRose, Math.random());
      }

      if (rRatio > 0.75) {
        chosenColor.multiplyScalar(0.7 + Math.random() * 0.3);
      }
    }

    particlePositions[i3] = x;
    particlePositions[i3 + 1] = y;
    particlePositions[i3 + 2] = z;

    colors[i3] = chosenColor.r;
    colors[i3 + 1] = chosenColor.g;
    colors[i3 + 2] = chosenColor.b;
  }

  galaxyGeometry = new THREE.BufferGeometry();
  galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  galaxyMaterial = new THREE.PointsMaterial({
    size: 5.5,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    opacity: isDarkTheme.value ? 0.95 : 0.65,
    blending: isDarkTheme.value ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: false
  });

  galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
  galaxyGroup.add(galaxyPoints);

  flarePositionsArr = new Float32Array(FLARE_STAR_COUNT * 3);
  const flareColors = new Float32Array(FLARE_STAR_COUNT * 3);

  flareRadii = new Float32Array(FLARE_STAR_COUNT);
  flareSpeeds = new Float32Array(FLARE_STAR_COUNT);
  flareArmOffsets = new Float32Array(FLARE_STAR_COUNT);
  flarePerpOffsets = new Float32Array(FLARE_STAR_COUNT);
  flareZ = new Float32Array(FLARE_STAR_COUNT);

  for (let k = 0; k < FLARE_STAR_COUNT; k++) {
    const k3 = k * 3;
    const armIdx = k % ARMS;
    const armOffset = (armIdx * (2 * Math.PI)) / ARMS;

    const r = CORE_RADIUS * 1.1 + (k / FLARE_STAR_COUNT) * (GALAXY_RADIUS - CORE_RADIUS * 1.1) * 0.95;
    const rRatio = r / GALAXY_RADIUS;
    const spiralTurns = 3.2;
    const theta = Math.pow(rRatio, 0.86) * (Math.PI * spiralTurns) + armOffset;

    const perp = (Math.random() - 0.5) * (rRatio * 45 + 18);
    const px = Math.cos(theta + Math.PI / 2) * perp;
    const py = Math.sin(theta + Math.PI / 2) * perp;
    const pz = (Math.random() - 0.5) * 20;

    flarePositionsArr[k3] = Math.cos(theta) * r + px;
    flarePositionsArr[k3 + 1] = Math.sin(theta) * r + py;
    flarePositionsArr[k3 + 2] = pz;

    flareRadii[k] = r;
    flareSpeeds[k] = 0.018 + Math.random() * 0.020;
    flareArmOffsets[k] = armOffset;
    flarePerpOffsets[k] = px;
    flareZ[k] = pz;

    const fColor = new THREE.Color();
    if (k % 3 === 0) {
      fColor.copy(colorDiamondWhite);
    } else if (k % 3 === 1) {
      fColor.lerpColors(colorIceBlue, colorDiamondWhite, 0.5);
    } else {
      fColor.lerpColors(colorPeach, colorAmber, 0.7);
    }

    flareColors[k3] = fColor.r;
    flareColors[k3 + 1] = fColor.g;
    flareColors[k3 + 2] = fColor.b;
  }

  flareGeometry = new THREE.BufferGeometry();
  flareGeometry.setAttribute('position', new THREE.BufferAttribute(flarePositionsArr, 3));
  flareGeometry.setAttribute('color', new THREE.BufferAttribute(flareColors, 3));

  flareMaterial = new THREE.PointsMaterial({
    size: 38.0,
    map: flareTexture,
    vertexColors: true,
    transparent: true,
    opacity: isDarkTheme.value ? 0.92 : 0.5,
    blending: isDarkTheme.value ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: false
  });

  flarePoints = new THREE.Points(flareGeometry, flareMaterial);
  galaxyGroup.add(flarePoints);

  const createBackgroundStarField = (
    count: number,
    spreadX: number,
    spreadY: number,
    minZ: number,
    maxZ: number,
    minBright: number,
    maxBright: number,
    starSize: number,
    darkOpacity: number,
    lightOpacity: number
  ) => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * spreadX;
      positions[idx + 1] = (Math.random() - 0.5) * spreadY;
      positions[idx + 2] = minZ + Math.random() * (maxZ - minZ);

      const roll = Math.random();
      if (roll < 0.6) {
        tempColor.setRGB(0.9, 0.95, 1.0);
      } else if (roll < 0.85) {
        tempColor.setRGB(1.0, 0.88, 0.72);
      } else {
        tempColor.setRGB(0.6, 0.85, 1.0);
      }

      const brightness = minBright + Math.random() * (maxBright - minBright);
      tempColor.multiplyScalar(brightness);

      colors[idx] = tempColor.r;
      colors[idx + 1] = tempColor.g;
      colors[idx + 2] = tempColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: starSize,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: isDarkTheme.value ? darkOpacity : lightOpacity,
      blending: isDarkTheme.value ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    return { geometry, material, points };
  };

  const farStars = createBackgroundStarField(850, 4000, 2800, -1700, -900, 0.18, 0.4, 1.8, 0.6, 0.25);
  bgFarGeometry = farStars.geometry;
  bgFarMaterial = farStars.material;
  bgFarPoints = farStars.points;

  const midStars = createBackgroundStarField(420, 3800, 2600, -900, -400, 0.45, 0.7, 3.6, 0.75, 0.35);
  bgMidGeometry = midStars.geometry;
  bgMidMaterial = midStars.material;
  bgMidPoints = midStars.points;

  const nearStars = createBackgroundStarField(140, 3600, 2400, -400, -50, 0.85, 1.0, 6.2, 0.95, 0.45);
  bgNearGeometry = nearStars.geometry;
  bgNearMaterial = nearStars.material;
  bgNearPoints = nearStars.points;

};


const handleMouseDown = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target && target.closest('input, textarea, button, a, select, .nav-container, .draggable-panel, .sidebar, .sub-menu, .extension-card, .mini-stats-widget')) {
    return;
  }
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
  if (mountRef.value) {
    mountRef.value.style.cursor = 'grabbing';
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging) return;

  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;

  targetRotationY += deltaX * 0.0035;
  targetRotationX += deltaY * 0.0035;
  targetRotationX = Math.max(-1.3, Math.min(0.6, targetRotationX));

  previousMousePosition = { x: e.clientX, y: e.clientY };
};

const handleMouseUp = () => {
  if (!isDragging) return;
  isDragging = false;
  if (mountRef.value) {
    mountRef.value.style.cursor = 'grab';
  }
};

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 1) {
    const target = e.target as HTMLElement;
    if (target && target.closest('input, textarea, button, a, select, .nav-container, .draggable-panel, .sidebar, .sub-menu, .extension-card, .mini-stats-widget')) {
      return;
    }
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging || e.touches.length !== 1) return;
  const deltaX = e.touches[0].clientX - previousMousePosition.x;
  const deltaY = e.touches[0].clientY - previousMousePosition.y;

  targetRotationY += deltaX * 0.0035;
  targetRotationX += deltaY * 0.0035;
  targetRotationX = Math.max(-1.3, Math.min(0.6, targetRotationX));

  previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
};

const handleTouchEnd = () => {
  isDragging = false;
};

const handleResize = () => {
  if (!renderer || !camera || !mountRef.value) return;
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  updateGalaxyCenterPosition();
};

const handleVisibilityChange = () => {
  isTabVisible = !document.hidden;
};

const applyThemeSettings = () => {
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  isDarkTheme.value = isDark;

  if (galaxyMaterial) {
    galaxyMaterial.opacity = isDark ? 0.95 : 0.65;
    galaxyMaterial.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    galaxyMaterial.needsUpdate = true;
  }
  if (flareMaterial) {
    flareMaterial.opacity = isDark ? 0.92 : 0.5;
    flareMaterial.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    flareMaterial.needsUpdate = true;
  }
  if (bgFarMaterial) {
    bgFarMaterial.opacity = isDark ? 0.6 : 0.25;
    bgFarMaterial.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    bgFarMaterial.needsUpdate = true;
  }
  if (bgMidMaterial) {
    bgMidMaterial.opacity = isDark ? 0.75 : 0.35;
    bgMidMaterial.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    bgMidMaterial.needsUpdate = true;
  }
  if (bgNearMaterial) {
    bgNearMaterial.opacity = isDark ? 0.95 : 0.45;
    bgNearMaterial.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    bgNearMaterial.needsUpdate = true;
  }
  if (coreGlowSprite && coreGlowSprite.material) {
    coreGlowSprite.material.opacity = isDark ? 0.95 : 0.6;
    coreGlowSprite.material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    coreGlowSprite.material.needsUpdate = true;
  }
};

let themeObserver: MutationObserver | null = null;

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);

  if (!isTabVisible || !renderer || !scene || !camera) return;

  if (particlePositions && starRadii && starSpeeds) {
    for (let i = 5500; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      let r = starRadii[i] - starSpeeds[i];
      if (r < CORE_RADIUS * 0.45) {
        if (i < 27000) {
          r = GALAXY_RADIUS * (0.93 + Math.random() * 0.07);
        } else {
          r = GALAXY_RADIUS * (0.60 + Math.random() * 0.40);
        }
      }
      starRadii[i] = r;

      const rRatio = r / GALAXY_RADIUS;
      const currentAngleNoise = starAngleNoise![i] * (rRatio * 0.6 + 0.4);
      const spiralTheta = Math.pow(rRatio, 0.86) * (Math.PI * 3.2) + starArmOffsets![i] + currentAngleNoise;
      const perpAngle = spiralTheta + Math.PI / 2;

      const spreadFactor = rRatio * 0.65 + 0.35;
      const along = starAlongOffsets![i] * spreadFactor;
      const perp = starPerpOffsets![i] * spreadFactor;

      const funnelDepth = Math.pow(Math.max(0, 1 - r / (GALAXY_RADIUS * 0.32)), 2.2) * 65;
      particlePositions[i3] = Math.cos(spiralTheta) * (r + along) + Math.cos(perpAngle) * perp;
      particlePositions[i3 + 1] = Math.sin(spiralTheta) * (r + along) + Math.sin(perpAngle) * perp;
      particlePositions[i3 + 2] = starZ![i] * (rRatio * 0.5 + 0.5) - funnelDepth;
    }

    for (let i = 0; i < 5500; i++) {
      const i3 = i * 3;
      let r = starRadii[i] - starSpeeds[i];
      let angle = starCoreAngles![i] + starCoreAngularSpeeds![i];
      if (r < 6) {
        r = CORE_RADIUS * (0.8 + Math.random() * 0.2);
      }
      starRadii[i] = r;
      starCoreAngles[i] = angle;

      const coreSink = Math.pow(Math.max(0, 1 - r / CORE_RADIUS), 1.8) * 55;
      particlePositions[i3] = Math.cos(angle) * r + starCoreOffsetX![i];
      particlePositions[i3 + 1] = Math.sin(angle) * r + starCoreOffsetY![i];
      particlePositions[i3 + 2] = starCoreOffsetZ![i] - coreSink;
    }

    if (galaxyGeometry) {
      galaxyGeometry.attributes.position.needsUpdate = true;
    }
  }

  if (flarePositionsArr && flareRadii && flareSpeeds) {
    for (let k = 0; k < FLARE_STAR_COUNT; k++) {
      const k3 = k * 3;
      let r = flareRadii[k] - flareSpeeds[k];
      if (r < CORE_RADIUS * 0.9) {
        r = GALAXY_RADIUS * 0.95;
      }
      flareRadii[k] = r;

      const rRatio = r / GALAXY_RADIUS;
      const theta = Math.pow(rRatio, 0.86) * (Math.PI * 3.2) + flareArmOffsets![k];
      const perp = flarePerpOffsets![k] * (rRatio * 0.65 + 0.35);
      const px = Math.cos(theta + Math.PI / 2) * perp;
      const py = Math.sin(theta + Math.PI / 2) * perp;

      const flareFunnel = Math.pow(Math.max(0, 1 - r / (GALAXY_RADIUS * 0.32)), 2.2) * 65;
      flarePositionsArr[k3] = Math.cos(theta) * r + px;
      flarePositionsArr[k3 + 1] = Math.sin(theta) * r + py;
      flarePositionsArr[k3 + 2] = flareZ![k] - flareFunnel;
    }

    if (flareGeometry) {
      flareGeometry.attributes.position.needsUpdate = true;
    }
  }

  if (galaxyGroup) {
    currentRotationX += (targetRotationX - currentRotationX) * 0.06;
    currentRotationY += (targetRotationY - currentRotationY) * 0.06;

    galaxyGroup.rotation.x = currentRotationX;
    galaxyGroup.rotation.y = currentRotationY;
    galaxyGroup.rotation.z += 0.00010;
  }



  renderer.render(scene, camera);
};

onMounted(() => {
  if (!process.client || !mountRef.value) return;

  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  isDarkTheme.value = isDark;

  const width = window.innerWidth;
  const height = window.innerHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(54, width / height, 1, 3500);
  camera.position.set(0, 0, 920);

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  mountRef.value.appendChild(renderer.domElement);

  initGalaxy();

  window.addEventListener('resize', handleResize);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('touchend', handleTouchEnd);

  themeObserver = new MutationObserver(() => {
    applyThemeSettings();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-bs-theme']
  });

  animate();
});

onUnmounted(() => {
  if (process.client) {
    cancelAnimationFrame(animationFrameId);

    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    window.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);

    if (themeObserver) {
      themeObserver.disconnect();
      themeObserver = null;
    }

    if (galaxyGeometry) galaxyGeometry.dispose();
    if (flareGeometry) flareGeometry.dispose();
    if (bgFarGeometry) bgFarGeometry.dispose();
    if (bgMidGeometry) bgMidGeometry.dispose();
    if (bgNearGeometry) bgNearGeometry.dispose();

    if (galaxyMaterial) galaxyMaterial.dispose();
    if (flareMaterial) flareMaterial.dispose();
    if (bgFarMaterial) bgFarMaterial.dispose();
    if (bgMidMaterial) bgMidMaterial.dispose();
    if (bgNearMaterial) bgNearMaterial.dispose();

    if (coreGlowSprite && coreGlowSprite.material) {
      coreGlowSprite.material.dispose();
    }
    if (coreGlowTexture) coreGlowTexture.dispose();

    if (starTexture) starTexture.dispose();
    if (flareTexture) flareTexture.dispose();

    if (renderer) {
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      renderer.forceContextLoss();
      renderer = null;
    }

    scene = null;
    camera = null;
    galaxyGroup = null;
    coreGlowSprite = null;
    coreGlowTexture = null;

    particlePositions = null;
    starRadii = null;
    starSpeeds = null;
    starArmOffsets = null;
    starPerpOffsets = null;
    starAlongOffsets = null;
    starAngleNoise = null;
    starCoreAngles = null;
    starCoreAngularSpeeds = null;
    starCoreOffsetX = null;
    starCoreOffsetY = null;
    starCoreOffsetZ = null;
    starZ = null;

    flarePositionsArr = null;
    flareRadii = null;
    flareSpeeds = null;
    flareArmOffsets = null;
    flarePerpOffsets = null;
    flareZ = null;
  }
});
</script>

<style scoped>
.black-hole-bg-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: auto;
  cursor: grab;
  overflow: hidden;
  transition: background 0.5s ease;
}

.black-hole-bg-container:active {
  cursor: grabbing;
}

.black-hole-bg-container.is-dark {
  background: radial-gradient(circle at 50% 50%, rgba(8, 20, 42, 0.45) 0%, rgba(2, 6, 15, 0.85) 55%, #010308 100%);
}

.black-hole-bg-container:not(.is-dark) {
  background: #ffffff;
}

.webgl-canvas-mount {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
