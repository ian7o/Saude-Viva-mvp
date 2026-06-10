FROM node:20-alpine AS build

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps && npm cache clean --force

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev && npm cache clean --force

COPY --chown=node:node --from=build /app/dist ./dist

RUN mkdir -p uploads/documents && chown -R node:node uploads

USER node

EXPOSE 4000

CMD ["node", "dist/main"]
