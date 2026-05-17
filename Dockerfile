# Giai đoạn 1: Build ứng dụng
FROM node:20-slim AS builder

WORKDIR /app

# Các biến môi trường cần thiết cho quá trình Build (Vite)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GEMINI_API_KEY
ARG VITE_DEEPSEEK_API_KEY
ARG VITE_AI_PROVIDER

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_DEEPSEEK_API_KEY=$VITE_DEEPSEEK_API_KEY
ENV VITE_AI_PROVIDER=$VITE_AI_PROVIDER

# Sao chép file cấu hình và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Sao chép toàn bộ mã nguồn và build
COPY . .
RUN npm run build


# Giai đoạn 2: Phục vụ ứng dụng bằng Nginx (Nhẹ và bảo mật)
FROM nginx:alpine

# Sao chép kết quả build từ giai đoạn 1 vào thư mục phục vụ của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Cấu hình Nginx để hỗ trợ React Router (Xử lý lỗi 404 khi reload trang)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
