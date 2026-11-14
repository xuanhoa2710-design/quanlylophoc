import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { buildComprehensiveTutorAnswer } from './src/utils/tutorKnowledgeBase';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

function getAiClient(): GoogleGenAI | null {
  try {
    const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim();
    if (apiKey && apiKey !== 'undefined') {
      return new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  } catch (err) {
    console.warn('Gemini SDK initialization warning:', err);
  }
  return null;
}

interface GeminiGenerateResult {
  text: string | null;
  error?: string;
  modelUsed?: string;
}

async function generateGeminiDetailed(
  contents: any,
  systemInstruction?: string,
  extraConfig?: Record<string, any>
): Promise<GeminiGenerateResult> {
  const client = getAiClient();
  if (!client) {
    return {
      text: null,
      error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng kiểm tra Settings > Secrets.',
    };
  }

  const modelsToTry = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
  let lastErrorMsg = 'Không nhận được phản hồi từ Gemini AI.';

  for (const modelName of modelsToTry) {
    try {
      const config: Record<string, any> = {
        ...(extraConfig || {}),
      };
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }
      const response = await client.models.generateContent({
        model: modelName,
        contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });
      if (response.text && response.text.trim().length > 0) {
        return { text: response.text, modelUsed: modelName };
      }
      lastErrorMsg = `Mô hình ${modelName} trả về nội dung trống.`;
    } catch (err: any) {
      lastErrorMsg = err?.message || String(err);
      console.warn(`Gemini call with ${modelName} failed:`, lastErrorMsg);
    }
  }
  return { text: null, error: lastErrorMsg };
}

async function generateGeminiText(
  contents: any,
  systemInstruction?: string,
  extraConfig?: Record<string, any>
): Promise<string | null> {
  const res = await generateGeminiDetailed(contents, systemInstruction, extraConfig);
  return res.text;
}

// 1. AI Student Evaluation
app.post('/api/ai/comment', async (req, res) => {
  const { studentName, gpa, conduct, strengths, weaknesses, aspiration, period } = req.body;

  const prompt = `Bạn là thầy giáo Trương Xuân Hòa, giáo viên chủ nhiệm lớp 12A7 trường THPT Vĩnh Lộc B (lớp học hạnh phúc với khẩu hiệu "Đoàn kết - Yêu thương - Cùng tiến bộ", slogan "Dream Big And Dare To Fail").
Hãy viết một bản nhận xét học sinh định kỳ (${period || 'Tuần / Tháng'}) thật tâm huyết, sâu sắc, giàu tính sư phạm và truyền cảm hứng tích cực cho học sinh sau:
- Tên học sinh: ${studentName || 'Học sinh'}
- Điểm trung bình: ${gpa || 'Khá giỏi'}
- Xếp loại rèn luyện: ${conduct || 'Tốt'}
- Điểm mạnh: ${strengths || 'Ngoan, có tinh thần cầu tiến'}
- Điểm cần cải thiện: ${weaknesses || 'Cần chủ động và tự tin hơn trước tập thể'}
- Nguyện vọng / ước mơ thi TN & ĐH: ${aspiration || 'Quyết tâm đỗ đại học nguyện vọng 1'}

Bản nhận xét cần bao gồm 4 phần rõ ràng:
1. Đánh giá học tập & ý thức (ngắn gọn, chính xác)
2. Điểm mạnh và sự tiến bộ đáng khen
3. Góp ý chân thành, cụ thể để em bứt phá
4. Lời chúc và thông điệp truyền cảm hứng cuối cấp 12`;

  const generated = await generateGeminiText(prompt);
  if (generated) {
    return res.json({ text: generated });
  }

  // Fallback if AI key is unavailable or fails
  const fallbackComment = `Em ${studentName || 'học sinh'} trong giai đoạn ${period || 'vừa qua'} luôn thể hiện tinh thần học tập nghiêm túc, rèn luyện tốt và chấp hành tốt nội quy lớp 12A7.
- Học tập & Kỹ năng: Điểm số duy trì ổn định (${gpa || 'tốt'}), nắm vững kiến thức trọng tâm. Phát huy điểm mạnh: ${strengths || 'tự giác, chăm chỉ'}.
- Điểm cần phát huy: ${weaknesses ? `Cần chú ý khắc phục "${weaknesses}" bằng cách chủ động trao đổi với thầy cô và bạn bè tổ nhóm.` : 'Cần duy trì phong độ và rèn luyện kỹ năng giải đề thi THPT Quốc gia.'}
- Lời nhắn gửi từ GVCN: Năm lớp 12 là bước ngoặt quan trọng, thầy tin tưởng với nỗ lực và sự kiên trì, em sẽ chạm tới ước mơ (${aspiration || 'Đỗ nguyện vọng mơ ước'})! 12A7 luôn tự hào về em!`;

  res.json({ text: fallbackComment });
});

// 2. AI Announcement Generator
app.post('/api/ai/announcement', async (req, res) => {
  const { title, type, audience, keyPoints } = req.body;

  const prompt = `Bạn là thầy Trương Xuân Hòa, GVCN lớp 12A7 THPT Vĩnh Lộc B. Hãy soạn một thông báo chuyên nghiệp, ấm áp, rõ ràng theo thông tin sau:
- Tiêu đề thông báo: ${title}
- Thể loại: ${type} (ví dụ: Thông báo lớp, Báo bài hàng ngày, Lịch thi, Họp phụ huynh, Khẩn)
- Đối tượng: ${audience || 'Học sinh và Phụ huynh lớp 12A7'}
- Nội dung chính cần truyền đạt: ${keyPoints || 'Các lưu ý học tập và thời gian'}

Yêu cầu: Viết giọng văn trang trọng nhưng gần gũi, nêu rõ thời gian, địa điểm, các việc cần chuẩn bị và lời nhắc nhở đoàn kết.`;

  const generated = await generateGeminiText(prompt);
  if (generated) {
    return res.json({ text: generated });
  }

  const fallback = `📢 **THÔNG BÁO LỚP 12A7 - THPT VĨNH LỘC B**
📌 **Về việc:** ${title}
Kính gửi: Quý Phụ huynh và các em Học sinh lớp 12A7,

Giáo viên chủ nhiệm xin thông báo nội dung quan trọng sau:
${keyPoints || '- Đề nghị các em học sinh nắm vững kế hoạch và thực hiện đúng thời hạn quy định.\n- Phụ huynh phối hợp nhắc nhở con chuẩn bị đầy đủ bài vở và dụng cụ học tập.'}

Mọi ý kiến thắc mắc xin vui lòng liên hệ trực tiếp với GVCN qua mục tin nhắn ứng dụng hoặc hotline lớp.
Chúc tập thể 12A7 một tuần học tập tràn đầy năng lượng và hiệu quả!
Trân trọng,
*Thầy Trương Xuân Hòa - GVCN 12A7*`;

  res.json({ text: fallback });
});

// 3. AI Academic Performance & Risk Analysis
app.post('/api/ai/analysis', async (req, res) => {
  const { classSummary, atRiskStudents, subjectAverages } = req.body;

  const prompt = `Bạn là chuyên gia cố vấn giáo dục THPT và GVCN lớp 12A7 THPT Vĩnh Lộc B (Thầy Trương Xuân Hòa). Dưới đây là dữ liệu tổng hợp kết quả học tập và chuyên cần của lớp:
- Tổng số học sinh: 50 em
- Tóm tắt học lực: ${classSummary || 'Tốt: 14 em (28%), Khá: 32 em (64%), Đạt: 4 em (8%)'}
- Học sinh cần lưu ý / sa sút / điểm cần nâng cao: ${JSON.stringify(atRiskStudents || [])}
- Điểm trung bình các môn: ${JSON.stringify(subjectAverages || {})}

Hãy đưa ra bản phân tích chuyên sâu gồm:
1. Đánh giá tổng quan mặt bằng chung lớp 12A7.
2. Nhận diện các môn học có nguy cơ (ví dụ: Toán, Hóa, Ngoại ngữ theo nguyện vọng thi tốt nghiệp).
3. Dự báo nguy cơ học sinh sa sút và nhóm cần bồi dưỡng cấp tốc.
4. Kế hoạch hành động cụ thể cho GVCN (đôi bạn cùng tiến, chia tổ học tập, trao đổi với gia đình, tâm lý học đường).`;

  const generated = await generateGeminiText(prompt);
  if (generated) {
    return res.json({ text: generated });
  }

  const fallback = `📊 **BÁO CÁO PHÂN TÍCH TÌNH HÌNH HỌC TẬP & DỰ BÁO LỚP 12A7**

1. **Tổng quan mặt bằng chung:**
- Tỷ lệ học sinh Khá & Tốt chiếm hơn 92%, lớp có nền tảng ý thức kỷ luật tốt (hơn 98% rèn luyện Tốt).
- Nhiều học sinh nổi trội có thế mạnh khối Tự nhiên (Lý, Hóa, Toán) và định hướng thi đại học rõ ràng.

2. **Dự báo nguy cơ và điểm nghẽn:**
- Một số học sinh còn bị lệch điểm ở các môn thi tốt nghiệp (Hóa học và Tiếng Anh có tỉ lệ tự đánh giá 'Chưa đạt' ở khảo sát đầu năm).
- Tình trạng chuyên cần: một số bạn có số buổi nghỉ phép và đi trễ cần chấn chỉnh ngay đầu năm lớp 12 để không ảnh hưởng tiếp thu kiến thức.

3. **Đề xuất giải pháp của GVCN (Thầy Trương Xuân Hòa):**
- Triển khai mô hình **"Đôi bạn cùng tiến - 12A7 Hạnh Phúc"**: Phân công các bạn xuất sắc (như Lê Phú Trình, Nguyễn Tam Minh, Quản Duy Khánh, Huỳnh Thị Ái Ly) hỗ trợ các bạn cần củng cố kiến thức.
- Tăng cường liên lạc 1-1 với phụ huynh của nhóm học sinh có nguy cơ sa sút.
- Tạo không khí học tập không áp lực tiêu cực: "Dream Big And Dare To Fail - Đoàn kết yêu thương cùng tiến bộ!"`;

  res.json({ text: fallback });
});

