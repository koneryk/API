FROM node:24.11-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY ./dist ./dist

# ИСПРАВЛЕНО: start:dev (с двоеточием)
CMD ["npm", "run", "start:dev"]