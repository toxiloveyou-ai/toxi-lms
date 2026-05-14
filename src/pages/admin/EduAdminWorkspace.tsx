import React, { useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { 
  Users, BookOpen, Trophy, Settings, Plus, Search, 
  Edit, Trash2, Video, FileText, CheckCircle2, AlertCircle,
  GraduationCap, Upload, Mic, Layout, Sparkles, ShieldAlert,
  ChevronLeft, Save, X, Play, Loader2, Bot, AppWindow, 
  Layers, Terminal, BarChart3, Kanban, Image as ImageIcon,
  MessageSquare, Copy, Check, Filter, Database,
  UserPlus, UserCheck, Key, ArrowRight, Download, Info, Award,
  CreditCard, Wallet, RefreshCw, Target, Zap, ShieldCheck, Crop
} from 'lucide-react';


import { supabase } from '../../lib/supabase';

// --- TYPES ---
type TabType = 'dashboard' | 'courses' | 'enrollments' | 'classes' | 'accounts' | 'access_codes' | 'exams' | 'certificates' | 'toxi_tech' | 'final_project' | 'settings';


interface Course {
  id: string;
  title: string;
  category: string;
  level: string;
  status: string;
  lesson_count: number;
  student_count: number;
  description?: string;
  thumbnail_url?: string;
  format?: string;
  price: number;
  original_price?: number;
  outcomes_json?: string[];
  syllabus_json?: any[];
  teacher_id?: string;
  is_toxi_original?: boolean;
  payment_info?: {
    bank_name: string;
    account_number: string;
    account_holder: string;
    qr_template: string;
  };
  final_project_id?: string;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  module_name?: string;
  description?: string;
  order_index: number;
  content_type: 'video' | 'text' | 'quiz' | 'flashcard' | 'ai_prompt' | 'voice_task' | 'interactive';
  content_url?: string;
  prompt_template?: string;
  content_json?: {
    objectives?: string[];
    vocabulary?: { word: string; pinyin: string; mean: string }[];
    grammar?: { title: string; note: string }[];
    homework_id?: string;
  };
  duration_minutes?: number;
}

interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  script_sample: string;
  category: string;
  created_at: string;
}

interface Class {
  id: string;
  name: string;
  course_id: string;
  teacher_id?: string;
  status: string;
  start_date?: string;
  course_title?: string;
  schedule?: string;
  teacher_name?: string;
  student_count?: number;
  meeting_url?: string;
  syllabus_url?: string;
  announcements_json?: any[];
}

// --- MOCK DATA FOR NEW FEATURES ---
const MOCK_SUBMISSIONS = [
  { id: 's1', student: 'Lê Minh', type: 'screenshot', task: 'Chat với Doubao', status: 'pending', ai_score: 85, time: '2h trước' },
  { id: 's2', student: 'Trần Anh', type: 'audio', task: 'Bài vè Bài 4', status: 'pending', ai_score: 92, time: '5h trước' },
  { id: 's3', student: 'Hà Phương', type: 'text', task: 'Kịch bản Vlog', status: 'pending', ai_score: 70, time: '12h trước' },
];

