FROM node:22-alpine

WORKDIR /app

COPY . .

# Încărcăm codul Worker ca modul JavaScript.
RUN cp src/index.js worker.mjs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.mjs"]
