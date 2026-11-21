/**
 * Comprehensive Vietnamese GVCN pronoun sanitizer for Class 12A7 (THPT Vĩnh Lộc B).
 * Homeroom teacher (GVCN) is strictly male: Thầy Trương Xuân Hòa (xưng "Thầy").
 *
 * Ensures auto-generated / AI-generated / legacy comments NEVER refer to GVCN as "Cô",
 * while preserving legitimate phrases like "thầy cô" (teachers in general),
 * female subject teachers (Cô Đinh Thị Đào, Cô Ngô Thị Thảo, Cô Hồ Thị Vân Anh,
 * Cô Đinh Thị Liên, Cô Tạ Thị Tình when not GVCN), and unrelated words (cô lập, cô đọng...).
 */

const PROTECTED_PATTERNS: RegExp[] = [
  // Collective teacher phrases
  /\b(?:quý\s+|các\s+)?thầy\s*(?:và\s+|,\s*|\/\s*|\s+)cô(?:\s+giáo)?\b/gi,
  // Female subject teachers of 12A7 (when NOT tagged as GVCN)
  /\bCô\s+(?:Đinh\s+Thị\s+Đào|Ngô\s+Thị\s+Thảo|Hồ\s+Thị\s+Vân\s+Anh|Đinh\s+Thị\s+Liên|Đào|Thảo|Vân\s+Anh|Liên)\b/g,
  // Unrelated Vietnamese compound words starting with "cô"
  /\bcô\s+(?:lập|đơn|đọng|chú|bác|dì|gái|bé|tiên|nàng|tấm|độc|quạnh|tịch|nhi|dâu|đặc|chiêu|thế|hồn)\b/gi,
];

const GVCN_AFTER_VERBS_REGEX =
  /(^|[\s"“'(,;:\-–—])(Cô|cô)(?=\s+(?:rất|luôn|đã|đang|sẽ|cũng|vẫn|vừa|xin|trân\s+trọng|gửi|mong|chúc|tin|hy\s+vọng|hi\s+vọng|kỳ\s+vọng|kì\s+vọng|ghi\s+nhận|nhận\s+thấy|thấy|đánh\s+giá|khen|biểu\s+dương|nhắc|khuyên|đề\s+nghị|yêu\s+cầu|chia\s+sẻ|đồng\s+hành|hỗ\s+trợ|giúp|tự\s+hào|vui|mừng|yên\s+tâm|an\s+tâm|lo\s+lắng|quan\s+tâm|trao\s+đổi|thông\s+báo|nhắn|dặn|hẹn|kính|mời|chào|cảm\s+ơn|cám\s+ơn|biết|hiểu|muốn|cần|có|là|và|cùng|với|nhé|nha|ạ|em|con|các\s+em|quý\s+phụ\s+huynh|phụ\s+huynh|gia\s+đình|cháu|hài\s+lòng|nhận\s+xét|lưu\s+ý|chú\s+ý|thương|quý|động\s+viên|khích\s+lệ|theo\s+dõi|sát\s+sao|kèm\s+cặp|nhờ|xem|kiểm\s+tra|tổ\s+chức|phối\s+hợp|báo|nói|viết|làm|giáo|chủ\s+nhiệm|Hòa|Trương\s+Xuân\s+Hòa)\b)/g;

const GVCN_BEFORE_PREPOSITIONS_REGEX =
  /\b(của|với|cùng|cho|từ|gửi|nhờ|hỏi|gặp|báo|liên\s+hệ|trao\s+đổi\s+với|phối\s+hợp\s+cùng|phối\s+hợp\s+với|đồng\s+hành\s+cùng|đồng\s+hành\s+với|cảm\s+ơn|cám\s+ơn|kính\s+gửi|nhắn|gọi|thưa|dạ|vâng|hỗ\s+trợ|giúp|về\s+phía|phía|bên|lớp\s+và|bạn\s+bè\s+và|gia\s+đình\s+và|phụ\s+huynh\s+và)\s+(Cô|cô)(?=\s|[.,!?;:\n)"”]|$)/gi;

export function sanitizeTeacherPronouns(rawText?: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  // 1. Replace explicit legacy GVCN name references first
  let text = rawText
    .replace(/Cô\s+Tạ\s+Thị\s+Tình\s*\(GVCN\)/gi, 'Thầy Trương Xuân Hòa (GVCN)')
    .replace(/\bCô\s+Tạ\s+Thị\s+Tình\b/gi, 'Thầy Trương Xuân Hòa (GVCN)')
    .replace(/\bCô\s+Tình\b/gi, 'Thầy Trương Xuân Hòa')
    .replace(/\bCô\s+Trương\s+Xuân\s+Hòa\b/gi, 'Thầy Trương Xuân Hòa')
    .replace(/\bCô\s+Hòa\b/gi, 'Thầy Hòa')
    .replace(/những ly trà sữa cô mời/gi, 'những lời động viên của thầy')
    .replace(/hạnh phúc lớn nhất của cô/gi, 'niềm tự hào lớn nhất của thầy');

  // 2. Temporarily protect legitimate phrases ("thầy cô", female subject teachers, "cô lập"...)
  const placeholders: string[] = [];
  for (const pattern of PROTECTED_PATTERNS) {
    text = text.replace(pattern, (match) => {
      const idx = placeholders.length;
      placeholders.push(match);
      return `__KEEP_CO_${idx}__`;
    });
  }

  // 3. Replace GVCN titles & gendered phrases
  text = text
    .replace(/Cô giáo chủ nhiệm/g, 'Thầy giáo chủ nhiệm')
    .replace(/cô giáo chủ nhiệm/g, 'thầy giáo chủ nhiệm')
    .replace(/Cô chủ nhiệm/g, 'Thầy chủ nhiệm')
    .replace(/cô chủ nhiệm/g, 'thầy chủ nhiệm')
    .replace(/Cô giáo/g, 'Thầy giáo')
    .replace(/cô giáo/g, 'thầy giáo');

  // 4. Replace "Cô/cô" when followed by teacher verbs/pronouns
  text = text.replace(GVCN_AFTER_VERBS_REGEX, (_match, prefix, word) => {
    const replacement = word === 'Cô' ? 'Thầy' : 'thầy';
    return `${prefix}${replacement}`;
  });

  // 5. Replace "Cô/cô" when preceded by prepositions referring to GVCN
  text = text.replace(GVCN_BEFORE_PREPOSITIONS_REGEX, (_match, prep, word) => {
    const replacement = word === 'Cô' ? 'Thầy' : 'thầy';
    return `${prep} ${replacement}`;
  });

  // 6. Replace standalone "Cô," or sentence-leading "Cô " if missed
  text = text
    .replace(/(^|[.!?\n]\s*)Cô(?=\s|,)/g, '$1Thầy')
    .replace(/\bCô\s*\(GVCN\)/gi, 'Thầy (GVCN)');

  // 7. Restore protected placeholders
  text = text.replace(/__KEEP_CO_(\d+)__/g, (_match, idxStr) => {
    const idx = Number(idxStr);
    return placeholders[idx] ?? '';
  });

  return text;
}
