<template>
  <div class="diff-page-wrapper jasypt-page-wrapper">
    <!-- 상단 헤더 (공통 규격) -->
    <div class="diff-header">
      <h1 class="gradient-title">Jasypt Text Encryptor</h1>
      <p class="description-text">Java 및 Spring Boot Jasypt 암호화 및 복호화 변환 도구입니다.</p>
    </div>

    <!-- 메인 워크스페이스 카드 -->
    <div class="diff-card glass-card">
      <!-- 상단 컨트롤 바 (공통 규격) -->
      <div class="control-bar">
        <div class="control-left">
          <button type="button" class="action-btn secondary-btn" @click="loadSampleData">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            예시 데이터
          </button>
          <button type="button" class="action-btn secondary-btn" @click="resetAll">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            초기화
          </button>
          <button
            type="button"
            class="action-btn primary-btn run-btn"
            :disabled="!canExecute"
            @click="processAction"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Run
          </button>
        </div>

        <div class="control-right">
          <!-- 모드 탭 -->
          <div class="mode-tabs">
            <button
              type="button"
              class="tab-btn"
              :class="{ active: mode === 'encrypt' }"
              @click="setMode('encrypt')"
            >
              Encrypt
            </button>
            <button
              type="button"
              class="tab-btn"
              :class="{ active: mode === 'decrypt' }"
              @click="setMode('decrypt')"
            >
              Decrypt
            </button>
          </div>

          <!-- 복호화 시 검증 동작 분기 -->
          <select v-if="mode === 'decrypt'" v-model="decryptAction" class="toolbar-select decrypt-action-select">
            <option value="decrypt">Decrypt</option>
            <option value="match">Match</option>
          </select>

          <!-- 알고리즘 선택 -->
          <select v-model="selectedAlgorithm" class="toolbar-select algo-select">
            <template v-if="mode === 'encrypt' || decryptAction === 'decrypt'">
              <option value="PBEWithMD5AndDES">PBEWithMD5AndDES</option>
              <option value="PBEWithHMACSHA512AndAES_256">PBEWithHMACSHA512AndAES_256</option>
              <option value="PBEWithHMACSHA256AndAES_256">PBEWithHMACSHA256AndAES_256</option>
            </template>
            <template v-if="mode === 'encrypt' || decryptAction === 'match'">
              <option value="SHA-256">SHA-256 (Digest)</option>
              <option value="SHA-512">SHA-512 (Digest)</option>
              <option value="MD5">MD5 (Digest)</option>
            </template>
          </select>

          <!-- 시크릿 키 입력창 -->
          <div v-if="isKeyRequired" class="key-input-wrapper">
            <input
              :type="showSecret ? 'text' : 'password'"
              v-model="secretKey"
              class="key-input"
              :placeholder="decryptAction === 'match' ? '검증할 원본 평문.' : 'Secret Key.'"
              @keydown.enter="processAction"
            />
            <button
              v-if="decryptAction !== 'match'"
              type="button"
              class="key-eye-btn"
              @click="showSecret = !showSecret"
              :title="showSecret ? '비밀번호 숨기기' : '비밀번호 표시'"
            >
              <svg v-if="showSecret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 가이드 패널 (기본 노출) -->
      <div class="guide-collapsible">
        <div class="guide-content">
          <div class="guide-col">
            <span class="guide-label">application.yml 설정 예시</span>
            <pre><code>spring:
  datasource:
    password: {{ outputText ? formatAsEnc(outputText) : 'ENC(Ld2HkD3ifnAsEKpbxI4LQtxvYbP46PqkI6G1RITSt+4=)' }}</code></pre>
          </div>
          <div class="guide-col">
            <span class="guide-label">애플리케이션 실행 시 비밀키 주입</span>
            <pre><code>java -jar app.jar --jasypt.encryptor.password={{ displayGuideKey }}</code></pre>
          </div>
        </div>
      </div>

      <!-- 에러 배너 -->
      <div v-if="errorMessage" class="inline-error-banner">
        <span>{{ errorMessage }}</span>
      </div>

      <!-- 에디터 그리드 (좌우 대칭 2열) -->
      <div class="diff-input-grid jasypt-editor-grid">
        <!-- Input 패널 -->
        <div class="input-panel">
          <div class="input-panel-header">
            <span class="panel-title">{{ mode === 'encrypt' ? 'Plain Text' : 'Encrypted Text' }}</span>
            <span class="char-count">{{ inputText.length.toLocaleString() }}자</span>
          </div>
          <textarea
            v-model="inputText"
            class="diff-textarea"
            :placeholder="mode === 'encrypt' ? '암호화할 텍스트를 이곳에 입력하거나 붙여넣으세요.' : '복호화할 암호문 또는 ENC(...)를 이곳에 입력하거나 붙여넣으세요.'"
            @keydown.ctrl.enter.prevent="processAction"
            @keydown.meta.enter.prevent="processAction"
          ></textarea>
        </div>

        <!-- 스왑 버튼 -->
        <div class="swap-action-col">
          <button
            type="button"
            class="swap-btn"
            @click="swapPanes"
            title="결과를 입력창으로 이동하고 모드 전환"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"></path>
            </svg>
          </button>
        </div>

        <!-- Output 패널 -->
        <div class="input-panel">
          <div class="input-panel-header">
            <span class="panel-title">Output</span>
            <div class="panel-actions" v-if="outputText">
              <button
                type="button"
                class="btn-copy-floating"
                @click.prevent="copyText($event, outputText, '클립보드에 복사 되었습니다.')"
              >
                Copy
              </button>
              <button
                v-if="mode === 'encrypt' && !isDigestAlgorithm"
                type="button"
                class="btn-copy-floating btn-enc-copy"
                @click.prevent="copyText($event, formatAsEnc(outputText), 'ENC(...) 포맷이 복사 되었습니다.')"
              >
                ENC Copy
              </button>
            </div>
          </div>

          <!-- Match 검증 뷰 -->
          <div v-if="matchResult !== null && mode === 'decrypt' && decryptAction === 'match'" class="match-pane-view">
            <div class="match-badge" :class="matchResult ? 'match-true' : 'match-false'">
              {{ matchResult ? 'MATCHED' : 'NOT MATCHED' }}
            </div>
            <p class="match-detail">
              {{ matchResult ? '비밀번호 다이제스트가 일치합니다.' : '다이제스트 해시와 일치하지 않습니다.' }}
            </p>
          </div>

          <!-- 일반 결과 뷰 -->
          <textarea
            v-else
            readonly
            class="diff-textarea output-textarea"
            :value="outputText"
            placeholder="Run 버튼을 누르거나 Ctrl+Enter를 입력하세요."
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  encryptJasypt,
  decryptJasypt,
  digestJasypt,
  matchJasypt,
  formatAsEnc,
  type JasyptAlgorithm,
  type JasyptDigestAlgorithm
} from '@/utils/jasypt'
import { showCopyToast } from '@/utils/toast'

