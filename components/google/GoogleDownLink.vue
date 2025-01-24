<template>
    <div>
      <h2>사용법</h2>
          <ol>
              <p>알아서 잘 변환하라</p>
          </ol>
          <form name="conf">
              <fieldset>
                  <legend>Configurations</legend>
                  <p>
                      <strong>구글파일 링크</strong>
                      <br>
                      <textarea style="width: 670px; height: 230px;" @keyup="convertLinks(googleFileLinks)" v-model="googleFileLinks"></textarea>
                  </p>
                  <p>
                      <strong>다운로드 링크</strong>
                      <br>
                      <textarea style="width: 670px; height: 230px;" readonly>{{ downloadLinks.join('\n') }}</textarea>
                      <button class="btn btn-primary" style="margin-left: 10px;" @click.prevent="copyToClipboard">링크복사</button>
                  </p>
              </fieldset>
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
  function copyToClipboard() {
      const text = downloadLinks.value.join('\n');
      navigator.clipboard.writeText(text).then(() => {
          alert('다운로드 링크가 클립보드에 복사되었습니다.');
      }).catch(err => {
          alert('복사에 실패했습니다: ' + err);
      });
  }
  
  </script>
  
  <style>
  
  </style>
  