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
  // 빅뱅 폭발 시에는 중심부 근처에서 시작해 바깥으로 퍼져나감
  const radius = isExplosion
    ? Math.random() * 20 + 5
    : (isInitial 
        ? Math.random() * (maxRadius - 30) + 30 
        : maxRadius - Math.random() * 10);
    
  const colors = [
    'rgb(255, 255, 255)',      // white
    'rgb(52, 211, 153)',      // emerald (그린)
    'rgb(96, 165, 250)',      // blue (블루)
    'rgb(251, 191, 36)',      // gold (골드)
    'rgb(244, 63, 94)',       // rose (핑크)
    'rgb(168, 85, 247)'       // purple (보라)
  ];
  // 평소에는 흰색 위주, 폭발 시에는 다채로운 파편 컬러 사용
  let activeColors: string[] = [];
  if (isExplosion) {
    activeColors = colors;
  } else if (!isDark) {
    // 화이트 모드일 때는 흰색을 제외한 다채로운 컬러 적용
    activeColors = [colors[1], colors[2], colors[3], colors[4], colors[5]];
  } else {
    // 다크 모드 평상시에는 깔끔한 화이트/골드
    activeColors = [colors[0], colors[3]];
  }
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
  
  // 실시간 테마 변경 시 모든 입자의 색상 즉시 업데이트
  if (isDark !== lastIsDark) {
    const colors = [
      'rgb(255, 255, 255)',      // white
      'rgb(52, 211, 153)',      // emerald
      'rgb(96, 165, 250)',      // blue
      'rgb(251, 191, 36)',      // gold
      'rgb(244, 63, 94)',       // rose
      'rgb(168, 85, 247)'       // purple
    ];
    const activeColors = isDark ? [colors[0], colors[3]] : [colors[1], colors[2], colors[3], colors[4], colors[5]];
    for (let i = 0; i < particles.length; i++) {
      particles[i].color = activeColors[Math.floor(Math.random() * activeColors.length)];
    }
    lastIsDark = isDark;
  }

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
    // 블랙홀 이미지 크기는 팽창하지 않도록 고정 (화면을 덮는 효과 제거)
    maxSwirlRadius = 170;
    singularityRadius = 38;
    
    rotationSpeed = 1.9 + progress * 6.0; // 소멸 직전 초고속 회전만 가속화
    scaleRatio = 1.0; // 스케일 비대화 제거
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

    // 붕괴 시 회전 가속화에 맞춰 사건의 지평선 바깥쪽 소용돌이 전체가 가로로 일그러지는 연출
    if (phase === 'collapse') {
      const distortX = 1.0 + progress * 0.45; // 가로로 최대 45% 팽창
      const distortY = 1.0 - progress * 0.15; // 세로로 15% 수축
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

  // 5. 빅뱅 폭발 그래픽 효과 (Big Bang Phase)
  if (phase === 'bigbang') {
    const maxRadius = Math.sqrt(w * w + h * h);
    // 폭발 진입 순간에 입자들을 폭발용으로 리셋
    if (!explosionInitialized) {
      particles.length = 0;
      for (let i = 0; i < numParticles; i++) {
        particles.push(createParticle(maxRadius, false, true, isDark));
      }
      explosionInitialized = true;
    }

    const invProg = 1.0 - progress;

    // A. 다중 레이어 회전 성운 가스 (Nebula Whorls) 연출
    const baseRadius = progress * maxRadius * 1.1;
    
    // 레이어 1: 신비로운 우주 보라 성운 (Purple Nebula)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.5); // 가스 회전
    const scaleX = 1.0 + Math.sin(time * 2) * 0.15;
    const scaleY = 1.0 - Math.sin(time * 2) * 0.15;
    ctx.scale(scaleX, scaleY);
    
    const nebulaGlow1 = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, baseRadius));
    nebulaGlow1.addColorStop(0, 'rgba(168, 85, 247, 0.7)'); // 보라색 중심
    nebulaGlow1.addColorStop(0.4, 'rgba(139, 92, 246, 0.35)'); // 바이올렛 외곽
    nebulaGlow1.addColorStop(0.8, 'rgba(96, 165, 250, 0.1)'); // 블루 경계
    nebulaGlow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebulaGlow1;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 레이어 2: 강력한 폭발 에메랄드/화이트 코어 성운
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-time * 0.8); // 반대 방향 가스 회전
    const scaleX2 = 1.0 - Math.cos(time * 1.5) * 0.1;
    const scaleY2 = 1.0 + Math.cos(time * 1.5) * 0.1;
    ctx.scale(scaleX2, scaleY2);

    const nebulaGlow2 = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, baseRadius * 0.75));
    nebulaGlow2.addColorStop(0, 'rgba(255, 255, 255, 0.95)'); // 눈부신 백색 중심
    nebulaGlow2.addColorStop(0.2, 'rgba(52, 211, 153, 0.6)'); // 에메랄드
    nebulaGlow2.addColorStop(0.6, 'rgba(251, 191, 36, 0.25)'); // 골드 외곽선
    nebulaGlow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebulaGlow2;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // B. 초신성 우주 쇼크웨이브 고리 (Cosmic Shockwave Rings)
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

  // 6. 입자 시뮬레이션 및 렌더링
  const maxRadius = Math.sqrt(w * w + h * h);
  if (phase !== 'bigbang' && particles.length > 0 && particles[0].speed > 2.0) {
    // 빅뱅 이후 복구 단계 진입 시 폭발용 초고속 입자를 잔잔한 일반 입자로 점차 복원
    particles.length = 0;
    for (let i = 0; i < numParticles; i++) {
      particles.push(createParticle(maxRadius, true, false, isDark));
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
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // 범위 이탈 시 재스폰
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
