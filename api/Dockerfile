FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json tsoa.json ./

RUN npm ci --no-audit --no-fund

COPY src/ ./src/

RUN npm run build

FROM node:20-alpine

RUN apk --no-cache add curl && \
     addgroup -g 1001 nodejs && \
     adduser -S -u 1001 -G nodejs nodejs

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

RUN npm ci --omit=dev --no-audit --no-fund && \
     npm cache clean --force && \
     chown -R nodejs:nodejs /app

USER nodejs

ENV NODE_ENV=production \
     PORT=3000

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
     CMD curl -f http://localhost:$PORT/health || exit 1

CMD ["node", "build/app.js"]