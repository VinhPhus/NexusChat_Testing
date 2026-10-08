FROM node:20

WORKDIR /app

# Chỉ copy package.json (cố tình bỏ qua package-lock.json để tránh xung đột hệ điều hành Windows vs Linux)
COPY package.json ./

# Cài đặt thư viện với node:20 (bản đầy đủ, không dùng alpine để tránh 100% lỗi C++)
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
