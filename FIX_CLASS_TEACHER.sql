-- ============================================================
-- FIX: Lớp "Tối 2-4-6" không hiển thị cho giáo viên
-- Nguyên nhân: teacher_id sai (ID không tồn tại trong toxi_profiles)
-- ============================================================

-- BƯỚC 1: Xem danh sách giáo viên hiện có để chọn đúng người
SELECT id, full_name, role FROM toxi_profiles WHERE role = 'teacher';

-- BƯỚC 2: Xem thông tin lớp hiện tại
SELECT id, name, teacher_id, status FROM edu_classes WHERE name ILIKE '%2%4%6%';

-- BƯỚC 3: Cập nhật teacher_id đúng cho lớp
-- THAY 'TEACHER_UUID_DUNG' bằng ID thật của giáo viên phụ trách (lấy từ kết quả BƯỚC 1)
UPDATE edu_classes
SET teacher_id = 'TEACHER_UUID_DUNG'
WHERE name ILIKE '%tối%2%4%6%'
   OR name ILIKE '%2%4%6%';

-- BƯỚC 4: Chuyển trạng thái lớp sang 'active' nếu đang là 'upcoming'
UPDATE edu_classes
SET status = 'active'
WHERE name ILIKE '%tối%2%4%6%'
   OR name ILIKE '%2%4%6%';

-- BƯỚC 5: Xác nhận lại sau khi sửa
SELECT 
  c.id, 
  c.name, 
  c.teacher_id, 
  c.status,
  p.full_name AS teacher_name,
  p.role
FROM edu_classes c
LEFT JOIN toxi_profiles p ON p.id = c.teacher_id
WHERE c.name ILIKE '%2%4%6%';

-- BƯỚC 6: Xem học viên trong lớp sau khi sửa
SELECT 
  m.student_id,
  p.full_name,
  p.phone
FROM edu_class_members m
LEFT JOIN toxi_profiles p ON p.id = m.student_id
WHERE m.class_id = 'f81a2b51-e7f2-4295-9d2f-55e5ab570358';
