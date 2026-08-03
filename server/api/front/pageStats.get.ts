import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig(event)
  const backendUrl = config.public.restApi || 'http://localhost:8080'

  try {
    const data = await $fetch<any>(`${backendUrl}/api/front/pageStats`, {
      method: 'GET'
    })
    return data
  } catch (error: any) {
    console.error("백엔드 페이지 방문자 조회 중 오류 발생:", error)
    return {
      success: false,
      message: error.message || "오류가 발생했습니다.",
      data: {
        Main: 0,
        Camel: 0,
        Translate: 0,
        Google: 0
      }
    }
  }
})
