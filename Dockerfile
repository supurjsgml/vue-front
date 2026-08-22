FROM node:22-alpine
WORKDIR /app

COPY .output .output
COPY package.json .

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["node", ".output/server/index.mjs"]
