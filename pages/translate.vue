<template>
  <div class="converter-wrapper">
    <!-- Header -->
    <div class="converter-header">
      <h1 class="gradient-title">Google Translate</h1>
      <p class="description-text">실시간 다국어 기계 번역 서비스</p>
    </div>

    <!-- Translator Card -->
    <div class="translator-card glass-card">
      
      <!-- Source Panel (왼쪽: 입력) -->
      <div class="panel-section source-panel">
        <div class="panel-header">
          <div class="custom-select-wrapper">
            <select v-model="sourceLang" class="lang-select">
              <option value="ko">한국어 (Korean)</option>
              <option value="en">영어 (English)</option>
              <option value="ja">일본어 (Japanese)</option>
            </select>
          </div>
          <button v-if="inputText" class="clear-btn" @click="clearInput" title="지우기">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="textarea-wrapper">
          <textarea
            v-model="inputText"
            @input="handleInput"
            placeholder="번역할 텍스트를 입력하세요."
            maxlength="1000"
            class="translate-textarea"
          ></textarea>
        </div>

        <div class="panel-footer">
          <span class="char-counter">{{ inputText.length }} / 1000자</span>
        </div>
      </div>

      <!-- Swap Divider (중앙: 스왑) -->
      <div class="swap-divider">
        <button class="swap-btn" @click="swapLanguages" title="언어 바꾸기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 3 21 8 16 13"></polyline>
            <line x1="21" y1="8" x2="9" y2="8"></line>
            <polyline points="8 21 3 16 8 11"></polyline>
            <line x1="3" y1="16" x2="15" y2="16"></line>
          </svg>
        </button>
      </div>

      <!-- Target Panel (오른쪽: 결과) -->
      <div class="panel-section target-panel">
        <div class="panel-header">
          <div class="custom-select-wrapper">
            <select v-model="targetLang" class="lang-select">
              <option value="ko">한국어 (Korean)</option>
              <option value="en">영어 (English)</option>
              <option value="ja">일본어 (Japanese)</option>
            </select>
          </div>
          
          <button class="copy-btn" :disabled="!translatedText" @click="copyToClipboard" title="번역 결과 복사">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>

        <div class="result-area-wrapper">
          <div v-if="isLoading" class="loader-container">
            <div class="spinner"></div>
            <p>번역 중...</p>
          </div>
          <div v-else-if="translatedText" class="translated-text-display">
            {{ translatedText }}
          </div>
          <div v-else class="translated-text-placeholder">
            번역 결과가 여기에 표시됩니다.
          </div>
        </div>

        <div class="panel-footer right-align">
          <button class="translate-action-btn" :disabled="!inputText || isLoading" @click="triggerTranslate">
            번역하기
          </button>
        </div>
      </div>

    </div>

    <!-- Toast Notification -->
    <Transition name="fade-toast">
      <div v-if="showToast" class="toast-notification">
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const sourceLang = ref('en');
const targetLang = ref('ko');
const inputText = ref('');
const translatedText = ref('');
const isLoading = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

let debounceTimer: any = null;

const clearInput = () => {
  inputText.value = '';
  translatedText.value = '';
};

const swapLanguages = () => {
  const tempLang = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = tempLang;

  const tempText = inputText.value;
  inputText.value = translatedText.value;
  translatedText.value = tempText;
};

