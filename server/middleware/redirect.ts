import { defineEventHandler, H3Event } from 'h3';

export default defineEventHandler((event: H3Event) => {
  const req = event.node.req;
  const res = event.node.res;

  // 요청된 도메인 확인
  const host = req.headers.host;

  // 리다이렉트 조건 설정
  if (host === 'vue-front-807ffc6b572e.herokuapp.com') {
    // 리다이렉트 설정
    res.writeHead(301, { Location: process.env.BASE_URL });
    res.end();
  }
});