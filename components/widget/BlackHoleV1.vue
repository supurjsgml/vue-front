<template>
  <div class="black-hole-bg-container">
    <canvas ref="canvasRef" class="black-hole-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useBlackHole } from '~/composables/commonUtils';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const { isActionEnabled, bigBangClickTime, timeOffset } = useBlackHole();

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  opacity: number;
  speed: number;
}
const ripples = ref<Ripple[]>([]);

watch(bigBangClickTime, (newVal) => {
  if (newVal > 0 && process.client) {
    const canvas = canvasRef.value;
    if (!canvas) return;
    
    const cx = 250;
    const cy = canvas.height - 250;
    
    const isNowEnabled = isActionEnabled.value;
    const color = isNowEnabled 
      ? 'rgba(0, 230, 255, '
      : 'rgba(255, 60, 60, ';
      
    ripples.value = [];
    for (let i = 0; i < 3; i++) {
      ripples.value.push({
        x: cx,
        y: cy,
        radius: 10 + i * 15,
        maxRadius: 180 + i * 40,
        color: color,
        opacity: 0.8 - i * 0.15,
        speed: 3.5 - i * 0.5
      });
    }
  }
});
let animationId = 0;
let img: HTMLImageElement | null = null;
const isImageLoaded = ref(false);
let isTabActive = true;

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  angularSpeed: number;
  size: number;
  color: string;
}

const particles: Particle[] = [];
const numParticles = 250;

const createParticle = (maxRadius: number, isInitial = false, isExplosion = false, isDark = true): Particle => {
  const radius = isExplosion
    ? Math.random() * 20 + 5
    : (isInitial 
        ? Math.random() * (maxRadius - 30) + 30 
        : maxRadius - Math.random() * 10);
    
  const colors = [
    'rgb(255, 255, 255)',
    'rgb(52, 211, 153)',
    'rgb(96, 165, 250)',
    'rgb(251, 191, 36)',
    'rgb(244, 63, 94)',
    'rgb(168, 85, 247)'
  ];
  let activeColors: string[] = [];
  if (isExplosion) {
    activeColors = colors;
  } else if (!isDark) {
    activeColors = [colors[1], colors[2], colors[3], colors[4], colors[5]];
  } else {
    activeColors = [colors[0], colors[3]];
  }
  const colorBase = activeColors[Math.floor(Math.random() * activeColors.length)];

  return {
    angle: Math.random() * Math.PI * 2,
    radius: radius,
    speed: isExplosion 
      ? Math.random() * 6.0 + 3.0
      : Math.random() * 0.4 + 0.3,
    angularSpeed: isExplosion
      ? (Math.random() * 0.05 - 0.025)
      : Math.random() * 0.02 + 0.015,
    size: isExplosion
      ? Math.random() * 3.0 + 1.0
      : Math.random() * 1.5 + 0.5,
    color: colorBase
  };
};

let time = 0;
let explosionInitialized = false;
let lastIsDark = true;

