<template>
  <ClientOnly>
    <div
      v-if="showGlobalDog"
      class="global-dog-container"
      :style="globalDogContainerStyle"
      @mousedown.stop="startGlobalDogDrag"
      @mouseenter="onDogHover"
    >
      <NuxtImg
        src="/dog.jpg"
        alt="견희"
        class="global-bouncing-dog"
        :style="globalDogImgStyle"
        draggable="false"
        @dragstart.prevent
      />
      <Transition name="fade-bubble">
        <div v-if="showSpeechBubble" class="speech-bubble">
          {{ bubbleText }}
        </div>
      </Transition>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from '#imports';

const props = defineProps<{
  bhPhase: string;
  bhProgress: number;
}>();

const route = useRoute();

const showGlobalDog = computed(() => {
  return route.path !== '/';
});

const globalDogWidth = ref(180);
const globalDogHeight = ref(180);

const gx = ref(100);
const gy = ref(100);
const gvx = ref(1.8);
const gvy = ref(1.4);
const gRotation = ref(0);
const gRotationSpeed = ref(0.4);
const gBounceCount = ref(0);
const globalDogScale = ref(1.0);
const isSuckedIn = ref(false);

const showSpeechBubble = ref(false);
const bubbleText = ref('끄어억!');
let bubbleTimer: any = null;

const onDogHover = () => {
  if (gIsDragging.value) return;
  
  const messages = [
    '끄어어억...',
    '끄어억! 살려주;.세.',
    '끄어',
    '끄어억멍!!',
    '💤',
    '끼이이이ㄱㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣ',
  ];
  const randomIndex = Math.floor(Math.random() * messages.length);
  bubbleText.value = messages[randomIndex];
  showSpeechBubble.value = true;

  if (bubbleTimer) {
    clearTimeout(bubbleTimer);
  }
  bubbleTimer = setTimeout(() => {
    showSpeechBubble.value = false;
  }, 5000);
};

const gIsDragging = ref(false);
let lastMouseX = 0;
let lastMouseY = 0;
let lastDragTime = 0;
let dragHasMoved = false;

