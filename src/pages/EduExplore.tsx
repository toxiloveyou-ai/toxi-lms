import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Star, Users, Clock, BookOpen,
  ChevronRight, Play, CheckCircle2, Award,
  Sparkles, Zap, Target, Briefcase, GraduationCap,
  TrendingUp, ArrowRight, ShieldCheck, MessageCircle,
  X, Info, Heart, CreditCard, Copy, Check, Download,
  Loader2, ExternalLink, QrCode
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { paymentApi } from '../lib/api/payment';

// Mock Data for Teachers
const TEACHERS = [
  { id: 't1', name: 'Thầy Lê Đình Hiểu', title: 'HSK 6 - Chuyên gia Hán ngữ', avatar: 'https://i.pravatar.cc/150?u=t1' },
  { id: 't2', name: 'Cô Minh Anh', title: 'Thạc sĩ Ngôn ngữ học', avatar: 'https://i.pravatar.cc/150?u=t2' },
  { id: 't3', name: 'Thầy Trần Kiên', title: 'HSK 6 - 10 năm kinh nghiệm', avatar: 'https://i.pravatar.cc/150?u=t3' }
];

// Categories
const CATEGORIES = [
  'Tất cả',
  'Tiếng Trung Ứng Dụng',
  'Luyện Thi Chứng Chỉ',
  'Tiếng Trung Chuyên Ngành',
  'Thiếu Nhi & Học Sinh',
  'AI & Công Nghệ'
];

// Formats
const FORMATS = ['Tất cả', 'Online Live', 'Video tự học', 'Offline Thanh Hóa'];

