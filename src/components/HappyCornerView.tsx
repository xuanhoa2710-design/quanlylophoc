import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HappyPost } from '../types';
import {
  Heart,
  Sparkles,
  Cake,
  Camera,
  MessageCircle,
  Plus,
  Send,
  X,
  Share2,
  Calendar,
  ThumbsUp,
  Award,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Save,
} from 'lucide-react';

export const HappyCornerView: React.FC = () => {
  const {
    role,
    students,
    activeStudentId,
    currentStudent,
    happyPosts,
    addHappyPost,
    updateHappyPost,
    deleteHappyPost,
    deletePostComment,
    toggleLikePost,
    addPostComment,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

  // Form states for creating post
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HappyPost['category']>('good_deed');
  const [newContent, setNewContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Form states for editing post (GVCN)
  const [editingPost, setEditingPost] = useState<HappyPost | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<HappyPost['category']>('good_deed');
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  // Delete post confirmation state
  const [deletingPost, setDeletingPost] = useState<HappyPost | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenEditPost = (post: HappyPost) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditCategory(post.category);
    setEditContent(post.content);
    setEditImageUrl(post.imageUrl || '');
  };

  const handleSaveEditPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Vui lòng điền tiêu đề và nội dung bài viết!');
      return;
    }

    updateHappyPost(editingPost.id, {
      title: editTitle.trim(),
      category: editCategory,
      content: editContent.trim(),
      imageUrl: editImageUrl.trim() || undefined,
    });

    setEditingPost(null);
    showToast('Đã cập nhật bài viết Góc Hạnh Phúc!');
  };

  const handleConfirmDeletePost = () => {
    if (!deletingPost) return;
    deleteHappyPost(deletingPost.id);
    showToast(`Đã xóa bài viết "${deletingPost.title}"!`);
    setDeletingPost(null);
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    deletePostComment(postId, commentId);
    showToast('Đã xóa bình luận!');
  };

  // Birthday filter for October or upcoming
  const currentMonth = 10; // Tháng 10
  const birthdayStudentsInOctober = (students || []).filter((s) => {
    const parts = (s?.birthday || '').split('/');
    if (parts.length >= 2) {
      return parseInt(parts[1], 10) === currentMonth;
    }
    return false;
  });

  const categories = [
    { id: 'all', label: 'Tất cả bài viết' },
    { id: 'good_deed', label: '🌱 Nhật ký điều tốt' },
    { id: 'gratitude', label: '💌 Lời cảm ơn' },
    { id: 'birthday', label: '🎂 Sinh nhật tháng 10' },
    { id: 'spotlight', label: '🌟 Người tốt việc tốt' },
    { id: 'album', label: '📸 Album ảnh lớp 12A7' },
    { id: 'memory', label: '🌈 Kỷ niệm thanh xuân' },
  ];

  const filteredPosts = (happyPosts || []).filter((p) => {
    if (activeCategory === 'all') return true;
    return p?.category === activeCategory;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const authorName =
      role === 'teacher'
        ? 'Thầy Trương Xuân Hòa (GVCN)'
        : (currentStudent?.name || 'Học sinh 12A7');

    addHappyPost({
      title: newTitle,
      category: newCategory,
      content: newContent,
      authorName,
      authorRole: role,
      imageUrl:
        newImageUrl ||
        (newCategory === 'album'
          ? 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'
          : undefined),
    });

    setNewTitle('');
    setNewContent('');
    setNewImageUrl('');
    setShowCreateModal(false);
  };

  const handleSendComment = (postId: string) => {
    const text = commentInput[postId];
    if (!text?.trim()) return;

    const authorName =
      role === 'teacher'
        ? 'Thầy Trương Xuân Hòa'
        : (currentStudent?.name || 'Thành viên 12A7');

    addPostComment(postId, authorName, text);
    setCommentInput({ ...commentInput, [postId]: '' });
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-2">
              <Heart className="w-3.5 h-3.5 text-pink-200 fill-pink-200" />
              <span>LAN TỎA NĂNG LƯỢNG TÍCH CỰC</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Góc Hạnh Phúc A7
            </h2>
            <p className="text-pink-100 text-xs sm:text-sm mt-1 max-w-xl">
              Nơi lưu giữ từng khoảnh khắc đáng nhớ, những lời tri ân chân thành và nhật ký những điều tử tế của 50 thành viên 12A7 THPT Vĩnh Lộc B!
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 font-black text-xs shadow-lg transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Chia sẻ điều tốt / Lời cảm ơn
          </button>
        </div>
      </div>

      {/* Birthday Banner Widget: Sinh nhật học sinh trong Tháng 10 */}
      <div className="bg-gradient-to-br from-amber-50 via-pink-50 to-orange-50 border border-orange-200 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-orange-200/60 mb-3">
          <div className="flex items-center gap-2">
            <Cake className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-bold text-orange-950">
              Sinh nhật các bạn 12A7 trong Tháng 10 🎂
            </h3>
          </div>
          <span className="text-[11px] font-bold text-orange-700">
            {birthdayStudentsInOctober.length} thành viên
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {birthdayStudentsInOctober.map((stu) => (
            <div
              key={stu.id}
              className="bg-white p-3 rounded-2xl border border-orange-100 shadow-2xs flex flex-col items-center text-center group hover:scale-105 transition-all"
            >
              <div className="relative mb-2">
                <img
                  src={stu.avatar}
                  alt={stu.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-300"
                />
                <span className="absolute -top-1 -right-1 text-sm">🎉</span>
              </div>
              <div className="font-bold text-xs text-slate-900 line-clamp-1">{stu.name}</div>
              <div className="text-[10px] text-orange-700 font-semibold mt-0.5">
                {stu.birthday}
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5">Tổ {stu.group}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
              activeCategory === cat.id
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => {
          const isLiked = (post?.likedBy || []).includes(activeStudentId);
          const commentsList = post?.comments || [];

          return (
            <div
              key={post.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Image if available */}
                {post.imageUrl && (
                  <div className="w-full h-48 sm:h-56 overflow-hidden bg-slate-100">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{post.authorName}</span>
                      <span>•</span>
                      <span>{post.createdAt}</span>
                      {post.updatedAt && (
                        <span className="text-[10px] text-orange-600 font-semibold">
                          (Đã sửa {post.updatedAt})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                        {categories.find((c) => c.id === post.category)?.label.slice(2) || 'Bài viết'}
                      </span>
                      {role === 'teacher' && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <button
                            onClick={() => handleOpenEditPost(post)}
                            className="px-2.5 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                            title="Chỉnh sửa bài viết này (GVCN)"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-orange-600" /> Sửa
                          </button>
                          <button
                            onClick={() => setDeletingPost(post)}
                            className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                            title="Xóa bài viết này (GVCN)"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" /> Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-black text-base text-slate-900 mb-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                    {post.content}
                  </p>

                  {/* Likes and Comments counter */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => toggleLikePost(post.id, activeStudentId)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all font-bold ${
                        isLiked
                          ? 'bg-pink-50 text-pink-600'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-600' : ''}`} />
                      <span>{post.likes ?? 0} Yêu thương</span>
                    </button>

                    <span className="text-slate-400 text-[11px]">
                      {commentsList.length} bình luận
                    </span>
                  </div>

                  {/* Comments list */}
                  {commentsList.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      {commentsList.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 text-xs relative group">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-slate-900 text-[11px]">{c.author}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">{c.time}</span>
                              {role === 'teacher' && (
                                <button
                                  onClick={() => handleDeleteComment(post.id, c.id)}
                                  className="text-slate-300 hover:text-red-500 transition-colors p-0.5 rounded"
                                  title="Xóa bình luận này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Add comment bar */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Gửi lời chúc, chia sẻ yêu thương..."
                  value={commentInput[post.id] || ''}
                  onChange={(e) =>
                    setCommentInput({ ...commentInput, [post.id]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendComment(post.id);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={() => handleSendComment(post.id)}
                  className="p-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 mb-4 pb-2 border-b">
              Chia sẻ vào Góc Hạnh Phúc 12A7
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chủ đề chia sẻ</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="good_deed">🌱 Nhật ký điều tốt mỗi ngày</option>
                  <option value="gratitude">💌 Lời cảm ơn thầy cô, bạn bè</option>
                  <option value="spotlight">🌟 Gương người tốt việc tốt</option>
                  <option value="memory">🌈 Khoảnh khắc thanh xuân đáng nhớ</option>
                  <option value="album">📸 Album ảnh kỷ niệm lớp</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu đề bài viết</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lời cảm ơn bạn tổ trưởng đã giúp mình học Hóa..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung câu chuyện</label>
                <textarea
                  rows={5}
                  placeholder="Chia sẻ chân thành từ trái tim bạn..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Link hình ảnh kỷ niệm (nếu có)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
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
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  Đăng lên Góc Hạnh Phúc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT POST MODAL (GVCN) */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-auto border border-slate-100">
            <button
              onClick={() => setEditingPost(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-3 border-b mb-4">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Chỉnh Sửa Bài Viết Góc Hạnh Phúc
                </h3>
                <p className="text-xs text-slate-500">
                  Cập nhật tiêu đề, nội dung và hình ảnh bài viết
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEditPost} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chủ đề bài viết</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white text-slate-900"
                >
                  <option value="good_deed">🌱 Nhật ký điều tốt mỗi ngày</option>
                  <option value="gratitude">💌 Lời cảm ơn thầy cô, bạn bè</option>
                  <option value="spotlight">🌟 Gương người tốt việc tốt</option>
                  <option value="memory">🌈 Khoảnh khắc thanh xuân đáng nhớ</option>
                  <option value="album">📸 Album ảnh kỷ niệm lớp</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu đề bài viết</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung câu chuyện</label>
                <textarea
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Link hình ảnh kỷ niệm (URL)</label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-3.5 h-3.5" /> Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE POST MODAL */}
      {deletingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1">
              Xóa Bài Viết Này?
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Bạn có chắc muốn gỡ bài viết <strong>"{deletingPost.title}"</strong> khỏi Góc Hạnh Phúc? Thao tác này không thể hoàn tác.
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeletingPost(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDeletePost}
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
