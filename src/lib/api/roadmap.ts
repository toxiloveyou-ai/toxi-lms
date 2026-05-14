import type { RoadmapNode } from '../../types/roadmap';

export async function getStudentRoadmap(userId: string): Promise<RoadmapNode[]> {
  // Toxi Chinese Applied HSK 1 3.0 - 22 Sessions Program
  return [
    // MODULE 1: KHỞI ĐỘNG & CHUẨN HÓA ÂM
    {
      id: 'toxi-hsk1-b1',
      title: '你好世界 (Xin chào thế giới)',
      type: 'vocabulary',
      status: 'completed',
      progress: 100,
      level: 'HSK 1',
      module: 'MODULE 1: KHỞI ĐỘNG',
      description: 'Nhập môn Pinyin (Phần 1), quy tắc biến điệu, 8 nét cơ bản và chào hỏi'
    },
    {
      id: 'toxi-hsk1-b2',
      title: '你叫什么名字？',
      type: 'speaking',
      status: 'completed',
      progress: 100,
      level: 'HSK 1',
      module: 'MODULE 1: KHỞI ĐỘNG',
      description: 'Hoàn thiện phát âm (các âm khó), quy tắc viết Pinyin và giới thiệu tên'
    },
    {
      id: 'toxi-hsk1-b3',
      title: '我来介绍一下',
      type: 'speaking',
      status: 'current',
      progress: 45,
      level: 'HSK 1',
      module: 'MODULE 1: KHỞI ĐỘNG',
      description: 'Giới thiệu bản thân (Tên, tuổi, quốc tịch, nghề nghiệp), ngữ pháp chữ 是 và đại từ'
    },
    {
      id: 'toxi-hsk1-b4',
      title: '趣味中文 (Tiếng Trung thú vị)',
      type: 'exam',
      status: 'available',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 1: KHỞI ĐỘNG',
      description: 'Giao tiếp xã hội (Cảm ơn, xin lỗi, tạm biệt, chào theo giờ) và Bài TEST 1'
    },

    // MODULE 2: TƯ DUY NGÔN NGỮ & ĐỜI SỐNG
    {
      id: 'toxi-hsk1-b5',
      title: '你家有几口人？',
      type: 'vocabulary',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 2: TƯ DUY NGÔN NGỮ',
      description: 'Chủ đề gia đình, nghề nghiệp, số đếm 1-100 và tư duy Lượng từ'
    },
    {
      id: 'toxi-hsk1-b6',
      title: '现在几点？ (Bây giờ là mấy giờ?)',
      type: 'grammar',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 2: TƯ DUY NGÔN NGỮ',
      description: 'Chủ đề thời gian, lịch trình, quy tắc "Lớn trước nhỏ sau" và câu liên động'
    },
    {
      id: 'toxi-hsk1-b7',
      title: '我在淘宝买东西',
      type: 'vocabulary',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 2: TƯ DUY NGÔN NGỮ',
      description: 'Chủ đề mua sắm, tiền tệ, hỏi giá, mặc cả và dùng lượng từ đồ vật'
    },
    {
      id: 'toxi-hsk1-b8',
      title: '我的书在哪儿？',
      type: 'grammar',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 2: TƯ DUY NGÔN NGỮ',
      description: 'Phương hướng, vị trí đồ vật, câu chữ 在 (ở đâu) và 有 (tồn tại)'
    },
    {
      id: 'toxi-hsk1-b9',
      title: '温故知新 (Ôn cũ biết mới)',
      type: 'milestone',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 2: TƯ DUY NGÔN NGỮ',
      description: 'Hệ thống hóa kiến thức Module 1 & 2, luyện giao tiếp tổng hợp và Bài TEST 2'
    },

    // MODULE 3: TIẾNG TRUNG SINH TỒN
    {
      id: 'toxi-hsk1-b10',
      title: '你想吃什么？',
      type: 'speaking',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 3: SINH TỒN',
      description: 'Chủ đề ẩm thực, văn hóa gọi món, động từ năng nguyện 想 / 要'
    },
    {
      id: 'toxi-hsk1-b11',
      title: '去车站怎么走？',
      type: 'speaking',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 3: SINH TỒN',
      description: 'Chủ đề giao thông, phương tiện, cách hỏi đường và đặt xe'
    },
    {
      id: 'toxi-hsk1-b12',
      title: '你的爱好是什么？',
      type: 'speaking',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 3: SINH TỒN',
      description: 'Chủ đề sở thích, kỹ năng, rủ bạn bè đi chơi và câu hỏi chính phản'
    },
    {
      id: 'toxi-hsk1-b13',
      title: '我在公司上班',
      type: 'grammar',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 3: SINH TỒN',
      description: 'Chủ đề học tập, môi trường công sở, xin nghỉ phép, cấu trúc 一边...一边...'
    },
    {
      id: 'toxi-hsk1-b14',
      title: '今天天气怎么样？',
      type: 'vocabulary',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 3: SINH TỒN',
      description: 'Chủ đề thời tiết, bốn mùa, cảm xúc, sức khỏe và câu so sánh'
    },

    // MODULE 4: TRẠM TĂNG TỐC HSK 3.0
    {
      id: 'toxi-hsk1-b15',
      title: '毕业计划 (Chuẩn bị dự án)',
      type: 'speaking',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 4: TĂNG TỐC',
      description: 'Viết kịch bản Vlog "Một ngày của tôi", dùng AI sửa lỗi'
    },
    {
      id: 'toxi-hsk1-b16',
      title: 'Kỹ năng Đọc & Viết',
      type: 'reading',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 4: TĂNG TỐC',
      description: 'Học chiến thuật làm bài HSK, quét từ khóa, đoán nghĩa qua bộ thủ'
    },
    {
      id: 'toxi-hsk1-b17',
      title: 'Kỹ năng Nghe',
      type: 'listening',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 4: TĂNG TỐC',
      description: 'Chiến thuật bắt từ khóa, sắp xếp câu và luyện chép chính tả (Dictation)'
    },
    {
      id: 'toxi-hsk1-b18',
      title: 'TEST HSK 1',
      type: 'exam',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 4: TĂNG TỐC',
      description: 'Thi thử mô phỏng áp lực phòng thi thực tế'
    },

    // MODULE 5: DỰ ÁN TỐT NGHIỆP
    {
      id: 'toxi-hsk1-b19',
      title: 'Project Kick-off',
      type: 'milestone',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 5: DỰ ÁN',
      description: 'Lên ý tưởng, vẽ Mindmap, tổng ôn từ vựng'
    },
    {
      id: 'toxi-hsk1-b20',
      title: 'Rehearsal (Luyện tập)',
      type: 'speaking',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 5: DỰ ÁN',
      description: 'Tập thuyết trình, sửa ngữ điệu, làm slide bằng AI (Canva/Gamma)'
    },
    {
      id: 'toxi-hsk1-b21',
      title: 'Final Project (Thành quả)',
      type: 'milestone',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 5: DỰ ÁN',
      description: 'Học viên thuyết trình 100% tiếng Trung (3-5 phút) và phản biện (Q&A)'
    },
    {
      id: 'toxi-hsk1-b22',
      title: 'Tổng kết khóa học',
      type: 'milestone',
      status: 'locked',
      progress: 0,
      level: 'HSK 1',
      module: 'MODULE 5: DỰ ÁN',
      description: 'Đánh giá, trao chứng nhận và định hướng'
    }
  ];
}