const animate = () => {
  const canvas = canvasRef.value;
  if (!canvas || !isTabActive) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const cx = 250;
  const cy = h - 250;

  ctx.clearRect(0, 0, w, h);

  const isDark = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-bs-theme') !== 'light' : true;
  
  if (isDark !== lastIsDark) {
    const colors = [
      'rgb(255, 255, 255)',
      'rgb(52, 211, 153)',
      'rgb(96, 165, 250)',
      'rgb(251, 191, 36)',
      'rgb(244, 63, 94)',
      'rgb(168, 85, 247)'
    ];
    const activeColors = isDark ? [colors[0], colors[3]] : [colors[1], colors[2], colors[3], colors[4], colors[5]];
    for (let i = 0; i < particles.length; i++) {
      particles[i].color = activeColors[Math.floor(Math.random() * activeColors.length)];
    }
    lastIsDark = isDark;
  }

  let phase = 'idle';
  let progress = 0;

  if (!isActionEnabled.value) {
    phase = 'serene';
    progress = 0.5;
  } else {
    const loopTime = 60000;
    const t = (Date.now() + timeOffset.value) % loopTime;

    if (t < 35000) {
      phase = 'grow';
      progress = t / 35000;
    } else if (t < 40000) {
      phase = 'collapse';
      progress = (t - 35000) / 5000;
    } else if (t < 42000) {
      phase = 'bigbang';
      progress = (t - 40000) / 2000;
    } else if (t < 50000) {
      phase = 'recover';
      progress = (t - 42000) / 8000;
    } else {
      phase = 'idle';
      progress = (t - 50000) / 10000;
    }
  }

  let maxSwirlRadius = 70;
  let singularityRadius = 18;
  if (isActionEnabled.value) {
    singularityRadius += Math.sin(Date.now() / 250) * 3;
  }
  let rotationSpeed = 0.4;
  let opacity = 1.0;
  let scaleRatio = 1.0;

  if (phase === 'grow') {
    maxSwirlRadius = 70 + progress * 100;
    singularityRadius = 18 + progress * 20;
    rotationSpeed = 0.4 + progress * 1.5;
    explosionInitialized = false;
  } else if (phase === 'serene') {
    maxSwirlRadius = 85;
    singularityRadius = 14;
    rotationSpeed = 0.12;
    explosionInitialized = false;
  } else if (phase === 'collapse') {
    maxSwirlRadius = 170;
    singularityRadius = 38;
    rotationSpeed = 1.9 + progress * 6.0;
    scaleRatio = 1.0;
    explosionInitialized = false;
  } else if (phase === 'bigbang') {
    opacity = 0;
    scaleRatio = 0;
  } else if (phase === 'recover') {
    maxSwirlRadius = 70;
    singularityRadius = 18;
    rotationSpeed = 0.4;
    opacity = progress;
    scaleRatio = progress;
  } else {
    maxSwirlRadius = 70;
    singularityRadius = 18;
    rotationSpeed = 0.4;
  }

  time += rotationSpeed * 0.05;

  if (opacity > 0 && isImageLoaded.value && img) {
    ctx.save();
    ctx.globalAlpha = opacity;

    if (phase === 'collapse') {
      const distortX = 1.0 + progress * 0.45;
      const distortY = 1.0 - progress * 0.15;
      ctx.translate(cx, cy);
      ctx.scale(distortX, distortY);
      ctx.translate(-cx, -cy);
    }

    const numRings = 40;
    const ringWidth = maxSwirlRadius / numRings;

    for (let i = 0; i < numRings; i++) {
      const rInner = i * ringWidth;
      const rOuter = (i + 1) * ringWidth;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rOuter + 0.5, 0, Math.PI * 2, false);
      ctx.arc(cx, cy, Math.max(0, rInner - 0.5), 0, Math.PI * 2, true);
      ctx.clip();

      const normalizedRadius = rOuter / maxSwirlRadius;
      const rotation = time + Math.pow(1.0 - normalizedRadius, 2.2) * 5.0;
      const flowWave = (time * 0.5) % 1.0;
      const pullAmount = 0.15;
      const scale = scaleRatio * (1.0 - (1.0 - normalizedRadius) * pullAmount * flowWave);

      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      const imgSize = maxSwirlRadius * 2.0;
      ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);

      ctx.restore();
    }
    ctx.restore();
  }

  if (phase !== 'bigbang') {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, singularityRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  if (phase !== 'bigbang') {
    const auraRadius = maxSwirlRadius + 10;
    const startRadius = Math.max(0.1, singularityRadius - 2);
    const glow = ctx.createRadialGradient(cx, cy, startRadius, cx, cy, Math.max(startRadius + 1, auraRadius));
    glow.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
    glow.addColorStop(0.5, 'rgba(96, 165, 250, 0.12)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.save();
    if (phase === 'collapse') {
      const distortX = 1.0 + progress * 0.45;
      const distortY = 1.0 - progress * 0.15;
      ctx.translate(cx, cy);
      ctx.scale(distortX, distortY);
      ctx.translate(-cx, -cy);
    }
    ctx.beginPath();
    ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (phase === 'bigbang') {
    const maxRadius = Math.sqrt(w * w + h * h);
    if (!explosionInitialized) {
      particles.length = 0;
      for (let i = 0; i < numParticles; i++) {
        particles.push(createParticle(maxRadius, false, true, isDark));
      }
      explosionInitialized = true;
    }

    const invProg = 1.0 - progress;
    const baseRadius = progress * maxRadius * 1.1;
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.5);
    const scaleX = 1.0 + Math.sin(time * 2) * 0.15;
    const scaleY = 1.0 - Math.sin(time * 2) * 0.15;
    ctx.scale(scaleX, scaleY);
    
    const nebulaGlow1 = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, baseRadius));
    nebulaGlow1.addColorStop(0, 'rgba(168, 85, 247, 0.7)');
    nebulaGlow1.addColorStop(0.4, 'rgba(139, 92, 246, 0.35)');
    nebulaGlow1.addColorStop(0.8, 'rgba(96, 165, 250, 0.1)');
    nebulaGlow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebulaGlow1;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-time * 0.8);
    const scaleX2 = 1.0 - Math.cos(time * 1.5) * 0.1;
    const scaleY2 = 1.0 + Math.cos(time * 1.5) * 0.1;
    ctx.scale(scaleX2, scaleY2);

    const nebulaGlow2 = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, baseRadius * 0.75));
    nebulaGlow2.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    nebulaGlow2.addColorStop(0.2, 'rgba(52, 211, 153, 0.6)');
    nebulaGlow2.addColorStop(0.6, 'rgba(251, 191, 36, 0.25)');
    nebulaGlow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebulaGlow2;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const ringRadius1 = progress * maxRadius * 0.95;
    ctx.strokeStyle = `rgba(255, 255, 255, ${invProg * 0.95})`;
    ctx.lineWidth = 6 * invProg;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius1, 0, Math.PI * 2);
    ctx.stroke();

    const ringRadius2 = progress * maxRadius * 0.6;
    ctx.strokeStyle = `rgba(168, 85, 247, ${invProg * 0.7})`;
    ctx.lineWidth = 14 * invProg;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius2, 0, Math.PI * 2);
    ctx.stroke();
  }

  const maxRadius = Math.sqrt(w * w + h * h);
  if (phase !== 'bigbang' && particles.length > 0 && particles[0].speed > 2.0) {
    particles.length = 0;
    for (let i = 0; i < numParticles; i++) {
      particles.push(createParticle(maxRadius, true, false, isDark));
    }
  }
  
  let speedMult = 1.0;
  if (phase === 'grow') {
    speedMult = 1.0 + Math.pow(progress, 2) * 4.0; 
  } else if (phase === 'serene') {
    speedMult = 0.22;
  } else if (phase === 'collapse') {
    speedMult = 5.0 + Math.pow(progress, 2) * 15.0; 
  } else if (phase === 'recover') {
    speedMult = 0.7; 
  } else {
    speedMult = 1.0;
  }

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    if (phase === 'bigbang') {
      p.radius += p.speed;
      p.angle += p.angularSpeed;
    } else {
      const gravityPull = Math.min(8.0, 100 / Math.max(p.radius, 12));
      p.radius -= p.speed * speedMult * gravityPull;
      p.angle += p.angularSpeed * speedMult * gravityPull * 1.3;
    }
    
    const x = cx + Math.cos(p.angle) * p.radius;
    const y = cy + Math.sin(p.angle) * p.radius;
    
    let alpha = 1;
    if (phase === 'bigbang') {
      alpha = Math.max(0, 1.0 - (p.radius / maxRadius));
    } else {
      if (p.radius < singularityRadius + 14) {
        alpha = (p.radius - singularityRadius) / 14;
      } else if (p.radius > maxRadius - 10) {
        alpha = (maxRadius - p.radius) / 10;
      }
    }
    alpha = Math.max(0, Math.min(1, alpha));
    
    if (alpha > 0) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if (phase === 'bigbang') {
      if (p.radius > maxRadius) {
        particles[i] = createParticle(maxRadius, false, true);
      }
    } else {
      if (p.radius < singularityRadius) {
        particles[i] = createParticle(maxRadius, false, false, isDark);
      }
    }
  }

  ctx.globalAlpha = 1.0;
  ripples.value = ripples.value.filter(ripple => {
    ripple.radius += ripple.speed;
    ripple.opacity -= 0.015;
    
    if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
      return false;
    }
    
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `${ripple.color}${ripple.opacity})`;
    ctx.lineWidth = 3 * (1 - (ripple.radius / ripple.maxRadius)) + 0.5;
    ctx.stroke();
    
    ctx.shadowBlur = 8;
    ctx.shadowColor = ripple.color.includes('255, 60') ? 'rgba(255, 60, 60, 0.8)' : 'rgba(0, 230, 255, 0.8)';
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    return true;
  });

  ctx.globalAlpha = 1.0;
  animationId = requestAnimationFrame(animate);
};

const handleResize = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

const handleVisibilityChange = () => {
  if (document.hidden) {
    isTabActive = false;
    cancelAnimationFrame(animationId);
  } else {
    isTabActive = true;
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(animate);
  }
};

onMounted(() => {
  if (process.client) {
    img = new Image();
    img.onload = () => {
      isImageLoaded.value = true;
    };
    img.src = '/blackhole.png';
    if (img.complete) {
      isImageLoaded.value = true;
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  const canvas = canvasRef.value;
  if (canvas) {
    handleResize();
    window.addEventListener('resize', handleResize);
    const maxRadius = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
    const isDark = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-bs-theme') !== 'light' : true;
    lastIsDark = isDark;
    for (let i = 0; i < numParticles; i++) {
      particles.push(createParticle(maxRadius, true, false, isDark));
    }
    animate();
  }
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  if (process.client) {
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
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
  pointer-events: none;
  z-index: 0;
}

.black-hole-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
