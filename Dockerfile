FROM node:10-slim

RUN curl https://intoli.com/install-google-chrome.sh | bash

copy package.json .

RUN npm install

COPY server.js .

EXPOSE 8080

CMD ["node", "server.js"]