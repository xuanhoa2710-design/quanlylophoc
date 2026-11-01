import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student, StudentCadreRole } from '../types';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  Phone,
  MapPin,
  Award,
  HeartHandshake,
  GraduationCap,
  Filter,
  X,
  UserCheck,
  Shield,
  Crown,
  BookOpen,
  Gavel,
  Star,
  Sparkles,
  Wrench,
  Lock,
  KeyRound,
  RotateCcw,
  FileJson,
  List,
  LayoutGrid,
  Plus,
  Tags,
} from 'lucide-react';
import { StudentPasswordModal } from './StudentPasswordModal';

const BASE_CADRE_ROLES: StudentCadreRole[] = [
  'Lớp trưởng',
  'Lớp phó học tập',
  'Lớp phó kỉ luật',
  'Bí thư',
  'Lớp phó lao động',
  'Tổ trưởng',
  'Học sinh',
];

export const getCadreRoleBadge = (
  role?: StudentCadreRole
): { className: string; icon: string } => {
  switch (role) {
    case 'Lớp trưởng':
      return {
        className: 'bg-amber-50 text-amber-800 border-amber-300',
        icon: '👑',
      };
    case 'Lớp phó học tập':
      return {
        className: 'bg-blue-50 text-blue-800 border-blue-300',
        icon: '📚',
      };
    case 'Lớp phó kỉ luật':
      return {
        className: 'bg-rose-50 text-rose-800 border-rose-300',
        icon: '⚖️',
      };
    case 'Bí thư':
      return {
        className: 'bg-purple-50 text-purple-800 border-purple-300',
        icon: '🌟',
      };
    case 'Lớp phó lao động':
      return {
        className: 'bg-teal-50 text-teal-800 border-teal-300',
        icon: '🧹',
      };
    case 'Tổ trưởng':
      return {
        className: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        icon: '🛡️',
      };
    case 'Học sinh':
    case undefined:
      return {
        className: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: '',
      };
    default:
      return {
        className: 'bg-indigo-50 text-indigo-800 border-indigo-300',
        icon: '⭐',
      };
  }
};

export const getRoleBadgeStyle = (role?: StudentCadreRole) => {
  switch (role) {
    case 'Lớp trưởng':
      return {
        bg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs',
        border: 'border-amber-400',
        icon: Crown,
      };
    case 'Lớp phó học tập':
      return {
        bg: 'bg-blue-600 text-white shadow-xs',
        border: 'border-blue-400',
        icon: BookOpen,
      };
    case 'Lớp phó kỉ luật':
      return {
        bg: 'bg-rose-600 text-white shadow-xs',
        border: 'border-rose-400',
        icon: Gavel,
      };
    case 'Bí thư':
      return {
        bg: 'bg-purple-600 text-white shadow-xs',
        border: 'border-purple-400',
        icon: Sparkles,
      };
    case 'Lớp phó lao động':
      return {
        bg: 'bg-teal-600 text-white shadow-xs',
        border: 'border-teal-400',
        icon: Wrench,
      };
    case 'Tổ trưởng':
      return {
        bg: 'bg-emerald-600 text-white shadow-xs',
        border: 'border-emerald-400',
        icon: Star,
      };
    case 'Học sinh':
    case undefined:
      return {
        bg: 'bg-slate-100 text-slate-600',
        border: 'border-slate-200',
        icon: UserCheck,
      };
    default:
      return {
        bg: 'bg-indigo-600 text-white shadow-xs',
        border: 'border-indigo-400',
        icon: Tags,
      };
  }
};