const startGlobalDogDrag = (event: MouseEvent) => {
  if (event.button !== 0) return; // Only allow left-clicks
  
  gIsDragging.value = true;
  dragHasMoved = false;
  
  const initialMouseX = event.clientX;
  const initialMouseY = event.clientY;
  const initialDogX = gx.value;
  const initialDogY = gy.value;
  
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
  lastDragTime = performance.now();
  
  const onDrag = (e: MouseEvent) => {
    if (!gIsDragging.value) return;
    
    dragHasMoved = true;
    
    const dx = e.clientX - initialMouseX;
    const dy = e.clientY - initialMouseY;
    
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    
    gx.value = Math.min(viewWidth - globalDogWidth.value, Math.max(0, initialDogX + dx));
    gy.value = Math.min(viewHeight - globalDogHeight.value, Math.max(0, initialDogY + dy));
    
    const currentTime = performance.now();
    const dt = currentTime - lastDragTime;
    
    if (dt > 10) {
      const distMouseX = e.clientX - lastMouseX;
      const distMouseY = e.clientY - lastMouseY;
      
      const instVx = distMouseX / (dt / 16.67);
      const instVy = distMouseY / (dt / 16.67);
      
      gvx.value = gvx.value * 0.4 + instVx * 0.6;
      gvy.value = gvy.value * 0.4 + instVy * 0.6;
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      lastDragTime = currentTime;
    }
  };
  
  const stopDrag = () => {
    gIsDragging.value = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    
    gBounceCount.value = 0;
    
    const speed = Math.sqrt(gvx.value * gvx.value + gvy.value * gvy.value);
    const maxSpeed = 8;
    const minSpeed = 1.2;
    
    if (speed > maxSpeed) {
      const ratio = maxSpeed / speed;
      gvx.value *= ratio;
      gvy.value *= ratio;
    } else if (speed < minSpeed) {
      const angle = Math.random() * Math.PI * 2;
      gvx.value = Math.cos(angle) * minSpeed;
      gvy.value = Math.sin(angle) * minSpeed;
    }
  };
  
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const globalDogContainerStyle = computed(() => {
  return {
    position: 'fixed' as const,
    left: `${gx.value}px`,
    top: `${gy.value}px`,
    width: `${globalDogWidth.value}px`,
    height: `${globalDogHeight.value}px`,
    display: showGlobalDog.value ? 'block' : 'none',
    zIndex: 100,
    pointerEvents: 'auto' as const,
    cursor: gIsDragging.value ? 'grabbing' : 'grab',
    transform: `scale(${globalDogScale.value})`,
    transition: gIsDragging.value ? 'none' : 'transform 0.1s ease'
  };
});

const globalDogImgStyle = computed(() => {
  return {
    transform: `rotate(${gRotation.value}deg)`,
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    padding: '10px',
    boxSizing: 'border-box' as const,
    border: '2px solid rgba(52, 211, 153, 0.3)',
    boxShadow: '0 8px 25px rgba(52, 211, 153, 0.2), 0 4px 10px rgba(0, 0, 0, 0.3)',
    display: 'block'
  };
});

let gAnimationFrameId = 0;
let isTabActive = true;

const animateGlobalDog = () => {
  if (!showGlobalDog.value || !isTabActive) return;

  const dogCenterX = gx.value + globalDogWidth.value / 2;
  const dogCenterY = gy.value + globalDogHeight.value / 2;

  const bhCenterX = 250;
  const bhCenterY = window.innerHeight - 250;

  if (!gIsDragging.value) {
    const dx = bhCenterX - dogCenterX;
    const dy = bhCenterY - dogCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const phase = props.bhPhase;
    const prog = props.bhProgress;

    if (phase === 'collapse') {
      isSuckedIn.value = true;
      gx.value += (bhCenterX - globalDogWidth.value / 2 - gx.value) * 0.3;
      gy.value += (bhCenterY - globalDogHeight.value / 2 - gy.value) * 0.3;
      globalDogScale.value = Math.max(0, globalDogScale.value - 0.1);
      gRotation.value += 25;
      gAnimationFrameId = requestAnimationFrame(animateGlobalDog);
      return;
    }

    if (phase === 'bigbang') {
      isSuckedIn.value = false;
      globalDogScale.value = 0;
      gAnimationFrameId = requestAnimationFrame(animateGlobalDog);
      return;
    }

    if (phase === 'recover') {
      globalDogScale.value = prog;
    }

    if (isSuckedIn.value) {
      gx.value += (bhCenterX - globalDogWidth.value / 2 - gx.value) * 0.15;
      gy.value += (bhCenterY - globalDogHeight.value / 2 - gy.value) * 0.15;
      globalDogScale.value = Math.max(0, globalDogScale.value - 0.05);
      gRotationSpeed.value = gRotationSpeed.value * 1.1 + 0.8;

      if (globalDogScale.value <= 0.02) {
        isSuckedIn.value = false;
        globalDogScale.value = 1.0;
        gRotationSpeed.value = 0.4;

        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight;
        const corners = [
          { x: 50, y: 50 },
          { x: viewWidth - globalDogWidth.value - 50, y: 50 },
          { x: 50, y: viewHeight - globalDogHeight.value - 50 },
          { x: viewWidth - globalDogWidth.value - 50, y: viewHeight - globalDogHeight.value - 50 }
        ];
        const randomCorner = corners[Math.floor(Math.random() * corners.length)];
        gx.value = randomCorner.x;
        gy.value = randomCorner.y;

        const initialAngle = Math.random() * Math.PI * 2;
        const initialSpeed = 1.4;
        gvx.value = Math.cos(initialAngle) * initialSpeed;
        gvy.value = Math.sin(initialAngle) * initialSpeed;

        bubbleText.value = '살려주세요 살려주세요 살려주세요어억!!!!';
        showSpeechBubble.value = true;
        if (bubbleTimer) clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(() => {
          showSpeechBubble.value = false;
        }, 5000);
      }

      gRotation.value = (gRotation.value + gRotationSpeed.value) % 360;
      gAnimationFrameId = requestAnimationFrame(animateGlobalDog);
      return;
    } else if (dist < 65) {
      isSuckedIn.value = true;
      showSpeechBubble.value = true;
      if (bubbleTimer) clearTimeout(bubbleTimer);
    } else {
      const range = 280 + (phase === 'grow' ? prog * 220 : 0);
      
      if (dist < range) {
        const pullForce = (range - dist) / range;
        const angle = Math.atan2(dy, dx);
        const pullScale = 0.35 + (phase === 'grow' ? prog * 2.5 : 0);
        
        gvx.value += Math.cos(angle) * pullForce * pullScale;
        gvy.value += Math.sin(angle) * pullForce * pullScale;

        const currentSpeed = Math.sqrt(gvx.value * gvx.value + gvy.value * gvy.value);
        if (currentSpeed > 6.0) {
          gvx.value = (gvx.value / currentSpeed) * 6.0;
          gvy.value = (gvy.value / currentSpeed) * 6.0;
        }

        gRotationSpeed.value = gRotationSpeed.value * 0.95 + Math.sign(gRotationSpeed.value) * pullForce * 1.8;

        if (Math.random() < 0.02) {
          bubbleText.value = Math.random() < 0.5 ? '어어.. 끌려들어간다!' : '끄어어어억! 살려줘!';
          showSpeechBubble.value = true;
          if (bubbleTimer) clearTimeout(bubbleTimer);
          bubbleTimer = setTimeout(() => {
            showSpeechBubble.value = false;
          }, 1500);
        }
      }
    }
  }

  if (gIsDragging.value) {
    gRotation.value = (gRotation.value + gRotationSpeed.value) % 360;
    gAnimationFrameId = requestAnimationFrame(animateGlobalDog);
    return;
  }

  const viewWidth = window.innerWidth;
  const viewHeight = window.innerHeight;

  gx.value += gvx.value;
  gy.value += gvy.value;
  
  gRotation.value = (gRotation.value + gRotationSpeed.value) % 360;
  
  let bounced = false;
  
  if (gx.value < 0) {
    gx.value = 0;
    gvx.value = Math.abs(gvx.value);
    bounced = true;
  } else if (gx.value + globalDogWidth.value > viewWidth) {
    gx.value = viewWidth - globalDogWidth.value;
    gvx.value = -Math.abs(gvx.value);
    bounced = true;
  }
  
  if (gy.value < 0) {
    gy.value = 0;
    gvy.value = Math.abs(gvy.value);
    bounced = true;
  } else if (gy.value + globalDogHeight.value > viewHeight) {
    gy.value = viewHeight - globalDogHeight.value;
    gvy.value = -Math.abs(gvy.value);
    bounced = true;
  }
  
  if (bounced) {
    gRotationSpeed.value = -gRotationSpeed.value * 1.05;
    if (Math.abs(gRotationSpeed.value) > 1.5) {
      gRotationSpeed.value = Math.sign(gRotationSpeed.value) * 1.0;
    }
    
    gBounceCount.value++;
    if (gBounceCount.value >= 5) {
      const currentSpeed = Math.sqrt(gvx.value * gvx.value + gvy.value * gvy.value);
      if (currentSpeed > 0) {
        const targetSpeed = 1.6;
        const ratio = targetSpeed / currentSpeed;
        gvx.value *= ratio;
        gvy.value *= ratio;
      }
      gBounceCount.value = 0;
    }
  }
  
  gAnimationFrameId = requestAnimationFrame(animateGlobalDog);
};

const updateGlobalDogDimensions = () => {
  if (!process.client) return;
  const size = window.innerWidth > 768 ? 180 : 120;
  globalDogWidth.value = size;
  globalDogHeight.value = size;
};

const toggleGlobalDogAnimation = (isActive: boolean) => {
  if (!process.client) return;
  if (isActive && isTabActive) {
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    gx.value = Math.random() * (viewWidth - globalDogWidth.value);
    gy.value = Math.random() * (viewHeight - globalDogHeight.value);

    const initialAngle = Math.random() * Math.PI * 2;
    const initialSpeed = 1.4;
    gvx.value = Math.cos(initialAngle) * initialSpeed;
    gvy.value = Math.sin(initialAngle) * initialSpeed;

    updateGlobalDogDimensions();
    window.addEventListener('resize', updateGlobalDogDimensions);
    
    cancelAnimationFrame(gAnimationFrameId);
    gAnimationFrameId = requestAnimationFrame(animateGlobalDog);
  } else {
    window.removeEventListener('resize', updateGlobalDogDimensions);
    cancelAnimationFrame(gAnimationFrameId);
  }
};

// Page Visibility API 최적화
const handleVisibilityChange = () => {
  if (document.hidden) {
    isTabActive = false;
    cancelAnimationFrame(gAnimationFrameId);
  } else {
    isTabActive = true;
    if (showGlobalDog.value) {
      cancelAnimationFrame(gAnimationFrameId);
      gAnimationFrameId = requestAnimationFrame(animateGlobalDog);
    }
  }
};

watch(showGlobalDog, (newVal) => {
  if (process.client) {
    toggleGlobalDogAnimation(newVal);
  }
}, { immediate: true });

onMounted(() => {
  if (process.client) {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (showGlobalDog.value) {
      toggleGlobalDogAnimation(true);
    }
  }
});

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('resize', updateGlobalDogDimensions);
    cancelAnimationFrame(gAnimationFrameId);
  }
});
</script>

