<template>
  <ClientOnly>
    <div
      v-if="showPet"
      class="global-pet-3d-wrapper"
      :style="petWrapperStyle"
    >
      <!-- 순수 3D 동물 모델 렌더링 캔버스 (테두리 및 배경 박스 없음) -->
      <canvas
        ref="petCanvasRef"
        class="global-pet-3d-canvas"
      ></canvas>

      <!-- 발밑 입체 그림자 효과 -->
      <div class="pet-soft-shadow" :class="{ 'is-running': isMoving }"></div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute } from '#imports';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const props = defineProps<{
  bhPhase?: string;
  bhProgress?: number;
  isIdle?: boolean;
}>();

const route = useRoute();
const { isBlackHoleEnabled, isActionEnabled } = useBlackHole();

const isToggleVisible = ref(true);
const showPet = computed(() => {
  return route.path !== '/' && isToggleVisible.value;
});

// 단축키 Ctrl + Alt + P 로 3D 동물 켜고 끄기 지원
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.altKey && (event.key === 'p' || event.key === 'P' || event.code === 'KeyP')) {
    event.preventDefault();
    isToggleVisible.value = !isToggleVisible.value;
  }
};

const petWidth = ref(160);
const petHeight = ref(160);

// 위치 및 이동 역학
const posX = ref(200);
const posY = ref(200);
const vx = ref(0);
const vy = ref(0);
const isMoving = ref(false);
const petScale = ref(1.0);

// 자율 주행 AI 상태 관리
let targetX = 300;
let targetY = 300;
let aiState: 'idle' | 'walking' | 'running' = 'idle';
let stateTimer: any = null;

// Three.js 씬 관련
const petCanvasRef = ref<HTMLCanvasElement | null>(null);
const isModelLoaded = ref(false);
let isInitializing = false;

let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let mixer: THREE.AnimationMixer | null = null;
let dogModel: THREE.Group | null = null;
let dogPivot: THREE.Group | null = null;
const actions: Record<string, THREE.AnimationAction> = {};
let currentActionName = '';
const clock = new THREE.Clock();

const switchAnimation = (nextName: string, duration = 0.25) => {
  if (!actions[nextName] || currentActionName === nextName) return;
  const currentAction = actions[currentActionName];
  const nextAction = actions[nextName];

  if (currentAction) {
    currentAction.fadeOut(duration);
  }
  nextAction.reset().fadeIn(duration).play();
  currentActionName = nextName;
};

// 자율 주행 목표 지점 갱신 (화면 내 안전 구역 탐색)
const pickNewDestination = () => {
  if (!process.client) return;
  const margin = 80;
  const maxX = window.innerWidth - petWidth.value - margin;
  const maxY = window.innerHeight - petHeight.value - margin;

  targetX = margin + Math.random() * Math.max(100, maxX - margin);
  targetY = margin + Math.random() * Math.max(100, maxY - margin);

  const dist = Math.hypot(targetX - posX.value, targetY - posY.value);
  aiState = dist > 400 ? 'running' : 'walking';
  isMoving.value = true;
};

// 일정 주기마다 서서 두리번거리거나 새로운 목적지로 달리는 행동 결정
const runAiBrain = () => {
  if (stateTimer) clearTimeout(stateTimer);

  if (aiState === 'idle') {
    pickNewDestination();
    stateTimer = setTimeout(runAiBrain, 4000 + Math.random() * 4000);
  } else {
    // 이동 완료 후 잠시 대기 모드 진입
    aiState = 'idle';
    isMoving.value = false;
    vx.value = 0;
    vy.value = 0;
    stateTimer = setTimeout(runAiBrain, 2500 + Math.random() * 3000);
  }
};

const petWrapperStyle = computed(() => {
  return {
    position: 'fixed' as const,
    left: `${posX.value}px`,
    top: `${posY.value}px`,
    width: `${petWidth.value}px`,
    height: `${petHeight.value}px`,
    zIndex: 95,
    pointerEvents: 'none' as const,
    opacity: props.isIdle ? 0 : (isModelLoaded.value ? 1 : 0),
    transform: `scale(${petScale.value})`,
    transition: props.isIdle ? 'opacity 0.8s ease' : 'opacity 0.4s ease'
  };
});

