import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Announcement } from '../types';
import {
  Bell,
  Plus,
  Pin,
  AlertTriangle,
  Calendar,
  Users,
  BookOpen,
  Sparkles,
  Trash2,
  Send,
  X,
  Mail,
  Smartphone,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Check,
  Edit2,
  Save,
} from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const {
    role,
    currentStudent,
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    students,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for creating announcement
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Announcement['type']>('class');
  const [targetAudience, setTargetAudience] = useState<'all' | 'cadre'>('all');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [sendSmsNotification, setSendSmsNotification] = useState(true);

  // Form states for editing announcement (GVCN)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setTypeEdit] = useState<Announcement['type']>('class');
  const [editTargetAudience, setEditTargetAudience] = useState<'all' | 'cadre'>('all');
  const [editContent, setEditContent] = useState('');
  const [editIsPinned, setEditIsPinned] = useState(false);

  // Delete confirmation state
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setEditTitle(ann.title);
    setTypeEdit(ann.type);
    setEditTargetAudience(ann.targetAudience === 'cadre' ? 'cadre' : 'all');
    setEditContent(ann.content);
    setEditIsPinned(!!ann.isPinned);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung thông báo!');
      return;
    }

    updateAnnouncement(editingAnnouncement.id, {
      title: editTitle.trim(),
      type: editType,
      targetAudience: editTargetAudience,
      content: editContent.trim(),
      isPinned: editIsPinned,
    });

    setEditingAnnouncement(null);
    showToast('Đã lưu thay đổi thông báo thành công!');
  };

  const handleConfirmDelete = () => {
    if (!deletingAnnouncement) return;
    deleteAnnouncement(deletingAnnouncement.id);
    showToast(`Đã xóa thông báo "${deletingAnnouncement.title}"!`);
    setDeletingAnnouncement(null);
  };

  // Student cadre acknowledgment state
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage?.getItem('a7_cadre_ann_ack') : null;
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('a7_cadre_ann_ack', JSON.stringify(acknowledgedIds));
      }
    } catch {
      // ignore
    }
  }, [acknowledgedIds]);

  const handleAcknowledge = (annId: string) => {
    if (!acknowledgedIds.includes(annId)) {
      setAcknowledgedIds((prev) => [...prev, annId]);
    }
  };

  // Filter tabs
  const filterOptions = [
    { id: 'all', label: 'Tất cả thông báo' },
    { id: 'cadre', label: '👑 Ban Cán Sự Lớp' },
    { id: 'daily_homework', label: '📢 Báo bài hàng ngày' },
    { id: 'urgent', label: '🚨 Thông báo khẩn' },
    { id: 'exam', label: '📝 Lịch kiểm tra' },
    { id: 'parent_meeting', label: '🤝 Họp phụ huynh' },
    { id: 'activity', label: '🎉 Hoạt động ngoại khóa' },
    { id: 'class', label: '🏫 Thông báo lớp' },
  ];

  const filteredAnnouncements = (announcements || []).filter((a) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'cadre') return a?.type === 'cadre' || a?.targetAudience === 'cadre';
    return a?.type === activeFilter;
  });

  const [cadreTemplateSelected, setCadreTemplateSelected] = useState<string>('');

  const CADRE_TEMPLATES = [
    {
      label: 'Họp Ban cán sự đầu tuần',
      title: 'Triệu tập họp Ban Cán Sự Lớp 12A7 đầu tuần',
      content:
        'Kính gửi Ban Cán Sự Lớp 12A7,\n\nThầy đề nghị Ban cán sự tập trung họp nhanh vào giờ ra chơi tiết 2 (Thứ Hai) tại phòng học 12A7 để triển khai các nội dung trọng tâm trong tuần:\n1. Lớp trưởng: Báo cáo tổng kết nề nếp tuần trước và kế hoạch tuần này.\n2. Lớp phó học tập: Đôn đốc nộp bài tập các môn Toán, Hóa, Anh và phân công đôi bạn cùng tiến.\n3. Lớp phó kỉ luật: Theo dõi sát sao tình hình đi học đúng giờ, đồng phục và việc sử dụng điện thoại trong giờ học.\n4. Các Tổ trưởng: Kiểm tra sĩ số, trực nhật vệ sinh lớp và tổng hợp điểm trừ/cộng thi đua của tổ.\n\nYêu cầu các em có mặt đúng giờ!',
    },
    {
      label: 'Đôn đốc ôn tập & Chuẩn bị bài',
      title: 'Ban cán sự tăng cường đôn đốc chuẩn bị bài & ôn thi tốt nghiệp',
      content:
        'Nhắc nhở Ban Cán Sự và 4 Tổ Trưởng:\n\nĐể chuẩn bị tốt nhất cho các kỳ thi khảo sát và tốt nghiệp THPT 2027, Thầy đề nghị:\n- Lớp phó học tập triển khai nhóm đôi bạn cùng tiến môn Toán, Hóa, Tiếng Anh.\n- Tổ trưởng đôn đốc các bạn trong tổ chuẩn bị bài vở đầy đủ trước khi vào lớp.\n- Trường hợp bạn nào gặp khó khăn trong học tập, kịp thời báo lại cho Lớp phó học tập và Thầy để được hỗ trợ hướng dẫn.',
    },
    {
      label: 'Kiểm tra điểm thi đua & Nề nếp',
      title: 'Nhiệm vụ kiểm tra điểm thi đua tuần (100 điểm) & Xếp loại rèn luyện',
      content:
        'Gửi Lớp phó Kỉ luật và các Tổ trưởng:\n\nMỗi học sinh 12A7 đầu tuần đều có 100 điểm thi đua mặc định. Đề nghị:\n- Lớp phó kỉ luật cập nhật chính xác các lỗi vi phạm (đi trễ, không thuộc bài, mất trật tự, trang phục) vào mục "Điểm thi đua" trên app.\n- Tổ trưởng ghi nhận các bạn có đóng góp tích cực, phát biểu xây dựng bài hoặc đạt điểm 9-10 để cộng điểm thưởng.\n- Chiều Thứ Sáu hàng tuần, Ban cán sự tổng hợp danh sách gửi Thầy trước 16h30 để xếp loại thi đua tuần.',
    },
    {
      label: 'Phân công trực nhật & Vệ sinh',
      title: 'Kiểm tra vệ sinh phòng học & Phân công trực nhật 4 Tổ',
      content:
        'Gửi Lớp phó Lao động và 4 Tổ trưởng:\n\nĐể đảm bảo không gian lớp học 12A7 luôn sạch đẹp, thoáng mát và đạt điểm cao trong đợt thi đua toàn trường:\n- Tổ trực nhật hàng ngày phải có mặt trước 6h45 để kê bàn ghế, lau bảng, đổ rác.\n- Giờ ra chơi: Kiểm tra quạt, đèn và nhặt rác trong hộc bàn.\n- Cuối buổi: Quét lớp, khóa then cửa sổ và tắt toàn bộ thiết bị điện.\n- Lớp phó lao động chấm điểm trực nhật của từng tổ và ghi vào sổ trực nhật.',
    },
  ];

  // Open modal pre-configured for Cadre announcement
  const handleOpenCadreNoticeModal = () => {
    setType('cadre');
    setTargetAudience('cadre');
    setIsPinned(true);
    const tmpl = CADRE_TEMPLATES[0];
    setTitle(tmpl.title);
    setContent(tmpl.content);
    setShowCreateModal(true);
  };

  const applyCadreTemplate = (tmpl: typeof CADRE_TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setContent(tmpl.content);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const authorName =
      role === 'teacher'
        ? 'Thầy Trương Xuân Hòa'
        : (currentStudent?.name || 'Huỳnh Thị Ái Ly (Lớp trưởng)');
    const authorRole =
      role === 'teacher'
        ? 'Giáo viên chủ nhiệm 12A7'
        : `${currentStudent?.classRole || 'Ban Cán sự'} 12A7`;

    addAnnouncement({
      title,
      type: targetAudience === 'cadre' ? 'cadre' : type,
      targetAudience,
      content,
      author: authorName,
      role: authorRole,
      isPinned: targetAudience === 'cadre' ? true : isPinned,
    });

    setTitle('');
    setContent('');
    setTargetAudience('all');
    setShowCreateModal(false);
  };

  const isCadreMember = Boolean(
    currentStudent?.classRole && currentStudent.classRole !== 'Học sinh'
  );

  const isAllowedToPost =
    role === 'teacher' || (role === 'student' && isCadreMember);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Bảng tin Thông báo & Báo bài 12A7
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kênh thông tin chính thức giữa Giáo viên chủ nhiệm, Ban cán sự lớp, Học sinh và Phụ huynh
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isAllowedToPost && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenCadreNoticeModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5"
            >
              <Crown className="w-4 h-4 text-yellow-200" /> Viết thông báo Ban Cán Sự
            </button>

            <button
              onClick={() => {
                setType('class');
                setTargetAudience('all');
                setTitle('');
                setContent('');
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Đăng thông báo chung
            </button>
          </div>
        )}
      </div>

      {/* Cadre Announcement Quick Highlight Box for Officer or Teacher */}
      {(role === 'teacher' || isCadreMember) && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-indigo-50 border border-amber-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Crown className="w-5 h-5 text-yellow-100" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
                <span>Kênh Nhiệm Vụ Dành Riêng Cho Ban Cán Sự Lớp 12A7</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black">
                  ƯU TIÊN CAO
                </span>
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Lớp trưởng, Lớp phó học tập, Lớp phó kỉ luật, Bí thư, Lớp phó lao động và 4 Tổ trưởng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveFilter('cadre')}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold transition-colors"
            >
              Lọc thông báo Ban Cán Sự ({announcements.filter((a) => a.type === 'cadre' || a.targetAudience === 'cadre').length})
            </button>
            {role === 'teacher' && (
              <button
                onClick={handleOpenCadreNoticeModal}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
              >
                + Giao nhiệm vụ mới
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveFilter(opt.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
              activeFilter === opt.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((ann) => {
          const isUrgent = ann.type === 'urgent';
          const isHomework = ann.type === 'daily_homework';
          const isExam = ann.type === 'exam';
          const isCadre = ann.type === 'cadre' || ann.targetAudience === 'cadre';
          const isAcknowledged = acknowledgedIds.includes(ann.id);

          return (
            <div
              key={ann.id}
              className={`p-6 rounded-3xl border transition-all ${
                isCadre
                  ? 'bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-purple-50/60 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                  : ann.isPinned
                  ? 'bg-gradient-to-br from-amber-50/70 to-orange-50/70 border-amber-300 shadow-xs ring-1 ring-amber-400/20'
                  : isUrgent
                  ? 'bg-red-50/80 border-red-300 ring-1 ring-red-400/20'
                  : isHomework
                  ? 'bg-blue-50/50 border-blue-200'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.8 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      isCadre
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-2xs'
                        : isUrgent
                        ? 'bg-red-600 text-white'
                        : isHomework
                        ? 'bg-amber-500 text-white'
                        : isExam
                        ? 'bg-indigo-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isCadre && <Crown className="w-3 h-3 text-yellow-300" />}
                    {isCadre
                      ? '👑 THÔNG BÁO BAN CÁN SỰ LỚP'
                      : isUrgent
                      ? '🚨 KHẨN CẤP'
                      : isHomework
                      ? '📢 BÁO BÀI HÀNG NGÀY'
                      : isExam
                      ? '📝 LỊCH THI'
                      : '🏫 THÔNG BÁO LỚP'}
                  </span>

                  {ann.isPinned && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                      <Pin className="w-3 h-3" /> Đã ghim
                    </span>
                  )}

                  {isCadre && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold">
                      Chỉ đạo GVCN ➔ Ban cán sự 12A7
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium block">{ann.createdAt}</span>
                    {ann.updatedAt && (
                      <span className="text-[10px] text-blue-600 font-semibold block">
                        (Đã sửa {ann.updatedAt})
                      </span>
                    )}
                  </div>
                  {role === 'teacher' && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => handleOpenEdit(ann)}
                        className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                        title="Chỉnh sửa thông báo này (GVCN)"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-600" /> Sửa
                      </button>
                      <button
                        onClick={() => setDeletingAnnouncement(ann)}
                        className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                        title="Xóa thông báo này (GVCN)"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" /> Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cadre Notice Target Audience Banner */}
              {isCadre && (
                <div className="mb-3 p-2.5 rounded-xl bg-amber-100/70 border border-amber-300/80 text-[11px] text-amber-950 font-semibold flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    Đối tượng thực hiện: <strong>Lớp trưởng, Lớp phó học tập, Lớp phó kỉ luật, Bí thư, Lớp phó lao động & 4 Tổ trưởng</strong>
                  </span>
                  <span className="text-amber-800 text-[10px] hidden sm:inline">Yêu cầu hoàn thành đúng hạn</span>
                </div>
              )}

              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">{ann.title}</h3>

              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white/80 p-4 sm:p-5 rounded-2xl border border-black/5 shadow-2xs font-normal">
                {ann.content}
              </div>

              {/* Cadre Acknowledgment Button */}
              {isCadre && (
                <div className="mt-3.5 p-3 rounded-2xl bg-white/60 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Xác nhận tiếp nhận chỉ đạo của Ban cán sự</span>
                  </div>

                  {isCadreMember || role === 'teacher' ? (
                    <button
                      onClick={() => handleAcknowledge(ann.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isAcknowledged
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isAcknowledged ? '✓ Tôi đã nhận nhiệm vụ & Đã đọc' : 'Xác nhận đã nhận nhiệm vụ'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">
                      Dành cho cán sự lớp xác nhận
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-black/5 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>
                    Đăng bởi: <strong>{ann.author}</strong> ({ann.role})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />{' '}
                    {isCadre ? 'Đã gửi tới toàn bộ Ban Cán Sự Lớp' : `Đã gửi SMS/App tới ${students.length} phụ huynh`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Chưa có thông báo nào trong mục này</h3>
            {activeFilter === 'cadre' && role === 'teacher' && (
              <button
                onClick={handleOpenCadreNoticeModal}
                className="mt-3 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Crown className="w-4 h-4" /> Viết thông báo đầu tiên cho Ban Cán Sự
              </button>
            )}
          </div>
        )}
      </div>

      {/* CREATE ANNOUNCEMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative my-auto border border-slate-100">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-3 border-b mb-4">
              <div className={`p-2 rounded-xl ${targetAudience === 'cadre' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>
                {targetAudience === 'cadre' ? <Crown className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {targetAudience === 'cadre' ? 'Soạn thông báo cho Ban Cán Sự Lớp 12A7' : 'Soạn thông báo Lớp 12A7'}
                </h3>
                <p className="text-xs text-slate-500">
                  {targetAudience === 'cadre'
                    ? 'Chỉ đạo trực tiếp cho Lớp trưởng, Lớp phó, Bí thư và 4 Tổ trưởng'
                    : 'Gửi tới toàn bộ học sinh và phụ huynh lớp 12A7'}
                </p>
              </div>
            </div>

            {/* Audience Switcher */}
            <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="font-extrabold text-xs text-slate-700 block mb-2">
                Đối tượng tiếp nhận thông báo:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTargetAudience('all');
                    setType('class');
                  }}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                    targetAudience === 'all'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Toàn thể Lớp & Phụ huynh
                  </div>
                  <div className="text-[10px] font-normal opacity-90 mt-0.5">
                    Đăng lên bảng tin công khai cho 50 HS & PH
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetAudience('cadre');
                    setType('cadre');
                    setIsPinned(true);
                  }}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                    targetAudience === 'cadre'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/50'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-yellow-300" /> 👑 Ban Cán Sự Lớp
                  </div>
                  <div className="text-[10px] font-normal opacity-90 mt-0.5">
                    Lớp trưởng, Lớp phó, Bí thư, Tổ trưởng
                  </div>
                </button>
              </div>
            </div>

            {/* Cadre Preset Templates if Cadre audience is selected */}
            {targetAudience === 'cadre' && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200">
                <div className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Mẫu thông báo Ban Cán Sự sẵn có (Bấm để điền nhanh):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CADRE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyCadreTemplate(tmpl)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-[11px] font-bold transition-colors"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              {targetAudience !== 'cadre' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thể loại thông báo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="class">Thông báo lớp học chung</option>
                    <option value="daily_homework">Báo bài hàng ngày (Lớp phó học tập)</option>
                    <option value="urgent">Thông báo khẩn cấp</option>
                    <option value="exam">Lịch kiểm tra & thi thử</option>
                    <option value="parent_meeting">Họp phụ huynh</option>
                    <option value="activity">Hoạt động ngoại khóa / Thiện nguyện</option>
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu đề thông báo</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Triệu tập họp Ban Cán Sự Lớp đầu tuần..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung chi tiết & Nhiệm vụ</label>
                <textarea
                  rows={6}
                  placeholder="Ghi rõ thời gian, phân công cho Lớp trưởng, Lớp phó, Tổ trưởng..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 leading-relaxed font-normal"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  Ghim thông báo lên đầu bảng tin
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={sendSmsNotification}
                    onChange={(e) => setSendSmsNotification(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  Gửi SMS/App đồng thời cho {targetAudience === 'cadre' ? 'toàn bộ Ban Cán Sự' : `${students.length} phụ huynh`}
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white font-bold shadow-md flex items-center gap-1.5 ${
                    targetAudience === 'cadre'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> Phát hành thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ANNOUNCEMENT MODAL (GVCN) */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative my-auto border border-slate-100">
            <button
              onClick={() => setEditingAnnouncement(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-3 border-b mb-4">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Chỉnh Sửa Thông Báo Lớp 12A7
                </h3>
                <p className="text-xs text-slate-500">
                  Cập nhật tiêu đề, nội dung và phân loại thông báo
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Audience Switcher */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="font-extrabold text-xs text-slate-700 block mb-2">
                  Đối tượng tiếp nhận thông báo:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setEditTargetAudience('all')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                      editTargetAudience === 'all'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> Toàn thể Lớp & Phụ huynh
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditTargetAudience('cadre')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                      editTargetAudience === 'cadre'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4" /> Ban Cán Sự Lớp (9 Bạn)
                    </div>
                  </button>
                </div>
              </div>

              {/* Type selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Loại thông báo:</label>
                <select
                  value={editType}
                  onChange={(e) => setTypeEdit(e.target.value as Announcement['type'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                >
                  <option value="class">Thông báo chung của lớp</option>
                  <option value="cadre">Chỉ đạo Ban cán sự lớp</option>
                  <option value="daily_homework">Báo bài hàng ngày (Lớp phó học tập)</option>
                  <option value="urgent">Thông báo khẩn cấp</option>
                  <option value="exam">Lịch kiểm tra / Thi học kỳ</option>
                  <option value="parent_meeting">Họp phụ huynh</option>
                  <option value="activity">Hoạt động ngoại khóa / Thiện nguyện</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu đề thông báo:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung chi tiết & Nhiệm vụ:</label>
                <textarea
                  rows={6}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 leading-relaxed font-normal bg-white text-slate-800"
                  required
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editIsPinned}
                    onChange={(e) => setEditIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  Ghim thông báo lên đầu bảng tin
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
                  className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1">
              Xóa Thông Báo Này?
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Bạn có chắc muốn xóa thông báo: <strong>"{deletingAnnouncement.title}"</strong>? Thao tác này sẽ gỡ thông báo khỏi bảng tin của cả lớp.
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeletingAnnouncement(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="font-bold text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
