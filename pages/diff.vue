<template>
  <div class="diff-page-wrapper">
    <!-- 상단 헤더 -->
    <div class="diff-header">
      <h1 class="gradient-title">Text Diff Checker</h1>
      <p class="description-text">원본 텍스트와 수정된 텍스트의 차이점을 한눈에 비교해보세요.</p>
    </div>

    <!-- 메인 입력 카드 -->
    <div class="diff-card glass-card">
      
      <!-- 컨트롤 바 -->
      <div class="control-bar">
        <div class="control-left">
          <button class="action-btn secondary-btn" @click="loadSampleData">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            예시 데이터
          </button>
          <button class="action-btn secondary-btn" @click="clearInputs">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            초기화
          </button>
        </div>

        <button class="action-btn primary-btn compare-btn" :disabled="!hasContent" @click="openDiffModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 8 16 13"></polyline><line x1="21" y1="8" x2="9" y2="8"></line><polyline points="8 21 3 16 8 11"></polyline><line x1="3" y1="16" x2="15" y2="16"></line></svg>
          Diff 비교하기
        </button>
      </div>

      <!-- 입력 영역 (Original vs Changed) -->
      <div class="diff-input-grid">
        <!-- Original Text Panel -->
        <div class="input-panel">
          <div class="input-panel-header">
            <span class="panel-title">Original Text</span>
            <span class="char-count">{{ originalText.length.toLocaleString() }}자</span>
          </div>
          <textarea
            v-model="originalText"
            placeholder="원본 텍스트를 이곳에 입력하거나 붙여넣으세요..."
            class="diff-textarea"
          ></textarea>
        </div>

        <!-- Changed Text Panel -->
        <div class="input-panel">
          <div class="input-panel-header">
            <span class="panel-title">Changed Text</span>
            <span class="char-count">{{ changedText.length.toLocaleString() }}자</span>
          </div>
          <textarea
            v-model="changedText"
            placeholder="수정되거나 변경된 텍스트를 이곳에 입력하거나 붙여넣으세요..."
            class="diff-textarea"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- 대형 모달 팝업 (Full-screen Wide Modal) -->
    <Teleport to="body">
      <Transition name="fade-modal">
        <div v-if="isModalOpen" class="diff-modal-backdrop" @click.self="closeDiffModal">
          <div class="diff-modal-container" role="dialog" aria-modal="true">
            
            <!-- 모달 헤더 -->
            <div class="modal-header">
              <div class="modal-title-group">
                <h2>Diff 비교 결과</h2>
                <div class="diff-stats-group">
                  <span class="stat-badge removed-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    {{ diffStats.deletions }} 라인 삭제
                  </span>
                  <span class="stat-badge added-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    {{ diffStats.additions }} 라인 추가
                  </span>
                  <span class="stat-badge unchanged-badge">
                    {{ diffStats.unchanged }} 라인 동일
                  </span>
                </div>
              </div>

              <!-- 헤더 우측 컨트롤 (뷰 모드 & 닫기 버튼) -->
              <div class="modal-header-actions">
                <div class="view-mode-toggle">
                  <button 
                    class="mode-btn" 
                    :class="{ active: viewMode === 'split' }"
                    @click="viewMode = 'split'"
                  >
                    나란히 보기 (Split)
                  </button>
                  <button 
                    class="mode-btn" 
                    :class="{ active: viewMode === 'unified' }"
                    @click="viewMode = 'unified'"
                  >
                    통합 보기 (Unified)
                  </button>
                </div>

                <button class="close-modal-btn" @click="closeDiffModal" title="닫기 (ESC)">
                  <span>닫기 (ESC)</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            <!-- 모달 바디 (Diff 뷰어) -->
            <div class="modal-body">
              
              <!-- Split View (Side by Side - 단일 통합 테이블 및 스크롤) -->
              <div v-if="viewMode === 'split'" class="diff-split-view">
                <div class="code-viewport">
                  <table class="diff-table diff-split-table">
                    <colgroup>
                      <col style="width: 45px;" />
                      <col style="width: 24px;" />
                      <col style="width: calc(50% - 69px);" />
                      <col style="width: 45px;" />
                      <col style="width: 24px;" />
                      <col style="width: calc(50% - 69px);" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th colspan="3" class="column-header left-header">Original Text</th>
                        <th colspan="3" class="column-header right-header">Changed Text</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr 
                        v-for="(row, idx) in sideBySideRows" 
                        :key="'split-' + idx"
                        class="diff-row"
                      >
                        <!-- 원본 (Original) -->
                        <td class="line-num" :class="row.left.type">{{ row.left.lineNum || '' }}</td>
                        <td class="line-marker" :class="row.left.type">
                          <span v-if="row.left.type === 'removed'">-</span>
                        </td>
                        <td class="line-content left-content" :class="row.left.type">
                          <pre>{{ row.left.val }}</pre>
                        </td>

                        <!-- 수정본 (Changed) -->
                        <td class="line-num" :class="row.right.type">{{ row.right.lineNum || '' }}</td>
                        <td class="line-marker" :class="row.right.type">
                          <span v-if="row.right.type === 'added'">+</span>
                        </td>
                        <td class="line-content right-content" :class="row.right.type">
                          <pre>{{ row.right.val }}</pre>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Unified View (한 화면에 통합) -->
              <div v-else class="diff-unified-view">
                <div class="code-viewport">
                  <table class="diff-table">
                    <tbody>
                      <tr 
                        v-for="(item, idx) in rawDiffItems" 
                        :key="'unified-' + idx"
                        :class="['diff-row', item.type]"
                      >
                        <td class="line-num line-num-a">{{ item.lineA || '' }}</td>
                        <td class="line-num line-num-b">{{ item.lineB || '' }}</td>
                        <td class="line-marker">
                          <span v-if="item.type === 'added'">+</span>
                          <span v-else-if="item.type === 'removed'">-</span>
                        </td>
                        <td class="line-content">
                          <pre>{{ item.val }}</pre>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const originalText = ref('');
