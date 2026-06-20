<template>
  <div class="black-hole-bg-container">
    <canvas ref="canvasRef" class="black-hole-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId = 0;
let img: HTMLImageElement | null = null;
const isImageLoaded = ref(false);

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

const createParticle = (maxRadius: number, isInitial = false, isExplosion = false): Particle => {
  // 빅뱅 폭발 시에는 중심부 근처에서 시작해 바깥으로 퍼져나감
  const radius = isExplosion
    ? Math.random() * 20 + 5
    : (isInitial 
        ? Math.random() * (maxRadius - 30) + 30 
        : maxRadius - Math.random() * 10);
    
  const colors = [
    'rgba(255, 255, 255, opacity)',      // white
    'rgba(52, 211, 153, opacity)',      // emerald (빅뱅 파편용)
    'rgba(96, 165, 250, opacity)',      // blue (빅뱅 파편용)
    'rgba(251, 191, 36, opacity)'       // gold
  ];
  // 평소에는 흰색 위주, 폭발 시에는 다채로운 파편 컬러 사용
  const activeColors = isExplosion ? colors : [colors[0], colors[3]];
  const colorBase = activeColors[Math.floor(Math.random() * activeColors.length)];

  return {
    angle: Math.random() * Math.PI * 2,
    radius: radius,
    speed: isExplosion 
      ? Math.random() * 6.0 + 3.0 // 초고속 발산
      : Math.random() * 0.4 + 0.3, // 잔잔한 흡입
    angularSpeed: isExplosion
      ? (Math.random() * 0.05 - 0.025)
      : Math.random() * 0.02 + 0.015,
    size: isExplosion
      ? Math.random() * 3.0 + 1.0  // 굵고 뚜렷한 파편들
      : Math.random() * 1.5 + 0.5,
    color: colorBase
  };
};

let time = 0;
let explosionInitialized = false;