export const StudentManagement: React.FC = () => {
  const {
    students,
    role,
    addStudent,
    updateStudent,
    deleteStudent,
    assignStudentCadreRole,
    customCadreRoles,
    addCustomCadreRole,
    removeCustomCadreRole,
    resetAllStudentPinsByTeacher,
    setIsJsonModalOpen,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Default to Compact List View ("Phần Quản lý HS của GVCN để ở dạng danh sách, khi nào GVCN cần nhấp vào thì mới hiện đầy đủ thông tin")
  const [displayMode, setDisplayMode] = useState<'list' | 'grid'>('list');

  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [passwordTargetStudent, setPasswordTargetStudent] = useState<Student | null>(null);
  const [bulkResetFeedback, setBulkResetFeedback] = useState<string | null>(null);

  // Custom Roles Management Modal / Drawer
  const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);
  const [newCustomRoleInput, setNewCustomRoleInput] = useState('');
  const [roleFeedback, setRoleFeedback] = useState<string | null>(null);

  const allAvailableRoles: StudentCadreRole[] = [
    ...BASE_CADRE_ROLES.filter((r) => r !== 'Học sinh'),
    ...customCadreRoles,
    'Học sinh',
  ];

  // Form states for add/edit
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    gender: 'Nữ' as 'Nam' | 'Nữ',
    birthday: '2009-05-15',
    phone: '',
    address: '',
    group: 1,
    classRole: 'Học sinh' as StudentCadreRole,
    primaryParentName: '',
    primaryParentPhone: '',
    examSubject1: 'Hóa học',
    examSubject2: 'Tiếng Anh',
    dreamCareer: 'Bác sĩ Đa khoa - ĐH Y Dược TP.HCM',
    hobbies: 'Đọc sách, nghe nhạc',
    strengths: 'Chăm chỉ, hòa đồng',
    weaknesses: 'Đôi khi còn rụt rè',
    familyCondition: 'Bình thường',
    currentConduct: 'Tốt' as 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt',
  });

  // Filtered students
  const filteredStudents = (students || []).filter((s) => {
    if (!s) return false;
    const sName = (s.name || '').toLowerCase();
    const sCode = (s.code || '').toLowerCase();
    const sParent = (s.primaryParentName || '').toLowerCase();
    const sRole = (s.classRole || 'Học sinh').toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchSearch =
      sName.includes(query) || sCode.includes(query) || sParent.includes(query) || sRole.includes(query);
    const matchGroup = groupFilter === 'all' || s.group === Number(groupFilter);
    const matchGender = genderFilter === 'all' || s.gender === genderFilter;
    const studentRole = s.classRole || 'Học sinh';
    const matchRole =
      roleFilter === 'all' ||
      (roleFilter === 'cadre' && studentRole !== 'Học sinh') ||
      studentRole === roleFilter;

    return matchSearch && matchGroup && matchGender && matchRole;
  });

  // All Class Cadres (Non-default 'Học sinh')
  const cadreStudents = (students || []).filter(
    (s) => s && s.classRole && s.classRole !== 'Học sinh'
  );

  const handleAddRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addCustomCadreRole(newCustomRoleInput);
    setRoleFeedback(res.message);
    if (res.success) {
      setNewCustomRoleInput('');
    }
    setTimeout(() => setRoleFeedback(null), 4000);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      code: `12A7-${String(students.length + 1).padStart(2, '0')}`,
      name: '',
      gender: 'Nữ',
      birthday: '2009-05-15',
      phone: '0901234567',
      address: 'Bình Chánh, TP.HCM',
      group: 1,
      classRole: 'Học sinh',
      primaryParentName: '',
      primaryParentPhone: '',
      examSubject1: 'Hóa học',
      examSubject2: 'Tiếng Anh',
      dreamCareer: 'Kinh tế Đối ngoại',
      hobbies: 'Đọc sách, Cầu lông',
      strengths: 'Chăm chỉ, có tinh thần tự học',
      weaknesses: 'Cần rèn tốc độ giải toán',
      familyCondition: 'Bình thường',
      currentConduct: 'Tốt',
    });
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (stu: Student) => {
    setEditingStudent(stu);
    setFormData({
      code: stu.code,
      name: stu.name,
      gender: stu.gender,
      birthday: stu.birthday,
      phone: stu.phone,
      address: stu.address,
      group: stu.group,
      classRole: stu.classRole || 'Học sinh',
      primaryParentName: stu.primaryParentName,
      primaryParentPhone: stu.primaryParentPhone,
      examSubject1: stu.examSubject1,
      examSubject2: stu.examSubject2,
      dreamCareer: stu.dreamCareer,
      hobbies: stu.hobbies,
      strengths: stu.strengths,
      weaknesses: stu.weaknesses,
      familyCondition: stu.familyCondition,
      currentConduct: stu.currentConduct,
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStudent) {
      const updatedStu: Student = {
        ...editingStudent,
        ...formData,
      };
      updateStudent(updatedStu);
      if (selectedStudentForDetail?.id === updatedStu.id) {
        setSelectedStudentForDetail(updatedStu);
      }
    } else {
      const defaultScore = (name: string) => ({
        subjectName: name,
        regular: [8.0, 8.0],
        midterm: 8.0,
        final: 8.0,
        avg: 8.0,
      });

      addStudent({
        ...formData,
        birthPlace: 'TP.HCM',
        ethnicity: 'Kinh',
        religion: 'Không',
        email: `${formData.code.toLowerCase()}@vinhlocb.edu.vn`,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        parentFatherName: formData.primaryParentName,
        parentFatherPhone: formData.primaryParentPhone,
        parentFatherJob: 'Kinh doanh',
        parentMotherName: formData.primaryParentName,
        parentMotherPhone: formData.primaryParentPhone,
        parentMotherJob: 'Nội trợ',
        livingWith: 'Cha mẹ',
        birthOrder: 'Con thứ 1',
        wishedTeacher: 'Thầy Trương Xuân Hòa',
        wishedClassmates: 'Tập thể 12A7',
        pastRoles: [formData.classRole || 'Thành viên lớp'],
        awards: ['Học sinh Giỏi lớp 11'],
        disciplines: ['Không vi phạm'],
        gpaPrevYear: 8.0,
        conductPrevYear: 'Tốt',
        academicRankPrevYear: 'Giỏi',
        titlePrevYear: 'Học sinh Giỏi',
        scores: {
          van: defaultScore('Ngữ văn'),
          toan: defaultScore('Toán'),
          anh: defaultScore('Tiếng Anh'),
          ly: defaultScore('Vật lý'),
          hoa: defaultScore('Hóa học'),
          su: defaultScore('Lịch sử'),
          gdktpl: defaultScore('GDKT & PL'),
          tin: defaultScore('Tin học'),
          gddp: defaultScore('GDĐP'),
          gdqp: defaultScore('GDQP-AN'),
        },
        currentGpa: 8.0,
        currentClassification: 'Giỏi',
        attendanceStats: {
          present: 45,
          excused: 0,
          unexcused: 0,
          late: 0,
          rate: 100,
        },
        activityPoints: 90,
      });
    }
    setIsAddEditModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Danh Sách & Hồ Sơ Học Sinh Lớp 12A7 ({filteredStudents.length}/{students.length} HS)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hiển thị dạng danh sách thu gọn • Nhấp vào bất kỳ học sinh nào để xem đầy đủ hồ sơ chi tiết, SĐT phụ huynh và phân quyền vai trò
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle List vs Card Grid */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setDisplayMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                displayMode === 'list'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Danh sách
            </button>
            <button
              onClick={() => setDisplayMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                displayMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Dạng thẻ
            </button>
          </div>

          {role === 'teacher' && (
            <>
              <button
                onClick={() => setIsRoleManagerOpen(!isRoleManagerOpen)}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                title="Thêm hoặc quản lý các vai trò của học sinh trong lớp"
              >
                <Tags className="w-4 h-4 text-indigo-600" />
                <span>+ Thêm Vai Trò Cho HS</span>
              </button>

              <button
                onClick={() => setIsJsonModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                title="Xuất toàn bộ hồ sơ học sinh 12A7 ra file JSON"
              >
                <FileJson className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Xuất JSON</span>
              </button>

              <button
                onClick={() => {
                  const res = resetAllStudentPinsByTeacher('1234');
                  setBulkResetFeedback(res.message);
                  setTimeout(() => setBulkResetFeedback(null), 4000);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                title="Reset mật khẩu của tất cả học sinh về mặc định 1234"
              >
                <RotateCcw className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline">Reset Pass Cả Lớp</span>
              </button>

              <button
                onClick={openAddModal}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm Học Sinh</span>
              </button>
            </>
          )}
        </div>
      </div>

      {bulkResetFeedback && (
        <div className="p-3.5 rounded-2xl bg-purple-600 text-white text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>{bulkResetFeedback}</span>
          </div>
          <button
            onClick={() => setBulkResetFeedback(null)}
            className="text-white/80 hover:text-white text-xs underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Custom Role Manager Drawer (GVCN có thể thêm vai trò cho HS) */}
      {isRoleManagerOpen && role === 'teacher' && (
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-4 sm:p-5 border border-indigo-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tags className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Quản Lý & Thêm Vai Trò Mới Cho Học Sinh 12A7 (Dành cho GVCN)
                </h3>
                <p className="text-[11px] text-slate-600">
                  Tạo thêm các vai trò mới (VD: Cán sự bộ môn, Thủ quỹ, Đội văn nghệ, Đội xung kích...) để gán cho học sinh trong lớp.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsRoleManagerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddRoleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newCustomRoleInput}
              onChange={(e) => setNewCustomRoleInput(e.target.value)}
              placeholder="Nhập tên vai trò mới (VD: Cán sự môn Vật lý, Thủ quỹ lớp, Đội bóng đá...)"
              className="flex-1 px-3.5 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Thêm vai trò mới
            </button>
          </form>

          {roleFeedback && (
            <div className="text-xs font-bold text-indigo-800 bg-white/80 px-3 py-1.5 rounded-lg border border-indigo-200">
              {roleFeedback}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-600">
              Danh sách các vai trò hiện có ({allAvailableRoles.length} vai trò):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BASE_CADRE_ROLES.map((r) => (
                <span
                  key={r}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1"
                >
                  <Shield className="w-3 h-3 text-blue-600" />
                  {r}
                </span>
              ))}
              {customCadreRoles.map((r) => (
                <span
                  key={r}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <Tags className="w-3 h-3 text-indigo-200" />
                  <span>{r}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomCadreRole(r)}
                    title={`Xóa vai trò "${r}"`}
                    className="hover:text-red-200 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Compact Class Cadre Summary Strip */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-4 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs sm:text-sm font-extrabold">
              Ban Cán Sự & Học Sinh Có Vai Trò Lớp 12A7 ({cadreStudents.length} học sinh)
            </h2>
          </div>
          <span className="text-[11px] text-blue-200">
            Nhấp vào học sinh bất kỳ để xem hồ sơ hoặc đổi vai trò trực tiếp tại bảng bên dưới
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {cadreStudents.map((officer) => {
            const badge = getRoleBadgeStyle(officer.classRole);
            const BadgeIcon = badge.icon;
            return (
              <div
                key={officer.id}
                onClick={() => setSelectedStudentForDetail(officer)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2 flex items-center gap-2.5 transition-all cursor-pointer shrink-0"
              >
                <img
                  src={officer.avatar}
                  alt={officer.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/80 shrink-0"
                />
                <div className="min-w-0">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${badge.bg}`}>
                    <BadgeIcon className="w-2.5 h-2.5" />
                    {officer.classRole}
                  </div>
                  <div className="font-bold text-xs text-white truncate mt-0.5">
                    {officer.name} <span className="text-blue-200 font-normal">(Tổ {officer.group})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên HS, mã số, tên phụ huynh, vai trò..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả 4 Tổ ({students.length} HS)</option>
            <option value="1">Tổ 1</option>
            <option value="2">Tổ 2</option>
            <option value="3">Tổ 3</option>
            <option value="4">Tổ 4</option>
          </select>
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả chức vụ / vai trò</option>
            <option value="cadre">🌟 Ban cán sự & Vai trò đặc biệt ({cadreStudents.length})</option>
            {allAvailableRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>
      </div>

      {/* COMPACT LIST VIEW (Default - Click student row to view full details) */}
      {displayMode === 'list' ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <List className="w-4 h-4 text-blue-600" />
              Danh sách học sinh 12A7 (Nhấp vào dòng học sinh bất kỳ để mở hồ sơ chi tiết đầy đủ)
            </span>
            <span className="text-[11px] text-slate-500">
              Tổng số: <strong>{filteredStudents.length}</strong> học sinh
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-3">Họ và Tên Học Sinh</th>
                  <th className="py-3 px-2.5 hidden md:table-cell">Ngày sinh</th>
                  <th className="py-3 px-2.5 text-center">Tổ</th>
                  <th className="py-3 px-3">Vai trò trong lớp</th>
                  <th className="py-3 px-2.5 text-center hidden sm:table-cell">Điểm TB</th>
                  <th className="py-3 px-2.5 text-center hidden lg:table-cell">Môn thi TN</th>
                  <th className="py-3 px-3 text-right">Thao tác nhanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu) => {
                  const currentRole: StudentCadreRole = stu.classRole || 'Học sinh';
                  const badge = getRoleBadgeStyle(currentRole);
                  const BadgeIcon = badge.icon;
                  const isOfficer = currentRole !== 'Học sinh';

                  return (
                    <tr
                      key={stu.id}
                      onClick={() => setSelectedStudentForDetail(stu)}
                      className={`group transition-colors cursor-pointer ${
                        isOfficer
                          ? 'bg-amber-50/20 hover:bg-blue-50/70'
                          : 'hover:bg-blue-50/60'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-black text-slate-500">
                        {stu.stt}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={stu.avatar}
                            alt={stu.name}
                            className={`w-9 h-9 rounded-full object-cover shrink-0 ring-1 ${
                              isOfficer ? 'ring-amber-400' : 'ring-slate-200'
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                              <span className="truncate">{stu.name}</span>
                              {stu.pinCode && (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[10px] font-bold"
                                  title={`Mã PIN: ${stu.pinCode}`}
                                >
                                  <Lock className="w-2.5 h-2.5" />
                                  {role === 'teacher' && stu.pinCode}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              <span>{stu.code}</span>
                              <span>•</span>
                              <span>{stu.gender}</span>
                              <span className="md:hidden">• {stu.birthday}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5 text-slate-600 font-medium hidden md:table-cell whitespace-nowrap">
                        {stu.birthday}
                      </td>

                      <td className="py-2.5 px-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] whitespace-nowrap">
                          Tổ {stu.group}
                        </span>
                      </td>

                      <td
                        className="py-2.5 px-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {role === 'teacher' ? (
                          <div className="flex items-center gap-1.5 max-w-[200px]">
                            <select
                              value={currentRole}
                              onChange={(e) =>
                                assignStudentCadreRole(stu.id, e.target.value as StudentCadreRole)
                              }
                              className={`w-full px-2.5 py-1.5 rounded-xl border text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                                isOfficer
                                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              {allAvailableRoles.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.bg}`}
                          >
                            <BadgeIcon className="w-3 h-3" />
                            {currentRole}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-2.5 text-center hidden sm:table-cell">
                        <span
                          className={`px-2 py-0.5 rounded-lg font-extrabold text-xs ${
                            stu.currentGpa >= 8.0
                              ? 'bg-emerald-50 text-emerald-700'
                              : stu.currentGpa >= 6.5
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {stu.currentGpa}
                        </span>
                      </td>

                      <td className="py-2.5 px-2.5 text-center text-[11px] font-semibold text-slate-600 hidden lg:table-cell whitespace-nowrap">
                        {stu.examSubject1} + {stu.examSubject2}
                      </td>

                      <td
                        className="py-2.5 px-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setSelectedStudentForDetail(stu)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            title="Xem đầy đủ thông tin hồ sơ học sinh"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Chi tiết</span>
                          </button>

                          {role === 'teacher' && (
                            <>
                              <button
                                onClick={() => setPasswordTargetStudent(stu)}
                                className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
                                title="Đặt hoặc Reset mật khẩu (PIN)"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditModal(stu)}
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                                title="Chỉnh sửa thông tin học sinh"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteStudent(stu.id)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                title="Xóa học sinh"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW (Optional toggle) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((stu) => {
            const currentRole: StudentCadreRole = stu.classRole || 'Học sinh';
            const badge = getRoleBadgeStyle(currentRole);
            const BadgeIcon = badge.icon;
            const isOfficer = currentRole !== 'Học sinh';

            return (
              <div
                key={stu.id}
                onClick={() => setSelectedStudentForDetail(stu)}
                className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer ${
                  isOfficer ? 'border-amber-300 ring-1 ring-amber-200/50' : 'border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={stu.avatar}
                          alt={stu.name}
                          className={`w-12 h-12 rounded-2xl object-cover ring-2 ${
                            isOfficer ? 'ring-amber-400' : 'ring-blue-100'
                          }`}
                        />
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                          {stu.stt}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{stu.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            {stu.code}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            Tổ {stu.group}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        GPA: {stu.currentGpa}
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        {currentRole}
                      </span>
                    </div>

                    {role === 'teacher' && (
                      <select
                        value={currentRole}
                        onChange={(e) =>
                          assignStudentCadreRole(stu.id, e.target.value as StudentCadreRole)
                        }
                        className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        {allAvailableRoles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Nhấp để xem hồ sơ chi tiết</span>
                  <span className="font-bold text-blue-600 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Mở hồ sơ
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Student Profile Modal (Shown when clicking any student) */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudentForDetail.avatar}
                  alt={selectedStudentForDetail.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {selectedStudentForDetail.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                      {selectedStudentForDetail.code}
                    </span>
                    {(() => {
                      const badge = getRoleBadgeStyle(selectedStudentForDetail.classRole);
                      const BadgeIcon = badge.icon;
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.bg}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          {selectedStudentForDetail.classRole || 'Học sinh'}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Tổ {selectedStudentForDetail.group} • Giới tính: {selectedStudentForDetail.gender} • Ngày sinh: {selectedStudentForDetail.birthday}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Role Selector inside Modal for Teacher */}
            {role === 'teacher' && (
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Phân công chức vụ / vai trò trong lớp 12A7:</span>
                </div>
                <select
                  value={selectedStudentForDetail.classRole || 'Học sinh'}
                  onChange={(e) => {
                    const newRole = e.target.value as StudentCadreRole;
                    assignStudentCadreRole(selectedStudentForDetail.id, newRole);
                    setSelectedStudentForDetail({
                      ...selectedStudentForDetail,
                      classRole: newRole,
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-indigo-300 bg-white text-xs font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {allAvailableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Password / PIN Status & Reset inside Modal for Teacher */}
            {role === 'teacher' && (
              <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-purple-950">
                  <KeyRound className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <span className="font-bold">Bảo mật & Mật khẩu (Mã PIN) Học sinh: </span>
                    {selectedStudentForDetail.pinCode ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-200 text-purple-900 font-extrabold ml-1">
                        Đang đặt PIN: {selectedStudentForDetail.pinCode}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium ml-1">
                        Chưa đặt mã PIN khóa riêng tư
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setPasswordTargetStudent(selectedStudentForDetail)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset / Đổi Pass Cho Học Sinh
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" /> Liên Hệ & Gia Đình
                </h4>
                <p><strong>SĐT Học sinh:</strong> {selectedStudentForDetail.phone}</p>
                <p><strong>Địa chỉ:</strong> {selectedStudentForDetail.address}</p>
                <p><strong>Họ tên Cha:</strong> {selectedStudentForDetail.parentFatherName} ({selectedStudentForDetail.parentFatherJob})</p>
                <p><strong>Họ tên Mẹ:</strong> {selectedStudentForDetail.parentMotherName} ({selectedStudentForDetail.parentMotherJob})</p>
                <p><strong>SĐT Phụ huynh chính:</strong> <span className="text-blue-600 font-bold">{selectedStudentForDetail.primaryParentPhone}</span></p>
                <p><strong>Hoàn cảnh gia đình:</strong> {selectedStudentForDetail.familyCondition}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-orange-500" /> Học Tập & Định Hướng Thi 2027
                </h4>
                <p><strong>Môn thi tự chọn 1:</strong> {selectedStudentForDetail.examSubject1}</p>
                <p><strong>Môn thi tự chọn 2:</strong> {selectedStudentForDetail.examSubject2}</p>
                <p><strong>Ước mơ nghề nghiệp:</strong> <span className="text-indigo-700 font-bold">{selectedStudentForDetail.dreamCareer}</span></p>
                <p><strong>Điểm TB Lớp 11:</strong> {selectedStudentForDetail.gpaPrevYear} ({selectedStudentForDetail.academicRankPrevYear})</p>
                <p><strong>Điểm TB Lớp 12 hiện tại:</strong> <span className="text-emerald-600 font-bold">{selectedStudentForDetail.currentGpa}</span> ({selectedStudentForDetail.currentClassification})</p>
                <p><strong>Hạnh kiểm:</strong> {selectedStudentForDetail.currentConduct}</p>
              </div>

              <div className="sm:col-span-2 bg-blue-50/60 p-4 rounded-2xl border border-blue-200/60 space-y-2">
                <h4 className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-blue-600" /> Đặc Điểm Cá Nhân & Tâm Tư Nguyện Vọng
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p><strong>Sở thích:</strong> {selectedStudentForDetail.hobbies}</p>
                  <p><strong>Điểm mạnh:</strong> {selectedStudentForDetail.strengths}</p>
                  <p><strong>Hạn chế cần khắc phục:</strong> {selectedStudentForDetail.weaknesses}</p>
                  <p><strong>Khen thưởng:</strong> {(selectedStudentForDetail.awards || []).join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {role === 'teacher' && (
                <button
                  onClick={() => {
                    const stu = selectedStudentForDetail;
                    setSelectedStudentForDetail(null);
                    openEditModal(stu);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa thông tin
                </button>
              )}
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingStudent ? `Cập Nhật Học Sinh: ${editingStudent.name}` : 'Thêm Học Sinh Mới Lớp 12A7'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã học sinh</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Nam' | 'Nữ' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Nữ">Nữ</option>
                    <option value="Nam">Nam</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tổ</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-indigo-700 mb-1">Chức vụ / Vai trò trong lớp</label>
                  <select
                    value={formData.classRole}
                    onChange={(e) =>
                      setFormData({ ...formData, classRole: e.target.value as StudentCadreRole })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-indigo-300 bg-indigo-50/50 font-bold text-indigo-900"
                  >
                    {allAvailableRoles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY hoặc YYYY-MM-DD"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SĐT Học sinh</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ tên Phụ huynh</label>
                  <input
                    type="text"
                    required
                    value={formData.primaryParentName}
                    onChange={(e) => setFormData({ ...formData, primaryParentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SĐT Phụ huynh</label>
                  <input
                    type="text"
                    required
                    value={formData.primaryParentPhone}
                    onChange={(e) => setFormData({ ...formData, primaryParentPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn thi tự chọn 1</label>
                  <input
                    type="text"
                    value={formData.examSubject1}
                    onChange={(e) => setFormData({ ...formData, examSubject1: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn thi tự chọn 2</label>
                  <input
                    type="text"
                    value={formData.examSubject2}
                    onChange={(e) => setFormData({ ...formData, examSubject2: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Định hướng Đại học / Nghề nghiệp</label>
                <input
                  type="text"
                  value={formData.dreamCareer}
                  onChange={(e) => setFormData({ ...formData, dreamCareer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Student Password / PIN Management Modal */}
      {passwordTargetStudent && (
        <StudentPasswordModal
          isOpen={!!passwordTargetStudent}
          onClose={() => setPasswordTargetStudent(null)}
          targetStudent={passwordTargetStudent}
        />
      )}
    </div>
  );
};
