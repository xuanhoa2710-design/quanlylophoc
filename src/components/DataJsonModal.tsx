import React, { useState, useRef } from 'react';
import { useApp, getWeekRangeByIndex } from '../context/AppContext';
import {
  FileJson,
  Download,
  Upload,
  Copy,
  Check,
  X,
  Users,
  CalendarCheck,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileCode,
} from 'lucide-react';

export const DataJsonModal: React.FC = () => {
  const {
    isJsonModalOpen,
    setIsJsonModalOpen,
    getExportJsonPayload,
    downloadDataAsJson,
    importDataFromJson,
    resetToHardcodedDefaultData,
    students,
    allAttendanceDays,
    disciplineEntries,
    evaluations,
    announcements,
    currentWeek,
    appConfig,
    role,
    isTeacherAuthenticated,
  } = useApp();

  const currentWeekRange = getWeekRangeByIndex(currentWeek);
  const [selectedScope, setSelectedScope] = useState<'all' | 'students' | 'attendance_discipline'>('all');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeMode, setActiveMode] = useState<'export' | 'import'>('export');
  const [importJsonText, setImportJsonText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTeacher = role === 'teacher' && isTeacherAuthenticated;
  if (!isJsonModalOpen || !isTeacher) return null;
  const payload = getExportJsonPayload(selectedScope);
  const jsonString = JSON.stringify(payload, null, 2);
  const byteSize = new Blob([jsonString]).size;
  const sizeKb = (byteSize / 1024).toFixed(1);

  const handleDownload = (scope: 'all' | 'students' | 'attendance_discipline') => {
    const fileName = downloadDataAsJson(scope);
    setStatusMsg({
      type: 'success',
      text: `Đã xuất và tải xuống file "${fileName}" thành công!`,
    });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setStatusMsg({
        type: 'success',
        text: 'Đã sao chép toàn bộ nội dung JSON vào bộ nhớ tạm (Clipboard)!',
      });
      setTimeout(() => {
        setCopied(false);
        setStatusMsg(null);
      }, 3000);
    } catch {
      setStatusMsg({
        type: 'error',
        text: 'Không thể tự động sao chép, vui lòng bôi đen trong khung bên dưới.',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
        const res = importDataFromJson(content);
        setStatusMsg({
          type: res.success ? 'success' : 'error',
          text: res.message,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleManualImport = () => {
    if (!importJsonText.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng dán nội dung JSON hoặc tải file .json lên!' });
      return;
    }
    const res = importDataFromJson(importJsonText);
    setStatusMsg({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-emerald-600 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md shadow-xs">
              <FileJson className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Xuất & Sao Lưu Dữ Liệu JSON ({appConfig.className})
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold text-amber-200">
                  Chuẩn UTF-8 • {sizeKb} KB
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                {appConfig.schoolName} • GVCN: {appConfig.teacherName} • Tải xuống file .json hoặc sao chép trực tiếp
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsJsonModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-5 pt-4 pb-2 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="inline-flex p-1 rounded-xl bg-slate-200/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveMode('export')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeMode === 'export'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" /> Xuất dữ liệu ra file JSON
            </button>
            {isTeacher && (
              <button
                type="button"
                onClick={() => setActiveMode('import')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeMode === 'import'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Nhập / Khôi phục từ file JSON
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
            <span>50 Học sinh</span>
            <span>•</span>
            <span>10 Môn học</span>
            <span>•</span>
            <span>{Object.keys(allAttendanceDays).length} Ngày điểm danh</span>
            <span>•</span>
            <span>{currentWeekRange.rangeLabel}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-700">
          {statusMsg && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-2.5 font-bold ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {activeMode === 'export' ? (
            <>
              {/* 3 One-Click Download Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Option 1: Full System JSON */}
                <div
                  onClick={() => setSelectedScope('all')}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                    selectedScope === 'all'
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Database className="w-4 h-4" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                        Khuyên dùng
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      1. Toàn Bộ Dữ Liệu Lớp 12A7
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Bao gồm tất cả: 50 học sinh, bảng điểm 10 môn, điểm danh (Thứ 2-Thứ 6), điểm thi đua tuần, nhận xét, thời khóa biểu, trực nhật.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedScope('all');
                      handleDownload('all');
                    }}
                    className="mt-3.5 w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải file JSON Toàn bộ
                  </button>
                </div>

                {/* Option 2: Students & 10-Subject Grades JSON */}
                <div
                  onClick={() => setSelectedScope('students')}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                    selectedScope === 'students'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                        {students.length} Học sinh
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      2. Hồ Sơ & Bảng Điểm 10 Môn
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Xuất riêng danh sách 50 học sinh, thông tin phụ huynh, tổ, chức vụ, mã PIN và bảng điểm tổng hợp 10 môn học.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedScope('students');
                      handleDownload('students');
                    }}
                    className="mt-3.5 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải JSON Hồ sơ & Điểm
                  </button>
                </div>

                {/* Option 3: Attendance & Weekly Emulation JSON */}
                <div
                  onClick={() => setSelectedScope('attendance_discipline')}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                    selectedScope === 'attendance_discipline'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {currentWeekRange.shortRangeLabel}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      3. Điểm Danh & Thi Đua Tuần
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Xuất dữ liệu điểm danh Thứ 2 – Thứ 6, nhật ký lỗi vi phạm, điểm thưởng và bảng tổng kết thi đua tự động sau Thứ 6.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedScope('attendance_discipline');
                      handleDownload('attendance_discipline');
                    }}
                    className="mt-3.5 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải JSON Điểm danh & Thi đua
                  </button>
                </div>
              </div>

              {/* Live JSON Preview & Copy Box */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 text-slate-100">
                <div className="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs text-white">
                      Xem trước nội dung JSON ({selectedScope === 'all' ? 'Toàn bộ hệ thống' : selectedScope === 'students' ? 'Hồ sơ & Bảng điểm 50 HS' : 'Điểm danh & Thi đua'})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({sizeKb} KB)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-300" /> Copy JSON
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(selectedScope)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Tải xuống (.json)
                    </button>
                  </div>
                </div>

                <pre className="p-4 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-64 text-emerald-300 select-all">
                  {jsonString.slice(0, 8000)}
                  {jsonString.length > 8000 && `\n\n... (Còn tiếp ${(jsonString.length - 8000).toLocaleString()} ký tự — Nhấn "Tải xuống (.json)" hoặc "Copy JSON" để lấy đầy đủ 100% dữ liệu)`}
                </pre>
              </div>
            </>
          ) : (
            /* Import Mode for GVCN */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-sm text-blue-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Khôi phục / Nhập dữ liệu từ file JSON
                  </h4>
                  <p className="text-xs text-blue-800 mt-0.5">
                    Chọn file <code className="font-mono font-bold">.json</code> đã sao lưu trước đó từ máy tính hoặc dán mã JSON vào khung bên dưới.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors shrink-0"
                  >
                    <Upload className="w-4 h-4" /> Chọn file .JSON từ máy tính
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Hoặc dán trực tiếp nội dung JSON vào đây:
                </label>
                <textarea
                  rows={9}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='{"meta": {...}, "students": [...], "allAttendanceDays": {...}}'
                  className="w-full p-3.5 rounded-2xl border border-slate-300 font-mono text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    resetToHardcodedDefaultData();
                    setStatusMsg({
                      type: 'success',
                      text: 'Đã khôi phục toàn bộ hệ thống về bộ Dữ liệu gốc mặc định (Hardcoded trong mã nguồn)!',
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-2 border border-amber-300 transition-colors"
                >
                  <Database className="w-4 h-4 text-amber-700" /> Khôi phục Dữ liệu gốc mặc định (Hardcoded)
                </button>

                <button
                  type="button"
                  onClick={handleManualImport}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Xác nhận Nhập dữ liệu JSON
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-slate-600 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Bộ dữ liệu chuẩn 12A7 đã được tích hợp cứng (Hardcoded) vào mã nguồn — hiển thị ngay trên mọi thiết bị mới.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownload(selectedScope)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Tải ngay file .JSON
            </button>
            <button
              type="button"
              onClick={() => setIsJsonModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
