<template>
  <div ref="containerRef" class="container">
    <NuxtImg
      ref="dogImgRef"
      src="/samchoo.jpg"
      alt="삼츄"
      class="bouncing-dog"
      :style="dogStyle"
      draggable="false"
      @load="updateDogDimensions"
      @dragstart.prevent
    />

    <div
      v-for="(image, index) in positions.length"
      :key="index"
      :style="getRandomStyle(index)"
      class="draggable"
      @mousedown="onMouseDown($event, index)"
      ref="draggableElements"
    >
      <NuxtLogo class="logo" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, onUnmounted, computed } from 'vue';

const sizes = `
  (max-width: 600px) 100vw,
  (max-width: 1200px) 50vw,
  33vw
`;

const containerRef = ref<HTMLDivElement | null>(null);
const dogImgRef = ref<any>(null);

const dogWidth = ref(480);
const dogHeight = ref(480);

const x = ref(100);
const y = ref(100);
const vx = ref(2.5);
const vy = ref(2);
const rotation = ref(45);
const rotationSpeed = ref(0.6);

const dogStyle = computed(() => {
  return {
    position: 'absolute',
    left: `${x.value}px`,
    top: `${y.value}px`,
    transform: `rotate(${rotation.value}deg)`,
    width: `${dogWidth.value}px`,
    height: `${dogHeight.value}px`,
    display: 'block'
  };
});

const updateDogDimensions = () => {
  const size = window.innerWidth > 768 ? 480 : 300;
  dogWidth.value = size;
  dogHeight.value = size;
};

let angleOffset = 0;
let animationFrameId: number;

const animateDog = () => {
  const viewWidth = containerRef.value ? containerRef.value.clientWidth : window.innerWidth;
  const viewHeight = containerRef.value ? containerRef.value.clientHeight : window.innerHeight;

  // Steering force to create dynamic circular/curving paths
  const speed = Math.sqrt(vx.value * vx.value + vy.value * vy.value);
  let moveAngle = Math.atan2(vy.value, vx.value);
  
  angleOffset += 0.008;
  moveAngle += Math.sin(angleOffset) * 0.015; // wave curving
  
  vx.value = Math.cos(moveAngle) * speed;
  vy.value = Math.sin(moveAngle) * speed;
  
  x.value += vx.value;
  y.value += vy.value;
  
  // Rotate the dog
  rotation.value = (rotation.value + rotationSpeed.value) % 360;
  
  // Bound collision
  let bounced = false;
  
  if (x.value < 0) {
    x.value = 0;
    vx.value = Math.abs(vx.value);
    bounced = true;
  } else if (x.value + dogWidth.value > viewWidth) {
    x.value = viewWidth - dogWidth.value;
    vx.value = -Math.abs(vx.value);
    bounced = true;
  }
  
  if (y.value < 0) {
    y.value = 0;
    vy.value = Math.abs(vy.value);
    bounced = true;
  } else if (y.value + dogHeight.value > viewHeight) {
    y.value = viewHeight - dogHeight.value;
    vy.value = -Math.abs(vy.value);
    bounced = true;
  }
  
  if (bounced) {
    rotationSpeed.value = -rotationSpeed.value * 1.05;
    if (Math.abs(rotationSpeed.value) > 2) {
      rotationSpeed.value = Math.sign(rotationSpeed.value) * 1.2;
    }
  }
  
  animationFrameId = requestAnimationFrame(animateDog);
};

onBeforeMount(() => {
  const width = window.innerWidth > 2000 ? (window.innerWidth / 2) / 2 : window.innerWidth / 2;
  const height = window.innerHeight / 2;

  positions.value = Array.from({ length: 10 }, () => ({
    left: width,
    top: height,
  }));
});

onMounted(() => {
  positions.value.forEach((_, index) => {
    moveRandomly();
  });

  setInterval(() => {
    moveRandomly();
  }, 5000); // 5초마다 위치 변경

  // Init position randomly inside the container
  const viewWidth = containerRef.value ? containerRef.value.clientWidth : window.innerWidth;
  const viewHeight = containerRef.value ? containerRef.value.clientHeight : window.innerHeight;
  x.value = Math.random() * (viewWidth - dogWidth.value);
  y.value = Math.random() * (viewHeight - dogHeight.value);
  
  // Choose random velocity
  const initialAngle = Math.random() * Math.PI * 2;
  const initialSpeed = 2.0;
  vx.value = Math.cos(initialAngle) * initialSpeed;
  vy.value = Math.sin(initialAngle) * initialSpeed;

  updateDogDimensions();
  window.addEventListener('resize', updateDogDimensions);
  
  animationFrameId = requestAnimationFrame(animateDog);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateDogDimensions);
  cancelAnimationFrame(animationFrameId);
});

