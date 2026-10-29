import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student, StudentCadreRole } from '../types';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Heart,
  AlertTriangle,
  Sparkles,
  Filter,
  Check,
  ShieldAlert,
  ShieldCheck,
  Crown,
  KeyRound,
  Lock,
  Unlock,
  RotateCcw,
  CheckCircle2,
  FileJson,
} from 'lucide-react';
import { AccessGuard } from './AccessGuard';
import { StudentPasswordModal } from './StudentPasswordModal';

export const ALL_CADRE_ROLES: StudentCadreRole[] = [
  'Lớp trưởng',
  'Lớp phó học tập',
  'Lớp phó kỉ luật',
  'Bí thư',
  'Lớp phó lao động',
  'Tổ trưởng',
  'Học sinh',
];

export const getCadreRoleBadge = (cadreRole?: StudentCadreRole) => {
  switch (cadreRole) {
    case 'Lớp trưởng':
      return {
        label: 'Lớp trưởng',
        icon: '👑',
        className: 'bg-amber-100 text-amber-900 border-amber-300 font-black',
      };
    case 'Lớp phó học tập':
      return {
        label: 'Lớp phó học tập',
        icon: '📚',
        className: 'bg-blue-100 text-blue-900 border-blue-300 font-black',
      };
    case 'Lớp phó kỉ luật':
      return {
        label: 'Lớp phó kỉ luật',
        icon: '⚖️',
        className: 'bg-orange-100 text-orange-900 border-orange-300 font-black',
      };
    case 'Bí thư':
      return {
        label: 'Bí thư',
        icon: '⭐',
        className: 'bg-rose-100 text-rose-900 border-rose-300 font-black',
      };
    case 'Lớp phó lao động':
      return {
        label: 'Lớp phó lao động',
        icon: '🌱',
        className: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black',
      };
    case 'Tổ trưởng':
      return {
        label: 'Tổ trưởng',
        icon: '🚩',
        className: 'bg-purple-100 text-purple-900 border-purple-300 font-black',
      };
    default:
      return {
        label: 'Học sinh',
        icon: '🎓',
        className: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
      };
  }
};

