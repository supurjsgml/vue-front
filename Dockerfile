FROM node:22-slim
WORKDIR /app

# sharp 이미지 변환 엔진 설치
COPY package.json .
RUN npm install sharp --omit=dev

# Nuxt 3 빌드 산출물 복사
COPY .output .output

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["node", ".output/server/index.mjs"]