// 4. AI Parent Letter
app.post('/api/ai/parent-letter', async (req, res) => {
  const { studentName, parentName, reason, meetingTime } = req.body;

  const prompt = `Soạn một bức thư mời hoặc thư trao đổi thân tình gửi đến phụ huynh học sinh lớp 12A7:
- Tên phụ huynh: ${parentName || 'Quý phụ huynh'}
- Tên học sinh: ${studentName || 'em học sinh'}
- Lý do trao đổi: ${reason || 'Trao đổi về tình hình học tập và định hướng ôn thi tốt nghiệp'}
- Thời gian dự kiến: ${meetingTime || 'Cuối tuần này'}
- Người gửi: Thầy Trương Xuân Hòa - GVCN 12A7, Trường THPT Vĩnh Lộc B.
Hãy viết thư văn minh, tôn trọng, chân thành, thể hiện sự đồng hành vì tương lai của học sinh.`;

  const generated = await generateGeminiText(prompt);
  if (generated) {
    return res.json({ text: generated });
  }

  const fallback = `Kính gửi: ${parentName || 'Quý Phụ huynh'} em ${studentName || 'học sinh'},

Tôi là Trương Xuân Hòa, giáo viên chủ nhiệm lớp 12A7, trường THPT Vĩnh Lộc B.
Năm học 2026 - 2027 là năm học cuối cấp vô cùng ý nghĩa đối với các em. Nhằm tạo điều kiện tốt nhất để đồng hành cùng em trong học tập và định hướng nghề nghiệp, tôi trân trọng kính mời Quý phụ huynh dành chút thời gian gặp mặt trao đổi:
- Nội dung: ${reason || 'Bàn về kế hoạch học tập và các giải pháp hỗ trợ em trong giai đoạn nước rút'}
- Thời gian đề xuất: ${meetingTime || 'Sau giờ học hoặc buổi họp định kỳ'}
- Địa điểm: Phòng học 12A7 hoặc trực tuyến qua mục Liên lạc trên hệ thống.

Sự đồng hành của gia đình là nguồn động viên quý giá nhất cho em. Rất mong sớm nhận được phản hồi từ Quý phụ huynh.
Kính chúc Quý gia đình nhiều sức khỏe và hạnh phúc!
Trân trọng,
*Thầy Trương Xuân Hòa - GVCN 12A7*`;

  res.json({ text: fallback });
});

const parseImageDataUrlPart = (
  img: any,
  fallbackMime = 'image/jpeg'
): { inlineData: { mimeType: string; data: string } } | null => {
  const rawData = typeof img === 'string' ? img : img?.base64 || img?.imageBase64 || '';
  if (!rawData || typeof rawData !== 'string') return null;
  const trimmed = rawData.trim();
  const dataUrlMatch = trimmed.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUrlMatch) {
    const detectedMime = dataUrlMatch[1]?.startsWith('image/') ? dataUrlMatch[1] : fallbackMime;
    return {
      inlineData: {
        mimeType: detectedMime,
        data: dataUrlMatch[2],
      },
    };
  }
  return {
    inlineData: {
      mimeType: (typeof img === 'object' && img?.mimeType) || fallbackMime,
      data: trimmed,
    },
  };
};

// 5. AI Grade OCR from Image (Nhận diện điểm số qua ảnh chụp bảng điểm)
app.post('/api/ai/grade-ocr', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg', subject = 'Hóa học' } = req.body || {};
  const imagePart = parseImageDataUrlPart(imageBase64, mimeType);

  if (!imagePart) {
    return res.status(400).json({ success: false, error: 'Thiếu dữ liệu hình ảnh bảng điểm hợp lệ.' });
  }

  const prompt = `Bạn là hệ thống AI OCR trích xuất bảng điểm lớp 12A7 trường THPT Vĩnh Lộc B (GVCN: Thầy Trương Xuân Hòa).
Hãy quan sát thật kỹ hình ảnh bảng điểm / sổ điểm / bài kiểm tra được cung cấp và trích xuất CHÍNH XÁC dữ liệu học sinh đọc được từ ảnh (chỉ lấy những dòng và điểm thực sự có trong ảnh, không tự bịa số).

Quy tắc:
- Điểm theo thang 10 (nếu ảnh dùng dấu phẩy "8,5" -> đổi thành 8.5).
- Cố gắng trích xuất đầy đủ stt, code (mã HS nếu có), name (họ tên), score (điểm tổng/điểm chính hoặc ĐTB), regular (các điểm thường xuyên nếu có), midterm (giữa kỳ), final (cuối kỳ), note (ghi chú nếu có).`;

  const singleGradeSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      subject: { type: Type.STRING },
      overallAnalysis: { type: Type.STRING },
      guidancePlan: { type: Type.STRING },
      extractedRows: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stt: { type: Type.INTEGER },
            code: { type: Type.STRING },
            name: { type: Type.STRING },
            score: { type: Type.NUMBER },
            regular: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            midterm: { type: Type.NUMBER },
            final: { type: Type.NUMBER },
            note: { type: Type.STRING },
          },
          required: ['name'],
        },
      },
    },
    required: ['extractedRows'],
  };

  const aiResult = await generateGeminiDetailed(
    { parts: [imagePart, { text: prompt }] },
    undefined,
    {
      responseMimeType: 'application/json',
      responseSchema: singleGradeSchema,
    }
  );

  if (!aiResult.text) {
    return res.status(502).json({
      success: false,
      error: aiResult.error || 'AI không thể phân tích ảnh bảng điểm lúc này. Vui lòng thử lại.',
    });
  }

  try {
    const cleaned = aiResult.text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    const rows = Array.isArray(parsed?.extractedRows) ? parsed.extractedRows : [];
    if (rows.length === 0) {
      return res.status(422).json({
        success: false,
        error: 'AI không đọc được dòng điểm hợp lệ nào trong ảnh. Vui lòng chọn ảnh rõ nét hơn.',
      });
    }
    return res.json({
      success: true,
      modelUsed: aiResult.modelUsed,
      data: {
        title: parsed.title || `Bảng điểm môn ${subject} (Nhận diện AI)`,
        subject: parsed.subject || subject,
        extractedRows: rows,
        overallAnalysis: parsed.overallAnalysis || `Đã trích xuất ${rows.length} học sinh từ ảnh.`,
        guidancePlan: parsed.guidancePlan || '',
      },
    });
  } catch (parseErr: any) {
    console.warn('Grade OCR JSON parse failed:', parseErr?.message);
    return res.status(422).json({
      success: false,
      error: 'AI trả về dữ liệu chưa đúng cấu trúc bảng điểm. Vui lòng chụp rõ hơn và thử lại.',
    });
  }
});

