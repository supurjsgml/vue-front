import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig(event)
  const redisUrl = config.redisRestUrl
  const redisToken = config.redisRestToken
  const redisTtl = config.redisTtl ? String(config.redisTtl) : ""

  if (!redisUrl || !redisToken) {
    console.error("Missing Upstash Redis config in Nuxt runtimeConfig.")
    return {
      success: false,
      message: "Upstash Redis credentials are not configured.",
      data: null
    }
  }

  try {
    const body = await readBody(event)
    const pageName = body?.pageName
    const isNewSession = body?.isNewSession

    // Get today's date in Asia/Seoul timezone formatted as yyyy-MM-dd
    const dateInSeoul = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const yyyy = dateInSeoul.getFullYear();
    const mm = String(dateInSeoul.getMonth() + 1).padStart(2, '0');
    const dd = String(dateInSeoul.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const commands: string[][] = []
    
    // 1. 페이지별 누적 방문수 증가 (항상 실행, 단 pageName이 유효할 때만)
    if (pageName && pageName.trim() !== '') {
      commands.push(["HINCRBY", "page_visits", pageName.trim(), "1"])
      if (redisTtl) {
        commands.push(["EXPIRE", "page_visits", redisTtl])
      }
    }

    // 2. 신규 세션일 경우 일자별 전체 방문수 증가
    if (isNewSession) {
      commands.push(["INCR", `visitor_count:${todayStr}`])
      if (redisTtl) {
        commands.push(["EXPIRE", `visitor_count:${todayStr}`, redisTtl])
      }
    }

    if (commands.length > 0) {
      const response = await $fetch<any>(`${redisUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json'
        },
        body: commands
      })

      // Upstash pipeline returns an array of results, check if any command failed
      if (Array.isArray(response)) {
        for (const res of response) {
          if (res?.error) {
            throw new Error(res.error)
          }
        }
      } else if (response?.error) {
        throw new Error(response.error)
      }
    }

    return {
      success: true,
      message: "성공",
      data: null
    }
  } catch (error: any) {
    console.error("Redis 방문자 카운트 증가 중 오류 발생:", error)
    return {
      success: false,
      message: error.message || "오류가 발생했습니다.",
      data: null
    }
  }
})
