export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error: unknown, instance: any, info: string) => {
    console.error('[Client Error Handler]', error);
    reportError({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      component: instance?.$options?.name || instance?.$options?.__name || 'anonymous',
      info,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    });
  };

  if (import.meta.client) {
    window.addEventListener('unhandledrejection', (event) => {
      reportError({
        message: event.reason instanceof Error ? event.reason.message : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
        type: 'unhandledrejection',
        url: window.location.href
      });
    });

    window.addEventListener('error', (event) => {
      reportError({
        message: event.message || 'Window Script Error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error instanceof Error ? event.error.stack : undefined,
        type: 'uncaughtException',
        url: window.location.href
      });
    });
  }
});

function reportError(payload: Record<string, any>) {
  try {
    const data = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/front/log', data);
    } else {
      fetch('/api/front/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true
      }).catch(() => {});
    }
  } catch {
    // 에러 보고 중 발생하는 추가 예외 무시
  }
}