// Helper to normalize Vietnamese subject names or aliases to canonical 10-subject keys
const normalizeAsciiLower = (val: string): string =>
  String(val || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

const SUBJECT_KEY_ALIASES: Record<string, string> = {
  toan: 'toan',
  'toan hoc': 'toan',
  'mon toan': 'toan',
  toanhoc: 'toan',
  math: 'toan',
  van: 'van',
  'ngu van': 'van',
  nguvan: 'van',
  'mon van': 'van',
  'van hoc': 'van',
  literature: 'van',
  anh: 'anh',
  'tieng anh': 'anh',
  'ngoai ngu': 'anh',
  'anh van': 'anh',
  anhvan: 'anh',
  ngoaingu: 'anh',
  tienganh: 'anh',
  english: 'anh',
  ly: 'ly',
  li: 'ly',
  'vat ly': 'ly',
  'vat li': 'ly',
  vatly: 'ly',
  vatli: 'ly',
  physics: 'ly',
  hoa: 'hoa',
  'hoa hoc': 'hoa',
  hoahoc: 'hoa',
  chemistry: 'hoa',
  su: 'su',
  'lich su': 'su',
  lichsu: 'su',
  history: 'su',
  gdktpl: 'gdktpl',
  ktpl: 'gdktpl',
  'kt&pl': 'gdktpl',
  'gdkt&pl': 'gdktpl',
  'gdkt-pl': 'gdktpl',
  'gdkt & pl': 'gdktpl',
  'gdkt va pl': 'gdktpl',
  'kinh te phap luat': 'gdktpl',
  'kinh te & phap luat': 'gdktpl',
  tin: 'tin',
  'tin hoc': 'tin',
  tinhoc: 'tin',
  informatics: 'tin',
  gddp: 'gddp',
  'gd dia phuong': 'gddp',
  'giao duc dia phuong': 'gddp',
  'dia phuong': 'gddp',
  gdqp: 'gdqp',
  'gdqp-an': 'gdqp',
  'gdqp&an': 'gdqp',
  gdqpan: 'gdqp',
  'qp-an': 'gdqp',
  qpan: 'gdqp',
  'quoc phong': 'gdqp',
  'quoc phong an ninh': 'gdqp',
  'giao duc quoc phong': 'gdqp',
};

const VALID_SUBJECT_KEYS = new Set([
  'toan',
  'van',
  'anh',
  'ly',
  'hoa',
  'su',
  'gdktpl',
  'tin',
  'gddp',
  'gdqp',
]);

const resolveCanonicalSubjectKey = (raw: any): string | null => {
  if (!raw) return null;
  const ascii = normalizeAsciiLower(String(raw));
  if (VALID_SUBJECT_KEYS.has(ascii)) return ascii;
  if (SUBJECT_KEY_ALIASES[ascii]) return SUBJECT_KEY_ALIASES[ascii];
  const compact = ascii.replace(/[^a-z0-9]/g, '');
  if (VALID_SUBJECT_KEYS.has(compact)) return compact;
  if (SUBJECT_KEY_ALIASES[compact]) return SUBJECT_KEY_ALIASES[compact];
  return null;
};

const parseScoreNumber = (val: any): number | null => {
  if (typeof val === 'number' && !isNaN(val)) {
    if (val < 0 || val > 10) return null;
    return Number(val.toFixed(1));
  }
  if (typeof val === 'string') {
    const cleaned = val.trim().replace(',', '.');
    if (!cleaned || cleaned === '-' || cleaned === '—') return null;
    const match = cleaned.match(/^\d+(?:\.\d+)?/);
    if (!match) return null;
    const num = parseFloat(match[0]);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      return Number(num.toFixed(1));
    }
  }
  if (val && typeof val === 'object') {
    const candidate = val.avg ?? val.dtb ?? val.score ?? val.final ?? val.midterm;
    return parseScoreNumber(candidate);
  }
  return null;
};

const normalizeConductValue = (raw: any): string | undefined => {
  if (!raw) return undefined;
  const s = normalizeAsciiLower(String(raw));
  if (s.includes('tot')) return 'Tốt';
  if (s.includes('kha')) return 'Khá';
  if (s.includes('chua')) return 'Chưa đạt';
  if (s === 'dat' || s.includes('trung binh') || s === 'tb') return 'Đạt';
  return undefined;
};