// Mock Courses
const MOCK_COURSES = [
  {
    id: 'c1',
    title: 'Tiếng Trung Ứng Dụng Sơ Cấp (Tongxiao Method)',
    category: 'Tiếng Trung Ứng Dụng',
    level: 'Sơ cấp',
    format: 'Online Live',
    price: 2500000,
    original_price: 3500000,
    duration_hours: 45,
    lesson_count: 24,
    teacher_id: 't1',
    thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800',
    description: 'Bắt đầu từ số 0 đến giao tiếp thực chiến cơ bản chỉ sau 3 tháng.',
    student_count: 1250,
    rating: 4.9,
    badge: 'HOT',
    is_toxi_original: true,
    outcomes: [
      'Giao tiếp tự tin trong các tình huống đời thường',
      'Nắm vững 600 từ vựng cốt lõi',
      'Làm chủ 50 cấu trúc ngữ pháp quan trọng',
      'Luyện phản xạ với AI Mentor độc quyền'
    ]
  },
  {
    id: 'c2',
    title: 'Tiếng Trung Ứng Dụng Trung Cấp',
    category: 'Tiếng Trung Ứng Dụng',
    level: 'Trung cấp',
    format: 'Online Live',
    price: 3800000,
    original_price: 5000000,
    duration_hours: 60,
    lesson_count: 32,
    teacher_id: 't1',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    description: 'Nâng tầm giao tiếp lên mức chuyên nghiệp và đàm phán.',
    student_count: 850,
    rating: 4.8,
    badge: 'BESTSELLER',
    is_toxi_original: true,
    outcomes: [
      'Đàm phán thương mại cơ bản',
      'Viết email và báo cáo chuyên nghiệp',
      'Nắm vững 1200 từ vựng HSK 4-5',
      'Kỹ năng thuyết trình bằng tiếng Trung'
    ]
  },
  {
    id: 'c3',
    title: 'Luyện thi HSK 5-6 Chuyên Sâu',
    category: 'Luyện Thi Chứng Chỉ',
    level: 'Cao cấp',
    format: 'Video tự học',
    price: 1500000,
    original_price: 2200000,
    duration_hours: 30,
    lesson_count: 20,
    teacher_id: 't3',
    thumbnail: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800',
    description: 'Chiến thuật làm bài và luyện đề thực tế đạt điểm cao.',
    student_count: 2100,
    rating: 5.0,
    badge: '🎯 TARGET',
    is_toxi_original: true,
    outcomes: [
      'Giải đề HSK 5-6 trong thời gian giới hạn',
      'Mẹo làm bài thi nghe và viết',
      'Tổng hợp 2500 từ vựng trọng tâm',
      'Phân tích lỗi sai thường gặp'
    ]
  },
  {
    id: 'c4',
    title: 'Tiếng Trung Nhà Máy & Sản Xuất',
    category: 'Tiếng Trung Chuyên Ngành',
    level: 'Trung cấp',
    format: 'Offline Thanh Hóa',
    price: 3200000,
    duration_hours: 40,
    lesson_count: 18,
    teacher_id: 't2',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    description: 'Dành riêng cho kỹ thuật viên và quản lý làm việc tại KCN.',
    student_count: 450,
    rating: 4.7,
    badge: '🆕 MỚI',
    is_toxi_original: true,
    outcomes: [
      'Từ vựng chuyên ngành kỹ thuật, máy móc',
      'Giao tiếp báo cáo sản xuất',
      'Xử lý tình huống an toàn lao động',
      'Kỹ năng quản lý nhân sự Trung Quốc'
    ]
  },
  {
    id: 'c5',
    title: 'AI & Công Nghệ Học Tiếng Trung',
    category: 'AI & Công Nghệ',
    level: 'Mọi cấp độ',
    format: 'Video tự học',
    price: 890000,
    original_price: 1200000,
    duration_hours: 15,
    lesson_count: 10,
    teacher_id: 't1',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    description: 'Dùng Prompt Engineering để học tiếng Trung nhanh gấp 5 lần.',
    student_count: 3200,
    rating: 4.9,
    badge: '🤖 AI FOCUS',
    is_toxi_original: true,
    outcomes: [
      'Sử dụng Doubao/ChatGPT làm Mentor',
      'Tạo bài tập cá nhân hóa tự động',
      'Luyện nghe nói với giọng AI bản ngữ',
      'Xây dựng lộ trình học bằng AI'
    ]
  },
  {
    id: 'c6',
    title: 'Tiếng Trung Trẻ Em - Vui Học Qua Truyện',
    category: 'Thiếu Nhi & Học Sinh',
    level: 'Sơ cấp',
    format: 'Online Live',
    price: 1800000,
    duration_hours: 24,
    lesson_count: 12,
    teacher_id: 't2',
    thumbnail: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&q=80&w=800',
    description: 'Giúp bé làm quen với tiếng Trung qua hình ảnh và âm thanh.',
    student_count: 300,
    rating: 4.9,
    badge: '🧒 KIDS',
    is_toxi_original: true,
    outcomes: [
      'Nhận diện mặt chữ qua tranh vẽ',
      'Hát và kể chuyện tiếng Trung cơ bản',
      'Phản xạ chào hỏi, giới thiệu bản thân',
      'Yêu thích ngôn ngữ tự nhiên'
    ]
  },
  {
    id: 'c7',
    title: 'Tiếng Trung Văn Phòng & Email',
    category: 'Tiếng Trung Chuyên Ngành',
    level: 'Trung cấp',
    format: 'Video tự học',
    price: 1200000,
    duration_hours: 20,
    lesson_count: 15,
    teacher_id: 't1',
    thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800',
    description: 'Chuẩn hóa kỹ năng hành chính văn phòng quốc tế.',
    student_count: 1100,
    rating: 4.8,
    is_toxi_original: true,
    outcomes: [
      'Soạn thảo văn bản, hợp đồng',
      'Lập báo cáo tuần, tháng',
      'Giao tiếp họp hành nội bộ',
      'Đặt lịch hẹn và đón tiếp đối tác'
    ]
  },
  {
    id: 'c8',
    title: 'Tiếng Trung Thương Mại & Đàm Phán',
    category: 'Tiếng Trung Chuyên Ngành',
    level: 'Cao cấp',
    format: 'Online Live',
    price: 4500000,
    duration_hours: 50,
    lesson_count: 25,
    teacher_id: 't3',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800',
    description: 'Chiến thuật đàm phán và tâm lý kinh doanh Trung Hoa.',
    student_count: 620,
    rating: 4.9,
    badge: '💼 PRO',
    is_toxi_original: true,
    outcomes: [
      'Kỹ năng thương thảo giá cả',
      'Tìm hiểu văn hóa kinh doanh Trung Quốc',
      'Từ vựng xuất nhập khẩu chuyên sâu',
      'Xử lý khiếu nại và mâu thuẫn'
    ]
  },
  {
    id: 'c9',
    title: 'Khóa Luyện Đề HSK 4 Chuyên Sâu 30 Ngày',
    category: 'Luyện Thi Chứng Chỉ',
    level: 'Trung cấp',
    format: 'Video tự học',
    price: 990000,
    duration_hours: 20,
    lesson_count: 30,
    teacher_id: 't1',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    description: 'Cấp tốc đạt chứng chỉ HSK 4 chỉ trong 1 tháng.',
    student_count: 1500,
    rating: 4.7,
    badge: '⏰ CẤP TỐC',
    is_toxi_original: true,
    outcomes: [
      'Làm quen cấu trúc đề thi mới nhất',
      'Học 1200 từ vựng HSK 4 siêu tốc',
      'Bí kíp đạt điểm tối đa phần viết',
      'Phân bổ thời gian thi hợp lý'
    ]
  },
  {
    id: 'c10',
    title: 'Tiếng Trung THPT Khối D4',
    category: 'Thiếu Nhi & Học Sinh',
    level: 'Trung cấp',
    format: 'Online Live',
    price: 2200000,
    duration_hours: 48,
    lesson_count: 24,
    teacher_id: 't2',
    thumbnail: 'https://images.unsplash.com/photo-1523050337458-5bdc12f04e7b?auto=format&fit=crop&q=80&w=800',
    description: 'Lộ trình thi Đại học khối D4 cam kết điểm 8+.',
    student_count: 420,
    rating: 4.8,
    is_toxi_original: true,
    outcomes: [
      'Ôn tập toàn bộ ngữ pháp SGK',
      'Luyện đề thi thử các năm',
      'Kỹ năng làm bài trắc nghiệm nhanh',
      'Tổng hợp từ vựng thi THPT'
    ]
  },
  {
    id: 'c11',
    title: 'Tiếng Trung Ứng Dụng Cao Cấp',
    category: 'Tiếng Trung Ứng Dụng',
    level: 'Cao cấp',
    format: 'Online Live',
    price: 5500000,
    duration_hours: 70,
    lesson_count: 35,
    teacher_id: 't1',
    thumbnail: 'https://images.unsplash.com/photo-1454165833767-02a6ed8a68b8?auto=format&fit=crop&q=80&w=800',
    description: 'Đạt trình độ cận bản ngữ và làm việc đa quốc gia.',
    student_count: 310,
    rating: 4.9,
    badge: '👑 MASTER',
    is_toxi_original: true,
    outcomes: [
      'Thảo luận các vấn đề chính trị, kinh tế',
      'Hiểu sâu sắc thành ngữ và văn chương',
      'Phản xạ 0.5s với mọi chủ đề phức tạp',
      'Quản lý dự án quốc tế bằng tiếng Trung'
    ]
  },
  {
    id: 'c12',
    title: 'Luyện thi TOCFL Chuyên Sâu',
    category: 'Luyện Thi Chứng Chỉ',
    level: 'Mọi cấp độ',
    format: 'Video tự học',
    price: 1800000,
    duration_hours: 35,
    lesson_count: 22,
    teacher_id: 't3',
    thumbnail: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=800',
    description: 'Dành cho các bạn có định hướng du học Đài Loan.',
    student_count: 580,
    rating: 4.7,
    is_toxi_original: true,
    outcomes: [
      'Phân biệt tiếng Trung phồn thể và giản thể',
      'Cấu trúc đề thi TOCFL Band A/B/C',
      'Từ vựng chuyên dùng tại Đài Loan',
      'Luyện nghe giọng Đài chuẩn'
    ]
  },
  {
    id: 'c13',
    title: 'Tiếng Trung Y Tế & Chăm Sóc Sức Khỏe',
    category: 'Tiếng Trung Chuyên Ngành',
    level: 'Trung cấp',
    format: 'Online Live',
    price: 3500000,
    duration_hours: 40,
    lesson_count: 20,
    teacher_id: 't2',
    thumbnail: 'https://images.unsplash.com/photo-1505751172107-573967a4f22a?auto=format&fit=crop&q=80&w=800',
    description: 'Giao tiếp trong bệnh viện và tư vấn y khoa.',
    student_count: 120,
    rating: 4.9,
    is_toxi_original: true,
    outcomes: [
      'Từ vựng bộ phận cơ thể, triệu chứng',
      'Giao tiếp khám bệnh, kê đơn',
      'Dịch thuật hồ sơ y tế cơ bản',
      'Tư vấn chăm sóc sức khỏe'
    ]
  },
  {
    id: 'c14',
    title: 'Toxi AI Toolkit cho Người Đi Làm',
    category: 'AI & Công Nghệ',
    level: 'Mọi cấp độ',
    format: 'Online Live',
    price: 1500000,
    duration_hours: 12,
    lesson_count: 6,
    teacher_id: 't1',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    description: 'Công cụ AI thực chiến cho hiệu suất công việc X10.',
    student_count: 1200,
    rating: 5.0,
    badge: '🆕 TRENDING',
    is_toxi_original: true,
    outcomes: [
      'Tự động hóa báo cáo bằng AI',
      'Dịch thuật tài liệu chính xác 99%',
      'Tạo slide thuyết trình tiếng Trung',
      'Quản lý thời gian bằng AI agent'
    ]
  },
  {
    id: 'c15',
    title: 'Prompt tiếng Trung cho Doubao & ChatGPT',
    category: 'AI & Công Nghệ',
    level: 'Mọi cấp độ',
    format: 'Video tự học',
    price: 499000,
    duration_hours: 8,
    lesson_count: 5,
    teacher_id: 't1',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4628c9759?auto=format&fit=crop&q=80&w=800',
    description: 'Làm chủ ngôn ngữ lập trình cho trí tuệ nhân tạo.',
    student_count: 2500,
    rating: 4.8,
    is_toxi_original: true,
    outcomes: [
      'Hiểu cấu trúc Prompt tiếng Trung',
      'Tối ưu kết quả trả về từ AI',
      'Xây dựng Character AI cá nhân',
      'Ứng dụng AI vào sáng tạo nội dung'
    ]
  }
];

