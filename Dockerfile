# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
# คัดลอกเฉพาะไฟล์ที่เกี่ยวกับ backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist

# กำหนด Port สำหรับ Fly.io
EXPOSE 3000
ENV PORT=3000
CMD ["node", "dist/index.js"]
