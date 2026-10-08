FROM node:18-alpine

WORKDIR /app

# Cài đặt các công cụ biên dịch mã nguồn C++ (bắt buộc cho thư viện bcrypt)
RUN apk add --no-cache python3 make g++

COPY package*.json ./

# Cài đặt thư viện
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
