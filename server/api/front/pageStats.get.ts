import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig(event)
  const redisUrl = config.redisRestUrl
  const redisToken = config.redisRestToken

  if (!redisUrl || !redisToken) {
    console.error("Missing Upstash Redis config in Nuxt runtimeConfig.")
    return {
      success: false,
      message: "Upstash Redis credentials are not configured.",
      data: null
    }
  }

  try {
    const response = await $fetch<any>(`${redisUrl}/hgetall/page_visits`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${redisToken}`
      }
    })

    if (response?.error) {
      throw new Error(response.error)
    }

    const result = response?.result || []
    
    // Initialize visits structure matching PageVisitsDTO keys (exactly matching casing)
    const pageVisits = {
      Main: 0,
      Camel: 0,
      Grafana: 0,
      Google: 0,
      Stats: 0
    }

    if (Array.isArray(result)) {
      for (let i = 0; i < result.length; i += 2) {
        const field = result[i]
        const value = parseInt(result[i + 1], 10) || 0
        if (field in pageVisits) {
          pageVisits[field as keyof typeof pageVisits] = value
        }
      }
    }

    return {
      success: true,
      message: "성공",
      data: pageVisits
    }
  } catch (error: any) {
    console.error("Redis 페이지 방문자 조회 중 오류 발생:", error)
    return {
      success: false,
      message: error.message || "오류가 발생했습니다.",
      data: {
        Main: 0,
        Camel: 0,
        Grafana: 0,
        Google: 0,
        Stats: 0
      }
    }
  }
})