useHead({
  title: 'Jasypt Text Encryptor'
})

// 상태 변수
const mode = ref<'encrypt' | 'decrypt'>('encrypt')
const decryptAction = ref<'decrypt' | 'match'>('decrypt')
const selectedAlgorithm = ref<string>('PBEWithMD5AndDES')
const secretKey = ref('')
const showSecret = ref(false)
const inputText = ref('')
const outputText = ref('')
const errorMessage = ref('')
const matchResult = ref<boolean | null>(null)

// 가이드 표시용 비밀키 (마스킹 상태 연동)
const displayGuideKey = computed(() => {
  if (!secretKey.value) return 'yourSecretKey'
  return showSecret.value ? secretKey.value : '•'.repeat(secretKey.value.length)
})

// 다이제스트 알고리즘 여부
const isDigestAlgorithm = computed(() => {
  return ['SHA-256', 'SHA-512', 'MD5'].includes(selectedAlgorithm.value)
})

// 비밀키 필수 여부
const isKeyRequired = computed(() => {
  if (mode.value === 'encrypt') {
    return !isDigestAlgorithm.value
  }
  return true
})

// 실행 가능 여부
const canExecute = computed(() => {
  if (!inputText.value.trim()) return false
  if (isKeyRequired.value && !secretKey.value.trim()) return false
  return true
})

