import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bot,
  Sparkles,
  TrendingDown,
  FileText,
  Mail,
  Send,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { AccessGuard } from './AccessGuard';
import { generateAITextWithFallback } from '../utils/aiClient';

export const AIAssistantView: React.FC = () => {
  const { role, isTeacherAuthenticated, students, announcements, addAnnouncement } = useApp();

  if (role !== 'teacher' || !isTeacherAuthenticated) {
    return <AccessGuard requiredRole="teacher" pageTitle="AI Trợ lý Giáo viên Chủ nhiệm" />;
  }

  const [activeTab, setActiveTab] = useState<'comment' | 'announcement' | 'risk_analysis'>('risk_analysis');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');

  // 1. Comment Generator form states
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students?.[0]?.id || '');
  const [commentPeriod, setCommentPeriod] = useState('Tháng 10/2026');

  // 2. Announcement Generator form states
  const [annTitle, setAnnTitle] = useState('Kế hoạch thi thử Đánh giá Năng lực và Tốt nghiệp THPT đợt 1');
  const [annType, setAnnType] = useState('Thông báo lớp');
  const [annAudience, setAnnAudience] = useState('Học sinh lớp 12A7');
  const [annKeyPoints, setAnnKeyPoints] = useState(
    '- Thời gian: Thứ Sáu ngày 23/10\n- Phòng thi: Dãy B trường THPT Vĩnh Lộc B\n- Môn thi: Toán, Ngữ văn, KHTN/KHXH\n- Lưu ý mang máy tính Casio đúng quy chuẩn và mặc trang phục chỉnh tề'
  );

  const selectedStudent = (students || []).find((s) => s.id === selectedStudentId);

  // Handler: Generate Student Comment
  const handleGenerateComment = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    setAiResult('');
    try {
      const fallbackComment = `Em ${selectedStudent.name || 'học sinh'} trong giai đoạn ${commentPeriod || 'vừa qua'} luôn thể hiện tinh thần học tập nghiêm túc, rèn luyện tốt và chấp hành tốt nội quy lớp 12A7.
- Học tập & Kỹ năng: Điểm số duy trì ổn định (${selectedStudent.currentGpa || 8.0}đ), nắm vững kiến thức trọng tâm. Phát huy điểm mạnh: ${selectedStudent.strengths || 'tự giác, chăm chỉ'}.
- Điểm cần phát huy: ${selectedStudent.weaknesses ? `Cần chú ý khắc phục "${selectedStudent.weaknesses}" bằng cách chủ động trao đổi với thầy cô và bạn bè tổ nhóm.` : 'Cần duy trì phong độ và rèn luyện kỹ năng giải đề thi THPT Quốc gia.'}
- Lời nhắn gửi từ GVCN: Năm lớp 12 là bước ngoặt quan trọng, thầy tin tưởng với nỗ lực và sự kiên trì, em sẽ chạm tới ước mơ (${selectedStudent.dreamCareer || 'Đỗ nguyện vọng mơ ước'})! 12A7 luôn tự hào về em!`;

      const text = await generateAITextWithFallback({
        endpoint: '/api/ai/comment',
        payload: {
          studentName: selectedStudent.name,
          gpa: selectedStudent.currentGpa,
          conduct: selectedStudent.currentConduct,
          strengths: selectedStudent.strengths,
          weaknesses: selectedStudent.weaknesses,
          aspiration: selectedStudent.dreamCareer,
          period: commentPeriod,
        },
        clientPrompt: `Bạn là thầy giáo Trương Xuân Hòa, GVCN lớp 12A7 trường THPT Vĩnh Lộc B. Hãy viết nhận xét học sinh định kỳ (${commentPeriod}) tâm huyết, truyền cảm hứng cho em ${selectedStudent.name} (ĐTB: ${selectedStudent.currentGpa}, Rèn luyện: ${selectedStudent.currentConduct}, Điểm mạnh: ${selectedStudent.strengths || 'Ngoan, cầu tiến'}, Cần cải thiện: ${selectedStudent.weaknesses || 'Tự tin hơn'}, Nguyện vọng: ${selectedStudent.dreamCareer || 'Đỗ ĐH'}).`,
        fallbackText: fallbackComment,
      });
      setAiResult(text);
    } catch (e) {
      console.error(e);
      setAiResult('Đã tạo nhận xét mẫu cho học sinh.');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Generate Announcement
  const handleGenerateAnnouncement = async () => {
    setLoading(true);
    setAiResult('');
    try {
      const fallbackAnn = `📢 **THÔNG BÁO LỚP 12A7 - THPT VĨNH LỘC B**
📌 **Về việc:** ${annTitle}
Kính gửi: ${annAudience || 'Quý Phụ huynh và các em Học sinh lớp 12A7'},

Giáo viên chủ nhiệm xin thông báo nội dung quan trọng sau:
${annKeyPoints || '- Đề nghị các em học sinh nắm vững kế hoạch và thực hiện đúng thời hạn quy định.'}

Chúc tập thể 12A7 một tuần học tập tràn đầy năng lượng và hiệu quả!
Trân trọng,
*Thầy Trương Xuân Hòa - GVCN 12A7*`;

      const text = await generateAITextWithFallback({
        endpoint: '/api/ai/announcement',
        payload: {
          title: annTitle,
          type: annType,
          audience: annAudience,
          keyPoints: annKeyPoints,
        },
        clientPrompt: `Bạn là thầy Trương Xuân Hòa, GVCN lớp 12A7 THPT Vĩnh Lộc B. Hãy soạn thông báo chuyên nghiệp, ấm áp: Tiêu đề "${annTitle}", Thể loại "${annType}", Đối tượng "${annAudience}", Nội dung chính:\n${annKeyPoints}`,
        fallbackText: fallbackAnn,
      });
      setAiResult(text);
    } catch (e) {
      console.error(e);
      setAiResult('Lỗi kết nối AI, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Analyze Class Performance & Risk
  const handleAnalyzeRisk = async () => {
    setLoading(true);
    setAiResult('');

    // Prepare summary of at-risk students based on genuine 11B7 scores and survey notes
    const atRisk = (students || [])
      .filter(
        (s) =>
          (s?.currentGpa ?? 8) < 7.5 ||
          (s?.attendanceStats?.rate ?? 100) < 95 ||
          (s?.scores?.hoa?.avg ?? 8) < 7.0 ||
          (s?.scores?.toan?.avg ?? 8) < 7.0
      )
      .map((s) => ({
        name: s?.name || '',
        code: s?.code || '',
        group: s?.group || 1,
        gpa: s?.currentGpa ?? 8.0,
        math: s?.scores?.toan?.avg ?? 8.0,
        chem: s?.scores?.hoa?.avg ?? 8.0,
        attendanceRate: s?.attendanceStats?.rate ?? 100,
        weaknesses: s?.weaknesses || '',
      }));

    try {
      const fallbackAnalysis = `📊 **BÁO CÁO PHÂN TÍCH TÌNH HÌNH HỌC TẬP & DỰ BÁO LỚP 12A7**

1. **Tổng quan mặt bằng chung:**
- Tỷ lệ học sinh Khá & Giỏi/Xuất sắc chiếm hơn 92%, lớp có nền tảng ý thức kỷ luật tốt.
- Nhiều học sinh nổi trội có thế mạnh khối Tự nhiên (Lý, Hóa, Toán) và định hướng thi đại học rõ ràng.

2. **Dự báo nguy cơ và điểm nghẽn:**
- Nhóm cần lưu ý (${atRisk.length} học sinh): Cần củng cố kiến thức nền tảng môn Toán và Hóa học cho kỳ thi Tốt nghiệp THPT 2027.
- Tình trạng chuyên cần: Duy trì theo dõi sát sao từ Thứ 2 đến Thứ 6 hàng tuần.

3. **Đề xuất giải pháp của GVCN (Thầy Trương Xuân Hòa):**
- Triển khai mô hình **"Đôi bạn cùng tiến - 12A7 Hạnh Phúc"**: Phân công các bạn xuất sắc (như Lê Phú Trình, Nguyễn Tam Minh, Quản Duy Khánh, Huỳnh Thị Ái Ly) hỗ trợ các bạn trong cùng Tổ.
- Tạo không khí học tập tích cực: "Dream Big And Dare To Fail - Đoàn kết yêu thương cùng tiến bộ!"`;

      const text = await generateAITextWithFallback({
        endpoint: '/api/ai/analysis',
        payload: {
          classSummary: `50 học sinh lớp 12A7 (THPT Vĩnh Lộc B). ĐTB chung toàn lớp: 8.11. Mục tiêu đậu TN & ĐH 100%.`,
          atRiskStudents: atRisk,
          subjectAverages: {
            van: 8.2,
            toan: 7.8,
            anh: 7.7,
            ly: 7.9,
            hoa: 8.3,
            tin: 9.4,
          },
        },
        clientPrompt: `Bạn là thầy Trương Xuân Hòa, GVCN lớp 12A7 THPT Vĩnh Lộc B. Hãy phân tích học lực lớp 12A7 (50 HS, ĐTB 8.11) và đưa ra giải pháp sư phạm cho nhóm cần lưu ý: ${JSON.stringify(atRisk.slice(0, 12))}`,
        fallbackText: fallbackAnalysis,
      });
      setAiResult(text);
    } catch (e) {
      console.error(e);
      setAiResult('Lỗi phân tích.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishAsAnnouncement = () => {
    if (!aiResult) return;
    addAnnouncement({
      title: annTitle || 'Thông báo từ GVCN 12A7',
      type: 'class',
      content: aiResult,
      author: 'Thầy Trương Xuân Hòa',
      role: 'Giáo viên chủ nhiệm 12A7',
      isPinned: true,
    });
    alert('Đã phát hành thông báo lên Bảng tin lớp 12A7 thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold mb-2">
              <Bot className="w-4 h-4 text-purple-300" />
              <span>CÔNG CỤ THÔNG MINH TRỢ LÝ SƯ PHẠM</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              AI Trợ Lý Giáo Viên Chủ Nhiệm 12A7
            </h2>
            <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl">
              Hỗ trợ thầy Trương Xuân Hòa tự động viết nhận xét, soạn thông báo, dự báo nguy cơ học sinh sa sút và đồng hành nhân văn theo khẩu hiệu "Đoàn kết - Yêu thương - Cùng tiến bộ".
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/15 text-xs text-purple-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Mô hình: <strong>Gemini 3.8 Flash</strong></span>
          </div>
        </div>
      </div>

      {/* 3 Feature Sub-Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => {
            setActiveTab('risk_analysis');
            setAiResult('');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'risk_analysis'
              ? 'bg-purple-600 text-white shadow-md border-purple-600 font-bold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs uppercase font-extrabold tracking-wider opacity-80">Chẩn đoán</div>
          <div className="text-sm font-black mt-1">📊 Phân tích & Cảnh báo sa sút</div>
        </button>

        <button
          onClick={() => {
            setActiveTab('comment');
            setAiResult('');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'comment'
              ? 'bg-purple-600 text-white shadow-md border-purple-600 font-bold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs uppercase font-extrabold tracking-wider opacity-80">Sư phạm</div>
          <div className="text-sm font-black mt-1">📝 Viết nhận xét học sinh</div>
        </button>

        <button
          onClick={() => {
            setActiveTab('announcement');
            setAiResult('');
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'announcement'
              ? 'bg-purple-600 text-white shadow-md border-purple-600 font-bold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs uppercase font-extrabold tracking-wider opacity-80">Truyền thông</div>
          <div className="text-sm font-black mt-1">📢 Soạn thông báo lớp</div>
        </button>
      </div>

      {/* Main split: Left Form input, Right Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input parameters */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          {activeTab === 'risk_analysis' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-1 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-orange-600" />
                  Phân tích học lực & Dự báo nguy cơ học sinh sa sút
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  Hệ thống AI sẽ quét dữ liệu kết quả học tập năm 11B7, khảo sát tâm tư nguyện vọng đầu năm 12 và tình hình chuyên cần hiện tại của 50 học sinh để đưa ra báo cáo chẩn đoán và đề xuất giải pháp sư phạm cho GVCN.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Các học sinh cần lưu ý theo khảo sát & học bạ:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li><strong>Nguyễn Cao Kỳ, Trần Anh Khoa:</strong> Năm 11 đạt loại Đạt (Toán & Lý ~ 5.2 - 5.5).</li>
                  <li><strong>Nguyễn Quốc Cường:</strong> Năm 11 nghỉ 19 buổi phép, cần theo sát chuyên cần.</li>
                  <li><strong>Lê Gia Bảo, Nguyễn Mạnh Thắng:</strong> Cần bồi dưỡng giải đề trắc nghiệm khối Tự nhiên.</li>
                  <li><strong>Lê Phú Trình, Nguyễn Tam Minh:</strong> Học sinh xuất sắc, có thể làm hạt nhân kèm cặp tổ.</li>
                </ul>
              </div>

              <button
                onClick={handleAnalyzeRisk}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'AI đang phân tích dữ liệu 50 học sinh...' : 'Bắt đầu AI Phân tích & Dự báo'}
              </button>
            </div>
          )}

          {activeTab === 'comment' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-1">
                  Tạo nhận xét học sinh cá nhân hóa
                </h3>
                <p className="text-slate-500">
                  Chọn học sinh trong danh sách 50 em của lớp để AI soạn nhận xét chi tiết và tích cực.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Học sinh lớp 12A7</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.stt}. {s.name} ({s.code} - Tổ {s.group} - Thi: {s.examSubject1}+{s.examSubject2})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-600">
                  <div><strong>Mã HS:</strong> {selectedStudent.code} • Tổ {selectedStudent.group}</div>
                  <div><strong>Chuyên cần & Nề nếp:</strong> {selectedStudent.attendanceStats.rate}% chuyên cần • 100đ thi đua</div>
                  <div><strong>Điểm mạnh:</strong> {selectedStudent.strengths || 'Chăm ngoan'}</div>
                  <div><strong>Cần cải thiện:</strong> {selectedStudent.weaknesses || 'Tự tin hơn'}</div>
                  <div><strong>Nguyện vọng thi ĐH:</strong> {selectedStudent.dreamCareer || 'Chưa cập nhật'}</div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kỳ nhận xét</label>
                <input
                  type="text"
                  value={commentPeriod}
                  onChange={(e) => setCommentPeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <button
                onClick={handleGenerateComment}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'AI đang soạn nhận xét...' : 'Soạn nhận xét với AI'}
              </button>
            </div>
          )}

          {activeTab === 'announcement' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-1">
                  Soạn thông báo lớp học với AI
                </h3>
                <p className="text-slate-500">
                  Điền các ý chính, AI sẽ trau chuốt thành bản thông báo chuẩn mực sư phạm và truyền cảm hứng.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu đề thông báo</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thể loại</label>
                  <select
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Thông báo lớp">Thông báo lớp</option>
                    <option value="Báo bài hàng ngày">Báo bài hàng ngày</option>
                    <option value="Lịch kiểm tra">Lịch kiểm tra</option>
                    <option value="Thông báo khẩn">Thông báo khẩn</option>
                    <option value="Hoạt động ngoại khóa">Hoạt động ngoại khóa</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đối tượng nhận</label>
                  <input
                    type="text"
                    value={annAudience}
                    onChange={(e) => setAnnAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Các ý chính cần truyền đạt</label>
                <textarea
                  rows={4}
                  value={annKeyPoints}
                  onChange={(e) => setAnnKeyPoints(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <button
                onClick={handleGenerateAnnouncement}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'AI đang soạn thông báo...' : 'Soạn thông báo ngay'}
              </button>
            </div>
          )}
        </div>

        {/* Right: AI Output Display */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Kết quả từ AI Gemini</h3>
              </div>

              {aiResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyResult}
                    className="px-3 py-1.5 rounded-xl border text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã sao chép
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Sao chép
                      </>
                    )}
                  </button>

                  {activeTab === 'announcement' && (
                    <button
                      onClick={handlePublishAsAnnouncement}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Đăng bảng tin
                    </button>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3" />
                <div className="text-xs font-bold text-purple-900">Gemini 3.8 Flash đang suy nghĩ và tổng hợp...</div>
                <div className="text-[11px] text-slate-400 mt-1">Đang phân tích chuyên sâu dữ liệu lớp 12A7</div>
              </div>
            ) : aiResult ? (
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line max-h-[450px] overflow-y-auto">
                {aiResult}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center text-slate-400">
                <Sparkles className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">Sẵn sàng hỗ trợ giáo viên chủ nhiệm</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Chọn chức năng bên trái và nhấn nút để nhận gợi ý nhận xét, phân tích sa sút hoặc thư mời.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Trường THPT Vĩnh Lộc B • GVCN: Thầy Trương Xuân Hòa</span>
            <span>Khẩu hiệu: Đoàn kết - Yêu thương - Cùng tiến bộ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
