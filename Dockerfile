FROM node:18-alpine

ENV NODE_VERSION 18.14.0

WORKDIR /app

COPY package*.json ./

RUN npm install -g mongoose
RUN npm install

# Copy the rest of the files
COPY . .

CMD ["npm", "start"]