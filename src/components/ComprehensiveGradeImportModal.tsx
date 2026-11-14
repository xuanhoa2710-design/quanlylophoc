import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Table,
  Save,
  Search,
  Clipboard,
  Trash2,
  FileCheck2,
  Layers,
} from 'lucide-react';

interface ComprehensiveGradeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTab?: 'excel' | 'grid';
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

interface ExcelDetectedSummary {
  fileName: string;
  sheetName: string;
  headerRowNumber: number;
  detectedSubjects: SubjectKey[];
  matchedStudents: number;
  totalSheetRows: number;
  updatedCells: number;
  unmatchedNames: string[];
}

const normalizeVN = (str: string) =>
  String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const parseNumericScore = (raw: any): number | null => {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'number' && !isNaN(raw)) {
    if (raw < 0 || raw > 10) return null;
    return Number(raw.toFixed(1));
  }
  const str = String(raw).trim().replace(',', '.');
  if (!str || str === '-' || str === '—') return null;
  if (!/^\d+(?:\.\d+)?$/.test(str)) return null;
  const num = parseFloat(str);
  if (isNaN(num) || num < 0 || num > 10) return null;
  return Number(num.toFixed(1));
};

const parseConductCell = (raw: any): RowData['conduct'] | null => {
  if (!raw) return null;
  const s = normalizeVN(String(raw));
  if (!s) return null;
  if (s === 'tot' || s.includes('tot')) return 'Tốt';
  if (s === 'kha' || s.includes('kha')) return 'Khá';
  if (s.includes('chua')) return 'Chưa đạt';
  if (s === 'dat' || s.includes('trung binh') || s === 'tb') return 'Đạt';
  return null;
};

const resolveSubjectHeaderKey = (headerCell: string): SubjectKey | null => {
  const ascii = normalizeVN(headerCell);
  if (!ascii) return null;
  const compact = ascii.replace(/[^a-z0-9]/g, '');

  const exactMap: Record<string, SubjectKey> = {
    toan: 'toan',
    toanhoc: 'toan',
    montoan: 'toan',
    math: 'toan',
    van: 'van',
    nguvan: 'van',
    monvan: 'van',
    vanhoc: 'van',
    literature: 'van',
    anh: 'anh',
    tienganh: 'anh',
    ngoaingu: 'anh',
    anhvan: 'anh',
    nn: 'anh',
    english: 'anh',
    ly: 'ly',
    li: 'ly',
    vatly: 'ly',
    vatli: 'ly',
    physics: 'ly',
    hoa: 'hoa',
    hoahoc: 'hoa',
    chemistry: 'hoa',
    su: 'su',
    lichsu: 'su',
    history: 'su',
    gdktpl: 'gdktpl',
    ktpl: 'gdktpl',
    gdktvapl: 'gdktpl',
    kinhtephapluat: 'gdktpl',
    gdcd: 'gdktpl',
    tin: 'tin',
    tinhoc: 'tin',
    informatics: 'tin',
    gddp: 'gddp',
    gddiaphuong: 'gddp',
    giaoducdiaphuong: 'gddp',
    diaphuong: 'gddp',
    dp: 'gddp',
    gdqp: 'gdqp',
    gdqpan: 'gdqp',
    qpan: 'gdqp',
    quocphong: 'gdqp',
    quocphonganninh: 'gdqp',
    giaoducquocphong: 'gdqp',
  };

  if (exactMap[compact]) return exactMap[compact];
  if (compact.includes('tienganh') || compact.includes('anhvan') || compact.includes('ngoaingu') || compact.includes('english'))
    return 'anh';
  if (compact.includes('nguvan') || compact.includes('vanhoc')) return 'van';
  if (compact.includes('toanhoc') || compact === 'toan' || compact.includes('montoan')) return 'toan';
  if (compact.includes('vatly') || compact.includes('vatli')) return 'ly';
  if (compact.includes('hoahoc') || compact === 'hoa') return 'hoa';
  if (compact.includes('lichsu') || compact === 'su') return 'su';
  if (compact.includes('ktpl') || compact.includes('kinhte') || compact.includes('phapluat'))
    return 'gdktpl';
  if (compact.includes('tinhoc')) return 'tin';
  if (compact.includes('diaphuong')) return 'gddp';
  if (compact.includes('quocphong') || compact.includes('gdqp')) return 'gdqp';
  return null;
};

