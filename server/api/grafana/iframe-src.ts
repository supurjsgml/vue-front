export default defineEventHandler((event) => {
  const query = getQuery(event)
  const type = (query.type as string) || 'batch'

  if (type === 'api') {
    return '/grafana/public-dashboards/8b13cbddd7b34084ac9cf50a0524ce50?from=now-24h&to=now&timezone=browser&refresh=10s'
  }
  return '/grafana/public-dashboards/6db3adcb8b00421589797ad121289dd1?from=now-24h&to=now&timezone=browser&refresh=10s'
})