const changedText = ref('');
const isModalOpen = ref(false);
const viewMode = ref<'split' | 'unified'>('split');

const hasContent = computed(() => {
  return originalText.value.trim().length > 0 || changedText.value.trim().length > 0;
});

const clearInputs = () => {
  originalText.value = '';
  changedText.value = '';
};

const loadSampleData = () => {
  originalText.value = `const userInfo = {
  id: 1001,
  name: "Hong Gildong",
  email: "gildong@example.com",
  role: "user",
  status: "active",
  lastLogin: "2026-07-20"
};

function processUser(user) {
  console.log("Processing:", user.name);
  return user.status === "active";
}`;

  changedText.value = `const userInfo = {
  id: 1001,
  name: "Hong Gildong",
  email: "gildong@newdomain.com",
  role: "admin",
  status: "active",
  department: "Development",
  lastLogin: "2026-08-01"
};

function processUser(user) {
  console.log("Processing admin:", user.name);
  if (!user) return false;
  return user.status === "active";
}`;
};

interface RawDiffItem {
  type: 'added' | 'removed' | 'unchanged';
  lineA?: number;
  lineB?: number;
  val: string;
}

interface SideBySideRow {
  left: { lineNum?: number; val: string; type: 'removed' | 'unchanged' | 'empty' };
  right: { lineNum?: number; val: string; type: 'added' | 'unchanged' | 'empty' };
}

const rawDiffItems = ref<RawDiffItem[]>([]);
const sideBySideRows = ref<SideBySideRow[]>([]);
const diffStats = ref({ deletions: 0, additions: 0, unchanged: 0 });

const computeDiff = () => {
  const linesA = originalText.value.split('\n');
  const linesB = changedText.value.split('\n');
  const n = linesA.length;
  const m = linesB.length;

  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (linesA[i - 1] === linesB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = n;
  let j = m;
  const rawList: RawDiffItem[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      rawList.push({ type: 'unchanged', lineA: i, lineB: j, val: linesA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawList.push({ type: 'added', lineB: j, val: linesB[j - 1] });
      j--;
    } else {
      rawList.push({ type: 'removed', lineA: i, val: linesA[i - 1] });
      i--;
    }
  }

  rawList.reverse();
  rawDiffItems.value = rawList;

  let deletions = 0;
  let additions = 0;
  let unchanged = 0;
  const rows: SideBySideRow[] = [];
  let idx = 0;

  while (idx < rawList.length) {
    if (rawList[idx].type === 'unchanged') {
      unchanged++;
      rows.push({
        left: { lineNum: rawList[idx].lineA, val: rawList[idx].val, type: 'unchanged' },
        right: { lineNum: rawList[idx].lineB, val: rawList[idx].val, type: 'unchanged' }
      });
      idx++;
    } else {
      const removedList: RawDiffItem[] = [];
      const addedList: RawDiffItem[] = [];

      while (idx < rawList.length && rawList[idx].type !== 'unchanged') {
        if (rawList[idx].type === 'removed') {
          removedList.push(rawList[idx]);
          deletions++;
        } else if (rawList[idx].type === 'added') {
          addedList.push(rawList[idx]);
          additions++;
        }
        idx++;
      }

      const maxLen = Math.max(removedList.length, addedList.length);
      for (let k = 0; k < maxLen; k++) {
        const rem = removedList[k];
        const add = addedList[k];
        rows.push({
          left: rem ? { lineNum: rem.lineA, val: rem.val, type: 'removed' } : { val: '', type: 'empty' },
          right: add ? { lineNum: add.lineB, val: add.val, type: 'added' } : { val: '', type: 'empty' }
        });
      }
    }
  }

  sideBySideRows.value = rows;
  diffStats.value = { deletions, additions, unchanged };
};

const openDiffModal = () => {
  computeDiff();
  isModalOpen.value = true;
};

const closeDiffModal = () => {
  isModalOpen.value = false;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isModalOpen.value) {
    closeDiffModal();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* 전용 스타일은 assets/styles/diff.css 및 ui.css에서 일괄 관리합니다. */
</style>
