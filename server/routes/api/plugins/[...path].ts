import { defineEventHandler, setResponseStatus, setHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const targetHost = config.public.grafanaUrl || process.env.GRAFANA_URL
  const res = await fetch(`${targetHost}${event.path}`)

  if (res.status === 401) {
    setResponseStatus(event, 200)
    setHeader(event, 'content-type', 'application/json')
    return '{"jsonData":{},"secureJsonFields":{}}'
  }

  setResponseStatus(event, res.status)
  return res.text()
})  