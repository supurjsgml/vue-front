// 커스터마이징된 fetch 인스턴스를 생성하는 함수
export default async function fetch(url: string, method: any,  data: object, resType: any) {
    return await $fetch(useRuntimeConfig().public.restApi.concat(url) , {
        method: method,
        headers: {
            'Content-Type':'application/json'
          // authorization : 'token',
        },
        body: { data },
        responseType : resType,
        timeout: 5000 // 요청 타임아웃 설정 (5초)
    });
  }