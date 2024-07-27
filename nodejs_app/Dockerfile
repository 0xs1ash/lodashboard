FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g nodemon && npm install

COPY . .

COPY create-flag.sh /usr/src/app/create-flag.sh
RUN chmod +x /usr/src/app/create-flag.sh

EXPOSE 8000

CMD ["sh", "/usr/src/app/create-flag.sh"]