const normalizeExtractedGradeRows = (
  rawRows: any[],
  targetSubject: string,
  detectedSubject?: string
): Array<{
  stt?: number;
  code?: string;
  name: string;
  scores: Record<string, number>;
  conduct?: string;
  note?: string;
}> => {
  if (!Array.isArray(rawRows)) return [];
  const defaultTargetSub =
    targetSubject && targetSubject !== 'all' && VALID_SUBJECT_KEYS.has(targetSubject)
      ? targetSubject
      : resolveCanonicalSubjectKey(detectedSubject);

  return rawRows
    .map((row: any, idx: number) => {
      if (!row || typeof row !== 'object') return null;
      const normalizedScores: Record<string, number> = {};
      const rawScoresObj =
        row.scores && typeof row.scores === 'object' ? row.scores : {};

      for (const [k, v] of Object.entries(rawScoresObj)) {
        const mappedKey = resolveCanonicalSubjectKey(k);
        const num = parseScoreNumber(v);
        if (mappedKey && num !== null) {
          if (targetSubject === 'all' || targetSubject === mappedKey) {
            normalizedScores[mappedKey] = num;
          }
        } else if (defaultTargetSub && num !== null) {
          normalizedScores[defaultTargetSub] = num;
        }
      }

      // Check top-level subject columns directly on row
      const skipKeys = new Set(['scores', 'stt', 'code', 'name', 'hoTen', 'studentName', 'conduct', 'note', 'score', 'avg', 'diem', 'tb', 'dtb']);
      for (const [k, v] of Object.entries(row)) {
        if (skipKeys.has(k)) continue;
        const mappedKey = resolveCanonicalSubjectKey(k);
        const num = parseScoreNumber(v);
        if (mappedKey && num !== null && normalizedScores[mappedKey] === undefined) {
          if (targetSubject === 'all' || targetSubject === mappedKey) {
            normalizedScores[mappedKey] = num;
          }
        }
      }

      // Single-score fallback if row only has score/avg/diem/dtb
      const singleScoreCandidate =
        row.score ?? row.avg ?? row.diem ?? row.tb ?? row.dtb;
      const singleParsed = parseScoreNumber(singleScoreCandidate);
      if (singleParsed !== null && Object.keys(normalizedScores).length === 0 && defaultTargetSub) {
        normalizedScores[defaultTargetSub] = singleParsed;
      }

      const name = String(row.name || row.hoTen || row.studentName || '').trim();
      const conduct = normalizeConductValue(row.conduct ?? row.hanhKiem ?? row.renLuyen);
      if (Object.keys(normalizedScores).length === 0 && !conduct) {
        return null;
      }

      const rawStt = typeof row.stt === 'number' ? row.stt : parseInt(String(row.stt || ''), 10);
      return {
        stt: !isNaN(rawStt) && rawStt > 0 ? rawStt : idx + 1,
        code: row.code ? String(row.code).trim() : undefined,
        name: name || `Học sinh ${idx + 1}`,
        scores: normalizedScores,
        conduct,
        note: row.note ? String(row.note).trim() : undefined,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
};

// 5b. AI Comprehensive Grade OCR from Image (Nhận diện bảng điểm tổng hợp hoặc bảng điểm từng môn từ 1 hoặc nhiều ảnh chụp)
app.post('/api/ai/grade-ocr-comprehensive', async (req, res) => {
  const {
    imageBase64,
    mimeType = 'image/jpeg',
    images = [],
    targetSubject = 'all',
    studentNames = [],
    studentRoster = [],
  } = req.body || {};

  const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];
  if (Array.isArray(images) && images.length > 0) {
    for (const img of images) {
      const part = parseImageDataUrlPart(img, mimeType);
      if (part) imageParts.push(part);
    }
  } else if (imageBase64 && typeof imageBase64 === 'string') {
    const part = parseImageDataUrlPart(imageBase64, mimeType);
    if (part) imageParts.push(part);
  }

  if (imageParts.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Thiếu dữ liệu hình ảnh bảng điểm hợp lệ. Vui lòng chọn, kéo thả hoặc dán ảnh bảng điểm.',
    });
  }

  const rosterLines =
    Array.isArray(studentRoster) && studentRoster.length > 0
      ? studentRoster
          .map((s: any) => `${s.stt}. [${s.code}] ${s.name}`)
          .join('\n')
      : Array.isArray(studentNames) && studentNames.length > 0
      ? studentNames.join(', ')
      : '';

  const studentHint = rosterLines
    ? `\nDanh sách 50 học sinh chuẩn lớp 12A7 để đối chiếu chính xác STT, Mã HS và Họ tên:\n${rosterLines}\n`
    : '';

  const subjectInstruction =
    targetSubject && targetSubject !== 'all'
      ? `Người dùng ĐANG CHỌN QUÉT RIÊNG MÔN "${targetSubject}".
- Nếu ảnh là bảng điểm 1 môn (có thể có các cột Thường xuyên/Miệng, Giữa kỳ, Cuối kỳ, ĐTB môn), hãy ưu tiên lấy cột ĐTB môn / Tổng kết / Điểm kiểm tra chính của mỗi học sinh và điền vào scores["${targetSubject}"]. Nếu chỉ có các điểm thành phần mà chưa có cột ĐTB, hãy tính ĐTB theo hệ số (TB TX + 2*GK + 3*CK)/6 hoặc trung bình cộng hợp lý.
- Nếu ảnh có nhiều môn, hãy trích xuất chính xác cột điểm của môn "${targetSubject}" vào scores["${targetSubject}"].`
      : `Hãy quan sát tất cả các cột điểm môn học có mặt trong ảnh và ánh xạ CHÍNH XÁC vào các khóa chuẩn sau:
- Toán -> "toan"
- Ngữ văn / Văn -> "van"
- Tiếng Anh / Ngoại ngữ / Anh -> "anh"
- Vật lý / Vật lí / Lý -> "ly"
- Hóa học / Hóa -> "hoa"
- Lịch sử / Sử -> "su"
- GDKT-PL / KTPL / Kinh tế & Pháp luật -> "gdktpl"
- Tin học / Tin -> "tin"
- GDĐP / Giáo dục địa phương -> "gddp"
- GDQP-AN / Quốc phòng -> "gdqp"
Nếu ảnh thực chất chỉ là bảng điểm của 1 môn duy nhất, hãy ghi mã môn đó vào "detectedSubject" và chỉ điền khóa môn đó trong "scores".`;

  const prompt = `Bạn là hệ thống AI OCR chuyên dụng đọc Bảng điểm học sinh THPT Việt Nam (lớp 12A7, Trường THPT Vĩnh Lộc B, GVCN: Thầy Trương Xuân Hòa).
Hãy quan sát thật kỹ TẤT CẢ ${imageParts.length} hình ảnh đính kèm (ảnh chụp sổ điểm giấy, màn hình Excel, Google Sheets, hoặc hệ thống VNedu/CSDL ngành) và trích xuất CHÍNH XÁC từng dòng học sinh đọc được.

${subjectInstruction}
${studentHint}

QUY TẮC BẮT BUỘC:
1. TUYỆT ĐỐI CHỈ trích xuất học sinh và điểm số THỰC SỰ NHÌN THẤY trong ảnh. KHÔNG tự bịa hay điền điểm cho học sinh không có mặt trong ảnh.
2. Điểm số thang 10 dạng số thực (từ 0 đến 10). Nếu ảnh dùng dấu phẩy thập phân (ví dụ "8,5", "7,25") hãy chuyển sang dấu chấm (8.5, 7.3).
3. Trong "scores" của từng học sinh, CHỈ đưa vào những môn thực sự có điểm trong ảnh; ô nào trống hoặc gạch ngang thì bỏ qua khóa đó.
4. Đối chiếu Họ và tên (hoặc Mã HS / STT nếu khớp rõ ràng) với danh sách lớp 12A7 để điền chuẩn "stt", "code" và "name". Nếu một học sinh xuất hiện trên ảnh nhưng không khớp danh sách 12A7, vẫn trích xuất nguyên tên đọc được từ ảnh.
5. Trả về đúng cấu trúc JSON Schema được yêu cầu.`;

  const comprehensiveGradeSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Tiêu đề bảng điểm đọc được từ ảnh' },
      detectedSubject: {
        type: Type.STRING,
        description: 'Mã môn học nếu ảnh chỉ có 1 môn (toan, van, anh, ly, hoa, su, gdktpl, tin, gddp, gdqp), hoặc "all" nếu bảng điểm nhiều môn',
      },
      overallAnalysis: { type: Type.STRING, description: 'Tóm tắt ngắn số lượng học sinh, môn học và nhận xét chung từ ảnh' },
      guidancePlan: { type: Type.STRING, description: 'Gợi ý ngắn kế hoạch hỗ trợ học tập' },
      extractedRows: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stt: { type: Type.INTEGER, description: 'Số thứ tự học sinh' },
            code: { type: Type.STRING, description: 'Mã học sinh (VD: 12A7-01)' },
            name: { type: Type.STRING, description: 'Họ và tên học sinh' },
            scores: {
              type: Type.OBJECT,
              properties: {
                toan: { type: Type.NUMBER },
                van: { type: Type.NUMBER },
                anh: { type: Type.NUMBER },
                ly: { type: Type.NUMBER },
                hoa: { type: Type.NUMBER },
                su: { type: Type.NUMBER },
                gdktpl: { type: Type.NUMBER },
                tin: { type: Type.NUMBER },
                gddp: { type: Type.NUMBER },
                gdqp: { type: Type.NUMBER },
              },
            },
            conduct: { type: Type.STRING, description: 'Hạnh kiểm/Rèn luyện nếu thấy trong ảnh (Tốt, Khá, Đạt, Chưa đạt)' },
            note: { type: Type.STRING },
          },
          required: ['name', 'scores'],
        },
      },
    },
    required: ['extractedRows'],
  };

  const aiResult = await generateGeminiDetailed(
    { parts: [...imageParts, { text: prompt }] },
    undefined,
    {
      responseMimeType: 'application/json',
      responseSchema: comprehensiveGradeSchema,
    }
  );

  if (!aiResult.text) {
    return res.status(502).json({
      success: false,
      error:
        aiResult.error ||
        'Không thể kết nối Gemini AI để đọc bảng điểm. Vui lòng kiểm tra Settings > Secrets hoặc thử lại.',
    });
  }

  try {
    const cleanedText = aiResult.text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanedText);
    const rawRows = Array.isArray(parsed?.extractedRows)
      ? parsed.extractedRows
      : Array.isArray(parsed?.rows)
      ? parsed.rows
      : Array.isArray(parsed?.students)
      ? parsed.students
      : [];

    const normalizedRows = normalizeExtractedGradeRows(
      rawRows,
      targetSubject,
      parsed?.detectedSubject
    );

    if (normalizedRows.length === 0) {
      return res.status(422).json({
        success: false,
        error:
          'AI đã quét ảnh nhưng không tìm thấy dòng điểm số hợp lệ nào. Hãy thử chụp gần bảng điểm hơn, đủ sáng, không bị mờ hoặc chọn đúng môn học cần quét.',
      });
    }

    const totalScoreCells = normalizedRows.reduce(
      (sum, row) => sum + Object.keys(row.scores).length,
      0
    );

    return res.json({
      success: true,
      modelUsed: aiResult.modelUsed,
      totalScoreCells,
      data: {
        title: parsed.title || 'Bảng điểm lớp 12A7 (Trích xuất từ ảnh AI)',
        detectedSubject: parsed.detectedSubject || targetSubject || 'all',
        extractedRows: normalizedRows,
        overallAnalysis:
          parsed.overallAnalysis ||
          `AI đã trích xuất ${normalizedRows.length} dòng học sinh với ${totalScoreCells} ô điểm từ ${imageParts.length} ảnh bảng điểm.`,
        guidancePlan: parsed.guidancePlan || '',
      },
    });
  } catch (parseErr: any) {
    console.warn('Gemini OCR Comprehensive JSON parse failed:', parseErr?.message);
    return res.status(422).json({
      success: false,
      error:
        'AI trả về dữ liệu chưa đúng cấu trúc bảng điểm. Vui lòng thử lại hoặc tải ảnh rõ nét hơn.',
    });
  }
});

// Helpers for AI Timetable OCR normalization (12A7 THPT Vĩnh Lộc B)
const OFFICIAL_12A7_MORNING_TIMES = [
  '07:25 - 08:10',
  '08:15 - 09:00',
  '09:35 - 10:20',
  '10:25 - 11:10',
  '11:15 - 12:00',
];

const OFFICIAL_12A7_AFTERNOON_TIMES = [
  '13:15 - 14:00',
  '14:05 - 14:50',
  '15:15 - 16:00',
  '16:05 - 16:50',
];

const infer12A7TeacherBySubject = (subjectRaw: string): string => {
  const s = (subjectRaw || '').toLowerCase();
  if (s.includes('hóa') || s.includes('hoa hoc')) return 'Thầy Trương Xuân Hòa';
  if (
    s.includes('chào cờ') ||
    s.includes('shdc') ||
    s.includes('sinh hoạt') ||
    s.includes('shl') ||
    s.includes('hđtn') ||
    s.includes('tnhn') ||
    s.includes('trải nghiệm')
  ) {
    return 'Thầy Trương Xuân Hòa (GVCN)';
  }
  if (s.includes('stem')) return 'Thầy Trương Xuân Hòa & Tổ STEM';
  if (s.includes('bản ngữ')) return 'Giáo viên Bản ngữ';
  if (s.includes('toán')) return 'Thầy Hồ Quốc Thanh';
  if (s.includes('văn') || s.includes('ngữ văn') || s.includes('địa phương') || s.includes('gdđp') || s.includes('gddp')) {
    return 'Cô Đinh Thị Đào';
  }
  if (s.includes('anh') || s.includes('ngoại ngữ') || s.includes('av')) return 'Cô Ngô Thị Thảo';
  if (s.includes('lý') || s.includes('lí') || s.includes('vật lý') || s.includes('vật lí')) {
    return 'Thầy Nguyễn Văn Tèo';
  }
  if (s.includes('sử') || s.includes('lịch sử')) return 'Thầy Trịnh Ngọc Thiện';
  if (s.includes('ktpl') || s.includes('kinh tế') || s.includes('pháp luật') || s.includes('gdkt')) {
    return 'Cô Hồ Thị Vân Anh';
  }
  if (s.includes('thể chất') || s.includes('gdtc') || s.includes('thể dục') || s.includes('td')) {
    return 'Thầy Nguyễn Hữu Nhân';
  }
  if (s.includes('quốc phòng') || s.includes('gdqp') || s.includes('qp')) {
    return 'Cô Đinh Thị Liên';
  }
  if (s.includes('tin')) return 'Cô Tạ Thị Tình';
  return 'Thầy Trương Xuân Hòa';
};

