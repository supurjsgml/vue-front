import { useState } from '#imports'

export const useBlackHole = () => {
  const isBlackHoleEnabled = useState<boolean>('bh_enabled', () => true)

  const toggleBlackHole = () => {
    isBlackHoleEnabled.value = !isBlackHoleEnabled.value
    if (process.client) {
      localStorage.setItem('bh_enabled', String(isBlackHoleEnabled.value))
    }
  }

  const initBlackHoleSetting = () => {
    if (process.client) {
      const saved = localStorage.getItem('bh_enabled')
      if (saved !== null) {
        isBlackHoleEnabled.value = saved === 'true'
      }

      // 비밀 단축키 Ctrl + Alt + B 감지 이벤트 리스너 등록 (얼럿창 제외)
      window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'b') {
          e.preventDefault()
          toggleBlackHole()
        }
      })
    }
  }

  return {
    isBlackHoleEnabled,
    toggleBlackHole,
    initBlackHoleSetting
  }
}