let animFrameId = 0;
let isTabActive = true;

const animatePet = () => {
  if (!showPet.value || !isTabActive) return;

  const dt = clock.getDelta();
  if (mixer && isModelLoaded.value) {
    mixer.update(dt);
  }

  // 블랙홀 인력 상호작용
  const bhCenterX = 250;
  const bhCenterY = window.innerHeight - 250;
  const centerX = posX.value + petWidth.value / 2;
  const centerY = posY.value + petHeight.value / 2;
  const distToBh = Math.hypot(bhCenterX - centerX, bhCenterY - centerY);

  if (isBlackHoleEnabled.value && isActionEnabled.value && props.bhPhase === 'collapse') {
    // 블랙홀 흡입
    posX.value += (bhCenterX - petWidth.value / 2 - posX.value) * 0.25;
    posY.value += (bhCenterY - petHeight.value / 2 - posY.value) * 0.25;
    petScale.value = Math.max(0, petScale.value - 0.08);

    if (dogPivot) {
      dogPivot.rotation.x += 0.25;
      dogPivot.rotation.z += 0.25;
      dogPivot.rotation.y += 0.3;
    }
    switchAnimation('Run', 0.15);
  } else if (props.bhPhase === 'bigbang') {
    petScale.value = 0;
  } else if (props.bhPhase === 'recover') {
    petScale.value = props.bhProgress || 1;
  } else {
    petScale.value = 1.0;

    // 자율 주행 물리 계산
    if (aiState !== 'idle') {
      const dx = targetX - posX.value;
      const dy = targetY - posY.value;
      const dist = Math.hypot(dx, dy);

      if (dist < 15) {
        // 목표 도착
        posX.value = targetX;
        posY.value = targetY;
        vx.value = 0;
        vy.value = 0;
        runAiBrain();
      } else {
        const speed = aiState === 'running' ? 3.2 : 1.6;
        const angle = Math.atan2(dy, dx);
        const targetVx = Math.cos(angle) * speed;
        const targetVy = Math.sin(angle) * speed;

        // 부드러운 가속 보간
        vx.value += (targetVx - vx.value) * 0.12;
        vy.value += (targetVy - vy.value) * 0.12;

        posX.value += vx.value;
        posY.value += vy.value;

        // 3D 모델 진행 방향 회전
        if (dogPivot) {
          const moveAngle = Math.atan2(vx.value, vy.value);
          let diff = moveAngle - dogPivot.rotation.y;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          dogPivot.rotation.y += diff * 0.14;
          dogPivot.rotation.x = THREE.MathUtils.lerp(dogPivot.rotation.x, 0.18, 0.1);
          dogPivot.rotation.z = THREE.MathUtils.lerp(dogPivot.rotation.z, 0, 0.1);
        }

        switchAnimation(aiState === 'running' ? 'Run' : 'Walk', 0.2);
        if (mixer) {
          mixer.timeScale = aiState === 'running' ? 1.6 : 1.1;
        }
      }
    } else {
      // 대기 상태
      switchAnimation('Survey', 0.3);
      if (mixer) mixer.timeScale = 1.0;
      if (dogPivot) {
        dogPivot.rotation.x = THREE.MathUtils.lerp(dogPivot.rotation.x, 0.1, 0.1);
      }
    }
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }

  animFrameId = requestAnimationFrame(animatePet);
};

const updateDimensions = () => {
  if (!process.client) return;
  const size = window.innerWidth > 768 ? 160 : 120;
  petWidth.value = size;
  petHeight.value = size;

  if (renderer && camera) {
    camera.aspect = size / size;
    camera.updateProjectionMatrix();
    renderer.setSize(size, size);
  }
};