// 모드 전환
function setMode(newMode: 'encrypt' | 'decrypt') {
  mode.value = newMode
  errorMessage.value = ''
  matchResult.value = null
  if (newMode === 'encrypt') {
    selectedAlgorithm.value = 'PBEWithMD5AndDES'
  } else {
    decryptAction.value = 'decrypt'
    selectedAlgorithm.value = 'PBEWithMD5AndDES'
  }
}

// 암복호화 실행
function processAction() {
  errorMessage.value = ''
  matchResult.value = null

  if (!inputText.value.trim()) return
  if (isKeyRequired.value && !secretKey.value.trim()) {
    errorMessage.value = '시크릿 키를 입력해주세요.'
    return
  }

  try {
    if (mode.value === 'encrypt') {
      if (isDigestAlgorithm.value) {
        outputText.value = digestJasypt(inputText.value, {
          algorithm: selectedAlgorithm.value as JasyptDigestAlgorithm
        })
      } else {
        outputText.value = encryptJasypt(inputText.value, secretKey.value, {
          algorithm: selectedAlgorithm.value as JasyptAlgorithm
        })
      }
    } else {
      if (decryptAction.value === 'match') {
        matchResult.value = matchJasypt(secretKey.value, inputText.value, {
          algorithm: selectedAlgorithm.value as JasyptDigestAlgorithm
        })
        outputText.value = matchResult.value ? 'Password matches' : 'Password does not match'
      } else {
        outputText.value = decryptJasypt(inputText.value, secretKey.value, {
          algorithm: selectedAlgorithm.value as JasyptAlgorithm
        })
      }
    }
  } catch (err: any) {
    errorMessage.value = err.message || '처리 중 오류가 발생했습니다.'
    outputText.value = ''
  }
}

// 스왑 기능
function swapPanes() {
  if (!outputText.value) return
  const temp = outputText.value
  inputText.value = temp
  outputText.value = ''
  matchResult.value = null
  errorMessage.value = ''
  setMode(mode.value === 'encrypt' ? 'decrypt' : 'encrypt')
}

// 클립보드 복사
async function copyText(event: MouseEvent, text: string, msg = '클립보드에 복사 되었습니다.') {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    showCopyToast(event, msg)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    showCopyToast(event, msg)
  }
}

// 예시 데이터 로드
function loadSampleData() {
  mode.value = 'encrypt'
  selectedAlgorithm.value = 'PBEWithMD5AndDES'
  secretKey.value = 'SuperSecretKey2026'
  inputText.value = 'jdbc:mysql://localhost:3306/mydb?useSSL=false'
  processAction()
}

// 전체 초기화
function resetAll() {
  inputText.value = ''
  secretKey.value = ''
  outputText.value = ''
  errorMessage.value = ''
  matchResult.value = null
}
</script>

<style scoped>
/* 페이지 너비 확장 */
.jasypt-page-wrapper {
  max-width: 1360px !important;
  width: 100%;
}

/* Diff 페이지 규격 기반 레이아웃 */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.control-left {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-shrink: 0;
}

.control-left .action-btn {
  padding: 0.48rem 0.8rem;
  font-size: 0.83rem;
  white-space: nowrap;
}

.control-right {
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
  max-width: 100%;
}

.mode-tabs {
  display: flex;
  background: var(--chip-bg);
  border-radius: 8px;
  padding: 2px;
  border: 1px solid var(--nav-border);
  flex-shrink: 0;
}

.tab-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.tab-btn.active {
  background: #3b82f6;
  color: #ffffff;
}

/* 툴바 폼 요소 */
.toolbar-select {
  background: var(--input-bg);
  border: 1px solid var(--nav-border);
  color: var(--text-main);
  border-radius: 8px;
  padding: 5px 6px;
  font-size: 0.78rem;
  outline: none;
  flex-shrink: 1;
  min-width: 0;
}

.toolbar-select option {
  background-color: #0f172a;
  color: #f1f5f9;
}

:deep([data-bs-theme="light"]) .toolbar-select option,
[data-bs-theme="light"] .toolbar-select option {
  background-color: #ffffff;
  color: #0f172a;
}

