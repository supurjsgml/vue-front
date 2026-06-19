<template>
    <div class="converter-wrapper">
        <div class="converter-header">
            <h1 class="gradient-title">구글 docs 다운로드 링크 변환</h1>
            <p class="description-text">홀랠릴랠룰</p>
        </div>

        <div class="glass-card instruction-card">
            <div class="card-header-custom">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="icon-info" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                <h2>사용법</h2>
            </div>
            <p class="instruction-text">알아서 잘 변환하라</p>
        </div>

        <form name="conf" class="glass-card form-card">
            <div class="editor-grid">
                <div class="editor-card">
                    <div class="editor-header">
                        <span>구글파일 링크</span>
                    </div>
                    <textarea class="code-textarea" @keyup="convertLinks(googleFileLinks)" v-model="googleFileLinks" placeholder="여기에 구글 드라이브 파일 링크를 입력하세요..."></textarea>
                </div>
                <div class="editor-card">
                    <div class="editor-header">
                        <span>다운로드 링크</span>
                        <button class="btn-copy-floating" @click.prevent="copyToClipboard($event)">링크복사</button>
                    </div>
                    <textarea class="code-textarea output-area" readonly placeholder="변환된 링크가 여기에 표시됩니다...">{{ downloadLinks.join('\n') }}</textarea>
                </div>
            </div>
        </form>
    </div>
</template>
  
<script setup lang="ts">

import { ref } from 'vue';

const googleFileLinks = ref('');
const downloadLinks = ref<string[]>([]);

// N건 변환
function convertLinks(param: string) {
    // 입력된 텍스트를 줄 단위로 나눔
    const links = param.split('\n');
    const regex = /file\/d\/([\w-]+)/;

    // 각 링크에 대해 다운로드 링크 생성
    downloadLinks.value = links.map(link => {
        const match = link.match(regex);
        if (match && match[1]) {
            return `https://drive.usercontent.google.com/download?id=${match[1]}`;
        } else {
            return "유효하지 않은 링크: " + link;
        }
    });
}

// 클립보드로 복사
function copyToClipboard(event: MouseEvent) {
    const text = downloadLinks.value.join('\n');
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        showCopyToast(event, '복사 완료!');
    }).catch(err => {
        showCopyToast(event, '복사 실패: ' + err);
    });
}

</script>

<style scoped>
.converter-wrapper {
  padding: 10px;
}

.converter-header {
  margin-bottom: 2rem;
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
}

.description-text {
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.6;
}

.glass-card {
  background: var(--card-bg);
  border: 1px solid var(--nav-border);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  margin-bottom: 24px;
}

.card-header-custom {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--nav-border);
  padding-bottom: 12px;
}

.card-header-custom h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
}

.icon-info {
  color: var(--nav-active-text);
}

.instruction-text {
  font-size: 0.95rem;
  color: var(--text-main);
  margin: 0;
}

.form-card {
  padding: 24px;
}

/* Inherits editor styles from ui.css */

/* Copy button */
.btn-copy-floating {
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.3);
  color: #60a5fa;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-copy-floating:hover {
  background: rgba(96, 165, 250, 0.2);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .editor-grid {
    flex-direction: column;
  }
}
</style>
  