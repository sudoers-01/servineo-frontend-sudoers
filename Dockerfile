FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
ARG NEXT_PUBLIC_BACKEND_BASE_URL
ENV NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL
RUN npm install --frozen-lockfile || npm install
COPY . .
RUN npm run build


FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