const positions = ref([]);
const draggableElements = ref<HTMLDivElement[]>([]);

const getResponsiveBounds = () => {
  const height = window.innerHeight;
  const width = window.innerWidth > 1344 ? 1344 : window.innerWidth;

  if (width <= 600) {
    return { maxWidth: width - 50, maxHeight: height - 50 };
  } else if (width <= 1200) {
    return { maxWidth: width - 80, maxHeight: height - 80 };
  } else {
    return { maxWidth: width - 100, maxHeight: height - 100 };
  }
};

const getRandomStyle = (index: number) => {
  return {
    position: 'absolute',
    left: `${positions.value[index].left}px`,
    top: `${positions.value[index].top}px`,
    transition: 'left 2s ease, top 2s ease',  // 부드러운 이동 애니메이션
  };
};

const moveRandomly = () => {
  const bounds = getResponsiveBounds();

  positions.value.forEach((pos, index) => {
    const element = draggableElements.value[index];
    const maxWidth = bounds.maxWidth - element?.clientWidth;
    const maxHeight = bounds.maxHeight - element?.clientHeight;

    const randomX = Math.floor(Math.random() * maxWidth);
    const randomY = Math.floor(Math.random() * maxHeight);

    positions.value[index] = { left: randomX, top: randomY };
  });
};

let activeIndex = ref<number | null>(null);
let startX = 0;
let startY = 0;

function onMouseDown(event: MouseEvent, index: number) {
  activeIndex.value = index;
  startX = event.clientX;
  startY = event.clientY;

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(event: MouseEvent) {
  if (activeIndex.value !== null) {
    const bounds = getResponsiveBounds();
    const element = draggableElements.value[activeIndex.value];
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    const currentPosition = positions.value[activeIndex.value];
    let newLeft = currentPosition.left + dx;
    let newTop = currentPosition.top + dy;

    const maxWidth = bounds.maxWidth - element.clientWidth;
    const maxHeight = bounds.maxHeight - element.clientHeight;

    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft > maxWidth) newLeft = maxWidth;
    if (newTop > maxHeight) newTop = maxHeight;

    positions.value[activeIndex.value] = {
      left: newLeft,
      top: newTop,
    };

    startX = event.clientX;
    startY = event.clientY;
  }
}

function onMouseUp() {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  activeIndex.value = null;
}
</script>

<style scoped>
.container {
    position: relative;
    width: 100%;
    height: 94vh;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
}

.image-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.rotated-image {
    transform: rotate(45deg);
}

.draggable {
  position: absolute;
}

.logo {
  width: 100px;
  height: 100px;
}

@media (max-width: 600px) {
  .logo {
    width: 50px;
    height: 50px;
  }

  .responsive-image {
    max-width: 100%;
    max-height: auto;
  }
}

@media (max-width: 1200px) {
  .logo {
    width: 80px;
    height: 80px;
  }
}

@media (min-width: 1201px) {
  .logo {
    width: 100px;
    height: 100px;
  }

  .responsive-image {
    max-width: 33%;
  }
}

/* 이미지 크기 조정 */
.responsive-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain; /* 이미지가 부모 요소 안에 맞게 조정 */
    position: absolute;  /* 이미지를 고정 위치로 설정 */
    z-index: -1;  /* 맨 뒤로 이동 */
    pointer-events: none; /* 클릭 이벤트 무시 */
}

.bouncing-dog {
  position: absolute !important;
  z-index: -1;
  pointer-events: none;
  object-fit: contain;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05); /* frosted glass background backing */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 15px; /* inset padding to keep the full body nicely inside the circle frame */
  box-sizing: border-box;
  box-shadow: 0 10px 30px rgba(52, 211, 153, 0.25), 0 5px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(52, 211, 153, 0.45);
  /* position changes on every frame, so transition is disabled to prevent lagging */
}

.rotated-image {
    transform: rotate(45deg);
}

/* 작은 화면 */
@media (max-width: 600px) {
  .responsive-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain; /* 화면에 맞춰 이미지 조정 */
  }
}

/* 중간 크기 화면 */
@media (max-width: 1200px) {
  .responsive-image {
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
  }
}

/* 큰 화면 */
@media (min-width: 1201px) {
  .responsive-image {
    max-width: 60%;
    max-height: 60%;
    object-fit: contain;
  }
}
</style>