export default function EduExplore() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedFormat, setSelectedFormat] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [view, setView] = useState<'grid' | 'detail'>('grid');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
    
    // Capture Referral Code from URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('toxi_ref_code', refCode);
      console.log('[Referral] Captured code:', refCode);
    }
  }, []);

  async function fetchCourses() {
    setLoading(true);
    try {
      // 1. Fetch courses
      const { data, error } = await supabase
        .from('courses')
        .select('*, teachers(full_name, title, avatar_url)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. Fetch active Flash Sale
      const { data: activeFlashSales } = await supabase
        .from('flash_sales')
        .select('*, flash_sale_items(*)')
        .eq('status', 'active')
        .lte('start_time', new Date().toISOString())
        .gte('end_time', new Date().toISOString())
        .maybeSingle();

      if (activeFlashSales) {
        setFlashSale(activeFlashSales);
      }

      // Map database fields to UI expectations
      const mappedData = data?.map(course => {
        // Check if course is in flash sale
        const flashItem = activeFlashSales?.flash_sale_items?.find((item: any) => item.course_id === course.id);
        const currentPrice = flashItem ? flashItem.sale_price : course.price;
        const originalPrice = flashItem ? course.price : course.original_price;

        return {
          ...course,
          thumbnail: course.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800',
          rating: 5.0,
          student_count: course.student_count || 0,
          duration_hours: course.duration_hours || 40,
          price: currentPrice,
          original_price: originalPrice,
          is_flash_sale: !!flashItem,
          badge: flashItem ? 'FLASH SALE' : (course.badge || null)
        };
      }) || [];

      setCourses(mappedData);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleVerifyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsVerifyingCoupon(true);
    setCouponError(null);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('status', 'active')
        .gte('expiry_date', new Date().toISOString())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setCouponError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }

      if (data.usage_limit && data.usage_count >= data.usage_limit) {
        setCouponError('Mã giảm giá đã hết lượt sử dụng.');
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }

      if (selectedCourse.price < data.min_order_value) {
        setCouponError(`Mã này chỉ áp dụng cho đơn hàng từ ${data.min_order_value.toLocaleString()}₫`);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }

      setAppliedCoupon(data);
      
      // Calculate discount
      let discount = 0;
      if (data.discount_type === 'percentage') {
        discount = (selectedCourse.price * data.discount_value) / 100;
        if (data.max_discount_amount && discount > data.max_discount_amount) {
          discount = data.max_discount_amount;
        }
      } else {
        discount = data.discount_value;
      }

      setDiscountAmount(discount);
      setCouponError(null);
    } catch (err) {
      console.error('Coupon error:', err);
      setCouponError('Đã có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsVerifyingCoupon(false);
    }
  };
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [billFile, setBillFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ students: 0, courses: 0, rate: 0 });
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [paymentPlan, setPaymentPlan] = useState<'full' | 'installments'>('full');
  const [paymentMethod, setPaymentMethod] = useState<'manual' | 'payos'>('payos');
  const [payosUrl, setPayosUrl] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [paymentTimeLeft, setPaymentTimeLeft] = useState(600); // 10 minutes
  
  // Marketing Module States
  const [flashSale, setFlashSale] = useState<any | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isEnrollModalOpen && enrollmentStatus === 'idle') {
      timer = setInterval(() => {
        setPaymentTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      setPaymentTimeLeft(600);
    }
    return () => clearInterval(timer);
  }, [isEnrollModalOpen, enrollmentStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: studentCount } = await supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true });

        const { count: courseCount } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true });

        setStats({
          students: studentCount || 0,
          courses: courseCount || 0,
          rate: 98 // Mocked for now as exam_attempts might not exist yet
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    }
    fetchStats();

    async function fetchPaymentInfo() {
      try {
        const { data, error } = await supabase
          .from('edu_settings')
          .select('value')
          .eq('key', 'payment_info')
          .maybeSingle();

        if (error) {
          console.warn('Could not fetch edu_settings, using fallback payment info');
          setPaymentInfo({
            bank_name: "Vietcombank",
            account_number: "1234567890",
            account_holder: "CÔNG TY TNHH TOXI"
          });
          return;
        }

        if (data) setPaymentInfo(data.value);
        else {
          setPaymentInfo({
            bank_name: "Vietcombank",
            account_number: "1234567890",
            account_holder: "CÔNG TY TNHH TOXI"
          });
        }
      } catch (err) {
        console.error('Error fetching payment info:', err);
      }
    }
    fetchPaymentInfo();

    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    }
    fetchUser();
  }, []);

  const toggleWishlist = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    setWishlist(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleEnroll = async () => {
    if (!selectedCourse) return;

    // Automatic Payment via PayOS
    if (paymentMethod === 'payos') {
      setIsGeneratingLink(true);
      try {
        const orderCode = paymentApi.generateOrderCode();
        const amount = paymentPlan === 'full' ? selectedCourse.price : (selectedCourse.price / 2);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          alert("Vui lòng đăng nhập để đăng ký khóa học.");
          return;
        }

        // Referral Logic
        const storedRefCode = localStorage.getItem('toxi_ref_code');
        let referrerId = null;
        if (storedRefCode) {
          const { data: refProfile } = await supabase
            .from('toxi_profiles')
            .select('id')
            .eq('referral_code', storedRefCode)
            .single();
          if (refProfile) referrerId = refProfile.id;
        }

        // 1. Create a pending enrollment record first
        const { error: enrollError } = await supabase
          .from('course_enrollments')
          .upsert([{
            user_id: user.id,
            course_id: selectedCourse.id,
            status: 'pending',
            payment_plan: paymentPlan,
            total_amount: selectedCourse.price,
            paid_amount: 0,
            payment_status: 'unpaid',
            order_code: orderCode, // Save order code for tracking
            referred_by: referrerId,
            enrolled_at: new Date().toISOString()
          }], { onConflict: 'user_id,course_id' });

        if (enrollError) throw enrollError;

        // 2. Call our Edge Function to get PayOS link
        const res = await paymentApi.createPaymentLink({
          orderCode,
          amount,
          description: `TOXI EDU ${selectedCourse.title.slice(0, 15)}`,
          buyerName: user.user_metadata?.full_name || user.email,
          buyerEmail: user.email!,
          cancelUrl: window.location.href,
          returnUrl: `${window.location.origin}/edu/dashboard?payment=success&order=${orderCode}`
        });

        if (res?.data?.checkoutUrl) {
          setPayosUrl(res.data.checkoutUrl);
          // Auto redirect after 2 seconds
          setTimeout(() => {
            window.location.href = res.data.checkoutUrl;
          }, 2000);
        } else {
          throw new Error("Không thể tạo link thanh toán. Vui lòng thử lại sau.");
        }
      } catch (err: any) {
        console.error('PayOS Error:', err);
        alert(`Lỗi thanh toán: ${err.message}`);
      } finally {
        setIsGeneratingLink(false);
      }
      return;
    }

    // Manual Payment (Original Logic)
    setEnrollmentStatus('pending');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Vui lòng đăng nhập để đăng ký khóa học.");
        return;
      }

      // 1. Upload bill if exists
      let billUrl = null;
      if (billFile) {
        setIsUploading(true);
        const fileExt = billFile.name.split('.').pop();
        const fileName = `${user.id}_${selectedCourse.id}_${Math.random()}.${fileExt}`;
        const filePath = `bills/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('course-enrollments')
          .upload(filePath, billFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('course-enrollments')
          .getPublicUrl(filePath);

        billUrl = publicUrl;
      }

      const totalAmount = selectedCourse.price;
      const amountToPay = paymentPlan === 'full' ? totalAmount : (totalAmount / 2);

      // Referral Logic
      const storedRefCode = localStorage.getItem('toxi_ref_code');
      let referrerId = null;
      if (storedRefCode) {
        const { data: refProfile } = await supabase
          .from('toxi_profiles')
          .select('id')
          .eq('referral_code', storedRefCode)
          .single();
        if (refProfile) referrerId = refProfile.id;
      }

      // 2. Insert into course_enrollments
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .upsert([{
          user_id: user.id,
          course_id: selectedCourse.id,
          status: 'pending',
          bill_url: billUrl,
          payment_plan: paymentPlan,
          total_amount: totalAmount,
          paid_amount: amountToPay,
          referred_by: referrerId,
          enrolled_at: new Date().toISOString()
        }], { onConflict: 'user_id,course_id' })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // 3. Insert into payment history
      if (enrollment) {
        await supabase.from('course_payment_history').insert([{
          enrollment_id: enrollment.id,
          amount: amountToPay,
          bill_url: billUrl,
          status: 'pending',
          notes: paymentPlan === 'installments' ? 'Đợt 1 (50%)' : 'Thanh toán trọn gói'
        }]);
      }

      setEnrollmentStatus('success');
    } catch (err: any) {
      console.error('Enrollment error:', err);
      setEnrollmentStatus('error');
      alert(`Đã có lỗi xảy ra: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBillFile(e.target.files[0]);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory = selectedCategory === 'Tất cả' || course.category === selectedCategory;
      const matchesFormat = selectedFormat === 'Tất cả' || course.format === selectedFormat;
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesFormat && matchesSearch;
    });
  }, [courses, selectedCategory, selectedFormat, searchQuery]);

  const handleCourseClick = (course: any) => {
    setSelectedCourse(course);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setView('grid');
    setSelectedCourse(null);
  };

  const handleFreeTrial = (courseId: string) => {
    navigate(`/edu/course/${courseId}/learn`);
  };

  const teacher = selectedCourse?.teachers || { full_name: 'Giáo viên Toxi', title: 'Chuyên gia Hán ngữ', avatar_url: 'https://i.pravatar.cc/150?u=toxi' };
  const outcomes = Array.isArray(selectedCourse?.outcomes_json) ? selectedCourse.outcomes_json : [];
  const syllabus = Array.isArray(selectedCourse?.syllabus_json) ? selectedCourse.syllabus_json : [
    { title: 'Chương 1: Nền tảng và Tư duy ứng dụng', lessons: 4, isFree: true },
    { title: 'Chương 2: Ngữ cảnh thực chiến nâng cao', lessons: 8, isFree: false },
    { title: 'Chương 3: Phản xạ và Ứng dụng AI', lessons: 12, isFree: false },
  ];

  return (
    <div className="animate-in fade-in duration-700">
      {view === 'detail' && selectedCourse ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12 pb-32">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#2E3192] transition-colors uppercase tracking-widest"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Quay lại danh sách
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Course Info */}
            <div className="lg:col-span-8 space-y-12">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 bg-[#2E3192]/10 text-[#2E3192] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#2E3192]/20">
                    {selectedCourse.category}
                  </span>
                  <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                    {selectedCourse.level}
                  </span>
                </div>
                <h1 className="text-5xl font-black text-slate-900 leading-tight tracking-tight">
                  {selectedCourse.title}
                </h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed italic">
                  "{selectedCourse.description}"
                </p>

                <div className="flex flex-wrap items-center gap-8 pt-4">
                  <div
                    onClick={() => navigate(`/edu/teacher/${selectedCourse.teacher_id}`)}
                    className="flex items-center gap-3 cursor-pointer group/teacher"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md group-hover/teacher:scale-110 transition-transform bg-slate-100">
                      <img src={teacher.avatar_url || teacher.avatar} alt={teacher.full_name || teacher.name} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 group-hover/teacher:text-[#2E3192] transition-colors">{teacher.full_name || teacher.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{teacher.title}</p>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
                    <span className="text-lg font-black text-slate-900">{selectedCourse.rating}</span>
                    <span className="text-xs font-bold text-slate-400">({selectedCourse.student_count} học viên)</span>
                  </div>
                </div>
              </div>

              {/* Video Preview */}
              <div className="aspect-video bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <img src={selectedCourse.thumbnail} className="w-full h-full object-cover opacity-60" alt="Preview" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:scale-110 transition-all hover:bg-[#2E3192] hover:border-[#2E3192]">
                    <Play className="w-10 h-10 fill-current ml-2" />
                  </button>
                </div>
                <div className="absolute bottom-10 left-10 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Course Preview</p>
                  <p className="text-2xl font-black">Xem giới thiệu khóa học</p>
                </div>
              </div>

              {/* Outcomes */}
              <section className="space-y-8">
                <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                  <Target className="w-8 h-8 text-[#2E3192]" /> Bạn sẽ học được gì?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {outcomes.length > 0 ? outcomes.map((outcome: string, i: number) => (
                    <div key={i} className="flex gap-4 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-slate-600 font-bold leading-relaxed">{outcome}</p>
                    </div>
                  )) : (
                    <div className="md:col-span-2 p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold italic">Lộ trình chi tiết đang được cập nhật...</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Syllabus (Accordion Preview) */}
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-slate-900">Nội dung bài học</h3>
                  <p className="text-sm font-bold text-slate-400">{selectedCourse.lesson_count} bài học • {selectedCourse.duration_hours} giờ</p>
                </div>
                <div className="space-y-4">
                  {syllabus.map((chapter: any, i: number) => (
                    <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group cursor-pointer hover:border-[#2E3192]/20 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs">
                          0{i + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-slate-800 group-hover:text-[#2E3192] transition-colors">{chapter.title}</h4>
                            {chapter.isFree && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase rounded">Học thử miễn phí</span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{chapter.lessons} Bài học</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {chapter.isFree && (
                          <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                            <Play className="w-3 h-3 fill-current" /> Xem ngay
                          </button>
                        )}
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Pricing & CTA */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-8 space-y-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2E3192]/5 rounded-full blur-3xl -mr-16 -mt-16" />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-end gap-3">
                    <p className="text-4xl font-black text-slate-900">{selectedCourse.price.toLocaleString('vi-VN')}₫</p>
                    {selectedCourse.original_price && (
                      <p className="text-xl text-slate-300 font-bold line-through mb-1">{selectedCourse.original_price.toLocaleString('vi-VN')}₫</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    <TrendingUp className="w-3 h-3" /> Tiết kiệm {Math.round((1 - selectedCourse.price / (selectedCourse.original_price || selectedCourse.price)) * 100)}%
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <button
                    onClick={() => setIsEnrollModalOpen(true)}
                    className="w-full py-5 bg-[#2E3192] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                  >
                    Đăng ký ngay
                  </button>
                  <button
                    onClick={() => handleFreeTrial(selectedCourse.id)}
                    className="w-full py-5 bg-white text-[#2E3192] border-2 border-[#2E3192] rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Học thử miễn phí
                  </button>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-600">Thời gian: {selectedCourse.duration_hours} giờ học</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-600">Hình thức: {selectedCourse.format}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-600">Chứng chỉ: Hoàn thành khóa học</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-4 h-4" /> Cam kết chất lượng
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Mọi khóa học đều do đội ngũ chuyên gia Toxi trực tiếp biên soạn và kiểm duyệt.
                  </p>
                </div>
              </div>

              <div className="bg-[#1E2060] rounded-[2.5rem] p-8 text-white space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <MessageCircle className="w-6 h-6 text-white/20" />
                </div>
                <h4 className="font-black text-xl leading-tight">Cần tư vấn lộ trình học tập?</h4>
                <p className="text-white/60 text-xs font-medium">Hỗ trợ 24/7 để giúp bạn chọn được khóa học phù hợp nhất với năng lực hiện tại.</p>
                <button
                  onClick={() => navigate('/app/toxi-ai')}
                  className="w-full py-4 bg-white text-[#1E2060] rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Chat với Toxi Advisor
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-700 space-y-16">

          {/* 1. HERO SECTION */}
          <section className="relative overflow-hidden p-8 lg:p-12 rounded-[2.5rem] bg-gradient-to-br from-[#0f172a] via-[#1E2060] to-[#2E3192] text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-student-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] -ml-32 -mb-32" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">
                    Phương pháp Tongxiao độc quyền
                  </span>
                  <div className="flex items-center gap-1.5 text-white/60 text-[9px] font-black uppercase tracking-widest border-l border-white/20 pl-3">
                    <Sparkles className="w-3 h-3 text-orange-400" /> Top 1 Chuyên Ngành
                  </div>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                  Tiếng Trung <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Ứng Dụng</span>
                </h1>

                <p className="text-white/70 text-sm lg:text-base font-medium max-w-2xl leading-relaxed">
                  Showroom sản phẩm chính hãng Toxi. Toàn bộ nội dung do đội ngũ chuyên gia của chúng tôi trực tiếp biên soạn và giảng dạy thực chiến.
                </p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4">
                  <div className="space-y-0.5">
                    <p className="text-2xl font-black text-white tracking-tight">
                      {stats.students > 0 ? stats.students.toLocaleString() + '+' : 'Đang cập nhật'}
                    </p>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Học viên tin dùng</p>
                  </div>
                  <div className="h-8 w-px bg-white/10 hidden md:block" />
                  <div className="space-y-0.5">
                    <p className="text-2xl font-black text-white tracking-tight">
                      {stats.courses > 0 ? stats.courses.toLocaleString() + '+' : 'Đang cập nhật'}
                    </p>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Khóa học</p>
                  </div>
                  <div className="h-8 w-px bg-white/10 hidden md:block" />
                  <div className="space-y-0.5">
                    <p className="text-2xl font-black text-white tracking-tight">
                      {stats.rate > 0 ? stats.rate + '%' : 'Đang cập nhật'}
                    </p>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Tỷ lệ đỗ</p>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-80 relative group hidden md:block">
                <div className="absolute inset-0 bg-student-primary rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <Award className="w-6 h-6 text-[#2E3192]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">Chất lượng Toxi</p>
                      <p className="text-[9px] font-bold text-white/40 uppercase">Cam kết Hán ngữ</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium leading-relaxed italic text-white/80">
                    "Tại Toxi, chúng tôi trao cho bạn chiếc chìa khóa để làm chủ ngôn ngữ trong thực tế."
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-slate-800" />
                    <div>
                      <p className="text-[9px] font-black text-white">Lê Đình Hiểu</p>
                      <p className="text-[8px] font-bold text-white/40 uppercase">Founder of Toxi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. FILTER & SEARCH SECTION */}
          <section className="space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-[#2E3192] transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học (VD: giao tiếp, HSK, văn phòng...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-[#2E3192] transition-all font-bold text-lg shadow-xl shadow-slate-100/50 outline-none"
                />
              </div>
              <div className="flex items-center gap-4 shrink-0 overflow-x-auto pb-2 lg:pb-0">
                <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-2xl">
                  {['Tất cả', 'Phổ biến', 'Mới nhất', 'Đánh giá'].map(sort => (
                    <button key={sort} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all text-slate-500 hover:text-[#2E3192]">
                      {sort}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Lọc theo:</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat
                      ? 'bg-[#2E3192] text-white shadow-lg shadow-indigo-200'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-[#2E3192]/30'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="h-8 w-px bg-slate-200 mx-2" />

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                {FORMATS.map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedFormat === fmt
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-orange-500/30'
                      }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 3. FLASH SALE BANNER (If Active) */}
          {flashSale && (
            <div className="relative overflow-hidden p-8 rounded-[3rem] bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 text-white shadow-2xl animate-in slide-in-from-top-10 duration-1000">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Zap className="w-40 h-40" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                    <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Đang diễn ra</span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight">{flashSale.title}</h2>
                  <p className="text-white/80 font-medium">Cơ hội sở hữu tri thức với mức giá ưu đãi chưa từng có.</p>
                </div>

                <div className="flex items-center gap-4">
                   <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl min-w-[80px]">
                      <p className="text-2xl font-black">{Math.max(0, Math.floor((new Date(flashSale.end_time).getTime() - new Date().getTime()) / (1000 * 60 * 60))).toString().padStart(2, '0')}</p>
                      <p className="text-[9px] font-black uppercase text-white/60">Giờ</p>
                   </div>
                   <span className="text-2xl font-black animate-pulse">:</span>
                   <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl min-w-[80px]">
                      <p className="text-2xl font-black">{Math.max(0, Math.floor(((new Date(flashSale.end_time).getTime() - new Date().getTime()) % (1000 * 60 * 60)) / (1000 * 60))).toString().padStart(2, '0')}</p>
                      <p className="text-[9px] font-black uppercase text-white/60">Phút</p>
                   </div>
                   <span className="text-2xl font-black animate-pulse">:</span>
                   <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl min-w-[80px]">
                      <p className="text-2xl font-black">{Math.max(0, Math.floor(((new Date(flashSale.end_time).getTime() - new Date().getTime()) % (1000 * 60)) / 1000)).toString().padStart(2, '0')}</p>
                      <p className="text-[9px] font-black uppercase text-white/60">Giây</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. COURSE GRID */}
          <section className="space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Kết quả khám phá <span className="text-slate-300 ml-2">({filteredCourses.length})</span>
              </h2>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => {
                  const teacher = course.teachers || { full_name: 'Toxi Teacher', title: 'Chuyên gia', avatar_url: '' };
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleCourseClick(course)}
                      className="group bg-white rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
                    >
                      {/* Compact Thumbnail Area */}
                      <div className="relative aspect-video overflow-hidden bg-slate-100">
                        <img
                          src={course.thumbnail}
                          onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x500/2E3192/FFF?text=Toxi+Course&font=Montserrat' }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt={course.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Minimal Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[8px] font-black text-[#2E3192] uppercase tracking-wider shadow-sm">
                            {course.category}
                          </span>
                          {course.badge && (
                            <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider shadow-sm ${course.is_flash_sale ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-500 text-white'}`}>
                              {course.badge}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => toggleWishlist(e, course.id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all z-20"
                        >
                          <Heart className={`w-3.5 h-3.5 ${wishlist.includes(course.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                        </button>
                        
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                           <div className="flex items-center gap-1 px-2 py-1 bg-black/20 backdrop-blur-md rounded-md">
                              <Star className="w-2.5 h-2.5 text-orange-400 fill-orange-400" />
                              <span className="text-[10px] font-black text-white">{course.rating}</span>
                           </div>
                           <span className="text-[8px] font-black text-white/80 uppercase tracking-widest">Toxi Original</span>
                        </div>
                      </div>

                      {/* Compact Content Area */}
                      <div className="p-5 flex-1 flex flex-col space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <span>{course.level}</span>
                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                            <span>{course.format}</span>
                          </div>
                          <h3 className="text-base font-black text-slate-900 group-hover:text-[#2E3192] transition-colors leading-tight line-clamp-2">
                            {course.title}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                              <img
                                src={teacher.avatar_url || `https://i.pravatar.cc/100?u=${course.teacher_id}`}
                                className="w-full h-full object-cover"
                                alt={teacher.full_name}
                              />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-900 leading-none">{teacher.full_name}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Mentor</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                             <p className="text-sm font-black text-[#2E3192] tracking-tighter">
                               {course.price.toLocaleString('vi-VN')}₫
                             </p>
                             {course.original_price && (
                               <p className="text-[8px] font-bold text-slate-300 line-through opacity-70">
                                 {(course.original_price).toLocaleString('vi-VN')}₫
                               </p>
                             )}
                          </div>
                        </div>

                        {/* Mini Stats Bar */}
                        <div className="flex items-center gap-4 pt-1">
                           <div className="flex items-center gap-1.5 text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span className="text-[9px] font-black">{course.duration_hours}h</span>
                           </div>
                           <div className="flex items-center gap-1.5 text-slate-400">
                              <Users className="w-3 h-3" />
                              <span className="text-[9px] font-black">{course.student_count} học viên</span>
                           </div>
                           <div className="ml-auto">
                              <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-[#2E3192] transition-colors" />
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                  <Search className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Không tìm thấy khóa học phù hợp</h3>
                  <p className="text-slate-400 font-medium max-w-sm">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để khám phá thêm nhiều lựa chọn khác từ Toxi.</p>
                </div>
                <button
                  onClick={() => { setSelectedCategory('Tất cả'); setSelectedFormat('Tất cả'); setSearchQuery(''); }}
                  className="px-8 py-3 bg-[#2E3192] text-white rounded-xl font-black text-xs uppercase tracking-widest"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </section>

          {/* 4. FOOTER CALL TO ACTION */}
          <section className="p-12 lg:p-20 rounded-[4rem] bg-[#1E2060] text-white relative overflow-hidden text-center space-y-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-96 bg-student-primary/10 rounded-full blur-[120px] -mt-48" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                Khởi động hành trình <br /> <span className="text-orange-400 italic">Thực Chiến</span> của bạn ngay hôm nay.
              </h2>
              <p className="text-white/60 text-lg font-medium leading-relaxed">
                Đừng chỉ học lý thuyết. Hãy để Toxi đồng hành cùng bạn trên con đường chinh phục tiếng Trung Ứng Dụng với phương pháp Tongxiao độc quyền.
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-6">
                <button className="px-10 py-5 bg-white text-[#1E2060] rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                  Tư vấn lộ trình 1:1
                </button>
                <button className="px-10 py-5 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
                  Hỗ trợ kỹ thuật
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
      {/* 5. ENROLLMENT MODAL */}
      {isEnrollModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsEnrollModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-900">Xác nhận đăng ký</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-orange-500 animate-pulse" />
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Hết hạn sau: {formatTime(paymentTimeLeft)}</p>
                </div>
              </div>
              <button onClick={() => setIsEnrollModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">

              {enrollmentStatus === 'success' ? (
                <div className="text-center py-12 space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900">Đăng ký thành công!</h4>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      Yêu cầu của bạn đã được gửi tới Ban quản trị. <br />
                      Sau khi xác nhận thanh toán, khóa học sẽ chính thức được kích hoạt.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => navigate('/edu/dashboard')}
                      className="px-10 py-4 bg-[#2E3192] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
                    >
                      Đến không gian học tập
                    </button>
                    <button
                      onClick={() => { setIsEnrollModalOpen(false); setEnrollmentStatus('idle'); }}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      Tiếp tục khám phá
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <img src={selectedCourse.thumbnail} className="w-16 h-16 rounded-xl object-cover shadow-md" alt="" />
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-[#2E3192] uppercase tracking-[0.2em]">{selectedCourse.category}</p>
                      <h4 className="text-sm font-black text-slate-900 leading-tight">{selectedCourse.title}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-black text-[#2E3192]">{(selectedCourse.price || 0).toLocaleString('vi-VN')}₫</p>
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[8px] font-black rounded uppercase">Giá ưu đãi</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Marketing Coupon Section */}
                    <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã ưu đãi (Coupon)</label>
                        {appliedCoupon && (
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                            <Check className="w-3 h-3" /> Đã áp dụng
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Nhập mã (VD: TOXI10)"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            disabled={!!appliedCoupon}
                            className={`w-full px-5 py-3.5 bg-white border rounded-xl font-bold text-sm outline-none transition-all ${couponError ? 'border-red-300' : 'border-slate-200 focus:border-[#2E3192]'}`}
                          />
                          {couponError && <p className="absolute -bottom-5 left-1 text-[9px] font-bold text-red-500 uppercase">{couponError}</p>}
                        </div>
                        
                        {appliedCoupon ? (
                          <button
                            onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); setCouponCode(''); }}
                            className="px-6 py-3.5 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors"
                          >
                            Hủy
                          </button>
                        ) : (
                          <button
                            onClick={handleVerifyCoupon}
                            disabled={isVerifyingCoupon || !couponCode}
                            className="px-6 py-3.5 bg-[#2E3192] text-white rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 hover:scale-105 transition-all flex items-center gap-2"
                          >
                            {isVerifyingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Áp dụng
                          </button>
                        )}
                      </div>
                      
                      {appliedCoupon && (
                        <div className="flex items-center justify-between px-2 pt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Ưu đãi giảm giá:</span>
                          <span className="text-sm font-black text-emerald-600">-{discountAmount.toLocaleString()}₫</span>
                        </div>
                      )}
                    </div>

                    {/* Payment Method Toggle */}
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Phương thức thanh toán</label>
                      <div className="flex bg-slate-100 p-1 rounded-2xl">
                        <button
                          onClick={() => setPaymentMethod('payos')}
                          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${paymentMethod === 'payos' ? 'bg-white text-[#2E3192] shadow-sm' : 'text-slate-500'}`}
                        >
                          <QrCode className="w-4 h-4" /> Tự động (PayOS)
                        </button>
                        <button
                          onClick={() => setPaymentMethod('manual')}
                          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${paymentMethod === 'manual' ? 'bg-white text-[#2E3192] shadow-sm' : 'text-slate-500'}`}
                        >
                          <CreditCard className="w-4 h-4" /> Thủ công
                        </button>
                      </div>
                    </div>

                    {/* PayOS Information */}
                    {paymentMethod === 'payos' && (
                      <div className="p-8 bg-gradient-to-br from-indigo-900 to-[#2E3192] rounded-[2.5rem] text-white space-y-6 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-6 opacity-20">
                          <Sparkles className="w-12 h-12" />
                        </div>

                        <div className="space-y-2 relative z-10">
                          <h4 className="text-xl font-black">Thanh toán tự động ⚡</h4>
                          <p className="text-white/60 text-xs font-medium leading-relaxed">
                            Hệ thống sẽ tạo mã QR thanh toán động. Khóa học được kích hoạt **ngay lập tức** sau khi bạn quét mã thành công.
                          </p>
                        </div>

                        <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 space-y-4">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-white/60">Gói học tập:</span>
                            <span>{paymentPlan === 'full' ? 'Trọn đời' : 'Trả góp đợt 1'}</span>
                          </div>
                          <div className="flex justify-between items-end border-t border-white/10 pt-4">
                            <span className="text-xs font-bold text-white/60 uppercase">Tổng thanh toán:</span>
                            <div className="text-right">
                              {discountAmount > 0 && (
                                <p className="text-[10px] font-bold text-white/30 line-through mb-1">
                                  {(paymentPlan === 'full' ? selectedCourse.price : (selectedCourse.price / 2)).toLocaleString('vi-VN')}₫
                                </p>
                              )}
                              <span className="text-2xl font-black text-orange-400">
                                {Math.max(0, (paymentPlan === 'full' ? selectedCourse.price : (selectedCourse.price / 2)) - discountAmount).toLocaleString('vi-VN')}₫
                              </span>
                            </div>
                          </div>
                        </div>

                        {payosUrl ? (
                          <div className="text-center py-4 space-y-4 animate-in fade-in duration-500">
                            <div className="inline-block p-2 bg-white rounded-xl shadow-2xl">
                              <QrCode className="w-20 h-20 text-[#2E3192]" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Đang chuyển hướng đến trang thanh toán...</p>
                            <a
                              href={payosUrl}
                              className="flex items-center justify-center gap-2 text-white font-black text-xs hover:underline"
                            >
                              Bấm vào đây nếu không tự động chuyển <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Thanh toán bảo mật qua PayOS
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Manual Payment Details */}
                    {paymentMethod === 'manual' && (
                      <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />

                          <div className="space-y-5 relative z-10">
                            {(() => {
                              const finalPaymentInfo = (selectedCourse as any).payment_info?.bank_name
                                ? (selectedCourse as any).payment_info
                                : paymentInfo;

                              return (
                                <>
                                  <div>
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Số tiền thanh toán</h5>
                                    <div className="flex items-baseline gap-2">
                                      <p className="text-3xl font-black text-orange-400">
                                        {Math.max(0, (paymentPlan === 'full' ? selectedCourse.price : (selectedCourse.price / 2)) - discountAmount).toLocaleString('vi-VN')}₫
                                      </p>
                                      {paymentPlan === 'installments' && <span className="text-[10px] font-bold text-white/40 uppercase">(Đợt 1 - 50%)</span>}
                                      {discountAmount > 0 && <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">(Đã giảm {discountAmount.toLocaleString()}₫)</span>}
                                    </div>
                                  </div>

                                  <div className="space-y-2.5">
                                    <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                      <p className="text-[10px] font-bold text-white/60 uppercase">Ngân hàng: <span className="text-white">{finalPaymentInfo?.bank_name || 'Vietcombank'}</span></p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                      <p className="text-[10px] font-bold text-white/60 uppercase">Số tài khoản: <span className="text-white font-black">{finalPaymentInfo?.account_number || '1234567890'}</span></p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                      <p className="text-[10px] font-bold text-white/60 uppercase">Chủ TK: <span className="text-white">{finalPaymentInfo?.account_holder || 'CÔNG TY TNHH TOXI'}</span></p>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mt-4 group/copy relative">
                                      <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1.5">Nội dung chuyển khoản</p>
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs font-black tracking-tight select-all">TOXI {(selectedCourse.id || '').slice(0, 4)} {(userId || '').slice(0, 4).toUpperCase()}</p>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(`TOXI ${(selectedCourse.id || '').slice(0, 4)} ${(userId || '').slice(0, 4).toUpperCase()}`);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                          }}
                                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                          {/* Column 2: QR Code */}
                          <div className="flex flex-col items-center justify-center relative z-10">
                            {(() => {
                              const finalPaymentInfo = (selectedCourse as any).payment_info?.bank_name
                                ? (selectedCourse as any).payment_info
                                : paymentInfo;

                              return (
                                <>
                                  <div className="bg-white p-4 rounded-[2rem] shadow-xl transform hover:scale-105 transition-transform duration-500">
                                    <img
                                      src={(finalPaymentInfo?.qr_template || "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=vcb|{account}|{price}|TOXI {course_id}")
                                        .replace('{account}', finalPaymentInfo?.account_number || '1234567890')
                                        .replace('{price}', (Math.max(0, (paymentPlan === 'full' ? selectedCourse.price : (selectedCourse.price / 2)) - discountAmount)).toString())
                                        .replace('{course_id}', (selectedCourse.id || '').slice(0, 4))}
                                      className="w-32 h-32"
                                      alt="QR Chuyển khoản"
                                    />
                                  </div>
                                  <p className="text-[8px] font-black text-white/30 uppercase mt-4 tracking-[0.2em]">Quét mã VietQR</p>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Minh chứng thanh toán (Upload Bill)</label>
                          <div className="relative group cursor-pointer">
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            <div className={`w-full p-8 bg-slate-50 border-2 border-dashed rounded-3xl flex flex-col items-center gap-3 transition-all ${billFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 group-hover:border-[#2E3192]'}`}>
                              <div className={`w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center ${billFile ? 'text-emerald-500' : 'text-slate-400 group-hover:text-[#2E3192]'}`}>
                                {billFile ? <CheckCircle2 className="w-6 h-6" /> : <Download className="w-6 h-6 rotate-180" />}
                              </div>
                              <p className={`text-xs font-black uppercase tracking-widest ${billFile ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-900'}`}>
                                {billFile ? `Đã chọn: ${billFile.name}` : 'Nhấp hoặc kéo thả ảnh Bill vào đây'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {enrollmentStatus !== 'success' && (
              <div className="p-6 bg-slate-50 shrink-0">
                <button
                  onClick={handleEnroll}
                  disabled={enrollmentStatus === 'pending' || isGeneratingLink}
                  className={`w-full py-4 bg-[#2E3192] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all ${(enrollmentStatus === 'pending' || isGeneratingLink) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                >
                  {(enrollmentStatus === 'pending' || isGeneratingLink) ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : paymentMethod === 'payos' ? (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 fill-current" /> Thanh toán & Vào học ngay
                    </div>
                  ) : 'Xác nhận đăng ký'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
