import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EvaluationComment, Student } from '../types';
import {
  MessageSquare,
  Sparkles,
  Plus,
  Send,
  User,
  Heart,
  TrendingUp,
  Calendar,
  X,
  Bot,
  CheckCircle2,
  FileSpreadsheet,
  Camera,
  Upload,
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
  } = useApp();

  // Guard: Student cannot access teacher evaluation management
  if (role === 'student') {
    return <AccessGuard requiredRole="parent" pageTitle="Nhận xét từ GVCN & Sổ Liên Lạc" />;
  }

  // Guard: Teacher must be authenticated with password
  if (role === 'teacher' && !isTeacherAuthenticated) {
    return <AccessGuard requiredRole="teacher" pageTitle="Quản lý Nhận xét Học sinh" />;
  }

  const [selectedPeriod, setSelectedPeriod] = useState<'Tuần' | 'Tháng' | 'Học kỳ I'>('Tháng');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(activeStudentId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGradeImportModal, setShowGradeImportModal] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Form states
  const [targetStudentId, setTargetStudentId] = useState<string>(students?.[0]?.id || '');
  const [periodLabel, setPeriodLabel] = useState('Tháng 10/2026');
  const [academicText, setAcademicText] = useState('');
  const [awarenessText, setAwarenessText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [attitudeText, setAttitudeText] = useState('');
  const [strengthsText, setStrengthsText] = useState('');
  const [improvementsText, setImprovementsText] = useState('');
  const [teacherNoteText, setTeacherNoteText] = useState('');

  // AI Assist Comment generation
  const handleGenerateAiComment = async () => {
    const stu = (students || []).find((s) => s.id === targetStudentId);
    if (!stu) return;

    setIsLoadingAi(true);
    try {
      const fallbackComment = `Em ${stu.name} trong giai đoạn ${periodLabel} luôn thể hiện tinh thần học tập nghiêm túc, duy trì điểm trung bình ${stu.currentGpa ?? 8.0}đ và chấp hành tốt nội quy lớp 12A7. Chúc em giữ vững quyết tâm đạt mục tiêu "${stu.dreamCareer || 'Đỗ Đại học'}"!`;
      const aiText = await generateAITextWithFallback({
        endpoint: '/api/ai/comment',
        payload: {
          studentName: stu.name,
          gpa: stu.currentGpa,
          conduct: stu.currentConduct,
          strengths: stu.strengths,
          weaknesses: stu.weaknesses,
          aspiration: stu.dreamCareer,
          period: periodLabel,
        },
        clientPrompt: `Bạn là thầy Trương Xuân Hòa, GVCN lớp 12A7 THPT Vĩnh Lộc B. Viết lời nhắn nhận xét định kỳ (${periodLabel}) cho học sinh ${stu.name} (ĐTB: ${stu.currentGpa}, Điểm mạnh: ${stu.strengths || 'Chăm ngoan'}, Ước mơ: ${stu.dreamCareer || 'Đỗ ĐH'}).`,
        fallbackText: fallbackComment,
      });

      if (aiText) {
        setTeacherNoteText(aiText);
        setAcademicText(`Tiếp thu bài nhanh, tự giác cao, định hướng thi tốt nghiệp môn ${stu.examSubject1 || 'Hóa'} và ${stu.examSubject2 || 'Anh'} rõ ràng.`);
        setAwarenessText(`Chấp hành tốt nội quy nề nếp lớp 12A7, chuyên cần đạt ${stu.attendanceStats?.rate ?? 100}%.`);
        setSkillsText(`Làm việc nhóm và tư duy giải đề tiến bộ.`);
        setAttitudeText(`Ngoan ngoãn, hòa nhã với bạn bè, tích cực trong phong trào.`);
        setStrengthsText(stu.strengths || 'Chăm chỉ, trách nhiệm');
        setImprovementsText(stu.weaknesses || 'Cần chủ động tự tin hơn khi nói trước tập thể');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = (students || []).find((s) => s.id === targetStudentId);
    if (!stu) return;

    addEvaluation({
      studentId: stu.id,
      studentName: stu.name,
      period: selectedPeriod as any,
      periodLabel,
      academic: academicText || 'Học tập chăm chỉ, hoàn thành tốt nhiệm vụ.',
      awareness: awarenessText || 'Ý thức kỷ luật tốt, đi học đúng giờ.',
      skills: skillsText || 'Kỹ năng làm bài trắc nghiệm và tự học tốt.',
      attitude: attitudeText || 'Lễ phép, tích cực, đoàn kết.',
      strengths: strengthsText || stu.strengths || 'Chăm ngoan, nỗ lực.',
      improvements: improvementsText || stu.weaknesses || 'Rèn luyện thêm kỹ năng giao tiếp.',
      teacherNote: teacherNoteText || 'Chúc em tiếp tục phát huy để đạt kết quả xuất sắc trong năm học cuối cấp!',
    });

    setShowCreateModal(false);
  };

  // Filter evaluations to show:
  // If role is student or parent: show only for active student
  // If teacher: show all or filter by selected student
  const displayedEvaluations =
    role !== 'teacher'
      ? (evaluations || []).filter((e) => e.studentId === activeStudentId)
      : evaluations || [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Nhận xét & Đánh giá học sinh định kỳ 12A7
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận toàn diện về Học tập, Ý thức, Kỹ năng, Thái độ và Định hướng • Tích hợp AI gợi ý nhận xét truyền cảm hứng
          </p>
        </div>

        {role === 'teacher' && (
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowGradeImportModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" /> Nhập bảng điểm tổng hợp 10 môn (Excel / Ảnh AI)
            </button>
            <button
              onClick={() => {
                setTargetStudentId(students[0]?.id || '');
                setShowCreateModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Viết nhận xét mới (Kèm AI)
            </button>
          </div>
        )}
      </div>

      {/* Evaluation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedEvaluations.map((ev) => {
          const stu = students.find((s) => s.id === ev.studentId);

          return (
            <div
              key={ev.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2.5">
                    {stu?.avatar && (
                      <img
                        src={stu.avatar}
                        alt={ev.studentName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{ev.studentName}</h3>
                      <span className="text-[11px] text-slate-400">
                        {stu?.code} • Tổ {stu?.group}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold">
                    {ev.periodLabel}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-900 font-bold block mb-0.5">📚 Học tập & Kỹ năng:</strong>
                    <span>{ev.academic}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-900 font-bold block mb-0.5">🌱 Ý thức & Thái độ:</strong>
                    <span>{ev.awareness} • {ev.attitude}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                      <strong className="text-emerald-900 font-bold block mb-0.5">🌟 Điểm mạnh:</strong>
                      <span className="text-emerald-800">{ev.strengths}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100">
                      <strong className="text-orange-900 font-bold block mb-0.5">💡 Cần cải thiện:</strong>
                      <span className="text-orange-800">{ev.improvements}</span>
                    </div>
                  </div>

                  {ev.teacherNote && (
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 italic">
                      <strong className="not-italic text-blue-900 font-bold block mb-1">
                        💌 Lời nhắn từ GVCN (Thầy Trương Xuân Hòa):
                      </strong>
                      <p className="whitespace-pre-line leading-relaxed">{ev.teacherNote}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Ngày đánh giá: {ev.createdAt}</span>
                <span className="font-semibold text-slate-600">THPT Vĩnh Lộc B</span>
              </div>
            </div>
          );
        })}
      </div>

      {displayedEvaluations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Chưa có nhận xét nào trong kỳ này</h3>
          <p className="text-xs text-slate-400 mt-1">
            Giáo viên chủ nhiệm sẽ cập nhật nhận xét định kỳ hằng tuần và hằng tháng cho từng học sinh.
          </p>
        </div>
      )}

      {/* CREATE EVALUATION MODAL (TEACHER) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 pb-2 border-b">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-extrabold text-slate-900">
                Viết nhận xét định kỳ cho học sinh
              </h3>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chọn học sinh ({students.length} em)</label>
                  <select
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.stt}. {s.name} ({s.code} - Tổ {s.group})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kỳ đánh giá</label>
                  <input
                    type="text"
                    value={periodLabel}
                    onChange={(e) => setPeriodLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* AI Auto-generate button */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-purple-950">AI Trợ lý Giáo viên (Gemini)</div>
                    <div className="text-[11px] text-purple-700">
                      Tự động gợi ý nhận xét tích cực dựa trên điểm số, điểm mạnh và nguyện vọng thi đại học của em.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAiComment}
                  disabled={isLoadingAi}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isLoadingAi ? 'Đang viết...' : 'AI Gợi ý nhận xét'}
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Học tập & Kiến thức</label>
                <textarea
                  rows={2}
                  placeholder="Đánh giá mức độ tiếp thu, điểm số các môn thi tốt nghiệp..."
                  value={academicText}
                  onChange={(e) => setAcademicText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ý thức nề nếp</label>
                  <input
                    type="text"
                    value={awarenessText}
                    onChange={(e) => setAwarenessText(e.target.value)}
                    placeholder="Chấp hành nội quy, đúng giờ..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thái độ & Kỹ năng</label>
                  <input
                    type="text"
                    value={attitudeText}
                    onChange={(e) => setAttitudeText(e.target.value)}
                    placeholder="Hòa đồng, lễ phép, tự tin..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Điểm mạnh đáng khen</label>
                  <input
                    type="text"
                    value={strengthsText}
                    onChange={(e) => setStrengthsText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Điểm cần cải thiện</label>
                  <input
                    type="text"
                    value={improvementsText}
                    onChange={(e) => setImprovementsText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Lời nhắn gửi tâm huyết của GVCN (Thầy Trương Xuân Hòa)
                </label>
                <textarea
                  rows={3}
                  placeholder="Lời động viên cuối cấp, nhắc nhở định hướng đại học..."
                  value={teacherNoteText}
                  onChange={(e) => setTeacherNoteText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Lưu nhận xét
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
