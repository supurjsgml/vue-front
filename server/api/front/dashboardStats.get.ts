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
    const dateInSeoul = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const keys: string[] = []
    const displayDays: string[] = []

    for (let i = 13; i >= 0; i--) {
      const d = new Date(dateInSeoul)
      d.setDate(dateInSeoul.getDate() - i)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')

      keys.push(`visitor_count:${yyyy}-${mm}-${dd}`)

      if (i < 7) {
        if (i === 0) {
          displayDays.push("오늘")
        } else {
          displayDays.push(dd)
        }
      }
    }

    const response = await $fetch<any>(`${redisUrl}/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json'
      },
      body: ["MGET", ...keys]
    })

    if (response?.error) {
      throw new Error(response.error)
    }

    const rawValues = response?.result || []
    const allValues = rawValues.map((val: any) => val !== null && val !== undefined ? parseInt(val, 10) : 0)

    const prevWeekValues = allValues.slice(0, 7)
    const thisWeekValues = allValues.slice(7, 14)

    const prevWeekTotal = prevWeekValues.reduce((acc: number, val: number) => acc + val, 0)
    const thisWeekTotal = thisWeekValues.reduce((acc: number, val: number) => acc + val, 0)

    let trend = "0%"
    let trendDirection = "up"

    if (prevWeekTotal > 0) {
      const percent = ((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100
      const rounded = Math.round(percent)
      trend = `${rounded >= 0 ? '+' : ''}${rounded}%`
      trendDirection = percent >= 0 ? "up" : "down"
    } else if (thisWeekTotal > 0) {
      trend = "100%"
      trendDirection = "up"
    }

    return {
      success: true,
      message: "성공",
      data: {
        label: "주간 방문자 (1주)",
        value: thisWeekTotal.toLocaleString('en-US'),
        description: "껄껄",
        trend: trend,
        trendDirection: trendDirection,
        sparklineValues: thisWeekValues,
        days: displayDays
      }
    }
  } catch (error: any) {
    console.error("Redis 방문자 데이터 조회 중 오류 발생:", error)
    return {
      success: false,
      message: error.message || "오류가 발생했습니다.",
      data: {
        label: "주간 방문자 (1주)",
        value: "0",
        description: "오류가 발생했습니다.",
        trend: "0%",
        trendDirection: "up",
        sparklineValues: [0, 0, 0, 0, 0, 0, 0],
        days: ['--', '--', '--', '--', '--', '--', '오늘']
      }
    }
  }
})
