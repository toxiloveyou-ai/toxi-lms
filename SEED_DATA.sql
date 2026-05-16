-- XÓA CÁC KHÓA HỌC CŨ (Nếu muốn làm sạch trước khi thêm)
-- TRUNCATE TABLE public.courses CASCADE;

-- THÊM DỮ LIỆU MẪU VÀO BẢNG COURSES
INSERT INTO public.courses (title, description, level, status) VALUES 
(
  'Tiếng Trung Giao Tiếp (HSK 1-2)', 
  'Khóa học dành cho người mới bắt đầu, tập trung vào kỹ năng nghe nói cơ bản, phát âm chuẩn và từ vựng giao tiếp hàng ngày.',
  'Cơ bản',
  'active'
),
(
  'Tiếng Trung Tổng Hợp (HSK 3-4)', 
  'Nâng cao toàn diện 4 kỹ năng Nghe - Nói - Đọc - Viết. Đủ năng lực thi chứng chỉ HSK 4 và giao tiếp thành thạo trong môi trường công sở.',
  'Trung cấp',
  'active'
),
(
  'Luyện Thi HSK 5-6 Chuyên Sâu', 
  'Chương trình luyện thi cường độ cao, chiến thuật làm bài chuẩn xác. Hệ thống đề thi thử bám sát đề thi thật.',
  'Nâng cao',
  'active'
),
(
  'Tiếng Trung Thương Mại', 
  'Khóa học thiết kế riêng cho người đi làm, đàm phán hợp đồng, từ vựng chuyên ngành xuất nhập khẩu và kinh doanh.',
  'Ứng dụng',
  'active'
),
(
  'Tiếng Trung Trẻ Em', 
  'Phương pháp học thông qua trò chơi và bài hát, giúp bé tiếp xúc với tiếng Trung một cách tự nhiên và vui vẻ nhất.',
  'Trẻ em',
  'active'
);
