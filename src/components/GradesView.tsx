import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  GraduationCap,
  Download,
  Printer,
  Search,
  FileSpreadsheet,
  Edit3,
  Sparkles,
  Award,
  CheckCircle2,
  Table,
  FileJson,
} from 'lucide-react';
import { AccessGuard } from './AccessGuard';
import { ComprehensiveGradeImportModal } from './ComprehensiveGradeImportModal';

export const GradesView: React.FC = () => {
  const {
    role,
    isTeacherAuthenticated,
    students,
    activeStudentId,
    currentStudent,
    setIsJsonModalOpen,
  } = useApp();

  // Guard: If teacher role but not authenticated
  if (role === 'teacher' && !isTeacherAuthenticated) {
    return <AccessGuard requiredRole="teacher" pageTitle="Bảng điểm Cả Lớp 12A7" />;
  }

  const [showComprehensiveModal, setShowComprehensiveModal] = useState(false);
  const [filterGroup, setFilterGroup] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 10 high-school subjects of class 12A7
  const subjectList: { key: keyof Student['scores']; name: string; teacher: string }[] = [
    { key: 'toan', name: 'Toán học', teacher: 'Thầy Thanh' },
    { key: 'van', name: 'Ngữ văn', teacher: 'Cô Đào' },
    { key: 'anh', name: 'Tiếng Anh', teacher: 'Cô Thảo' },
    { key: 'ly', name: 'Vật lý', teacher: 'Thầy Tèo' },
    { key: 'hoa', name: 'Hóa học', teacher: 'Thầy Hòa (GVCN)' },
    { key: 'su', name: 'Lịch sử', teacher: 'Thầy Thiện' },
    { key: 'gdktpl', name: 'GDKT-PL', teacher: 'Cô Vân Anh' },
    { key: 'tin', name: 'Tin học', teacher: 'Cô Tình' },
    { key: 'gddp', name: 'GD địa phương', teacher: 'Cô Đào' },
    { key: 'gdqp', name: 'GDQP-AN', teacher: 'Cô Liên' },
  ];

  // If student or parent role: STRICTLY show only their own / their child's record!
  const displayedStudents =
    role === 'student' || role === 'parent'
      ? (students || []).filter((s) => s?.id === activeStudentId)
      : (students || []).filter((s) => {
          const matchSearch =
            (s?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s?.code || '').toLowerCase().includes(searchTerm.toLowerCase());
          const matchGroup = filterGroup === 'all' || s?.group === filterGroup;
          return matchSearch && matchGroup;
        });

  // Export full 10-subject comprehensive grade sheet to CSV
  const handleExportExcel = () => {
    const rows = [
      [
        'STT',
        'Mã HS',
        'Họ và tên',
        'Tổ',
        'Toán',
        'Văn',
        'Anh',
        'Lý',
        'Hóa',
        'Sử',
        'GDKT-PL',
        'Tin học',
        'GDĐP',
        'GDQP-AN',
        'ĐTB Chung',
        'Học lực',
        'Rèn luyện',
      ],
      ...(students || []).map((s) => [
        s?.stt ?? '',
        s?.code ?? '',
        s?.name ?? '',
        s?.group ?? '',
        s?.scores?.toan?.avg ?? 0,
        s?.scores?.van?.avg ?? 0,
        s?.scores?.anh?.avg ?? 0,
        s?.scores?.ly?.avg ?? 0,
        s?.scores?.hoa?.avg ?? 0,
        s?.scores?.su?.avg ?? 0,
        s?.scores?.gdktpl?.avg ?? 0,
        s?.scores?.tin?.avg ?? 0,
        s?.scores?.gddp?.avg ?? 0,
        s?.scores?.gdqp?.avg ?? 0,
        s?.currentGpa ?? 0,
        s?.currentClassification ?? '',
        s?.currentConduct ?? '',
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bang_Diem_Tong_Hop_10_Mon_Lop_12A7_THPT_Vinh_Loc_B.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const renderScoreCell = (scoreNum: number) => {
    const isHigh = scoreNum >= 8.0;
    const isLow = scoreNum < 5.0;
    return (
      <span
        className={`font-mono font-bold ${
          isHigh
            ? 'text-emerald-700'
            : isLow
            ? 'text-red-600 font-extrabold'
            : 'text-slate-800'
        }`}
      >
        {scoreNum}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Bảng Điểm Tổng Hợp Tất Cả 10 Môn Học (Lớp 12A7)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Năm học 2026 - 2027 • Tự động tính điểm trung bình và xếp loại theo quy chế THPT • GVCN: Thầy Trương Xuân Hòa
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {role === 'teacher' && isTeacherAuthenticated && (
            <>
              <button
                onClick={() => setShowComprehensiveModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                <span>Nhập Bảng Điểm Tổng Hợp (Excel / Ảnh AI / Bảng tính)</span>
              </button>
              <button
                onClick={() => setIsJsonModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                title="Xuất dữ liệu ra file JSON (Chỉ dành cho GVCN)"
              >
                <FileJson className="w-4 h-4 text-amber-300" /> Xuất JSON
              </button>
            </>
          )}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Xuất Excel (.csv)
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> In phiếu điểm (PDF)
          </button>
        </div>
      </div>

      {/* For Student / Parent View: Visual Individual Progress Card */}
      {(role === 'student' || role === 'parent') && currentStudent && (
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/15">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-amber-300 text-xs font-extrabold uppercase">
                Bảng điểm tổng hợp cá nhân 12A7
              </span>
              <h3 className="text-2xl font-black mt-1 text-white">{currentStudent.name}</h3>
              <p className="text-xs text-blue-200">
                Mã số: {currentStudent.code} • Tổ {currentStudent.group} • Tổ hợp thi TN: {currentStudent.examSubject1} + {currentStudent.examSubject2}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 px-4 py-3 rounded-2xl border border-white/15">
              <div className="text-center">
                <div className="text-[10px] text-blue-200 uppercase font-bold">ĐTB Năm 11B7</div>
                <div className="text-xl font-black text-slate-300">{currentStudent.gpaPrevYear}</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] text-amber-300 uppercase font-bold">ĐTB 10 Môn Hiện Tại</div>
                <div className="text-2xl font-black text-amber-400">{currentStudent.currentGpa}</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] text-emerald-300 uppercase font-bold">Học lực</div>
                <div className="text-sm font-extrabold text-emerald-300">{currentStudent.currentClassification}</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] text-cyan-300 uppercase font-bold">Rèn luyện</div>
                <div className="text-sm font-extrabold text-cyan-300">{currentStudent.currentConduct}</div>
              </div>
            </div>
          </div>

          {/* Grid of All 10 Subject Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
            {subjectList.map((sub) => {
              const sc = currentStudent?.scores?.[sub.key];
              return (
                <div key={sub.key} className="bg-white/10 rounded-2xl p-3 border border-white/10 text-center">
                  <div className="text-xs font-bold text-blue-200 truncate" title={`${sub.name} - ${sub.teacher}`}>
                    {sub.name}
                  </div>
                  <div className="text-xl font-black text-white mt-1">{sc?.avg ?? 0}</div>
                  <div className="text-[10px] text-white/60 mt-0.5 truncate">
                    {sub.teacher}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Teacher View: Master 10-Subject Comprehensive Grade Sheet */}
      {role === 'teacher' && (
        <>
          {/* Controls Bar: Search & Group filter + Quick Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5" /> Bảng Điểm Tổng Hợp 10 Môn Học
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">
                (Điểm &ge; 8.0: Giỏi • Điểm &lt; 5.0: Cần rèn luyện thêm)
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-48 sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc mã HS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
              >
                <option value="all">Tất cả tổ (Tổ 1 - 4)</option>
                <option value={1}>Tổ 1 (13 HS)</option>
                <option value={2}>Tổ 2 (13 HS)</option>
                <option value={3}>Tổ 3 (12 HS)</option>
                <option value={4}>Tổ 4 (12 HS)</option>
              </select>

              <button
                onClick={() => setShowComprehensiveModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Nhập điểm / Chỉnh sửa
              </button>
            </div>
          </div>

          {/* COMPREHENSIVE 10-SUBJECT TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[1050px]">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-2.5 text-center w-10">STT</th>
                    <th className="py-3 px-2 w-16">Mã HS</th>
                    <th className="py-3 px-3 min-w-[150px]">Họ và tên</th>
                    <th className="py-3 px-1.5 text-center w-10">Tổ</th>
                    <th className="py-3 px-1.5 text-center font-extrabold text-blue-900" title="Toán học - Thầy Hồ Quốc Thanh">Toán</th>
                    <th className="py-3 px-1.5 text-center font-extrabold text-blue-900" title="Ngữ văn - Cô Đinh Thị Đào">Văn</th>
                    <th className="py-3 px-1.5 text-center font-extrabold text-blue-900" title="Tiếng Anh - Cô Ngô Thị Thảo">Anh</th>
                    <th className="py-3 px-1.5 text-center font-extrabold text-blue-900" title="Vật lý - Thầy Nguyễn Văn Tèo">Lý</th>
                    <th className="py-3 px-1.5 text-center font-extrabold text-blue-900" title="Hóa học - Thầy Trương Xuân Hòa (GVCN)">Hóa</th>
                    <th className="py-3 px-1.5 text-center font-extrabold text-blue-900" title="Lịch sử - Thầy Trịnh Ngọc Thiện">Sử</th>
                    <th className="py-3 px-1.5 text-center font-extrabold text-blue-900" title="GDKT-PL - Cô Hồ Thị Vân Anh">KTPL</th>
                    <th className="py-3 px-1.5 text-center font-extrabold text-blue-900" title="Tin học - Cô Tạ Thị Tình">Tin</th>
                    <th className="py-3 px-1.5 text-center font-extrabold text-blue-900" title="GD địa phương - Cô Đinh Thị Đào">GDĐP</th>
                    <th className="py-3 px-1.5 text-center font-extrabold text-blue-900" title="GDQP-AN - Cô Đinh Thị Liên">GDQP</th>
                    <th className="py-3 px-2.5 text-center font-black text-indigo-700 bg-indigo-50/70">ĐTB Chung</th>
                    <th className="py-3 px-2 text-center font-bold">Học lực</th>
                    <th className="py-3 px-2 text-center font-bold">Rèn luyện</th>
                    <th className="py-3 px-2 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedStudents.map((stu) => {
                    const sc = stu?.scores;
                    return (
                      <tr key={stu.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-2.5 px-2.5 text-center font-bold text-slate-400">{stu.stt}</td>
                        <td className="py-2.5 px-2 font-semibold text-blue-700 font-mono">{stu.code}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 truncate">{stu.name}</td>
                        <td className="py-2.5 px-1.5 text-center text-slate-500 font-semibold">T{stu.group}</td>
                        <td className="py-2.5 px-1.5 text-center">{renderScoreCell(sc?.toan?.avg ?? 0)}</td>
                        <td className="py-2.5 px-1.5 text-center">{renderScoreCell(sc?.van?.avg ?? 0)}</td>
                        <td className="py-2.5 px-1.5 text-center">{renderScoreCell(sc?.anh?.avg ?? 0)}</td>
                        <td className="py-2.5 px-1.5 text-center">{renderScoreCell(sc?.ly?.avg ?? 0)}</td>
                        <td className="py-2.5 px-1.5 text-center">{renderScoreCell(sc?.hoa?.avg ?? 0)}</td>
                        <td className="py-2.5 px-1.5 text-center">{renderScoreCell(sc?.su?.avg ?? 0)}</td>
                        <td className="py-2.5 px-1.5 text-center">{renderScoreCell(sc?.gdktpl?.avg ?? 0)}</td>
                        <td className="py-2.5 px-1.5 text-center">{renderScoreCell(sc?.tin?.avg ?? 0)}</td>
                        <td className="py-2.5 px-1.5 text-center">{renderScoreCell(sc?.gddp?.avg ?? 0)}</td>
                        <td className="py-2.5 px-1.5 text-center">{renderScoreCell(sc?.gdqp?.avg ?? 0)}</td>
                        <td className="py-2.5 px-2.5 text-center font-black font-mono text-indigo-700 text-sm bg-indigo-50/40">
                          {stu.currentGpa}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              stu.currentClassification === 'Xuất sắc'
                                ? 'bg-purple-100 text-purple-800'
                                : stu.currentClassification === 'Giỏi'
                                ? 'bg-emerald-100 text-emerald-800'
                                : stu.currentClassification === 'Khá'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {stu.currentClassification}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-700">
                          {stu.currentConduct}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => setShowComprehensiveModal(true)}
                            className="px-2 py-1 rounded-lg hover:bg-blue-100 text-blue-700 font-bold text-[11px] inline-flex items-center gap-1 border border-blue-200 transition-colors"
                            title="Mở bảng điểm tổng hợp để chỉnh sửa điểm"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Sửa điểm</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <div>
                Hiển thị <strong>{displayedStudents.length}</strong> / <strong>{students.length}</strong> học sinh 12A7
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Giỏi (&ge; 8.0)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Khá (6.5 - 7.9)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Đạt (5.0 - 6.4)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Chưa đạt (&lt; 5.0)
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Comprehensive Grade Import & Matrix Editing Modal for All 10 Subjects */}
      <ComprehensiveGradeImportModal
        isOpen={showComprehensiveModal}
        onClose={() => setShowComprehensiveModal(false)}
      />
    </div>
  );
};
