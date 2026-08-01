import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig(event)
  const backendUrl = config.public.restApi || 'http://localhost:8080'

  try {
    const data = await $fetch<any>(`${backendUrl}/api/front/dashboardStats`, {
      method: 'GET'
    })
    return data
  } catch (error: any) {
    console.error("방문자 데이터 조회 중 오류 발생:", error)
    return {
      success: false,
      message: error.message || "오류가 발생했습니다.",
      data: {
        label: "주간 방문자 (1주)",
        value: "0",
        description: "백엔드 연동 전",
        trend: "0%",
        trendDirection: "up",
        sparklineValues: [0, 0, 0, 0, 0, 0, 0],
        days: ['--', '--', '--', '--', '--', '--', '오늘']
      }
    }
  }
})
