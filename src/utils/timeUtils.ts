// Tiện ích chuẩn hóa Ngày & Giờ theo múi giờ Việt Nam (Asia/Ho_Chi_Minh, GMT+7)
// Khắc phục hoàn toàn lỗi lệch 7 tiếng khi dùng toISOString() (UTC)

export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

export function getVietnamDateParts(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number; // 0 = Chủ Nhật, 1 = Thứ 2 .. 6 = Thứ 7
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: VIETNAM_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      weekday: 'short',
    });
    const parts = formatter.formatToParts(date);
    const getVal = (type: string) => parts.find((p) => p.type === type)?.value || '';
    const year = Number(getVal('year')) || date.getFullYear();
    const month = Number(getVal('month')) || date.getMonth() + 1;
    const day = Number(getVal('day')) || date.getDate();
    let hour = Number(getVal('hour'));
    if (isNaN(hour)) hour = date.getHours();
    if (hour === 24) hour = 0;
    const minute = Number(getVal('minute'));
    const second = Number(getVal('second'));
    const wdMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const dayOfWeek = wdMap[getVal('weekday')] ?? date.getDay();
    return {
      year,
      month,
      day,
      hour,
      minute: isNaN(minute) ? date.getMinutes() : minute,
      second: isNaN(second) ? date.getSeconds() : second,
      dayOfWeek,
    };
  } catch {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      dayOfWeek: date.getDay(),
    };
  }
}

/** Trả về YYYY-MM-DD theo giờ Việt Nam (GMT+7) */
export function getVietnamDateIso(date: Date = new Date()): string {
  const { year, month, day } = getVietnamDateParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Trả về YYYY-MM-DD HH:mm theo giờ Việt Nam (GMT+7) */
export function getVietnamDateTimeStr(date: Date = new Date()): string {
  const { year, month, day, hour, minute } = getVietnamDateParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Trả về HH:mm theo giờ Việt Nam (GMT+7) */
export function getVietnamTimeStr(date: Date = new Date()): string {
  const { hour, minute } = getVietnamDateParts(date);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Trả về DD/MM/YYYY theo giờ Việt Nam (GMT+7) */
export function getVietnamDateVN(date: Date = new Date()): string {
  const { year, month, day } = getVietnamDateParts(date);
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

/** Chuyển chuỗi YYYY-MM-DD -> DD/MM/YYYY */
export function formatDateVN(dateStr?: string): string {
  if (!dateStr) return '';
  const m = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return dateStr;
}

/** Chuyển chuỗi YYYY-MM-DD -> Thứ ... (DD/MM/YYYY) */
export function formatDateWithWeekdayVN(dateStr?: string): string {
  if (!dateStr) return '';
  const m = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const wd = dt.getDay();
  const labels = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return `${labels[wd] || ''} (${m[3]}/${m[2]}/${m[1]})`;
}

/** Chuyển chuỗi YYYY-MM-DD HH:mm -> HH:mm • DD/MM/YYYY */
export function formatDateTimeVN(dateTimeStr?: string): string {
  if (!dateTimeStr) return '';
  const m = dateTimeStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (m) {
    const datePart = `${m[3]}/${m[2]}/${m[1]}`;
    if (m[4] && m[5]) {
      return `${m[4]}:${m[5]} • ${datePart}`;
    }
    return datePart;
  }
  return dateTimeStr;
}

/** Trả về tên Thứ tiếng Việt hôm nay theo giờ Việt Nam (mặc định Thứ Hai..Thứ Sáu cho lịch học) */
export function getVietnamTimetableDayName(date: Date = new Date()): string {
  const { dayOfWeek } = getVietnamDateParts(date);
  const map: Record<number, string> = {
    1: 'Thứ Hai',
    2: 'Thứ Ba',
    3: 'Thứ Tư',
    4: 'Thứ Năm',
    5: 'Thứ Sáu',
  };
  return map[dayOfWeek] || 'Thứ Hai';
}