// API 번역 요청 실행
const triggerTranslate = async () => {
  if (!inputText.value.trim()) {
    translatedText.value = '';
    return;
  }

  if (sourceLang.value === targetLang.value) {
    translatedText.value = inputText.value;
    return;
  }

  isLoading.value = true;
  try {
    const q = encodeURIComponent(inputText.value.trim());
    const langpair = `${sourceLang.value}|${targetLang.value}`;
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${q}&langpair=${langpair}`);
    const data = await response.json();

    if (data && data.responseData && data.responseData.translatedText) {
      translatedText.value = data.responseData.translatedText;
    } else {
      translatedText.value = '번역을 완료하지 못했습니다. 다시 시도해 주세요.';
    }
  } catch (error) {
    console.error('Translation error:', error);
    translatedText.value = '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  } finally {
    isLoading.value = false;
  }
};

// 입력 디바운싱 (타이핑 시 800ms 대기 후 자동 번역)
const handleInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer);

  if (!inputText.value.trim()) {
    translatedText.value = '';
    return;
  }

  debounceTimer = setTimeout(() => {
    triggerTranslate();
  }, 800);
};

// 언어 선택 변경 시 자동 번역 트리거
watch([sourceLang, targetLang], () => {
  if (inputText.value.trim()) {
    triggerTranslate();
  }
});

// 복사 토스트 메시지 기능
const copyToClipboard = () => {
  if (!translatedText.value) return;

  navigator.clipboard.writeText(translatedText.value).then(() => {
    toastMessage.value = '클립보드에 번역 결과가 복사되었습니다!';
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 2500);
  }).catch(err => {
    console.error('Copy failed:', err);
  });
};
</script>

<style scoped>
.converter-wrapper {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Outfit', 'Noto Sans KR', sans-serif;
  user-select: none;
}

.converter-header {
  margin-bottom: 2rem;
  text-align: left;
}

.gradient-title {
  font-family: 'Outfit', 'Noto Sans KR', sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #34d399 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
  margin-top: 0;
}

.description-text {
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

.translator-card {
  display: flex;
  flex-direction: row;
  min-height: 420px;
  border-radius: 20px;
  border: 1px solid var(--nav-border);
  background: var(--nav-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.panel-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
}

.source-panel {
  border-right: none;
}

[data-bs-theme="light"] .source-panel {
  border-right: none;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  height: 40px;
}

.custom-select-wrapper {
  position: relative;
  width: 140px;
}

.lang-select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--nav-border);
  background: rgba(255, 255, 255, 0.03);
  color: var(--nav-text);
  font-size: 0.9rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
}

[data-bs-theme="light"] .lang-select {
  background: rgba(0, 0, 0, 0.02);
}

.lang-select:hover {
  border-color: rgba(52, 211, 153, 0.4);
}

.lang-select option {
  background-color: #1e293b;
  color: #f8fafc;
}

[data-bs-theme="light"] .lang-select option {
  background-color: #ffffff;
  color: #0f172a;
}

.clear-btn, .copy-btn {
  background: transparent;
  border: none;
  color: var(--nav-text);
  opacity: 0.5;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.clear-btn:hover, .copy-btn:hover:not(:disabled) {
  opacity: 1;
  background: rgba(255, 255, 255, 0.05);
  color: #34d399;
}

.textarea-wrapper, .result-area-wrapper {
  flex: 1;
  display: flex;
  min-height: 220px;
}

.translate-textarea {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  resize: none;
  color: var(--nav-text);
  font-size: 1.1rem;
  line-height: 1.6;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  user-select: text;
}

.translate-textarea::placeholder {
  color: var(--nav-text);
  opacity: 0.35;
}

.translated-text-display {
  width: 100%;
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--nav-text);
  white-space: pre-wrap;
  word-break: break-all;
  user-select: text;
  text-align: left;
}

.translated-text-placeholder {
  color: var(--nav-text);
  opacity: 0.35;
  font-size: 1.1rem;
  text-align: left;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  font-size: 0.85rem;
}

.char-counter {
  color: var(--nav-text);
  opacity: 0.4;
}

.right-align {
  justify-content: flex-end;
}

.swap-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  position: relative;
  z-index: 10;
}

.swap-divider::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(-50%);
  z-index: 1;
}

[data-bs-theme="light"] .swap-divider::before {
  background: rgba(0, 0, 0, 0.08);
}

.swap-btn {
  background: var(--nav-bg);
  border: 1px solid var(--nav-border);
  color: var(--nav-text);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.swap-btn:hover {
  transform: scale(1.1) rotate(180deg);
  border-color: #34d399;
  color: #34d399;
}

.translate-action-btn {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: #ffffff;
  border: none;
  padding: 10px 22px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(52, 211, 153, 0.3);
  transition: all 0.3s ease;
}

.translate-action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
}

.translate-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* Spinner Loader */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 15px;
  color: var(--nav-text);
  opacity: 0.6;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3.5px solid rgba(255, 255, 255, 0.1);
  border-top-color: #34d399;
  border-radius: 50%;
  animation: spin 0.85s linear infinite;
}

[data-bs-theme="light"] .spinner {
  border-color: rgba(0, 0, 0, 0.1);
  border-top-color: #34d399;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Toast styling */
.toast-notification {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(16, 185, 129, 0.95);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
  z-index: 10000;
}

.fade-toast-enter-active, .fade-toast-leave-active {
  transition: all 0.3s ease;
}
.fade-toast-enter-from, .fade-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .translator-card {
    flex-direction: column;
    min-height: auto;
  }

  .source-panel {
    border-right: none;
    border-bottom: none;
  }

  [data-bs-theme="light"] .source-panel {
    border-bottom: none;
  }

  .swap-divider {
    width: 100%;
    height: 50px;
    margin: -25px 0;
  }

  .swap-divider::before {
    top: 50%;
    bottom: auto;
    left: 0;
    right: 0;
    width: 100%;
    height: 1px;
    transform: translateY(-50%);
  }

  .swap-btn {
    transform: rotate(90deg);
  }

  .swap-btn:hover {
    transform: scale(1.1) rotate(270deg);
  }
}
</style>
