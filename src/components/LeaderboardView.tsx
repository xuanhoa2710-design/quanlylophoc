import React, { useState } from 'react';
import { useApp, getWeekRangeByIndex } from '../context/AppContext';
import { Student } from '../types';
import {
  Trophy,
  Award,
  Medal,
  Star,
  Users,
  Flame,
  Crown,
  Heart,
  Sparkles,
} from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { students, currentStudent, currentWeek, getStudentWeeklyScore } = useApp();
  const currentWeekRange = getWeekRangeByIndex(currentWeek);

  const [activeCategory, setActiveCategory] = useState<'discipline' | 'attendance' | 'activity' | 'overall'>('overall');

  // Categories & titles
  const categories = [
    {
      id: 'overall' as const,
      title: '🏆 Học Sinh Toàn Diện',
      sub: 'Cân bằng xuất sắc giữa Thi đua rèn luyện, Chuyên cần và Hoạt động',
      badge: 'Toàn diện A7',
      color: 'from-amber-500 to-yellow-600',
    },
    {
      id: 'discipline' as const,
      title: '🥇 Ngôi Sao Thi Đua',
      sub: `Dẫn đầu điểm thi đua rèn luyện (${currentWeekRange.rangeLabel} • 100 điểm gốc)`,
      badge: 'Gương mẫu A7',
      color: 'from-blue-600 to-indigo-700',
    },
    {
      id: 'attendance' as const,
      title: '🥈 Chuyên Cần Tiêu Biểu',
      sub: 'Gương mẫu đi học đúng giờ 100%, không vắng không trễ',
      badge: 'Kỷ luật thép',
      color: 'from-emerald-600 to-teal-700',
    },
    {
      id: 'activity' as const,
      title: '🥉 Công Dân Tích Cực',
      sub: 'Hăng hái trong phong trào Đoàn, trực nhật và hỗ trợ tập thể',
      badge: 'Trái tim A7',
      color: 'from-orange-500 to-red-600',
    },
  ];

  // Ranking calculation
  const getRankedStudents = () => {
    const list = [...students];
    if (activeCategory === 'discipline') {
      return list.sort((a, b) => {
        const scoreA = getStudentWeeklyScore(a.id, currentWeek).total;
        const scoreB = getStudentWeeklyScore(b.id, currentWeek).total;
        return scoreB - scoreA;
      });
    }
    if (activeCategory === 'attendance') {
      return list.sort((a, b) => {
        if (b.attendanceStats.rate !== a.attendanceStats.rate) {
          return b.attendanceStats.rate - a.attendanceStats.rate;
        }
        return a.attendanceStats.late - b.attendanceStats.late;
      });
    }
    if (activeCategory === 'activity') {
      return list.sort((a, b) => b.activityPoints - a.activityPoints);
    }
    // Overall: Weighted formula: WeeklyScore * 0.6 + AttendanceRate * 0.2 + Activity * 2
    return list.sort((a, b) => {
      const discA = getStudentWeeklyScore(a.id, currentWeek).total;
      const discB = getStudentWeeklyScore(b.id, currentWeek).total;
      const scoreA = discA * 0.6 + a.attendanceStats.rate * 0.2 + a.activityPoints * 2;
      const scoreB = discB * 0.6 + b.attendanceStats.rate * 0.2 + b.activityPoints * 2;
      return scoreB - scoreA;
    });
  };

  const rankedStudents = getRankedStudents();
  const top10 = rankedStudents.slice(0, 10);
  const top3 = top10.slice(0, 3);
  const rest7 = top10.slice(3);

  const currentCat = categories.find((c) => c.id === activeCategory)!;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>BẢNG XẾP HẠNG VINH DANH TOP 10 LỚP 12A7</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Bảng Vàng Danh Dự 12A7
            </h2>
            <p className="text-blue-200 text-xs sm:text-sm mt-1 max-w-xl">
              Tôn vinh những cá nhân nỗ lực không ngừng nghỉ, cùng nhau tiến bộ theo khẩu hiệu:
              <strong className="text-amber-300 ml-1">"Đoàn kết - Yêu thương - Cùng tiến bộ"</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div className="text-xs">
              <div className="text-white/70">Mục tiêu chung:</div>
              <div className="font-extrabold text-amber-300">Đậu tốt nghiệp & ĐH 100%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-white shadow-md border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-white/80 border-slate-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="text-lg mb-1">{cat.title.slice(0, 2)}</div>
              <div className="text-xs font-extrabold text-slate-900">{cat.title.slice(3)}</div>
              <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{cat.badge}</div>
            </button>
          );
        })}
      </div>

      {/* Top 3 Podium Visual */}
      <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="text-center mb-6">
          <h3 className="text-base font-extrabold text-slate-900">{currentCat.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{currentCat.sub}</p>
        </div>

        {/* Podium Layout */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-xl mx-auto pt-4 pb-2">
          {/* Rank 2 (Left) */}
          {top3[1] && (
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <img
                  src={top3[1].avatar}
                  alt={top3[1].name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-slate-300 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
              </div>
              <div className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">
                {top3[1].name}
              </div>
              <div className="text-[10px] text-slate-500">Tổ {top3[1].group}</div>
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-black text-xs">
                {activeCategory === 'discipline'
                  ? `${getStudentWeeklyScore(top3[1].id, currentWeek).total} đ thi đua`
                  : activeCategory === 'attendance'
                  ? `${top3[1].attendanceStats.rate}%`
                  : activeCategory === 'activity'
                  ? `${top3[1].activityPoints} đ`
                  : `${getStudentWeeklyScore(top3[1].id, currentWeek).total} đ thi đua`}
              </div>
              {/* Podium Block */}
              <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-300 to-slate-200 rounded-t-2xl mt-3 flex items-center justify-center font-black text-slate-600 text-xl shadow-inner">
                🥈
              </div>
            </div>
          )}

          {/* Rank 1 (Center - Tallest) */}
          {top3[0] && (
            <div className="flex flex-col items-center text-center -mt-6">
              <div className="relative mb-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <Crown className="w-6 h-6 text-amber-500 animate-bounce" />
                </div>
                <img
                  src={top3[0].avatar}
                  alt={top3[0].name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-amber-400 shadow-xl ring-4 ring-amber-300/40"
                />
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-md">
                  1
                </span>
              </div>
              <div className="font-black text-xs sm:text-base text-slate-900 line-clamp-1">
                {top3[0].name}
              </div>
              <div className="text-[11px] text-amber-700 font-bold">
                Tổ {top3[0].group} • {currentCat.badge}
              </div>
              <div className="mt-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs shadow-xs">
                {activeCategory === 'discipline'
                  ? `${getStudentWeeklyScore(top3[0].id, currentWeek).total} đ thi đua`
                  : activeCategory === 'attendance'
                  ? `${top3[0].attendanceStats.rate}%`
                  : activeCategory === 'activity'
                  ? `${top3[0].activityPoints} đ`
                  : `${getStudentWeeklyScore(top3[0].id, currentWeek).total} đ thi đua`}
              </div>
              {/* Podium Block */}
              <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-amber-400 to-yellow-300 rounded-t-2xl mt-3 flex items-center justify-center font-black text-amber-900 text-2xl shadow-inner">
                🥇
              </div>
            </div>
          )}

          {/* Rank 3 (Right) */}
          {top3[2] && (
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <img
                  src={top3[2].avatar}
                  alt={top3[2].name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-orange-400 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-400 text-orange-950 font-black text-xs flex items-center justify-center shadow-xs">
                  3
                </span>
              </div>
              <div className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">
                {top3[2].name}
              </div>
              <div className="text-[10px] text-slate-500">Tổ {top3[2].group}</div>
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-black text-xs">
                {activeCategory === 'discipline'
                  ? `${getStudentWeeklyScore(top3[2].id, currentWeek).total} đ thi đua`
                  : activeCategory === 'attendance'
                  ? `${top3[2].attendanceStats.rate}%`
                  : activeCategory === 'activity'
                  ? `${top3[2].activityPoints} đ`
                  : `${getStudentWeeklyScore(top3[2].id, currentWeek).total} đ thi đua`}
              </div>
              {/* Podium Block */}
              <div className="w-full h-20 sm:h-24 bg-gradient-to-t from-orange-300 to-orange-200 rounded-t-2xl mt-3 flex items-center justify-center font-black text-orange-800 text-xl shadow-inner">
                🥉
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ranks 4 to 10 Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Top 4 - 10 Danh dự lớp 12A7
        </h4>

        <div className="space-y-2">
          {rest7.map((stu, i) => {
            const rank = i + 4;
            const isMe = stu.id === currentStudent?.id;

            return (
              <div
                key={stu.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isMe
                    ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
                    : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-slate-500 text-xs">
                    #{rank}
                  </span>
                  <img
                    src={stu.avatar}
                    alt={stu.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span>{stu.name}</span>
                      {stu.classRole && stu.classRole !== 'Học sinh' && (
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black">
                          {stu.classRole}
                        </span>
                      )}
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded-sm bg-blue-600 text-white text-[10px] font-bold">
                          Bạn
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {stu.code} • Tổ {stu.group} • {stu.dreamCareer}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-xs text-blue-700">
                    {activeCategory === 'discipline'
                      ? `${getStudentWeeklyScore(stu.id, currentWeek).total} đ thi đua`
                      : activeCategory === 'attendance'
                      ? `${stu.attendanceStats.rate}% chuyên cần`
                      : activeCategory === 'activity'
                      ? `${stu.activityPoints} điểm`
                      : `${getStudentWeeklyScore(stu.id, currentWeek).total} đ thi đua`}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500">
                    Tổ {stu.group} • {stu.attendanceStats.rate}% chuyên cần
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
