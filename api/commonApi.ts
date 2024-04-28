const post = (data: object) => $fetch.create({
    baseURL: useRuntimeConfig().public.apiBase, // baseURL
    headers: {
      'Content-Type': 'application/json',
    },
    method:'POST',
    body: { data },
    timeout: 5000 // 요청 타임아웃 설정 (5초)
});