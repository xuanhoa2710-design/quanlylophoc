import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Camera,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Bot,
  RefreshCw,
  Table,
  Save,
  Search,
  Clipboard,
  HelpCircle,
  Eye,
  Award,
} from 'lucide-react';

interface ComprehensiveGradeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ALL_SUBJECTS = [
  { key: 'toan', name: 'Toán', teacher: 'Thầy Thanh', short: 'TO' },
  { key: 'van', name: 'Ngữ văn', teacher: 'Cô Đào', short: 'VA' },
  { key: 'anh', name: 'Tiếng Anh', teacher: 'Cô Thảo', short: 'AN' },
  { key: 'ly', name: 'Vật lý', teacher: 'Thầy Tèo', short: 'LY' },
  { key: 'hoa', name: 'Hóa học', teacher: 'Thầy Hòa (GVCN)', short: 'HO' },
  { key: 'su', name: 'Lịch sử', teacher: 'Thầy Thiện', short: 'SU' },
  { key: 'gdktpl', name: 'GDKT-PL', teacher: 'Cô Vân Anh', short: 'KT' },
  { key: 'tin', name: 'Tin học', teacher: 'Cô Tình', short: 'TI' },
  { key: 'gddp', name: 'GD địa phương', teacher: 'Cô Đào', short: 'DP' },
  { key: 'gdqp', name: 'GDQP-AN', teacher: 'Cô Liên', short: 'QP' },
] as const;

type SubjectKey = (typeof ALL_SUBJECTS)[number]['key'];

interface RowData {
  studentId: string;
  stt: number;
  code: string;
  name: string;
  group: number;
  scores: Record<SubjectKey, number | ''>;
  conduct: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';
}

