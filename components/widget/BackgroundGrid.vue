<template>
  <canvas ref="rippleCanvas" class="global-ripple-canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  bhPhase: string;
  bhProgress: number;
  animationTick: number;
  isDarkMode: boolean;
  leftRect: { left: number, top: number, width: number, height: number };
  contentRect: { left: number, top: number, width: number, height: number };
  sidebarRect: { left: number, top: number, width: number, height: number };
  themeRect: { left: number, top: number, width: number, height: number };
}>();

const rippleCanvas = ref<HTMLCanvasElement | null>(null);
let animationFrameId = 0;
let isTabActive = true;
let isElementVisible = true;

const mouse = {
  x: -1000,
  y: -1000,
  targetX: -1000,
  targetY: -1000,
  radius: 240,
};

interface GridPoint {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
}

let points: GridPoint[] = [];
let cols = 0;
let rows = 0;
const spacing = 50;

const initGrid = (width: number, height: number) => {
  points = [];
  cols = Math.ceil(width / spacing) + 1;
  rows = Math.ceil(height / spacing) + 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * spacing;
      const y = r * spacing;
      points.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: 0,
        vy: 0,
      });
    }
  }
};

interface FragmentParticle {
  x: number;
  y: number;
  startX: number;
  startY: number;
  lastX?: number;
  lastY?: number;
  color: string;
  size: number;
  angle: number;
  radius: number;
  angularSpeed: number;
  speed: number;
  opacity: number;
  active: boolean;
  threshold: number;
  activated: boolean;
  group: 'left' | 'content' | 'sidebar' | 'theme';
}

const uiFragments: FragmentParticle[] = [];
let collapseTriggered = false;


const spawnDustParticles = (group: 'left' | 'content' | 'sidebar' | 'theme', rect: { left: number, top: number, width: number, height: number }) => {
  if (rect.width <= 0 || rect.height <= 0) return;
  
  let count = 250;
  let baseColors: string[] = [];
  
  if (group === 'left') {
    count = 800;
    baseColors = [
      'rgba(52, 211, 153, 1)',  // emerald (알파 1로 고정하여 replace 연산 회피)
      'rgba(255, 255, 255, 1)', // white dust
      'rgba(30, 41, 59, 1)'     // slate
    ];
  } else if (group === 'content') {
    count = 1600;
    baseColors = [
      'rgba(96, 165, 250, 1)',  // blue
      'rgba(248, 250, 252, 1)', // white text
      'rgba(15, 23, 42, 1)'     // slate-900
    ];
  } else if (group === 'sidebar') {
    count = 600;
    baseColors = [
      'rgba(251, 191, 36, 1)',  // gold
      'rgba(255, 255, 255, 1)', // white
      'rgba(30, 41, 59, 1)'     // slate
    ];
  } else if (group === 'theme') {
    count = 150;
    baseColors = [
      'rgba(251, 191, 36, 1)',  // amber
      'rgba(253, 224, 71, 1)',  // yellow
      'rgba(255, 255, 255, 1)'
    ];
  }
  
  for (let i = 0; i < count; i++) {
    const rx = rect.left + Math.random() * rect.width;
    const ry = rect.top + Math.random() * rect.height;
    
    const threshold = ((rect.left + rect.width - rx) / rect.width + (ry - rect.top) / rect.height) / 2;
    const color = baseColors[Math.floor(Math.random() * baseColors.length)];
    
    const rand = Math.random();
    let size = 1.0;
    if (rand < 0.60) {
      size = Math.random() * 1.2 + 0.6;
    } else if (rand < 0.90) {
      size = Math.random() * 1.7 + 1.8;
    } else {
      size = Math.random() * 4.0 + 3.5;
    }
    
    uiFragments.push({
      x: rx,
      y: ry,
      startX: rx,
      startY: ry,
      lastX: rx,
      lastY: ry,
      color: color,
      size: size,
      angle: 0,
      radius: 0,
      angularSpeed: (Math.random() * 0.022 + 0.012) * (Math.random() < 0.5 ? 1 : -1),
      speed: Math.random() * 2.0 + 0.8,
      opacity: 1.0,
      active: true,
      threshold: threshold,
      activated: false,
      group: group
    });
  }
};

const handleGlobalMouseMove = (e: MouseEvent) => {
  if (!rippleCanvas.value) return;
  const rect = rippleCanvas.value.getBoundingClientRect();
  mouse.targetX = e.clientX - rect.left;
  mouse.targetY = e.clientY - rect.top;
};

