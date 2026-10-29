// Quản lý Tuần học theo từ Thứ 2 đến Thứ 6 hàng tuần (Không hiển thị "Tuần 1, Tuần 2...")
// Ví dụ chuẩn: "Từ ngày 26/10 đến 30/10" (Thứ 2 ngày 26/10/2026 đến Thứ 6 ngày 30/10/2026)

export interface SchoolWeekRange {
  weekIndex: number; // Internal ID để lưu trữ tương thích (ví dụ 6 = tuần 26/10 - 30/10)
  mondayDate: string; // YYYY-MM-DD
  fridayDate: string; // YYYY-MM-DD
  mondayIso: string; // YYYY-MM-DD (alias)
  fridayIso: string; // YYYY-MM-DD (alias)
  mondayShort: string; // DD/MM (ví dụ: 26/10)
  fridayShort: string; // DD/MM (ví dụ: 30/10)
  fridayFull: string; // DD/MM/YYYY (ví dụ: 30/10/2026)
  rangeLabel: string; // "Từ ngày 26/10 đến 30/10"
  shortRangeLabel: string; // "Từ ngày 26/10 đến 30/10" (alias)
  fullRangeLabel: string; // "Từ ngày 26/10 đến 30/10/2026"
  weekdayRangeLabel: string; // "Thứ 2 (26/10) ➔ Thứ 6 (30/10)"
}

// Mốc chuẩn: weekIndex = 6 tương ứng với Thứ 2 (26/10/2026) -> Thứ 6 (30/10/2026)
const ANCHOR_WEEK_INDEX = 6;
const ANCHOR_MONDAY_YEAR = 2026;
const ANCHOR_MONDAY_MONTH = 9; // 0-indexed: 9 = Tháng 10
const ANCHOR_MONDAY_DAY = 26;

export const formatDateIso = (dt: Date): string => {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatShortDayMonth = (dt: Date): string => {
  const d = String(dt.getDate()).padStart(2, '0');
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
};

/**
 * Trả về thông tin khoảng thời gian Thứ 2 -> Thứ 6 từ chỉ số tuần nội bộ (weekIndex)
 */
export const getWeekRangeByIndex = (weekIndex: number): SchoolWeekRange => {
  const safeWeek = typeof weekIndex === 'number' && !isNaN(weekIndex) && weekIndex >= 1 ? weekIndex : ANCHOR_WEEK_INDEX;
  const baseMonday = new Date(ANCHOR_MONDAY_YEAR, ANCHOR_MONDAY_MONTH, ANCHOR_MONDAY_DAY);
  const offsetDays = (safeWeek - ANCHOR_WEEK_INDEX) * 7;

  const monday = new Date(baseMonday);
  monday.setDate(baseMonday.getDate() + offsetDays);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const mondayDate = formatDateIso(monday);
  const fridayDate = formatDateIso(friday);
  const mondayShort = formatShortDayMonth(monday);
  const fridayShort = formatShortDayMonth(friday);
  const fridayFull = `${fridayShort}/${friday.getFullYear()}`;
  const rangeLabel = `Từ ngày ${mondayShort} đến ${fridayShort}`;

  return {
    weekIndex: safeWeek,
    mondayDate,
    fridayDate,
    mondayIso: mondayDate,
    fridayIso: fridayDate,
    mondayShort,
    fridayShort,
    fridayFull,
    rangeLabel,
    shortRangeLabel: rangeLabel,
    fullRangeLabel: `Từ ngày ${mondayShort} đến ${fridayFull}`,
    weekdayRangeLabel: `Thứ 2 (${mondayShort}) ➔ Thứ 6 (${fridayShort})`,
  };
};

/**
 * Tự động xác định weekIndex tương ứng với một ngày YYYY-MM-DD bất kỳ
 */
export const getWeekIndexFromDate = (dateStr: string): number => {
  if (!dateStr) return ANCHOR_WEEK_INDEX;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0])) return ANCHOR_WEEK_INDEX;

  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  const rawDay = dt.getDay();
  // Nếu rơi vào Thứ 7 hoặc Chủ nhật thì lùi về Thứ 6 của tuần đó
  if (rawDay === 6) dt.setDate(dt.getDate() - 1);
  else if (rawDay === 0) dt.setDate(dt.getDate() - 2);

  // Tìm ngày Thứ 2 của tuần chứa dt
  const dayOfWeek = dt.getDay(); // 1..5
  const targetMonday = new Date(dt);
  targetMonday.setDate(dt.getDate() - (dayOfWeek - 1));
  targetMonday.setHours(0, 0, 0, 0);

  const anchorMonday = new Date(ANCHOR_MONDAY_YEAR, ANCHOR_MONDAY_MONTH, ANCHOR_MONDAY_DAY);
  anchorMonday.setHours(0, 0, 0, 0);

  const diffMs = targetMonday.getTime() - anchorMonday.getTime();
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  const computedIndex = ANCHOR_WEEK_INDEX + diffWeeks;

  return Math.max(1, Math.min(35, computedIndex));
};

/**
 * Trả về thông tin Thứ 2 -> Thứ 6 từ một ngày YYYY-MM-DD bất kỳ
 */
export const getWeekRangeFromDate = (dateStr: string): SchoolWeekRange => {
  const idx = getWeekIndexFromDate(dateStr);
  return getWeekRangeByIndex(idx);
};

/**
 * Kiểm tra xem một ngày YYYY-MM-DD có nằm trong tuần weekIndex (từ Thứ 2 đến Chủ nhật của tuần đó) hay không
 */
export const isDateInWeek = (dateStr: string, weekIndex: number): boolean => {
  if (!dateStr) return false;
  const range = getWeekRangeByIndex(weekIndex);
  const [y, m, d] = range.mondayDate.split('-').map(Number);
  const monday = new Date(y, m - 1, d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const sundayIso = formatDateIso(sunday);
  return dateStr >= range.mondayDate && dateStr <= sundayIso;
};

/**
 * Danh sách tất cả các tuần trong năm học (chỉ hiển thị "Từ ngày DD/MM đến DD/MM")
 */
export const getAllSchoolWeeks = (totalWeeks = 35): SchoolWeekRange[] => {
  return Array.from({ length: totalWeeks }, (_, i) => getWeekRangeByIndex(i + 1));
};
