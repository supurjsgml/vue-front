import { ref } from 'vue'

export function useDraggable() {
  const position = ref({ x: 0, y: 0 })
  const isDragging = ref(false)
  const dragOffset = ref({ x: 0, y: 0 })
  const hasMoved = ref(false)

  function startDrag(event: MouseEvent) {
    if (event.button !== 0) return // 왼쪽 클릭만 허용
    
    // 텍스트 드래그 선택이 발생하는 기본 이벤트를 차단하고 포커스를 활성화합니다.
    event.preventDefault()
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.focus()
    }
    
    isDragging.value = true
    hasMoved.value = false
    dragOffset.value = {
      x: event.clientX - position.value.x,
      y: event.clientY - position.value.y
    }
    
    if (typeof document !== 'undefined') {
      document.body.classList.add('dragging-active')
    }

    const onDrag = (e: MouseEvent) => {
      if (!isDragging.value) return
      hasMoved.value = true
      // 화면 밖으로 나가지 않도록 여유 있게 제한
      const maxX = typeof window !== 'undefined' ? window.innerWidth : 1200
      const maxY = typeof window !== 'undefined' ? window.innerHeight : 1000
      const minX = -maxX
      const minY = -maxY

      position.value.x = Math.min(maxX, Math.max(minX, e.clientX - dragOffset.value.x))
      position.value.y = Math.min(maxY, Math.max(minY, e.clientY - dragOffset.value.y))
    }

    const stopDrag = () => {
      isDragging.value = false
      if (typeof document !== 'undefined') {
        document.body.classList.remove('dragging-active')
      }
      document.removeEventListener("mousemove", onDrag)
      document.removeEventListener("mouseup", stopDrag)
    }

    document.addEventListener("mousemove", onDrag)
    document.addEventListener("mouseup", stopDrag)
  }

  return { position, startDrag, hasMoved, isDragging }
}
