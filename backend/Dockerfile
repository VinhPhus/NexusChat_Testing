FROM node:18-alpine

WORKDIR /app

# Copy các file config của npm trước để tận dụng cache của Docker
COPY package*.json ./

# Cài đặt thư viện (production mode)
RUN npm install

# Copy toàn bộ mã nguồn vào
COPY . .

# Port mà backend đang chạy
EXPOSE 5000

# Lệnh khởi động server
CMD ["npm", "start"]
