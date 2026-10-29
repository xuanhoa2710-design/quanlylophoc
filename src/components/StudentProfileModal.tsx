import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  User,
  Camera,
  Upload,
  Link as LinkIcon,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Target,
  BookOpen,
  Heart,
  CheckCircle2,
  Award,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentStudent, updateStudent } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Student>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarInputUrl, setAvatarInputUrl] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState<boolean>(false);

  useEffect(() => {
    if (currentStudent) {
      setFormData({
        name: currentStudent.name,
        phone: currentStudent.phone,
        email: currentStudent.email,
        birthday: currentStudent.birthday,
        birthPlace: currentStudent.birthPlace,
        address: currentStudent.address,
        ethnicity: currentStudent.ethnicity,
        religion: currentStudent.religion,
        examSubject1: currentStudent.examSubject1,
        examSubject2: currentStudent.examSubject2,
        dreamCareer: currentStudent.dreamCareer,
        strengths: currentStudent.strengths,
        weaknesses: currentStudent.weaknesses,
        hobbies: currentStudent.hobbies,
        primaryParentPhone: currentStudent.primaryParentPhone,
        pinCode: currentStudent.pinCode || '',
      });
      setAvatarPreview(currentStudent.avatar || PRESET_AVATARS[0]);
      setAvatarInputUrl(currentStudent.avatar || '');
      setUploadError(null);
    }
  }, [currentStudent, isOpen]);

  if (!isOpen || !currentStudent) return null;

  // Handle local file upload (converts to base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Vui lòng chọn ảnh dung lượng dưới 5MB để đảm bảo tốc độ.');
        return;
      }
      setUploadError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setAvatarPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (avatarInputUrl.trim()) {
      setAvatarPreview(avatarInputUrl.trim());
      setShowUrlInput(false);
    }
  };

  const handleSelectPreset = (url: string) => {
    setAvatarPreview(url);
    setAvatarInputUrl(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: Student = {
      ...currentStudent,
      ...formData,
      avatar: avatarPreview,
    };

    updateStudent(updated);
    setShowSuccessToast(true);

    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md">
              <User className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold">
                  Hồ sơ cá nhân & Ảnh đại diện
                </h3>
                {currentStudent.classRole && (
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs">
                    {currentStudent.classRole}
                  </span>
                )}
              </div>
              <p className="text-blue-200 text-xs mt-0.5">
                Học sinh: <strong>{currentStudent.name}</strong> • Mã: {currentStudent.code} • Lớp 12A7 • Tổ {currentStudent.group}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Avatar Edit Section */}
          <div className="bg-gradient-to-br from-blue-50/60 via-slate-50 to-indigo-50/40 p-4 sm:p-5 rounded-2xl border border-blue-100/80">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Ảnh đại diện của bạn</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Preview Circle */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-slate-200 flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={currentStudent.name}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarPreview(PRESET_AVATARS[0])}
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:scale-105"
                  title="Tải ảnh mới từ máy tính / điện thoại"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Actions & Presets */}
              <div className="flex-1 w-full space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh từ thiết bị</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Dán liên kết ảnh</span>
                  </button>
                </div>

                {showUrlInput && (
                  <div className="flex items-center gap-2 pt-1 animate-in fade-in">
                    <input
                      type="url"
                      placeholder="Dán đường dẫn ảnh (https://...)"
                      value={avatarInputUrl}
                      onChange={(e) => setAvatarInputUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                    >
                      Áp dụng
                    </button>
                  </div>
                )}

                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {uploadError}
                  </div>
                )}

                {/* Preset Avatars */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                    Hoặc chọn ảnh đại diện mẫu học sinh:
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(url)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 ${
                          avatarPreview === url
                            ? 'border-blue-600 ring-2 ring-blue-300 scale-105'
                            : 'border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Thông tin liên hệ & cá nhân */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Thông tin liên hệ & Cá nhân</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên của bạn:
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Họ và tên học sinh"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại của bạn (Zalo):
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="09xx xxx xxx"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email cá nhân:
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="email@gmail.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày sinh:
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formData.birthday || ''}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nơi sinh:
                </label>
                <input
                  type="text"
                  placeholder="TP.HCM, Long An, Tiền Giang..."
                  value={formData.birthPlace || ''}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ hiện tại:
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ấp/Khu phố, Xã Vĩnh Lộc B, Huyện Bình Chánh, TP.HCM"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Mật khẩu bảo mật cá nhân (Chống bạn khác xem trộm) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-purple-600" />
                <span>Mật khẩu bảo vệ cá nhân (Chống bạn khác xem trộm)</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900 font-bold">
                Bảo vệ Hồ sơ & Gia sư AI
              </span>
            </div>
            <p className="text-[11px] text-purple-800/80 mb-3 leading-relaxed">
              Đặt mật khẩu hoặc mã PIN (tối thiểu 4 ký tự). Khi đặt, các bạn học sinh khác không thể mở xem thông tin cá nhân và những câu hỏi riêng tư bạn từng hỏi <strong>Gia Sư AI 12A7</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã PIN / Mật khẩu của bạn:
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    placeholder="VD: 1234, 2009 (để trống nếu không muốn khóa)..."
                    value={formData.pinCode || ''}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-purple-300 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-end">
                <p className="text-[11px] text-slate-500 pb-1">
                  💡 Nếu bạn quên mật khẩu, GVCN Thầy Trương Xuân Hòa có thể hỗ trợ cấp lại bất cứ lúc nào.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Mục tiêu học tập & Ôn thi Tốt nghiệp 2027 */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-600" />
              <span>Mục tiêu & Ôn thi Tốt nghiệp THPT 2027</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ước mơ nghề nghiệp / Ngành học tương lai:
                </label>
                <input
                  type="text"
                  placeholder="Bác sĩ, Kỹ sư CNTT, Kinh doanh, Giáo viên..."
                  value={formData.dreamCareer || ''}
                  onChange={(e) => setFormData({ ...formData, dreamCareer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại Phụ huynh (khi cần liên hệ):
                </label>
                <input
                  type="tel"
                  placeholder="09xx xxx xxx"
                  value={formData.primaryParentPhone || ''}
                  onChange={(e) => setFormData({ ...formData, primaryParentPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Môn thi tốt nghiệp tự chọn 1:
                </label>
                <select
                  value={formData.examSubject1 || 'Vật lý'}
                  onChange={(e) => setFormData({ ...formData, examSubject1: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Vật lý">Vật lý</option>
                  <option value="Hóa học">Hóa học</option>
                  <option value="Sinh học">Sinh học</option>
                  <option value="Lịch sử">Lịch sử</option>
                  <option value="Địa lý">Địa lý</option>
                  <option value="GDKT-PL">GDKT-PL</option>
                  <option value="Tin học">Tin học</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Môn thi tốt nghiệp tự chọn 2:
                </label>
                <select
                  value={formData.examSubject2 || 'Hóa học'}
                  onChange={(e) => setFormData({ ...formData, examSubject2: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Hóa học">Hóa học</option>
                  <option value="Vật lý">Vật lý</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Lịch sử">Lịch sử</option>
                  <option value="Địa lý">Địa lý</option>
                  <option value="GDKT-PL">GDKT-PL</option>
                  <option value="Tin học">Tin học</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Điểm mạnh của bạn:
                </label>
                <input
                  type="text"
                  placeholder="Tư duy logic, chăm chỉ, thuyết trình tốt..."
                  value={formData.strengths || ''}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Điểm cần thầy cô & bạn bè hỗ trợ thêm:
                </label>
                <input
                  type="text"
                  placeholder="Kỹ năng làm bài trắc nghiệm nhanh, từ vựng Tiếng Anh..."
                  value={formData.weaknesses || ''}
                  onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sở thích cá nhân:
                </label>
                <input
                  type="text"
                  placeholder="Đọc sách, đá bóng, nghe nhạc, vẽ tranh..."
                  value={formData.hobbies || ''}
                  onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Success Toast Banner */}
          {showSuccessToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Đã lưu thành công thông tin cá nhân và ảnh đại diện!</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
