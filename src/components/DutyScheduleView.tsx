import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DutyScheduleItem } from '../types';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Users,
  Download,
  RotateCcw,
  Sparkles,
  UserCheck,
  Check,
  X,
  Bell,
  Calendar,
  Layers,
  Save,
  Info,
  CheckSquare,
  Square,
  Filter,
} from 'lucide-react';

const COMMON_DUTY_PRESETS = [
  'Lau bảng sạch trước 6h45, giặt khăn lau phấn, kê ngay ngắn bàn giáo viên',
  'Quét sạch sàn lớp 5 dãy bàn, gom rác vào bao rác lớp',
  'Kiểm tra hộc bàn học sinh, nhắc nhở không để vỏ hộp sữa và đồ ăn',
  'Đổ rác ra xe gom rác trường THPT Vĩnh Lộc B sau tiết 4 sáng và tiết 3 chiều',
  'Kiểm tra tắt toàn bộ 6 quạt trần, đèn chiếu sáng và then cài cửa sổ trước khi ra về',
  'Tưới cây xanh bồn hoa hành lang lớp 12A7 và lau sạch bệ cửa sổ',
  'Tổng vệ sinh cuối tuần: lau cửa kính, quét mạng nhện trần, kiểm kê thiết bị lớp',
];

const PRESET_MEMBER_ROLES = [
  'Lau bảng & chuẩn bị phấn',
  'Quét lớp & gom rác',
  'Kê bàn ghế & kiểm tra hộc bàn',
  'Đổ rác & tưới cây',
  'Tắt quạt đèn & khóa cửa',
];

