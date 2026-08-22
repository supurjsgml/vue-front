FROM node:22-slim
WORKDIR /app

# Nuxt 3 빌드 산출물 복사
COPY .output .output
COPY package.json .

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["node", ".output/server/index.mjs"]

