import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  Bot,
  Sparkles,
  Send,
  BookOpen,
  GraduationCap,
  Users,
  Compass,
  Heart,
  Lightbulb,
  Copy,
  Check,
  User,
  ArrowRight,
  TrendingUp,
  Award,
  RefreshCw,
  School,
  Flame,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { StudentPrivacyGuard } from './StudentPrivacyGuard';
import { StudentPasswordModal } from './StudentPasswordModal';
import { generateAITextWithFallback } from '../utils/aiClient';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const StudentAITutorView: React.FC = () => {
  const {
    currentStudent,
    students,
    setActiveStudentId,
    appConfig,
    isStudentUnlocked,
    lockStudent,
  } = useApp();

  const student = currentStudent || students?.[0];
  const studentId = student?.id || 'hs-27';

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Default welcome message generator
  const createWelcomeMessage = (stu?: Student): ChatMessage => ({
    id: `welcome-${stu?.id || 'default'}`,
    sender: 'ai',
    text: `Chào em **${stu?.name || 'học sinh 12A7'}**! Thầy/Gia sư AI 12A7 rất vui được đồng hành cùng em.
Năm học 2026 - 2027 là năm học cuối cấp bản lề. Thầy ở đây để giúp em:
- 📖 **Giải đáp kiến thức & giải bài tập** các môn (Toán, Hóa học của Thầy Hòa, Lý, Anh, Văn, Sử...).
- 🎯 **Lập lộ trình ôn tập cá nhân hóa** để bứt phá điểm số thi Tốt nghiệp THPT Quốc gia 2027.
- 🤝 **Gợi ý bạn học "Đôi bạn cùng tiến"** ngay trong lớp 12A7.
- 🎓 **Tư vấn chọn ngành & trường Đại học** tại TP.HCM phù hợp với ước mơ **"${stu?.dreamCareer || 'Đại học'}"**.

Em đang cần hỗ trợ phần nào hôm nay? Hãy chọn gợi ý bên dưới hoặc gõ câu hỏi nhé!`,
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  });

  // Load chat conversation per student from localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage?.getItem('a7_student_ai_chat_' + studentId) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [createWelcomeMessage(student)];
  });

  // When active student changes, switch to that student's private chat
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage?.getItem('a7_student_ai_chat_' + studentId) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // fallback
    }
    setMessages([createWelcomeMessage(student)]);
  }, [studentId]);

  // Persist messages per student
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('a7_student_ai_chat_' + studentId, JSON.stringify(messages));
      }
    } catch {
      // fallback
    }
  }, [messages, studentId]);

  const handleClearChat = () => {
    if (window.confirm('Em có chắc chắn muốn xóa toàn bộ lịch sử hỏi đáp với Gia Sư AI của mình không?')) {
      const reset = [createWelcomeMessage(student)];
      setMessages(reset);
      try {
        window.localStorage?.setItem('a7_student_ai_chat_' + studentId, JSON.stringify(reset));
      } catch {
        // ignore
      }
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Suggested quick prompts tailored to current student
  const quickPrompts = [
    `Ôn tập kiến thức Este - Lipit môn Hóa học Thầy Hòa`,
    `Phân tích điểm số hiện tại (${student?.currentGpa ?? 8.0}đ) và lập lộ trình bứt phá`,
    `Tìm bạn học "Đôi bạn cùng tiến" trong lớp 12A7 hỗ trợ em`,
    `Tư vấn ngành nghề và trường Đại học cho ước mơ: ${student?.dreamCareer || 'Đại học'}`,
    `Mẹo giải nhanh trắc nghiệm môn ${student?.examSubject1 || 'Toán học'}`,
    `Cách giảm áp lực học tập và duy trì năng lượng tích cực`,
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = (messages || []).slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const fallbackReply = `Chào em **${student?.name || 'học sinh 12A7'}**! Thầy/Gia sư AI 12A7 đã nhận được câu hỏi của em: *"${textToSend.trim()}"*.

💡 **Gợi ý học tập & định hướng từ Gia Sư AI 12A7:**
1. **Nắm vững lý thuyết trọng tâm SGK lớp 12:** Tóm tắt công thức và từ khóa quan trọng theo sơ đồ tư duy.
2. **Luyện đề theo mức độ (Nhận biết ➔ Thông hiểu ➔ Vận dụng):** Tập trung cao độ cho 2 môn tự chọn thi Tốt nghiệp THPT (${student?.examSubject1 || 'Hóa học'} và ${student?.examSubject2 || 'Tiếng Anh'}) cùng Toán - Văn.
3. **Trao đổi cùng Tổ ${student?.group || 1} & Thầy Trương Xuân Hòa:** Đừng ngần ngại thảo luận với các bạn trong nhóm "Đôi bạn cùng tiến" để đạt mục tiêu **${student?.dreamCareer || 'Đỗ Đại học nguyện vọng 1'}**!

*"Dream Big And Dare To Fail - Quyết tâm đậu TN & ĐH 100%!"* 💪`;

      const aiText = await generateAITextWithFallback({
        endpoint: '/api/ai/student-tutor',
        payload: {
          message: textToSend.trim(),
          studentInfo: {
            name: student?.name,
            currentGpa: student?.currentGpa,
            dreamCareer: student?.dreamCareer,
            examSubject1: student?.examSubject1,
            examSubject2: student?.examSubject2,
            strengths: student?.strengths,
            weaknesses: student?.weaknesses,
          },
          conversationHistory: historyPayload,
        },
        clientPrompt: `Bạn là Gia Sư & Cố Vấn Học Tập AI của lớp 12A7 trường THPT Vĩnh Lộc B (GVCN: Thầy Trương Xuân Hòa). Học sinh đang hỏi là ${student?.name || 'học sinh'} (ĐTB: ${student?.currentGpa || 8.0}, Môn thi: ${student?.examSubject1 || 'Hóa'} & ${student?.examSubject2 || 'Anh'}, Ước mơ: ${student?.dreamCareer || 'Đỗ ĐH'}). Hãy trả lời câu hỏi sau một cách tận tâm, dễ hiểu:\n${textToSend.trim()}`,
        fallbackText: fallbackReply,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Chào em ${student?.name || ''}! Thầy đã nhận được câu hỏi. Đối với nội dung này, em hãy ôn lại phần lý thuyết trọng tâm trong SGK và trao đổi thêm cùng bạn cùng tiến trong Tổ nhé. "Dream Big And Dare To Fail - Quyết tâm đậu TN & ĐH 100%!"`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Find peer tutor in 12A7
  const handleFindPeerTutor = () => {
    const topPeers = (students || [])
      .filter((s) => s.id !== student?.id)
      .sort((a, b) => (b.currentGpa ?? 0) - (a.currentGpa ?? 0))
      .slice(0, 4);

    const promptText = `Em muốn tìm bạn học "Đôi bạn cùng tiến" trong lớp 12A7 để cùng nhau ôn thi. Thầy gợi ý giúp em nhé! (Các bạn giỏi trong lớp có: ${topPeers.map((p) => `${p.name} - Tổ ${p.group}`).join(', ')})`;
    handleSendMessage(promptText);
  };

  if (!student) return null;

  // Check student privacy lock
  if (!isStudentUnlocked(student.id)) {
    return (
      <StudentPrivacyGuard
        student={student}
        title={`Gia Sư AI của ${student.name}`}
        subtitle="Lịch sử các câu hỏi, bài tập và thắc mắc bạn từng trao đổi với Gia sư AI đã được khóa bảo mật."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Student AI Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-600/50">
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Bot className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Gia Sư & Cố Vấn Học Tập AI 12A7
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-xs font-black">
                  Dành Riêng Cho Học Sinh
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-2xl leading-relaxed">
                Người bạn đồng hành 24/7 giải đáp thắc mắc, ôn thi Tốt nghiệp THPT 2027 và tư vấn bứt phá mục tiêu Đại học
              </p>

              {/* Student Personal Profile Badge */}
              <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 border border-white/20 text-white font-semibold">
                  <User className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    Học sinh: <strong>{student.name}</strong> ({student.code} • Tổ {student.group})
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 border border-white/20 text-white font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                  <span>
                    ĐTB: <strong>{student.currentGpa}đ</strong> ({student.currentClassification})
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 border border-white/20 text-white font-semibold">
                  <Compass className="w-3.5 h-3.5 text-pink-300" />
                  <span>
                    Mục tiêu: <strong>{student.dreamCareer || 'Đại học top đầu'}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Slogan Pill */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center lg:self-center shrink-0">
            <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Slogan 12A7
            </div>
            <div className="text-sm font-extrabold text-white mt-0.5 italic">
              "Dream Big And Dare To Fail"
            </div>
            <div className="text-[10px] text-indigo-200 mt-0.5">Quyết tâm đậu TN & ĐH 100%</div>
          </div>
        </div>

        {/* 4 Feature Modes Quick Launcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15 text-xs">
          <button
            onClick={() => handleSendMessage(`Thầy ơi, hướng dẫn em phương pháp giải bài tập Este - Lipit môn Hóa học Thầy Hòa với ạ!`)}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all group"
          >
            <div className="flex items-center gap-2 font-bold text-amber-300 group-hover:translate-x-0.5 transition-transform">
              <BookOpen className="w-4 h-4" /> Giải bài tập & Lý thuyết
            </div>
            <p className="text-[11px] text-indigo-100 mt-1">Hóa học, Toán, Lý, Anh, Văn...</p>
          </button>

          <button
            onClick={() => handleSendMessage(`Dựa vào bảng điểm hiện tại của em (${student.currentGpa}đ), hãy lập cho em lộ trình bứt phá điểm số đạt 8.5+ thi THPT Quốc gia!`)}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all group"
          >
            <div className="flex items-center gap-2 font-bold text-emerald-300 group-hover:translate-x-0.5 transition-transform">
              <TrendingUp className="w-4 h-4" /> Lộ trình bứt phá 8+
            </div>
            <p className="text-[11px] text-indigo-100 mt-1">Cá nhân hóa theo năng lực em</p>
          </button>

          <button
            onClick={handleFindPeerTutor}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all group"
          >
            <div className="flex items-center gap-2 font-bold text-pink-300 group-hover:translate-x-0.5 transition-transform">
              <Users className="w-4 h-4" /> Đôi bạn cùng tiến 12A7
            </div>
            <p className="text-[11px] text-indigo-100 mt-1">Ghép nhóm học tập trong lớp</p>
          </button>

          <button
            onClick={() => handleSendMessage(`Em muốn thi ngành ${student.dreamCareer || 'Công nghệ thông tin / Kinh tế'} tại TP.HCM. Hãy tư vấn cho em các trường Đại học phù hợp!`)}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all group"
          >
            <div className="flex items-center gap-2 font-bold text-cyan-300 group-hover:translate-x-0.5 transition-transform">
              <GraduationCap className="w-4 h-4" /> Tư vấn chọn trường ĐH
            </div>
            <p className="text-[11px] text-indigo-100 mt-1">ĐHQG, Bách Khoa, UEH, Y Dược...</p>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-2xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                Hộp Thoại Trợ Lý Học Tập 12A7
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-[11px] text-slate-500">
                Sẵn sàng giải đáp 24/7 • Thân thiện, tận tâm, riêng tư
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Student Name Pill */}
            <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800">
              {student.name}
            </span>

            {/* Privacy Status & Lock Actions */}
            {student.pinCode ? (
              <div className="flex items-center gap-1 bg-white border border-purple-200 px-2 py-1 rounded-xl shadow-2xs">
                <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Đã khóa PIN
                </span>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors flex items-center gap-1"
                  title="Đổi mật khẩu bảo vệ"
                >
                  <KeyRound className="w-3 h-3" /> Đổi PIN
                </button>
                <button
                  onClick={() => lockStudent(student.id)}
                  className="px-2 py-0.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] transition-colors flex items-center gap-1"
                  title="Khóa ngay để bạn khác không đọc trộm câu hỏi AI"
                >
                  <Lock className="w-3 h-3" /> Khóa ngay
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all active:scale-95"
                title="Cài mã PIN để bạn khác không đọc trộm câu hỏi riêng tư"
              >
                <Lock className="w-3.5 h-3.5" /> Đặt pass bảo vệ AI
              </button>
            )}

            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
              title="Xóa lịch sử trò chuyện"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                  }`}
                >
                  {isUser ? student.name.slice(-1) : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div
                  className={`rounded-2xl p-4 leading-relaxed shadow-2xs relative group ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-[13px] leading-relaxed">
                    {msg.text}
                  </div>

                  <div
                    className={`mt-2 flex items-center justify-between gap-3 text-[10px] ${
                      isUser ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-700 flex items-center gap-1"
                        title="Sao chép câu trả lời"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Đã sao chép
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Sao chép
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-xl mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-2 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                <span>Gia sư AI 12A7 đang suy nghĩ và giải đáp cho em...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Gợi ý nhanh:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 border border-slate-200 text-slate-600 whitespace-nowrap transition-colors font-semibold shrink-0 shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Hỏi Gia sư AI về bài tập, công thức, đề thi, hoặc tâm sự áp lực năm 12..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-medium"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <span>Gửi</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <StudentPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        targetStudent={student}
      />
    </div>
  );
};