<style scoped>
.global-dog-container {
  position: fixed !important;
  z-index: 100;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.global-bouncing-dog {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.speech-bubble {
  position: absolute;
  bottom: 115%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #34d399;
  color: #0f172a;
  padding: 8px 14px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 8px 20px rgba(52, 211, 153, 0.3), 0 4px 8px rgba(0, 0, 0, 0.15);
  font-family: 'Outfit', 'Noto Sans KR', sans-serif;
  pointer-events: none;
  z-index: 100;
  user-select: none;
}

[data-bs-theme="dark"] .speech-bubble {
  background: rgba(15, 23, 42, 0.95);
  border-color: #34d399;
  color: #f8fafc;
  box-shadow: 0 8px 25px rgba(52, 211, 153, 0.4), 0 4px 10px rgba(0, 0, 0, 0.4);
}

.speech-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.95) transparent transparent transparent;
}

[data-bs-theme="dark"] .speech-bubble::after {
  border-color: rgba(15, 23, 42, 0.95) transparent transparent transparent;
}

.speech-bubble::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 10px;
  border-style: solid;
  border-color: #34d399 transparent transparent transparent;
}

.fade-bubble-enter-active {
  animation: bubble-bounce 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fade-bubble-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-bubble-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.9);
}

@keyframes bubble-bounce {
  0% {
    opacity: 0;
    transform: translate(-50%, 15px) scale(0.6);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}
</style>