const infer12A7RoomBySubject = (subjectRaw: string, rawRoom?: string): string => {
  if (rawRoom && rawRoom.trim() && rawRoom.trim() !== 'Phòng B.204') {
    return rawRoom.trim();
  }
  const s = (subjectRaw || '').toLowerCase();
  if (s.includes('thể chất') || s.includes('gdtc') || s.includes('thể dục')) {
    return 'Sân đa năng';
  }
  if (s.includes('chào cờ') || s.includes('shdc') || s.includes('quốc phòng') || s.includes('gdqp')) {
    return 'Sân trường / P.12A7';
  }
  if (s.includes('tin')) return 'Phòng Tin học';
  return 'P.12A7';
};

const normalizeDayLabel = (rawDay: string): string | null => {
  const d = (rawDay || '').trim().toLowerCase();
  if (d.includes('hai') || d === 'thứ 2' || d === 'thu 2' || d === 't2' || d === '2' || d.includes('mon')) return 'Thứ Hai';
  if (d.includes('ba') || d === 'thứ 3' || d === 'thu 3' || d === 't3' || d === '3' || d.includes('tue')) return 'Thứ Ba';
  if (d.includes('tư') || d.includes('tu') || d === 'thứ 4' || d === 'thu 4' || d === 't4' || d === '4' || d.includes('wed')) return 'Thứ Tư';
  if (d.includes('năm') || d.includes('nam') || d === 'thứ 5' || d === 'thu 5' || d === 't5' || d === '5' || d.includes('thu')) return 'Thứ Năm';
  if (d.includes('sáu') || d.includes('sau') || d === 'thứ 6' || d === 'thu 6' || d === 't6' || d === '6' || d.includes('fri')) return 'Thứ Sáu';
  return null;
};

const DEFAULT_12A7_TIMETABLE = [
  {
    day: 'Thứ Hai',
    periods: [
      { period: 1, session: 'morning', time: '07:25 - 08:10', subject: 'SHDC (Chào cờ & Sinh hoạt dưới cờ)', teacher: 'Thầy Trương Xuân Hòa (GVCN)', room: 'Sân trường / P.12A7' },
      { period: 2, session: 'morning', time: '08:15 - 09:00', subject: 'HĐTN 1 (Hoạt động trải nghiệm)', teacher: 'Thầy Trương Xuân Hòa (GVCN)', room: 'P.12A7' },
      { period: 3, session: 'morning', time: '09:35 - 10:20', subject: 'GDĐP (Giáo dục địa phương)', teacher: 'Cô Đinh Thị Đào', room: 'P.12A7' },
      { period: 4, session: 'morning', time: '10:25 - 11:10', subject: 'Ngữ văn', teacher: 'Cô Đinh Thị Đào', room: 'P.12A7' },
      { period: 1, session: 'afternoon', time: '13:15 - 14:00', subject: 'Tiếng Anh', teacher: 'Cô Ngô Thị Thảo', room: 'P.12A7' },
      { period: 2, session: 'afternoon', time: '14:05 - 14:50', subject: 'Toán học', teacher: 'Thầy Hồ Quốc Thanh', room: 'P.12A7' },
      { period: 3, session: 'afternoon', time: '15:15 - 16:00', subject: 'Toán học', teacher: 'Thầy Hồ Quốc Thanh', room: 'P.12A7' },
    ],
  },
  {
    day: 'Thứ Ba',
    periods: [
      { period: 1, session: 'morning', time: '07:25 - 08:10', subject: 'Hóa học', teacher: 'Thầy Trương Xuân Hòa', room: 'P.12A7' },
      { period: 2, session: 'morning', time: '08:15 - 09:00', subject: 'Hóa học', teacher: 'Thầy Trương Xuân Hòa', room: 'P.12A7' },
      { period: 3, session: 'morning', time: '09:35 - 10:20', subject: 'Ngữ văn', teacher: 'Cô Đinh Thị Đào', room: 'P.12A7' },
      { period: 4, session: 'morning', time: '10:25 - 11:10', subject: 'Ngữ văn', teacher: 'Cô Đinh Thị Đào', room: 'P.12A7' },
      { period: 1, session: 'afternoon', time: '13:15 - 14:00', subject: 'Giáo dục thể chất (GDTC)', teacher: 'Thầy Nguyễn Hữu Nhân', room: 'Sân đa năng' },
      { period: 2, session: 'afternoon', time: '14:05 - 14:50', subject: 'Giáo dục thể chất (GDTC)', teacher: 'Thầy Nguyễn Hữu Nhân', room: 'Sân đa năng' },
      { period: 3, session: 'afternoon', time: '15:15 - 16:00', subject: 'Vật lý', teacher: 'Thầy Nguyễn Văn Tèo', room: 'P.12A7' },
    ],
  },
  {
    day: 'Thứ Tư',
    periods: [
      { period: 1, session: 'morning', time: '07:25 - 08:10', subject: 'Tiếng Anh', teacher: 'Cô Ngô Thị Thảo', room: 'P.12A7' },
      { period: 2, session: 'morning', time: '08:15 - 09:00', subject: 'Tiếng Anh', teacher: 'Cô Ngô Thị Thảo', room: 'P.12A7' },
      { period: 3, session: 'morning', time: '09:35 - 10:20', subject: 'HĐTN 2 (Hoạt động trải nghiệm)', teacher: 'Thầy Trương Xuân Hòa (GVCN)', room: 'P.12A7' },
      { period: 4, session: 'morning', time: '10:25 - 11:10', subject: 'Tiếng Anh bản ngữ', teacher: 'Giáo viên Bản ngữ', room: 'P.12A7' },
      { period: 1, session: 'afternoon', time: '13:15 - 14:00', subject: 'Lịch sử', teacher: 'Thầy Trịnh Ngọc Thiện', room: 'P.12A7' },
      { period: 2, session: 'afternoon', time: '14:05 - 14:50', subject: 'Toán học', teacher: 'Thầy Hồ Quốc Thanh', room: 'P.12A7' },
      { period: 3, session: 'afternoon', time: '15:15 - 16:00', subject: 'Toán học', teacher: 'Thầy Hồ Quốc Thanh', room: 'P.12A7' },
    ],
  },
  {
    day: 'Thứ Năm',
    periods: [
      { period: 1, session: 'morning', time: '07:25 - 08:10', subject: 'Tin học', teacher: 'Cô Tạ Thị Tình', room: 'Phòng Tin học' },
      { period: 2, session: 'morning', time: '08:15 - 09:00', subject: 'Tin học', teacher: 'Cô Tạ Thị Tình', room: 'Phòng Tin học' },
      { period: 3, session: 'morning', time: '09:35 - 10:20', subject: 'Giáo dục Quốc phòng (GDQP)', teacher: 'Cô Đinh Thị Liên', room: 'Sân trường / P.12A7' },
      { period: 4, session: 'morning', time: '10:25 - 11:10', subject: 'Vật lý', teacher: 'Thầy Nguyễn Văn Tèo', room: 'P.12A7' },
      { period: 1, session: 'afternoon', time: '13:15 - 14:00', subject: 'GDKT-PL (Kinh tế & Pháp luật)', teacher: 'Cô Hồ Thị Vân Anh', room: 'P.12A7' },
      { period: 2, session: 'afternoon', time: '14:05 - 14:50', subject: 'GDKT-PL (Kinh tế & Pháp luật)', teacher: 'Cô Hồ Thị Vân Anh', room: 'P.12A7' },
      { period: 3, session: 'afternoon', time: '15:15 - 16:00', subject: 'Hóa học', teacher: 'Thầy Trương Xuân Hòa', room: 'P.12A7' },
    ],
  },
  {
    day: 'Thứ Sáu',
    periods: [
      { period: 1, session: 'morning', time: '07:25 - 08:10', subject: 'Lịch sử', teacher: 'Thầy Trịnh Ngọc Thiện', room: 'P.12A7' },
      { period: 2, session: 'morning', time: '08:15 - 09:00', subject: 'Toán học', teacher: 'Thầy Hồ Quốc Thanh', room: 'P.12A7' },
      { period: 3, session: 'morning', time: '09:35 - 10:20', subject: 'Vật lý', teacher: 'Thầy Nguyễn Văn Tèo', room: 'P.12A7' },
      { period: 4, session: 'morning', time: '10:25 - 11:10', subject: 'HĐTN 3 (Sinh hoạt lớp & HĐTN)', teacher: 'Thầy Trương Xuân Hòa (GVCN)', room: 'P.12A7' },
      { period: 1, session: 'afternoon', time: '13:15 - 14:00', subject: 'Ngữ văn', teacher: 'Cô Đinh Thị Đào', room: 'P.12A7' },
      { period: 2, session: 'afternoon', time: '14:05 - 14:50', subject: 'Ngữ văn', teacher: 'Cô Đinh Thị Đào', room: 'P.12A7' },
      { period: 3, session: 'afternoon', time: '15:15 - 16:00', subject: 'STEM', teacher: 'Thầy Trương Xuân Hòa & Tổ STEM', room: 'P.12A7' },
    ],
  },
];

