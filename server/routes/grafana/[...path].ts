import { defineEventHandler, setHeader, setResponseStatus, getRequestHeaders } from 'h3'

export default defineEventHandler(async (event) => {
  const path = event.path.replace(/^\/grafana/, '') || '/'
  const targetUrl = `https://supurjsgml.grafana.net${path}`

  const reqHeaders = { ...getRequestHeaders(event) }
  delete reqHeaders['host']

  const res = await fetch(targetUrl, {
    method: event.method,
    headers: reqHeaders as HeadersInit,
  })

  // plugin settings 401 → 빈 200으로 대체 (SPA 초기화 실패 방지)  
  if (path.match(/\/api\/plugins\/.+\/settings/) && res.status === 401) {
    setResponseStatus(event, 200)
    setHeader(event, 'content-type', 'application/json')
    return '{"jsonData":{},"secureJsonFields":{}}'
  }

  setResponseStatus(event, res.status)

  const removeHeaders = new Set([
    'x-frame-options', 'content-security-policy',
    'content-security-policy-report-only',
    'transfer-encoding', 'connection', 'content-encoding',
  ])
  res.headers.forEach((val, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      setHeader(event, key, val.replace(/;\s*domain=[^;]*/gi, ''))
    } else if (!removeHeaders.has(key.toLowerCase())) {
      setHeader(event, key, val)
    }
  })

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('text/html')) {
    let html = await res.text()

    const interceptor = `<script>  
    (function(){  
      var p = window.location.pathname;  
      if(p.indexOf('/grafana') === 0) history.replaceState({}, '', p.slice(8) || '/');  
      var B='/grafana';  
      var _f=window.fetch;  
      window.fetch=function(u,o){  
        if(typeof u==='string'&&u.startsWith('/')&&!u.startsWith(B))u=B+u;  
        return _f.call(this,u,o);  
      };  
      var _x=XMLHttpRequest.prototype.open;  
      XMLHttpRequest.prototype.open=function(){  
        var a=[].slice.call(arguments);  
        if(typeof a[1]==='string'&&a[1].startsWith('/')&&!a[1].startsWith(B))a[1]=B+a[1];  
        return _x.apply(this,a);  
      };  
    })();  
    </script>`

    html = html.replace(/<head>/i, '<head>' + interceptor)
    setHeader(event, 'content-type', 'text/html; charset=utf-8')
    return html
  }

  return Buffer.from(await res.arrayBuffer())
})  