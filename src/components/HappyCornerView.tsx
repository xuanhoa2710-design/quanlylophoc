import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { HappyPost } from '../types';
import { compressImageFileToDataUrl, parseStudentBirthday } from '../utils/imageUtils';
import {
  Heart,
  Cake,
  Sparkles,
  Smile,
  Camera,
  Send,
  MessageCircle,
  Plus,
  X,
  Star,
  Gift,
  Award,
  ThumbsUp,
  Edit3,
  Trash2,
  ShieldCheck,
  Upload,
  Smartphone,
  Monitor,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const HappyCornerView: React.FC = () => {
  const {
    happyPosts,
    addHappyPost,
    updateHappyPost,
    deleteHappyPost,
    deletePostComment,
    toggleLikePost,
    addPostComment,
    postMonthlyBirthdayWishes,
    role,
    currentStudent,
    activeStudentId,
    students,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Month selector for Birthday Wishes (defaults to current month 1..12)
  const currentSystemMonth = new Date().getMonth() + 1;
  const [selectedBirthdayMonth, setSelectedBirthdayMonth] = useState<number>(currentSystemMonth);
  const [birthdayBannerToast, setBirthdayBannerToast] = useState<string | null>(null);

  // Create Post Form
  const [category, setCategory] = useState<HappyPost['category']>('gratitude');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingCreateImg, setIsUploadingCreateImg] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const createFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Post Modal (GVCN)
  const [editingPost, setEditingPost] = useState<HappyPost | null>(null);
  const [editCategory, setEditCategory] = useState<HappyPost['category']>('gratitude');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [isUploadingEditImg, setIsUploadingEditImg] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Students born in selectedBirthdayMonth
  const birthdayStudentsInMonth = students
    .map((s) => {
      const parsed = parseStudentBirthday(s.birthday);
      return { student: s, parsed };
    })
    .filter((item) => item.parsed && item.parsed.month === selectedBirthdayMonth)
    .sort((a, b) => (a.parsed?.day || 1) - (b.parsed?.day || 1));

  // Count birthdays per month for quick badge display
  const getMonthBirthdayCount = (m: number) =>
    students.filter((s) => parseStudentBirthday(s.birthday)?.month === m).length;

  const filteredPosts = happyPosts.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const handleImageFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: 'create' | 'edit'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    try {
      if (mode === 'create') {
        setIsUploadingCreateImg(true);
        const compressed = await compressImageFileToDataUrl(file, 960, 0.75);
        setImageUrl(compressed);
        setIsUploadingCreateImg(false);
      } else {
        setIsUploadingEditImg(true);
        const compressed = await compressImageFileToDataUrl(file, 960, 0.75);
        setEditImageUrl(compressed);
        setIsUploadingEditImg(false);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
      setIsUploadingCreateImg(false);
      setIsUploadingEditImg(false);
    } finally {
      e.target.value = '';
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const authorName =
      role === 'teacher'
        ? 'Thầy Trương Xuân Hòa (GVCN)'
        : role === 'student'
        ? `${currentStudent?.name} (HS)`
        : `PH em ${currentStudent?.name}`;

    addHappyPost({
      category,
      title,
      content,
      authorName,
      authorRole: role,
      imageUrl: imageUrl.trim() || undefined,
    });

    setTitle('');
    setContent('');
    setImageUrl('');
    setUploadError(null);
    setShowAddModal(false);
  };

  const handleOpenEditPost = (post: HappyPost) => {
    setEditingPost(post);
    setEditCategory(post.category);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditImageUrl(post.imageUrl || '');
    setUploadError(null);
  };

  const handleSaveEditPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editTitle.trim() || !editContent.trim()) return;

    updateHappyPost(editingPost.id, {
      category: editCategory,
      title: editTitle.trim(),
      content: editContent.trim(),
      imageUrl: editImageUrl.trim() || undefined,
    });

    setEditingPost(null);
  };

  const handleConfirmDeletePost = (id: string) => {
    deleteHappyPost(id);
    setDeletingPostId(null);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const author =
      role === 'teacher'
        ? 'Thầy Hòa (GVCN)'
        : role === 'student'
        ? currentStudent?.name || 'Học sinh'
        : `PH em ${currentStudent?.name}`;

    addPostComment(postId, author, text.trim());
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleTriggerMonthlyBirthdayPost = () => {
    const res = postMonthlyBirthdayWishes(selectedBirthdayMonth, true);
    setBirthdayBannerToast(res.message);
    setTimeout(() => setBirthdayBannerToast(null), 5000);
  };

  const getCategoryBadge = (cat: HappyPost['category']) => {
    switch (cat) {
      case 'good_deed':
        return {
          label: 'Mỗi tuần một việc tốt',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: Star,
        };
      case 'gratitude':
        return {
          label: 'Lời cảm ơn & Yêu thương',
          color: 'bg-rose-100 text-rose-700 border-rose-200',
          icon: Heart,
        };
      case 'birthday':
        return {
          label: 'Chúc mừng sinh nhật',
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: Cake,
        };
      case 'spotlight':
        return {
          label: 'Gương sáng A7',
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: Award,
        };
      case 'memory':
      case 'album':
        return {
          label: 'Khoảnh khắc & Kỷ niệm',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Camera,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Happy Corner Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 p-5 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/15 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2.5">
              <Heart className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
              Góc Hạnh Phúc 12A7 • Đoàn Kết - Yêu Thương - Cùng Tiến Bộ
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hộp Thư Yêu Thương & Khoảnh Khắc 12A7
            </h1>
            <p className="mt-1.5 text-white/90 text-xs sm:text-sm leading-relaxed">
              Nơi lưu giữ những kỷ niệm đẹp tuổi 18, tải ảnh trực tiếp từ điện thoại hoặc máy tính, gửi lời cảm ơn thầy cô, bạn bè và tự động chúc mừng sinh nhật các thành viên 12A7 vào đầu mỗi tháng!
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="self-start md:self-center px-5 py-3 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Đăng bài & Tải ảnh lên
          </button>
        </div>
      </div>

      {/* Automatic Monthly Birthday Celebration Card */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 rounded-2xl border border-amber-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Cake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-800">
                  Sinh Nhật Thành Viên 12A7 Tháng {selectedBirthdayMonth} ({birthdayStudentsInMonth.length} bạn)
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Tự động đăng chúc mừng đầu tháng
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Hệ thống tự động kiểm tra và đăng bài chúc mừng sinh nhật các bạn có sinh nhật trong tháng vào những ngày đầu tháng.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Month Picker */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-amber-200 text-xs font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <select
                value={selectedBirthdayMonth}
                onChange={(e) => setSelectedBirthdayMonth(Number(e.target.value))}
                className="bg-transparent focus:outline-none font-bold text-amber-900 cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m} ({getMonthBirthdayCount(m)} HS)
                  </option>
                ))}
              </select>
            </div>

            {/* Button to auto-generate / post birthday wishes for the selected month */}
            {birthdayStudentsInMonth.length > 0 && (
              <button
                onClick={handleTriggerMonthlyBirthdayPost}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5" />
                Đăng bài chúc sinh nhật Tháng {selectedBirthdayMonth}
              </button>
            )}
          </div>
        </div>

        {birthdayBannerToast && (
          <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{birthdayBannerToast}</span>
            </div>
            <button onClick={() => setBirthdayBannerToast(null)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {birthdayStudentsInMonth.length === 0 ? (
          <div className="bg-white/80 rounded-xl p-4 text-center text-xs text-slate-500 border border-amber-100">
            Trong Tháng {selectedBirthdayMonth} không có học sinh nào có ngày sinh nhật. Hãy chọn tháng khác để xem danh sách!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {birthdayStudentsInMonth.map(({ student: s, parsed }) => (
              <div
                key={s.id}
                className="bg-white rounded-xl p-3 border border-amber-200/70 shadow-2xs flex items-center gap-3 hover:shadow-md transition-all"
              >
                <img
                  src={s.avatar}
                  alt={s.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-400 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900 truncate">{s.name}</div>
                  <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                    <Gift className="w-3 h-3 shrink-0" />
                    Sinh ngày: {String(parsed?.day).padStart(2, '0')}/{String(parsed?.month).padStart(2, '0')} • Tổ {s.group}
                  </div>
                  <button
                    onClick={() => {
                      setCategory('birthday');
                      setTitle(`🎂 Chúc mừng sinh nhật bạn ${s.name} (${s.birthday})!`);
                      setContent(
                        `Chúc bạn ${s.name} (Tổ ${s.group}) tuổi 18 thật nhiều niềm vui, sức khỏe, luôn rạng rỡ và đạt điểm thật cao trong kỳ thi Tốt nghiệp THPT & Đại học 2027 nhé! 🥳🎉`
                      );
                      setShowAddModal(true);
                    }}
                    className="mt-1 text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5" /> Gửi thiệp chúc riêng
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Tất cả khoảnh khắc', icon: Sparkles },
            { id: 'gratitude', label: 'Lời cảm ơn & Yêu thương', icon: Heart },
            { id: 'good_deed', label: 'Mỗi tuần 1 việc tốt', icon: Star },
            { id: 'spotlight', label: 'Gương sáng A7', icon: Award },
            { id: 'birthday', label: 'Sinh nhật tháng', icon: Cake },
            { id: 'memory', label: 'Album Kỷ niệm', icon: Camera },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {role === 'teacher' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Quyền GVCN: Được phép chỉnh sửa & xóa mọi bài đăng / bình luận
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => {
          const badge = getCategoryBadge(post.category);
          const BadgeIcon = badge.icon;
          const likedByList = Array.isArray(post.likedBy) ? post.likedBy : [];
          const commentsList = Array.isArray(post.comments) ? post.comments : [];
          const isLiked = likedByList.includes(activeStudentId);

          return (
            <div
              key={post.id}
              className={`bg-white rounded-2xl border shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all ${
                post.isAutoBirthday ? 'border-amber-300 ring-1 ring-amber-200/60' : 'border-slate-200/80'
              }`}
            >
              <div>
                {post.imageUrl && (
                  <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-100">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    {post.isAutoBirthday && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500/95 text-white text-[10px] font-extrabold shadow-md flex items-center gap-1">
                        <Cake className="w-3 h-3" />
                        Tự động đăng đầu tháng
                      </span>
                    )}
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.color}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">{post.createdAt}</span>

                      {/* GVCN Edit & Delete Controls */}
                      {role === 'teacher' && (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={() => handleOpenEditPost(post)}
                            title="Chỉnh sửa bài viết (GVCN)"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingPostId(post.id)}
                            title="Xóa bài viết (GVCN)"
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Confirmation Inline Banner */}
                  {deletingPostId === post.id && (
                    <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-red-800">
                        Xác nhận xóa bài viết này khỏi Góc Hạnh Phúc?
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setDeletingPostId(null)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleConfirmDeletePost(post.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                        >
                          Xóa ngay
                        </button>
                      </div>
                    </div>
                  )}

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Smile className="w-4 h-4 text-amber-500" />
                      <span>Đăng bởi: {post.authorName}</span>
                    </div>

                    <button
                      onClick={() => toggleLikePost(post.id, activeStudentId)}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-rose-100 text-rose-600 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes} Yêu thích</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-slate-50/80 px-5 py-3.5 border-t border-slate-100 space-y-2.5">
                {commentsList.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {commentsList.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white p-2.5 rounded-xl border border-slate-200/60 text-xs flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{c.author}</span>
                            <span className="text-[10px] text-slate-400">{c.time}</span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{c.text}</p>
                        </div>

                        {role === 'teacher' && (
                          <button
                            onClick={() => deletePostComment(post.id, c.id)}
                            title="Xóa bình luận này (GVCN)"
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCommentSubmit(post.id);
                    }}
                    placeholder="Viết lời chúc hoặc chia sẻ yêu thương..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    onClick={() => handleCommentSubmit(post.id)}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Post Modal (with Direct Photo Upload from Phone or Computer) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Gửi Lời Yêu Thương & Tải Ảnh Lên Góc Hạnh Phúc 12A7
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chủ đề chia sẻ
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as HappyPost['category'])}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="gratitude">💖 Lời cảm ơn & Yêu thương</option>
                  <option value="good_deed">🌟 Mỗi tuần một việc tốt</option>
                  <option value="spotlight">🏆 Gương sáng 12A7</option>
                  <option value="birthday">🎂 Chúc mừng sinh nhật</option>
                  <option value="memory">📸 Khoảnh khắc & Kỷ niệm lớp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tiêu đề bài viết *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Cảm ơn bạn Mai Anh đã giảng bài Hóa giúp mình..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nội dung chia sẻ *
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Viết những lời chân thành gửi tới thầy cô, bạn bè tập thể 12A7..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Upload Photo from Phone or Computer */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Đính kèm hình ảnh (Tải từ Điện thoại / Máy tính hoặc dán link)
                </label>

                <input
                  ref={createFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileSelect(e, 'create')}
                  className="hidden"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => createFileInputRef.current?.click()}
                    disabled={isUploadingCreateImg}
                    className="px-3.5 py-2.5 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/70 hover:bg-rose-100/80 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4 shrink-0" />
                    <span>
                      {isUploadingCreateImg ? 'Đang xử lý ảnh...' : 'Chọn ảnh từ Máy tính / ĐT'}
                    </span>
                  </button>

                  <input
                    type="text"
                    value={imageUrl.startsWith('data:image/') ? '' : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Hoặc dán URL hình ảnh (https://...)"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {uploadError && (
                  <p className="text-xs text-red-600 font-semibold">{uploadError}</p>
                )}

                {imageUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-48">
                    <img
                      src={imageUrl}
                      alt="Xem trước ảnh tải lên"
                      className="w-full h-44 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Xóa ảnh
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUploadingCreateImg}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Đăng lên Góc Hạnh Phúc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Post Modal (GVCN) */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Chỉnh Sửa Bài Viết Góc Hạnh Phúc (GVCN)
                </h3>
              </div>
              <button
                onClick={() => setEditingPost(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chủ đề bài viết
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as HappyPost['category'])}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gratitude">💖 Lời cảm ơn & Yêu thương</option>
                  <option value="good_deed">🌟 Mỗi tuần một việc tốt</option>
                  <option value="spotlight">🏆 Gương sáng 12A7</option>
                  <option value="birthday">🎂 Chúc mừng sinh nhật</option>
                  <option value="memory">📸 Khoảnh khắc & Kỷ niệm lớp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tiêu đề bài viết *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nội dung chia sẻ *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Hình ảnh đính kèm (Tải ảnh từ Máy tính / Điện thoại hoặc URL)
                </label>

                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileSelect(e, 'edit')}
                  className="hidden"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={isUploadingEditImg}
                    className="px-3.5 py-2.5 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/70 hover:bg-blue-100/80 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4 shrink-0" />
                    <span>{isUploadingEditImg ? 'Đang tải ảnh...' : 'Đổi ảnh từ Máy tính / ĐT'}</span>
                  </button>

                  <input
                    type="text"
                    value={editImageUrl.startsWith('data:image/') ? '' : editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="Hoặc dán link ảnh https://..."
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {editImageUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-48">
                    <img
                      src={editImageUrl}
                      alt="Xem trước ảnh"
                      className="w-full h-44 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditImageUrl('')}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Xóa ảnh
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
