import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig(event)
  const backendUrl = config.public.restApi || 'http://localhost:8080'

  try {
    const body = await readBody(event)
    const data = await $fetch<any>(`${backendUrl}/api/front/hit`, {
      method: 'POST',
      body: body
    })
    return data
  } catch (error: any) {
    console.error("백엔드 방문자 카운트 증가 중 오류 발생:", error)
    return {
      success: false,
      message: error.message || "오류가 발생했습니다.",
      data: null
    }
  }
})