export const DutyScheduleView: React.FC = () => {
  const {
    role,
    setRole,
    isTeacherAuthenticated,
    currentStudent,
    setActiveStudentId,
    students,
    assignStudentCadreRole,
    dutySchedule,
    updateDutySchedule,
    updateDutyItem,
    addDutyItem,
    deleteDutyItem,
    resetDutySchedule,
    appConfig,
    currentWeek,
    addBonusPointEntry,
    addAnnouncement,
  } = useApp();

  const laborCadreStudent = useMemo(
    () =>
      students.find((s) => s.classRole === 'Lớp phó lao động') ||
      students.find((s) => s.id === 'hs-17') ||
      students.find((s) => s.id === 'hs-21') ||
      students[0],
    [students]
  );

  const isTeacher = role === 'teacher' && isTeacherAuthenticated;
  const isLaborCadre =
    currentStudent?.classRole === 'Lớp phó lao động' ||
    (laborCadreStudent ? currentStudent?.id === laborCadreStudent.id : false);
  const canManageDuty = isTeacher || isLaborCadre;

  // Filters & display state
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek || 6);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [viewStyle, setViewStyle] = useState<'cards' | 'table'>('cards');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isEditCadreModalOpen, setIsEditCadreModalOpen] = useState(false);
  const [selectedCadreStudentId, setSelectedCadreStudentId] = useState<string>(
    laborCadreStudent?.id || 'hs-17'
  );
  const [cadreSearchQuery, setCadreSearchQuery] = useState<string>('');
  const [cadreGroupFilter, setCadreGroupFilter] = useState<string>('all');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Editing Item
  const [currentEditingDuty, setCurrentEditingDuty] = useState<DutyScheduleItem | null>(null);

  // Evaluation Form State
  const [evaluatingDuty, setEvaluatingDuty] = useState<DutyScheduleItem | null>(null);
  const [evalScores, setEvalScores] = useState({
    boardAndDesk: 2.0,
    floorClean: 3.0,
    desksOrder: 2.0,
    trashDisposal: 1.5,
    powerAndWindows: 1.5,
  });
  const [evalStatus, setEvalStatus] = useState<'pending' | 'in_progress' | 'completed'>('completed');
  const [evalNote, setEvalNote] = useState('');
  const [syncBonusEmulation, setSyncBonusEmulation] = useState(true);

  // Form state for New Duty
  const [dutyForm, setDutyForm] = useState({
    group: 'Tổ 1',
    day: 'Thứ Hai',
    weekNumber: currentWeek || 6,
    shift: 'all_day' as 'morning' | 'afternoon' | 'all_day',
    leaderName: 'Nguyễn Hoàng Khang (Tổ trưởng)',
    task: COMMON_DUTY_PRESETS[0],
    assignedMembers: [] as string[],
    note: '',
  });

  // Reminder form state
  const [reminderTitle, setReminderTitle] = useState('📢 [NHẮC NHỞ TRỰC NHẬT] Đôn đốc vệ sinh lớp 12A7');
  const [reminderContent, setReminderContent] = useState(
    'Nhắc nhở các bạn trong Tổ trực nhật ngày mai có mặt trước 6h45 để lau bảng, kê bàn ghế và kiểm tra phòng học. Cuối giờ chiều nhớ tắt quạt đèn và đổ rác đầy đủ nhé!'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Switch to Labor Cadre
  const handleSwitchToLaborCadre = () => {
    const targetId = laborCadreStudent?.id || 'hs-17';
    const targetName = laborCadreStudent?.name || 'Đặng Nguyễn Kha';
    setActiveStudentId(targetId);
    setRole('student');
    showToast(`Đã chuyển sang vai trò: ${targetName} - Lớp phó Lao động 12A7!`);
  };

  // Open Edit Labor Cadre Modal
  const handleOpenEditCadreModal = () => {
    setSelectedCadreStudentId(laborCadreStudent?.id || 'hs-17');
    setCadreSearchQuery('');
    setCadreGroupFilter('all');
    setIsEditCadreModalOpen(true);
  };

  // Save new Labor Cadre
  const handleSaveLaborCadre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCadreStudentId) return;
    const chosenStudent = students.find((s) => s.id === selectedCadreStudentId);
    if (!chosenStudent) return;

    assignStudentCadreRole(selectedCadreStudentId, 'Lớp phó lao động');
    setIsEditCadreModalOpen(false);
    showToast(
      `Đã cập nhật học sinh ${chosenStudent.name} (Tổ ${chosenStudent.group}) làm Lớp phó Lao động 12A7!`
    );
  };

  const filteredCadreCandidates = useMemo(() => {
    return students.filter((s) => {
      if (cadreGroupFilter !== 'all' && String(s.group) !== cadreGroupFilter) return false;
      if (cadreSearchQuery.trim()) {
        const q = cadreSearchQuery.toLowerCase().trim();
        return (
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          String(s.stt).includes(q)
        );
      }
      return true;
    });
  }, [students, cadreGroupFilter, cadreSearchQuery]);

  // Group filter list
  const filteredDutySchedule = useMemo(() => {
    return dutySchedule.filter((item) => {
      if (filterGroup === 'all') return true;
      return item.group === filterGroup;
    });
  }, [dutySchedule, filterGroup]);

  // Statistics
  const totalTasks = dutySchedule.length;
  const completedTasks = dutySchedule.filter((d) => d.status === 'completed').length;
  const inProgressTasks = dutySchedule.filter((d) => d.status === 'in_progress').length;
  const avgScore =
    totalTasks > 0
      ? (
          dutySchedule.reduce((sum, d) => sum + (d.score !== undefined ? d.score : 10), 0) / totalTasks
        ).toFixed(1)
      : '10.0';

  // Students in selected group
  const studentsInSelectedGroup = useMemo(() => {
    const grpNumber =
      dutyForm.group === 'Tổ 1'
        ? 1
        : dutyForm.group === 'Tổ 2'
        ? 2
        : dutyForm.group === 'Tổ 3'
        ? 3
        : dutyForm.group === 'Tổ 4'
        ? 4
        : null;

    if (!grpNumber) return students;
    return students.filter((s) => s.group === grpNumber);
  }, [students, dutyForm.group]);

  // Handle Open Add Modal
  const handleOpenAddModal = () => {
    setDutyForm({
      group: 'Tổ 1',
      day: 'Thứ Hai',
      weekNumber: selectedWeek,
      shift: 'all_day',
      leaderName: 'Nguyễn Hoàng Khang (Tổ trưởng)',
      task: COMMON_DUTY_PRESETS[0],
      assignedMembers: [
        'Nguyễn Hoàng Khang (Phụ trách chung)',
        'Vũ Trịnh Bảo An (Lau bảng & giặt giẻ)',
        'Trần Ngọc Mai Anh (Quét lớp)',
      ],
      note: 'Các bạn có mặt trước 6h45 đầu giờ sáng.',
    });
    setIsAddModalOpen(true);
  };

  // Auto Rotation Generator
  const handleAutoRotateDuty = () => {
    if (!confirm('Bạn có muốn tự động tạo lịch phân công trực nhật xoay tua cho cả 4 Tổ tuần này?')) {
      return;
    }

    const rotatedSchedule: DutyScheduleItem[] = [
      {
        id: `duty-rot-1-${Date.now()}`,
        group: 'Tổ 1',
        day: 'Thứ Hai',
        weekNumber: selectedWeek,
        shift: 'all_day',
        leaderName: 'Nguyễn Hoàng Khang (Tổ trưởng)',
        assignedBy: `${laborCadreStudent?.name || 'Đặng Nguyễn Kha'} (Lớp phó Lao động)`,
        task: 'Kê bàn ghế chào cờ, lau bảng sạch trước 6h45, kiểm tra khăn phấn, đổ rác đầu tuần',
        assignedMembers: [
          'Nguyễn Hoàng Khang (Tổ trưởng kiểm tra)',
          'Vũ Trịnh Bảo An (Lau bảng & giặt giẻ)',
          'Trần Ngọc Mai Anh (Quét sàn lớp)',
          'Nguyễn Tấn Đạt (Đổ rác lớn)',
          'Đỗ Thái An (Kê bàn ghế)',
        ],
        status: 'completed',
        score: 10,
        criteriaScores: { boardAndDesk: 2.0, floorClean: 3.0, desksOrder: 2.0, trashDisposal: 1.5, powerAndWindows: 1.5 },
        checklist: [
          { id: '1', label: 'Lau bảng sạch & chuẩn bị phấn trước 6h45', done: true },
          { id: '2', label: 'Quét sạch rác dưới sàn và các góc', done: true },
          { id: '3', label: 'Hộc bàn không để lại rác thừa', done: true },
          { id: '4', label: 'Đổ rác ra xe gom rác trường', done: true },
          { id: '5', label: 'Tắt 6 quạt trần, đèn và chốt cửa sổ', done: true },
        ],
        note: 'Tổ 1 đã hoàn thành xuất sắc ngày đầu tuần.',
      },
      {
        id: `duty-rot-2-${Date.now()}`,
        group: 'Tổ 2',
        day: 'Thứ Ba & Thứ Năm',
        weekNumber: selectedWeek,
        shift: 'all_day',
        leaderName: 'Lê Quang Hải (Tổ trưởng)',
        assignedBy: `${laborCadreStudent?.name || 'Đặng Nguyễn Kha'} (Lớp phó Lao động)`,
        task: 'Vệ sinh phòng học trước 6h45, chuẩn bị bút viết bảng/phấn, đổ rác sau tiết 4 sáng và sau tiết 3 chiều',
        assignedMembers: [
          'Lê Quang Hải (Phụ trách chung)',
          'Đỗ Thái Huy (Quét lớp và gom rác)',
          'Phạm Gia Hân (Lau bảng & giặt khăn)',
          `${laborCadreStudent?.name || 'Đặng Nguyễn Kha'} (Kiểm tra quạt đèn & đổ rác)`,
          'Nguyễn Lê Hoàng (Kê bàn ghế)',
        ],
        status: 'in_progress',
        score: 10,
        criteriaScores: { boardAndDesk: 2.0, floorClean: 3.0, desksOrder: 2.0, trashDisposal: 1.5, powerAndWindows: 1.5 },
        checklist: [
          { id: '1', label: 'Lau bảng sạch & chuẩn bị phấn trước 6h45', done: true },
          { id: '2', label: 'Quét sạch rác dưới sàn và các góc', done: true },
          { id: '3', label: 'Hộc bàn không để lại rác thừa', done: true },
          { id: '4', label: 'Đổ rác ra xe gom rác trường', done: false },
          { id: '5', label: 'Tắt 6 quạt trần, đèn và chốt cửa sổ', done: false },
        ],
        note: 'Đang theo dõi trực nhật buổi chiều.',
      },
      {
        id: `duty-rot-3-${Date.now()}`,
        group: 'Tổ 3',
        day: 'Thứ Tư',
        weekNumber: selectedWeek,
        shift: 'all_day',
        leaderName: 'Phạm Nhật Minh (Tổ trưởng)',
        assignedBy: `${laborCadreStudent?.name || 'Đặng Nguyễn Kha'} (Lớp phó Lao động)`,
        task: 'Kiểm tra hệ thống quạt đèn trước và sau buổi học; tưới cây cảnh hành lang 12A7; thu gom rác hộc bàn',
        assignedMembers: [
          'Phạm Nhật Minh (Tổ trưởng đôn đốc)',
          'Huỳnh Thị Ái Ly (Lớp trưởng hỗ trợ)',
          'Phạm Thị Trà My (Tưới cây & lau bệ cửa sổ)',
          'Nguyễn Minh Khôi (Quét lớp)',
          'Lâm Gia Hân (Kiểm tra hộc bàn)',
        ],
        status: 'pending',
        score: 10,
        criteriaScores: { boardAndDesk: 2.0, floorClean: 3.0, desksOrder: 2.0, trashDisposal: 1.5, powerAndWindows: 1.5 },
        checklist: [
          { id: '1', label: 'Lau bảng sạch & chuẩn bị phấn trước 6h45', done: false },
          { id: '2', label: 'Quét sạch rác dưới sàn và các góc', done: false },
          { id: '3', label: 'Hộc bàn không để lại rác thừa', done: false },
          { id: '4', label: 'Đổ rác ra xe gom rác trường', done: false },
          { id: '5', label: 'Tắt 6 quạt trần, đèn và chốt cửa sổ', done: false },
        ],
        note: 'Chuẩn bị ca trực ngày Thứ Tư.',
      },
      {
        id: `duty-rot-4-${Date.now()}`,
        group: 'Tổ 4',
        day: 'Thứ Sáu',
        weekNumber: selectedWeek,
        shift: 'afternoon',
        leaderName: 'Võ Hoàng Tuấn (Tổ trưởng)',
        assignedBy: `${laborCadreStudent?.name || 'Đặng Nguyễn Kha'} (Lớp phó Lao động)`,
        task: 'Tổng vệ sinh cuối tuần, lau cửa kính, quét mạng nhện, khóa chặt cửa sổ, kiểm kê bàn ghế và thiết bị lớp',
        assignedMembers: [
          'Võ Hoàng Tuấn (Tổ trưởng phụ trách)',
          'Nguyễn Ngọc Bích Trâm (Bí thư điều phối)',
          'Trần Quốc Thái (Lau kính cửa sổ)',
          'Đặng Đình Phúc (Quét mạng nhện trần)',
          'Lê Phú Trình (Kê lại bàn ghế 5 dãy)',
          'Dương Minh Trí (Đổ rác lớn)',
        ],
        status: 'pending',
        score: 10,
        criteriaScores: { boardAndDesk: 2.0, floorClean: 3.0, desksOrder: 2.0, trashDisposal: 1.5, powerAndWindows: 1.5 },
        checklist: [
          { id: '1', label: 'Lau bảng sạch & chuẩn bị phấn trước 6h45', done: false },
          { id: '2', label: 'Quét sạch rác dưới sàn và các góc', done: false },
          { id: '3', label: 'Hộc bàn không để lại rác thừa', done: false },
          { id: '4', label: 'Đổ rác ra xe gom rác trường', done: false },
          { id: '5', label: 'Tắt 6 quạt trần, đèn và chốt cửa sổ', done: false },
        ],
        note: 'Tổng vệ sinh sau tiết sinh hoạt lớp.',
      },
    ];

    updateDutySchedule(rotatedSchedule);
    showToast('Đã tự động xoay tua lịch trực nhật cho 4 Tổ tuần này!');
  };

  // Save New Duty
  const handleSaveNewDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dutyForm.task.trim()) {
      alert('Vui lòng nhập nhiệm vụ trực nhật chi tiết!');
      return;
    }

    addDutyItem({
      group: dutyForm.group,
      day: dutyForm.day,
      weekNumber: dutyForm.weekNumber,
      shift: dutyForm.shift,
      leaderName: dutyForm.leaderName,
      assignedBy: `${laborCadreStudent?.name || 'Đặng Nguyễn Kha'} (Lớp phó Lao động)`,
      task: dutyForm.task.trim(),
      assignedMembers: dutyForm.assignedMembers,
      status: 'pending',
      score: 10,
      criteriaScores: { boardAndDesk: 2.0, floorClean: 3.0, desksOrder: 2.0, trashDisposal: 1.5, powerAndWindows: 1.5 },
      checklist: [
        { id: 'c1', label: 'Lau bảng sạch & chuẩn bị phấn trước 6h45', done: false },
        { id: 'c2', label: 'Quét sạch rác dưới sàn và các góc lớp', done: false },
        { id: 'c3', label: 'Hộc bàn không để lại rác thừa', done: false },
        { id: 'c4', label: 'Đổ rác ra xe gom rác trường', done: false },
        { id: 'c5', label: 'Tắt 6 quạt trần, đèn và then cài cửa sổ', done: false },
      ],
      note: dutyForm.note.trim() || 'Lớp phó Lao động giao nhiệm vụ.',
    });

    setIsAddModalOpen(false);
    showToast(`Đã phân công ca trực nhật mới cho ${dutyForm.group}!`);
  };

  // Open Edit Single Modal
  const handleOpenEditModal = (item: DutyScheduleItem) => {
    setCurrentEditingDuty(item);
    setIsEditModalOpen(true);
  };

  // Save Single Edit
  const handleSaveEditDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditingDuty) return;

    updateDutyItem(currentEditingDuty.id, {
      group: currentEditingDuty.group,
      day: currentEditingDuty.day,
      shift: currentEditingDuty.shift,
      leaderName: currentEditingDuty.leaderName,
      task: currentEditingDuty.task,
      assignedMembers: currentEditingDuty.assignedMembers,
      note: currentEditingDuty.note,
    });

    setIsEditModalOpen(false);
    setCurrentEditingDuty(null);
    showToast(`Đã cập nhật ca trực nhật ${currentEditingDuty.group}!`);
  };

  // Open Evaluate Modal
  const handleOpenEvaluateModal = (item: DutyScheduleItem) => {
    setEvaluatingDuty(item);
    const scores = item.criteriaScores || {
      boardAndDesk: 2.0,
      floorClean: 3.0,
      desksOrder: 2.0,
      trashDisposal: 1.5,
      powerAndWindows: 1.5,
    };
    setEvalScores(scores);
    setEvalStatus(item.status || 'completed');
    setEvalNote(item.note || '');
    setIsEvaluateModalOpen(true);
  };

  // Save Evaluation & Rubric
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingDuty) return;

    const totalScore = parseFloat(
      (
        evalScores.boardAndDesk +
        evalScores.floorClean +
        evalScores.desksOrder +
        evalScores.trashDisposal +
        evalScores.powerAndWindows
      ).toFixed(1)
    );

    updateDutyItem(evaluatingDuty.id, {
      score: totalScore,
      criteriaScores: evalScores,
      status: evalStatus,
      note: evalNote.trim(),
    });

    // If sync with bonus emulation
    if (syncBonusEmulation && totalScore >= 9.5) {
      addBonusPointEntry({
        weekNumber: selectedWeek,
        date: new Date().toISOString().split('T')[0],
        reason: `Trực nhật vệ sinh xuất sắc (${evaluatingDuty.group}) đạt ${totalScore}/10 điểm`,
        pointsAdded: 2,
        recordedBy: `${laborCadreStudent?.name || 'Đặng Nguyễn Kha'} (Lớp phó Lao động)`,
      });
    }

    setIsEvaluateModalOpen(false);
    setEvaluatingDuty(null);
    showToast(`Đã chấm điểm ${totalScore}/10 cho ${evaluatingDuty.group}!`);
  };

  // Toggle single checklist item on a duty card
  const handleToggleChecklist = (dutyId: string, checkId: string) => {
    if (!canManageDuty) return;
    const duty = dutySchedule.find((d) => d.id === dutyId);
    if (!duty || !duty.checklist) return;

    const updatedChecklist = duty.checklist.map((c) =>
      c.id === checkId ? { ...c, done: !c.done } : c
    );

    const allDone = updatedChecklist.every((c) => c.done);
    updateDutyItem(dutyId, {
      checklist: updatedChecklist,
      status: allDone ? 'completed' : 'in_progress',
    });
  };

  // Send Reminder Announcement
  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    addAnnouncement({
      title: reminderTitle.trim(),
      type: 'cadre',
      targetAudience: 'cadre',
      content: reminderContent.trim(),
      author: laborCadreStudent?.name || 'Đặng Nguyễn Kha',
      role: 'Lớp phó Lao động 12A7',
      isPinned: true,
    });

    setIsReminderModalOpen(false);
    showToast('Đã gửi thông báo nhắc nhở trực nhật lên Bảng tin lớp 12A7!');
  };

  // Export Duty Schedule to CSV
  const handleExportCSV = () => {
    const rows = [
      ['Tổ phụ trách', 'Ngày trực', 'Ca trực', 'Tổ trưởng', 'Nhiệm vụ', 'Thành viên phân công', 'Điểm số / 10', 'Trạng thái', 'Đánh giá của Lớp phó LĐ'],
      ...dutySchedule.map((d) => [
        `"${d.group}"`,
        `"${d.day}"`,
        d.shift === 'morning' ? 'Sáng' : d.shift === 'afternoon' ? 'Chiều' : 'Cả ngày',
        `"${d.leaderName || ''}"`,
        `"${d.task}"`,
        `"${(d.assignedMembers || []).join('; ')}"`,
        d.score !== undefined ? d.score : 10,
        d.status === 'completed' ? 'Đã hoàn thành' : d.status === 'in_progress' ? 'Đang trực' : 'Chuẩn bị',
        `"${d.note || ''}"`,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Lich_truc_nhat_12A7_Tuan_${selectedWeek}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="font-bold text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden border border-emerald-700/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Phân Lịch Trực Nhật & Vệ Sinh Lớp {appConfig.className}
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold border border-emerald-400/30">
                  Năm học {appConfig.schoolYear}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl leading-relaxed">
                Ban cán sự Lao động & Vệ sinh • Theo dõi vệ sinh phòng học trước 6h45 và sau tiết 3 chiều • Chấm điểm thi đua trực nhật 4 Tổ
              </p>

              {/* Identity & Current Cadre Badge */}
              <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 border border-white/20 text-white font-semibold">
                  <User className="w-3.5 h-3.5 text-emerald-300" />
                  <span>
                    Lớp phó Lao động:{' '}
                    <strong>{laborCadreStudent?.name || 'Đặng Nguyễn Kha'}</strong> (
                    {laborCadreStudent?.code || 'HS017'} • Tổ {laborCadreStudent?.group || 2})
                  </span>
                </div>

                {canManageDuty && (
                  <button
                    onClick={handleOpenEditCadreModal}
                    className="px-2.5 py-1 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-900 text-[11px] font-black flex items-center gap-1 transition-all shadow-xs"
                    title="Chọn hoặc đổi học sinh làm Lớp phó Lao động"
                  >
                    <Edit2 className="w-3 h-3" /> Chỉnh sửa Lớp phó Lao động
                  </button>
                )}

                {isLaborCadre ? (
                  <span className="px-2.5 py-1 rounded-xl bg-yellow-400 text-slate-900 text-[11px] font-black flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" /> BẠN ĐANG LÀ LỚP PHÓ LAO ĐỘNG
                  </span>
                ) : isTeacher ? (
                  <span className="px-2.5 py-1 rounded-xl bg-blue-500 text-white text-[11px] font-black flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" /> QUYỀN GVCN THẦY HÒA
                  </span>
                ) : (
                  <button
                    onClick={handleSwitchToLaborCadre}
                    className="px-3 py-1 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs"
                    title={`Chuyển quyền nhanh sang ${laborCadreStudent?.name || 'Lớp phó Lao động'} để thao tác`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Đổi sang Lớp phó Lao động (
                    {laborCadreStudent?.name || 'Đặng Nguyễn Kha'})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center gap-2 lg:self-center">
            {canManageDuty && (
              <>
                <button
                  onClick={handleOpenEditCadreModal}
                  className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <UserCheck className="w-4 h-4 text-slate-900" /> Đổi Lớp phó Lao động
                </button>
                <button
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-4 h-4 text-emerald-700" /> Phân công ca trực mới
                </button>
                <button
                  onClick={handleAutoRotateDuty}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                  title="Tự động xoay tua nhiệm vụ 4 Tổ trong tuần"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Tự động xoay tua 4 Tổ
                </button>
                <button
                  onClick={() => setIsReminderModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                  title="Gửi thông báo nhắc nhở vệ sinh lên Bảng tin lớp"
                >
                  <Bell className="w-3.5 h-3.5" /> Nhắc nhở vệ sinh
                </button>
              </>
            )}
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-all flex items-center gap-1.5"
              title="Xuất bảng phân công và sổ theo dõi trực nhật ra Excel"
            >
              <Download className="w-3.5 h-3.5" /> Xuất Excel
            </button>
          </div>
        </div>

        {/* 4 KPI Progress Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">Tổng số ca trực</div>
            <div className="text-2xl font-black text-white mt-0.5">{totalTasks}</div>
            <div className="text-[10px] text-emerald-300 mt-0.5">Phân công trong tuần</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">Đã hoàn thành</div>
            <div className="text-2xl font-black text-white mt-0.5">{completedTasks}</div>
            <div className="text-[10px] text-emerald-300 mt-0.5">Đạt chuẩn 5 tiêu chí</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">Đang theo dõi</div>
            <div className="text-2xl font-black text-amber-300 mt-0.5">{inProgressTasks}</div>
            <div className="text-[10px] text-amber-200 mt-0.5">Đang trực hôm nay</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">Điểm vệ sinh TB</div>
            <div className="text-2xl font-black text-yellow-300 mt-0.5">{avgScore}/10đ</div>
            <div className="text-[10px] text-yellow-200 mt-0.5">Đánh giá thi đua lớp</div>
          </div>
        </div>

        {/* 5 Chuẩn Vệ Sinh THPT Vĩnh Lộc B */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[11px]">
          <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-900 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">1</span>
            <div>
              <strong className="text-white block text-[10px]">Bảng & Bàn GV (2đ)</strong>
              <span className="text-emerald-100 text-[10px]">Lau sạch bảng, giặt khăn trước 6h45.</span>
            </div>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-900 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">2</span>
            <div>
              <strong className="text-white block text-[10px]">Sàn lớp học (3đ)</strong>
              <span className="text-emerald-100 text-[10px]">Quét sạch rác, không bụi bẩn.</span>
            </div>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-900 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">3</span>
            <div>
              <strong className="text-white block text-[10px]">Hộc bàn sạch (2đ)</strong>
              <span className="text-emerald-100 text-[10px]">Không để vỏ hộp sữa, túi nilon.</span>
            </div>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-900 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">4</span>
            <div>
              <strong className="text-white block text-[10px]">Đổ rác đúng giờ (1.5đ)</strong>
              <span className="text-emerald-100 text-[10px]">Đổ rác ra xe gom trường sau tiết 3.</span>
            </div>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-900 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">5</span>
            <div>
              <strong className="text-white block text-[10px]">Tắt quạt đèn & Cửa (1.5đ)</strong>
              <span className="text-emerald-100 text-[10px]">Tắt 6 quạt trần, đóng then cài cửa sổ.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Filter & View Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Filter by Group */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold">
          <span className="text-slate-500 flex items-center gap-1 px-2">
            <Filter className="w-3.5 h-3.5" /> Lọc Tổ:
          </span>
          <button
            onClick={() => setFilterGroup('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterGroup === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả 4 Tổ ({dutySchedule.length})
          </button>
          {['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4', 'Cả Lớp'].map((grp) => (
            <button
              key={grp}
              onClick={() => setFilterGroup(grp)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterGroup === grp
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewStyle('cards')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewStyle === 'cards' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Dạng Thẻ
            </button>
            <button
              onClick={() => setViewStyle('table')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewStyle === 'table' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Dạng Bảng
            </button>
          </div>
        </div>
      </div>

      {/* Main Duty Cards Grid */}
      {viewStyle === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDutySchedule.map((duty) => {
            const isCompleted = duty.status === 'completed';
            const isInProgress = duty.status === 'in_progress';
            const checklist = duty.checklist || [];

            return (
              <div
                key={duty.id}
                className={`p-4 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
                  isCompleted
                    ? 'bg-white border-emerald-300 hover:border-emerald-500'
                    : isInProgress
                    ? 'bg-amber-50/40 border-amber-300 hover:border-amber-500'
                    : 'bg-white border-slate-200 hover:border-emerald-400'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-slate-400'
                        }`}
                      />
                      {duty.group}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-black">
                      {duty.day}
                    </span>
                  </div>

                  {/* Leader and Shift */}
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1 font-bold text-slate-800 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{duty.leaderName || 'Tổ trưởng'}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-600">
                      {duty.shift === 'morning' ? 'Sáng (trước 6h45)' : duty.shift === 'afternoon' ? 'Chiều (sau tiết 3)' : 'Cả ngày'}
                    </span>
                  </div>

                  {/* Task description */}
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs text-slate-800 leading-relaxed font-medium">
                    {duty.task}
                  </div>

                  {/* Assigned Members in the group */}
                  {duty.assignedMembers && duty.assignedMembers.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3 h-3 text-emerald-600" /> Thành viên phân công ({duty.assignedMembers.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {duty.assignedMembers.map((member, mIdx) => (
                          <span
                            key={mIdx}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold truncate max-w-full"
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Checklist (5 Items) */}
                  <div className="p-2.5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Checklist 5 Tiêu Chí:
                      </span>
                      <span className="font-black text-xs text-amber-600 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        {duty.score !== undefined ? `${duty.score}/10đ` : '10/10đ'}
                      </span>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-200 text-[11px]">
                      {checklist.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleChecklist(duty.id, item.id)}
                          className={`flex items-start gap-1.5 cursor-pointer select-none rounded-md px-1 py-0.5 transition-colors ${
                            item.done ? 'text-emerald-800' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {item.done ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <span className={item.done ? 'line-through text-slate-400' : ''}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {duty.note && (
                      <div className="pt-1.5 border-t border-slate-200 text-[11px] text-slate-600 italic">
                        "{duty.note}"
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Người giao:{' '}
                    <span className="font-semibold text-slate-600">
                      {duty.assignedBy || `${laborCadreStudent?.name || 'Đặng Nguyễn Kha'} (Lớp phó LĐ)`}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between gap-1">
                  {canManageDuty ? (
                    <>
                      <button
                        onClick={() => handleOpenEvaluateModal(duty)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Chấm điểm vệ sinh theo thang 10 điểm"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> Chấm điểm
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(duty)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-colors"
                          title="Sửa ca trực nhật này"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa ca trực của ${duty.group}?`)) {
                              deleteDutyItem(duty.id);
                              showToast(`Đã xóa ca trực của ${duty.group}!`);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Xóa ca trực"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-500">
                      Trạng thái: {isCompleted ? '✓ Hoàn thành' : isInProgress ? '⌛ Đang trực' : '📋 Đã phân công'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Tổ</th>
                  <th className="py-3 px-4">Ngày & Ca</th>
                  <th className="py-3 px-4">Tổ trưởng</th>
                  <th className="py-3 px-4">Nhiệm vụ</th>
                  <th className="py-3 px-4">Thành viên phân công</th>
                  <th className="py-3 px-4 text-center">Điểm / 10</th>
                  <th className="py-3 px-4">Đánh giá của Lớp phó LĐ</th>
                  {canManageDuty && <th className="py-3 px-4 text-center w-24">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDutySchedule.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-black text-slate-900">{d.group}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{d.day}</div>
                      <span className="text-[10px] text-slate-500">
                        {d.shift === 'morning' ? 'Sáng trước 6h45' : d.shift === 'afternoon' ? 'Chiều sau tiết 3' : 'Cả ngày'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{d.leaderName}</td>
                    <td className="py-3 px-4 max-w-xs">{d.task}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(d.assignedMembers || []).map((m, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-black text-amber-600 text-sm">
                      {d.score !== undefined ? `${d.score}đ` : '10đ'}
                    </td>
                    <td className="py-3 px-4 italic text-slate-600 max-w-xs">{d.note || 'Chưa ghi chú'}</td>
                    {canManageDuty && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEvaluateModal(d)}
                            className="p-1 rounded-lg text-amber-600 hover:bg-amber-50"
                            title="Chấm điểm"
                          >
                            <Star className="w-4 h-4 fill-amber-400" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(d)}
                            className="p-1 rounded-lg text-blue-600 hover:bg-blue-50"
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Xóa ca trực của ${d.group}?`)) {
                                deleteDutyItem(d.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW DUTY SCHEDULE */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 -mx-6 -mt-6 p-5 text-white flex items-center justify-between rounded-t-3xl mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Phân Công Ca Trực Nhật Mới</h3>
                  <p className="text-xs text-emerald-100">
                    {laborCadreStudent?.name || 'Đặng Nguyễn Kha'} - Lớp phó Lao động phân công
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewDuty} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tổ phụ trách:</label>
                  <select
                    value={dutyForm.group}
                    onChange={(e) => {
                      const grp = e.target.value;
                      let leader = 'Nguyễn Hoàng Khang (Tổ trưởng)';
                      if (grp === 'Tổ 2') leader = 'Lê Quang Hải (Tổ trưởng)';
                      else if (grp === 'Tổ 3') leader = 'Phạm Nhật Minh (Tổ trưởng)';
                      else if (grp === 'Tổ 4') leader = 'Võ Hoàng Tuấn (Tổ trưởng)';
                      else if (grp === 'Cả Lớp') leader = 'Huỳnh Thị Ái Ly (Lớp trưởng)';

                      setDutyForm({
                        ...dutyForm,
                        group: grp,
                        leaderName: leader,
                        assignedMembers: [],
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                  >
                    <option value="Tổ 1">Tổ 1 (12 bạn)</option>
                    <option value="Tổ 2">Tổ 2 (13 bạn)</option>
                    <option value="Tổ 3">Tổ 3 (12 bạn)</option>
                    <option value="Tổ 4">Tổ 4 (13 bạn)</option>
                    <option value="Cả Lớp">Cả Lớp (Tổng vệ sinh)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày phân công:</label>
                  <input
                    type="text"
                    value={dutyForm.day}
                    onChange={(e) => setDutyForm({ ...dutyForm, day: e.target.value })}
                    placeholder="Ví dụ: Thứ Hai, Thứ Ba..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ca trực nhật:</label>
                  <select
                    value={dutyForm.shift}
                    onChange={(e) => setDutyForm({ ...dutyForm, shift: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white text-slate-900"
                  >
                    <option value="all_day">Cả ngày (Sáng & Chiều)</option>
                    <option value="morning">Sáng (Trước 6h45)</option>
                    <option value="afternoon">Chiều (Sau tiết 3)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tổ trưởng phụ trách:</label>
                  <input
                    type="text"
                    value={dutyForm.leaderName}
                    onChange={(e) => setDutyForm({ ...dutyForm, leaderName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white"
                    required
                  />
                </div>
              </div>

              {/* Nhiệm vụ phân công */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nhiệm vụ phân công:</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {COMMON_DUTY_PRESETS.slice(0, 4).map((p, pIdx) => (
                    <button
                      type="button"
                      key={pIdx}
                      onClick={() => setDutyForm({ ...dutyForm, task: p })}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 transition-colors truncate max-w-full"
                    >
                      {p.slice(0, 45)}...
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={dutyForm.task}
                  onChange={(e) => setDutyForm({ ...dutyForm, task: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 leading-relaxed bg-white"
                  required
                />
              </div>

              {/* Tích chọn / Gán thành viên trong tổ */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chọn thành viên trong {dutyForm.group} phụ trách ca trực:
                </label>
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 max-h-36 overflow-y-auto space-y-1">
                  {studentsInSelectedGroup.map((stu) => {
                    const isSelected = dutyForm.assignedMembers.some((m) => m.startsWith(stu.name));

                    return (
                      <div
                        key={stu.id}
                        className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-white"
                      >
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDutyForm({
                                  ...dutyForm,
                                  assignedMembers: [
                                    ...dutyForm.assignedMembers,
                                    `${stu.name} (${stu.classRole || 'Trực nhật'})`,
                                  ],
                                });
                              } else {
                                setDutyForm({
                                  ...dutyForm,
                                  assignedMembers: dutyForm.assignedMembers.filter(
                                    (m) => !m.startsWith(stu.name)
                                  ),
                                });
                              }
                            }}
                            className="rounded-md text-emerald-600 focus:ring-emerald-500"
                          />
                          {stu.stt}. {stu.name} ({stu.code})
                        </span>
                        <span className="text-[10px] text-slate-400">{stu.classRole || 'Học sinh'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lời dặn dò */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lời dặn của Lớp phó Lao động:</label>
                <input
                  type="text"
                  value={dutyForm.note}
                  onChange={(e) => setDutyForm({ ...dutyForm, note: e.target.value })}
                  placeholder="Ví dụ: Đề nghị các bạn đến đúng giờ trước 6h45..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Phân Công Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT DUTY SCHEDULE ITEM */}
      {/* ========================================================================= */}
      {isEditModalOpen && currentEditingDuty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Chỉnh Sửa Ca Trực: {currentEditingDuty.group}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentEditingDuty(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDuty} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tổ phụ trách:</label>
                  <input
                    type="text"
                    value={currentEditingDuty.group}
                    onChange={(e) =>
                      setCurrentEditingDuty({ ...currentEditingDuty, group: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày phân công:</label>
                  <input
                    type="text"
                    value={currentEditingDuty.day}
                    onChange={(e) =>
                      setCurrentEditingDuty({ ...currentEditingDuty, day: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tổ trưởng phụ trách:</label>
                <input
                  type="text"
                  value={currentEditingDuty.leaderName || ''}
                  onChange={(e) =>
                    setCurrentEditingDuty({ ...currentEditingDuty, leaderName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nhiệm vụ trực nhật chi tiết:</label>
                <textarea
                  rows={3}
                  value={currentEditingDuty.task}
                  onChange={(e) =>
                    setCurrentEditingDuty({ ...currentEditingDuty, task: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lời dặn của Lớp phó Lao động:</label>
                <input
                  type="text"
                  value={currentEditingDuty.note || ''}
                  onChange={(e) =>
                    setCurrentEditingDuty({ ...currentEditingDuty, note: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentEditingDuty(null);
                  }}
                  className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" /> Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EVALUATE & SCORE 5 CRITERIA RUBRIC */}
      {/* ========================================================================= */}
      {isEvaluateModalOpen && evaluatingDuty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-auto">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 -mx-6 -mt-6 p-5 text-white flex items-center justify-between rounded-t-3xl mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20">
                  <Star className="w-5 h-5 fill-white text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Chấm Điểm Vệ Sinh 5 Tiêu Chí: {evaluatingDuty.group}
                  </h3>
                  <p className="text-xs text-amber-100">
                    {laborCadreStudent?.name || 'Đặng Nguyễn Kha'} - Lớp phó Lao động đánh giá thi đua
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEvaluateModalOpen(false);
                  setEvaluatingDuty(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200">
                <div className="flex items-center justify-between font-bold text-amber-950 mb-1">
                  <span>{evaluatingDuty.group} ({evaluatingDuty.day})</span>
                  <span>Tổ trưởng: {evaluatingDuty.leaderName}</span>
                </div>
                <p className="text-[11px] text-slate-600 italic">{evaluatingDuty.task}</p>
              </div>

              {/* 5 Rubric Criteria Sliders */}
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="font-extrabold text-slate-800 text-xs flex items-center justify-between border-b pb-1.5">
                  <span>5 TIÊU CHÍ VỆ SINH THPT VĨNH LỘC B</span>
                  <span className="text-amber-700 text-sm font-black">
                    Tổng: {(
                      evalScores.boardAndDesk +
                      evalScores.floorClean +
                      evalScores.desksOrder +
                      evalScores.trashDisposal +
                      evalScores.powerAndWindows
                    ).toFixed(1)}/10đ
                  </span>
                </div>

                {/* Tiêu chí 1: Bảng & Bàn GV */}
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>1. Lau bảng sạch sẽ, giặt giẻ phấn, kê bàn GV:</span>
                    <span className="text-emerald-700">{evalScores.boardAndDesk} / 2.0đ</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2.0"
                    step="0.25"
                    value={evalScores.boardAndDesk}
                    onChange={(e) =>
                      setEvalScores({ ...evalScores, boardAndDesk: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* Tiêu chí 2: Sàn lớp học */}
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>2. Sàn lớp học sạch rác, không cát bụi:</span>
                    <span className="text-emerald-700">{evalScores.floorClean} / 3.0đ</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3.0"
                    step="0.25"
                    value={evalScores.floorClean}
                    onChange={(e) =>
                      setEvalScores({ ...evalScores, floorClean: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* Tiêu chí 3: Hộc bàn & sắp xếp */}
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>3. Hộc bàn ngăn nắp, bàn ghế 5 dãy ngay ngắn:</span>
                    <span className="text-emerald-700">{evalScores.desksOrder} / 2.0đ</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2.0"
                    step="0.25"
                    value={evalScores.desksOrder}
                    onChange={(e) =>
                      setEvalScores({ ...evalScores, desksOrder: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* Tiêu chí 4: Đổ rác */}
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>4. Đổ rác ra xe gom trường đúng giờ:</span>
                    <span className="text-emerald-700">{evalScores.trashDisposal} / 1.5đ</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.25"
                    value={evalScores.trashDisposal}
                    onChange={(e) =>
                      setEvalScores({ ...evalScores, trashDisposal: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* Tiêu chí 5: Tắt quạt đèn & Cửa sổ */}
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>5. Tắt toàn bộ 6 quạt trần, đèn & then cài cửa:</span>
                    <span className="text-emerald-700">{evalScores.powerAndWindows} / 1.5đ</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.25"
                    value={evalScores.powerAndWindows}
                    onChange={(e) =>
                      setEvalScores({ ...evalScores, powerAndWindows: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              {/* Trạng thái hoàn thành */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Trạng thái hoàn thành:</label>
                <select
                  value={evalStatus}
                  onChange={(e) => setEvalStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                >
                  <option value="completed">✓ Hoàn thành rất tốt</option>
                  <option value="in_progress">⌛ Đang kiểm tra / Cần bổ sung thêm</option>
                  <option value="pending">⚠️ Chưa đạt - Cần nhắc nhở vệ sinh lại</option>
                </select>
              </div>

              {/* Nhận xét của Lớp phó Lao động */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nhận xét & Lời khen của Lớp phó Lao động:
                </label>
                <textarea
                  rows={2}
                  value={evalNote}
                  onChange={(e) => setEvalNote(e.target.value)}
                  placeholder="Ghi nhận xét: Bảng sạch sẽ, khen ngợi bạn Hải và Huy quét lớp kỹ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 leading-relaxed bg-white"
                  required
                />
              </div>

              {/* Tùy chọn cộng điểm thi đua tuần */}
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <input
                  type="checkbox"
                  id="syncBonus"
                  checked={syncBonusEmulation}
                  onChange={(e) => setSyncBonusEmulation(e.target.checked)}
                  className="rounded-md text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="syncBonus" className="font-bold text-emerald-950 cursor-pointer">
                  Tự động cộng +2 điểm thưởng vào Sổ thi đua tuần nếu đạt từ 9.5 điểm trở lên
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEvaluateModalOpen(false);
                    setEvaluatingDuty(null);
                  }}
                  className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" /> Lưu Điểm & Đánh Giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SEND REMINDER ANNOUNCEMENT */}
      {/* ========================================================================= */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Gửi Nhắc Nhở Vệ Sinh Lớp 12A7
                </h3>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReminder} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu đề thông báo:</label>
                <input
                  type="text"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung nhắc nhở:</label>
                <textarea
                  rows={4}
                  value={reminderContent}
                  onChange={(e) => setReminderContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 leading-relaxed bg-white"
                  required
                />
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-[11px] border border-amber-200">
                Thông báo sẽ được ghim lên đầu <strong>Bảng Tin & Báo Bài Lớp 12A7</strong> để 4 Tổ trưởng và các bạn trực nhật theo dõi.
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Bell className="w-4 h-4" /> Đăng Thông Báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EDIT STUDENT ASSIGNED AS LỚP PHÓ LAO ĐỘNG */}
      {/* ========================================================================= */}
      {isEditCadreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-auto">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-700 -mx-6 -mt-6 p-5 text-white flex items-center justify-between rounded-t-3xl mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Chỉnh Sửa Học Sinh Làm Lớp Phó Lao Động
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Chọn học sinh phụ trách phân công và chấm điểm trực nhật lớp 12A7
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditCadreModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLaborCadre} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-700 font-semibold block">
                    Lớp phó Lao động hiện tại:
                  </span>
                  <strong className="text-sm text-emerald-950">
                    {laborCadreStudent?.name || 'Đặng Nguyễn Kha'} ({laborCadreStudent?.code} • Tổ{' '}
                    {laborCadreStudent?.group})
                  </strong>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px]">
                  Đang phụ trách
                </span>
              </div>

              {/* Filter by Group & Search */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tìm tên / Mã HS:</label>
                  <input
                    type="text"
                    value={cadreSearchQuery}
                    onChange={(e) => setCadreSearchQuery(e.target.value)}
                    placeholder="Nhập tên học sinh..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lọc theo Tổ:</label>
                  <select
                    value={cadreGroupFilter}
                    onChange={(e) => setCadreGroupFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                  >
                    <option value="all">Tất cả 4 Tổ (50 HS)</option>
                    <option value="1">Tổ 1</option>
                    <option value="2">Tổ 2</option>
                    <option value="3">Tổ 3</option>
                    <option value="4">Tổ 4</option>
                  </select>
                </div>
              </div>

              {/* Student List Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Chọn học sinh làm Lớp phó Lao động ({filteredCadreCandidates.length} học sinh):
                </label>
                <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/50">
                  {filteredCadreCandidates.map((stu) => {
                    const isSelected = selectedCadreStudentId === stu.id;
                    const isCurrent = laborCadreStudent?.id === stu.id;
                    return (
                      <label
                        key={stu.id}
                        className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/90 text-emerald-950 font-bold'
                            : 'hover:bg-white text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="laborCadreStudent"
                            value={stu.id}
                            checked={isSelected}
                            onChange={() => setSelectedCadreStudentId(stu.id)}
                            className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <div>
                            <div className="text-xs font-bold flex items-center gap-1.5">
                              <span>
                                {stu.stt}. {stu.name}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-semibold">
                                Tổ {stu.group}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                                  Hiện tại
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Mã HS: {stu.code} • Chức vụ hiện tại: {stu.classRole || 'Học sinh'}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900 text-[11px] border border-blue-200">
                Khi lưu thay đổi, học sinh được chọn sẽ nhận quyền <strong>Lớp phó Lao động</strong> trên toàn hệ thống (phân công ca trực, chấm điểm 5 tiêu chí vệ sinh và đồng bộ trực tiếp với GVCN, Học sinh, Phụ huynh).
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditCadreModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" /> Lưu Lớp Phó Lao Động
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
