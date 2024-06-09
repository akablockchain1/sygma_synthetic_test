# Stage 1: Build stage
FROM node:20 as build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Production stage
FROM node:20

WORKDIR /usr/src/app
COPY --from=build /usr/src/app /usr/src/app
ENV NODE_ENV production
CMD ["node", "index.js"]

EXPOSE 3000