export default function EduAdminWorkspace() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [userRole] = useState<'admin' | 'teacher'>('admin');

  // Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [activeTeachers, setActiveTeachers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  // Enrollment Management States
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollmentFilter, setEnrollmentFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('pending');
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [assigningClassId, setAssigningClassId] = useState<string>('');
  const [selectedPaymentHistory, setSelectedPaymentHistory] = useState<any[]>([]);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState<number>(0);
  const [newPaymentNotes, setNewPaymentNotes] = useState('');

  // Settings States
  const [paymentSettings, setPaymentSettings] = useState({
    bank_name: '',
    account_number: '',
    account_holder: '',
    qr_template: ''
  });

  // Account Management States
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [accountData, setAccountData] = useState({ fullName: '', phone: '', password: '', email: '' });
  const [savingAccount, setSavingAccount] = useState(false);

  // Access Code Management States
  const [accessCodes, setAccessCodes] = useState<any[]>([]);
  const [generatingCode, setGeneratingCode] = useState(false);

  // UI States
  const [view, setView] = useState<'list' | 'curriculum'>('list');
  const [curriculumTab, setCurriculumTab] = useState<'lessons' | 'project'>('lessons');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [classData, setClassData] = useState({
    course_id: '',
    name: '',
    start_date: '',
    teacher_id: '',
    schedule: '',
    status: 'upcoming' as 'active' | 'upcoming' | 'finished'
  });
  
  // Graduation Project States
  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState<Partial<ProjectTemplate>>({
    title: '',
    description: '',
    script_sample: '',
    category: 'Sơ cấp'
  });
  const [savingProject, setSavingProject] = useState(false);
  const [savingClass, setSavingClass] = useState(false);

  // Image Cropping States
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [loadingCrop, setLoadingCrop] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState<Class | null>(null);
  const [classMembers, setClassMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    activeEnrollments: 0,
    pendingEnrollments: 0,
    totalRevenue: 0,
    activeClasses: 0
  });

  useEffect(() => {
    fetchData();
    fetchTeachers();
  }, [activeTab]);

  async function fetchTeachers() {
    const [profRes, techRes] = await Promise.all([
      supabase.from('toxi_profiles').select('id, full_name').eq('role', 'teacher'),
      supabase.from('teachers').select('id, full_name')
    ]);
    
    const profiles = (profRes.data || []).map(t => ({ ...t, source: 'System' }));
    const legacy = (techRes.data || []).map(t => ({ ...t, source: 'Legacy' }));
    
    const merged = [...profiles, ...legacy];
    // Group by ID to handle overlaps, prioritizing System info
    const uniqueMap = new Map();
    merged.forEach(item => {
       if (!uniqueMap.has(item.id) || item.source === 'System') {
         uniqueMap.set(item.id, item);
       }
    });
    
    const sorted = Array.from(uniqueMap.values()).sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
    setTeachers(sorted);
    setActiveTeachers(sorted);
  }


  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob | null> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  async function fetchData() {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        fetchDashboardStats();
      } else if (activeTab === 'courses') {
        const { data } = await supabase
          .from('courses')
          .select('*, teachers(full_name)')
          .order('created_at', { ascending: false });
        
        const mappedCourses = data?.map((c: any) => ({
           ...c,
           teacher_name: c.teachers?.full_name || teachers.find(t => t.id === c.teacher_id)?.full_name || 'Chưa gán'
        })) || [];
        setCourses(mappedCourses);

        
        // Also fetch projects for the dropdown
        const { data: projData } = await supabase
          .from('edu_project_templates')
          .select('*');
        setProjectTemplates(projData || []);
      } else if (activeTab === 'classes') {
        const [clsRes, crsRes] = await Promise.all([
          supabase.from('edu_classes').select('*').order('created_at', { ascending: false }),
          supabase.from('courses').select('id, title')
        ]);


        if (clsRes.error) throw clsRes.error;
        if (crsRes.data) setCourses(crsRes.data as any);

        const mappedClasses = clsRes.data?.map((c: any) => ({
          ...c,
          course_title: courses.find(crs => crs.id === c.course_id)?.title || 'Khóa học không xác định',
          teacher_name: teachers.find(t => t.id === c.teacher_id)?.full_name || 'Chưa gán',
          student_count: 0 
        })) || [];
        setClasses(mappedClasses);

      } else if (activeTab === 'accounts') {
        const { data: profilesData } = await supabase
          .from('toxi_profiles')
          .select('*')
          .order('created_at', { ascending: false });
        setProfiles(profilesData || []);
      } else if (activeTab === 'enrollments') {
        const { data } = await supabase.from('course_enrollments').select('*, toxi_profiles(full_name), courses(title)').order('enrolled_at', { ascending: false });
        setEnrollments(data || []);
        fetchClassesForAssignment();
      } else if (activeTab === 'settings') {
        fetchSettings();
      } else if (activeTab === 'final_project') {
        const { data } = await supabase
          .from('edu_project_templates')
          .select('*')
          .order('created_at', { ascending: false });
        setProjectTemplates(data || []);
      } else if (activeTab === 'access_codes') {
        const { data } = await supabase
          .from('edu_access_codes')
          .select(`
            *,
            toxi_profiles:owner_id(full_name)
          `)
          .order('created_at', { ascending: false });
        setAccessCodes(data || []);
      } else if (activeTab === 'exams') {
        const { data } = await supabase
          .from('edu_final_exams')
          .select('*, courses(title)')
          .order('created_at', { ascending: false });
        setCourses(data || []); // Reusing courses state or create a new one
      } else if (activeTab === 'certificates') {
        const { data } = await supabase
          .from('edu_certificates')
          .select('*, toxi_profiles(full_name), courses(title)')
          .order('issue_date', { ascending: false });
        setEnrollments(data || []); // Reusing enrollments state for display or create a new one
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePromoteToTeacher(profile: any) {
    if (!confirm(`Xác nhận cấp quyền Giáo viên cho ${profile.full_name}?`)) return;
    try {
      // 1. Update role in profiles
      const { error: profileErr } = await supabase
        .from('toxi_profiles')
        .update({ 
           role: 'teacher',
           updated_at: new Date().toISOString() // Explicitly update to avoid trigger issues if any
        })
        .eq('id', profile.id);
      
      if (profileErr) throw profileErr;

      alert(`Đã cấp quyền Giáo viên cho ${profile.full_name} thành công!`);
      fetchData();
      fetchTeachers();
    } catch (err: any) {
      alert(`Lỗi phân quyền: ${err.message}`);
    }
  }

  async function fetchClassesForAssignment() {
    const { data } = await supabase
      .from('edu_classes')
      .select('id, name, course_id')
      .in('status', ['upcoming', 'active']);
    setAvailableClasses(data || []);
  }

  async function fetchClassDetails(cls: Class) {
    setSelectedClassDetail(cls);
    setLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from('edu_class_members')
        .select(`
          *,
          toxi_profiles (id, full_name, avatar_url, phone, target_exam)
        `)
        .eq('class_id', cls.id);
      
      if (error) throw error;
      setClassMembers(data || []);
    } catch (err: any) {
      alert(`Lỗi khi tải danh sách lớp: ${err.message}`);
    } finally {
      setLoadingMembers(false);
    }
  }

  async function handleRemoveFromClass(studentId: string, classId: string) {
    if (!confirm('Xác nhận xóa học viên khỏi lớp này?')) return;
    try {
      const { error } = await supabase
        .from('edu_class_members')
        .delete()
        .eq('student_id', studentId)
        .eq('class_id', classId);
      
      if (error) throw error;
      setClassMembers(prev => prev.filter(m => m.student_id !== studentId));
      fetchData(); // Refresh counts
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  }

  async function fetchDashboardStats() {
    try {
      const [students, enrollments, classesRes] = await Promise.all([
        supabase.from('toxi_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('course_enrollments').select('status, paid_amount'),
        supabase.from('edu_classes').select('status', { count: 'exact', head: true }).eq('status', 'active')
      ]);

      const totalRevenue = enrollments.data?.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0) || 0;
      const activeEn = enrollments.data?.filter(e => e.status === 'active').length || 0;
      const pendingEn = enrollments.data?.filter(e => e.status === 'pending').length || 0;

      setDashboardStats({
        totalStudents: students.count || 0,
        activeEnrollments: activeEn,
        pendingEnrollments: pendingEn,
        totalRevenue: totalRevenue,
        activeClasses: classesRes.count || 0
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  }

  async function handleUpdateClassDetails() {
    if (!selectedClassDetail) return;
    setSavingClass(true);
    try {
      const { error } = await supabase
        .from('edu_classes')
        .update({
          meeting_url: selectedClassDetail.meeting_url,
          schedule: selectedClassDetail.schedule,
          announcements_json: selectedClassDetail.announcements_json,
          status: selectedClassDetail.status
        })
        .eq('id', selectedClassDetail.id);
      
      if (error) throw error;
      alert("Cập nhật thông tin lớp thành công!");
      fetchData();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSavingClass(false);
    }
  }

  async function handleAddMemberToClass(studentId: string) {
    if (!selectedClassDetail) return;
    try {
      const { error } = await supabase
        .from('edu_class_members')
        .upsert({
          class_id: selectedClassDetail.id,
          student_id: studentId
        });
      
      if (error) throw error;
      fetchClassDetails(selectedClassDetail);
      fetchData();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  }

  async function handleAddAnnouncement(text: string) {
    if (!selectedClassDetail || !text.trim()) return;
    const newAnnouncement = {
      id: crypto.randomUUID(),
      text,
      created_at: new Date().toISOString()
    };
    const updatedAnnouncements = [newAnnouncement, ...(selectedClassDetail.announcements_json || [])];
    
    setSelectedClassDetail({
      ...selectedClassDetail,
      announcements_json: updatedAnnouncements
    });
    // Note: User needs to click Save to persist or we can auto-save
  }

  async function fetchEnrollments() {
    setLoading(true);
    try {
      let query = supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (id, title, thumbnail_url),
          toxi_profiles (id, full_name)
        `)
        .order('enrolled_at', { ascending: false });

      if (enrollmentFilter !== 'all') {
        query = query.eq('status', enrollmentFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let filteredData = data || [];
      if (enrollmentSearch) {
        filteredData = filteredData.filter(e => 
          e.toxi_profiles?.full_name?.toLowerCase().includes(enrollmentSearch.toLowerCase())
        );
      }
      setEnrollments(filteredData);
    } catch (err: any) {
      console.error('Error fetching enrollments:', err);
      alert(`Không thể tải danh sách đăng ký: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'enrollments') {
      fetchEnrollments();
    }
  }, [enrollmentFilter, enrollmentSearch]);

  async function fetchPaymentHistory(enrollmentId: string) {
    const { data, error } = await supabase
      .from('course_payment_history')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .order('created_at', { ascending: false });
    if (!error) setSelectedPaymentHistory(data || []);
  }

  async function handleAddPayment(enrollment: any) {
    if (newPaymentAmount <= 0) return;
    setIsRecordingPayment(true);
    try {
      const { error } = await supabase.from('course_payment_history').insert([{
        enrollment_id: enrollment.id,
        amount: newPaymentAmount,
        status: 'verified',
        notes: newPaymentNotes || 'Thanh toán bổ sung'
      }]);

      if (error) throw error;

      // Update paid_amount in enrollment
      const newPaidAmount = Number(enrollment.paid_amount || 0) + Number(newPaymentAmount);
      await supabase
        .from('course_enrollments')
        .update({ paid_amount: newPaidAmount })
        .eq('id', enrollment.id);

      alert('Đã ghi nhận thanh toán thành công!');
      fetchPaymentHistory(enrollment.id);
      fetchEnrollments();
      setNewPaymentAmount(0);
      setNewPaymentNotes('');
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsRecordingPayment(false);
    }
  }

  async function handleEnrollmentAction(enroll: any, status: 'active' | 'rejected', targetClassId?: string) {
    try {
      const { error: enrollErr } = await supabase
        .from('course_enrollments')
        .update({ status })
        .eq('id', enroll.id);

      if (enrollErr) throw enrollErr;

      // 1. If active and class selected, add to class_members
      if (status === 'active' && targetClassId) {
        const { error: memberErr } = await supabase
          .from('edu_class_members')
          .upsert([{
            class_id: targetClassId,
            student_id: enroll.user_id
          }], { onConflict: 'class_id,student_id' });
        
        if (memberErr) console.error('Error adding to class members:', memberErr);
      }

      // 2. Update payment history status
      await supabase
        .from('course_payment_history')
        .update({ status: status === 'active' ? 'verified' : 'rejected' })
        .eq('enrollment_id', enroll.id)
        .eq('status', 'pending');

      // 3. Send notification
      await supabase.from('notifications').insert([{
        user_id: enroll.user_id,
        title: status === 'active' ? '🎉 Đăng ký thành công!' : '❌ Đơn đăng ký bị từ chối',
        message: status === 'active' 
          ? `Khóa học "${enroll.courses?.title || 'đã chọn'}" của bạn đã được kích hoạt. Hãy bắt đầu học ngay!`
          : `Rất tiếc, đơn đăng ký khóa học "${enroll.courses?.title || 'đã chọn'}" của bạn không được chấp nhận. Vui lòng liên hệ hỗ trợ.`,
        type: status === 'active' ? 'success' : 'error'
      }]);

      const studentName = enroll.toxi_profiles?.full_name || 'Học viên';
      alert(`Đã ${status === 'active' ? 'duyệt' : 'từ chối'} đơn đăng ký của ${studentName}.`);
      fetchEnrollments(); // Refresh list
    } catch (err: any) {
      console.error('Enrollment action error:', err);
      alert(`Lỗi khi xử lý: ${err.message}`);
    }
  }

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('edu_settings')
        .select('*')
        .eq('key', 'payment_info')
        .single();
      
      if (data) {
        setPaymentSettings(data.value);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }

  async function handleSaveSettings() {
    try {
      const { error } = await supabase
        .from('edu_settings')
        .upsert([{ key: 'payment_info', value: paymentSettings }]);
      
      if (error) throw error;
      alert('Đã lưu cài đặt thành công!');
    } catch (err: any) {
      alert(`Lỗi khi lưu: ${err.message}`);
    }
  }

  async function handleToggleCourseStatus(courseId: string, currentStatus: string) {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: newStatus })
        .eq('id', courseId);
      if (error) throw error;
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: newStatus } : c));
    } catch (err: any) {
      alert(`Lỗi khi cập nhật trạng thái: ${err.message}`);
    }
  }

  // --- COURSE MANAGEMENT ---
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseFormData, setCourseFormData] = useState<Partial<Course>>({
    status: 'published',
    category: 'Tiếng Trung Ứng Dụng',
    level: 'Sơ cấp',
    is_toxi_original: true,
    payment_info: {
      bank_name: '',
      account_number: '',
      account_holder: '',
      qr_template: ''
    }
  });
  const [savingCourse, setSavingCourse] = useState(false);

  async function handleSaveProject() {
    if (!projectFormData.title) return;
    setSavingProject(true);
    try {
      const payload = {
        title: projectFormData.title,
        description: projectFormData.description,
        script_sample: projectFormData.script_sample,
        category: projectFormData.category
      };

      if (projectFormData.id) {
        const { error } = await supabase.from('edu_project_templates').update(payload).eq('id', projectFormData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('edu_project_templates').insert([payload]);
        if (error) throw error;
      }

      setIsProjectModalOpen(false);
      setProjectFormData({ title: '', description: '', script_sample: '', category: 'Sơ cấp' });
      fetchData();
    } catch (err: any) {
      alert(`Lỗi khi lưu dự án: ${err.message}`);
    } finally {
      setSavingProject(false);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm('Bạn có chắc muốn xóa dự án này?')) return;
    const { error } = await supabase.from('edu_project_templates').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  }

  async function handleSaveCourse() {
    if (!courseFormData.title) {
      alert('Vui lòng nhập tiêu đề khóa học');
      return;
    }

    setSavingCourse(true);
    try {
      // Clean up virtual fields that don't exist in the database table
      const { teachers, teacher_name, lesson_count, student_count, ...dataToSave } = courseFormData as any;

      if (courseFormData.id) {
        const { error } = await supabase
          .from('courses')
          .update(dataToSave)
          .eq('id', courseFormData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('courses')
          .insert([dataToSave]);
        if (error) throw error;
      }
      setIsCourseModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(`Lỗi khi lưu khóa học: ${err.message}`);
    } finally {
      setSavingCourse(false);
    }
  }

  const openCourseEdit = (course: Course) => {
    setCourseFormData(course);
    setIsCourseModalOpen(true);
  };

  const openCourseCreate = () => {
    setCourseFormData({
      status: 'published',
      category: 'Tiếng Trung Ứng Dụng',
      level: 'Sơ cấp',
      format: 'Online Live',
      is_toxi_original: true,
      price: 0,
      lesson_count: 0
    });
    setIsCourseModalOpen(true);
  };

  async function handleSaveClass() {
    if (!classData.course_id || !classData.name || !classData.teacher_id) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    
    setSavingClass(true);
    try {
      const payload = {
        course_id: classData.course_id,
        name: classData.name,
        start_date: classData.start_date || null,
        teacher_id: classData.teacher_id,
        schedule: classData.schedule,
        status: classData.status
      };
      
      if (editingClassId) {
        const { error } = await supabase
          .from('edu_classes')
          .update(payload)
          .eq('id', editingClassId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('edu_classes').insert([payload]);
        if (error) throw error;
      }
      
      setIsClassModalOpen(false);
      setEditingClassId(null);
      setClassData({ course_id: '', name: '', start_date: '', teacher_id: '', schedule: '', status: 'upcoming' });
      fetchData();
      alert(editingClassId ? "Cập nhật lớp học thành công!" : "Mở lớp học mới thành công!");
    } catch (err: any) {
      console.error("DEBUG: Lỗi lưu lớp chi tiết:", err);
      alert(`Lỗi khi lưu lớp: ${err.message || 'Vui lòng kiểm tra lại thông tin'}`);
      if (err.details) console.log("DEBUG Error Details:", err.details);
    } finally {
      setSavingClass(false);
    }
  }

  function openClassEdit(c: any) {
      setEditingClassId(c.id);
      setClassData({
         course_id: c.course_id,
         name: c.name,
         start_date: c.start_date || '',
         teacher_id: c.teacher_id,
         schedule: c.schedule || '',
         status: c.status
      });
      setIsClassModalOpen(true);
   }

  async function openCurriculum(course: Course) {
    setSelectedCourse(course);
    setView('curriculum');
    const { data } = await supabase.from('course_lessons').select('*').eq('course_id', course.id).order('order_index');
    setLessons(data || []);
  }

  const handleUseToxiTemplate = async () => {
    if (!selectedCourse) return;
    const templateData = [
      { title: 'Buổi 1: Khởi động & Khơi mở', module: 'Module 1: Nền tảng', type: 'video' },
      { title: 'Buổi 2: Bài khóa & Ứng dụng', module: 'Module 1: Nền tảng', type: 'video' },
      { title: 'Buổi 3: Ngữ pháp & Cấu trúc', module: 'Module 1: Nền tảng', type: 'video' },
      { title: 'Buổi 4: Toxi Tech & AI Lab', module: 'Module 2: Thực chiến AI', type: 'ai_prompt' },
      { title: 'Buổi 5: Thực hành & Phản xạ', module: 'Module 2: Thực chiến AI', type: 'interactive' },
      { title: 'Buổi 6: Kiểm tra & Review', module: 'Module 2: Thực chiến AI', type: 'text' }
    ];

    const newLessons = templateData.map((item, i) => ({
      course_id: selectedCourse.id,
      title: item.title,
      module_name: item.module,
      order_index: lessons.length + i + 1,
      content_type: item.type,
      duration_minutes: 45,
      content_json: {
        objectives: ["Nắm vững kiến thức trọng tâm", "Ứng dụng vào giao tiếp thực tế"],
        vocabulary: [{ word: "学习", pinyin: "xuéxí", mean: "Học tập" }]
      }
    }));
    
    const { data, error } = await supabase.from('course_lessons').insert(newLessons).select();
    if (error) alert(`Lỗi: ${error.message}`);
    if (data) setLessons([...lessons, ...data]);
  };

  async function handleAddLesson(moduleName?: string) {
    if (!selectedCourse) return;
    const newLesson = {
      course_id: selectedCourse.id,
      title: 'Bài học mới',
      module_name: moduleName || 'Chương 1: Mở đầu',
      order_index: lessons.length + 1,
      content_type: 'video',
      duration_minutes: 30
    };
    const { data, error } = await supabase.from('course_lessons').insert([newLesson]).select();
    if (error) alert(`Lỗi: ${error.message}`);
    if (data) setLessons([...lessons, ...data]);
  }

  async function handleDeleteLesson(id: string) {
    if (!confirm('Xác nhận xóa bài học này?')) return;
    const { error } = await supabase.from('course_lessons').delete().eq('id', id);
    if (error) alert(`Lỗi: ${error.message}`);
    else setLessons(lessons.filter(l => l.id !== id));
  }

  async function handleUpdateLesson(lesson: Lesson) {
    const { error } = await supabase.from('course_lessons').update(lesson).eq('id', lesson.id);
    if (error) alert(`Lỗi khi lưu: ${error.message}`);
    else {
      setLessons(lessons.map(l => l.id === lesson.id ? lesson : l));
    }
  }

  async function handleUpdateCourseProject(courseId: string, projectId: string | null) {
    if (!selectedCourse) return;
    const { error } = await supabase.from('courses').update({ final_project_id: projectId }).eq('id', courseId);
    if (error) alert(`Lỗi khi cập nhật dự án: ${error.message}`);
    else {
      setSelectedCourse({ ...selectedCourse, final_project_id: projectId || undefined });
      setCourses(courses.map(c => c.id === courseId ? { ...c, final_project_id: projectId || undefined } : c));
    }
  }

  async function handleGenerateAccessCode() {
    setGeneratingCode(true);
    try {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase
        .from('edu_access_codes')
        .insert([{
          code: newCode,
          status: 'active'
        }]);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(`Lỗi khi tạo mã: ${err.message}`);
    } finally {
      setGeneratingCode(false);
    }
  }

  async function handleDeleteAccessCode(id: string) {
    if (!confirm('Xác nhận xóa mã truy cập này?')) return;
    try {
      const { error } = await supabase
        .from('edu_access_codes')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setAccessCodes(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(`Lỗi khi xóa: ${err.message}`);
    }
  }

  async function handleCreateAccount() {
    if (!accountData.fullName || (!accountData.phone && !accountData.email) || !accountData.password) {
      alert("Vui lòng nhập Họ tên, Mật khẩu và Số điện thoại (hoặc Email)!");
      return;
    }
    
    setSavingAccount(true);
    try {
      const cleanPhone = accountData.phone.replace(/[^0-9]/g, '');
      const authEmail = accountData.email || `${cleanPhone}@toxi.edu.vn`;
      const secondarySupabase = supabase; 
      
      const { data, error } = await secondarySupabase.auth.signUp({
        email: authEmail,
        password: accountData.password,
        options: {
          data: {
            full_name: accountData.fullName,
            phone: cleanPhone,
            is_toxi_student: true
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('toxi_profiles').upsert([{
          id: data.user.id,
          full_name: accountData.fullName,
          phone: cleanPhone,
          is_toxi_student: true,
          role: 'student'
        }]);
        
        if (profileError) throw profileError;
      }
      
      alert(`Đã tạo tài khoản cho ${accountData.fullName} thành công!`);
      setIsAccountModalOpen(false);
      setAccountData({ fullName: '', phone: '', password: '', email: '' });
      fetchData();
    } catch (err: any) {
      alert(`Lỗi khi tạo tài khoản: ${err.message}`);
    } finally {
      setSavingAccount(false);
    }
  }

  async function handleUpdateAccount() {
    if (!editingProfile || !editingProfile.full_name) return;
    setSavingAccount(true);
    try {
      const { error } = await supabase
        .from('toxi_profiles')
        .update({
          full_name: editingProfile.full_name,
          phone: editingProfile.phone,
          target_exam: editingProfile.target_exam
        })
        .eq('id', editingProfile.id);

      if (error) throw error;
      
      alert("Cập nhật thông tin thành công!");
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSavingAccount(false);
    }
  }

  async function handleDeleteAccount(id: string, name: string) {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản của ${name}? Hành động này không thể hoàn tác.`)) return;
    try {
      // Delete from profiles
      const { error } = await supabase.from('toxi_profiles').delete().eq('id', id);
      if (error) throw error;

      // Note: Auth user deletion usually requires an Edge Function or Service Role
      alert("Đã xóa thông tin profile học viên thành công!");
      fetchData();
    } catch (err: any) {
      alert(`Lỗi khi xóa: ${err.message}`);
    }
  }

  async function handleResetPassword() {
    if (!editingProfile || !accountData.password) {
       alert("Vui lòng nhập mật khẩu mới!");
       return;
    }
    alert("Tính năng đặt lại mật khẩu trực tiếp yêu cầu quyền Admin cấp cao. Hiện tại bạn có thể cập nhật thông tin Profile học viên.");
    // In a real prod app, this would call an edge function like 'admin-reset-password'
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans flex">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-[#1E293B] text-slate-300 flex flex-col sticky top-0 h-screen shadow-2xl">
         <div className="p-8 border-b border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-[#2E3192] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">T</div>
               <span className="text-xl font-black text-white tracking-tight">Toxi <span className="text-orange-500">Admin</span></span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">LMS Ecosystem V4.0</p>
         </div>

         <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem active={activeTab === 'dashboard'} icon={BarChart3} label="Dashboard" onClick={() => setActiveTab('dashboard')} />
            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Hệ thống lõi</div>
            <NavItem active={activeTab === 'courses'} icon={BookOpen} label="Quản lý Khóa học" onClick={() => setActiveTab('courses')} />
            <NavItem active={activeTab === 'enrollments'} icon={UserCheck} label="Duyệt đơn đăng ký" onClick={() => setActiveTab('enrollments')} />
            <NavItem active={activeTab === 'toxi_tech'} icon={Bot} label="Toxi Tech Hub" onClick={() => setActiveTab('toxi_tech')} />
            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Đào tạo & Lớp học</div>
            <NavItem active={activeTab === 'classes'} icon={Users} label="Lớp & Học viên" onClick={() => setActiveTab('classes')} />
            <NavItem active={activeTab === 'accounts'} icon={UserPlus} label="Quản lý tài khoản" onClick={() => setActiveTab('accounts')} />
            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kỳ thi & Chứng chỉ</div>
            <NavItem active={activeTab === 'exams'} icon={ShieldCheck} label="Quản lý Kỳ thi" onClick={() => setActiveTab('exams')} />
            <NavItem active={activeTab === 'certificates'} icon={Award} label="Danh sách Chứng chỉ" onClick={() => setActiveTab('certificates')} />
            <NavItem active={activeTab === 'final_project'} icon={Kanban} label="Dự án Tốt nghiệp" onClick={() => setActiveTab('final_project')} />

            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cấu hình</div>
            <NavItem active={activeTab === 'access_codes'} icon={Key} label="Quản lý Mã truy cập" onClick={() => setActiveTab('access_codes')} />
            <NavItem active={activeTab === 'settings'} icon={Settings} label="Cài đặt hệ thống" onClick={() => setActiveTab('settings')} />
         </nav>

         <div className="p-4 border-t border-slate-700/50">
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full border-2 border-orange-500 overflow-hidden shrink-0">
                  <img src="https://i.pravatar.cc/150?u=admin" className="w-full h-full object-cover" alt="Admin" />
               </div>
               <div className="min-w-0">
                  <p className="text-xs font-black text-white truncate">Lê Đình Hiểu</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Super Admin</p>
               </div>
               <Key className="w-4 h-4 text-slate-500 ml-auto cursor-pointer hover:text-white transition-colors" />
            </div>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-8 space-y-8 overflow-y-auto max-h-screen">
         
         {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <HeaderSection title="Tổng quan Hệ thống" desc="Thống kê hiệu suất đào tạo và tương tác Toxi Tech." />
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Tổng Học viên" value={dashboardStats.totalStudents.toLocaleString()} icon={Users} color="text-blue-500" />
                  <StatCard label="Học viên Chính thức" value={dashboardStats.activeEnrollments.toLocaleString()} icon={CheckCircle2} color="text-emerald-500" />
                  <StatCard label="Đơn hàng Chờ duyệt" value={dashboardStats.pendingEnrollments.toLocaleString()} icon={AlertCircle} color="text-orange-500" />
                  <StatCard label="Tổng Doanh thu" value={`${(dashboardStats.totalRevenue / 1000000).toFixed(1)}M`} icon={Wallet} color="text-indigo-500" />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Intelligent Insights */}
                  <div className="lg:col-span-4 bg-[#1E293B] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Sparkles className="w-40 h-40" /></div>
                     <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20"><Sparkles className="w-6 h-6" /></div>
                           <h3 className="text-xl font-black tracking-tight">Toxi Intelligence</h3>
                        </div>
                        
                        <div className="space-y-6">
                           <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-2">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Phân tích Tăng trưởng</p>
                              <p className="text-sm font-bold leading-relaxed text-slate-200">
                                 Hệ thống ghi nhận <span className="text-emerald-400">+{dashboardStats.pendingEnrollments} đơn đăng ký mới</span> trong 24h qua. Đề xuất ưu tiên duyệt đơn để học viên kịp tham gia lớp HSK.
                              </p>
                           </div>
                           <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-2">
                              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Tối ưu Tài nguyên</p>
                              <p className="text-sm font-bold leading-relaxed text-slate-200">
                                 Hiện có <span className="text-orange-400">{dashboardStats.activeClasses} lớp đang hoạt động</span>. Tỷ lệ lấp đầy đạt 82%. Có thể mở thêm 1 lớp Sơ cấp vào cuối tuần.
                              </p>
                           </div>
                           <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-2">
                              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Toxi Tech Health</p>
                              <p className="text-sm font-bold leading-relaxed text-slate-200">
                                 Tương tác AI đạt mức cao nhất vào 21h-23h hàng ngày. Hệ thống đang vận hành ổn định.
                              </p>
                           </div>
                        </div>

                        <button className="w-full py-4 bg-white text-[#1E293B] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">
                           Xem báo cáo chi tiết
                        </button>
                     </div>
                  </div>

                  {/* Right: Submissions & Progress */}
                  <div className="lg:col-span-8 space-y-8">
                     <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                           <h3 className="text-lg font-black text-slate-800 flex items-center gap-3"><Layers className="w-6 h-6 text-[#2E3192]" /> Hàng đợi chấm bài 2.0</h3>
                           <span className="px-4 py-1.5 bg-indigo-50 text-[#2E3192] rounded-full text-[10px] font-black uppercase tracking-widest">12 bài chưa chấm</span>
                        </div>
                        <div className="p-4 space-y-3">
                           {MOCK_SUBMISSIONS.map(sub => (
                              <div key={sub.id} className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center justify-between hover:border-[#2E3192]/30 transition-all group">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sub.type === 'screenshot' ? 'bg-blue-50 text-blue-500' : sub.type === 'audio' ? 'bg-orange-50 text-orange-500' : 'bg-purple-50 text-purple-500'}`}>
                                       {sub.type === 'screenshot' && <ImageIcon className="w-6 h-6" />}
                                       {sub.type === 'audio' && <Mic className="w-6 h-6" />}
                                       {sub.type === 'text' && <FileText className="w-6 h-6" />}
                                    </div>
                                    <div>
                                       <p className="font-black text-slate-800 text-sm">{sub.student}</p>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sub.task} • {sub.time}</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-6">
                                    <div className="text-right">
                                       <div className="flex items-center gap-1 justify-end"><Sparkles className="w-3 h-3 text-emerald-500" /><span className="text-sm font-black text-emerald-600">{sub.ai_score}</span></div>
                                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Scored</p>
                                    </div>
                                    <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2E3192] transition-colors shadow-lg">Chấm bài</button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'courses' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {view === 'list' ? (
                  <>
                    <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                       <HeaderSection title="Quản lý Khóa học" desc="Xây dựng lộ trình 22 buổi học và giáo trình thực chiến." />
                       <button onClick={openCourseCreate} className="px-6 py-4 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-500/20 flex items-center gap-2 hover:scale-[1.02] transition-transform">
                          <Plus className="w-5 h-5" /> Thêm khóa học
                       </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                       {courses.map(course => (
                          <div key={course.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group">
                             <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                   <span className="px-3 py-1 bg-[#2E3192] text-white rounded-lg text-[9px] font-black uppercase tracking-widest mb-3 inline-block">{course.category}</span>
                                   <h4 className="text-white font-black text-xl leading-tight">{course.title}</h4>
                                </div>
                             </div>
                             <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                   <div className="flex items-center gap-2"><Layout className="w-4 h-4" /> {course.lesson_count || 0} bài học</div>
                                   <div className="flex items-center gap-2">
                                      <span className={`px-2 py-0.5 rounded-md ${course.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                         {course.status === 'published' ? 'Hoạt động' : 'Bản nháp'}
                                      </span>
                                   </div>
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-slate-50">
                                   <button onClick={() => openCurriculum(course)} className="flex-1 py-3 bg-[#2E3192] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-colors">Xây giáo trình</button>
                                   <button 
                                     onClick={() => handleToggleCourseStatus(course.id, course.status)}
                                     title={course.status === 'published' ? 'Gỡ bài' : 'Duyệt bài'}
                                     className={`p-3 rounded-xl transition-colors ${course.status === 'published' ? 'bg-red-50 text-red-400' : 'bg-emerald-50 text-emerald-400'}`}
                                   >
                                      {course.status === 'published' ? <X className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                   </button>
                                   <button onClick={() => openCourseEdit(course)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100"><Settings className="w-5 h-5" /></button>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                  </>
               ) : (
                  <div className="space-y-6 animate-in slide-in-from-left-4">
                     <div className="flex items-center gap-6 mb-8">
                        <button onClick={() => setView('list')} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm"><ChevronLeft className="w-6 h-6" /></button>
                        <div>
                           <h2 className="text-3xl font-black text-[#2E3192] tracking-tight">Curriculum Builder</h2>
                           <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{selectedCourse?.title}</p>
                        </div>
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2 ml-10">
                           <button onClick={() => setCurriculumTab('lessons')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${curriculumTab === 'lessons' ? 'bg-white text-[#2E3192] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Lộ trình bài học</button>
                           <button onClick={() => setCurriculumTab('project')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${curriculumTab === 'project' ? 'bg-white text-[#2E3192] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Dự án Tốt nghiệp</button>
                        </div>
                        {curriculumTab === 'lessons' && (
                          <button onClick={handleUseToxiTemplate} className="ml-auto flex items-center gap-2 px-6 py-3 bg-indigo-50 text-[#2E3192] rounded-2xl text-[11px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all">
                             <Sparkles className="w-4 h-4" /> Dùng TOXI Template
                          </button>
                        )}
                     </div>
                     <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        <div className="xl:col-span-8 space-y-6">
                             {curriculumTab === 'lessons' ? (
                                <>
                                  {/* Nhóm bài học theo Module */}
                                  {Object.entries(
                                    lessons.reduce((acc, lesson) => {
                                      const mod = lesson.module_name || 'Chương chưa phân loại';
                                      if (!acc[mod]) acc[mod] = [];
                                      acc[mod].push(lesson);
                                      return acc;
                                    }, {} as Record<string, Lesson[]>)
                                  ).map(([moduleName, moduleLessons]) => (
                                    <div key={moduleName} className="space-y-6">
                                      <div className="flex items-center gap-4 px-6 py-4 bg-slate-900 text-white rounded-[2rem] shadow-xl">
                                        <Layers className="w-5 h-5 text-orange-400" />
                                        <input 
                                          className="bg-transparent border-none text-sm font-black uppercase tracking-widest focus:ring-0 w-full"
                                          defaultValue={moduleName}
                                          onBlur={(e) => {
                                            const newName = e.target.value;
                                            moduleLessons.forEach(l => handleUpdateLesson({...l, module_name: newName}));
                                          }}
                                        />
                                      </div>

                                      <div className="space-y-6 pl-8 border-l-2 border-dashed border-slate-200">
                                        {moduleLessons.map((lesson, idx) => (
                                          <div key={lesson.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6 group hover:border-[#2E3192]/30 transition-all">
                                             <div className="flex items-start gap-6">
                                                <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 text-lg group-hover:bg-[#2E3192] group-hover:text-white transition-all">{idx + 1}</div>
                                                <div className="flex-1 space-y-4">
                                                   <div className="flex items-center justify-between">
                                                     <div className="flex-1">
                                                       <input 
                                                          className="text-xl font-black text-slate-800 border-none p-0 focus:ring-0 w-full bg-transparent" 
                                                          defaultValue={lesson.title} 
                                                          onBlur={(e) => handleUpdateLesson({...lesson, title: e.target.value})}
                                                       />
                                                       <input 
                                                          className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none p-0 focus:ring-0 w-full bg-transparent mt-1" 
                                                          placeholder="Mô tả ngắn về bài học..."
                                                          defaultValue={lesson.description || ''} 
                                                          onBlur={(e) => handleUpdateLesson({...lesson, description: e.target.value})}
                                                       />
                                                     </div>
                                                     <div className="flex items-center gap-2">
                                                       <div className="flex items-center gap-1 px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400">
                                                          <RefreshCw className="w-3 h-3" />
                                                          <input 
                                                            type="number"
                                                            defaultValue={lesson.duration_minutes || 30}
                                                            onBlur={(e) => handleUpdateLesson({...lesson, duration_minutes: Number(e.target.value)})}
                                                            className="w-8 bg-transparent border-none p-0 text-center focus:ring-0"
                                                          />
                                                          MIN
                                                       </div>
                                                       <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                                     </div>
                                                   </div>

                                                   <div className="flex flex-wrap gap-2">
                                                      <TypeBadge active={lesson.content_type === 'video'} icon={Video} label="Video" onClick={() => handleUpdateLesson({...lesson, content_type: 'video'})} />
                                                      <TypeBadge active={lesson.content_type === 'text'} icon={FileText} label="PDF/Text" onClick={() => handleUpdateLesson({...lesson, content_type: 'text'})} />
                                                      <TypeBadge active={lesson.content_type === 'ai_prompt'} icon={Terminal} label="AI Prompt" onClick={() => handleUpdateLesson({...lesson, content_type: 'ai_prompt'})} />
                                                      <TypeBadge active={lesson.content_type === 'interactive'} icon={Zap} label="Interactive" onClick={() => handleUpdateLesson({...lesson, content_type: 'interactive'})} />
                                                      <TypeBadge active={lesson.content_type === 'voice_task'} icon={Mic} label="Voice Task" onClick={() => handleUpdateLesson({...lesson, content_type: 'voice_task'})} />
                                                   </div>

                                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                                                      <div className="space-y-4">
                                                         <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                               <Video className="w-3 h-3" /> Nguồn Nội dung (YouTube/PDF Link)
                                                            </label>
                                                            <input 
                                                               type="text"
                                                               defaultValue={lesson.content_url || ''}
                                                               onBlur={(e) => handleUpdateLesson({...lesson, content_url: e.target.value})}
                                                               placeholder="https://..."
                                                               className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 focus:bg-white outline-none transition-all"
                                                            />
                                                         </div>
                                                         <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                               <Sparkles className="w-3 h-3 text-indigo-500" /> AI Prompt Template
                                                            </label>
                                                            <textarea 
                                                               defaultValue={lesson.prompt_template || ''}
                                                               onBlur={(e) => handleUpdateLesson({...lesson, prompt_template: e.target.value})}
                                                               placeholder="Bạn là trợ lý tiếng Trung Toxi..."
                                                               className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:bg-white outline-none transition-all h-24"
                                                            />
                                                         </div>
                                                      </div>

                                                      <div className="space-y-4">
                                                         <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                                                            <p className="text-[10px] font-black text-[#2E3192] uppercase tracking-widest flex items-center gap-2">
                                                               <Target className="w-3.5 h-3.5" /> Nội dung bài học (JSON)
                                                            </p>
                                                            <textarea 
                                                               defaultValue={lesson.content_json ? JSON.stringify(lesson.content_json, null, 2) : ''}
                                                               onBlur={(e) => {
                                                                  try {
                                                                     const json = e.target.value ? JSON.parse(e.target.value) : null;
                                                                     handleUpdateLesson({...lesson, content_json: json});
                                                                  } catch (err) {
                                                                     alert('Định dạng JSON không hợp lệ!');
                                                                  }
                                                               }}
                                                               placeholder='{ "objectives": ["Mục tiêu 1"], "vocabulary": [...] }'
                                                               className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-mono focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all h-36"
                                                            />
                                                            <div className="flex gap-2">
                                                               <button 
                                                                  onClick={() => {
                                                                     const template = {
                                                                        objectives: ["Phát âm chuẩn vận mẫu", "Giao tiếp chào hỏi cơ bản"],
                                                                        vocabulary: [{ word: "你好", pinyin: "nǐ hǎo", mean: "Xin chào" }],
                                                                        grammar: [{ title: "Cấu trúc A + B", note: "Dùng để..." }]
                                                                     };
                                                                     handleUpdateLesson({...lesson, content_json: template});
                                                                     fetchData(); // Refresh to show in textarea
                                                                  }}
                                                                  className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                                                               >
                                                                  Dùng Template mẫu
                                                               </button>
                                                            </div>
                                                         </div>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                        ))}
                                        <button 
                                          onClick={() => handleAddLesson(moduleName)} 
                                          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black uppercase text-[10px] tracking-widest hover:border-[#2E3192] hover:text-[#2E3192] transition-all"
                                        >
                                          + Thêm bài vào {moduleName}
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  <div className="pt-10">
                                    <button 
                                      onClick={() => {
                                        const newModuleName = prompt('Nhập tên Module mới:');
                                        if (newModuleName) handleAddLesson(newModuleName);
                                      }} 
                                      className="w-full py-10 bg-[#2E3192] text-white rounded-[3rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 hover:scale-[1.01] active:scale-95 transition-all flex flex-col items-center gap-3"
                                    >
                                      <Plus className="w-8 h-8" />
                                      Tạo Module & Bài học mới
                                    </button>
                                  </div>
                                </>
                             ) : (
                                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 animate-in slide-in-from-right-4 duration-500">
                                   <div className="space-y-2">
                                      <h3 className="text-2xl font-black text-[#2E3192]">Cấu hình Dự án Tốt nghiệp</h3>
                                      <p className="text-sm font-medium text-slate-400 italic">Thiết lập cột mốc thực chiến cuối cùng để học viên hoàn thành khóa học.</p>
                                   </div>

                                   <div className="space-y-8">
                                      <div className="space-y-3">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Lựa chọn Dự án mẫu</label>
                                         <select 
                                            value={selectedCourse?.final_project_id || ''} 
                                            onChange={e => handleUpdateCourseProject(selectedCourse!.id, e.target.value || null)} 
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] font-black text-[#2E3192] outline-none focus:border-[#2E3192] transition-all shadow-sm"
                                         >
                                            <option value="">-- Không có dự án tốt nghiệp --</option>
                                            {projectTemplates.map(p => <option key={p.id} value={p.id}>{p.title} ({p.category})</option>)}
                                         </select>
                                      </div>

                                      {selectedCourse?.final_project_id && (
                                         <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-200 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                                            {projectTemplates.find(p => p.id === selectedCourse.final_project_id) && (
                                               <>
                                                  <div className="flex items-center justify-between">
                                                     <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#2E3192] text-white rounded-xl flex items-center justify-center"><Target className="w-5 h-5" /></div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung Dự án đang gán</span>
                                                     </div>
                                                     <span className="px-4 py-1.5 bg-orange-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Cấp độ: {projectTemplates.find(p => p.id === selectedCourse.final_project_id)?.category}</span>
                                                  </div>
                                                  <div className="space-y-4">
                                                     <h4 className="text-2xl font-black text-slate-800 tracking-tight">{projectTemplates.find(p => p.id === selectedCourse.final_project_id)?.title}</h4>
                                                     <p className="text-sm text-slate-500 font-medium leading-relaxed">{projectTemplates.find(p => p.id === selectedCourse.final_project_id)?.description}</p>
                                                  </div>
                                                  <div className="pt-8 border-t border-slate-200">
                                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <FileText className="w-4 h-4" /> Kịch bản mẫu cho học viên:
                                                     </p>
                                                     <div className="p-6 bg-white border border-slate-100 rounded-2xl text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap italic">
                                                        {projectTemplates.find(p => p.id === selectedCourse.final_project_id)?.script_sample}
                                                     </div>
                                                  </div>
                                               </>
                                            )}
                                         </div>
                                      )}
                                   </div>
                                </div>
                             )}
                        </div>
                        <div className="xl:col-span-4 space-y-6">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-8">
                               <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Mẹo Toxi Tech</h4>
                               <div className="space-y-4">
                                  <HelperItem icon={Terminal} title="AI Prompt" text="Luôn kèm theo [Context] và [Rule] để Doubao không đi quá xa kịch bản." />
                               </div>
                               <div className="mt-10 pt-8 border-t border-slate-50 space-y-3">
                                  <button onClick={() => setView('list')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Hoàn tất & Lưu</button>
                               </div>
                            </div>
                         </div>
                     </div>
                  </div>
               )}
            </div>
         )}

         {activeTab === 'enrollments' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                  <HeaderSection title="Duyệt đơn đăng ký" desc="Xác nhận thanh toán và kích hoạt khóa học cho học viên." />
                  
                  <div className="flex flex-wrap items-center gap-4">
                     <button 
                        onClick={() => fetchEnrollments()}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"
                        title="Làm mới danh sách"
                     >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                     </button>
                     <div className="flex bg-slate-100 p-1 rounded-xl">
                        {(['pending', 'active', 'rejected', 'all'] as const).map(f => (
                           <button 
                              key={f}
                              onClick={() => setEnrollmentFilter(f)}
                              className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${enrollmentFilter === f ? 'bg-white text-[#2E3192] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                           >
                              {f === 'pending' ? 'Chờ duyệt' : f === 'active' ? 'Đã duyệt' : f === 'rejected' ? 'Từ chối' : 'Tất cả'}
                           </button>
                        ))}
                     </div>

                     <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#2E3192] transition-colors" />
                        <input 
                           type="text" 
                           placeholder="Tìm tên học viên..."
                           value={enrollmentSearch}
                           onChange={(e) => setEnrollmentSearch(e.target.value)}
                           className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10 outline-none w-64 transition-all"
                        />
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Học viên</th>
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Khóa học</th>
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Thanh toán</th>
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Trạng thái</th>
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Thao tác</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {loading ? (
                           <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Đang tải danh sách...</td></tr>
                        ) : enrollments.length === 0 ? (
                           <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">Không có đơn đăng ký nào phù hợp.</td></tr>
                        ) : (
                           enrollments.map(e => (
                              <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                                 <td className="px-8 py-6">
                                    <p className="font-black text-slate-800 text-sm">{e.toxi_profiles?.full_name || 'Học viên'}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{e.user_id.slice(0, 8)}</p>
                                 </td>
                                 <td className="px-8 py-6">
                                    <p className="text-sm font-bold text-[#2E3192]">{e.courses?.title}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(e.enrolled_at).toLocaleDateString('vi-VN')}</p>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                       <div className={`p-1.5 rounded-lg ${e.payment_plan === 'installments' ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-[#2E3192]'}`}>
                                          {e.payment_plan === 'installments' ? <CreditCard className="w-3.5 h-3.5" /> : <Wallet className="w-3.5 h-3.5" />}
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-700">{Number(e.paid_amount || 0).toLocaleString('vi-VN')}₫</p>
                                          <p className="text-[8px] font-bold text-slate-400 uppercase">/{Number(e.total_amount || 0).toLocaleString('vi-VN')}₫</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1">
                                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-center ${
                                          e.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                                          e.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                       }`}>
                                          {e.status === 'active' ? 'Đã duyệt' : e.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                                       </span>
                                       {e.payment_status === 'paid' && e.order_code ? (
                                          <span className="px-3 py-0.5 rounded-md text-[7px] font-black uppercase bg-indigo-100 text-indigo-700 text-center flex items-center justify-center gap-1">
                                             <ShieldCheck className="w-2.5 h-2.5" /> Hệ thống xác thực
                                          </span>
                                       ) : (
                                          <span className={`px-3 py-0.5 rounded-md text-[8px] font-bold uppercase text-center ${
                                             e.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                          }`}>
                                             {e.payment_status === 'paid' ? 'Đã thu tiền' : 'Chưa thu tiền'}
                                          </span>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    {e.status === 'pending' && (
                                       <div className="flex justify-end gap-2">
                                          <button 
                                             onClick={() => {
                                                setSelectedEnrollment(e);
                                                fetchPaymentHistory(e.id);
                                             }}
                                             className="px-4 py-2 bg-[#2E3192] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md"
                                          >
                                             Xử lý đơn
                                          </button>
                                          <button 
                                             onClick={() => handleEnrollmentAction(e, 'rejected')}
                                             className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                          >
                                             <X className="w-4 h-4" />
                                          </button>
                                       </div>
                                    )}
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>

               {/* Modal xử lý đơn đăng ký */}
               {selectedEnrollment && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                       <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedEnrollment.order_code ? 'bg-indigo-600 text-white' : 'bg-orange-500 text-white'}`}>
                                {selectedEnrollment.order_code ? <Zap className="w-6 h-6 fill-current" /> : <CreditCard className="w-6 h-6" />}
                             </div>
                             <div>
                                <h3 className="text-xl font-black text-[#2E3192]">
                                   {selectedEnrollment.order_code ? 'Thanh toán PayOS (Tự động)' : 'Thanh toán Thủ công'}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                   Học viên: {selectedEnrollment.toxi_profiles?.full_name} 
                                   {selectedEnrollment.order_code && ` • Mã ĐH: #${selectedEnrollment.order_code}`}
                                </p>
                             </div>
                          </div>
                          <button onClick={() => setSelectedEnrollment(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                       </div>
                       
                       <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                          {/* Column 1: Info & Class */}
                          <div className="md:col-span-1 space-y-8">
                             <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khóa học đăng ký</p>
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                                      <img src={selectedEnrollment.courses?.thumbnail_url} className="w-full h-full object-cover" />
                                   </div>
                                   <p className="font-black text-slate-800 text-sm leading-tight">{selectedCourse?.title || selectedEnrollment.courses?.title}</p>
                                </div>
                             </div>

                             <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Xếp vào lớp học</p>
                                <select 
                                   value={assigningClassId}
                                   onChange={(e) => setAssigningClassId(e.target.value)}
                                   className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                >
                                   <option value="">-- Chọn lớp học phù hợp --</option>
                                   {availableClasses.filter(c => c.course_id === selectedEnrollment.course_id).map(c => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                   ))}
                                </select>
                                <p className="text-[9px] text-slate-400 italic">Học viên sẽ được thêm vào lớp ngay khi duyệt.</p>
                             </div>
                          </div>

                          {/* Column 2 & 3: Bill Image & Payment Records */}
                          <div className="md:col-span-2 space-y-6">
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Minh chứng mới nhất</p>
                                   {selectedEnrollment.bill_url ? (
                                      <div className="relative group aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden border-2 border-dashed border-slate-200">
                                         <img src={selectedEnrollment.bill_url} className="w-full h-full object-contain" />
                                         <a 
                                            href={selectedEnrollment.bill_url} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black text-xs uppercase tracking-widest transition-all backdrop-blur-[2px]"
                                         >
                                            Xem ảnh đầy đủ
                                         </a>
                                      </div>
                                   ) : (
                                      <div className="aspect-video bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-3">
                                         <ImageIcon className="w-10 h-10" />
                                         <p className="text-[10px] font-black uppercase">Không có ảnh bill</p>
                                      </div>
                                   )}
                                </div>

                                <div className="space-y-4">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lịch sử đóng phí</p>
                                   <div className="max-h-[250px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                                      {selectedPaymentHistory.map((pay, i) => (
                                         <div key={pay.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                                            <div>
                                               <p className="text-xs font-black text-slate-800">{Number(pay.amount).toLocaleString('vi-VN')}₫</p>
                                               <p className="text-[9px] font-bold text-slate-400 uppercase">{pay.notes || `Đợt ${selectedPaymentHistory.length - i}`}</p>
                                            </div>
                                            <div className="text-right">
                                               <p className="text-[9px] font-black text-emerald-500 uppercase">{pay.status}</p>
                                               <p className="text-[8px] font-bold text-slate-300">{new Date(pay.created_at).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                         </div>
                                      ))}
                                      {selectedPaymentHistory.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-4">Chưa có bản ghi thanh toán.</p>}
                                   </div>

                                   {/* Quick Record Payment */}
                                   <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-3xl space-y-3">
                                      <p className="text-[9px] font-black text-[#2E3192] uppercase tracking-widest">Ghi nhận đợt tiếp theo</p>
                                      <div className="flex gap-2">
                                         <input 
                                            type="number" 
                                            placeholder="Số tiền..." 
                                            value={newPaymentAmount || ''}
                                            onChange={(e) => setNewPaymentAmount(Number(e.target.value))}
                                            className="flex-1 px-4 py-2 rounded-xl text-xs font-bold border-none focus:ring-2 focus:ring-[#2E3192]/20"
                                         />
                                         <button 
                                            onClick={() => handleAddPayment(selectedEnrollment)}
                                            disabled={isRecordingPayment || !newPaymentAmount}
                                            className="px-4 py-2 bg-[#2E3192] text-white rounded-xl text-[10px] font-black uppercase disabled:opacity-50"
                                         >
                                            Lưu
                                         </button>
                                      </div>
                                      <input 
                                         type="text" 
                                         placeholder="Ghi chú (VD: Đợt 2, Phụ phí...)" 
                                         value={newPaymentNotes}
                                         onChange={(e) => setNewPaymentNotes(e.target.value)}
                                         className="w-full px-4 py-2 rounded-xl text-[10px] font-medium border-none focus:ring-2 focus:ring-[#2E3192]/20"
                                      />
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                          <button 
                             onClick={() => {
                                handleEnrollmentAction(selectedEnrollment, 'active', assigningClassId);
                                setSelectedEnrollment(null);
                             }}
                             className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                          >
                             Xác nhận thanh toán & Kích hoạt
                          </button>
                          <button 
                             onClick={() => {
                                handleEnrollmentAction(selectedEnrollment, 'rejected');
                                setSelectedEnrollment(null);
                             }}
                             className="px-8 py-4 bg-white text-red-500 border-2 border-red-100 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-50 transition-all"
                          >
                             Từ chối đơn
                          </button>
                       </div>
                    </div>
                 </div>
               )}
            </div>
         )}

         {activeTab === 'classes' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               {!selectedClassDetail ? (
                  <>
                    <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                       <HeaderSection title="Lớp & Học viên" desc="Quản lý danh sách lớp học và tương tác giảng dạy." />
                       <div className="flex items-center gap-4">
                          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2 mr-4">
                             <StatBadge label="Đang học" value={classes.filter(c => c.status === 'active').length} color="bg-emerald-50 text-emerald-600" />
                             <StatBadge label="Sắp khai giảng" value={classes.filter(c => c.status === 'upcoming').length} color="bg-orange-50 text-orange-600" />
                          </div>
                          <button onClick={() => setIsClassModalOpen(true)} className="px-6 py-4 bg-[#2E3192] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:scale-[1.02] transition-transform">
                             <Plus className="w-5 h-5" /> Mở lớp mới
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {classes.map(c => (
                          <div key={c.id} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden group hover:border-[#2E3192]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col">
                             <div className="p-8 space-y-5 flex-1">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
                                      <span className={`text-[10px] font-black uppercase tracking-widest ${c.status === 'active' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                         {c.status === 'active' ? 'Đang hoạt động' : 'Sắp khai giảng'}
                                      </span>
                                   </div>
                                   <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full text-slate-400">
                                      <Users className="w-3.5 h-3.5" />
                                      <span className="text-[10px] font-black">{c.student_count || 0}</span>
                                   </div>
                                </div>
                                <div>
                                   <h4 className="text-2xl font-black text-slate-800 leading-tight group-hover:text-[#2E3192] transition-colors">{c.name}</h4>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                      <BookOpen className="w-3 h-3" /> {c.course_title}
                                   </p>
                                </div>

                                <div className="pt-6 space-y-4 border-t border-slate-50">
                                   <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                      <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-orange-400" /> {c.teacher_name || 'Chưa gán'}</div>
                                      <div className="flex items-center gap-2 font-mono">{c.schedule || 'Chưa có lịch'}</div>
                                   </div>
                                   {c.meeting_url && (
                                      <a href={c.meeting_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-2xl text-[10px] font-black text-[#2E3192] uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                                         <Video className="w-4 h-4" /> Link lớp học trực tuyến
                                      </a>
                                   )}
                                </div>
                             </div>
                             <div className="p-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-3">
                                <button onClick={() => fetchClassDetails(c)} className="py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#2E3192] hover:text-white hover:border-[#2E3192] transition-all flex items-center justify-center gap-2">
                                   <Layout className="w-4 h-4" /> Quản lý lớp
                                </button>
                                <button 
                                    onClick={() => openClassEdit(c)}
                                    className="py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 hover:border-indigo-600 transition-all flex items-center justify-center gap-2"
                                 >
                                    <Settings className="w-4 h-4" /> Cấu hình
                                 </button>
                             </div>
                          </div>
                       ))}
                       {classes.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest">Chưa có lớp học nào.</div>}
                    </div>
                  </>
               ) : (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                     {/* Class Detail Header */}
                     <div className="flex items-center gap-6">
                        <button onClick={() => setSelectedClassDetail(null)} className="w-14 h-14 bg-white border border-slate-200 rounded-[1.5rem] flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all group">
                           <ChevronLeft className="w-7 h-7 text-slate-400 group-hover:text-[#2E3192] transition-colors" />
                        </button>
                        <div>
                           <div className="flex items-center gap-3">
                              <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedClassDetail.name}</h2>
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedClassDetail.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                                 {selectedClassDetail.status}
                              </span>
                           </div>
                           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
                              <BookOpen className="w-3 h-3" /> {selectedClassDetail.course_title} • GV: {selectedClassDetail.teacher_name}
                           </p>
                        </div>

                        <div className="ml-auto flex gap-4">
                           <button className="px-6 py-4 bg-indigo-50 text-[#2E3192] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-100 transition-all">
                              <Sparkles className="w-4 h-4" /> AI Analytics
                           </button>
                           <button 
                              onClick={handleUpdateClassDetails}
                              disabled={savingClass}
                              className="px-6 py-4 bg-[#2E3192] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 flex items-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                           >
                              {savingClass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              Lưu thay đổi
                           </button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Student List & Announcements */}
                        <div className="lg:col-span-8 space-y-8">
                           {/* Student List */}
                           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                 <div>
                                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                       <Users className="w-6 h-6 text-[#2E3192]" /> Danh sách Học viên
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tổng số: {classMembers.length} học viên</p>
                                 </div>
                                 <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                                    <Search className="w-4 h-4 text-slate-300 ml-2" />
                                    <input 
                                       type="text" 
                                       placeholder="Thêm nhanh học viên..." 
                                       className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 placeholder:text-slate-300 w-48"
                                       onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                             const term = (e.target as HTMLInputElement).value;
                                             // Find student logic or show modal
                                             alert('Chức năng tìm kiếm học viên đang được đồng bộ...');
                                          }
                                       }}
                                    />
                                 </div>
                              </div>
                              <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto scrollbar-thin">
                                 {loadingMembers ? (
                                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                                       <Loader2 className="w-8 h-8 animate-spin text-[#2E3192]" />
                                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang tải danh sách...</p>
                                    </div>
                                 ) : classMembers.map((member, i) => (
                                    <div key={member.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                       <div className="flex items-center gap-5">
                                          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#2E3192] font-black text-lg overflow-hidden border-2 border-white shadow-sm">
                                             {member.toxi_profiles?.avatar_url ? (
                                                <img src={member.toxi_profiles.avatar_url} className="w-full h-full object-cover" />
                                             ) : (
                                                member.toxi_profiles?.full_name?.[0] || 'H'
                                             )}
                                          </div>
                                          <div>
                                             <p className="font-black text-slate-800 text-sm group-hover:text-[#2E3192] transition-colors">{member.toxi_profiles?.full_name || 'Học viên ẩn danh'}</p>
                                             <div className="flex items-center gap-4 mt-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Sparkles className="w-3 h-3 text-orange-400" /> {member.toxi_profiles?.target_exam || 'Mục tiêu'}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Mic className="w-3 h-3" /> {member.toxi_profiles?.phone || 'N/A'}</p>
                                             </div>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-4">
                                          <div className="text-right mr-4">
                                             <p className="text-[10px] font-black text-emerald-500 uppercase">Active</p>
                                             <p className="text-[8px] font-bold text-slate-300">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                                          </div>
                                          <button className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-[#2E3192] transition-all">
                                             <MessageSquare className="w-4 h-4" />
                                          </button>
                                          <button 
                                             onClick={() => handleRemoveFromClass(member.student_id, selectedClassDetail.id)}
                                             className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                                          >
                                             <Trash2 className="w-4 h-4" />
                                          </button>
                                       </div>
                                    </div>
                                 ))}
                                 {!loadingMembers && classMembers.length === 0 && (
                                    <div className="p-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">Lớp học này chưa có học viên.</div>
                                 )}
                              </div>
                           </div>

                           {/* Class Announcements Manager */}
                           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden p-8 space-y-6">
                              <div className="flex items-center justify-between">
                                 <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                    <MessageSquare className="w-6 h-6 text-orange-500" /> Thông báo lớp học
                                 </h3>
                              </div>
                              
                              <div className="flex gap-4">
                                 <input 
                                    id="announcement-input"
                                    type="text" 
                                    placeholder="Gửi thông báo mới cho cả lớp..." 
                                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/10 outline-none font-bold text-sm transition-all"
                                    onKeyDown={(e) => {
                                       if (e.key === 'Enter') {
                                          const input = e.target as HTMLInputElement;
                                          handleAddAnnouncement(input.value);
                                          input.value = '';
                                       }
                                    }}
                                 />
                                 <button 
                                    onClick={() => {
                                       const input = document.getElementById('announcement-input') as HTMLInputElement;
                                       handleAddAnnouncement(input.value);
                                       input.value = '';
                                    }}
                                    className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-orange-500/20"
                                 >
                                    Gửi ngay
                                 </button>
                              </div>

                              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                                 {(selectedClassDetail.announcements_json || []).map((ann: any) => (
                                    <div key={ann.id} className="p-5 bg-orange-50/50 border border-orange-100 rounded-[2rem] relative group">
                                       <p className="text-sm font-bold text-slate-800 pr-10">{ann.text}</p>
                                       <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mt-2">{new Date(ann.created_at).toLocaleString('vi-VN')}</p>
                                       <button 
                                          onClick={() => {
                                             const filtered = (selectedClassDetail.announcements_json || []).filter((a: any) => a.id !== ann.id);
                                             setSelectedClassDetail({...selectedClassDetail, announcements_json: filtered});
                                          }}
                                          className="absolute top-4 right-4 p-2 text-orange-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                       >
                                          <Trash2 className="w-4 h-4" />
                                       </button>
                                    </div>
                                 ))}
                                 {(!selectedClassDetail.announcements_json || selectedClassDetail.announcements_json.length === 0) && (
                                    <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Chưa có thông báo nào.</p>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>

                        {/* Right Column: Class Tools & Info */}
                        <div className="lg:col-span-4 space-y-8">
                           {/* Quick Actions */}
                           <div className="bg-slate-900 rounded-[3rem] p-8 text-white space-y-8 shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><GraduationCap className="w-32 h-32" /></div>
                              <div className="relative z-10 space-y-6">
                                 <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Điều khiển lớp học</h4>
                                 <div className="space-y-4">
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Zoom / Meeting Link</label>
                                       <div className="flex gap-2">
                                          <input 
                                             type="text" 
                                             value={selectedClassDetail.meeting_url || ''} 
                                             onChange={(e) => setSelectedClassDetail({...selectedClassDetail, meeting_url: e.target.value})}
                                             className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:bg-white/10 transition-all"
                                             placeholder="https://zoom.us/..."
                                          />
                                          <button 
                                             onClick={() => {
                                                navigator.clipboard.writeText(selectedClassDetail.meeting_url || '');
                                                alert('Đã sao chép link!');
                                             }}
                                             className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"
                                          >
                                             <Copy className="w-4 h-4" />
                                          </button>
                                       </div>
                                    </div>
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Lịch học</label>
                                       <input 
                                          type="text" 
                                          value={selectedClassDetail.schedule || ''} 
                                          onChange={(e) => setSelectedClassDetail({...selectedClassDetail, schedule: e.target.value})}
                                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:bg-white/10 transition-all"
                                          placeholder="2-4-6 (20h-21h30)"
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Trạng thái lớp</label>
                                       <select 
                                          value={selectedClassDetail.status} 
                                          onChange={(e) => setSelectedClassDetail({...selectedClassDetail, status: e.target.value})}
                                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:bg-white/10 transition-all appearance-none"
                                       >
                                          <option value="upcoming" className="bg-slate-900">Sắp khai giảng</option>
                                          <option value="active" className="bg-slate-900">Đang hoạt động</option>
                                          <option value="completed" className="bg-slate-900">Đã kết thúc</option>
                                       </select>
                                    </div>
                                 </div>
                                 <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-2">
                                    <Play className="w-4 h-4" /> Bắt đầu buổi học
                                 </button>
                              </div>
                           </div>

                           {/* Syllabus Progress */}
                           <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm space-y-8">
                              <div className="flex items-center justify-between">
                                 <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Tiến độ bài học</h4>
                                 <span className="text-[10px] font-black text-[#2E3192]">4 / 22 Buổi</span>
                              </div>
                              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                                 <div className="h-full bg-indigo-500 rounded-full w-[18%] shadow-lg shadow-indigo-500/30" />
                              </div>
                              <div className="space-y-3">
                                 {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                       <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center"><Check className="w-4 h-4" /></div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-800">Buổi {i}: Hoàn thành</p>
                                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Đã chấm 100% bài tập</p>
                                       </div>
                                    </div>
                                 ))}
                                 <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-500 transition-all">
                                    + Ghi nhận buổi 5
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         )}

         {activeTab === 'accounts' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                  <HeaderSection title="Quản lý tài khoản" desc="Cấp phát và quản lý quyền truy cập hệ thống." />
                  <button onClick={() => setIsAccountModalOpen(true)} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-transform">
                     <UserPlus className="w-5 h-5" /> Cấp tài khoản mới
                  </button>
               </div>
               <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Học viên</th>
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Số điện thoại</th>
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Vai trò</th>
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ngày tham gia</th>
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Thao tác</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {profiles.map(p => (
                           <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-6">
                                 <p className="font-black text-slate-800 text-sm">{p.full_name}</p>
                                 <p className="text-[10px] font-bold text-slate-400">{p.id.slice(0,8)}</p>
                              </td>
                              <td className="px-8 py-6 text-xs font-bold text-slate-600">{p.phone || 'N/A'}</td>
                               <td className="px-8 py-6">
                                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${p.role === 'teacher' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                     {p.role || 'student'}
                                  </span>
                               </td>
                              <td className="px-8 py-6 text-xs font-medium text-slate-500">{new Date(p.created_at).toLocaleDateString('vi-VN')}</td>
                              <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                                 {p.role !== 'teacher' && (
                                     <button 
                                        onClick={() => handlePromoteToTeacher(p)}
                                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                                     >
                                        Cấp quyền GV
                                     </button>
                                  )}
                                  <button 
                                     onClick={() => {
                                        setEditingProfile(p);
                                        setIsEditModalOpen(true);
                                     }}
                                     className="p-2 text-slate-300 hover:text-[#2E3192] transition-colors"
                                  >
                                     <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                     onClick={() => handleDeleteAccount(p.id, p.full_name)}
                                     className="p-2 text-slate-300 hover:text-red-500 transition-colors ml-2"
                                  >
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {activeTab === 'access_codes' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                  <HeaderSection title="Quản lý Mã truy cập" desc="Tạo và quản lý mã kích hoạt cho học viên tham gia hệ sinh thái Edu." />
                  <button onClick={handleGenerateAccessCode} disabled={generatingCode} className="px-8 py-4 bg-[#2E3192] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                     {generatingCode ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                     Tạo mã mới
                  </button>
               </div>

               <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                       <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                             <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Mã Truy Cập</th>
                             <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Trạng Thái</th>
                             <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Chủ Sở Hữu</th>
                             <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ngày Tạo</th>
                             <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Thao tác</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {accessCodes.map(code => (
                             <tr key={code.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-3">
                                      <span className="font-mono text-lg font-black text-[#2E3192] bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{code.code}</span>
                                      <button onClick={() => { navigator.clipboard.writeText(code.code); alert('Đã sao chép mã!'); }} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                                         <Copy className="w-4 h-4" />
                                      </button>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${code.status === 'used' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}>
                                      {code.status === 'used' ? 'Đã sử dụng' : 'Khả dụng'}
                                   </span>
                                </td>
                                <td className="px-8 py-6">
                                   {code.toxi_profiles ? (
                                      <div className="flex items-center gap-2">
                                         <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-600">
                                            {code.toxi_profiles.full_name?.[0]}
                                         </div>
                                         <span className="text-xs font-bold text-slate-600">{code.toxi_profiles.full_name}</span>
                                      </div>
                                   ) : (
                                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Chưa xác định</span>
                                   )}
                                </td>
                                <td className="px-8 py-6 text-xs font-medium text-slate-500">{new Date(code.created_at).toLocaleDateString('vi-VN')}</td>
                                <td className="px-8 py-6 text-right">
                                   <button onClick={() => handleDeleteAccessCode(code.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                      <Trash2 className="w-5 h-5" />
                                   </button>
                                </td>
                             </tr>
                          ))}
                          {accessCodes.length === 0 && (
                             <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                   <div className="flex flex-col items-center gap-4 text-slate-300">
                                      <Key className="w-12 h-12 opacity-20" />
                                      <p className="text-xs font-black uppercase tracking-widest">Chưa có mã truy cập nào được tạo</p>
                                   </div>
                                </td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'exams' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                  <HeaderSection title="Quản lý Kỳ thi" desc="Thiết lập bộ câu hỏi và tiêu chuẩn đánh giá cuối khóa." />
                  <button className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-transform">
                     <Plus className="w-5 h-5" /> Tạo đề thi mới
                  </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {courses.map((exam: any) => (
                    <div key={exam.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-6 hover:shadow-xl transition-all">
                       <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Thi cuối khóa</span>
                          <span className="text-[10px] font-bold text-slate-400">{exam.duration_minutes} phút</span>
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-xl font-black text-slate-800 leading-tight">{exam.title}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khóa học: {exam.courses?.title}</p>
                       </div>
                       <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div className="text-center">
                             <p className="text-sm font-black text-slate-800">{exam.passing_score}%</p>
                             <p className="text-[8px] font-black text-slate-400 uppercase">Điểm đạt</p>
                          </div>
                          <div className="text-center">
                             <p className="text-sm font-black text-slate-800">{exam.questions_json?.length || 0}</p>
                             <p className="text-[8px] font-black text-slate-400 uppercase">Câu hỏi</p>
                          </div>
                          <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                             <Edit className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         )}

         {activeTab === 'certificates' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                  <HeaderSection title="Danh sách Chứng chỉ" desc="Theo dõi và quản lý các chứng chỉ đã được cấp phát." />
                  <div className="relative group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                     <input type="text" placeholder="Tìm ID chứng chỉ..." className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold w-64 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all" />
                  </div>
               </div>

               <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Mã Chứng Chỉ</th>
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Học viên</th>
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Khóa học</th>
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ngày cấp</th>
                           <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Thao tác</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {enrollments.map((cert: any) => (
                           <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-8 py-6">
                                 <span className="font-mono text-sm font-black text-[#2E3192]">{cert.cert_id}</span>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="font-black text-slate-800 text-sm">{cert.toxi_profiles?.full_name}</p>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-sm font-bold text-slate-600">{cert.courses?.title}</p>
                              </td>
                              <td className="px-8 py-6 text-xs font-medium text-slate-500">
                                 {new Date(cert.issue_date).toLocaleDateString('vi-VN')}
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <button onClick={() => window.open(`/edu/certificate/${cert.cert_id}`, '_blank')} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}


         {activeTab === 'settings' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
               <HeaderSection title="Cài đặt Hệ thống" desc="Cấu hình thông tin thanh toán, QR code và các tham số vận hành Edu." />
               
               <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-8 space-y-6">
                     <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                        <div className="space-y-4">
                           <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                              <Database className="w-5 h-5 text-[#2E3192]" /> Thông tin chuyển khoản
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngân hàng</label>
                                 <input 
                                    type="text"
                                    value={paymentSettings.bank_name}
                                    onChange={(e) => setPaymentSettings({...paymentSettings, bank_name: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10 outline-none font-bold text-sm transition-all"
                                    placeholder="Ví dụ: Vietcombank"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số tài khoản</label>
                                 <input 
                                    type="text"
                                    value={paymentSettings.account_number}
                                    onChange={(e) => setPaymentSettings({...paymentSettings, account_number: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10 outline-none font-bold text-sm transition-all"
                                    placeholder="1234567890"
                                 />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chủ tài khoản</label>
                                 <input 
                                    type="text"
                                    value={paymentSettings.account_holder}
                                    onChange={(e) => setPaymentSettings({...paymentSettings, account_holder: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10 outline-none font-bold text-sm transition-all"
                                    placeholder="CÔNG TY TNHH TOXI"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                              <Sparkles className="w-5 h-5 text-orange-500" /> QR Code Template
                           </h4>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Template (Dùng biến: {'{account}'}, {'{price}'}, {'{course_id}'})</label>
                              <textarea 
                                 value={paymentSettings.qr_template}
                                 onChange={(e) => setPaymentSettings({...paymentSettings, qr_template: e.target.value})}
                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#2E3192]/10 outline-none font-bold text-xs h-32 transition-all font-mono"
                                 placeholder="Dán link API QR tại đây..."
                              />
                           </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex justify-end">
                           <button 
                              onClick={handleSaveSettings}
                              className="px-10 py-4 bg-[#2E3192] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                           >
                              <Save className="w-4 h-4" /> Lưu cấu hình
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="md:col-span-4 space-y-6">
                     <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10"><Info className="w-12 h-12" /></div>
                        <h5 className="text-sm font-black uppercase tracking-widest text-indigo-400">Hướng dẫn Cấu hình</h5>
                        <p className="text-xs text-white/60 leading-relaxed font-medium">
                           Thông tin bạn nhập tại đây sẽ được hiển thị trực tiếp cho học viên trong quá trình đăng ký khóa học (EduExplore). 
                        </p>
                        <div className="space-y-3">
                           <div className="flex gap-3">
                              <div className="w-5 h-5 bg-indigo-500/20 rounded-md flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-indigo-400" /></div>
                              <p className="text-[10px] font-bold text-white/80">Số tài khoản phải chính xác 100%.</p>
                           </div>
                           <div className="flex gap-3">
                              <div className="w-5 h-5 bg-indigo-500/20 rounded-md flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-indigo-400" /></div>
                              <p className="text-[10px] font-bold text-white/80">Dùng API của VietQR hoặc QRServer để tạo mã động.</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preview QR</h5>
                        <div className="aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center overflow-hidden p-4">
                           {paymentSettings.qr_template ? (
                              <img 
                                 src={paymentSettings.qr_template
                                    .replace('{account}', paymentSettings.account_number || '1234567890')
                                    .replace('{price}', '500000')
                                    .replace('{course_id}', 'DEMO')}
                                 className="w-full h-full object-contain"
                                 alt="QR Preview"
                              />
                           ) : (
                              <p className="text-[9px] font-black text-slate-300 uppercase">Chưa có template</p>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'final_project' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                  <HeaderSection title="Quản lý Dự án Tốt nghiệp" desc="Thiết lập các dự án thực chiến cuối khóa cho học viên." />
                  <button onClick={() => { setProjectFormData({ title: '', description: '', script_sample: '', category: 'Sơ cấp' }); setIsProjectModalOpen(true); }} className="px-6 py-4 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-500/20 flex items-center gap-2 hover:scale-[1.02] transition-transform">
                     <Plus className="w-5 h-5" /> Thêm dự án mẫu
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projectTemplates.map(p => (
                     <div key={p.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-6 flex flex-col group hover:border-[#2E3192]/30 transition-all">
                        <div className="flex items-center justify-between">
                           <span className="px-3 py-1 bg-indigo-50 text-[#2E3192] rounded-lg text-[9px] font-black uppercase tracking-widest">{p.category}</span>
                           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setProjectFormData(p); setIsProjectModalOpen(true); }} className="p-2 text-slate-300 hover:text-[#2E3192] transition-colors"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteProject(p.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                        <div className="flex-1 space-y-3">
                           <h4 className="text-xl font-black text-slate-800 leading-tight">{p.title}</h4>
                           <p className="text-xs text-slate-500 line-clamp-3 font-medium leading-relaxed">{p.description}</p>
                        </div>
                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                           <div className="flex items-center gap-2 text-slate-400">
                              <FileText className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Có kịch bản mẫu</span>
                           </div>
                           <button className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-[#2E3192] hover:text-white transition-all"><ArrowRight className="w-4 h-4" /></button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {activeTab === 'toxi_tech' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <HeaderSection title="Toxi Tech Hub" desc="Cấu hình các module công nghệ AI cho hệ thống đào tạo." />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                     <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center"><Bot className="w-8 h-8 text-[#2E3192]" /></div>
                     <h4 className="text-xl font-black text-slate-800">Doubao AI Integration</h4>
                     <p className="text-xs text-slate-500 font-medium leading-relaxed">Hệ thống LLM hỗ trợ Role-play và Feedback tự động cho học viên.</p>
                     <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase"><CheckCircle2 className="w-4 h-4" /> Đang hoạt động</div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                     <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center"><Mic className="w-8 h-8 text-orange-500" /></div>
                     <h4 className="text-xl font-black text-slate-800">Voice Analytics</h4>
                     <p className="text-xs text-slate-500 font-medium leading-relaxed">Phân tích sóng âm và chấm điểm phát âm tiếng Trung theo thời gian thực.</p>
                     <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase"><CheckCircle2 className="w-4 h-4" /> Đang hoạt động</div>
                  </div>
               </div>
            </div>
         )}
         {/* --- CROPPER MODAL --- */}
      {isCropping && imageToCrop && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-800">Căn chỉnh khung hình</h3>
                 <button onClick={() => setIsCropping(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="relative flex-1 bg-slate-100 min-h-[400px]">
                 <Cropper
                    image={imageToCrop}
                    crop={crop}
                    zoom={zoom}
                    aspect={16 / 9}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                 />
              </div>

              <div className="p-10 space-y-8 bg-white">
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <span>Phóng to/Thu nhỏ</span>
                       <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <input 
                       type="range"
                       value={zoom}
                       min={1}
                       max={3}
                       step={0.1}
                       aria-labelledby="Zoom"
                       onChange={(e) => setZoom(Number(e.target.value))}
                       className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2E3192]"
                    />
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setIsCropping(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Hủy</button>
                    <button 
                       onClick={async () => {
                          setLoadingCrop(true);
                          try {
                             const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
                             if (croppedBlob) {
                                const fileExt = 'jpg';
                                const fileName = `${Math.random()}.${fileExt}`;
                                const { data, error } = await supabase.storage
                                   .from('courses')
                                   .upload(`thumbnails/${fileName}`, croppedBlob);
                                
                                if (error) throw error;
                                
                                const { data: { publicUrl } } = supabase.storage
                                   .from('courses')
                                   .getPublicUrl(`thumbnails/${fileName}`);
                                
                                setCourseFormData({...courseFormData, thumbnail_url: publicUrl});
                                setIsCropping(false);
                             }
                          } catch (err) {
                             alert('Lỗi khi cắt ảnh: ' + (err as any).message);
                          } finally {
                             setLoadingCrop(false);
                          }
                       }}
                       disabled={loadingCrop}
                       className="flex-[2] py-4 bg-[#2E3192] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                       {loadingCrop ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crop className="w-4 h-4" />}
                       Xác nhận & Tải lên
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
   </main>

      {/* --- MODALS --- */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-800">Cấp tài khoản mới</h3>
                    <button onClick={() => setIsAccountModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Họ và tên</label>
                       <input type="text" placeholder="Ví dụ: Nguyễn Văn A" value={accountData.fullName} onChange={e => setAccountData({...accountData, fullName: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none font-bold" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Số điện thoại</label>
                       <input type="tel" placeholder="09xxxxxxx" value={accountData.phone} onChange={e => setAccountData({...accountData, phone: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none font-bold" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email (Tùy chọn)</label>
                       <input type="email" placeholder="email@example.com" value={accountData.email} onChange={e => setAccountData({...accountData, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none font-bold" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mật khẩu khởi tạo</label>
                       <input type="password" placeholder="••••••••" value={accountData.password} onChange={e => setAccountData({...accountData, password: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none font-bold" />
                    </div>
                 </div>
                 <button onClick={handleCreateAccount} disabled={savingAccount} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                    {savingAccount ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                    Cấp tài khoản
                 </button>
              </div>
           </div>
        </div>
      )}

      {isEditModalOpen && editingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-800">Chỉnh sửa tài khoản</h3>
                    <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Họ và tên</label>
                       <input type="text" value={editingProfile.full_name} onChange={e => setEditingProfile({...editingProfile, full_name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none font-bold" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Số điện thoại</label>
                       <input type="tel" value={editingProfile.phone} onChange={e => setEditingProfile({...editingProfile, phone: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none font-bold" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email</label>
                       <input type="email" value={editingProfile.email} onChange={e => setEditingProfile({...editingProfile, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none font-bold" />
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                       <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-2">Đặt lại mật khẩu (Tùy chọn)</label>
                       <div className="flex gap-2 mt-2">
                          <input type="text" placeholder="Nhập mật khẩu mới..." onChange={e => setAccountData({...accountData, password: e.target.value})} className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-rose-300 outline-none font-bold text-sm" />
                          <button onClick={handleResetPassword} className="px-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Reset</button>
                       </div>
                    </div>
                 </div>
                 <button onClick={handleUpdateAccount} disabled={savingAccount} className="w-full py-5 bg-[#2E3192] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                    {savingAccount ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Lưu thay đổi
                 </button>
              </div>
           </div>
        </div>
      )}

      {isClassModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="text-xl font-black text-[#2E3192]">{editingClassId ? 'Cập nhật lớp học' : 'Mở lớp học mới'}</h3>
                  <button onClick={() => { setIsClassModalOpen(false); setEditingClassId(null); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6" /></button>
               </div>
               <div className="p-10 space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Khóa học</label>
                     <select value={classData.course_id} onChange={e => setClassData({...classData, course_id: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none font-black text-sm">
                        <option value="">-- Chọn khóa học --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tên lớp</label>
                     <input type="text" placeholder="Ví dụ: TOXI-Live-HSK3-K01" value={classData.name} onChange={e => setClassData({...classData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none font-bold text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ngày khai giảng</label>
                        <input type="date" value={classData.start_date} onChange={e => setClassData({...classData, start_date: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none font-bold text-sm" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Giáo viên phụ trách</label>
                        <select value={classData.teacher_id} onChange={e => setClassData({...classData, teacher_id: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none font-bold text-xs">
                           <option value="">-- Chọn GV --</option>
                           {activeTeachers.map(t => (
                             <option key={`${t.id}-${t.source}`} value={t.id}>
                               {t.full_name} [{t.source}]
                             </option>
                           ))}
                        </select>
                     </div>
                  </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Lịch học</label>
                        <input type="text" placeholder="2-4-6 (20h-21h30)" value={classData.schedule} onChange={e => setClassData({...classData, schedule: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none font-bold text-sm" />
                     </div>
                  </div>
                  <button onClick={handleSaveClass} disabled={savingClass} className="w-full py-5 bg-[#2E3192] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                     {savingClass ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                     Xác nhận mở lớp
                  </button>
               </div>
            </div>
      )}
\n
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="p-10 space-y-10">
                 <div className="flex items-center justify-between">
                    <div>
                       <h3 className="text-3xl font-black text-slate-800">{courseFormData.id ? 'Cập nhật Khóa học' : 'Thêm Khóa học mới'}</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Course Configuration</p>
                    </div>
                    <button onClick={() => setIsCourseModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-full text-slate-400"><X className="w-8 h-8" /></button>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Basic Info */}
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tiêu đề khóa học</label>
                          <input 
                             type="text" 
                             value={courseFormData.title || ''} 
                             onChange={e => setCourseFormData({...courseFormData, title: e.target.value})}
                             className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-[#2E3192]/5 outline-none font-black text-lg transition-all" 
                             placeholder="Nhập tên khóa học..."
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Phân loại</label>
                             <select value={courseFormData.category} onChange={e => setCourseFormData({...courseFormData, category: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs">
                                <option>Tiếng Trung Ứng Dụng</option>
                                <option>Luyện Thi Chứng Chỉ</option>
                                <option>Chuyên Ngành</option>
                                <option>AI & Công Nghệ</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cấp độ</label>
                             <select value={courseFormData.level} onChange={e => setCourseFormData({...courseFormData, level: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs">
                                <option>Sơ cấp</option>
                                <option>Trung cấp</option>
                                <option>Cao cấp</option>
                                <option>Mọi cấp độ</option>
                             </select>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mô tả ngắn</label>
                          <textarea 
                             value={courseFormData.description || ''}
                             onChange={e => setCourseFormData({...courseFormData, description: e.target.value})}
                             className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm h-32"
                             placeholder="Khóa học này dành cho..."
                          />
                       </div>

                       <div className="pt-6 border-t border-slate-50 space-y-4">
                           <h4 className="text-xs font-black text-[#2E3192] uppercase tracking-[0.2em] flex items-center gap-2">
                             <CreditCard className="w-4 h-4" /> Cấu hình thanh toán riêng
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input 
                                type="text" 
                                placeholder="Ngân hàng..." 
                                value={courseFormData.payment_info?.bank_name || ''} 
                                onChange={e => setCourseFormData({...courseFormData, payment_info: {...(courseFormData.payment_info || {bank_name: '', account_number: '', account_holder: '', qr_template: ''}), bank_name: e.target.value}})}
                                className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold"
                              />
                              <input 
                                type="text" 
                                placeholder="Số tài khoản..." 
                                value={courseFormData.payment_info?.account_number || ''} 
                                onChange={e => setCourseFormData({...courseFormData, payment_info: {...(courseFormData.payment_info || {bank_name: '', account_number: '', account_holder: '', qr_template: ''}), account_number: e.target.value}})}
                                className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold"
                              />
                              <input 
                                type="text" 
                                placeholder="Chủ tài khoản..." 
                                value={courseFormData.payment_info?.account_holder || ''} 
                                onChange={e => setCourseFormData({...courseFormData, payment_info: {...(courseFormData.payment_info || {bank_name: '', account_number: '', account_holder: '', qr_template: ''}), account_holder: e.target.value}})}
                                className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold md:col-span-2"
                              />
                           </div>
                        </div>
                    </div>

                    {/* Pricing & Media */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ảnh bìa khóa học (Thumbnail)</p>
                           <div className="relative group aspect-video bg-slate-50 rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 hover:border-[#2E3192] transition-all">
                              {courseFormData.thumbnail_url ? (
                                 <>
                                    <img src={courseFormData.thumbnail_url} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                       <button 
                                          type="button"
                                          onClick={() => document.getElementById('course-thumb-upload')?.click()}
                                          className="px-4 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase shadow-lg"
                                       >
                                          Thay đổi ảnh
                                       </button>
                                    </div>
                                 </>
                              ) : (
                                 <>
                                    <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-300">
                                       <Upload className="w-8 h-8" />
                                    </div>
                                    <button 
                                       type="button"
                                       onClick={() => document.getElementById('course-thumb-upload')?.click()}
                                       className="text-[10px] font-black text-[#2E3192] uppercase hover:underline"
                                    >
                                       Chọn ảnh từ máy tính
                                    </button>
                                 </>
                              )}
                              <input 
                                 id="course-thumb-upload"
                                 type="file" 
                                 accept="image/*"
                                 className="hidden"
                                 onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                       const reader = new FileReader();
                                       reader.addEventListener('load', () => {
                                          setImageToCrop(reader.result as string);
                                          setIsCropping(true);
                                       });
                                       reader.readAsDataURL(file);
                                    }
                                 }}
                              />
                           </div>
                           <input 
                              type="text" 
                              value={courseFormData.thumbnail_url || ''}
                              onChange={e => setCourseFormData({...courseFormData, thumbnail_url: e.target.value})}
                              className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[9px] text-slate-400" 
                              placeholder="Hoặc dán URL trực tiếp tại đây..."
                           />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Giáo viên phụ trách</label>
                            <select value={courseFormData.teacher_id} onChange={e => setCourseFormData({...courseFormData, teacher_id: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs">
                               <option value="">-- Chọn giáo viên --</option>
                               {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Dự án Tốt nghiệp</label>
                            <select 
                               value={courseFormData.final_project_id || ''} 
                               onChange={e => setCourseFormData({...courseFormData, final_project_id: e.target.value})} 
                               className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs text-[#2E3192]"
                            >
                               <option value="">-- Không có dự án tốt nghiệp --</option>
                               {projectTemplates.map(p => <option key={p.id} value={p.id}>{p.title} ({p.category})</option>)}
                            </select>
                         </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Giá niêm yết (₫)</label>
                              <input type="number" value={courseFormData.price || 0} onChange={e => setCourseFormData({...courseFormData, price: Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Giá gốc (₫)</label>
                              <input type="number" value={courseFormData.original_price || 0} onChange={e => setCourseFormData({...courseFormData, original_price: Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-400" />
                           </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Sparkles className="w-6 h-6 text-orange-500" /></div>
                           <div>
                              <p className="text-xs font-black text-slate-800">Toxi Original Course</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Khóa học sản xuất độc quyền bởi TOXI AI</p>
                           </div>
                           <input type="checkbox" checked={courseFormData.is_toxi_original} onChange={e => setCourseFormData({...courseFormData, is_toxi_original: e.target.checked})} className="ml-auto w-6 h-6 rounded-lg text-[#2E3192] focus:ring-[#2E3192]" />
                        </div>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-10 border-t border-slate-100">
                    <button onClick={() => setIsCourseModalOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Hủy</button>
                    <button 
                       onClick={handleSaveCourse}
                       disabled={savingCourse}
                       className="flex-[2] py-4 bg-[#2E3192] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                       {savingCourse ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                       Lưu Khóa Học & Đồng bộ
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
      {/* Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="p-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-800">{projectFormData.id ? 'Cập nhật Dự án' : 'Thêm Dự án mẫu'}</h3>
                    <button onClick={() => setIsProjectModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tên dự án</label>
                       <input type="text" placeholder="Ví dụ: Hành trình Di sản" value={projectFormData.title} onChange={e => setProjectFormData({...projectFormData, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#2E3192] outline-none font-bold" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Phân loại</label>
                       <select value={projectFormData.category} onChange={e => setProjectFormData({...projectFormData, category: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold">
                          <option>Sơ cấp</option>
                          <option>Trung cấp</option>
                          <option>Cao cấp</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mô tả chi tiết</label>
                       <textarea placeholder="Mô tả mục tiêu và yêu cầu..." value={projectFormData.description} onChange={e => setProjectFormData({...projectFormData, description: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl h-32 outline-none font-medium" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kịch bản mẫu / Hướng dẫn</label>
                       <textarea placeholder="Nội dung kịch bản mẫu cho học viên..." value={projectFormData.script_sample} onChange={e => setProjectFormData({...projectFormData, script_sample: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl h-48 outline-none font-mono text-xs" />
                    </div>
                 </div>
                 <button onClick={handleSaveProject} disabled={savingProject} className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                    {savingProject ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Lưu dự án mẫu
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---
function NavItem({ active, icon: Icon, label, onClick }: any) {
   return (
      <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${active ? 'bg-[#2E3192] text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
         <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
         {label}
      </button>
   );
}

function StatCard({ label, value, icon: Icon, color }: any) {
   return (
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
         <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${color}`}><Icon className="w-6 h-6" /></div>
         <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
         </div>
      </div>
   );
}

function TechProgress({ label, percent, color }: any) {
   return (
      <div className="space-y-3">
         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-900">{percent}%</span>
         </div>
         <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
            <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
         </div>
      </div>
   );
}

function TypeBadge({ active, icon: Icon, label, onClick }: any) {
   return (
      <button 
         onClick={onClick}
         className={`px-3 py-1.5 rounded-lg flex items-center gap-2 border transition-all ${active ? 'bg-indigo-50 border-indigo-200 text-[#2E3192]' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60 hover:opacity-100'}`}
      >
         <Icon className="w-3.5 h-3.5" />
         <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </button>
   );
}

function HelperItem({ icon: Icon, title, text }: any) {
   return (
      <div className="flex gap-4">
         <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-[#2E3192]" /></div>
         <div>
            <p className="text-[11px] font-black text-slate-800 leading-tight mb-1">{title}</p>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{text}</p>
         </div>
      </div>
   );
}

function HeaderSection({ title, desc }: any) {
   return (
      <div>
         <h2 className="text-3xl font-black text-[#2E3192] tracking-tight">{title}</h2>
         <p className="text-slate-500 font-medium text-sm mt-1">{desc}</p>
      </div>
   );
}

function StatBadge({ label, value, color }: any) {
   return (
      <div className={`px-4 py-2 rounded-xl flex items-center gap-3 ${color}`}>
         <span className="text-[10px] font-black uppercase tracking-widest">{label}:</span>
         <span className="text-sm font-black">{value}</span>
      </div>
   );
}