const startAnimationLoop = () => {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
  }
  animFrameId = requestAnimationFrame(animatePet);
};

const initThree = () => {
  if (!process.client || !petCanvasRef.value || isInitializing || scene) return;
  isInitializing = true;

  const width = petWidth.value;
  const height = petHeight.value;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 2.0, 4.8);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({
    canvas: petCanvasRef.value,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // 화사한 조명 배치
  const ambientLight = new THREE.AmbientLight(0xffffff, 3.2);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 3.5);
  mainLight.position.set(4, 6, 5);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 2.0);
  fillLight.position.set(-4, 3, 3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x34d399, 2.8);
  rimLight.position.set(0, -3, -4);
  scene.add(rimLight);

  dogPivot = new THREE.Group();
  scene.add(dogPivot);

  const loader = new GLTFLoader();
  loader.load(
    '/dog_3d.glb',
    (gltf) => {
      dogModel = gltf.scene;

      const scale = 0.022;
      dogModel.scale.set(scale, scale, scale);
      dogModel.position.set(0, -39.4 * scale, 10.7 * scale);

      dogModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.frustumCulled = false;
        }
      });

      dogPivot!.add(dogModel);

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(dogModel);
        gltf.animations.forEach((clip) => {
          if (mixer) {
            actions[clip.name] = mixer.clipAction(clip);
          }
        });
        switchAnimation('Walk');
      }

      isModelLoaded.value = true;
      isInitializing = false;
      startAnimationLoop();
      runAiBrain();
    },
    undefined,
    (error) => {
      console.warn('3D Pet model load error:', error);
      isModelLoaded.value = false;
      isInitializing = false;
    }
  );
};

const cleanupThree = () => {
  isInitializing = false;
  if (stateTimer) clearTimeout(stateTimer);
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = 0;
  }
  if (mixer) {
    mixer.stopAllAction();
    mixer = null;
  }
  if (dogPivot && scene) {
    scene.remove(dogPivot);
  }
  if (dogModel) {
    dogModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      }
    });
    dogModel = null;
  }
  dogPivot = null;
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  scene = null;
  camera = null;
  isModelLoaded.value = false;
};

const handleVisibilityChange = () => {
  if (document.hidden) {
    isTabActive = false;
    cancelAnimationFrame(animFrameId);
    if (stateTimer) clearTimeout(stateTimer);
  } else {
    isTabActive = true;
    if (showPet.value) {
      cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(animatePet);
      runAiBrain();
    }
  }
};

watch(showPet, (newVal) => {
  if (process.client) {
    if (!newVal) {
      cleanupThree();
    }
  }
});

watch(petCanvasRef, (canvas) => {
  if (canvas && !scene && !isInitializing) {
    initThree();
  }
});

onMounted(async () => {
  if (process.client) {
    window.addEventListener('keydown', handleKeydown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', updateDimensions);

    // 초기 위치 무작위 설정
    const margin = 100;
    posX.value = margin + Math.random() * (window.innerWidth - 300);
    posY.value = margin + Math.random() * (window.innerHeight - 300);

    await nextTick();
    if (petCanvasRef.value && !scene && !isInitializing) {
      initThree();
    }
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('resize', updateDimensions);
    cancelAnimationFrame(animFrameId);
    cleanupThree();
  }
});
</script>

<style scoped>
.global-pet-3d-wrapper {
  position: fixed;
  pointer-events: none;
  background: transparent;
  border: none;
  box-shadow: none;
  overflow: visible;
}

.global-pet-3d-canvas {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  display: block;
}

/* 발밑 부드러운 타원형 그림자 */
.pet-soft-shadow {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 75px;
  height: 18px;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 75%);
  border-radius: 50%;
  pointer-events: none;
  filter: blur(4px);
  transition: transform 0.2s ease, width 0.2s ease, opacity 0.2s ease;
}

.pet-soft-shadow.is-running {
  transform: translateX(-50%) scaleX(1.15);
  opacity: 0.65;
}
</style>
