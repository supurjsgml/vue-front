import { defineEventHandler, setResponseStatus, setHeader } from 'h3'  

export default defineEventHandler(async (event) => {  
  const res = await fetch(`https://supurjsgml.grafana.net${event.path}`)  

  if (res.status === 401) {  
    setResponseStatus(event, 200)  
    setHeader(event, 'content-type', 'application/json')  
    return '{"jsonData":{},"secureJsonFields":{}}'  
  }  

  setResponseStatus(event, res.status)  
  return res.text()  
})  