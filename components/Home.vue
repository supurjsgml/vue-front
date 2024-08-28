<template>
  <div class="container">
    <NuxtImg
      src="/samchoo.jpg"
      alt="삼츄"
      :sizes="sizes"
      class="responsive-image rotated-image"
      draggable="false"
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
import { ref, onMounted } from 'vue';

const sizes = `
  (max-width: 600px) 100vw,
  (max-width: 1200px) 50vw,
  33vw
`;

const positions = ref<Array<{ left: number, top: number }>>(
  Array.from({ length: 10 }, () => ({ left: 600, top: 600 }))   // 이미지 퍼지는 시작위치 하드코딩
);

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

onMounted(() => {
  positions.value.forEach((_, index) => {
    moveRandomly();
  });

  setInterval(() => {
    moveRandomly();
  }, 5000); // 5초마다 위치 변경
});

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
    width: 100vw;
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
