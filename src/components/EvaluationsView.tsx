import React, { useState, useMemo } from 'react';
import { useApp, getWeekRangeByIndex, sanitizeLegacyTeacherText } from '../context/AppContext';
import { getVietnamDateTimeStr, formatDateTimeVN } from '../utils/timeUtils';
import { EvaluationComment, Student } from '../types';
import {
  MessageSquare,
  Sparkles,
  Plus,
  Send,
  User,
  Heart,
  Calendar,
  X,
  Bot,
  CheckCircle2,
  FileSpreadsheet,
  Edit3,
  Trash2,
  Copy,
  Check,
  Phone,
  Search,
  Filter,
  ShieldCheck,
  ExternalLink,
  Award,
  Scale,
  MessageCircle,
} from 'lucide-react';
import { AccessGuard } from './AccessGuard';
import { ComprehensiveGradeImportModal } from './ComprehensiveGradeImportModal';
import { generateAITextWithFallback } from '../utils/aiClient';

export const EvaluationsView: React.FC = () => {
  const {
    role,
    isTeacherAuthenticated,
    students,
    activeStudentId,
    currentStudent,
    evaluations,
    addEvaluation,
    updateEvaluation,
    deleteEvaluation,
    sendEvaluationToParent,
    replyToEvaluationByParent,
    currentWeek,
    getStudentWeeklyScore,
  } = useApp();

  const currentWeekRange = getWeekRangeByIndex(currentWeek);

  // Filter states for Teacher
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterStudentId, setFilterStudentId] = useState<string>('all');

  // Create / Edit Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingEval, setEditingEval] = useState<EvaluationComment | null>(null);
  const [showGradeImportModal, setShowGradeImportModal] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Form states
  const [targetStudentId, setTargetStudentId] = useState<string>(students?.[0]?.id || '');
  const [periodType, setPeriodType] = useState<EvaluationComment['period']>('Tuần');
  const [periodLabel, setPeriodLabel] = useState<string>(
    `Tuần ${currentWeek} (${currentWeekRange.shortRangeLabel})`
  );
  const [academicText, setAcademicText] = useState('');
  const [awarenessText, setAwarenessText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [attitudeText, setAttitudeText] = useState('');
  const [strengthsText, setStrengthsText] = useState('');
  const [improvementsText, setImprovementsText] = useState('');
  const [teacherNoteText, setTeacherNoteText] = useState('');
  const [parentNoteText, setParentNoteText] = useState('');
  const [sendImmediatelyToParent, setSendImmediatelyToParent] = useState(true);

  // Copy / Send feedback states
  const [copiedEvalId, setCopiedEvalId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletingEvalId, setDeletingEvalId] = useState<string | null>(null);

  // Parent reply states
  const [parentReplyInputs, setParentReplyInputs] = useState<Record<string, string>>({});

  // Guard: Teacher must be authenticated with password when in teacher role
  if (role === 'teacher' && !isTeacherAuthenticated) {
    return <AccessGuard requiredRole="teacher" pageTitle="Quản lý Nhận xét Học sinh & Gửi Phụ huynh" />;
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getStudentById = (id: string): Student | undefined =>
    (students || []).find((s) => s.id === id);

  // Open Create Modal for a specific student or default
  const handleOpenCreateModal = (preselectedStudentId?: string) => {
    const stuId =
      preselectedStudentId ||
      (filterStudentId !== 'all' ? filterStudentId : students?.[0]?.id || '');
    const stu = getStudentById(stuId);
    const weeklyInfo = stu ? getStudentWeeklyScore(stu.id, currentWeek) : { total: 100 };

    setEditingEval(null);
    setTargetStudentId(stuId);
    setPeriodType('Tuần');
    setPeriodLabel(`Tuần ${currentWeek} (${currentWeekRange.shortRangeLabel})`);
    setAcademicText(
      stu
        ? `Duy trì điểm trung bình ${stu.currentGpa ?? 8.2}đ, nắm vững kiến thức trọng tâm và định hướng ôn thi ${stu.examSubject1 || 'Vật lý'} - ${stu.examSubject2 || 'Hóa học'} rõ ràng.`
        : ''
    );
    setAwarenessText(
      stu
        ? `Chấp hành nghiêm túc nội quy lớp 12A7, chuyên cần đạt ${stu.attendanceStats?.rate ?? 100}%, điểm thi đua tuần đạt ${weeklyInfo.total}/100đ.`
        : ''
    );
    setSkillsText('Kỹ năng giải bài tập trắc nghiệm, tự học và phối hợp nhóm tốt.');
    setAttitudeText('Lễ phép với thầy cô, hòa đồng và nhiệt tình hỗ trợ bạn bè trong tổ.');
    setStrengthsText(stu?.strengths || 'Chăm ngoan, tự giác, có tinh thần cầu tiến.');
    setImprovementsText(
      stu?.weaknesses || 'Cần duy trì sự tập trung và rèn thêm tốc độ giải đề nâng cao.'
    );
    setTeacherNoteText(
      stu
        ? `Thầy rất ghi nhận sự nỗ lực và ý thức học tập của em ${stu.name}. Năm lớp 12 là chặng đường quyết định, em hãy giữ vững phong độ để chinh phục mục tiêu "${stu.dreamCareer || 'Đỗ Đại học nguyện vọng 1'}" nhé! Thầy luôn tin tưởng và tự hào về em!`
        : ''
    );
    setParentNoteText(
      stu
        ? `Kính gửi Quý Phụ huynh (${stu.primaryParentName || 'Gia đình'}) em ${stu.name}, Thầy Trương Xuân Hòa (GVCN 12A7) xin thông báo: Trong ${`Tuần ${currentWeek} (${currentWeekRange.shortRangeLabel})`}, em đạt ${weeklyInfo.total}/100 điểm thi đua, chuyên cần ${stu.attendanceStats?.rate ?? 100}% và học tập nghiêm túc trên lớp. Mong gia đình tiếp tục đồng hành cùng thầy động viên, nhắc nhở em giữ gìn sức khỏe và ôn luyện đều đặn tại nhà.`
        : ''
    );
    setSendImmediatelyToParent(true);
    setShowModal(true);
  };

  // Update form template when teacher switches student inside Create Modal
  const handleSelectTargetStudentInModal = (newStuId: string) => {
    setTargetStudentId(newStuId);
    if (editingEval) return; // Don't overwrite if editing existing
    const stu = getStudentById(newStuId);
    if (!stu) return;
    const weeklyInfo = getStudentWeeklyScore(stu.id, currentWeek);
    setAcademicText(
      `Duy trì điểm trung bình ${stu.currentGpa ?? 8.2}đ, nắm vững kiến thức trọng tâm và định hướng ôn thi ${stu.examSubject1 || 'Vật lý'} - ${stu.examSubject2 || 'Hóa học'} rõ ràng.`
    );
    setAwarenessText(
      `Chấp hành nghiêm túc nội quy lớp 12A7, chuyên cần đạt ${stu.attendanceStats?.rate ?? 100}%, điểm thi đua tuần đạt ${weeklyInfo.total}/100đ.`
    );
    setStrengthsText(stu.strengths || 'Chăm ngoan, tự giác, có tinh thần cầu tiến.');
    setImprovementsText(
      stu.weaknesses || 'Cần duy trì sự tập trung và rèn thêm tốc độ giải đề nâng cao.'
    );
    setTeacherNoteText(
      `Thầy rất ghi nhận sự nỗ lực và ý thức học tập của em ${stu.name}. Năm lớp 12 là chặng đường quyết định, em hãy giữ vững phong độ để chinh phục mục tiêu "${stu.dreamCareer || 'Đỗ Đại học nguyện vọng 1'}" nhé! Thầy luôn tin tưởng và tự hào về em!`
    );
    setParentNoteText(
      `Kính gửi Quý Phụ huynh (${stu.primaryParentName || 'Gia đình'}) em ${stu.name}, Thầy Trương Xuân Hòa (GVCN 12A7) xin thông báo: Trong ${periodLabel}, em đạt ${weeklyInfo.total}/100 điểm thi đua, chuyên cần ${stu.attendanceStats?.rate ?? 100}% và học tập nghiêm túc trên lớp. Mong gia đình tiếp tục đồng hành cùng thầy động viên, nhắc nhở em giữ gìn sức khỏe và ôn luyện đều đặn tại nhà.`
    );
  };

  // Apply quick preset template (always using "Thầy")
  const handleApplyQuickTemplate = (
    templateType: 'excellent' | 'progress' | 'reminder' | 'exam_prep'
  ) => {
    const stu = getStudentById(targetStudentId);
    const stuName = stu?.name || 'em';
    const parentName = stu?.primaryParentName || 'Quý Phụ huynh';
    const weeklyScore = stu ? getStudentWeeklyScore(stu.id, currentWeek).total : 100;

    if (templateType === 'excellent') {
      setAcademicText(
        `Thành tích học tập nổi bật (ĐTB ${stu?.currentGpa ?? 8.8}đ), nắm chắc kiến thức nâng cao các môn thi tốt nghiệp ${stu?.examSubject1 || 'Lý'} - ${stu?.examSubject2 || 'Hóa'}.`
      );
      setAwarenessText(
        `Ý thức tự giác và kỷ luật xuất sắc, điểm thi đua đạt ${weeklyScore}/100đ, gương mẫu trong mọi hoạt động lớp 12A7.`
      );
      setTeacherNoteText(
        `Em ${stuName} là học sinh tiêu biểu của tập thể 12A7! Thầy rất tự hào về tinh thần tự học và sự gương mẫu của em. Hãy tiếp tục giữ vững phong độ để bứt phá điểm 9+ trong kỳ thi Tốt nghiệp THPT & Đại học 2027 nhé!`
      );
      setParentNoteText(
        `Kính gửi Quý Phụ huynh (${parentName}) em ${stuName}, Thầy Trương Xuân Hòa (GVCN 12A7) rất vui mừng thông báo em luôn dẫn đầu về ý thức rèn luyện (${weeklyScore}/100đ) và kết quả học tập trên lớp. Cảm ơn gia đình đã luôn quan tâm, đồng hành cùng thầy và nhà trường!`
      );
    } else if (templateType === 'progress') {
      setAcademicText(
        `Có nhiều cố gắng và tiến bộ rõ rệt trong giờ học, chủ động hoàn thành bài tập được giao.`
      );
      setAwarenessText(
        `Chuyên cần và nề nếp chuyển biến tích cực, điểm thi đua tuần đạt ${weeklyScore}/100đ.`
      );
      setTeacherNoteText(
        `Thầy ghi nhận và biểu dương sự nỗ lực tiến bộ của em ${stuName} trong thời gian qua. Chỉ cần em kiên trì từng ngày và chủ động hỏi bài thầy cùng các bạn, thầy tin chắc em sẽ đạt kết quả vượt mong đợi!`
      );
      setParentNoteText(
        `Kính gửi Quý Phụ huynh (${parentName}) em ${stuName}, Thầy Trương Xuân Hòa (GVCN 12A7) xin thông báo thời gian qua em đã có sự tiến bộ đáng khen về ý thức học tập và chuyên cần trên lớp. Nhờ gia đình tiếp tục khích lệ để em thêm tự tin và giữ vững đà tiến bộ này.`
      );
    } else if (templateType === 'reminder') {
      setAcademicText(
        `Cần tập trung cao hơn trong các tiết học trên lớp và hoàn thành đầy đủ bài tập về nhà trước khi đến lớp.`
      );
      setAwarenessText(
        `Điểm thi đua hiện tại: ${weeklyScore}/100đ. Cần chú ý đi học đúng giờ và chấp hành nghiêm nội quy lớp 12A7.`
      );
      setTeacherNoteText(
        `Thầy mong em ${stuName} chấn chỉnh lại thời gian biểu cá nhân, đi học đúng giờ và tập trung hơn vào việc học. Năm cuối cấp trôi qua rất nhanh, có phần nào chưa hiểu em hãy gặp trực tiếp thầy để thầy hỗ trợ ngay nhé!`
      );
      setParentNoteText(
        `Kính gửi Quý Phụ huynh (${parentName}) em ${stuName}, Thầy Trương Xuân Hòa (GVCN 12A7) trao đổi cùng gia đình: Tuần này điểm thi đua của em đạt ${weeklyScore}/100đ. Thầy rất mong Quý Phụ huynh phối hợp nhắc nhở em đi học đúng giờ, kiểm tra việc tự học buổi tối tại nhà để em theo kịp tiến độ ôn thi lớp 12.`
      );
    } else if (templateType === 'exam_prep') {
      setAcademicText(
        `Định hướng rõ tổ hợp môn thi (${stu?.examSubject1 || 'Vật lý'} - ${stu?.examSubject2 || 'Hóa học'}), tích cực luyện đề chuẩn bị cho kỳ thi Tốt nghiệp THPT 2027.`
      );
      setAwarenessText(
        `Tinh thần học tập nghiêm túc, chuyên cần ${stu?.attendanceStats?.rate ?? 100}%, điểm thi đua ${weeklyScore}/100đ.`
      );
      setTeacherNoteText(
        `Giai đoạn tăng tốc ôn thi Tốt nghiệp THPT & Đại học đang đến gần, thầy chúc em ${stuName} luôn giữ vững quyết tâm "Dream Big And Dare To Fail", phân bổ thời gian hợp lý và đạt trọn vẹn nguyện vọng "${stu?.dreamCareer || 'Đại học mơ ước'}"!`
      );
      setParentNoteText(
        `Kính gửi Quý Phụ huynh (${parentName}) em ${stuName}, Thầy Trương Xuân Hòa (GVCN 12A7) gửi thông tin định kỳ: Hiện tại em đang tập trung ôn luyện cho kỳ thi Tốt nghiệp THPT 2027 với mục tiêu "${stu?.dreamCareer || 'Đỗ Đại học'}". Mong gia đình tạo điều kiện thời gian và động viên tinh thần để em học tập đạt hiệu quả cao nhất.`
      );
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (ev: EvaluationComment) => {
    setEditingEval(ev);
    setTargetStudentId(ev.studentId);
    setPeriodType(ev.period);
    setPeriodLabel(ev.periodLabel);
    setAcademicText(ev.academic);
    setAwarenessText(ev.awareness);
    setSkillsText(ev.skills);
    setAttitudeText(ev.attitude);
    setStrengthsText(ev.strengths);
    setImprovementsText(ev.improvements);
    setTeacherNoteText(sanitizeLegacyTeacherText(ev.teacherNote));
    setParentNoteText(
      sanitizeLegacyTeacherText(ev.parentNote) ||
        `Kính gửi Quý Phụ huynh em ${ev.studentName}, Thầy Trương Xuân Hòa (GVCN 12A7) gửi phiếu nhận xét định kỳ (${ev.periodLabel}) của em. Mong gia đình tiếp tục đồng hành và động viên em trong năm học cuối cấp.`
    );
    setSendImmediatelyToParent(ev.sentToParent ?? true);
    setShowModal(true);
  };

  // AI Assist Comment generation (generates both Student Note & Parent Note with "Thầy")
  const handleGenerateAiComment = async () => {
    const stu = getStudentById(targetStudentId);
    if (!stu) return;

    const weeklyInfo = getStudentWeeklyScore(stu.id, currentWeek);
    setIsLoadingAi(true);
    try {
      const fallbackStudentNote = `Thầy rất ghi nhận tinh thần học tập nghiêm túc của em ${stu.name} trong giai đoạn ${periodLabel} (ĐTB: ${stu.currentGpa ?? 8.2}đ, Thi đua: ${weeklyInfo.total}/100đ). Em hãy tiếp tục phát huy điểm mạnh (${stu.strengths || 'chăm ngoan, cầu tiến'}) để chinh phục ước mơ "${stu.dreamCareer || 'Đỗ Đại học nguyện vọng 1'}" nhé! Thầy luôn tự hào về em!`;

      const aiText = await generateAITextWithFallback({
        endpoint: '/api/ai/comment',
        payload: {
          studentName: stu.name,
          parentName: stu.primaryParentName,
          gpa: stu.currentGpa,
          conduct: stu.currentConduct,
          weeklyScore: weeklyInfo.total,
          attendanceRate: stu.attendanceStats?.rate ?? 100,
          strengths: stu.strengths,
          weaknesses: stu.weaknesses,
          aspiration: stu.dreamCareer,
          examSubjects: `${stu.examSubject1 || 'Vật lý'} - ${stu.examSubject2 || 'Hóa học'}`,
          period: periodLabel,
        },
        clientPrompt: `Bạn là Thầy Trương Xuân Hòa (Nam giáo viên), GVCN lớp 12A7 THPT Vĩnh Lộc B. Tuyệt đối xưng "Thầy" (không xưng "Cô"). Hãy viết lời nhắn nhận xét định kỳ (${periodLabel}) thật tâm huyết gửi trực tiếp cho học sinh ${stu.name} (ĐTB: ${stu.currentGpa}, Điểm thi đua tuần: ${weeklyInfo.total}/100đ, Điểm mạnh: ${stu.strengths || 'Chăm ngoan'}, Ước mơ: ${stu.dreamCareer || 'Đỗ ĐH'}).`,
        fallbackText: fallbackStudentNote,
      });

      const cleanedAiText = sanitizeLegacyTeacherText(aiText || fallbackStudentNote);
      setTeacherNoteText(cleanedAiText);
      setAcademicText(
        `Tiếp thu bài tốt (ĐTB ${stu.currentGpa ?? 8.2}đ), tự giác ôn luyện tổ hợp môn thi tốt nghiệp ${stu.examSubject1 || 'Vật lý'} và ${stu.examSubject2 || 'Hóa học'}.`
      );
      setAwarenessText(
        `Chấp hành tốt nội quy nề nếp lớp 12A7, chuyên cần đạt ${stu.attendanceStats?.rate ?? 100}%, điểm thi đua đạt ${weeklyInfo.total}/100đ.`
      );
      setSkillsText('Làm việc nhóm, vận dụng công thức và tư duy giải đề tiến bộ.');
      setAttitudeText('Lễ phép với thầy cô, hòa nhã với bạn bè, tích cực trong hoạt động tập thể.');
      setStrengthsText(stu.strengths || 'Chăm chỉ, có trách nhiệm và mục tiêu rõ ràng.');
      setImprovementsText(
        stu.weaknesses || 'Cần phân bổ thời gian hợp lý và rèn tốc độ làm đề trắc nghiệm.'
      );
      setParentNoteText(
        `Kính gửi Quý Phụ huynh (${stu.primaryParentName || 'Gia đình'}) em ${stu.name}, Thầy Trương Xuân Hòa (GVCN 12A7) trân trọng thông báo: Trong kỳ ${periodLabel}, em đạt ${weeklyInfo.total}/100 điểm thi đua, tỷ lệ chuyên cần ${stu.attendanceStats?.rate ?? 100}% và duy trì ĐTB ${stu.currentGpa ?? 8.2}đ. Thầy rất mong gia đình tiếp tục đồng hành, động viên và nhắc nhở em giữ sức khỏe để ôn thi Tốt nghiệp THPT & Đại học 2027 đạt kết quả cao nhất.`
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = getStudentById(targetStudentId);
    if (!stu) return;

    const weeklyInfo = getStudentWeeklyScore(stu.id, currentWeek);
    const cleanedTeacherNote =
      sanitizeLegacyTeacherText(teacherNoteText.trim()) ||
      `Thầy chúc em ${stu.name} tiếp tục phát huy thế mạnh và đạt kết quả xuất sắc trong năm học cuối cấp 12A7!`;
    const cleanedParentNote =
      sanitizeLegacyTeacherText(parentNoteText.trim()) ||
      `Kính gửi Quý Phụ huynh (${stu.primaryParentName || 'Gia đình'}) em ${stu.name}, Thầy Trương Xuân Hòa (GVCN 12A7) trân trọng gửi phiếu nhận xét định kỳ (${periodLabel}) của em. Mong gia đình tiếp tục phối hợp cùng thầy động viên em học tập tốt.`;

    if (editingEval) {
      const nowDateTime = getVietnamDateTimeStr();
      updateEvaluation({
        ...editingEval,
        studentId: stu.id,
        studentName: stu.name,
        period: periodType,
        periodLabel: periodLabel.trim() || `Tuần ${currentWeek}`,
        academic: academicText.trim() || 'Học tập chăm chỉ, hoàn thành tốt nhiệm vụ.',
        awareness: awarenessText.trim() || 'Ý thức kỷ luật tốt, đi học đúng giờ.',
        skills: skillsText.trim() || 'Kỹ năng làm bài trắc nghiệm và tự học tốt.',
        attitude: attitudeText.trim() || 'Lễ phép, tích cực, đoàn kết.',
        strengths: strengthsText.trim() || stu.strengths || 'Chăm ngoan, nỗ lực.',
        improvements: improvementsText.trim() || stu.weaknesses || 'Rèn luyện thêm tốc độ giải đề.',
        teacherNote: cleanedTeacherNote,
        parentNote: cleanedParentNote,
        sentToParent: sendImmediatelyToParent,
        sentToParentAt: sendImmediatelyToParent
          ? editingEval.sentToParentAt || nowDateTime
          : editingEval.sentToParentAt,
        weeklyEmulationScore: weeklyInfo.total,
        gpaSnapshot: stu.currentGpa,
        attendanceRateSnapshot: stu.attendanceStats?.rate ?? 100,
      });
      showToast(
        `Đã cập nhật nhận xét của Thầy Hòa cho em ${stu.name}${
          sendImmediatelyToParent ? ' và đồng bộ tới Phụ huynh!' : '!'
        }`
      );
    } else {
      addEvaluation({
        studentId: stu.id,
        studentName: stu.name,
        period: periodType,
        periodLabel: periodLabel.trim() || `Tuần ${currentWeek}`,
        academic: academicText.trim() || 'Học tập chăm chỉ, hoàn thành tốt nhiệm vụ.',
        awareness: awarenessText.trim() || 'Ý thức kỷ luật tốt, đi học đúng giờ.',
        skills: skillsText.trim() || 'Kỹ năng làm bài trắc nghiệm và tự học tốt.',
        attitude: attitudeText.trim() || 'Lễ phép, tích cực, đoàn kết.',
        strengths: strengthsText.trim() || stu.strengths || 'Chăm ngoan, nỗ lực.',
        improvements: improvementsText.trim() || stu.weaknesses || 'Rèn luyện thêm tốc độ giải đề.',
        teacherNote: cleanedTeacherNote,
        parentNote: cleanedParentNote,
        sentToParent: sendImmediatelyToParent,
        weeklyEmulationScore: weeklyInfo.total,
        gpaSnapshot: stu.currentGpa,
        attendanceRateSnapshot: stu.attendanceStats?.rate ?? 100,
      });
      showToast(
        `Đã tạo nhận xét của Thầy Hòa cho em ${stu.name}${
          sendImmediatelyToParent ? ' và gửi tới Sổ liên lạc Phụ huynh!' : '!'
        }`
      );
    }

    setShowModal(false);
    setEditingEval(null);
  };

  // Build formatted message to send to Parent via Zalo / SMS
  const buildParentZaloMessage = (ev: EvaluationComment, stu?: Student): string => {
    const parentName = stu?.primaryParentName || 'Quý Phụ huynh';
    const weeklyScore =
      ev.weeklyEmulationScore ??
      (stu ? getStudentWeeklyScore(stu.id, currentWeek).total : 100);
    const gpa = ev.gpaSnapshot ?? stu?.currentGpa ?? 8.2;
    const attRate = ev.attendanceRateSnapshot ?? stu?.attendanceStats?.rate ?? 100;

    return `📋 PHIẾU NHẬN XÉT HỌC SINH LỚP 12A7 - THPT VĨNH LỘC B
• Kỳ đánh giá: ${ev.periodLabel}
• Học sinh: ${ev.studentName} (${stu?.code || ''} - Tổ ${stu?.group || ''})
• Kính gửi Phụ huynh: ${parentName} (${stu?.primaryParentPhone || ''})
----------------------------------
📊 KẾT QUẢ RÈN LUYỆN & HỌC TẬP:
- Điểm thi đua tuần: ${weeklyScore}/100 điểm
- Tỷ lệ chuyên cần: ${attRate}% | ĐTB hiện tại: ${gpa}đ
- Học tập & Kỹ năng: ${ev.academic}
- Ý thức & Thái độ: ${ev.awareness} • ${ev.attitude}
- Điểm mạnh: ${ev.strengths}
- Cần phát huy thêm: ${ev.improvements}

💌 LỜI NHẮN CỦA THẦY HÒA VỚI EM ${ev.studentName.toUpperCase()}:
"${sanitizeLegacyTeacherText(ev.teacherNote)}"

🤝 THÔNG ĐIỆP THẦY HÒA GỬI QUÝ PHỤ HUYNH:
"${sanitizeLegacyTeacherText(ev.parentNote) || `Mong gia đình tiếp tục đồng hành cùng thầy động viên em ${ev.studentName} giữ vững tinh thần học tập tốt.`}"
----------------------------------
Trân trọng,
Thầy Trương Xuân Hòa - GVCN Lớp 12A7`;
  };

  const handleCopyForParentZalo = (ev: EvaluationComment, stu?: Student) => {
    const msg = buildParentZaloMessage(ev, stu);
    navigator.clipboard.writeText(msg);
    if (!ev.sentToParent) {
      sendEvaluationToParent(ev.id, ev.parentNote);
    }
    setCopiedEvalId(ev.id);
    showToast(
      `Đã sao chép phiếu nhận xét của em ${ev.studentName} để gửi Zalo/SMS cho Phụ huynh (${stu?.primaryParentName || 'PH'})!`
    );
    setTimeout(() => setCopiedEvalId(null), 2500);
  };

  const handleSendToParentViaZaloLink = (ev: EvaluationComment, stu?: Student) => {
    const msg = buildParentZaloMessage(ev, stu);
    navigator.clipboard.writeText(msg);
    sendEvaluationToParent(ev.id, ev.parentNote);
    const rawPhone = (stu?.primaryParentPhone || '').replace(/\D/g, '');
    showToast(
      `Đã sao chép nội dung nhận xét và đánh dấu Đã gửi PH! ${
        rawPhone ? `SĐT Zalo Phụ huynh: ${stu?.primaryParentPhone}` : ''
      }`
    );
  };

  const handleParentReplySubmit = (evId: string) => {
    const replyText = (parentReplyInputs[evId] || '').trim();
    if (!replyText) return;
    replyToEvaluationByParent(evId, replyText);
    setParentReplyInputs((prev) => ({ ...prev, [evId]: '' }));
    showToast('Đã gửi phản hồi của Phụ huynh tới Thầy Trương Xuân Hòa (GVCN)!');
  };

  // Filtered evaluations:
  // - Student or Parent: strictly ONLY evaluations for activeStudentId
  // - Teacher: filter by search, group, student, period
  const displayedEvaluations = useMemo(() => {
    const allList = evaluations || [];
    if (role !== 'teacher') {
      return allList.filter((e) => e.studentId === activeStudentId);
    }

    return allList.filter((ev) => {
      const stu = getStudentById(ev.studentId);
      if (filterStudentId !== 'all' && ev.studentId !== filterStudentId) return false;
      if (filterGroup !== 'all' && String(stu?.group) !== filterGroup) return false;
      if (filterPeriod !== 'all' && ev.period !== filterPeriod) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = ev.studentName.toLowerCase().includes(q);
        const matchCode = (stu?.code || '').toLowerCase().includes(q);
        const matchParent = (stu?.primaryParentName || '').toLowerCase().includes(q);
        const matchPhone = (stu?.primaryParentPhone || '').toLowerCase().includes(q);
        const matchNote =
          (ev.teacherNote || '').toLowerCase().includes(q) ||
          (ev.parentNote || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchParent && !matchPhone && !matchNote) {
          return false;
        }
      }
      return true;
    });
  }, [evaluations, role, activeStudentId, filterStudentId, filterGroup, filterPeriod, searchQuery, students]);

  const sentToParentCount = (evaluations || []).filter((e) => e.sentToParent).length;
  const parentRepliedCount = (evaluations || []).filter((e) => e.parentReply).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-500 flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-auto text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-900 p-5 sm:p-7 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-bold mb-2.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>
                GVCN: THẦY TRƯƠNG XUÂN HÒA • SỔ LIÊN LẠC & NHẬN XÉT 12A7
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {role === 'teacher'
                ? 'Nhận Xét Học Sinh & Gửi Thông Điệp Phụ Huynh 12A7'
                : role === 'student'
                ? `Nhận Xét Của Thầy Trương Xuân Hòa Dành Cho Em ${currentStudent?.name || ''}`
                : `Phiếu Nhận Xét Từ Thầy Trương Xuân Hòa Gửi Phụ Huynh Em ${currentStudent?.name || ''}`}
            </h1>
            <p className="mt-1.5 text-blue-100 text-xs sm:text-sm leading-relaxed">
              {role === 'teacher'
                ? 'Ghi nhận toàn diện về Học tập, Ý thức, Điểm thi đua tuần (100đ) kèm lời nhắn của Thầy Hòa gửi riêng từng Học sinh (xưng Thầy - em) và gửi Phụ huynh qua App / Zalo.'
                : role === 'student'
                ? 'Chế độ Chỉ xem: Nơi lưu giữ những lời nhận xét, động viên và định hướng ôn thi Tốt nghiệp THPT & Đại học của Thầy Trương Xuân Hòa gửi riêng cho em.'
                : `Kênh thông tin liên lạc chính thức từ Thầy Trương Xuân Hòa (GVCN 12A7) gửi tới Quý Phụ huynh (${currentStudent?.primaryParentName || 'Gia đình'}). Quý Phụ huynh có thể xem nhận xét và gửi phản hồi trực tiếp cho Thầy Hòa.`}
            </p>
          </div>

          {role === 'teacher' ? (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setShowGradeImportModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>Nhập bảng điểm Excel</span>
              </button>
              <button
                onClick={() => handleOpenCreateModal()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Viết Nhận Xét HS & Gửi PH</span>
              </button>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-xs space-y-1 shrink-0">
              <div className="text-blue-200 font-medium">
                {role === 'student' ? 'Quyền truy cập của Học sinh:' : 'Sổ liên lạc Phụ huynh:'}
              </div>
              <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {role === 'student'
                  ? 'Chỉ xem nhận xét của bản thân'
                  : `PH em ${currentStudent?.name} (Xem & Phản hồi Thầy Hòa)`}
              </div>
            </div>
          )}
        </div>

        {/* Summary Metrics Bar for Teacher */}
        {role === 'teacher' && (
          <div className="relative z-10 mt-5 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-xl px-3.5 py-2.5 border border-white/10">
              <div className="text-[11px] text-blue-200">Tổng phiếu nhận xét</div>
              <div className="text-lg font-black text-white">{evaluations.length} phiếu</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3.5 py-2.5 border border-white/10">
              <div className="text-[11px] text-emerald-200">Đã gửi Phụ huynh</div>
              <div className="text-lg font-black text-emerald-300">
                {sentToParentCount} / {evaluations.length} phiếu
              </div>
            </div>
            <div className="bg-white/10 rounded-xl px-3.5 py-2.5 border border-white/10">
              <div className="text-[11px] text-amber-200">Phản hồi từ Phụ huynh</div>
              <div className="text-lg font-black text-amber-300">{parentRepliedCount} phản hồi</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3.5 py-2.5 border border-white/10">
              <div className="text-[11px] text-purple-200">Tuần thi đua hiện tại</div>
              <div className="text-sm font-black text-white truncate">
                Tuần {currentWeek} ({currentWeekRange.shortRangeLabel})
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Teacher Filter & Quick Student Selector Bar */}
      {role === 'teacher' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên HS, mã số, tên PH, SĐT..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter by Student */}
            <div>
              <select
                value={filterStudentId}
                onChange={(e) => setFilterStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">👤 Tất cả học sinh ({students.length} HS)</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.stt}. {s.name} (Tổ {s.group} • PH: {s.primaryParentName})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Group */}
            <div>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">👥 Tất cả 4 Tổ</option>
                <option value="1">Tổ 1</option>
                <option value="2">Tổ 2</option>
                <option value="3">Tổ 3</option>
                <option value="4">Tổ 4</option>
              </select>
            </div>

            {/* Filter by Period */}
            <div className="flex items-center gap-2">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">📅 Tất cả kỳ đánh giá</option>
                <option value="Tuần">Đánh giá theo Tuần</option>
                <option value="Tháng">Đánh giá theo Tháng</option>
                <option value="Học kỳ I">Học kỳ I</option>
                <option value="Học kỳ II">Học kỳ II</option>
              </select>

              {filterStudentId !== 'all' && (
                <button
                  onClick={() => handleOpenCreateModal(filterStudentId)}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Viết cho HS này
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {displayedEvaluations.map((ev) => {
          const stu = getStudentById(ev.studentId);
          const weeklyScore =
            ev.weeklyEmulationScore ??
            (stu ? getStudentWeeklyScore(stu.id, currentWeek).total : 100);
          const gpaVal = ev.gpaSnapshot ?? stu?.currentGpa ?? 8.2;
          const attRateVal = ev.attendanceRateSnapshot ?? stu?.attendanceStats?.rate ?? 100;
          const cleanedStudentNote = sanitizeLegacyTeacherText(ev.teacherNote);
          const cleanedParentNote = sanitizeLegacyTeacherText(ev.parentNote);

          return (
            <div
              key={ev.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                {/* Card Header: Student Info & Period Badge */}
                <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    {stu?.avatar ? (
                      <img
                        src={stu.avatar}
                        alt={ev.studentName}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                        {ev.studentName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                          {ev.studentName}
                        </h3>
                        {stu?.classRole && stu.classRole !== 'Học sinh' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {stu.classRole}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span>{stu?.code || ev.studentId}</span>
                        <span>•</span>
                        <span>Tổ {stu?.group || 1}</span>
                        {stu?.primaryParentName && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600 font-semibold">
                              PH: {stu.primaryParentName} ({stu.primaryParentPhone})
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold">
                      {ev.periodLabel}
                    </span>
                    {ev.sentToParent ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đã gửi Phụ huynh
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        Chưa gửi PH
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Snapshot Badges (Emulation 100pts, GPA, Attendance) */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/80">
                    <span className="text-[10px] text-amber-800 font-semibold block">
                      Điểm thi đua tuần
                    </span>
                    <span className="text-xs sm:text-sm font-black text-amber-700">
                      {weeklyScore} / 100đ
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200/80">
                    <span className="text-[10px] text-blue-800 font-semibold block">
                      Điểm trung bình
                    </span>
                    <span className="text-xs sm:text-sm font-black text-blue-700">{gpaVal}đ</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                    <span className="text-[10px] text-emerald-800 font-semibold block">
                      Chuyên cần
                    </span>
                    <span className="text-xs sm:text-sm font-black text-emerald-700">
                      {attRateVal}%
                    </span>
                  </div>
                </div>

                {/* Delete Confirmation Banner for Teacher */}
                {role === 'teacher' && deletingEvalId === ev.id && (
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-red-800">
                      Xác nhận xóa phiếu nhận xét kỳ "{ev.periodLabel}" của em {ev.studentName}?
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setDeletingEvalId(null)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          deleteEvaluation(ev.id);
                          setDeletingEvalId(null);
                          showToast(`Đã xóa phiếu nhận xét của em ${ev.studentName}.`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold"
                      >
                        Xóa ngay
                      </button>
                    </div>
                  </div>
                )}

                {/* Detailed Criteria */}
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-900 font-bold block mb-0.5">
                      📚 Học tập & Kỹ năng:
                    </strong>
                    <span>{ev.academic}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-900 font-bold block mb-0.5">
                      🌱 Ý thức & Thái độ rèn luyện:
                    </strong>
                    <span>
                      {ev.awareness} • {ev.attitude}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <strong className="text-emerald-900 font-bold block mb-0.5">
                        🌟 Điểm mạnh đáng khen:
                      </strong>
                      <span className="text-emerald-800">{ev.strengths}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-100">
                      <strong className="text-orange-900 font-bold block mb-0.5">
                        💡 Điểm cần phát huy thêm:
                      </strong>
                      <span className="text-orange-800">{ev.improvements}</span>
                    </div>
                  </div>

                  {/* 1. Lời nhắn từ GVCN Thầy Trương Xuân Hòa gửi Học sinh */}
                  {cleanedStudentNote && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950">
                      <strong className="text-blue-900 font-extrabold flex items-center gap-1.5 mb-1">
                        <span>💌 Nhận xét của Thầy Trương Xuân Hòa (GVCN) với em {ev.studentName}:</span>
                      </strong>
                      <p className="whitespace-pre-line leading-relaxed italic">
                        "{cleanedStudentNote}"
                      </p>
                    </div>
                  )}

                  {/* 2. Thông điệp từ GVCN Thầy Trương Xuân Hòa gửi Phụ huynh */}
                  {(cleanedParentNote || role === 'parent' || role === 'teacher') && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <strong className="text-amber-900 font-extrabold flex items-center gap-1.5">
                          <span>
                            🤝 Thông điệp Thầy Trương Xuân Hòa gửi Quý Phụ huynh (
                            {stu?.primaryParentName || 'Gia đình'}):
                          </span>
                        </strong>
                        {ev.sentToParentAt && (
                          <span className="text-[10px] text-amber-700 font-semibold shrink-0">
                            Gửi lúc: {formatDateTimeVN(ev.sentToParentAt)}
                          </span>
                        )}
                      </div>
                      <p className="whitespace-pre-line leading-relaxed">
                        {cleanedParentNote ||
                          `Kính gửi Quý Phụ huynh em ${ev.studentName}, Thầy Trương Xuân Hòa (GVCN 12A7) trân trọng gửi phiếu nhận xét định kỳ của em. Rất mong gia đình tiếp tục đồng hành cùng thầy động viên em học tập tốt.`}
                      </p>
                    </div>
                  )}

                  {/* 3. Phản hồi từ Phụ huynh gửi lại Thầy Trương Xuân Hòa */}
                  {ev.parentReply && (
                    <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-emerald-900 font-bold flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            Phản hồi từ Phụ huynh ({stu?.primaryParentName || 'Gia đình'}) gửi Thầy Hòa:
                          </span>
                        </strong>
                        {ev.parentRepliedAt && (
                          <span className="text-[10px] text-emerald-700">{formatDateTimeVN(ev.parentRepliedAt)}</span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-900 whitespace-pre-line">{ev.parentReply}</p>
                    </div>
                  )}

                  {/* Input cho Phụ huynh gửi phản hồi trực tiếp cho Thầy Hòa */}
                  {role === 'parent' && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        💬 Gửi ý kiến phản hồi của Phụ huynh tới Thầy Trương Xuân Hòa (GVCN):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={parentReplyInputs[ev.id] || ''}
                          onChange={(e) =>
                            setParentReplyInputs((prev) => ({
                              ...prev,
                              [ev.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleParentReplySubmit(ev.id);
                          }}
                          placeholder="VD: Gia đình đã xem nhận xét, cảm ơn Thầy Hòa đã sát sao nhắc nhở cháu..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleParentReplySubmit(ev.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Gửi Thầy Hòa</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer & Teacher Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                {role === 'teacher' && (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Copy message for Zalo / SMS Parent */}
                      <button
                        type="button"
                        onClick={() => handleCopyForParentZalo(ev, stu)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedEvalId === ev.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Đã sao chép gửi PH!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép gửi Zalo / SMS PH</span>
                          </>
                        )}
                      </button>

                      {/* Mark as Sent / Update Parent Portal */}
                      <button
                        type="button"
                        onClick={() => handleSendToParentViaZaloLink(ev, stu)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {ev.sentToParent ? 'Gửi lại thông báo PH' : 'Gửi phiếu tới Phụ huynh'}
                        </span>
                      </button>
                    </div>

                    {/* Edit & Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(ev)}
                        title="Chỉnh sửa nhận xét HS & thông điệp gửi PH"
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingEvalId(ev.id)}
                        title="Xóa phiếu nhận xét"
                        className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Ngày đánh giá: {ev.createdAt}
                    {ev.updatedAt ? ` (Cập nhật: ${ev.updatedAt})` : ''}
                  </span>
                  <span className="font-bold text-slate-600">
                    GVCN: Thầy Trương Xuân Hòa • 12A7
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayedEvaluations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">
            {role === 'teacher'
              ? 'Chưa có phiếu nhận xét nào khớp với bộ lọc hiện tại'
              : `Hiện chưa có phiếu nhận xét mới từ Thầy Trương Xuân Hòa cho ${
                  role === 'student' ? 'em' : `em ${currentStudent?.name}`
                }`}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {role === 'teacher'
              ? 'Nhấn nút "Viết Nhận Xét HS & Gửi PH" bên dưới để tạo nhận xét cá nhân hóa cho học sinh và gửi thông báo tới Phụ huynh.'
              : 'Thầy Trương Xuân Hòa (GVCN 12A7) sẽ cập nhật nhận xét định kỳ hằng tuần và hằng tháng tại đây.'}
          </p>
          {role === 'teacher' && (
            <button
              onClick={() =>
                handleOpenCreateModal(filterStudentId !== 'all' ? filterStudentId : undefined)
              }
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Viết nhận xét mới ngay
            </button>
          )}
        </div>
      )}

      {/* CREATE / EDIT EVALUATION MODAL (TEACHER ONLY) */}
      {showModal && role === 'teacher' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {editingEval
                      ? `Chỉnh Sửa Nhận Xét: ${editingEval.studentName}`
                      : 'Viết Nhận Xét Học Sinh & Gửi Phụ Huynh (GVCN: Thầy Trương Xuân Hòa)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Xưng hô chuẩn: Thầy Trương Xuân Hòa gửi Học sinh (Thầy - em) & gửi Quý Phụ huynh (Thầy - Gia đình)
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingEval(null);
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              {/* Row 1: Student & Period */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Chọn học sinh ({students.length} HS lớp 12A7) *
                  </label>
                  <select
                    value={targetStudentId}
                    onChange={(e) => handleSelectTargetStudentInModal(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 bg-slate-50/60"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.stt}. {s.name} ({s.code} • Tổ {s.group} • PH: {s.primaryParentName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Loại kỳ đánh giá</label>
                  <select
                    value={periodType}
                    onChange={(e) => {
                      const nextType = e.target.value as EvaluationComment['period'];
                      setPeriodType(nextType);
                      if (nextType === 'Tuần') {
                        setPeriodLabel(`Tuần ${currentWeek} (${currentWeekRange.shortRangeLabel})`);
                      } else if (nextType === 'Tháng') {
                        setPeriodLabel('Tháng 10/2026');
                      } else {
                        setPeriodLabel(`${nextType} (2026 - 2027)`);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="Tuần">Đánh giá Tuần</option>
                    <option value="Tháng">Đánh giá Tháng</option>
                    <option value="Học kỳ I">Học kỳ I</option>
                    <option value="Học kỳ II">Học kỳ II</option>
                  </select>
                </div>
              </div>

              {/* Selected Student Quick Info Bar */}
              {(() => {
                const selectedStu = getStudentById(targetStudentId);
                if (!selectedStu) return null;
                const wkScore = getStudentWeeklyScore(selectedStu.id, currentWeek).total;
                return (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                    <div>
                      <strong>Học sinh:</strong> {selectedStu.name} (Tổ {selectedStu.group}) •{' '}
                      <strong>Thi đua tuần:</strong>{' '}
                      <span className="text-amber-700 font-bold">{wkScore}/100đ</span> •{' '}
                      <strong>ĐTB:</strong>{' '}
                      <span className="text-blue-700 font-bold">{selectedStu.currentGpa}đ</span>
                    </div>
                    <div>
                      <strong>Phụ huynh:</strong> {selectedStu.primaryParentName} (
                      <span className="text-emerald-700 font-bold">
                        {selectedStu.primaryParentPhone}
                      </span>
                      )
                    </div>
                  </div>
                );
              })()}

              {/* Period Label & Quick Templates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nhãn kỳ nhận xét hiển thị *
                  </label>
                  <input
                    type="text"
                    required
                    value={periodLabel}
                    onChange={(e) => setPeriodLabel(e.target.value)}
                    placeholder="VD: Tuần 6 (26/10 - 30/10) hoặc Tháng 10/2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mẫu nhận xét nhanh (Xưng Thầy):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyQuickTemplate('excellent')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] cursor-pointer"
                    >
                      🌟 Khen xuất sắc
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickTemplate('progress')}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-[11px] cursor-pointer"
                    >
                      📈 Khích lệ tiến bộ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickTemplate('reminder')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] cursor-pointer"
                    >
                      🔔 Nhắc chuyên cần
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickTemplate('exam_prep')}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[11px] cursor-pointer"
                    >
                      🎯 Động viên ôn thi ĐH
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Auto-generate button */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Bot className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <div className="font-bold text-purple-950">
                      AI Trợ lý Thầy Trương Xuân Hòa (Gemini)
                    </div>
                    <div className="text-[11px] text-purple-700">
                      Tự động soạn nhận xét gửi Học sinh (xưng Thầy - em) và thông điệp gửi Phụ huynh (xưng Thầy - Gia đình).
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAiComment}
                  disabled={isLoadingAi}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isLoadingAi ? 'Đang soạn nhận xét...' : 'AI Gợi ý nhận xét HS & PH'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    📚 Học tập & Kiến thức
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Đánh giá mức độ tiếp thu, điểm số các môn thi tốt nghiệp..."
                    value={academicText}
                    onChange={(e) => setAcademicText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    🌱 Ý thức, Chuyên cần & Điểm thi đua
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Chấp hành nội quy, chuyên cần, điểm thi đua tuần..."
                    value={awarenessText}
                    onChange={(e) => setAwarenessText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    🌟 Điểm mạnh đáng khen
                  </label>
                  <input
                    type="text"
                    value={strengthsText}
                    onChange={(e) => setStrengthsText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    💡 Điểm cần cải thiện / phát huy
                  </label>
                  <input
                    type="text"
                    value={improvementsText}
                    onChange={(e) => setImprovementsText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Teacher Note to Student */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1.5">
                <label className="font-extrabold text-blue-950 block">
                  💌 1. Nhận xét & Lời động viên của Thầy Trương Xuân Hòa gửi Học sinh (xưng Thầy - em) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Lời động viên cuối cấp, nhắc nhở định hướng đại học từ Thầy Hòa gửi em..."
                  value={teacherNoteText}
                  onChange={(e) => setTeacherNoteText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Teacher Note to Parent */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-extrabold text-amber-950 block">
                    🤝 2. Thông điệp của Thầy Trương Xuân Hòa gửi Quý Phụ huynh (xưng Thầy - Quý Phụ huynh) *
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendImmediatelyToParent}
                      onChange={(e) => setSendImmediatelyToParent(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Gửi ngay tới Sổ liên lạc Phụ huynh</span>
                  </label>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Thông điệp phối hợp giữa Thầy Trương Xuân Hòa và Gia đình..."
                  value={parentNoteText}
                  onChange={(e) => setParentNoteText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEval(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {editingEval
                      ? 'Lưu cập nhật & Đồng bộ PH'
                      : sendImmediatelyToParent
                      ? 'Lưu Nhận Xét & Gửi Phụ Huynh'
                      : 'Lưu Nhận Xét'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive 10-Subject Grade Import Modal */}
      <ComprehensiveGradeImportModal
        isOpen={showGradeImportModal}
        onClose={() => setShowGradeImportModal(false)}
      />
    </div>
  );
};
