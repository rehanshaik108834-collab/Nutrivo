FROM node:18-slim

RUN useradd -m -u 1000 user
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN chown -R user:user /app
USER user

EXPOSE 7860

CMD ["node", "server.js"]