const normalizeExtractedTimetable = (rawTimetable: any[]): typeof DEFAULT_12A7_TIMETABLE => {
  const dayOrder = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu'];
  const byDay = new Map<string, any[]>();

  if (Array.isArray(rawTimetable)) {
    for (const entry of rawTimetable) {
      if (!entry || typeof entry !== 'object') continue;
      const normDay = normalizeDayLabel(entry.day || entry.thu || entry.dayName || '');
      if (!normDay) continue;
      const rawPeriods = Array.isArray(entry.periods)
        ? entry.periods
        : [
            ...(Array.isArray(entry.morning)
              ? entry.morning.map((p: any, i: number) => ({ ...p, session: 'morning', period: p.period || i + 1 }))
              : []),
            ...(Array.isArray(entry.afternoon)
              ? entry.afternoon.map((p: any, i: number) => ({ ...p, session: 'afternoon', period: p.period || i + 1 }))
              : []),
          ];

      let morningIdx = 1;
      let afternoonIdx = 1;
      const parsedDayPeriods = rawPeriods
        .map((p: any) => {
          if (!p || typeof p !== 'object') return null;
          const subject = String(p.subject || p.mon || p.name || '').trim();
          const lowerSub = subject.toLowerCase();
          if (
            !subject ||
            subject === '-' ||
            subject === '—' ||
            lowerSub === 'trống' ||
            lowerSub === 'nghỉ' ||
            lowerSub === 'nghi' ||
            lowerSub === 'x' ||
            lowerSub === 'none' ||
            lowerSub === 'null'
          ) {
            return null;
          }

          const rawSess = String(p.session || p.buoi || '').toLowerCase();
          const rawPeriodNum = Number(p.period || p.tiet || 0);
          const isAfternoon =
            rawSess.includes('afternoon') ||
            rawSess.includes('chiều') ||
            rawSess.includes('chieu') ||
            rawSess === 'pm' ||
            (!rawSess && rawPeriodNum >= 5);

          const session: 'morning' | 'afternoon' = isAfternoon ? 'afternoon' : 'morning';
          const rawP = rawPeriodNum > 0 ? rawPeriodNum : session === 'morning' ? morningIdx : afternoonIdx;

          if (session === 'morning') morningIdx = Math.max(morningIdx + 1, rawP + 1);
          else afternoonIdx = Math.max(afternoonIdx + 1, rawP + 1);

          const rawTeacher = String(p.teacher || p.gv || '').trim();
          const teacher =
            rawTeacher &&
            !rawTeacher.includes('Nguyễn Văn Tùng') &&
            !rawTeacher.includes('Lê Thị Hồng Hạnh') &&
            !rawTeacher.includes('Phạm Minh Thư') &&
            !rawTeacher.includes('Giáo viên phụ trách') &&
            rawTeacher.toLowerCase() !== 'gv'
              ? rawTeacher
              : infer12A7TeacherBySubject(subject);

          const room = infer12A7RoomBySubject(subject, p.room);

          return {
            rawPeriod: rawP,
            session,
            rawTime: p.time ? String(p.time).trim() : '',
            subject,
            teacher,
            room,
          };
        })
        .filter((p: any) => p !== null);

      if (parsedDayPeriods.length > 0) {
        const existing = byDay.get(normDay) || [];
        byDay.set(normDay, [...existing, ...parsedDayPeriods]);
      }
    }
  }

  return dayOrder.map((dayName) => {
    const rawList = byDay.get(dayName) || [];
    const morningList = rawList
      .filter((p) => p.session === 'morning')
      .sort((a, b) => a.rawPeriod - b.rawPeriod)
      .map((p, idx) => {
        const periodNum = p.rawPeriod >= 1 && p.rawPeriod <= 5 ? p.rawPeriod : idx + 1;
        return {
          period: periodNum,
          session: 'morning' as const,
          time: OFFICIAL_12A7_MORNING_TIMES[periodNum - 1] || p.rawTime || '07:25 - 08:10',
          subject: p.subject,
          teacher: p.teacher,
          room: p.room,
        };
      });

    const afternoonRaw = rawList
      .filter((p) => p.session === 'afternoon')
      .sort((a, b) => a.rawPeriod - b.rawPeriod);
    const hasHighAfternoonNumbers = afternoonRaw.some((p) => p.rawPeriod >= 5);
    const afternoonList = afternoonRaw.map((p, idx) => {
      const periodNum = hasHighAfternoonNumbers
        ? idx + 1
        : p.rawPeriod >= 1 && p.rawPeriod <= 4
        ? p.rawPeriod
        : idx + 1;
      return {
        period: periodNum,
        session: 'afternoon' as const,
        time: OFFICIAL_12A7_AFTERNOON_TIMES[periodNum - 1] || p.rawTime || '13:15 - 14:00',
        subject: p.subject,
        teacher: p.teacher,
        room: p.room,
      };
    });

    return {
      day: dayName,
      periods: [...morningList, ...afternoonList],
    };
  });
};