export const ComprehensiveGradeImportModal: React.FC<ComprehensiveGradeImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'excel',
}) => {
  const { students, importExcelScores } = useApp();

  const [activeTab, setActiveTab] = useState<'grid' | 'excel'>(
    initialTab === 'grid' ? 'grid' : 'excel'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<number | 'all'>('all');
  const [gridData, setGridData] = useState<RowData[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Excel state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workbookRef = useRef<XLSX.WorkBook | null>(null);
  const [excelFileName, setExcelFileName] = useState<string | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheetName, setSelectedSheetName] = useState<string>('');
  const [excelTargetSubject, setExcelTargetSubject] = useState<'all' | SubjectKey>('all');
  const [clearBeforeExcelApply, setClearBeforeExcelApply] = useState(false);
  const [isDraggingExcel, setIsDraggingExcel] = useState(false);
  const [excelSummary, setExcelSummary] = useState<ExcelDetectedSummary | null>(null);
  const [importedCells, setImportedCells] = useState<Record<string, SubjectKey[]>>({});

  // Paste dialog state
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteRawText, setPasteRawText] = useState('');

  // Initialize gridData from current students
  useEffect(() => {
    if (isOpen && Array.isArray(students) && students.length > 0) {
      setActiveTab(initialTab === 'grid' ? 'grid' : 'excel');

      const initialRows: RowData[] = students.map((s) => {
        const scoresMap: Record<SubjectKey, number | ''> = {
          toan: s?.scores?.toan?.avg ?? '',
          van: s?.scores?.van?.avg ?? '',
          anh: s?.scores?.anh?.avg ?? '',
          ly: s?.scores?.ly?.avg ?? '',
          hoa: s?.scores?.hoa?.avg ?? '',
          su: s?.scores?.su?.avg ?? '',
          gdktpl: s?.scores?.gdktpl?.avg ?? '',
          tin: s?.scores?.tin?.avg ?? '',
          gddp: s?.scores?.gddp?.avg ?? '',
          gdqp: s?.scores?.gdqp?.avg ?? '',
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
      setSheetNames([]);
      setSelectedSheetName('');
      setExcelSummary(null);
      setImportedCells({});
      setIsDraggingExcel(false);
      workbookRef.current = null;
    }
  }, [isOpen, students, initialTab]);

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

  // Class Summary Calculations (Hook MUST stay before conditional return null!)
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

  if (!isOpen) return null;

  // Handle cell score change
  const handleScoreChange = (studentId: string, subjectKey: SubjectKey, valStr: string) => {
    setImportedCells((prev) => {
      if (!prev[studentId]?.includes(subjectKey)) return prev;
      return {
        ...prev,
        [studentId]: prev[studentId].filter((k) => k !== subjectKey),
      };
    });
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

  // Filtered rows for display
  const displayedRows = gridData.filter((row) => {
    const matchSearch =
      normalizeVN(row.name).includes(normalizeVN(searchTerm)) ||
      row.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = filterGroup === 'all' || row.group === filterGroup;
    return matchSearch && matchGroup;
  });

  // Match an Excel row to a student in 12A7
  const findMatchedRow = (
    candidateCode: string,
    candidateName: string,
    candidateStt: number | null,
    rows: RowData[]
  ): RowData | null => {
    const cleanCode = candidateCode.trim().toUpperCase().replace(/\s+/g, '');
    if (cleanCode) {
      const byCode = rows.find((r) => r.code.toUpperCase() === cleanCode);
      if (byCode) return byCode;
    }

    const normName = normalizeVN(candidateName);
    if (normName) {
      const exactName = rows.find((r) => normalizeVN(r.name) === normName);
      if (exactName) return exactName;

      const tokens = normName.split(' ').filter(Boolean);
      const lastToken = tokens[tokens.length - 1] || '';
      const lastTwo = tokens.slice(-2).join(' ');

      let best: RowData | null = null;
      let bestScore = 0;
      for (const r of rows) {
        const rNorm = normalizeVN(r.name);
        const rTokens = rNorm.split(' ').filter(Boolean);
        const rLast = rTokens[rTokens.length - 1] || '';
        const rLastTwo = rTokens.slice(-2).join(' ');

        let score = 0;
        if (normName.length >= 6 && (rNorm.includes(normName) || normName.includes(rNorm))) {
          score += 5;
        }
        if (lastTwo.length >= 4 && lastTwo === rLastTwo && tokens[0] === rTokens[0]) {
          score += 4;
        }
        const shared = tokens.filter((t) => t.length >= 2 && rTokens.includes(t)).length;
        if (shared >= 2 && lastToken === rLast) {
          score += shared;
        } else if (candidateStt && candidateStt === r.stt && lastToken && lastToken === rLast) {
          score += 3;
        }
        if (score > bestScore) {
          bestScore = score;
          best = r;
        }
      }
      if (best && bestScore >= 3) return best;
    }

    if (!normName && candidateStt) {
      const byStt = rows.find((r) => r.stt === candidateStt);
      if (byStt) return byStt;
    }

    return null;
  };

  // Detect columns on a single or 2-row merged header inside an Excel sheet
  const analyzeSheetHeaders = (rawRows: any[][]) => {
    let bestRowIdx = -1;
    let bestScore = 0;

    const scanLimit = Math.min(rawRows.length, 15);
    for (let r = 0; r < scanLimit; r++) {
      const row = Array.isArray(rawRows[r]) ? rawRows[r] : [];
      let score = 0;
      const seenSubjects = new Set<SubjectKey>();

      row.forEach((cell) => {
        const txt = normalizeVN(String(cell || ''));
        if (!txt) return;
        if (txt.includes('ho va ten') || txt.includes('ho ten') || txt === 'ten' || txt === 'ho') {
          score += 3;
        }
        if (txt.includes('ma hs') || txt.includes('ma hoc sinh') || txt === 'ma so' || txt === 'code') {
          score += 2;
        }
        if (txt === 'stt') score += 1;
        const sub = resolveSubjectHeaderKey(txt);
        if (sub && !seenSubjects.has(sub)) {
          seenSubjects.add(sub);
          score += 2;
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestRowIdx = r;
      }
    }

    if (bestRowIdx === -1 || bestScore < 2) {
      return null;
    }

    const headerRow = Array.isArray(rawRows[bestRowIdx]) ? rawRows[bestRowIdx] : [];
    const nextRow = Array.isArray(rawRows[bestRowIdx + 1]) ? rawRows[bestRowIdx + 1] : [];

    // Check if nextRow also contains sub-headers (common in merged VNedu Excel templates)
    let nextRowSubjectCount = 0;
    nextRow.forEach((cell) => {
      if (resolveSubjectHeaderKey(String(cell || ''))) nextRowSubjectCount++;
    });
    const useTwoRowHeader = nextRowSubjectCount >= 2;
    const dataStartRow = bestRowIdx + (useTwoRowHeader ? 2 : 1);

    const maxCols = Math.max(headerRow.length, useTwoRowHeader ? nextRow.length : 0);
    let sttCol = -1;
    let codeCol = -1;
    let nameCol = -1;
    let surnameCol = -1;
    let givenNameCol = -1;
    let conductCol = -1;
    let genericScoreCol = -1;
    const subjectCols: Partial<Record<SubjectKey, number>> = {};

    for (let c = 0; c < maxCols; c++) {
      const h1 = normalizeVN(String(headerRow[c] ?? ''));
      const h2 = useTwoRowHeader ? normalizeVN(String(nextRow[c] ?? '')) : '';
      const combined = `${h1} ${h2}`.trim();
      const targetText = h2 || h1;

      if (!combined) continue;

      if (sttCol === -1 && (targetText === 'stt' || targetText === 'tt' || targetText === 'so tt')) {
        sttCol = c;
        continue;
      }
      if (
        codeCol === -1 &&
        (combined.includes('ma hs') ||
          combined.includes('ma hoc sinh') ||
          combined.includes('ma so') ||
          combined === 'mahs' ||
          combined === 'code')
      ) {
        codeCol = c;
        continue;
      }
      if (
        nameCol === -1 &&
        (combined.includes('ho va ten') ||
          combined.includes('ho ten') ||
          combined.includes('ten hoc sinh') ||
          combined.includes('ten hs') ||
          combined === 'hoten' ||
          combined === 'student name')
      ) {
        nameCol = c;
        continue;
      }
      if (surnameCol === -1 && (targetText === 'ho' || targetText === 'ho dem' || targetText === 'ho va ten dem')) {
        surnameCol = c;
        continue;
      }
      if (givenNameCol === -1 && (targetText === 'ten' || targetText === 'name')) {
        givenNameCol = c;
        continue;
      }
      if (
        conductCol === -1 &&
        (combined.includes('hanh kiem') ||
          combined.includes('ren luyen') ||
          combined === 'hk' ||
          combined === 'rl' ||
          combined === 'conduct')
      ) {
        conductCol = c;
        continue;
      }

      const subKey = resolveSubjectHeaderKey(h2) || resolveSubjectHeaderKey(h1);
      if (subKey && subjectCols[subKey] === undefined) {
        subjectCols[subKey] = c;
        continue;
      }

      if (
        genericScoreCol === -1 &&
        (targetText === 'diem' ||
          targetText === 'dtb' ||
          targetText === 'diem tb' ||
          targetText === 'tb mon' ||
          targetText === 'diem kiem tra' ||
          targetText === 'score' ||
          targetText === 'avg')
      ) {
        genericScoreCol = c;
      }
    }

    return {
      headerRowIdx: bestRowIdx,
      dataStartRow,
      sttCol,
      codeCol,
      nameCol,
      surnameCol,
      givenNameCol,
      conductCol,
      genericScoreCol,
      subjectCols,
    };
  };

  // Parse a chosen worksheet from workbookRef and apply to gridData
  const applyExcelSheet = (
    wb: XLSX.WorkBook,
    sheetName: string,
    fileName: string,
    targetSubjectOverride?: 'all' | SubjectKey,
    clearFirstOverride?: boolean
  ) => {
    const activeTargetSubject = targetSubjectOverride ?? excelTargetSubject;
    const activeClearFirst = clearFirstOverride ?? clearBeforeExcelApply;

    const ws = wb.Sheets[sheetName];
    if (!ws) {
      setErrorMessage(`Không tìm thấy sheet "${sheetName}" trong file Excel.`);
      return;
    }

    const rawJson: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (!Array.isArray(rawJson) || rawJson.length < 2) {
      setErrorMessage(`Sheet "${sheetName}" trống hoặc không đủ dòng dữ liệu.`);
      return;
    }

    const layout = analyzeSheetHeaders(rawJson);
    if (!layout) {
      setErrorMessage(
        `Không nhận diện được dòng tiêu đề bảng điểm trong sheet "${sheetName}". Hãy đảm bảo có cột "Họ và tên" (hoặc "Mã HS") và các cột điểm môn học (Toán, Ngữ văn, Tiếng Anh...).`
      );
      return;
    }

    const effectiveSubjectCols: Partial<Record<SubjectKey, number>> = { ...layout.subjectCols };
    if (
      activeTargetSubject !== 'all' &&
      effectiveSubjectCols[activeTargetSubject] === undefined &&
      layout.genericScoreCol !== -1
    ) {
      effectiveSubjectCols[activeTargetSubject] = layout.genericScoreCol;
    }

    const detectedSubjects = (Object.keys(effectiveSubjectCols) as SubjectKey[]).filter((k) =>
      activeTargetSubject === 'all' ? true : k === activeTargetSubject
    );

    if (detectedSubjects.length === 0 && layout.conductCol === -1) {
      setErrorMessage(
        activeTargetSubject === 'all'
          ? `Tìm thấy danh sách học sinh ở dòng ${layout.headerRowIdx + 1} nhưng chưa thấy cột điểm môn học nào (Toán, Ngữ văn, Tiếng Anh, Vật lý, Hóa học...).`
          : `Không tìm thấy cột điểm cho môn đã chọn trong sheet "${sheetName}". Hãy thử chọn "Tất cả 10 môn" hoặc kiểm tra tên cột.`
      );
      return;
    }

    const dataRows = rawJson.slice(layout.dataStartRow).filter((r) =>
      Array.isArray(r) && r.some((cell) => String(cell ?? '').trim() !== '')
    );

    const updatesByStudentId = new Map<
      string,
      { scores: Partial<Record<SubjectKey, number>>; conduct?: RowData['conduct'] }
    >();
    const unmatchedNames: string[] = [];
    let nonEmptyStudentRows = 0;

    dataRows.forEach((r) => {
      const codeVal = layout.codeCol !== -1 ? String(r[layout.codeCol] ?? '').trim() : '';
      let nameVal = layout.nameCol !== -1 ? String(r[layout.nameCol] ?? '').trim() : '';
      if (!nameVal && (layout.surnameCol !== -1 || layout.givenNameCol !== -1)) {
        const sPart = layout.surnameCol !== -1 ? String(r[layout.surnameCol] ?? '').trim() : '';
        const gPart = layout.givenNameCol !== -1 ? String(r[layout.givenNameCol] ?? '').trim() : '';
        nameVal = `${sPart} ${gPart}`.trim();
      }
      const sttRaw = layout.sttCol !== -1 ? parseInt(String(r[layout.sttCol] ?? ''), 10) : NaN;
      const sttVal = !isNaN(sttRaw) && sttRaw > 0 ? sttRaw : null;

      if (!codeVal && !nameVal && !sttVal) return;

      // Skip summary / footer rows in Excel like "Trung bình cả lớp", "Tổng cộng"
      const normNameCheck = normalizeVN(nameVal);
      if (
        normNameCheck.startsWith('tong cong') ||
        normNameCheck.startsWith('trung binh') ||
        normNameCheck.startsWith('gvcn') ||
        normNameCheck.startsWith('ngay ')
      ) {
        return;
      }

      nonEmptyStudentRows++;
      const matched = findMatchedRow(codeVal, nameVal, sttVal, gridData);
      if (!matched) {
        if (nameVal) unmatchedNames.push(nameVal);
        return;
      }

      const rowScores: Partial<Record<SubjectKey, number>> = {};
      detectedSubjects.forEach((subKey) => {
        const colIndex = effectiveSubjectCols[subKey];
        if (colIndex !== undefined && colIndex !== -1) {
          const parsedScore = parseNumericScore(r[colIndex]);
          if (parsedScore !== null) {
            rowScores[subKey] = parsedScore;
          }
        }
      });

      const parsedConduct =
        layout.conductCol !== -1 ? parseConductCell(r[layout.conductCol]) : null;

      if (Object.keys(rowScores).length > 0 || parsedConduct) {
        updatesByStudentId.set(matched.studentId, {
          scores: rowScores,
          conduct: parsedConduct || undefined,
        });
      }
    });

    if (updatesByStudentId.size === 0) {
      setErrorMessage(
        `Đã đọc sheet "${sheetName}" nhưng không khớp được dữ liệu điểm nào với danh sách 50 học sinh 12A7. Vui lòng kiểm tra lại tên học sinh/mã HS và giá trị điểm (0 - 10).`
      );
      return;
    }

    let updatedCellsCount = 0;
    const nextHighlighted: Record<string, SubjectKey[]> = {};

    setGridData((prev) =>
      prev.map((row) => {
        const baseScores: Record<SubjectKey, number | ''> = activeClearFirst
          ? {
              toan: '',
              van: '',
              anh: '',
              ly: '',
              hoa: '',
              su: '',
              gdktpl: '',
              tin: '',
              gddp: '',
              gdqp: '',
            }
          : { ...row.scores };

        const upd = updatesByStudentId.get(row.studentId);
        if (!upd) {
          return activeClearFirst ? { ...row, scores: baseScores } : row;
        }

        const keysForRow: SubjectKey[] = [];
        (Object.entries(upd.scores) as Array<[SubjectKey, number]>).forEach(([k, v]) => {
          baseScores[k] = v;
          keysForRow.push(k);
          updatedCellsCount++;
        });
        if (keysForRow.length > 0) {
          nextHighlighted[row.studentId] = keysForRow;
        }

        return {
          ...row,
          scores: baseScores,
          conduct: upd.conduct || row.conduct,
        };
      })
    );

    setErrorMessage(null);
    setImportedCells(nextHighlighted);
    setExcelSummary({
      fileName,
      sheetName,
      headerRowNumber: layout.headerRowIdx + 1,
      detectedSubjects,
      matchedStudents: updatesByStudentId.size,
      totalSheetRows: nonEmptyStudentRows,
      updatedCells: updatedCellsCount,
      unmatchedNames: unmatchedNames.slice(0, 12),
    });
    setSuccessToast(
      `Đã nạp từ "${sheetName}": ${updatesByStudentId.size} học sinh (${updatedCellsCount} ô điểm). Kiểm tra các ô viền xanh bên dưới rồi nhấn "Lưu bảng điểm tổng hợp"!`
    );
    setTimeout(() => setSuccessToast(null), 5500);
  };

  // Process uploaded or dropped Excel file via ArrayBuffer (preserves Vietnamese UTF-8 properly)
  const processExcelFile = (file: File) => {
    const extOk = /\.(xlsx|xls|csv)$/i.test(file.name || '');
    if (!extOk) {
      setErrorMessage('Vui lòng chọn đúng định dạng file Excel (.xlsx, .xls) hoặc .csv.');
      return;
    }

    setExcelFileName(file.name);
    setErrorMessage(null);
    setSuccessToast(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMessage('Không thể đọc file Excel từ thiết bị. Vui lòng thử lại.');
    };
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        if (!(buffer instanceof ArrayBuffer)) {
          setErrorMessage('Dữ liệu file Excel không hợp lệ.');
          return;
        }

        const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          setErrorMessage('File Excel không chứa sheet dữ liệu nào.');
          return;
        }

        workbookRef.current = wb;
        setSheetNames(wb.SheetNames);

        // Pick first sheet that looks like a gradebook, or sheet 0
        let chosenSheet = wb.SheetNames[0];
        for (const sName of wb.SheetNames) {
          const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[sName], { header: 1, defval: '' });
          if (analyzeSheetHeaders(rows)) {
            chosenSheet = sName;
            break;
          }
        }

        setSelectedSheetName(chosenSheet);
        applyExcelSheet(wb, chosenSheet, file.name);
      } catch (err: any) {
        setErrorMessage(`Lỗi đọc file Excel: ${err?.message || 'Định dạng không hợp lệ'}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processExcelFile(file);
    e.target.value = '';
  };

  const handleExcelDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingExcel(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  // Export official template or current matrix to .xlsx
  const handleExportExcel = (useSampleDefaultsIfEmpty: boolean) => {
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

    const data = gridData.map((row) => {
      const getVal = (key: SubjectKey, fallback: number) => {
        const v = row.scores[key];
        if (typeof v === 'number' && !isNaN(v)) return v;
        return useSampleDefaultsIfEmpty ? fallback : '';
      };

      return [
        row.stt,
        row.code,
        row.name,
        row.group,
        getVal('toan', 8.0),
        getVal('van', 7.5),
        getVal('anh', 8.0),
        getVal('ly', 7.5),
        getVal('hoa', 8.5),
        getVal('su', 7.5),
        getVal('gdktpl', 8.0),
        getVal('tin', 9.0),
        getVal('gddp', 8.5),
        getVal('gdqp', 9.0),
        row.conduct || 'Tốt',
      ];
    });

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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bang_Diem_12A7');
    XLSX.writeFile(
      workbook,
      useSampleDefaultsIfEmpty
        ? 'Mau_Bang_Diem_Tong_Hop_12A7_THPT_Vinh_Loc_B.xlsx'
        : 'Bang_Diem_Hien_Tai_12A7.xlsx'
    );
  };

  // Fill random realistic scores (6.5 - 9.6) for instant testing
  const handleFillRandomSampleScores = () => {
    setImportedCells({});
    setGridData((prev) =>
      prev.map((row) => {
        const newScores: Record<SubjectKey, number | ''> = { ...row.scores };
        ALL_SUBJECTS.forEach((sub) => {
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

  // Clear all scores in the current matrix
  const handleClearMatrixScores = () => {
    setImportedCells({});
    setExcelSummary(null);
    setGridData((prev) =>
      prev.map((row) => ({
        ...row,
        scores: {
          toan: '',
          van: '',
          anh: '',
          ly: '',
          hoa: '',
          su: '',
          gdktpl: '',
          tin: '',
          gddp: '',
          gdqp: '',
        },
      }))
    );
    setSuccessToast('Đã xóa trắng các ô điểm trên bảng tính nháp. Nhấn "Lưu bảng điểm" nếu muốn áp dụng.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Handle Paste from Clipboard (Tab-separated values from Excel/Google Sheets, supports optional header row)
  const handleApplyPaste = () => {
    if (!pasteRawText.trim()) return;

    const lines = pasteRawText
      .trim()
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0);
    if (lines.length === 0) return;

    const splitLine = (line: string) =>
      line.includes('\t') ? line.split('\t').map((t) => t.trim()) : line.split(';').map((t) => t.trim());

    const firstTokens = splitLine(lines[0]);
    const headerSubjects: Array<{ colIdx: number; key: SubjectKey }> = [];
    let pasteNameCol = -1;
    let pasteCodeCol = -1;
    let pasteSttCol = -1;

    firstTokens.forEach((tok, idx) => {
      const subKey = resolveSubjectHeaderKey(tok);
      if (subKey) {
        headerSubjects.push({ colIdx: idx, key: subKey });
      } else {
        const norm = normalizeVN(tok);
        if (norm.includes('ho ten') || norm.includes('ho va ten') || norm === 'ten') {
          pasteNameCol = idx;
        } else if (norm.includes('ma hs') || norm === 'code') {
          pasteCodeCol = idx;
        } else if (norm === 'stt') {
          pasteSttCol = idx;
        }
      }
    });

    const hasHeader = headerSubjects.length >= 1 || pasteNameCol !== -1 || pasteCodeCol !== -1;
    const dataLines = hasHeader ? lines.slice(1) : lines;

    let pasteCount = 0;
    const nextHighlighted: Record<string, SubjectKey[]> = { ...importedCells };

    setGridData((prev) => {
      const updated = [...prev];

      dataLines.forEach((line, lineIndex) => {
        const tokens = splitLine(line);
        if (tokens.length === 0) return;

        let targetIndex = -1;
        if (hasHeader) {
          const codeTok = pasteCodeCol !== -1 ? tokens[pasteCodeCol] || '' : '';
          const nameTok = pasteNameCol !== -1 ? tokens[pasteNameCol] || '' : '';
          const sttTok = pasteSttCol !== -1 ? parseInt(tokens[pasteSttCol] || '', 10) : NaN;
          const matched = findMatchedRow(
            codeTok,
            nameTok,
            !isNaN(sttTok) ? sttTok : null,
            updated
          );
          if (matched) {
            targetIndex = updated.findIndex((u) => u.studentId === matched.studentId);
          }
        } else {
          const token0 = tokens[0] || '';
          const token1 = tokens[1] || '';
          const matched =
            findMatchedRow(token0, token1, parseInt(token0, 10) || null, updated) ||
            findMatchedRow(token1, token0, null, updated);
          if (matched) {
            targetIndex = updated.findIndex((u) => u.studentId === matched.studentId);
          } else if (lineIndex < updated.length) {
            targetIndex = lineIndex;
          }
        }

        if (targetIndex !== -1 && targetIndex < updated.length) {
          const row = updated[targetIndex];
          const newScores = { ...row.scores };
          const rowUpdatedKeys: SubjectKey[] = [];

          if (headerSubjects.length > 0) {
            headerSubjects.forEach(({ colIdx, key }) => {
              const num = parseNumericScore(tokens[colIdx]);
              if (num !== null) {
                newScores[key] = num;
                rowUpdatedKeys.push(key);
              }
            });
          } else {
            // Sequential numeric cells (skip STT if first token equals row.stt and there are > 10 numbers)
            const numericTokens = tokens
              .map((tok, idx) => ({ idx, val: parseNumericScore(tok) }))
              .filter((x): x is { idx: number; val: number } => x.val !== null);

            const trimmedNumeric =
              numericTokens.length > ALL_SUBJECTS.length && numericTokens[0].idx === 0
                ? numericTokens.slice(1)
                : numericTokens;

            trimmedNumeric.forEach((item, subIdx) => {
              if (subIdx < ALL_SUBJECTS.length) {
                const subKey = ALL_SUBJECTS[subIdx].key;
                newScores[subKey] = item.val;
                rowUpdatedKeys.push(subKey);
              }
            });
          }

          if (rowUpdatedKeys.length > 0) {
            nextHighlighted[row.studentId] = Array.from(
              new Set([...(nextHighlighted[row.studentId] || []), ...rowUpdatedKeys])
            );
            updated[targetIndex] = { ...row, scores: newScores };
            pasteCount++;
          }
        }
      });

      return updated;
    });

    setImportedCells(nextHighlighted);
    setShowPasteModal(false);
    setPasteRawText('');
    setSuccessToast(`Đã dán thành công dữ liệu điểm cho ${pasteCount} học sinh!`);
    setTimeout(() => setSuccessToast(null), 3500);
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
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-7xl w-full shadow-2xl border border-slate-100 my-4 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-blue-800 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <FileSpreadsheet className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black">
                  Nhập Bảng Điểm Tổng Hợp 10 Môn Bằng Excel (12A7)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-xs font-black">
                  Tự động nhận diện cột & tính GPA
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Hỗ trợ file .xlsx / .xls / .csv (kể cả file xuất từ VNedu, CSDL ngành) hoặc dán trực tiếp từ Excel • GVCN: Thầy Trương Xuân Hòa
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
          {/* Main 2 Input Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('excel')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'excel'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Nhập từ file Excel (.xlsx / .csv)
            </button>
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-4 h-4" /> Bảng tính ma trận 10 môn
            </button>
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => setShowPasteModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Dán dữ liệu copy từ Excel hoặc Google Sheets"
            >
              <Clipboard className="w-3.5 h-3.5" /> Dán từ Excel (Ctrl+V)
            </button>

            <button
              onClick={() => handleExportExcel(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Tải file Excel mẫu chuẩn 10 môn lớp 12A7"
            >
              <Download className="w-3.5 h-3.5" /> Tải mẫu Excel 12A7 (.xlsx)
            </button>

            <button
              onClick={() => handleExportExcel(false)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Xuất bảng điểm đang chỉnh sửa ra file Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Xuất Excel
            </button>

            <button
              onClick={handleFillRandomSampleScores}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Tự động điền điểm mẫu thử nghiệm nhanh"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Điền điểm mẫu
            </button>

            <button
              onClick={handleClearMatrixScores}
              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Xóa trắng toàn bộ các ô điểm trên bảng nháp hiện tại"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" /> Xóa trắng bảng nháp
            </button>
          </div>
        </div>

        {/* Hidden Excel File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Excel Upload & Sheet Mapping Panel */}
        {activeTab === 'excel' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingExcel(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDraggingExcel(false);
            }}
            onDrop={handleExcelDrop}
            className={`mx-5 mt-3 p-4 rounded-2xl border-2 transition-all shrink-0 space-y-3 ${
              isDraggingExcel
                ? 'border-emerald-500 bg-emerald-100/70 shadow-md'
                : 'border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Tải File Excel Bảng Điểm (.xlsx, .xls, .csv)
                </h3>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Chọn file hoặc <strong>kéo thả file Excel vào đây</strong>. Hệ thống tự động tìm dòng tiêu đề, nhận diện cột Mã HS / Họ tên (kể cả cột Họ và Tên tách riêng), tên 10 môn học và điểm dùng dấu phẩy hoặc dấu chấm.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={excelTargetSubject}
                  onChange={(e) => {
                    const nextSub = e.target.value as 'all' | SubjectKey;
                    setExcelTargetSubject(nextSub);
                    if (workbookRef.current && selectedSheetName && excelFileName) {
                      applyExcelSheet(workbookRef.current, selectedSheetName, excelFileName, nextSub);
                    }
                  }}
                  className="px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-bold text-emerald-950 shadow-2xs"
                >
                  <option value="all">Nạp tất cả cột môn tìm thấy (10 môn)</option>
                  {ALL_SUBJECTS.map((sub) => (
                    <option key={sub.key} value={sub.key}>
                      Chỉ nạp điểm môn: {sub.name} ({sub.teacher})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {excelFileName ? 'Chọn file Excel khác' : 'Chọn file Excel từ Máy / ĐT'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-900">
              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none font-semibold">
                <input
                  type="checkbox"
                  checked={clearBeforeExcelApply}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setClearBeforeExcelApply(checked);
                    if (workbookRef.current && selectedSheetName && excelFileName) {
                      applyExcelSheet(
                        workbookRef.current,
                        selectedSheetName,
                        excelFileName,
                        undefined,
                        checked
                      );
                    }
                  }}
                  className="rounded border-emerald-300 text-emerald-600"
                />
                <span>Xóa trắng các ô điểm nháp cũ trước khi nạp dữ liệu từ file Excel</span>
              </label>

              {sheetNames.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-bold">Chọn Sheet:</span>
                  <select
                    value={selectedSheetName}
                    onChange={(e) => {
                      const nextSheet = e.target.value;
                      setSelectedSheetName(nextSheet);
                      if (workbookRef.current && excelFileName) {
                        applyExcelSheet(workbookRef.current, nextSheet, excelFileName);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg border border-emerald-300 bg-white font-bold text-emerald-900"
                  >
                    {sheetNames.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {excelSummary && (
              <div className="pt-2.5 border-t border-emerald-200/70 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      File: <strong>{excelSummary.fileName}</strong> (Sheet: {excelSummary.sheetName}, dòng tiêu đề #{excelSummary.headerRowNumber})
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                    Khớp {excelSummary.matchedStudents}/{gridData.length} HS • {excelSummary.updatedCells} ô điểm
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-slate-600 mr-1">Cột môn đã nhận diện:</span>
                  {excelSummary.detectedSubjects.map((subKey) => {
                    const info = ALL_SUBJECTS.find((s) => s.key === subKey);
                    return (
                      <span
                        key={subKey}
                        className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-800 font-bold"
                      >
                        ✓ {info?.name || subKey}
                      </span>
                    );
                  })}
                </div>

                {excelSummary.unmatchedNames.length > 0 && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                    <strong>Lưu ý ({excelSummary.unmatchedNames.length} tên trong file chưa khớp danh sách 12A7):</strong>{' '}
                    {excelSummary.unmatchedNames.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Alerts */}
        {successToast && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successToast}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
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
                        const isImported = importedCells[row.studentId]?.includes(sub.key);

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
                              title={isImported ? 'Điểm vừa nạp từ Excel' : undefined}
                              className={`w-14 text-center py-1 rounded-lg border font-mono font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all ${
                                isImported
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-300'
                                  : isHigh
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
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveToSystem}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
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
                <strong>Hướng dẫn:</strong> Bôi đen vùng dữ liệu điểm trong Excel / Google Sheets (có thể copy kèm dòng tiêu đề cột như <em>Họ và tên, Toán, Ngữ văn...</em> hoặc chỉ copy các cột điểm từ Toán → GDQP), nhấn{' '}
                <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 border text-slate-800 font-mono font-bold">
                  Ctrl+C
                </kbd>{' '}
                rồi dán vào khung bên dưới:
              </p>
              <textarea
                rows={8}
                value={pasteRawText}
                onChange={(e) => setPasteRawText(e.target.value)}
                placeholder="Dán dữ liệu vào đây (Ctrl+V)...&#10;Ví dụ (có tiêu đề): Họ và tên	Toán	Ngữ văn	Tiếng Anh&#10;Hoặc chỉ dán điểm 10 môn: 8.5	8.0	8.5	7.5	8.0	7.0	8.5	9.0	8.5	9.0"
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
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
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
