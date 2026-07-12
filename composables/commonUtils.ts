import { useState } from '#imports'

export const useBlackHole = () => {
  const isBlackHoleEnabled = useState<boolean>('bh_enabled', () => true)
  const isActionEnabled = useState<boolean>('bh_action_enabled', () => true)
  const bigBangClickTime = useState<number>('bh_click_time', () => 0)
  const timeOffset = useState<number>('bh_time_offset', () => 0)

  const toggleBlackHole = () => {
    isBlackHoleEnabled.value = !isBlackHoleEnabled.value
    if (process.client) {
      localStorage.setItem('bh_enabled', String(isBlackHoleEnabled.value))
    }
  }

  const toggleAction = () => {
    isActionEnabled.value = !isActionEnabled.value
    if (process.client) {
      localStorage.setItem('bh_action_enabled', String(isActionEnabled.value))
    }
  }

  const initBlackHoleSetting = () => {
    if (process.client) {
      const saved = localStorage.getItem('bh_enabled')
      if (saved !== null) {
        isBlackHoleEnabled.value = saved === 'true'
      }

      const savedAction = localStorage.getItem('bh_action_enabled')
      if (savedAction !== null) {
        isActionEnabled.value = savedAction === 'true'
      }

      // 비밀 단축키 Ctrl + Alt + B 감지 이벤트 리스너 등록 (얼럿창 제외)
      window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'b') {
          e.preventDefault()
          toggleBlackHole()
        }
      })

      // 사건의 지평선(블랙홀 중심부) 마우스 클릭 감지 리스너 등록
      window.addEventListener('click', (e) => {
        if (!isBlackHoleEnabled.value) return
        const cx = 250
        const cy = window.innerHeight - 250
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        // 중심부 반지름 50px 이내 클릭 시 토글
        if (dist < 50) {
          bigBangClickTime.value = Date.now()
          toggleAction()
        }
      })
    }
  }

  return {
    isBlackHoleEnabled,
    isActionEnabled,
    bigBangClickTime,
    timeOffset,
    toggleBlackHole,
    toggleAction,
    initBlackHoleSetting
  }
}