// 5c. AI Timetable OCR from Image (Thêm mới Thời khóa biểu bằng 1 hoặc nhiều hình ảnh thông qua AI)
app.post('/api/ai/timetable-ocr', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg', images = [] } = req.body || {};

  const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];
  if (Array.isArray(images) && images.length > 0) {
    for (const img of images) {
      const part = parseImageDataUrlPart(img, mimeType);
      if (part) imageParts.push(part);
    }
  } else if (imageBase64 && typeof imageBase64 === 'string') {
    const part = parseImageDataUrlPart(imageBase64, mimeType);
    if (part) imageParts.push(part);
  }

  if (imageParts.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Thiếu dữ liệu hình ảnh thời khóa biểu hợp lệ. Vui lòng chọn hoặc dán ảnh TKB.',
    });
  }

  const prompt = `Bạn là hệ thống AI OCR chuyên dụng đọc Thời khóa biểu trường THPT ở Việt Nam (lớp 12A7, Trường THPT Vĩnh Lộc B, GVCN: Thầy Trương Xuân Hòa).
Hãy quan sát thật kỹ từng ô, từng hàng (tiết học), từng cột (Thứ Hai -> Thứ Sáu) trong ${imageParts.length} hình ảnh Thời khóa biểu được đính kèm và trích xuất CHÍNH XÁC lịch học có trong ảnh.

Lưu ý quan trọng khi đọc bảng Thời khóa biểu Việt Nam:
1. Bảng TKB có thể bố trí Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6 theo CỘT hoặc theo HÀNG, hoặc có 2 ảnh riêng cho Buổi Sáng và Buổi Chiều.
2. Buổi Sáng ("morning") thường có Tiết 1 đến Tiết 4 (hoặc Tiết 5); Buổi Chiều ("afternoon") thường ghi là Tiết 1, 2, 3 (hoặc Tiết 5, 6, 7 / Tiết 6, 7, 8). Hãy giữ đúng session ("morning" / "afternoon") và số thứ tự tiết trong mỗi buổi (1, 2, 3, 4...).
3. Nếu ô nào trống, gạch ngang "-", hoặc ghi "Nghỉ" thì KHÔNG thêm tiết đó.
4. Viết rõ tên môn học đọc được từ ảnh (ví dụ: SHDC, HĐTN, Hóa học, Ngữ văn, GDĐP, Toán học, Tiếng Anh, Tiếng Anh bản ngữ, Vật lý, Lịch sử, GDKT-PL, Tin học, GDTC, GDQP, STEM...). Nếu trên ảnh có môn học viết tắt (như T -> Toán học, V -> Ngữ văn, A / AV -> Tiếng Anh, L -> Vật lý, H -> Hóa học, S -> Lịch sử, KTPL -> GDKT-PL, TD -> GDTC, QP -> GDQP, CC -> SHDC), hãy ghi rõ tên môn dễ hiểu.
5. Nếu trên ảnh có ghi tên giáo viên thì giữ nguyên; nếu không ghi tên giáo viên, hãy gán đúng Giáo viên bộ môn của lớp 12A7:
   - Hóa học, HĐTN, SHDC, Chào cờ, Sinh hoạt lớp, STEM -> "Thầy Trương Xuân Hòa"
   - Toán học -> "Thầy Hồ Quốc Thanh"
   - Ngữ văn, GDĐP (Giáo dục địa phương) -> "Cô Đinh Thị Đào"
   - Tiếng Anh bản ngữ -> "Giáo viên Bản ngữ"
   - Tiếng Anh -> "Cô Ngô Thị Thảo"
   - Vật lý -> "Thầy Nguyễn Văn Tèo"
   - Lịch sử -> "Thầy Trịnh Ngọc Thiện"
   - GDKT-PL (Kinh tế & Pháp luật) -> "Cô Hồ Thị Vân Anh"
   - GDTC (Thể dục / Thể chất) -> "Thầy Nguyễn Hữu Nhân"
   - GDQP (Quốc phòng) -> "Cô Đinh Thị Liên"
   - Tin học -> "Cô Tạ Thị Tình"

Hãy trả về đầy đủ 5 ngày: "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu" theo đúng JSON Schema.`;

  const timetableResponseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Tiêu đề TKB đọc được từ ảnh' },
      note: { type: Type.STRING, description: 'Tóm tắt ngắn số tiết đã nhận diện' },
      timetable: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: {
              type: Type.STRING,
              description: 'Phải là một trong: "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu"',
            },
            periods: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  period: { type: Type.INTEGER, description: 'Số thứ tự tiết trong buổi (1, 2, 3, 4...)' },
                  session: { type: Type.STRING, description: '"morning" hoặc "afternoon"' },
                  subject: { type: Type.STRING, description: 'Tên môn học đọc được từ ảnh' },
                  teacher: { type: Type.STRING, description: 'Tên giáo viên giảng dạy' },
                  room: { type: Type.STRING, description: 'Phòng học (VD: P.12A7)' },
                },
                required: ['period', 'session', 'subject'],
              },
            },
          },
          required: ['day', 'periods'],
        },
      },
    },
    required: ['timetable'],
  };

  const aiResult = await generateGeminiDetailed(
    { parts: [...imageParts, { text: prompt }] },
    undefined,
    {
      responseMimeType: 'application/json',
      responseSchema: timetableResponseSchema,
    }
  );

  if (!aiResult.text) {
    return res.status(502).json({
      success: false,
      aiUsed: false,
      error:
        aiResult.error ||
        'Không thể kết nối Gemini AI để đọc ảnh Thời khóa biểu. Vui lòng kiểm tra GEMINI_API_KEY trong Settings > Secrets.',
    });
  }

  try {
    const cleanedText = aiResult.text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : cleanedText;
    const parsed = JSON.parse(jsonStr);
    const rawList = Array.isArray(parsed?.timetable)
      ? parsed.timetable
      : Array.isArray(parsed?.days)
      ? parsed.days
      : [];

    const normalizedTimetable = normalizeExtractedTimetable(rawList);
    const totalExtractedPeriods = normalizedTimetable.reduce(
      (sum, d) => sum + (Array.isArray(d.periods) ? d.periods.length : 0),
      0
    );

    if (totalExtractedPeriods === 0) {
      return res.status(422).json({
        success: false,
        aiUsed: true,
        error:
          'AI đã đọc ảnh nhưng không tìm thấy tiết học nào trong bảng Thời khóa biểu. Vui lòng chụp rõ nét hơn hoặc cắt sát phần bảng TKB.',
      });
    }

    return res.json({
      success: true,
      aiUsed: true,
      modelUsed: aiResult.modelUsed,
      data: {
        title: parsed.title || 'Thời khóa biểu lớp 12A7 (Trích xuất từ hình ảnh AI)',
        note:
          parsed.note ||
          `AI (${aiResult.modelUsed || 'Gemini'}) đã nhận diện ${totalExtractedPeriods} tiết học từ ${imageParts.length} ảnh và chuẩn hóa khung giờ Sáng/Chiều + GVBM 12A7.`,
        timetable: normalizedTimetable,
      },
    });
  } catch (parseErr: any) {
    console.warn('Timetable OCR JSON parse failed:', parseErr?.message, aiResult.text?.slice(0, 300));
    return res.status(422).json({
      success: false,
      aiUsed: true,
      error: 'AI trả về dữ liệu chưa đúng cấu trúc bảng TKB. Vui lòng thử phân tích lại hoặc dùng ảnh rõ hơn.',
    });
  }
});

// 6. AI In-Depth Grade Analysis & Action Plan for Progress (Phân tích điểm & Kế hoạch giúp đỡ học sinh)
app.post('/api/ai/grade-analysis', async (req, res) => {
  const { studentsGrades, subjectName = 'Chung', examType = 'Định kỳ' } = req.body;

  if (Array.isArray(studentsGrades) && studentsGrades.length > 0) {
    const prompt = `Bạn là Thầy Trương Xuân Hòa, GVCN lớp 12A7 trường THPT Vĩnh Lộc B (TP.HCM).
Dưới đây là danh sách điểm vừa được nhập (${examType} môn ${subjectName}) của các học sinh:
${JSON.stringify(studentsGrades.slice(0, 30))}

Dựa trên dữ liệu điểm trên, hãy phân tích và đưa ra:
1. Đánh giá tổng quan phổ điểm lớp 12A7 (điểm cao nhất, điểm trung bình, số em dưới 6.5).
2. Phân loại nhóm học sinh:
   - Nhóm xuất sắc / giỏi (cần bồi dưỡng nâng cao, định hướng thi ĐH top đầu)
   - Nhóm khá (cần rèn kỹ năng giải đề, tốc độ)
   - Nhóm cần giúp đỡ cấp tốc (dưới 6.5 hoặc có dấu hiệu sa sút)
3. Hướng giúp đỡ cụ thể từng nhóm (Action Plan):
   - Phương án "Đôi bạn cùng tiến" trong lớp
   - Tài liệu, chuyên đề cần ôn luyện lại
   - Kế hoạch phụ đạo của GVCN và trao đổi với phụ huynh.

Hãy định dạng kết quả thật trực quan, chuẩn mực sư phạm, ấm áp và truyền cảm hứng với slogan "Dream Big And Dare To Fail - Quyết tâm đậu TN & ĐH 100%".`;

    const generated = await generateGeminiText(prompt);
    if (generated) {
      return res.json({ text: generated });
    }
  }

  // Fallback
  res.json({
    text: `📊 **BẢN PHÂN TÍCH ĐIỂM SỐ & KẾ HOẠCH BỒI DƯỠNG HỌC SINH 12A7**
*Giáo viên chủ nhiệm: Thầy Trương Xuân Hòa - THPT Vĩnh Lộc B*

1. **Đánh giá mặt bằng chung:**
- Điểm số phản ánh sự nỗ lực tích cực của đa số học sinh lớp 12A7 trong kỳ đánh giá môn ${subjectName}.
- Đa phần các em nắm vững kiến thức cơ bản trong chương trình THPT Quốc gia 2027.

2. **Nhận diện học sinh cần quan tâm & giúp đỡ:**
- Một số em còn lúng túng ở câu hỏi vận dụng hoặc tính toán nhanh.
- Cần quan tâm đặc biệt nhóm học sinh có điểm dưới 6.5 để vực dậy tinh thần học tập.

3. **Hướng giúp đỡ cụ thể để học sinh tiến bộ (Action Plan):**
- **Mô hình "Đôi bạn cùng tiến":** Ghép bạn học tốt môn ${subjectName} (như bạn Mai Anh, Phú Trình, Ái Ly) hỗ trợ các bạn còn yếu trong cùng Tổ.
- **Phụ đạo chuyên đề:** GVCN và giáo viên bộ môn tổng hợp ngân hàng 50 câu trắc nghiệm trọng tâm có lời giải chi tiết.
- **Theo dõi & Động viên:** Tuyên dương sự tiến bộ dù là 0.5 điểm để tạo sự tự tin cho các em. "Dream Big And Dare To Fail - 12A7 cùng tiến bộ!"`,
  });
});

