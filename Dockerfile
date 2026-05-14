# Sử dụng Python phiên bản ổn định
FROM python:3.11-slim

# Thiết lập thư mục làm việc trong máy chủ
WORKDIR /app

# Sao chép file danh sách thư viện vào
COPY requirements.txt .

# Cài đặt các thư viện cần thiết
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép toàn bộ code vào máy chủ
COPY . .

# Lệnh để chạy ứng dụng (ví dụ dùng Streamlit)
CMD ["streamlit", "run", "app.py", "--server.port=10000", "--server.address=0.0.0.0"]
