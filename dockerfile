FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -f

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm","run","dev"]