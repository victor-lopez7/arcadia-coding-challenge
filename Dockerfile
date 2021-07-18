FROM node:lts
WORKDIR /home/node/app
COPY package.json ./
COPY . .
RUN npm install
RUN npm run build

ENV PORT=3000
EXPOSE 3000

CMD [ "node", "./dist/backend/server.arcadia-coding-challenge.js" ]