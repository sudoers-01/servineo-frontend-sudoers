FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=https://api.servineo.app
RUN npm install --frozen-lockfile || npm install
COPY . .
RUN npm run build


FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=https://api.servineo.app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