export const ComprehensiveGradeImportModal: React.FC<ComprehensiveGradeImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { students, importExcelScores } = useApp();

  const [activeTab, setActiveTab] = useState<'grid' | 'excel' | 'ocr'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<number | 'all'>('all');
  const [gridData, setGridData] = useState<RowData[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Excel state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelFileName, setExcelFileName] = useState<string | null>(null);

  // OCR state
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrAnalysis, setOcrAnalysis] = useState<string | null>(null);

  // Paste dialog state
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteRawText, setPasteRawText] = useState('');

  // Initialize gridData from current students
  useEffect(() => {
    if (isOpen && Array.isArray(students) && students.length > 0) {
      const initialRows: RowData[] = students.map((s) => {
        const scoresMap: Record<SubjectKey, number | ''> = {
          toan: s?.scores?.toan?.avg || '',
          van: s?.scores?.van?.avg || '',
          anh: s?.scores?.anh?.avg || '',
          ly: s?.scores?.ly?.avg || '',
          hoa: s?.scores?.hoa?.avg || '',
          su: s?.scores?.su?.avg || '',
          gdktpl: s?.scores?.gdktpl?.avg || '',
          tin: s?.scores?.tin?.avg || '',
          gddp: s?.scores?.gddp?.avg || '',
          gdqp: s?.scores?.gdqp?.avg || '',
        };

        return {
          studentId: s.id,
          stt: s.stt,
          code: s.code,
          name: s.name,
          group: s.group,
          scores: scoresMap,
          conduct: s.currentConduct || 'Tốt',
        };
      });

      setGridData(initialRows);
      setSuccessToast(null);
      setErrorMessage(null);
      setExcelFileName(null);
      setImagePreview(null);
      setOcrAnalysis(null);
    }
  }, [isOpen, students]);

  if (!isOpen) return null;

  // Handle cell score change
  const handleScoreChange = (studentId: string, subjectKey: SubjectKey, valStr: string) => {
    setGridData((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row;
        if (valStr === '') {
          return { ...row, scores: { ...row.scores, [subjectKey]: '' } };
        }
        let parsed = parseFloat(valStr);
        if (isNaN(parsed)) return row;
        if (parsed < 0) parsed = 0;
        if (parsed > 10) parsed = 10;
        return {
          ...row,
          scores: { ...row.scores, [subjectKey]: Number(parsed.toFixed(1)) },
        };
      })
    );
  };

  // Handle conduct change
  const handleConductChange = (
    studentId: string,
    conduct: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt'
  ) => {
    setGridData((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, conduct } : row))
    );
  };

  // Calculate row average & classification on the fly
  const calculateRowStats = (row: RowData) => {
    const validScores = Object.values(row.scores).filter(
      (v): v is number => typeof v === 'number' && !isNaN(v)
    );
    if (validScores.length === 0) {
      return { gpa: 0, classification: 'Chưa đạt' as const };
    }
    const gpa = Number((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2));
    const minScore = Math.min(...validScores);

    let classification: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Đạt' | 'Chưa đạt' = 'Đạt';
    if (gpa >= 9.0 && minScore >= 8.0 && row.conduct === 'Tốt') {
      classification = 'Xuất sắc';
    } else if (gpa >= 8.0 && minScore >= 6.5 && row.conduct === 'Tốt') {
      classification = 'Giỏi';
    } else if (gpa >= 6.5 && minScore >= 5.0) {
      classification = 'Khá';
    } else if (gpa >= 5.0) {
      classification = 'Đạt';
    } else {
      classification = 'Chưa đạt';
    }

    return { gpa, classification };
  };

  // Filtered rows for display
  const displayedRows = gridData.filter((row) => {
    const matchSearch =
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = filterGroup === 'all' || row.group === filterGroup;
    return matchSearch && matchGroup;
  });

  // Export official template for 12A7 with all 10 subjects
  const handleDownloadTemplate = () => {
    const headers = [
      'STT',
      'Mã HS',
      'Họ và tên',
      'Tổ',
      'Toán',
      'Ngữ văn',
      'Tiếng Anh',
      'Vật lý',
      'Hóa học',
      'Lịch sử',
      'GDKT-PL',
      'Tin học',
      'GD địa phương',
      'GDQP-AN',
      'Hạnh kiểm',
    ];

    const data = students.map((s) => [
      s.stt,
      s.code,
      s.name,
      s.group,
      s.scores.toan.avg || 8.0,
      s.scores.van.avg || 7.5,
      s.scores.anh.avg || 8.0,
      s.scores.ly.avg || 7.5,
      s.scores.hoa.avg || 8.5,
      s.scores.su.avg || 7.5,
      s.scores.gdktpl.avg || 8.0,
      s.scores.tin.avg || 9.0,
      s.scores.gddp.avg || 8.5,
      s.scores.gdqp.avg || 9.0,
      s.currentConduct || 'Tốt',
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 25 },
      { wch: 6 },
      { wch: 8 },
      { wch: 10 },
      { wch: 11 },
      { wch: 9 },
      { wch: 9 },
      { wch: 9 },
      { wch: 10 },
      { wch: 9 },
      { wch: 15 },
      { wch: 10 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bang_Diem_Tong_Hop_12A7');
    XLSX.writeFile(workbook, 'Mau_Bang_Diem_Tong_Hop_12A7_THPT_Vinh_Loc_B.xlsx');
  };

  // Fill random realistic scores (7.0 - 9.5) for instant testing
  const handleFillRandomSampleScores = () => {
    setGridData((prev) =>
      prev.map((row) => {
        const newScores: Record<SubjectKey, number | ''> = { ...row.scores };
        ALL_SUBJECTS.forEach((sub) => {
          // Generate realistic grade between 6.5 and 9.6
          const base = 6.5 + Math.random() * 3.1;
          newScores[sub.key] = Number(base.toFixed(1));
        });
        return {
          ...row,
          scores: newScores,
          conduct: Math.random() > 0.05 ? 'Tốt' : 'Khá',
        };
      })
    );
    setSuccessToast('Đã điền điểm mẫu ngẫu nhiên cho tất cả học sinh!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Parse Excel file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rawJson.length < 2) {
          setErrorMessage('File Excel không có đủ dữ liệu dòng tiêu đề và học sinh.');
          return;
        }

        const headerRow = (rawJson[0] as any[]).map((h) => String(h || '').trim().toLowerCase());

        // Find column indices
        const findCol = (...keywords: string[]) =>
          headerRow.findIndex((col) => keywords.some((k) => col.includes(k.toLowerCase())));

        const colIdx = {
          code: findCol('mã hs', 'ma hs', 'mã số', 'code', 'id'),
          name: findCol('họ và tên', 'họ tên', 'tên', 'name'),
          toan: findCol('toán', 'toan', 'math'),
          van: findCol('văn', 'ngữ văn', 'van'),
          anh: findCol('tiếng anh', 'anh', 'english'),
          ly: findCol('vật lý', 'vật lí', 'lý', 'ly', 'physics'),
          hoa: findCol('hóa học', 'hóa', 'hoa', 'chemistry'),
          su: findCol('lịch sử', 'sử', 'su', 'history'),
          gdktpl: findCol('gdkt-pl', 'gdktpl', 'ktpl', 'kinh tế pháp luật'),
          tin: findCol('tin học', 'tin', 'informatics'),
          gddp: findCol('gd địa phương', 'gddp', 'địa phương'),
          gdqp: findCol('gdqp-an', 'gdqp', 'quốc phòng'),
          conduct: findCol('hạnh kiểm', 'rèn luyện', 'conduct'),
        };

        let updatedCount = 0;
        setGridData((prevRows) => {
          return prevRows.map((row) => {
            // Find matching row in Excel
            const matchRow = rawJson.slice(1).find((r) => {
              if (colIdx.code !== -1 && r[colIdx.code]) {
                const cVal = String(r[colIdx.code]).trim().toUpperCase();
                if (cVal === row.code.toUpperCase() || cVal.includes(row.code.toUpperCase())) {
                  return true;
                }
              }
              if (colIdx.name !== -1 && r[colIdx.name]) {
                const nVal = String(r[colIdx.name]).trim().toLowerCase();
                if (nVal === row.name.toLowerCase()) return true;
              }
              return false;
            });

            if (!matchRow) return row;
            updatedCount++;

            const newScores = { ...row.scores };
            ALL_SUBJECTS.forEach((sub) => {
              const idx = colIdx[sub.key];
              if (idx !== -1 && matchRow[idx] !== undefined && matchRow[idx] !== null) {
                const num = parseFloat(String(matchRow[idx]).replace(',', '.'));
                if (!isNaN(num) && num >= 0 && num <= 10) {
                  newScores[sub.key] = Number(num.toFixed(1));
                }
              }
            });

            let newConduct = row.conduct;
            if (colIdx.conduct !== -1 && matchRow[colIdx.conduct]) {
              const cStr = String(matchRow[colIdx.conduct]).trim();
              if (['Tốt', 'Khá', 'Đạt', 'Chưa đạt'].includes(cStr)) {
                newConduct = cStr as any;
              }
            }

            return {
              ...row,
              scores: newScores,
              conduct: newConduct,
            };
          });
        });

        setActiveTab('grid');
        setSuccessToast(`Đã nạp thành công điểm tổng hợp từ file Excel cho ${updatedCount} học sinh!`);
        setTimeout(() => setSuccessToast(null), 4000);
      } catch (err: any) {
        setErrorMessage(`Lỗi đọc file Excel: ${err?.message || 'Định dạng không hợp lệ'}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle OCR from Image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Data = evt.target?.result as string;
      setImagePreview(base64Data);
      setIsOcrLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetch('/api/ai/grade-ocr-comprehensive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
          }),
        });

        const data = await res.json();
        if (data.success && data.data) {
          const extractedRows: any[] = data.data.extractedRows || [];
          let matchCount = 0;

          setGridData((prev) =>
            prev.map((row) => {
              const match = extractedRows.find((item) => {
                if (item.code && (item.code === row.code || String(item.code).includes(row.code))) {
                  return true;
                }
                if (item.name && item.name.toLowerCase() === row.name.toLowerCase()) {
                  return true;
                }
                if (item.stt && Number(item.stt) === row.stt) {
                  return true;
                }
                return false;
              });

              if (!match) return row;
              matchCount++;

              const newScores = { ...row.scores };
              if (match.scores && typeof match.scores === 'object') {
                Object.entries(match.scores).forEach(([k, v]) => {
                  const num = typeof v === 'number' ? v : parseFloat(String(v));
                  if (!isNaN(num) && num >= 0 && num <= 10 && k in newScores) {
                    newScores[k as SubjectKey] = Number(num.toFixed(1));
                  }
                });
              }

              return {
                ...row,
                scores: newScores,
                conduct: match.conduct || row.conduct,
              };
            })
          );

          setOcrAnalysis(
            data.data.overallAnalysis ||
              `AI đã nhận diện và điền điểm cho ${matchCount} học sinh từ bảng điểm giấy.`
          );
          setActiveTab('grid');
          setSuccessToast(`AI Gemini đã quét và cập nhật ${matchCount} học sinh từ hình ảnh!`);
          setTimeout(() => setSuccessToast(null), 4000);
        } else {
          setErrorMessage('Không thể trích xuất điểm từ ảnh. Vui lòng kiểm tra độ nét của ảnh.');
        }
      } catch (err: any) {
        setErrorMessage(`Lỗi phân tích ảnh AI: ${err?.message || 'Mất kết nối máy chủ'}`);
      } finally {
        setIsOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Paste from Clipboard (Tab-separated values from Excel/Google Sheets)
  const handleApplyPaste = () => {
    if (!pasteRawText.trim()) return;

    const lines = pasteRawText.trim().split('\n');
    let pasteCount = 0;

    setGridData((prev) => {
      const updated = [...prev];

      lines.forEach((line, lineIndex) => {
        const tokens = line.split('\t').map((t) => t.trim());
        if (tokens.length < 2) return;

        // Try to match student by first or second token (STT, Code, or Name)
        let targetIndex = -1;
        const token0 = tokens[0].toLowerCase();
        const token1 = tokens[1] ? tokens[1].toLowerCase() : '';

        // Check if token0 is STT or Code
        targetIndex = updated.findIndex(
          (u) =>
            u.code.toLowerCase() === token0 ||
            u.code.toLowerCase() === token1 ||
            u.name.toLowerCase() === token0 ||
            u.name.toLowerCase() === token1 ||
            u.stt.toString() === token0
        );

        if (targetIndex === -1 && lineIndex < updated.length) {
          // If no code/name found, assume sequential row index
          targetIndex = lineIndex;
        }

        if (targetIndex !== -1 && targetIndex < updated.length) {
          const row = updated[targetIndex];
          const newScores = { ...row.scores };

          // Extract numeric tokens
          const numericTokens = tokens.filter((tok) => {
            const num = parseFloat(tok.replace(',', '.'));
            return !isNaN(num) && num >= 0 && num <= 10;
          });

          // Fill numbers into subjects in order
          numericTokens.forEach((tok, subIdx) => {
            if (subIdx < ALL_SUBJECTS.length) {
              const subKey = ALL_SUBJECTS[subIdx].key;
              newScores[subKey] = Number(parseFloat(tok.replace(',', '.')).toFixed(1));
            }
          });

          updated[targetIndex] = { ...row, scores: newScores };
          pasteCount++;
        }
      });

      return updated;
    });

    setShowPasteModal(false);
    setPasteRawText('');
    setSuccessToast(`Đã dán thành công dữ liệu điểm cho ${pasteCount} học sinh!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Batch Save all 10 subjects to AppContext
  const handleSaveToSystem = () => {
    const recordsToImport = gridData.map((row) => {
      const subjectScoresPartial: any = {};
      ALL_SUBJECTS.forEach((sub) => {
        const sc = row.scores[sub.key];
        if (typeof sc === 'number' && !isNaN(sc)) {
          subjectScoresPartial[sub.key] = {
            avg: sc,
            midterm: sc,
            final: sc,
            regular: [sc, sc],
          };
        }
      });

      return {
        studentId: row.studentId,
        scores: subjectScoresPartial,
        conduct: row.conduct,
      };
    });

    const res = importExcelScores(recordsToImport);
    setSuccessToast(res.message);

    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1200);
  };

  // Class Summary Calculations
  const classStats = useMemo(() => {
    let totalGpa = 0;
    let count = 0;
    let excellent = 0;
    let good = 0;
    let fair = 0;
    let pass = 0;

    gridData.forEach((row) => {
      const { gpa, classification } = calculateRowStats(row);
      if (gpa > 0) {
        totalGpa += gpa;
        count++;
      }
      if (classification === 'Xuất sắc') excellent++;
      else if (classification === 'Giỏi') good++;
      else if (classification === 'Khá') fair++;
      else pass++;
    });

    const avg = count > 0 ? (totalGpa / count).toFixed(2) : '0.00';
    return { avg, count, excellent, good, fair, pass };
  }, [gridData]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-7xl w-full shadow-2xl border border-slate-100 my-4 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <FileSpreadsheet className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black">
                  Nhập Bảng Điểm Tổng Hợp Tất Cả Các Môn (12A7)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-xs font-black">
                  Đầy đủ 10 Môn • Tự động tính GPA
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Nhập hoặc dán từ Excel, tải file .xlsx, hoặc quét ảnh chụp AI • GVCN: Thầy Trương Xuân Hòa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs & Quick Tools Bar */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Main 3 Input Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-4 h-4" /> Bảng tính ma trận 10 môn
            </button>
            <button
              onClick={() => {
                setActiveTab('excel');
                fileInputRef.current?.click();
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'excel'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Tải file Excel (.xlsx)
            </button>
            <button
              onClick={() => {
                setActiveTab('ocr');
                imageInputRef.current?.click();
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'ocr'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4 text-purple-600" /> Quét ảnh bảng điểm AI
            </button>
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => setShowPasteModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 flex items-center gap-1.5 transition-colors"
              title="Dán dữ liệu copy từ Excel"
            >
              <Clipboard className="w-3.5 h-3.5" /> Dán từ Excel (Ctrl+V)
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1.5 transition-colors"
              title="Tải mẫu Excel 10 môn chuẩn của lớp"
            >
              <Download className="w-3.5 h-3.5" /> Mẫu Excel 12A7 (.xlsx)
            </button>

            <button
              onClick={handleFillRandomSampleScores}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 flex items-center gap-1.5 transition-colors"
              title="Tự động điền điểm mẫu thử nghiệm nhanh"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Điền điểm mẫu ngẫu nhiên
            </button>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Alerts & OCR Progress */}
        {successToast && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successToast}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isOcrLoading && (
          <div className="mx-5 mt-3 p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-3 shrink-0 animate-pulse">
            <Bot className="w-5 h-5 text-purple-600 shrink-0 animate-spin" />
            <div>
              <div className="font-bold">Đang quét ảnh bảng điểm tổng hợp bằng AI Gemini 3.8 Flash...</div>
              <div className="text-[11px] text-purple-700">Tự động nhận diện điểm 10 môn của từng học sinh</div>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="px-5 py-2.5 flex items-center justify-between gap-3 border-b border-slate-100 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên học sinh, mã số (VD: Ái Ly, 12A7-27)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterGroup}
              onChange={(e) =>
                setFilterGroup(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 text-xs"
            >
              <option value="all">Tất cả tổ</option>
              <option value={1}>Tổ 1</option>
              <option value={2}>Tổ 2</option>
              <option value={3}>Tổ 3</option>
              <option value={4}>Tổ 4</option>
            </select>
          </div>

          <div className="text-slate-500 font-medium text-xs flex items-center gap-2">
            <span>
              Hiển thị: <strong>{displayedRows.length}/{gridData.length}</strong> học sinh
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline text-blue-700 font-bold">
              ĐTB Lớp dự kiến: {classStats.avg}đ
            </span>
          </div>
        </div>

        {/* Scrollable Matrix Table */}
        <div className="flex-1 overflow-auto p-4">
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
            <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold text-[11px] border-b border-slate-200 sticky top-0 z-20">
                  <th className="py-2.5 px-2.5 text-center w-10 bg-slate-100">STT</th>
                  <th className="py-2.5 px-2 w-18 bg-slate-100">Mã HS</th>
                  <th className="py-2.5 px-3 min-w-[150px] bg-slate-100">Họ và tên</th>
                  <th className="py-2.5 px-1.5 text-center w-10 bg-slate-100">Tổ</th>
                  {ALL_SUBJECTS.map((sub) => (
                    <th
                      key={sub.key}
                      className="py-2 px-1 text-center min-w-[65px] bg-slate-100 font-extrabold"
                      title={`${sub.name} - ${sub.teacher}`}
                    >
                      <div className="truncate text-slate-800">{sub.name}</div>
                      <div className="text-[9px] font-normal text-slate-400 truncate">
                        {sub.teacher}
                      </div>
                    </th>
                  ))}
                  <th className="py-2.5 px-2 text-center w-20 bg-blue-50 text-blue-900 font-black">
                    ĐTB Chung
                  </th>
                  <th className="py-2.5 px-2 text-center w-20 bg-indigo-50 text-indigo-900 font-black">
                    Học lực
                  </th>
                  <th className="py-2.5 px-2 text-center w-24 bg-slate-100 font-bold">
                    Hạnh kiểm
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedRows.map((row) => {
                  const { gpa, classification } = calculateRowStats(row);

                  return (
                    <tr key={row.studentId} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-2 px-2 text-center font-bold text-slate-400">{row.stt}</td>
                      <td className="py-2 px-2 font-mono text-blue-700 font-semibold">{row.code}</td>
                      <td className="py-2 px-3 font-bold text-slate-900 truncate">
                        {row.name}
                      </td>
                      <td className="py-2 px-1.5 text-center text-slate-500 font-semibold">
                        T{row.group}
                      </td>

                      {/* 10 Subject Input Cells */}
                      {ALL_SUBJECTS.map((sub) => {
                        const val = row.scores[sub.key];
                        const isHigh = typeof val === 'number' && val >= 8.0;
                        const isLow = typeof val === 'number' && val < 5.0;

                        return (
                          <td key={sub.key} className="py-1 px-1 text-center">
                            <input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              value={val}
                              onChange={(e) =>
                                handleScoreChange(row.studentId, sub.key, e.target.value)
                              }
                              placeholder="-"
                              className={`w-14 text-center py-1 rounded-lg border font-mono font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all ${
                                isHigh
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : isLow
                                  ? 'bg-red-50 text-red-700 border-red-300'
                                  : val !== ''
                                  ? 'bg-white text-slate-800 border-slate-200'
                                  : 'bg-slate-50 text-slate-400 border-dashed border-slate-300'
                              }`}
                            />
                          </td>
                        );
                      })}

                      {/* Real-time Calculated GPA */}
                      <td className="py-2 px-2 text-center font-black font-mono text-blue-700 bg-blue-50/50 text-sm">
                        {gpa > 0 ? gpa.toFixed(2) : '-'}
                      </td>

                      {/* Real-time Calculated Classification */}
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            classification === 'Xuất sắc'
                              ? 'bg-purple-100 text-purple-800'
                              : classification === 'Giỏi'
                              ? 'bg-emerald-100 text-emerald-800'
                              : classification === 'Khá'
                              ? 'bg-blue-100 text-blue-800'
                              : classification === 'Đạt'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {classification}
                        </span>
                      </td>

                      {/* Conduct Selector */}
                      <td className="py-1 px-1.5 text-center">
                        <select
                          value={row.conduct}
                          onChange={(e) =>
                            handleConductChange(row.studentId, e.target.value as any)
                          }
                          className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 bg-white"
                        >
                          <option value="Tốt">Tốt</option>
                          <option value="Khá">Khá</option>
                          <option value="Đạt">Đạt</option>
                          <option value="Chưa đạt">Chưa đạt</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer with Summary Statistics and Batch Save */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
            <span className="font-bold text-slate-800">
              Tổng kết nhanh: ĐTB Lớp {classStats.avg}đ
            </span>
            <span>•</span>
            <span className="text-purple-700 font-bold">{classStats.excellent} Xuất sắc</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">{classStats.good} Giỏi</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">{classStats.fair} Khá</span>
            <span>•</span>
            <span className="text-amber-700 font-bold">{classStats.pass} Đạt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveToSystem}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" /> Lưu bảng điểm tổng hợp (Cả 10 môn)
            </button>
          </div>
        </div>
      </div>

      {/* Direct Paste from Excel Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-indigo-600" />
                Dán dữ liệu từ Excel / Google Sheets
              </h3>
              <button
                onClick={() => setShowPasteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 text-xs text-slate-600 space-y-2">
              <p>
                <strong>Hướng dẫn:</strong> Trong file Excel hoặc Google Sheets, hãy bôi đen các ô điểm theo thứ tự các môn (Toán, Văn, Anh, Lý, Hóa, Sử, GDKT-PL, Tin, GDĐP, GDQP), bấm <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 border text-slate-800 font-mono font-bold">Ctrl+C</kbd>, sau đó dán vào ô bên dưới:
              </p>
              <textarea
                rows={8}
                value={pasteRawText}
                onChange={(e) => setPasteRawText(e.target.value)}
                placeholder="Dán dữ liệu vào đây (Ctrl+V)...&#10;Ví dụ: 8.5	8.0	8.5	7.5	8.0	7.0	8.5	9.0	8.5	9.0"
                className="w-full p-3 rounded-2xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                autoFocus
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyPaste}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
              >
                Áp dụng vào bảng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