.algo-select {
  max-width: 142px;
  min-width: 90px;
  text-overflow: ellipsis;
}

.decrypt-action-select {
  min-width: 64px;
  flex-shrink: 0;
}

.key-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 1;
  min-width: 0;
}

.key-input {
  background: var(--input-bg);
  border: 1px solid var(--nav-border);
  color: var(--text-main);
  border-radius: 8px;
  padding: 5px 22px 5px 8px;
  font-size: 0.78rem;
  width: 130px;
  min-width: 75px;
  outline: none;
  transition: border-color 0.2s ease, width 0.2s ease;
}

.key-input:focus {
  border-color: #3b82f6;
}

.key-eye-btn {
  position: absolute;
  right: 6px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
}

.key-eye-btn:hover {
  color: #cbd5e1;
}

.run-btn {
  padding: 0.48rem 0.95rem;
  font-size: 0.83rem;
}

/* 에디터 그리드 */
.jasypt-editor-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: stretch;
}

@media (max-width: 860px) {
  .jasypt-editor-grid {
    grid-template-columns: 1fr;
  }
}

.output-textarea {
  color: #38bdf8;
}

.panel-actions {
  display: flex;
  gap: 6px;
}

/* 스왑 버튼 열 */
.swap-action-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.swap-btn {
  background: var(--nav-bg);
  border: 1px solid var(--nav-border);
  color: var(--nav-text);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.swap-btn:hover {
  background: var(--nav-hover-bg);
  color: var(--nav-active-text);
  border-color: var(--nav-active-text);
  transform: rotate(180deg);
}

@media (max-width: 860px) {
  .swap-btn {
    transform: rotate(90deg);
  }
}

/* 접이식 가이드 패널 */
.guide-collapsible {
  background: var(--card-header-bg);
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 1.25rem;
  backdrop-filter: var(--glass-card-blur);
  -webkit-backdrop-filter: var(--glass-card-blur);
}

.guide-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 768px) {
  .guide-content {
    grid-template-columns: 1fr;
  }
}

.guide-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.guide-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
}

.guide-col pre {
  margin: 0;
  background: var(--code-bg);
  border: 1px solid var(--code-border);
  border-radius: 6px;
  padding: 8px 12px;
  overflow-x: auto;
  transition: background-color 0.25s ease, border-color 0.25s ease;
  backdrop-filter: var(--glass-card-blur);
  -webkit-backdrop-filter: var(--glass-card-blur);
}

.guide-col code {
  font-family: 'Fira Code', Consolas, Monaco, monospace;
  font-size: 0.78rem;
  color: var(--code-text);
  white-space: pre-wrap;
  word-break: break-all;
  transition: color 0.25s ease;
}

:deep([data-bs-theme="light"]) .guide-collapsible,
[data-bs-theme="light"] .guide-collapsible {
  background: var(--card-header-bg);
  border-color: var(--nav-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

:deep([data-bs-theme="light"]) .guide-label,
[data-bs-theme="light"] .guide-label {
  color: var(--text-muted);
}

:deep([data-bs-theme="light"]) .guide-col pre,
[data-bs-theme="light"] .guide-col pre {
  background: var(--code-bg) !important;
  border-color: var(--code-border) !important;
}

:deep([data-bs-theme="light"]) .guide-col code,
[data-bs-theme="light"] .guide-col code {
  color: var(--code-text) !important;
}

:deep([data-bs-theme="light"]) .output-textarea,
[data-bs-theme="light"] .output-textarea {
  color: #0284c7;
}



/* 에러 배너 */
.inline-error-banner {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  margin-bottom: 1rem;
}

/* 일치 검증 뷰 */
.match-pane-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 380px;
  gap: 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.match-badge {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 6px 18px;
  border-radius: 9999px;
}

.match-true {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.4);
  color: #34d399;
}

.match-false {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.match-detail {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
}

/* Copy button */
.btn-copy-floating {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #34d399;
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-copy-floating:hover {
  background: rgba(52, 211, 153, 0.2);
  transform: translateY(-1px);
}

.btn-enc-copy {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.35);
  color: #a5b4fc;
}

.btn-enc-copy:hover {
  background: rgba(99, 102, 241, 0.25);
}
</style>
