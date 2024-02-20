FROM node:20.11.0
RUN npm install -g nodemon
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 4040
CMD ["npm", "run", "start:dev"]