const handleGlobalMouseLeave = () => {
  mouse.targetX = -1000;
  mouse.targetY = -1000;
};

const spring = 0.025;
const damping = 0.92;
const waveSpeed = 0.001;
const waveAmp = 5;

const animateBackground = (time: number) => {
  if (!rippleCanvas.value || !isTabActive || !isElementVisible) return;
  const canvas = rippleCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  mouse.x += (mouse.targetX - mouse.x) * 0.1;
  mouse.y += (mouse.targetY - mouse.y) * 0.1;

  const bhCenterX = 250;
  const bhCenterY = canvas.height - 250;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];

    const waveX = Math.sin(time * waveSpeed + p.originY * 0.01) * 1.5;
    const waveY = Math.cos(time * waveSpeed + p.originX * 0.01) * waveAmp;

    const targetX = p.originX + waveX;
    const targetY = p.originY + waveY;

    const bhDx = bhCenterX - p.x;
    const bhDy = bhCenterY - p.y;
    const bhDist = Math.sqrt(bhDx * bhDx + bhDy * bhDy);
    
    let gravityX = 0;
    let gravityY = 0;
    if (bhDist > 20) {
      let pullPower = 4500;
      const phase = props.bhPhase;
      const prog = props.bhProgress;

      if (phase === 'grow') {
        pullPower = 4500 + prog * 65000;
      } else if (phase === 'collapse') {
        pullPower = 69500 + prog * 180000;
      } else if (phase === 'bigbang') {
        pullPower = -25000 * (1.0 - prog);
      } else if (phase === 'recover') {
        pullPower = 4500 * prog;
      }

      const limit = phase === 'collapse' ? 90 : 25;
      const pull = Math.min(limit, pullPower / (bhDist * bhDist));
      const bhAngle = Math.atan2(bhDy, bhDx);
      gravityX = Math.cos(bhAngle) * pull;
      gravityY = Math.sin(bhAngle) * pull;
    }

    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < mouse.radius) {
      const force = (mouse.radius - dist) / mouse.radius;
      const angle = Math.atan2(dy, dx);
      const pushX = Math.cos(angle) * force * 16;
      const pushY = Math.sin(angle) * force * 16;
      
      p.vx += pushX;
      p.vy += pushY;
    }

    const ax = (targetX - p.x) * spring;
    const ay = (targetY - p.y) * spring;

    p.vx += ax + gravityX;
    p.vy += ay + gravityY;
    p.vx *= damping;
    p.vy *= damping;

    p.x += p.vx;
    p.y += p.vy;
  }

  // Draw delicate grid lines (dark/light adapted)
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = props.isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)';
  ctx.lineWidth = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const p = points[idx];

      if (c < cols - 1) {
        const pRight = points[idx + 1];
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(pRight.x, pRight.y);
      }
      if (r < rows - 1) {
        const pBottom = points[idx + cols];
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(pBottom.x, pBottom.y);
      }
    }
  }
  ctx.stroke();
  ctx.restore();

  // Draw subtle glowing dots on intersections close to the mouse
  const dotColor = props.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const glowRGB = props.isDarkMode ? '52, 211, 153' : '5, 150, 105';

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < mouse.radius) {
      const ratio = 1 - dist / mouse.radius;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2 + ratio * 2, 0, Math.PI * 2);
      ctx.save();
      ctx.fillStyle = `rgba(${glowRGB}, ${0.05 + ratio * 0.35})`;
      ctx.fill();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
      ctx.save();
      ctx.fillStyle = dotColor;
      ctx.fill();
      ctx.restore();
    }
  }

  // --- 컴포넌트 점진적 분쇄용 파편(Fragment Particles) 연출 시뮬레이션 ---
  const phase = props.bhPhase;
  const prog = props.bhProgress;

  if (phase === 'collapse') {
    if (!collapseTriggered) {
      uiFragments.length = 0;
      spawnDustParticles('left', props.leftRect);
      spawnDustParticles('content', props.contentRect);
      spawnDustParticles('sidebar', props.sidebarRect);
      spawnDustParticles('theme', props.themeRect);

      collapseTriggered = true;
    }
  } else {
    collapseTriggered = false;
    if (phase !== 'bigbang' && phase !== 'recover') {
      uiFragments.length = 0;
    }
  }

  if (uiFragments.length > 0) {
    for (let i = 0; i < uiFragments.length; i++) {
      const p = uiFragments[i];
      if (!p.active && phase !== 'recover') continue;

      p.lastX = p.x;
      p.lastY = p.y;

      if (phase === 'collapse') {
        if (!p.activated) {
          const dx = p.startX - bhCenterX;
          const dy = p.startY - bhCenterY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const targetRadius = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) + 200;
          const currentRadius = 170 + (targetRadius - 170) * prog;

          if (currentRadius + 70 >= dist) {
            p.activated = true;
            p.radius = dist;
            p.angle = Math.atan2(dy, dx);
          }
        }

        if (p.activated) {
          const speedMult = 1.5 + prog * 6.0;
          const gravityPull = Math.min(8.0, 200 / Math.max(p.radius, 12));
          
          p.radius -= p.speed * speedMult * gravityPull * 1.2;
          p.angle += p.angularSpeed * speedMult * gravityPull * 2.5;

          p.x = bhCenterX + Math.cos(p.angle) * p.radius;
          p.y = bhCenterY + Math.sin(p.angle) * p.radius;

          if (p.radius < 60) {
            p.opacity = Math.max(0, p.radius / 60);
          }

          if (p.radius < 12 || p.opacity <= 0) {
            p.active = false;
          }
        }
      } else if (phase === 'bigbang') {
        if (p.activated) {
          const speedMult = 8.0 * (1.0 - prog);
          p.radius += p.speed * speedMult;
          p.angle += p.angularSpeed * 0.5;

          p.x = bhCenterX + Math.cos(p.angle) * p.radius;
          p.y = bhCenterY + Math.sin(p.angle) * p.radius;
          p.opacity = Math.max(0, 1.0 - prog);

          if (p.opacity <= 0) {
            p.active = false;
          }
        }
      } else if (phase === 'recover') {
        p.active = true;
        const assembleProg = Math.min(1.0, prog * 1.3);
        const invProg = 1.0 - assembleProg;
        
        const angleOffset = invProg * Math.PI * 3.0 * (p.angularSpeed > 0 ? 1 : -1);
        const spiralX = bhCenterX + Math.cos(p.angle + angleOffset) * p.radius;
        const spiralY = bhCenterY + Math.sin(p.angle + angleOffset) * p.radius;
        
        p.x = p.startX * assembleProg + spiralX * invProg;
        p.y = p.startY * assembleProg + spiralY * invProg;
        p.opacity = Math.min(1.0, assembleProg * 2.0);
      }

      if (p.activated && p.active && p.opacity > 0) {
        if (p.lastX !== undefined && p.lastY !== undefined) {
          const dx = p.x - p.lastX;
          const dy = p.y - p.lastY;
          const travel = Math.sqrt(dx * dx + dy * dy);

          if (travel > 1.2) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - dx * 1.5, p.y - dy * 1.5);
            ctx.globalAlpha = p.opacity * 0.75;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - dx * 1.5, p.y - dy * 1.5);
            ctx.globalAlpha = p.opacity * 0.22;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size * 2.5;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();
          }
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = phase === 'bigbang' || phase === 'recover'
          ? `rgba(255, 255, 255, 1)`
          : p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // watch를 강제로 갱신시키지 않고 자체 루프로 돔
  // requestAnimationFrame를 한 번만 시작하면 루프가 자율 구동됨
  animationFrameId = requestAnimationFrame(animateBackground);
};

const handleResize = () => {
  if (!rippleCanvas.value) return;
  const canvas = rippleCanvas.value;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initGrid(canvas.width, canvas.height);
};

// Page Visibility API 최적화
const handleVisibilityChange = () => {
  if (document.hidden) {
    isTabActive = false;
    cancelAnimationFrame(animationFrameId);
  } else {
    isTabActive = true;
    if (isElementVisible) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(animateBackground);
    }
  }
};

let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (rippleCanvas.value && process.client) {
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseleave', handleGlobalMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Intersection Observer 최적화
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isElementVisible = entry.isIntersecting;
        if (isElementVisible && isTabActive) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(animateBackground);
        } else {
          cancelAnimationFrame(animationFrameId);
        }
      });
    }, { threshold: 0 });

    observer.observe(rippleCanvas.value);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleGlobalMouseMove);
    window.removeEventListener('mouseleave', handleGlobalMouseLeave);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (observer && rippleCanvas.value) {
      observer.unobserve(rippleCanvas.value);
    }
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.global-ripple-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
}
</style>