const animate = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const cx = 250;
  const cy = h - 250;

  ctx.clearRect(0, 0, w, h);

  // 절대 시간 주기 해석 (60초 루프)
  const loopTime = 60000;
  const t = Date.now() % loopTime;

  let phase = 'idle';
  let progress = 0;

  if (t < 35000) {
    phase = 'grow';
    progress = t / 35000; // 0 -> 1
  } else if (t < 40000) {
    phase = 'collapse';
    progress = (t - 35000) / 5000; // 0 -> 1
  } else if (t < 42000) {
    phase = 'bigbang';
    progress = (t - 40000) / 2000; // 0 -> 1
  } else if (t < 50000) {
    phase = 'recover';
    progress = (t - 42000) / 8000; // 0 -> 1
  } else {
    phase = 'idle';
    progress = (t - 50000) / 10000; // 0 -> 1
  }

  // 1. 소용돌이 기하 왜곡 매개변수 계산
  let maxSwirlRadius = 70;
  let singularityRadius = 18;
  let rotationSpeed = 0.4;
  let opacity = 1.0;
  let scaleRatio = 1.0;

  const maxDiagRadius = Math.sqrt(w * w + h * h) + 200;

  if (phase === 'grow') {
    // 70px -> 170px 로 점진적 비대화
    maxSwirlRadius = 70 + progress * 100;
    singularityRadius = 18 + progress * 20;
    rotationSpeed = 0.4 + progress * 1.5; // 속도 대폭 증가
    explosionInitialized = false;
  } else if (phase === 'collapse') {
    // 블랙홀 크기를 대폭 키워서 컴포넌트들을 통째로 지워나가는 시각적 연출
    const initialSwirl = 170;
    const initialSingularity = 38;
    
    maxSwirlRadius = initialSwirl + (maxDiagRadius - initialSwirl) * progress;
    singularityRadius = initialSingularity + (maxDiagRadius * 0.85 - initialSingularity) * progress;
    
    rotationSpeed = 1.9 + progress * 4.0; // 소멸 직전 초고속 회전
    scaleRatio = 1.0 + progress * 5.0; // 스케일도 함께 비대화
    explosionInitialized = false;
  } else if (phase === 'bigbang') {
    // 이미지 렌더링 안 함
    opacity = 0;
    scaleRatio = 0;
  } else if (phase === 'recover') {
    // 서서히 복구 페이드인
    maxSwirlRadius = 70;
    singularityRadius = 18;
    rotationSpeed = 0.4;
    opacity = progress; // 페이드인
    scaleRatio = progress;
  } else {
    // 기본 상태
    maxSwirlRadius = 70;
    singularityRadius = 18;
    rotationSpeed = 0.4;
  }

  time += rotationSpeed * 0.05;

  // 2. 동심원 분할 마스킹 및 이미지 소용돌이 드로잉 (Grow / Collapse / Recover / Idle 상태)
  if (opacity > 0 && isImageLoaded.value && img) {
    ctx.save();
    ctx.globalAlpha = opacity;
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

      // 안쪽으로 갈수록 가속 공전 회전
      const rotation = time + Math.pow(1.0 - normalizedRadius, 2.2) * 5.0;

      // 중심으로 텍스처 수축 흐름 유도
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

  // 3. 사건의 지평선 (검은색 중앙 싱귤래러티) - 폭발 시에는 그리지 않음
  if (phase !== 'bigbang') {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, singularityRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. 성간 광원 오라 효과 (성장에 맞춰 함께 거대화)
  if (phase !== 'bigbang') {
    const auraRadius = maxSwirlRadius + 10;
    const startRadius = Math.max(0.1, singularityRadius - 2);
    const glow = ctx.createRadialGradient(cx, cy, startRadius, cx, cy, Math.max(startRadius + 1, auraRadius));
    glow.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
    glow.addColorStop(0.5, 'rgba(96, 165, 250, 0.12)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. 빅뱅 폭발 그래픽 효과 (Big Bang Phase)
  if (phase === 'bigbang') {
    const maxRadius = Math.sqrt(w * w + h * h);
    // 폭발 진입 순간에 입자들을 폭발용으로 리셋
    if (!explosionInitialized) {
      particles.length = 0;
      for (let i = 0; i < numParticles; i++) {
        particles.push(createParticle(maxRadius, false, true));
      }
      explosionInitialized = true;
    }

    // A. 강렬한 팽창하는 백색/네온 네온 구형 에너지 파동
    const flashRadius = progress * maxRadius;
    const flashGlow = ctx.createRadialGradient(cx, cy, flashRadius * 0.1, cx, cy, Math.max(1, flashRadius));
    flashGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    flashGlow.addColorStop(0.3, 'rgba(52, 211, 153, 0.8)');
    flashGlow.addColorStop(0.7, 'rgba(96, 165, 250, 0.4)');
    flashGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = flashGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, flashRadius, 0, Math.PI * 2);
    ctx.fill();

    // B. 다방면 번개 광선 레이저 라인 렌더링
    const numRays = 16;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * (1.0 - progress)})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2 + progress * 2.0;
      const rayLen = progress * maxRadius * (1.0 + Math.sin(time * 10 + i) * 0.2);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * rayLen, cy + Math.sin(angle) * rayLen);
      ctx.stroke();
    }
  }

  // 6. 입자 시뮬레이션 및 렌더링
  const maxRadius = Math.sqrt(w * w + h * h);
  if (phase !== 'bigbang' && particles.length > 0 && particles[0].speed > 2.0) {
    // 빅뱅 이후 복구 단계 진입 시 폭발용 초고속 입자를 잔잔한 일반 입자로 점차 복원
    particles.length = 0;
    for (let i = 0; i < numParticles; i++) {
      particles.push(createParticle(maxRadius, true, false));
    }
  }
  
  // 시간에 따른 입자 흡입 속도 가속화 계산
  let speedMult = 1.0;
  if (phase === 'grow') {
    speedMult = 1.0 + Math.pow(progress, 2) * 4.0; 
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
      // 빅뱅 시 사방 폭발 발산
      p.radius += p.speed;
      p.angle += p.angularSpeed;
    } else {
      // 평소에는 안으로 나선 흡입
      const gravityPull = Math.min(8.0, 100 / Math.max(p.radius, 12));
      
      p.radius -= p.speed * speedMult * gravityPull;
      p.angle += p.angularSpeed * speedMult * gravityPull * 1.3;
    }
    
    const x = cx + Math.cos(p.angle) * p.radius;
    const y = cy + Math.sin(p.angle) * p.radius;
    
    let alpha = 1;
    if (phase === 'bigbang') {
      // 폭발 시 서서히 페이드아웃
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
      ctx.fillStyle = p.color.replace('opacity', alpha.toFixed(2));
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 범위 이탈 시 재스폰
    if (phase === 'bigbang') {
      if (p.radius > maxRadius) {
        particles[i] = createParticle(maxRadius, false, true);
      }
    } else {
      if (p.radius < singularityRadius) {
        particles[i] = createParticle(maxRadius, false, false);
      }
    }
  }

  animationId = requestAnimationFrame(animate);
};

const handleResize = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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
  }

  const canvas = canvasRef.value;
  if (canvas) {
    handleResize();
    window.addEventListener('resize', handleResize);
    const maxRadius = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
    for (let i = 0; i < numParticles; i++) {
      particles.push(createParticle(maxRadius, true, false));
    }
    animate();
  }
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  if (process.client) {
    window.removeEventListener('resize', handleResize);
  }
});
</script>

<style scoped>
.black-hole-bg-container {
  position: fixed !important;
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