// 7. AI Study Coach & Tutor for Students (Công cụ AI cho Học sinh - Hỗ trợ giải bài qua văn bản & ảnh chụp)
app.post('/api/ai/student-tutor', async (req, res) => {
  const {
    message,
    studentInfo,
    conversationHistory = [],
    selectedSubject = 'Tất cả',
    imageBase64,
    mimeType = 'image/jpeg',
  } = req.body;

  const studentName = studentInfo?.name || 'em';
  const gpa = studentInfo?.currentGpa || 8.0;
  const dreamCareer = studentInfo?.dreamCareer || 'Đại học mơ ước';
  const targetExam = `${studentInfo?.examSubject1 || 'Hóa học'} và ${studentInfo?.examSubject2 || 'Tiếng Anh'}`;
  const scoresSummary = studentInfo?.scores
    ? `Toán: ${studentInfo.scores.toan?.avg}, Văn: ${studentInfo.scores.van?.avg}, Anh: ${studentInfo.scores.anh?.avg}, Lý: ${studentInfo.scores.ly?.avg}, Hóa: ${studentInfo.scores.hoa?.avg}, Sử: ${studentInfo.scores.su?.avg}`
    : 'Đang cập nhật';

  const systemInstruction = `Bạn là "Gia Sư & Cố Vấn Học Tập AI 12A7" - người thầy, người bạn đồng hành thông minh, tận tâm của học sinh lớp 12A7 trường THPT Vĩnh Lộc B (TP.HCM), do Thầy Trương Xuân Hòa (dạy Hóa học) làm Giáo viên chủ nhiệm.
Thông tin học sinh đang trò chuyện:
- Họ và tên: ${studentName} (Lớp 12A7 - Tổ ${studentInfo?.group || 1})
- Điểm trung bình hiện tại: ${gpa}/10 (${scoresSummary})
- Môn thi tốt nghiệp THPT Quốc gia 2027 tự chọn: ${targetExam}
- Nguyện vọng nghề nghiệp tương lai: ${dreamCareer}
- Môn học đang cần hỗ trợ trọng tâm: ${selectedSubject}

Yêu cầu bắt buộc khi trả lời:
1. Trả lời TRỰC TIẾP, CHI TIẾT và CHÍNH XÁC vào đúng câu hỏi, chuyên đề lý thuyết hoặc bài tập mà học sinh đưa ra (tuyệt đối không trả lời lạc đề sang ghép cặp đôi bạn cùng tiến trừ khi học sinh hỏi rõ về ghép cặp đôi bạn). Nếu học sinh gõ nhầm chính tả (ví dụ "chất báo" thay vì "chất béo"), hãy tự động hiểu đúng ý và tổng hợp đầy đủ kiến thức chuyên đề đó.
2. Nếu học sinh hỏi tổng hợp kiến thức hoặc giải bài tập (Toán, Hóa, Lý, Anh, Văn, Sử, KTPL, Tin...) hoặc gửi kèm hình ảnh đề bài:
   - Nêu rõ khái niệm, công thức cấu tạo, tính chất vật lý, tính chất hóa học / định lý / công thức toán học trọng tâm.
   - Giải chi tiết từng bước (Step-by-step) rõ ràng để học sinh hiểu bản chất.
   - Đưa ra công thức giải nhanh và mẹo tránh bẫy thường gặp trong đề thi TN THPT 2027.
3. Trình bày bằng Markdown rõ ràng, có tiêu đề, gạch đầu dòng khoa học, giọng văn ấm áp, khích lệ tinh thần "Dream Big And Dare To Fail - 12A7 Quyết tâm đậu TN & ĐH 100%".`;

  const historyContext = Array.isArray(conversationHistory)
    ? conversationHistory
        .slice(-6)
        .map((c: any) => `${c.role === 'user' ? 'Học sinh' : 'Gia sư AI'}: ${c.text}`)
        .join('\n')
    : '';

  const fullPrompt = `${
    historyContext ? `Lịch sử trò chuyện gần đây:\n${historyContext}\n\n` : ''
  }Môn học đang chọn: ${selectedSubject}
Câu hỏi / Bài tập của học sinh ${studentName}:
"${message || 'Hãy giải chi tiết bài tập trong hình ảnh đính kèm.'}"

Hãy giải đáp trực tiếp, đầy đủ và chi tiết từng bước:`;

  const parts: any[] = [];
  if (imageBase64 && typeof imageBase64 === 'string') {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    });
  }
  parts.push({ text: fullPrompt });

  const generated = await generateGeminiText({ parts }, systemInstruction);
  if (generated) {
    return res.json({ text: generated });
  }

  // Intelligent topic-specific fallback response
  return res.json({
    text: buildComprehensiveTutorAnswer(message, studentInfo, selectedSubject),
  });
});

// 8. Shared Classroom State Persistence API (Synchronizes updates across all devices & users in real-time)
const SHARED_STATE_FILE = path.resolve(__dirname, 'shared_classroom_state.json');

interface ServerSectionRecord {
  payload: Record<string, any>;
  updatedAt: number;
  updatedByRole?: string;
  clientId?: string;
  version: number;
}

interface ServerSharedState {
  updatedAt: number;
  sections: Record<string, ServerSectionRecord>;
}

let memorySharedState: ServerSharedState = {
  updatedAt: 0,
  sections: {},
};

try {
  if (fs.existsSync(SHARED_STATE_FILE)) {
    const raw = fs.readFileSync(SHARED_STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.sections) {
      memorySharedState = parsed;
    }
  }
} catch (err) {
  console.warn('Could not load shared_classroom_state.json:', err);
}

const persistSharedStateToDisk = () => {
  try {
    fs.writeFileSync(SHARED_STATE_FILE, JSON.stringify(memorySharedState), 'utf-8');
  } catch (err) {
    console.warn('Could not write shared_classroom_state.json:', err);
  }
};

// Connected SSE clients for instant real-time push across all phones & computers
const sseClients = new Set<express.Response>();

const broadcastSharedStateUpdate = (changedSections: Record<string, ServerSectionRecord>, resetAll = false) => {
  const message = JSON.stringify({
    type: resetAll ? 'reset' : 'update',
    updatedAt: memorySharedState.updatedAt,
    sections: changedSections,
  });
  for (const client of sseClients) {
    try {
      client.write(`data: ${message}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
};

app.get('/api/shared-state/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Send initial snapshot immediately upon connection
  const initPayload = JSON.stringify({
    type: 'init',
    updatedAt: memorySharedState.updatedAt,
    sections: memorySharedState.sections,
  });
  res.write(`data: ${initPayload}\n\n`);

  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat ${Date.now()}\n\n`);
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

app.get('/api/shared-state', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const since = Number(req.query.since) || 0;
  if (since > 0 && memorySharedState.updatedAt <= since) {
    return res.json({
      hasUpdates: false,
      updatedAt: memorySharedState.updatedAt,
    });
  }

  // If since > 0, only return sections updated after `since` (or all if since === 0)
  const changedSections: Record<string, ServerSectionRecord> = {};
  for (const [secId, secData] of Object.entries(memorySharedState.sections)) {
    if (since === 0 || (secData?.updatedAt || 0) > since) {
      changedSections[secId] = secData;
    }
  }

  return res.json({
    hasUpdates: true,
    updatedAt: memorySharedState.updatedAt,
    sections: since === 0 ? memorySharedState.sections : changedSections,
  });
});

app.post('/api/shared-state', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { sectionId, payload, sections, updatedByRole, clientId, resetAll } = req.body || {};

  if (resetAll === true) {
    memorySharedState = {
      updatedAt: Date.now(),
      sections: {},
    };
    persistSharedStateToDisk();
    broadcastSharedStateUpdate({}, true);
    return res.json({ success: true, updatedAt: memorySharedState.updatedAt });
  }

  const now = Date.now();
  const changedSections: Record<string, ServerSectionRecord> = {};

  // Support batch update of multiple sections
  if (sections && typeof sections === 'object') {
    for (const [secId, secPayload] of Object.entries(sections)) {
      if (secId && secPayload && typeof secPayload === 'object') {
        const prevSection = memorySharedState.sections[secId];
        const nextVersion = (prevSection?.version || 0) + 1;
        const record: ServerSectionRecord = {
          payload: secPayload as Record<string, any>,
          updatedAt: now,
          updatedByRole: updatedByRole || 'student',
          clientId: clientId || undefined,
          version: nextVersion,
        };
        memorySharedState.sections[secId] = record;
        changedSections[secId] = record;
      }
    }
  } else if (sectionId && typeof sectionId === 'string' && payload && typeof payload === 'object') {
    const prevSection = memorySharedState.sections[sectionId];
    const nextVersion = (prevSection?.version || 0) + 1;
    const record: ServerSectionRecord = {
      payload,
      updatedAt: now,
      updatedByRole: updatedByRole || 'student',
      clientId: clientId || undefined,
      version: nextVersion,
    };
    memorySharedState.sections[sectionId] = record;
    changedSections[sectionId] = record;
  } else {
    return res.status(400).json({ error: 'Invalid sectionId or payload' });
  }

  memorySharedState.updatedAt = now;
  persistSharedStateToDisk();
  broadcastSharedStateUpdate(changedSections, false);

  return res.json({
    success: true,
    updatedAt: now,
    sections: Object.fromEntries(
      Object.entries(changedSections).map(([k, v]) => [k, { version: v.version, updatedAt: v.updatedAt }])
    ),
  });
});

// Setup Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: {
      middlewareMode: true,
      port: 3000,
      host: '0.0.0.0',
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.use('/quanlylophoc', express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`A7 App Server listening on port ${port}`);
});