export const StudentManagement: React.FC = () => {
  const {
    role,
    isTeacherAuthenticated,
    students,
    activeStudentId,
    currentStudent,
    currentWeek,
    getStudentWeeklyScore,
    addStudent,
    updateStudent,
    deleteStudent,
    assignStudentCadreRole,
    resetStudentPinByTeacher,
    resetAllStudentPinsByTeacher,
    downloadDataAsJson,
    setIsJsonModalOpen,
  } = useApp();

  if (role !== 'teacher' || !isTeacherAuthenticated) {
    return <AccessGuard requiredRole="teacher" pageTitle="Quản lý Học sinh 12A7" />;
  }

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'Nam' | 'Nữ'>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'cadre' | StudentCadreRole>('all');

  // Modals
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [isEditingStudent, setIsEditingStudent] = useState<Student | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [studentForPasswordModal, setStudentForPasswordModal] = useState<Student | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form state for Add/Edit
  const [formData, setFormData] = useState<Partial<Student>>({});

  // Filter students
  const displayedStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      s.primaryParentPhone.includes(searchTerm);
    const matchGroup = selectedGroup === 'all' || s.group === selectedGroup;
    const matchGender = selectedGender === 'all' || s.gender === selectedGender;
    const matchRole =
      selectedRoleFilter === 'all'
        ? true
        : selectedRoleFilter === 'cadre'
        ? s.classRole && s.classRole !== 'Học sinh'
        : s.classRole === selectedRoleFilter;
    return matchSearch && matchGroup && matchGender && matchRole;
  });

  const handleOpenEdit = (stu: Student) => {
    setFormData(stu);
    setIsEditingStudent(stu);
  };

  const handleOpenAdd = () => {
    const nextStt = students.length + 1;
    setFormData({
      code: `12A7-${nextStt.toString().padStart(2, '0')}`,
      name: '',
      gender: 'Nam',
      birthday: '2009-01-01',
      birthPlace: 'TP.HCM',
      ethnicity: 'Kinh',
      religion: 'Không',
      address: 'Xã Vĩnh Lộc, Bình Chánh, TP.HCM',
      phone: '',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      group: 1,
      parentFatherName: '',
      parentFatherPhone: '',
      parentFatherJob: '',
      parentMotherName: '',
      parentMotherPhone: '',
      parentMotherJob: '',
      primaryParentName: '',
      primaryParentPhone: '',
      familyCondition: 'Bình thường',
      livingWith: 'Bố mẹ',
      birthOrder: '1',
      examSubject1: 'Vật lý',
      examSubject2: 'Hóa học',
      dreamCareer: '',
      strengths: '',
      weaknesses: '',
      hobbies: '',
      wishedTeacher: '',
      wishedClassmates: '',
      pastRoles: [],
      awards: [],
      disciplines: [],
      gpaPrevYear: 8.0,
      conductPrevYear: 'Tốt',
      academicRankPrevYear: 'Khá',
      titlePrevYear: 'Học sinh Khá',
      currentGpa: 8.0,
      currentConduct: 'Tốt',
      currentClassification: 'Khá',
      scores: {
        van: { subjectName: 'Ngữ văn', regular: [7.5], midterm: 7.5, final: 7.5, avg: 7.5 },
        toan: { subjectName: 'Toán học', regular: [7.5], midterm: 7.5, final: 7.5, avg: 7.5 },
        anh: { subjectName: 'Tiếng Anh', regular: [7.5], midterm: 7.5, final: 7.5, avg: 7.5 },
        ly: { subjectName: 'Vật lý', regular: [7.5], midterm: 7.5, final: 7.5, avg: 7.5 },
        hoa: { subjectName: 'Hóa học', regular: [7.5], midterm: 7.5, final: 7.5, avg: 7.5 },
        su: { subjectName: 'Lịch sử', regular: [7.5], midterm: 7.5, final: 7.5, avg: 7.5 },
        gdktpl: { subjectName: 'GDKT-PL', regular: [7.5], midterm: 7.5, final: 7.5, avg: 7.5 },
        tin: { subjectName: 'Tin học', regular: [9.0], midterm: 9.0, final: 9.0, avg: 9.0 },
        gddp: { subjectName: 'GD địa phương', regular: [8.5], midterm: 8.5, final: 8.5, avg: 8.5 },
        gdqp: { subjectName: 'GDQP-AN', regular: [8.5], midterm: 8.5, final: 8.5, avg: 8.5 },
      },
      attendanceStats: { present: 50, excused: 0, unexcused: 0, late: 0, rate: 100 },
      activityPoints: 85,
    });
    setIsAddingNew(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addStudent(formData as any);
    setIsAddingNew(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingStudent || !formData.name) return;
    updateStudent({ ...isEditingStudent, ...(formData as Student) });
    setIsEditingStudent(null);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span className="font-bold text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Student Password / PIN Modal for GVCN */}
      {studentForPasswordModal && (
        <StudentPasswordModal
          isOpen={!!studentForPasswordModal}
          onClose={() => setStudentForPasswordModal(null)}
          targetStudent={studentForPasswordModal}
          onSuccess={() => {
            showToast(`Đã cập nhật mật khẩu (Mã PIN) cho học sinh ${studentForPasswordModal.name}!`);
          }}
        />
      )}

      {/* Title & Controls Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Danh sách hồ sơ & Quản lý Mật khẩu Học sinh 12A7
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                {students.filter((s) => s.pinCode).length}/{students.length} HS đã cài Pass
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {`Tổng số: ${students.length} học sinh • THPT Vĩnh Lộc B • GVCN: Thầy Trương Xuân Hòa (Toàn quyền truy cập & Reset Pass cho học sinh)`}
            </p>
          </div>

          {/* Teacher Action Buttons: Export JSON, Reset Pass Bulk & Add Student */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => {
                const fileName = downloadDataAsJson('all');
                showToast(`Đã xuất file "${fileName}" thành công!`);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              title="Tải xuống ngay file JSON toàn bộ dữ liệu lớp 12A7"
            >
              <FileJson className="w-3.5 h-3.5" /> Xuất File JSON
            </button>
            <button
              onClick={() => setIsJsonModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Mở bảng tùy chọn Xuất / Copy / Nhập dữ liệu JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-teal-600" /> Xem / Nhập JSON
            </button>
            <button
              onClick={() => {
                const res = resetAllStudentPinsByTeacher('1234');
                showToast(res.message);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              title="Đặt lại mật khẩu mặc định 1234 cho toàn bộ 50 học sinh"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Pass cả lớp ("1234")
            </button>
            <button
              onClick={() => {
                const res = resetAllStudentPinsByTeacher(undefined);
                showToast(res.message);
              }}
              className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Gỡ toàn bộ mật khẩu để mở khóa tự do cho tất cả học sinh"
            >
              <Unlock className="w-3.5 h-3.5 text-purple-600" /> Mở khóa tất cả HS
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Thêm học sinh mới
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên học sinh, mã HS, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Group Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <span className="px-2 text-slate-500 text-[11px]">Tổ:</span>
              <button
                onClick={() => setSelectedGroup('all')}
                className={`px-2.5 py-1 rounded-lg ${selectedGroup === 'all' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
              >
                Tất cả
              </button>
              {[1, 2, 3, 4].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGroup(g)}
                  className={`px-2.5 py-1 rounded-lg ${selectedGroup === g ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
                >
                  Tổ {g}
                </button>
              ))}
            </div>

            {/* Gender Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSelectedGender('all')}
                className={`px-2.5 py-1 rounded-lg ${selectedGender === 'all' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
              >
                Tất cả giới tính
              </button>
              <button
                onClick={() => setSelectedGender('Nam')}
                className={`px-2.5 py-1 rounded-lg ${selectedGender === 'Nam' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
              >
                Nam
              </button>
              <button
                onClick={() => setSelectedGender('Nữ')}
                className={`px-2.5 py-1 rounded-lg ${selectedGender === 'Nữ' ? 'bg-white shadow-xs text-pink-600' : 'text-slate-600'}`}
              >
                Nữ
              </button>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <span className="px-2 text-slate-500 text-[11px] flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Vai trò:
              </span>
              <button
                onClick={() => setSelectedRoleFilter('all')}
                className={`px-2 py-1 rounded-lg ${selectedRoleFilter === 'all' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setSelectedRoleFilter('cadre')}
                className={`px-2 py-1 rounded-lg ${selectedRoleFilter === 'cadre' ? 'bg-white shadow-xs text-amber-800' : 'text-slate-600'}`}
              >
                ⭐ Ban cán sự
              </button>
              <select
                value={selectedRoleFilter === 'all' || selectedRoleFilter === 'cadre' ? '' : selectedRoleFilter}
                onChange={(e) => {
                  if (e.target.value) setSelectedRoleFilter(e.target.value as StudentCadreRole);
                  else setSelectedRoleFilter('all');
                }}
                className="bg-transparent text-xs font-semibold text-slate-700 px-2 py-1 rounded-lg focus:outline-hidden cursor-pointer"
              >
                <option value="">Lọc chức danh...</option>
                {ALL_CADRE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      {/* Ban Cán Sự Lớp 12A7 Visual Showcase Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-white to-blue-500/10 rounded-2xl p-5 border border-amber-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-200/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Sơ Đồ Ban Cán Sự & Tổ Trưởng Lớp 12A7
              </h3>
              <p className="text-[11px] text-slate-500">
                Đội ngũ cán sự lớp do Thầy Trương Xuân Hòa phân công nhiệm vụ
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-300 self-start sm:self-auto">
            {students.filter((s) => s.classRole && s.classRole !== 'Học sinh').length} Cán bộ lớp & Tổ trưởng
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {ALL_CADRE_ROLES.filter((r) => r !== 'Học sinh').map((cadreRole) => {
            const officers = students.filter((s) => s.classRole === cadreRole);
            const badge = getCadreRoleBadge(cadreRole);
            return (
              <div
                key={cadreRole}
                className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between"
              >
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1 mb-1.5 truncate">
                  <span>{badge.icon}</span>
                  <span className="truncate">{badge.label}</span>
                </div>
                {officers.length > 0 ? (
                  <div className="space-y-1.5">
                    {officers.map((officer) => (
                      <div
                        key={officer.id}
                        onClick={() => setSelectedStudentForDetail(officer)}
                        className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors group"
                        title="Xem hồ sơ cán sự"
                      >
                        <img
                          src={officer.avatar}
                          alt={officer.name}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-300"
                        />
                        <div className="truncate">
                          <div className="text-[11px] font-bold text-slate-900 truncate group-hover:text-blue-600">
                            {officer.name}
                          </div>
                          <div className="text-[9px] text-slate-400">
                            Tổ {officer.group}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 italic py-1">Chưa phân công</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Student List Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayedStudents.map((stu) => {
          const roleBadge = getCadreRoleBadge(stu.classRole);
          return (
          <div
            key={stu.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header card with Avatar, Role Badge, and Basic Info */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={stu.avatar}
                      alt={stu.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-100"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        stu.gender === 'Nữ' ? 'bg-pink-500' : 'bg-blue-500'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">{stu.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${roleBadge.className}`}>
                        <span>{roleBadge.icon}</span>
                        <span>{roleBadge.label}</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-blue-700">{stu.code}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-700 font-medium">
                        Tổ {stu.group}
                      </span>
                      <span>•</span>
                      <span>{stu.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Tổ {stu.group}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    {stu.attendanceStats.rate}% chuyên cần
                  </span>
                </div>
              </div>

              {/* Quick Role Assignment Bar for GVCN */}
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 mb-3 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 shrink-0">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Gán vai trò:
                </span>
                <select
                  value={stu.classRole || 'Học sinh'}
                  onChange={(e) => assignStudentCadreRole(stu.id, e.target.value as StudentCadreRole)}
                  className="text-xs font-bold text-blue-700 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400 cursor-pointer max-w-[170px]"
                >
                  {ALL_CADRE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r === 'Lớp trưởng' ? '👑 Lớp trưởng' :
                       r === 'Lớp phó học tập' ? '📚 Lớp phó học tập' :
                       r === 'Lớp phó kỉ luật' ? '⚖️ Lớp phó kỉ luật' :
                       r === 'Bí thư' ? '⭐ Bí thư' :
                       r === 'Lớp phó lao động' ? '🌱 Lớp phó lao động' :
                       r === 'Tổ trưởng' ? `🚩 Tổ trưởng` :
                       '🎓 Học sinh'}
                    </option>
                  ))}
                </select>
              </div>

              {/* High School Graduation Exam Subject Choices */}
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 mb-3 text-xs">
                <div className="text-[11px] font-bold text-blue-900 mb-1 flex items-center justify-between">
                  <span>Môn thi tốt nghiệp 2027:</span>
                  <span className="text-orange-700 font-extrabold">
                    {stu.examSubject1} + {stu.examSubject2}
                  </span>
                </div>
                {stu.dreamCareer && (
                  <div className="text-[11px] text-slate-600 truncate">
                    🎯 Ước mơ: <strong className="text-slate-800">{stu.dreamCareer}</strong>
                  </div>
                )}
              </div>

              {/* Contact, Parent Info & Password Status */}
              <div className="space-y-1 text-xs text-slate-600 mb-3">
                <div className="flex items-center gap-2 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">Học sinh: {stu.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Heart className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                  <span className="truncate">
                    PH: {stu.primaryParentName} ({stu.primaryParentPhone || 'Chưa có SĐT'})
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                    Pass / Mã PIN:
                    {stu.pinCode ? (
                      <strong className="font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        {stu.pinCode}
                      </strong>
                    ) : (
                      <span className="text-slate-400 italic">Chưa đặt (Mở tự do)</span>
                    )}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const res = resetStudentPinByTeacher(stu.id, '1234');
                        showToast(res.message);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold transition-colors"
                      title="Đặt lại mật khẩu của học sinh này về mặc định 1234"
                    >
                      Reset "1234"
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentForPasswordModal(stu)}
                      className="px-2 py-0.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-bold transition-colors"
                      title="Cấp mật khẩu mới hoặc gỡ mật khẩu cho học sinh"
                    >
                      Đổi Pass
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedStudentForDetail(stu)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" /> Xem chi tiết
              </button>

              {role === 'teacher' && (
                <>
                  <button
                    onClick={() => setStudentForPasswordModal(stu)}
                    className="p-1.5 rounded-xl hover:bg-purple-50 text-purple-600 hover:text-purple-700 transition-colors"
                    title="Reset / Đổi mật khẩu (Mã PIN) học sinh"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(stu)}
                    className="p-1.5 rounded-xl hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                    title="Chỉnh sửa thông tin"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStudentToDelete(stu)}
                    className="p-1.5 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                    title="Xóa học sinh"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {/* DETAIL MODAL */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedStudentForDetail(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
              <img
                src={selectedStudentForDetail.avatar}
                alt={selectedStudentForDetail.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedStudentForDetail.name}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold">
                    {selectedStudentForDetail.code}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full border text-xs ${getCadreRoleBadge(selectedStudentForDetail.classRole).className}`}>
                    {getCadreRoleBadge(selectedStudentForDetail.classRole).icon} {getCadreRoleBadge(selectedStudentForDetail.classRole).label}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>Tổ {selectedStudentForDetail.group}</span>
                  <span>•</span>
                  <span>Giới tính: {selectedStudentForDetail.gender}</span>
                  <span>•</span>
                  <span>Ngày sinh: {selectedStudentForDetail.birthday}</span>
                </div>

                {/* Role assign dropdown in detail modal */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600">Phân công vai trò:</span>
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
                    className="text-xs font-bold text-blue-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  >
                    {ALL_CADRE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r === 'Lớp trưởng' ? '👑 Lớp trưởng' :
                         r === 'Lớp phó học tập' ? '📚 Lớp phó học tập' :
                         r === 'Lớp phó kỉ luật' ? '⚖️ Lớp phó kỉ luật' :
                         r === 'Bí thư' ? '⭐ Bí thư' :
                         r === 'Lớp phó lao động' ? '🌱 Lớp phó lao động' :
                         r === 'Tổ trưởng' ? `🚩 Tổ trưởng` :
                         '🎓 Học sinh'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Detail Sections */}
            <div className="mt-5 space-y-5 text-xs text-slate-700">
              {/* Box 1: Thông tin liên lạc & cư trú */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> Thông tin cư trú & liên lạc
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><strong>Địa chỉ:</strong> {selectedStudentForDetail.address}</div>
                  <div><strong>Nơi sinh:</strong> {selectedStudentForDetail.birthPlace}</div>
                  <div><strong>Dân tộc:</strong> {selectedStudentForDetail.ethnicity}</div>
                  <div><strong>Tôn giáo:</strong> {selectedStudentForDetail.religion}</div>
                  <div><strong>Điện thoại HS:</strong> {selectedStudentForDetail.phone}</div>
                  <div><strong>Email:</strong> {selectedStudentForDetail.email}</div>
                </div>
              </div>

              {/* Box 2: Gia đình & Phụ huynh */}
              <div className="bg-orange-50/60 p-4 rounded-2xl space-y-2 border border-orange-200">
                <h4 className="font-bold text-orange-950 text-sm mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-orange-600" /> Gia đình & Thông tin Phụ huynh
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <strong>Cha:</strong> {selectedStudentForDetail.parentFatherName || 'Chưa rõ'}
                    {selectedStudentForDetail.parentFatherJob && ` (${selectedStudentForDetail.parentFatherJob})`}
                    {selectedStudentForDetail.parentFatherPhone && ` - SĐT: ${selectedStudentForDetail.parentFatherPhone}`}
                  </div>
                  <div>
                    <strong>Mẹ:</strong> {selectedStudentForDetail.parentMotherName || 'Chưa rõ'}
                    {selectedStudentForDetail.parentMotherJob && ` (${selectedStudentForDetail.parentMotherJob})`}
                    {selectedStudentForDetail.parentMotherPhone && ` - SĐT: ${selectedStudentForDetail.parentMotherPhone}`}
                  </div>
                  <div><strong>Sống cùng:</strong> {selectedStudentForDetail.livingWith}</div>
                  <div><strong>Hoàn cảnh:</strong> {selectedStudentForDetail.familyCondition}</div>
                  <div><strong>Liên hệ chính:</strong> {selectedStudentForDetail.primaryParentName} ({selectedStudentForDetail.primaryParentPhone})</div>
                </div>
              </div>

              {/* Box 3: Định hướng & Môn thi Tốt nghiệp THPT 2027 */}
              <div className="bg-indigo-50/60 p-4 rounded-2xl space-y-2 border border-indigo-200">
                <h4 className="font-bold text-indigo-950 text-sm mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" /> Định hướng thi Tốt nghiệp THPT & Đại học 2027
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <strong>Môn thi 1 & 2:</strong>{' '}
                    <span className="text-orange-700 font-extrabold text-sm">
                      {selectedStudentForDetail.examSubject1} + {selectedStudentForDetail.examSubject2}
                    </span>
                  </div>
                  <div><strong>Ước mơ nghề nghiệp:</strong> {selectedStudentForDetail.dreamCareer}</div>
                  <div><strong>Điểm mạnh:</strong> {selectedStudentForDetail.strengths || 'Chăm chỉ, tích cực'}</div>
                  <div><strong>Cần cải thiện:</strong> {selectedStudentForDetail.weaknesses || 'Cần tự tin hơn'}</div>
                  <div className="sm:col-span-2">
                    <strong>Mong muốn ở GVCN:</strong> {selectedStudentForDetail.wishedTeacher || 'Nhiệt tình chỉ bảo'}
                  </div>
                  <div className="sm:col-span-2">
                    <strong>Mong muốn ở bạn bè:</strong> {selectedStudentForDetail.wishedClassmates || 'Đoàn kết yêu thương'}
                  </div>
                </div>
              </div>

              {/* Box 4: Thành tích & Khen thưởng */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl space-y-2 border border-emerald-200">
                <h4 className="font-bold text-emerald-950 text-sm mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" /> Thành tích & Quá trình rèn luyện
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><strong>Chuyên cần:</strong> {selectedStudentForDetail.attendanceStats.rate}% ({selectedStudentForDetail.attendanceStats.present} buổi có mặt)</div>
                  <div>
                    <strong>Thi đua Tuần {currentWeek}:</strong>{' '}
                    <span className="font-bold text-indigo-700">
                      {getStudentWeeklyScore(selectedStudentForDetail.id, currentWeek).total}đ
                    </span>
                    {getStudentWeeklyScore(selectedStudentForDetail.id, currentWeek).isAdjustedByTeacher && (
                      <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-900 font-bold">
                        Đã sửa bởi GVCN
                      </span>
                    )}
                  </div>
                  <div><strong>Điểm phong trào:</strong> {selectedStudentForDetail.activityPoints} điểm tích lũy</div>
                  <div><strong>Môn thi tốt nghiệp:</strong> {selectedStudentForDetail.examSubject1} + {selectedStudentForDetail.examSubject2}</div>
                </div>
              </div>

              {/* Box 5: Bảo mật & Mật khẩu (Mã PIN) của Học sinh */}
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-purple-950 text-sm flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-purple-600" /> Quản lý Mật khẩu / Mã PIN Học sinh
                  </h4>
                  <p className="text-xs text-purple-800 mt-0.5">
                    Mật khẩu hiện tại:{' '}
                    {selectedStudentForDetail.pinCode ? (
                      <strong className="font-mono bg-white px-2 py-0.5 rounded border border-purple-300 text-purple-900">
                        {selectedStudentForDetail.pinCode}
                      </strong>
                    ) : (
                      <span className="italic text-slate-500">Chưa đặt mật khẩu (Mở tự do)</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const res = resetStudentPinByTeacher(selectedStudentForDetail.id, '1234');
                      setSelectedStudentForDetail({ ...selectedStudentForDetail, pinCode: '1234' });
                      showToast(res.message);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset về "1234"
                  </button>
                  {selectedStudentForDetail.pinCode && (
                    <button
                      type="button"
                      onClick={() => {
                        const res = resetStudentPinByTeacher(selectedStudentForDetail.id, undefined);
                        setSelectedStudentForDetail({ ...selectedStudentForDetail, pinCode: undefined });
                        showToast(res.message);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5" /> Gỡ Pass
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedStudentForDetail;
                      setSelectedStudentForDetail(null);
                      setStudentForPasswordModal(target);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Đặt Pass mới
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL FOR TEACHER */}
      {(isAddingNew || isEditingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setIsEditingStudent(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 mb-4 pb-2 border-b">
              {isAddingNew ? 'Thêm học sinh mới vào lớp 12A7' : `Chỉnh sửa thông tin: ${formData.name}`}
            </h3>

            <form onSubmit={isAddingNew ? handleSaveAdd : handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mã học sinh</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Họ và tên học sinh</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giới tính</label>
                  <select
                    value={formData.gender || 'Nam'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tổ sinh hoạt</label>
                  <select
                    value={formData.group || 1}
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
                  <label className="font-bold text-slate-700 block mb-1">
                    Vai trò cán sự lớp
                  </label>
                  <select
                    value={formData.classRole || 'Học sinh'}
                    onChange={(e) => setFormData({ ...formData, classRole: e.target.value as StudentCadreRole })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-blue-700"
                  >
                    {ALL_CADRE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r === 'Lớp trưởng' ? '👑 Lớp trưởng' :
                         r === 'Lớp phó học tập' ? '📚 Lớp phó học tập' :
                         r === 'Lớp phó kỉ luật' ? '⚖️ Lớp phó kỉ luật' :
                         r === 'Bí thư' ? '⭐ Bí thư' :
                         r === 'Lớp phó lao động' ? '🌱 Lớp phó lao động' :
                         r === 'Tổ trưởng' ? `🚩 Tổ trưởng (Tổ ${formData.group || 1})` :
                         '🎓 Học sinh'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày sinh</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formData.birthday || ''}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại học sinh</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên phụ huynh liên hệ</label>
                  <input
                    type="text"
                    value={formData.primaryParentName || ''}
                    onChange={(e) => setFormData({ ...formData, primaryParentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">SĐT phụ huynh (có Zalo)</label>
                  <input
                    type="text"
                    value={formData.primaryParentPhone || ''}
                    onChange={(e) => setFormData({ ...formData, primaryParentPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Môn thi tốt nghiệp 1</label>
                  <select
                    value={formData.examSubject1 || 'Vật lý'}
                    onChange={(e) => setFormData({ ...formData, examSubject1: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Môn thi tốt nghiệp 2</label>
                  <select
                    value={formData.examSubject2 || 'Hóa học'}
                    onChange={(e) => setFormData({ ...formData, examSubject2: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Hóa học">Hóa học</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Lịch sử">Lịch sử</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Địa chỉ cư trú</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Ước mơ nghề nghiệp</label>
                  <input
                    type="text"
                    value={formData.dreamCareer || ''}
                    onChange={(e) => setFormData({ ...formData, dreamCareer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setIsEditingStudent(null);
                  }}
                  className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {isAddingNew ? 'Lưu học sinh mới' : 'Cập nhật thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base">Xác nhận xóa học sinh</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa học sinh <strong>{studentToDelete.name}</strong> ({studentToDelete.code}) khỏi danh sách lớp 12A7? Thao tác này không thể hoàn tác.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-1.5 rounded-xl border text-slate-600 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
