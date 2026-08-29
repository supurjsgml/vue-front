export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    event.context._startTime = Date.now();
  });

  nitroApp.hooks.hook('afterResponse', (event) => {
    const path = event.path || '';
    if (
      path === '/healthz' ||
      path.startsWith('/_nuxt') ||
      path.startsWith('/public') ||
      path.startsWith('/api/front/log') ||
      path === '/favicon.ico'
    ) {
      return;
    }

    const userAgent = (getRequestHeader(event, 'user-agent') || '').toLowerCase();
    if (
      userAgent.includes('kube-probe') ||
      userAgent.includes('go-http-client') ||
      userAgent.includes('healthcheck')
    ) {
      return;
    }

    const duration = Date.now() - (event.context._startTime || Date.now());
    const method = event.method || 'GET';
    const status = getResponseStatus(event);

    logInfo(`[HTTP] ${method} ${path} - ${status} (${duration}ms)`, {
      method,
      path,
      status,
      durationMs: duration,
      userAgent: getRequestHeader(event, 'user-agent') || 'none'
    });
  });

  nitroApp.hooks.hook('error', (error: any, { event }) => {
    const path = event?.path || 'unknown';
    logError(`[Server Error] ${path}: ${error?.message || error}`, {
      path,
      stack: error?.stack
    });
  });
});
