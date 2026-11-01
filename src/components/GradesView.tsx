import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student, GradeBatch } from '../types';
import {
  BookOpen,
  Search,
  Award,
  TrendingUp,
  Edit3,
  Check,
  Sparkles,
  FileSpreadsheet,
  Camera,
  BarChart3,
  Plus,
  Trash2,
  Layers,
  RotateCcw,
  X,
  AlertTriangle,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { ComprehensiveGradeImportModal } from './ComprehensiveGradeImportModal';

export const SUBJECT_LIST: {
  key: keyof Student['scores'];
  label: string;
  shortLabel: string;
}[] = [
  { key: 'toan', label: 'Toán', shortLabel: 'Toán' },
  { key: 'van', label: 'Ngữ văn', shortLabel: 'Văn' },
  { key: 'anh', label: 'Tiếng Anh', shortLabel: 'Anh' },
  { key: 'ly', label: 'Vật lý', shortLabel: 'Lý' },
  { key: 'hoa', label: 'Hóa học', shortLabel: 'Hóa' },
  { key: 'su', label: 'Lịch sử', shortLabel: 'Sử' },
  { key: 'gdktpl', label: 'GDKT & PL', shortLabel: 'KTPL' },
  { key: 'tin', label: 'Tin học', shortLabel: 'Tin' },
  { key: 'gddp', label: 'GD Địa phương', shortLabel: 'GDĐP' },
  { key: 'gdqp', label: 'GDQP - AN', shortLabel: 'GDQP' },
];

export const GradesView: React.FC = () => {
  const {
    students,
    role,
    updateSubjectScore,
    updateConduct,
    gradeBatches,
    activeGradeBatchId,
    setActiveGradeBatchId,
    createGradeBatch,
    deleteGradeBatch,
    clearAllGrades,
    clearStudentGrades,
    restoreDefaultGrades,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [tempScores, setTempScores] = useState<Record<keyof Student['scores'], string>>({
    toan: '8.0',
    van: '8.0',
    anh: '8.0',
    ly: '8.0',
    hoa: '8.0',
    su: '8.0',
    gdktpl: '8.0',
    tin: '8.0',
    gddp: '8.0',
    gdqp: '8.0',
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importInitialTab, setImportInitialTab] = useState<'excel' | 'image' | 'analysis'>('image');

  // New Grade Batch Modal state ("Nhập thêm điểm mới theo từng đợt")
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchSemester, setNewBatchSemester] = useState<GradeBatch['semester']>('HK1');
  const [newBatchCopyCurrent, setNewBatchCopyCurrent] = useState(false);
  const [newBatchNote, setNewBatchNote] = useState('');

  // Clear / Delete Gradebook Modal state ("Xóa bảng điểm")
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearTargetSubject, setClearTargetSubject] = useState<'all' | keyof Student['scores']>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const activeBatch =
    gradeBatches.find((b) => b.id === activeGradeBatchId) || gradeBatches[gradeBatches.length - 1];

  const displayStudents = (students || []).filter((s) => {
    if (!s) return false;
    const matchSearch =
      (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = groupFilter === 'all' || s.group === Number(groupFilter);
    const matchClass =
      classificationFilter === 'all' || s.currentClassification === classificationFilter;
    return matchSearch && matchGroup && matchClass;
  });

  const handleStartEdit = (stu: Student) => {
    setEditingStudentId(stu.id);
    setTempScores({
      toan: (stu?.scores?.toan?.avg ?? 8.0).toString(),
      van: (stu?.scores?.van?.avg ?? 8.0).toString(),
      anh: (stu?.scores?.anh?.avg ?? 8.0).toString(),
      ly: (stu?.scores?.ly?.avg ?? 8.0).toString(),
      hoa: (stu?.scores?.hoa?.avg ?? 8.0).toString(),
      su: (stu?.scores?.su?.avg ?? 8.0).toString(),
      gdktpl: (stu?.scores?.gdktpl?.avg ?? 8.0).toString(),
      tin: (stu?.scores?.tin?.avg ?? 8.0).toString(),
      gddp: (stu?.scores?.gddp?.avg ?? 8.0).toString(),
      gdqp: (stu?.scores?.gdqp?.avg ?? 8.0).toString(),
    });
  };

  const handleSaveEdit = (studentId: string) => {
    for (const sub of SUBJECT_LIST) {
      const val = Math.min(10, Math.max(0, parseFloat(tempScores[sub.key]) || 0));
      const rounded = Number(val.toFixed(1));
      updateSubjectScore(studentId, sub.key, 'regular', [rounded, rounded]);
      updateSubjectScore(studentId, sub.key, 'midterm', rounded);
      updateSubjectScore(studentId, sub.key, 'final', rounded);
    }
    setEditingStudentId(null);
    showToast('Đã lưu điểm cập nhật cho học sinh!');
  };

  const handleCreateBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;
    const created = createGradeBatch(
      newBatchName.trim(),
      newBatchSemester,
      newBatchCopyCurrent,
      newBatchNote.trim()
    );
    setNewBatchName('');
    setNewBatchNote('');
    setIsNewBatchModalOpen(false);
    showToast(`Đã tạo và chuyển sang đợt nhập điểm mới: "${created.name}"!`);
  };

  // Class Summary Stats
  const safeStudents = (students || []).filter(Boolean);
  const classAvgGpa = (
    safeStudents.reduce((acc, s) => acc + (s?.currentGpa || 0), 0) / (safeStudents.length || 1)
  ).toFixed(2);
  const xuatSacCount = safeStudents.filter((s) => s?.currentClassification === 'Xuất sắc').length;
  const gioiCount = safeStudents.filter((s) => s?.currentClassification === 'Giỏi').length;
  const khaCount = safeStudents.filter((s) => s?.currentClassification === 'Khá').length;

  return (
    <div className="space-y-5">
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Bảng Điểm Tổng Hợp Tất Cả Các Môn Lớp 12A7 (10 Môn)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý điểm theo từng đợt kiểm tra/thi thử • Nhập bảng điểm bằng Ảnh AI hoặc Excel • Chỉnh sửa hoặc xóa bảng điểm nhanh
            </p>
          </div>

          {role === 'teacher' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setNewBatchName(`Đợt ${gradeBatches.length + 1}: Kiểm tra định kỳ / Thi thử`);
                  setIsNewBatchModalOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nhập Điểm Đợt Mới</span>
              </button>

              <button
                onClick={() => {
                  setImportInitialTab('image');
                  setIsImportModalOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-yellow-300" />
                <span>Nhập Điểm Bằng Ảnh AI / Excel</span>
              </button>

              <button
                onClick={() => setIsClearModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Xóa bảng điểm hoặc làm trống điểm để nhập lại"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Xóa Bảng Điểm</span>
              </button>
            </div>
          )}
        </div>

        {/* Multi-Batch Selector Bar (Quản lý các đợt nhập điểm) */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5 shrink-0">
              <Layers className="w-4 h-4 text-indigo-600" />
              Đợt điểm:
            </span>
            {gradeBatches.map((batch) => {
              const isSelected = batch.id === activeBatch?.id;
              return (
                <button
                  key={batch.id}
                  onClick={() => {
                    setActiveGradeBatchId(batch.id);
                    showToast(`Đã chuyển sang xem và chỉnh sửa: "${batch.name}"`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{batch.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] ${
                      isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-white text-slate-500'
                    }`}
                  >
                    {batch.semester}
                  </span>
                </button>
              );
            })}
          </div>

          {activeBatch && (
            <div className="text-[11px] text-slate-500 flex items-center gap-2 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Ngày tạo: <strong>{activeBatch.createdAt}</strong></span>
              {activeBatch.updatedAt && (
                <span>• Cập nhật: <strong>{activeBatch.updatedAt}</strong></span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Điểm TB Cả Lớp (10 Môn)</div>
            <div className="text-xl font-black text-slate-900">{classAvgGpa}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Học Sinh Xuất Sắc</div>
            <div className="text-xl font-black text-amber-600">
              {xuatSacCount} <span className="text-xs font-normal text-slate-400">HS</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Học Sinh Giỏi</div>
            <div className="text-xl font-black text-emerald-600">
              {gioiCount} <span className="text-xs font-normal text-slate-400">HS</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Học Sinh Khá</div>
            <div className="text-xl font-black text-blue-600">
              {khaCount} <span className="text-xs font-normal text-slate-400">HS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm học sinh theo tên hoặc mã số..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
          >
            <option value="all">Tất cả 4 Tổ</option>
            <option value="1">Tổ 1</option>
            <option value="2">Tổ 2</option>
            <option value="3">Tổ 3</option>
            <option value="4">Tổ 4</option>
          </select>

          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
          >
            <option value="all">Tất cả học lực</option>
            <option value="Xuất sắc">Xuất sắc</option>
            <option value="Giỏi">Giỏi</option>
            <option value="Khá">Khá</option>
            <option value="Đạt">Đạt</option>
            <option value="Chưa đạt">Chưa đạt</option>
          </select>
        </div>
      </div>

      {/* Comprehensive All-10-Subjects Grades Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-extrabold text-slate-800">
            Đang hiển thị: <span className="text-indigo-600">{activeBatch?.name}</span> ({displayStudents.length} học sinh)
          </span>
          <span className="text-[11px] text-slate-500">
            Bấm biểu tượng cây bút ở cuối dòng để nhập/sửa điểm hoặc thùng rác để xóa điểm cá nhân
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center sticky left-0 bg-slate-900 z-10">STT</th>
                <th className="py-3.5 px-3 sticky left-10 bg-slate-900 z-10 min-w-[175px]">
                  Họ và Tên Học Sinh
                </th>
                <th className="py-3.5 px-2 text-center">Tổ</th>
                {SUBJECT_LIST.map((sub) => (
                  <th key={sub.key} className="py-3.5 px-2.5 text-center min-w-[58px]">
                    {sub.shortLabel}
                  </th>
                ))}
                <th className="py-3.5 px-3 text-center bg-indigo-950 text-amber-300">ĐTB Chung</th>
                <th className="py-3.5 px-2.5 text-center">Học lực</th>
                <th className="py-3.5 px-2.5 text-center">Rèn luyện</th>
                {role === 'teacher' && <th className="py-3.5 px-3 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displayStudents.map((stu) => {
                const isEditing = editingStudentId === stu.id;

                return (
                  <tr
                    key={stu.id}
                    className={`transition-colors ${
                      isEditing ? 'bg-indigo-50/70' : 'hover:bg-slate-50/90'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400 sticky left-0 bg-inherit">
                      {stu.stt}
                    </td>
                    <td className="py-2.5 px-3 sticky left-10 bg-inherit">
                      <div className="flex items-center gap-2">
                        <img
                          src={stu.avatar}
                          alt={stu.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="truncate">
                          <div className="font-bold text-slate-800 truncate">{stu.name}</div>
                          <div className="text-[10px] text-slate-400">{stu.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] whitespace-nowrap">
                        Tổ {stu.group}
                      </span>
                    </td>

                    {/* 10 Subjects */}
                    {SUBJECT_LIST.map((sub) => {
                      const avgScore = stu?.scores?.[sub.key]?.avg ?? 0;
                      return (
                        <td key={sub.key} className="py-2.5 px-1.5 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              value={tempScores[sub.key]}
                              onChange={(e) =>
                                setTempScores({ ...tempScores, [sub.key]: e.target.value })
                              }
                              className="w-13 px-1 py-1 text-center rounded-lg border border-indigo-400 bg-white font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          ) : (
                            <span
                              className={`font-bold ${
                                avgScore === 0
                                  ? 'text-slate-300'
                                  : avgScore >= 8.5
                                  ? 'text-emerald-600'
                                  : avgScore >= 6.5
                                  ? 'text-slate-700'
                                  : 'text-rose-600 font-extrabold'
                              }`}
                            >
                              {avgScore === 0 ? '-' : avgScore.toFixed(1)}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Overall GPA */}
                    <td className="py-2.5 px-3 text-center bg-indigo-50/50">
                      <span
                        className={`px-2 py-1 rounded-lg font-black text-xs ${
                          stu.currentGpa === 0
                            ? 'bg-slate-100 text-slate-400'
                            : stu.currentGpa >= 8.5
                            ? 'bg-emerald-100 text-emerald-800'
                            : stu.currentGpa >= 8.0
                            ? 'bg-blue-100 text-blue-800'
                            : stu.currentGpa >= 6.5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {stu.currentGpa === 0 ? '-' : stu.currentGpa}
                      </span>
                    </td>

                    {/* Classification */}
                    <td className="py-2.5 px-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          stu.currentClassification === 'Xuất sắc'
                            ? 'bg-amber-100 text-amber-800'
                            : stu.currentClassification === 'Giỏi'
                            ? 'bg-emerald-100 text-emerald-700'
                            : stu.currentClassification === 'Khá'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {stu.currentClassification}
                      </span>
                    </td>

                    {/* Conduct */}
                    <td className="py-2.5 px-2.5 text-center">
                      {role === 'teacher' ? (
                        <select
                          value={stu.currentConduct}
                          onChange={(e) => updateConduct(stu.id, e.target.value as any)}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-bold bg-white text-emerald-700"
                        >
                          <option value="Tốt">Tốt</option>
                          <option value="Khá">Khá</option>
                          <option value="Đạt">Đạt</option>
                          <option value="Chưa đạt">Chưa đạt</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          {stu.currentConduct}
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    {role === 'teacher' && (
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleSaveEdit(stu.id)}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                              title="Lưu bảng điểm"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingStudentId(null)}
                              className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300"
                              title="Hủy"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(stu)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Sửa điểm 10 môn của học sinh này"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                clearStudentGrades(stu.id);
                                showToast(`Đã xóa điểm của học sinh ${stu.name} về 0.`);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Xóa điểm của học sinh này về 0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CREATE NEW GRADE BATCH ("Nhập thêm điểm mới theo từng đợt") */}
      {isNewBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Tạo Đợt Nhập Điểm Mới (Lớp 12A7)
                </h3>
              </div>
              <button
                onClick={() => setIsNewBatchModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBatchSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên đợt nhập điểm *
                </label>
                <input
                  type="text"
                  required
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="VD: Đợt 3: Điểm Cuối Học kỳ I (2026-2027)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Học kỳ / Loại đợt</label>
                <select
                  value={newBatchSemester}
                  onChange={(e) => setNewBatchSemester(e.target.value as GradeBatch['semester'])}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                >
                  <option value="HK1">Học kỳ I (HK1)</option>
                  <option value="HK2">Học kỳ II (HK2)</option>
                  <option value="Thi thử">Thi thử Tốt nghiệp THPT</option>
                  <option value="Cả năm">Tổng kết Cả năm</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 block">Khởi tạo dữ liệu điểm ban đầu:</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!newBatchCopyCurrent}
                    onChange={() => setNewBatchCopyCurrent(false)}
                    className="text-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">
                    Tạo bảng điểm trống (Tất cả = 0) để nhập điểm mới từ đầu / quét ảnh AI
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={newBatchCopyCurrent}
                    onChange={() => setNewBatchCopyCurrent(true)}
                    className="text-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">
                    Sao chép điểm từ đợt hiện tại làm nền để chỉnh sửa nhanh
                  </span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú đợt điểm</label>
                <input
                  type="text"
                  value={newBatchNote}
                  onChange={(e) => setNewBatchNote(e.target.value)}
                  placeholder="Ghi chú thêm (không bắt buộc)..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Tạo Đợt Điểm Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CLEAR / DELETE GRADEBOOK ("Xóa bảng điểm") */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Xóa Bảng Điểm / Làm Trống Điểm Lớp 12A7
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Đợt đang chọn: <strong>{activeBatch?.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Option A: Clear 1 subject or all subjects */}
              <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-3">
                <div className="font-extrabold text-red-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  1. Xóa điểm các môn trong đợt hiện tại về 0 (Làm trống để nhập mới)
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <select
                    value={clearTargetSubject}
                    onChange={(e) => setClearTargetSubject(e.target.value as any)}
                    className="flex-1 px-3 py-2 rounded-xl border border-red-300 bg-white font-bold text-slate-800"
                  >
                    <option value="all">Tất cả 10 môn học (Xóa trắng cả bảng điểm)</option>
                    {SUBJECT_LIST.map((sub) => (
                      <option key={sub.key} value={sub.key}>
                        Chỉ xóa cột điểm môn: {sub.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const res = clearAllGrades(
                        clearTargetSubject === 'all' ? undefined : clearTargetSubject
                      );
                      showToast(res.message);
                      setIsClearModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs cursor-pointer shrink-0"
                  >
                    Xác nhận xóa điểm
                  </button>
                </div>
              </div>

              {/* Option B: Delete the entire Grade Batch */}
              {gradeBatches.length > 1 && activeBatch && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-amber-950">
                      2. Xóa hẳn đợt nhập điểm "{activeBatch.name}"
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Gỡ bỏ đợt điểm này và chuyển về đợt điểm trước đó.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const res = deleteGradeBatch(activeBatch.id);
                      showToast(res.message);
                      setIsClearModalOpen(false);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 cursor-pointer"
                  >
                    Xóa đợt này
                  </button>
                </div>
              )}

              {/* Option C: Restore Default Baseline Grades */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold text-blue-950">
                    3. Khôi phục bộ điểm gốc mặc định của lớp 12A7
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Lấy lại bảng điểm chuẩn ban đầu của 50 học sinh.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    restoreDefaultGrades();
                    showToast('Đã khôi phục bảng điểm gốc mặc định cho 50 học sinh 12A7!');
                    setIsClearModalOpen(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Import & AI Analysis Modal */}
      <ComprehensiveGradeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        initialTab={importInitialTab}
      />
    </div>
  );
};
