FROM node:20-alpine AS builder

WORKDIR /

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src/ ./src/

RUN npm run build

FROM node:20-alpine

RUN apk --no-cache add curl

RUN addgroup -g 1001 nodejs && \
     adduser -S -u 1001 -G nodejs nodejs

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build

RUN npm ci --omit=dev && \
     chown -R nodejs:nodejs /app

USER nodejs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
     CMD curl -f http://localhost:$PORT/health || exit 1

CMD ["node", "build/app.js"]