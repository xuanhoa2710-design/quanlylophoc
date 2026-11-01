export interface TutorStudentContext {
  name?: string;
  group?: number;
  currentGpa?: number;
  examSubject1?: string;
  examSubject2?: string;
  dreamCareer?: string;
  scores?: Record<string, { avg?: number }>;
}

/**
 * Generates an accurate, topic-specific Grade 12 lesson summary & step-by-step guide
 * when offline or when Gemini API is unreachable.
 */
export function buildComprehensiveTutorAnswer(
  question: string,
  studentInfo?: TutorStudentContext,
  selectedSubject: string = 'Tất cả môn'
): string {
  const studentName = studentInfo?.name || 'em';
  const gpa = studentInfo?.currentGpa ?? 8.0;
  const group = studentInfo?.group ?? 1;
  const exam1 = studentInfo?.examSubject1 || 'Hóa học';
  const exam2 = studentInfo?.examSubject2 || 'Tiếng Anh';
  const dreamCareer = studentInfo?.dreamCareer || 'Đỗ Đại học nguyện vọng 1';
  const scores = studentInfo?.scores || {};

  const q = (question || '').toLowerCase().trim();
  const sub = (selectedSubject || '').toLowerCase();

  // ==========================================================================
  // 1. CHẤT BÉO / LIPID (Bao gồm cả lỗi gõ phím "chất báo", "chat beo", "chat bao")
  // ==========================================================================
  if (
    q.includes('chất béo') ||
    q.includes('chất báo') ||
    q.includes('chat beo') ||
    q.includes('chat bao') ||
    q.includes('lipit') ||
    q.includes('lipid') ||
    q.includes('triglyxerit') ||
    q.includes('triglyceride') ||
    q.includes('axit béo') ||
    q.includes('acid béo') ||
    q.includes('glixerol') ||
    q.includes('glycerol') ||
    q.includes('triolein') ||
    q.includes('tristearin') ||
    q.includes('tripalmitin') ||
    q.includes('trilinolein')
  ) {
    return `🧪 **TỔNG HỢP KIẾN THỨC TRỌNG TÂM VỀ CHẤT BÉO (LIPID) – HÓA HỌC 12**
*(Biên soạn theo chương trình Hóa 12 mới – Thầy Trương Xuân Hòa, GVCN 12A7)*

Chào **${studentName}**! Thầy tổng hợp toàn bộ kiến thức cốt lõi và công thức giải nhanh chuyên đề **Chất béo (Triglyceride)** để em nắm chắc 100% nhé:

---

### 1. Khái niệm & Cấu tạo phân tử Chất béo
- **Khái niệm:** **Chất béo** là **triester (trieste)** của **glycerol** $C_3H_5(OH)_3$ với các **axit béo** (acid béo), gọi chung là **triglyceride** (hay triacylglycerol).
  > ⚠️ *Lưu ý chống bẫy đề thi:* Nói "Chất béo là ester của glycerol và carboxylic acid" là **SAI** (phải là **triester** của glycerol và **axit béo**).
- **Công thức tổng quát:** $(RCOO)_3C_3H_5$
- **4 Axit béo & 4 Chất béo bắt buộc phải thuộc lòng (kèm Phân tử khối $M$):**
  1. **Palmitic acid** (no, 16C): $C_{15}H_{31}COOH$ ($M = 256$) $\\rightarrow$ **Tripalmitin:** $(C_{15}H_{31}COO)_3C_3H_5$ (**$M = 806$**, chất rắn).
  2. **Stearic acid** (no, 18C): $C_{17}H_{35}COOH$ ($M = 284$) $\\rightarrow$ **Tristearin:** $(C_{17}H_{35}COO)_3C_3H_5$ (**$M = 890$**, chất rắn).
  3. **Oleic acid** (không no, 1 nối đôi $C=C$, 18C): $C_{17}H_{33}COOH$ ($M = 282$) $\\rightarrow$ **Triolein:** $(C_{17}H_{33}COO)_3C_3H_5$ (**$M = 884$**, chất lỏng).
  4. **Linoleic acid** (không no, 2 nối đôi $C=C$, 18C): $C_{17}H_{31}COOH$ ($M = 280$) $\\rightarrow$ **Trilinolein:** $(C_{17}H_{31}COO)_3C_3H_5$ (**$M = 878$**, chất lỏng).

---

### 2. Tính chất vật lý
- **Trạng thái ở điều kiện thường:**
  + Gốc axit béo **no** (như *Tristearin, Tripalmitin*) $\\rightarrow$ **Chất rắn** (mỡ động vật).
  + Gốc axit béo **không no** (như *Triolein, Trilinolein*) $\\rightarrow$ **Chất lỏng** (dầu thực vật, dầu cá – chứa nhiều acid béo **Omega-3, Omega-6**).
- **Tính tan:** Nhẹ hơn nước và **không tan trong nước**, nhưng tan nhiều trong dung môi hữu cơ không phân cực (benzen, xăng, dầu hỏa...).

---

### 3. Tính chất hóa học đặc trưng (3 phản ứng trọng tâm)
1. **Phản ứng thủy phân trong môi trường axit ($H^+$, $t^\\circ$):** *(Phản ứng thuận nghịch)*
   $$(RCOO)_3C_3H_5 + 3H_2O \\stackrel{H^+, t^\\circ}{\\rightleftharpoons} 3RCOOH + C_3H_5(OH)_3$$
2. **Phản ứng xà phòng hóa (Thủy phân trong môi trường kiềm $NaOH/KOH$, $t^\\circ$):** *(Phản ứng 1 chiều)*
   $$(RCOO)_3C_3H_5 + 3NaOH \\xrightarrow{t^\\circ} 3RCOONa \\text{ (Xà phòng)} + C_3H_5(OH)_3 \\text{ (Glycerol)}$$
3. **Phản ứng cộng $H_2$ của chất béo lỏng (Hydrogen hóa – Hóa cứng chất béo):**
   - Chuyển dầu thực vật (lỏng) thành bơ nhân tạo / mỡ rắn để dễ vận chuyển và sản xuất xà phòng:
   $$(C_{17}H_{33}COO)_3C_3H_5 \\text{ (Triolein, lỏng)} + 3H_2 \\xrightarrow{Ni, t^\\circ} (C_{17}H_{35}COO)_3C_3H_5 \\text{ (Tristearin, rắn)}$$
   - Ngoài ra, chất béo lỏng còn làm **mất màu dung dịch nước Brom ($Br_2$)** và bị **oxi hóa chậm** bởi oxi không khí tạo mùi ôi thiu ở liên kết đôi $C=C$.

---

### 4. Công thức giải nhanh bài tập Chất béo đạt 9+
- **Tỉ lệ mol vàng khi xà phòng hóa:**
  $$n_{NaOH} = 3 \\cdot n_{\\text{chất béo}} = 3 \\cdot n_{\\text{glycerol}} = n_{\\text{muối}}$$
- **Định luật Bảo toàn khối lượng (BTKL):**
  $$m_{\\text{chất béo}} + m_{NaOH} = m_{\\text{muối (xà phòng)}} + m_{\\text{glycerol}}$$
  *(Với $M_{\\text{glycerol}} = 92$, $M_{NaOH} = 40$)*
- **Bảo toàn nguyên tố Oxy khi đốt cháy chất béo $X$:**
  Vì mỗi phân tử chất béo luôn có **6 nguyên tử Oxy**:
  $$6 \\cdot n_X + 2 \\cdot n_{O_2} = 2 \\cdot n_{CO_2} + n_{H_2O}$$
- **Liên hệ số mol đốt cháy và số mol $Br_2 / H_2$ phản ứng:**
  $$n_{CO_2} - n_{H_2O} = (k - 1) \\cdot n_X = (2 + \\pi_{\\text{gốc}}) \\cdot n_X = 2 \\cdot n_X + n_{Br_2}$$
  $$\\Rightarrow n_{Br_2} = (n_{CO_2} - n_{H_2O}) - 2 \\cdot n_X$$

💡 **Em ${studentName} có bài tập tính toán cụ thể nào về Chất béo cần giải không?** Hãy gửi đề bài hoặc chụp ảnh gửi vào đây, thầy sẽ giải chi tiết từng bước cho em nhé!`;
  }

  // ==========================================================================
  // 2. ESTE (ESTER) - HÓA HỌC 12
  // ==========================================================================
  if (
    q.includes('este') ||
    q.includes('ester') ||
    q.includes('xà phòng hóa') ||
    q.includes('thủy phân')
  ) {
    return `🧪 **TỔNG HỢP KIẾN THỨC & PHƯƠNG PHÁP GIẢI BÀI TẬP ESTE (ESTER) – HÓA HỌC 12**
*(Chuyên đề Thầy Trương Xuân Hòa – GVCN 12A7)*

Chào **${studentName}**! Dưới đây là hệ thống hóa đầy đủ kiến thức và công thức giải nhanh chuyên đề **Este (Ester)**:

### 1. Công thức & Danh pháp Este
- **Este no, đơn chức, mạch hở:** $C_nH_{2n}O_2$ ($n \\ge 2$) hoặc $RCOOR'$ ($R'$ là gốc hydrocarbon khác H).
- **Cách gọi tên:** **Tên gốc $R'$ + Tên gốc acid $RCOO^-$ (đuôi -ate / -oat)**.
  + $HCOOCH_3$: Methyl formate ($M = 60$)
  + $CH_3COOCH_3$: Methyl acetate ($M = 74$) | $HCOOC_2H_5$: Ethyl formate ($M = 74$)
  + $CH_3COOC_2H_5$: Ethyl acetate ($M = 88$)
  + $CH_3COOCH=CH_2$: Vinyl acetate ($M = 86$)
  + $CH_2=CHCOOCH_3$: Methyl acrylate ($M = 86$)
  + $CH_2=C(CH_3)COOCH_3$: Methyl methacrylate ($M = 100$ – trùng hợp tạo thủy tinh hữu cơ Plexiglas)
  + $CH_3COOC_6H_5$: Phenyl acetate ($M = 136$)

### 2. Tính chất vật lý & Mùi hương đặc trưng
- Nhiệt độ sôi **thấp hơn hẳn** so với carboxylic acid và alcohol có cùng $M$ (do không có liên kết hydrogen liên phân tử).
- **Mùi hương cần nhớ:**
  + *Isoamyl acetate* ($CH_3COOCH_2CH_2CH(CH_3)_2$): Mùi **chuối chín**.
  + *Benzyl acetate* ($CH_3COOCH_2C_6H_5$): Mùi **hoa nhài**.
  + *Ethyl butyrate / Ethyl propionate*: Mùi **dứa chín**.
  + *Geranyl acetate*: Mùi **hoa hồng**.

### 3. Tính chất hóa học & Các trường hợp đặc biệt
1. **Thủy phân trong môi trường acid ($H_2SO_4$ loãng, $t^\\circ$):** Phản ứng **thuận nghịch** (tách thành 2 lớp chất lỏng).
2. **Thủy phân trong môi trường kiềm ($NaOH/KOH$, $t^\\circ$ - Xà phòng hóa):** Phản ứng **1 chiều**:
   $$RCOOR' + NaOH \\xrightarrow{t^\\circ} RCOONa + R'OH$$
3. **3 Trường hợp thủy phân đặc biệt rất hay ra thi:**
   - **Este có gốc vinyl ($RCOOCH=CH-R'$):** Thủy phân tạo **muối + aldehyde ($R'-CH=O$)**.
   - **Este của phenol ($RCOOC_6H_4R'$):** Phản ứng với $NaOH$ theo tỉ lệ **1 : 2** tạo **2 muối + nước**:
     $$CH_3COOC_6H_5 + 2NaOH \\xrightarrow{t^\\circ} CH_3COONa + C_6H_5ONa + H_2O$$
   - **Phản ứng điều chế este (Ester hóa):** Giữa carboxylic acid + alcohol (xúc tác $H_2SO_4$ đặc, $t^\\circ$). *Lưu ý: Este của phenol và este của vinyl KHÔNG điều chế được từ phản ứng giữa acid và alcohol/phenol!*

### 4. Công thức giải nhanh bài toán Este
- **Đốt cháy este no, đơn chức, mạch hở:** Luôn có $n_{CO_2} = n_{H_2O}$ và $n_{\\text{este}} = \\frac{m_{\\text{este}} - m_C - m_H}{32}$.
- **Bảo toàn khối lượng:** $m_{\\text{este}} + m_{NaOH} = m_{\\text{muối}} + m_{\\text{ancol}}$.`;
  }

  // ==========================================================================
  // 3. CARBOHYDRATE (GLUCOSE, FRUCTOSE, SACCHAROSE, TINH BỘT, CELLULOSE)
  // ==========================================================================
  if (
    q.includes('cacbohidrat') ||
    q.includes('carbohydrate') ||
    q.includes('glucoz') ||
    q.includes('glucose') ||
    q.includes('fructoz') ||
    q.includes('fructose') ||
    q.includes('saccaroz') ||
    q.includes('saccharose') ||
    q.includes('maltoz') ||
    q.includes('maltose') ||
    q.includes('tinh bột') ||
    q.includes('xenluloz') ||
    q.includes('cellulose') ||
    q.includes('tráng bạc')
  ) {
    return `🧪 **TỔNG HỢP KIẾN THỨC CHƯƠNG CARBOHYDRATE – HÓA HỌC 12**
*(Chuyên đề Thầy Trương Xuân Hòa – GVCN 12A7)*

Chào **${studentName}**! Thầy hệ thống bảng phân loại và phản ứng đặc trưng của chương **Carbohydrate** cho em:

### 1. Phân loại 3 nhóm Carbohydrate (Công thức chung $C_n(H_2O)_m$)
1. **Monosaccharide ($C_6H_{12}O_6$, $M = 180$):** **Glucose** (đường nho) & **Fructose** (đường mật ong) – *Không bị thủy phân*.
2. **Disaccharide ($C_{12}H_{22}O_{11}$, $M = 342$):** **Saccharose** (đường mía = 1 $\\alpha$-glucose + 1 $\\beta$-fructose) & **Maltose** (đường mạch nha = 2 gốc $\\alpha$-glucose).
3. **Polysaccharide ($(C_6H_{10}O_5)_n$, $M_{\\text{mắt xích}} = 162$):** **Tinh bột** (gồm Amylose mạch không phân nhánh + Amylopectin mạch phân nhánh) & **Cellulose** (mạch không phân nhánh, mỗi mắt xích có 3 nhóm $-OH$ tự do $[C_6H_7O_2(OH)_3]_n$).

### 2. Bảng so sánh tính chất hóa học cốt lõi
| Phản ứng | Glucose | Fructose | Saccharose | Maltose | Tinh bột | Cellulose |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Hòa tan $Cu(OH)_2$ ở nhiệt độ thường (tạo dd xanh lam)** | ✅ Có | ✅ Có | ✅ Có | ✅ Có | ❌ Không | ❌ Không |
| **Tráng bạc ($AgNO_3/NH_3, t^\\circ$)** | ✅ Tạo $2Ag$ | ✅ Tạo $2Ag$ | ❌ Không | ✅ Tạo $2Ag$ | ❌ Không | ❌ Không |
| **Làm mất màu nước Brom ($Br_2$)** | ✅ Có | ❌ **Không!** | ❌ Không | ✅ Có | ❌ Không | ❌ Không |
| **Phản ứng thủy phân ($H^+, t^\\circ$)** | ❌ Không | ❌ Không | ✅ Glucose + Fructose | ✅ 2 Glucose | ✅ $n$ Glucose | ✅ $n$ Glucose |

> 💡 **Mẹo phân biệt nhanh:** Dùng **nước Brom ($Br_2$)** để phân biệt **Glucose** (làm mất màu) và **Fructose** (không làm mất màu). Dùng **dung dịch $I_2$ (Iodine)** để nhận biết **Hồ tinh bột** (tạo phức màu **xanh tím** đặc trưng).`;
  }

  // ==========================================================================
  // 4. AMINE – AMINO ACID – PEPTIDE – PROTEIN
  // ==========================================================================
  if (
    q.includes('amin') ||
    q.includes('amine') ||
    q.includes('amino') ||
    q.includes('peptit') ||
    q.includes('peptide') ||
    q.includes('protein') ||
    q.includes('anilin') ||
    q.includes('glyxin') ||
    q.includes('glycine') ||
    q.includes('alanin') ||
    q.includes('valin') ||
    q.includes('lysin') ||
    q.includes('glutamic')
  ) {
    return `🧪 **TỔNG HỢP CHƯƠNG HỢP CHẤT CHỨA NITƠ (AMINE - AMINO ACID - PEPTIDE - PROTEIN)**
*(Chuyên đề Thầy Trương Xuân Hòa – GVCN 12A7)*

Chào **${studentName}**! Đây là toàn bộ kiến thức trọng tâm chương Hợp chất chứa Nitrogen Hóa 12:

### 1. Amine (Amin)
- **Khái niệm:** Khi thay thế nguyên tử $H$ trong phân tử $NH_3$ bằng gốc hydrocarbon ta được Amine.
- **4 Amine thể khí ở điều kiện thường (mùi khai, tan nhiều trong nước):** *Methylamine ($CH_3NH_2$), Dimethylamine ($(CH_3)_2NH$), Trimethylamine ($(CH_3)_3N$), Ethylamine ($C_2H_5NH_2$)*.
- **So sánh lực bazơ ($K_b$):**
  $$\\text{Amin béo bậc II} > \\text{Amin béo bậc I} > NH_3 > \\text{Anilin } (C_6H_5NH_2) > (C_6H_5)_2NH$$
  *(Lưu ý: **Anilin** là chất lỏng, ít tan trong nước, **không làm đổi màu quỳ tím và phenolphthalein**, nhưng tác dụng với nước $Br_2$ tạo kết tủa trắng $2,4,6\\text{-tribromoaniline}$)*.

### 2. 5 Amino Acid bắt buộc phải nhớ (Chất rắn kết tinh, vị ngọt, tan tốt, nhiệt độ nóng chảy cao)
1. **Glycine (Gly - $M = 75$):** $H_2N-CH_2-COOH$ *(Quỳ tím không đổi màu)*
2. **Alanine (Ala - $M = 89$):** $CH_3-CH(NH_2)-COOH$ *(Quỳ tím không đổi màu)*
3. **Valine (Val - $M = 117$):** $(CH_3)_2CH-CH(NH_2)-COOH$ *(Quỳ tím không đổi màu)*
4. **Glutamic acid (Glu - $M = 147$):** $HOOC-CH_2-CH_2-CH(NH_2)-COOH$ *(2 nhóm $-COOH$, 1 nhóm $-NH_2 \\Rightarrow$ **Quỳ tím hóa ĐỎ**; muối monosodium glutamate là **bột ngọt / mì chính**)*
5. **Lysine (Lys - $M = 146$):** $H_2N-[CH_2]_4-CH(NH_2)-COOH$ *(1 nhóm $-COOH$, 2 nhóm $-NH_2 \\Rightarrow$ **Quỳ tím hóa XANH**)*

### 3. Peptide & Protein
- **Liên kết peptide:** Là liên kết $-CO-NH-$ giữa **2 đơn vị $\\alpha\\text{-amino acid}$**. Phân tử có $n$ gốc $\\alpha\\text{-amino acid}$ thì có **$(n - 1)$ liên kết peptide**.
- **Phản ứng màu Biuret:** Các peptide có từ **2 liên kết peptide trở lên** (*Tripeptide, Tetrapeptide..., Protein*) tác dụng với $Cu(OH)_2/OH^-$ tạo phức **màu tím đặc trưng** *(Dipeptide chỉ có 1 liên kết peptide nên **KHÔNG** có phản ứng màu Biuret!)*.`;
  }

  // ==========================================================================
  // 5. POLYMER & VẬT LIỆU POLYMER
  // ==========================================================================
  if (
    q.includes('polime') ||
    q.includes('polymer') ||
    q.includes('chất dẻo') ||
    q.includes('cao su') ||
    q.includes('tơ ') ||
    q.includes('nilon') ||
    q.includes('nylon') ||
    q.includes('trùng hợp') ||
    q.includes('trùng ngưng')
  ) {
    return `🧪 **TỔNG HỢP KIẾN THỨC CHƯƠNG POLYMER – HÓA HỌC 12**
*(Chuyên đề Thầy Trương Xuân Hòa – GVCN 12A7)*

Chào **${studentName}**! Thầy tóm tắt những điểm hay hỏi nhất về **Polymer**:

### 1. Phân biệt Trùng hợp và Trùng ngưng
- **Phản ứng trùng hợp:** Cộng hợp liên tiếp nhiều monomer có **liên kết bội ($C=C$)** hoặc **vòng kém bền** (như *caprolactam*). Không giải phóng phân tử nhỏ.
  + *Ví dụ:* PE, PP, PVC, PS, Thủy tinh hữu cơ (PMMA), Teflon, Tơ nitron (olon), Cao su buna, Cao su thiên nhiên.
- **Phản ứng trùng ngưng:** Kết hợp các monomer có ít nhất **2 nhóm chức có khả năng phản ứng** và **giải phóng phân tử nhỏ (thường là $H_2O$)**.
  + *Ví dụ:* **Tơ nilon-6,6**, **Tơ lapsan** (poly(ethylene terephthalate)), **Nhựa phenol-formaldehyde (PF)**.

### 2. Phân loại Tơ (Rất hay hỏi trắc nghiệm)
1. **Tơ thiên nhiên:** Bông, len, tơ tằm.
2. **Tơ bán tổng hợp (Tơ nhân tạo – xuất phát từ Cellulose thiên nhiên):** **Tơ visco**, **Tơ cellulose acetate**.
3. **Tơ tổng hợp:**
   - *Nhóm Polyamide (kém bền trong cả axit và kiềm):* **Tơ nilon-6**, **Tơ nilon-7 (tơ enang)**, **Tơ nilon-6,6**.
   - *Nhóm Polyester (kém bền trong axit và kiềm):* **Tơ lapsan**.
   - *Nhóm Vinylic (bền với nhiệt, axit, kiềm – dùng dệt áo ấm):* **Tơ nitron (tơ olon)** từ acrylonitrile ($CH_2=CH-CN$).`;
  }

  // ==========================================================================
  // 6. ĐẠI CƯƠNG KIM LOẠI, ĐIỆN HÓA, ĐIỆN PHÂN, SẮT - NHÔM - KIỀM
  // ==========================================================================
  if (
    q.includes('kim loại') ||
    q.includes('điện phân') ||
    q.includes('ăn mòn') ||
    q.includes('pin điện') ||
    q.includes('thế điện cực') ||
    q.includes('sắt') ||
    q.includes('nhôm') ||
    q.includes('nước cứng') ||
    sub.includes('hóa')
  ) {
    return `🧪 **TỔNG HỢP ĐẠI CƯƠNG KIM LOẠI, ĐIỆN HÓA & ĐIỆN PHÂN – HÓA HỌC 12**
*(Chuyên đề Thầy Trương Xuân Hòa – GVCN 12A7)*

Chào **${studentName}**! Dưới đây là hệ thống kiến thức cốt lõi phần Vô cơ & Điện hóa Hóa 12:

### 1. Dãy điện hóa & Quy tắc Alpha ($\\alpha$)
- Cặp oxi hóa – khử có thế điện cực chuẩn $E^\\circ_{M^{n+}/M}$ càng nhỏ $\\rightarrow$ tính khử của $M$ càng mạnh, tính oxi hóa của $M^{n+}$ càng yếu.
- **Các cặp đặc biệt phải nhớ:**
  $$Fe^{2+}/Fe \\quad < \\quad Cu^{2+}/Cu \\quad < \\quad Fe^{3+}/Fe^{2+} \\quad < \\quad Ag^+/Ag$$
  + $Cu + 2Fe^{3+} \\rightarrow Cu^{2+} + 2Fe^{2+}$ *(Tan trong dung dịch $FeCl_3$)*
  + $Fe + 2Fe^{3+} \\rightarrow 3Fe^{2+}$
  + $Fe^{2+} + Ag^+ \\rightarrow Fe^{3+} + Ag\\downarrow$ *(Khi cho $AgNO_3$ dư vào $FeCl_2$, thu được **2 kết tủa** là $AgCl$ và $Ag$!)*

### 2. Ăn mòn điện hóa học (3 điều kiện bắt buộc)
1. Hai điện cực phải **khác nhau về bản chất** (Kim loại – Kim loại hoặc Kim loại – Phi kim như gang/thép gồm $Fe - C$).
2. Hai điện cực phải **tiếp xúc trực tiếp hoặc gián tiếp** qua dây dẫn.
3. Cùng tiếp xúc với một **dung dịch chất điện li** (hoặc không khí ẩm).
- **Bảo vệ bề mặt & Phương pháp điện hóa (Cathode bảo vệ):** Gắn kim loại hoạt động mạnh hơn (như **Kẽm - Zn**) vào vỏ tàu biển bằng thép ($Fe$). Khi đó **Zn bị ăn mòn thay cho Fe**.

### 3. Công thức Định luật Faraday trong Điện phân
$$n_e = \\frac{I \\cdot t}{F} = \\frac{I \\cdot t}{96500}$$
- **Tại Cathode (Cực âm):** Xảy ra quá trình **khử** các ion dương ($M^{n+} + ne \\rightarrow M$).
- **Tại Anode (Cực dương):** Xảy ra quá trình **oxi hóa** các ion âm hoặc nước ($2Cl^- \\rightarrow Cl_2 + 2e$; $2H_2O \\rightarrow O_2 + 4H^+ + 4e$).

💡 *Em muốn hỏi sâu hơn về bài toán nào? Hãy nhắn chi tiết hoặc chụp ảnh đề bài gửi thầy nhé!*`;
  }

  // ==========================================================================
  // 7. TOÁN HỌC 12 (HÀM SỐ, NGUYÊN HÀM - TÍCH PHÂN, OXYZ, XÁC SUẤT)
  // ==========================================================================
  if (
    sub.includes('toán') ||
    q.includes('hàm số') ||
    q.includes('đạo hàm') ||
    q.includes('cực trị') ||
    q.includes('đồng biến') ||
    q.includes('nghịch biến') ||
    q.includes('tiệm cận') ||
    q.includes('giá trị lớn nhất') ||
    q.includes('gtln') ||
    q.includes('gtnn') ||
    q.includes('tích phân') ||
    q.includes('nguyên hàm') ||
    q.includes('oxyz') ||
    q.includes('vectơ') ||
    q.includes('mặt phẳng') ||
    q.includes('mặt cầu') ||
    q.includes('xác suất') ||
    q.includes('bayes') ||
    q.includes('phương sai') ||
    q.includes('độ lệch chuẩn') ||
    q.includes('toán')
  ) {
    return `📐 **TỔNG HỢP CÔNG THỨC & PHƯƠNG PHÁP GIẢI TOÁN 12 (CHƯƠNG TRÌNH MỚI)**
Chào **${studentName}** (Điểm TB Toán: **${scores?.toan?.avg ?? 8.0}**)! Dưới đây là hệ thống kiến thức cốt lõi môn Toán 12:

### 1. Khảo sát hàm số, Cực trị & Đường Tiệm cận
- **Tính đơn điệu:** $f'(x) \\ge 0, \\forall x \\in K$ (bằng $0$ tại hữu hạn điểm) $\\Rightarrow$ Hàm số **đồng biến** trên $K$.
- **Điểm cực trị:** $x_0$ là điểm cực trị khi $f'(x)$ **đổi dấu** khi đi qua $x_0$ (nghiệm bội lẻ).
- **3 loại đường tiệm cận của đồ thị $y = f(x)$:**
  1. **Tiệm cận ngang (TCN):** $y = y_0$ nếu $\\lim_{x \\to +\\infty} f(x) = y_0$ hoặc $\\lim_{x \\to -\\infty} f(x) = y_0$.
  2. **Tiệm cận đứng (TCĐ):** $x = x_0$ nếu $\\lim_{x \\to x_0^+} f(x) = \\pm\\infty$ hoặc $\\lim_{x \\to x_0^-} f(x) = \\pm\\infty$.
  3. **Tiệm cận xiên (TCX):** $y = ax + b$ ($a \\neq 0$) với $a = \\lim_{x \\to \\pm\\infty} \\frac{f(x)}{x}$ và $b = \\lim_{x \\to \\pm\\infty} [f(x) - ax]$.
     *(Mẹo nhanh cho hàm $y = ax + b + \\frac{c}{mx+n}$: TCĐ là $x = -\\frac{n}{m}$ và TCX là $y = ax + b$, tâm đối xứng là giao điểm 2 đường tiệm cận!)*

### 2. Nguyên hàm & Tích phân ứng dụng
- **Bảng nguyên hàm cơ bản:**
  $$\\int x^\\alpha dx = \\frac{x^{\\alpha+1}}{\\alpha+1} + C \\quad (\\alpha \\neq -1); \\qquad \\int \\frac{1}{x} dx = \\ln|x| + C; \\qquad \\int e^x dx = e^x + C$$
- **Ứng dụng tích phân tính Diện tích & Thể tích:**
  + Diện tích giới hạn bởi $y = f(x), y = g(x), x = a, x = b$: $S = \\int_a^b |f(x) - g(x)| dx$.
  + Thể tích khối tròn xoay khi quay quanh trục $Ox$: $V = \\pi \\int_a^b [f(x)]^2 dx$.

### 3. Hình học không gian $Oxyz$ & Xác suất có điều kiện
- **Phương trình mặt phẳng** qua $M(x_0; y_0; z_0)$ có VTPT $\\vec{n}=(A; B; C)$: $A(x-x_0) + B(y-y_0) + C(z-z_0) = 0$.
- **Xác suất có điều kiện:** $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$.
- **Công thức xác suất toàn phần & Công thức Bayes:**
  $$P(A) = P(B) \\cdot P(A|B) + P(\\overline{B}) \\cdot P(A|\\overline{B}); \\qquad P(B|A) = \\frac{P(B) \\cdot P(A|B)}{P(A)}$$

📌 *Em có bài toán cụ thể nào cần giải từng bước không? Hãy nhập đề bài hoặc đính kèm ảnh chụp đề bài nhé!*`;
  }

  // ==========================================================================
  // 8. VẬT LÝ 12 (VẬT LÝ NHIỆT, KHÍ LÝ TƯỞNG, TỪ TRƯỜNG, HẠT NHÂN)
  // ==========================================================================
  if (
    sub.includes('lý') ||
    q.includes('vật lý') ||
    q.includes('nhiệt') ||
    q.includes('khí lý tưởng') ||
    q.includes('từ trường') ||
    q.includes('cảm ứng từ') ||
    q.includes('hạt nhân') ||
    q.includes('phóng xạ') ||
    q.includes('dao động')
  ) {
    return `⚡ **TỔNG HỢP KIẾN THỨC VẬT LÝ 12 (CHƯƠNG TRÌNH GDPT 2018)**
Chào **${studentName}** (Điểm TB Vật lý: **${scores?.ly?.avg ?? 7.8}**)!

### 4 Chương trọng tâm Vật lý 12:
1. **Chương 1 – Vật lý Nhiệt:**
   - **Định luật I Nhiệt động lực học:** $\\Delta U = A + Q$ (Hệ nhận nhiệt $Q > 0$, nhận công $A > 0$; hệ truyền nhiệt $Q < 0$, thực hiện công $A < 0$).
   - **Nhiệt lượng chuyển thể:** Đun nóng $Q = mc\\Delta T$; Nóng chảy $Q = \\lambda m$; Hóa hơi $Q = Lm$.
2. **Chương 2 – Khí lý tưởng:**
   - **Phương trình trạng thái khí lý tưởng:** $\\frac{p_1 V_1}{T_1} = \\frac{p_2 V_2}{T_2}$ *(Nhớ đổi $T(K) = t(^\\circ C) + 273$)*.
   - **Phương trình Clapeyron:** $pV = nRT$ ($R \\approx 8,31\\text{ J/mol.K}$) và động năng tịnh tiến trung bình phân tử: $\\overline{E_đ} = \\frac{3}{2} kT$.
3. **Chương 3 – Từ trường & Cảm ứng điện từ:**
   - **Lực từ:** $F = BIl\\sin\\alpha$.
   - **Từ thông & Suất điện động cảm ứng Faraday:** $\\Phi = NBS\\cos\\alpha \\Rightarrow e_c = -\\frac{\\Delta \\Phi}{\\Delta t}$.
4. **Chương 4 – Vật lý Hạt nhân:**
   - **Độ hụt khối & Năng lượng liên kết:** $\\Delta m = [Z m_p + (A-Z) m_n] - m_X \\Rightarrow W_{lk} = \\Delta m \\cdot c^2$ ($1\\text{ amu} \\cdot c^2 \\approx 931,5\\text{ MeV}$).
   - **Định luật phóng xạ:** $N(t) = N_0 \\cdot 2^{-\\frac{t}{T}}$; số hạt đã phân rã $\\Delta N = N_0 \\left(1 - 2^{-\\frac{t}{T}}\\right)$.`;
  }

  // ==========================================================================
  // 9. TIẾNG ANH 12 & NGỮ VĂN 12
  // ==========================================================================
  if (
    sub.includes('anh') ||
    q.includes('tiếng anh') ||
    q.includes('ngữ pháp') ||
    q.includes('mệnh đề') ||
    q.includes('điều kiện') ||
    q.includes('reading') ||
    q.includes('từ vựng')
  ) {
    return `🇬🇧 **TỔNG HỢP NGỮ PHÁP & CHIẾN THUẬT TIẾNG ANH 12 (ĐỀ MỚI 2027)**
Chào **${studentName}** (Điểm TB Tiếng Anh: **${scores?.anh?.avg ?? 8.2}**)!

### 1. Các cấu trúc ngữ pháp chắc chắn xuất hiện trong đề thi:
- **Rút gọn mệnh đề quan hệ:** Chủ động dùng **V-ing**, bị động dùng **V3/ed**, sau *the first/last/only* dùng **to V**.
- **Rút gọn mệnh đề trạng ngữ cùng chủ ngữ:** Chủ động dùng **V-ing / Having + V3/ed**, bị động dùng **V3/ed / Having been V3/ed**.
- **Cấu trúc câu điều kiện & Đảo ngữ:**
  + Loại 1: *Should + S + V(bare), S + will + V*
  + Loại 2: *Were + S + (to V), S + would + V*
  + Loại 3: *Had + S + V3/ed, S + would have + V3/ed*

### 2. Chiến thuật xử lý 40 câu đề thi TN THPT 2027:
- **Dạng sắp xếp hội thoại / thư / đoạn văn (5 câu):** Đọc câu mở đầu mang chủ đề chung (*Topic sentence*) và nối các từ chuyển ý (*First, Second, Moreover, However, Finally, In conclusion*).
- **Dạng đọc điền tờ rơi & thông báo (12 câu):** Chú ý *Word Form* (Danh - Động - Tính - Trạng), *Phrasal Verbs* và *Mạo từ a/an/the*.`;
  }

  if (
    sub.includes('văn') ||
    q.includes('ngữ văn') ||
    q.includes('nghị luận') ||
    q.includes('đọc hiểu') ||
    q.includes('mở bài') ||
    q.includes('kết bài')
  ) {
    return `📖 **TỔNG HỢP PHƯƠNG PHÁP LÀM BÀI NGỮ VĂN 12 ĐẠT 8.0+**
Chào **${studentName}** (Điểm TB Ngữ văn: **${scores?.van?.avg ?? 7.8}**)!

### 1. Phần Đọc hiểu (4.0 điểm – Ngữ liệu ngoài SGK):
- **Câu 1 – 2 (Nhận biết):** Xác định thể thơ, ngôi kể, phương thức biểu đạt, phép liên kết. Trả lời thẳng vào trọng tâm trong 2–3 dòng.
- **Câu 3 – 4 (Thông hiểu):** Phân tích tác dụng biện pháp tu từ theo **3 ý chuẩn**: *(1) Chỉ rõ từ ngữ chứa BPTT $\\rightarrow$ (2) Tác dụng nghệ thuật (gợi hình, gợi cảm, tạo nhịp điệu) $\\rightarrow$ (3) Tác dụng nội dung & tình cảm của tác giả*.
- **Câu 5 (Vận dụng):** Rút ra thông điệp và giải thích ngắn gọn trong 5–7 dòng.

### 2. Phần Viết (6.0 điểm):
- **Câu 1 (Đoạn văn 200 chữ - 2.0đ):** Viết đúng **1 đoạn văn** (không xuống dòng), cấu trúc *Mở đoạn (nêu vấn đề) – Thân đoạn (phân tích + 1 dẫn chứng tiêu biểu) – Kết đoạn (rút ra bài học)*.
- **Câu 2 (Bài văn nghị luận 600 chữ - 4.0đ):** Chia đủ 3 phần Mở bài – Thân bài (Giải thích, Phân tích chứng minh, Bàn luận mở rộng/phản đề, Bài học nhận thức & hành động) – Kết bài.`;
  }

  // ==========================================================================
  // 10. LỊCH SỬ 12 & GDKT-PL 12
  // ==========================================================================
  if (
    sub.includes('sử') ||
    q.includes('lịch sử') ||
    q.includes('liên hợp quốc') ||
    q.includes('chiến tranh lạnh') ||
    q.includes('asean') ||
    q.includes('cách mạng tháng tám') ||
    q.includes('điện biên phủ') ||
    q.includes('hồ chí minh')
  ) {
    return `🏛️ **TỔNG HỢP KIẾN THỨC LỊCH SỬ 12 TRỌNG TÂM**
Chào **${studentName}**! Dưới đây là các chủ đề cốt lõi môn Lịch sử 12:
1. **Thế giới trong và sau Chiến tranh lạnh:** Sự hình thành Liên Hợp Quốc (1945), Trật tự hai cực I-an-ta (1945–1991) và xu thế đa cực sau năm 1991.
2. **ASEAN:** Thành lập ngày 08/8/1967 tại Băng Cốc (5 nước sáng lập); Việt Nam gia nhập năm 1995; Cộng đồng ASEAN thành lập năm 2015 với 3 trụ cột (APSC, AEC, ASCC).
3. **Lịch sử Việt Nam (1945 – nay):** Cách mạng tháng Tám 1945, Kháng chiến chống Pháp (1945–1954, đỉnh cao Điện Biên Phủ), Kháng chiến chống Mỹ (1954–1975), Công cuộc Đổi mới (từ 12/1986 đến nay) và Hoạt động đối ngoại của Việt Nam.`;
  }

  if (
    sub.includes('gdkt') ||
    sub.includes('ktpl') ||
    q.includes('kinh tế pháp luật') ||
    q.includes('tăng trưởng kinh tế') ||
    q.includes('bảo hiểm') ||
    q.includes('an sinh xã hội') ||
    q.includes('quyền và nghĩa vụ')
  ) {
    return `⚖️ **TỔNG HỢP KIẾN THỨC GIÁO DỤC KINH TẾ & PHÁP LUẬT 12**
Chào **${studentName}**! Các chuyên đề trọng tâm môn GDKT & PL 12 gồm:
1. **Tăng trưởng và phát triển kinh tế:** Phân biệt GDP (Tổng sản phẩm quốc nội) và GNI (Tổng thu nhập quốc dân); Phát triển bền vững gắn kinh tế với tiến bộ xã hội và bảo vệ môi trường.
2. **Hội nhập kinh tế quốc tế:** Song phương, khu vực (ASEAN) và toàn cầu (WTO).
3. **Bảo hiểm & An sinh xã hội:** Bảo hiểm xã hội, Bảo hiểm y tế, Bảo hiểm thất nghiệp và Bảo hiểm thương mại.
4. **Quyền và nghĩa vụ công dân:** Về kinh doanh, nộp thuế, sở hữu tài sản, học tập, bảo vệ sức khỏe và bảo vệ Tổ quốc.`;
  }

  // ==========================================================================
  // 11. ĐÔI BẠN CÙNG TIẾN (Chỉ kích hoạt khi hỏi đúng cụm từ ghép cặp / đôi bạn)
  // ==========================================================================
  if (
    q.includes('đôi bạn cùng tiến') ||
    q.includes('đôi bạn') ||
    q.includes('ghép cặp') ||
    q.includes('tìm bạn học')
  ) {
    return `🤝 **GỢI Ý GHÉP CẶP "ĐÔI BẠN CÙNG TIẾN" DÀNH CHO ${studentName.toUpperCase()} (TỔ ${group})**

Dựa trên hồ sơ học tập của em tại lớp **12A7** (ĐTB hiện tại: **${gpa}**, môn thi tự chọn: **${exam1} & ${exam2}**):
1. **Nhóm bạn hỗ trợ môn Tự nhiên (Toán - Lý - Hóa):**
   - **Huỳnh Thị Ái Ly (Tổ 3 - Lớp trưởng):** Nắm chắc phương pháp giải nhanh Toán - Hóa - Anh, có sổ tay công thức rất khoa học.
   - **Vũ Trịnh Bảo An (Tổ 1 - Lớp phó học tập):** Thế mạnh giải bài tập vận dụng và sẵn sàng hỗ trợ các bạn trong giờ tự học.
2. **Cách học nhóm 15 phút đầu giờ hiệu quả tại lớp 12A7:**
   - **Thứ 2 & Thứ 4:** Trao đổi 5 câu trắc nghiệm Đúng/Sai môn **${exam1}**.
   - **Thứ 3 & Thứ 5:** Dò từ vựng / công thức trọng tâm môn **${exam2}** và **Toán**.
   - **Thứ 6:** Cùng bấm giờ giải 1 đề ngắn 20 phút và chữa lỗi sai ngay tại bàn.`;
  }

  // ==========================================================================
  // 12. TƯ VẤN ĐẠI HỌC & ĐỊNH HƯỚNG NGHỀ NGHIỆP
  // ==========================================================================
  if (
    sub.includes('đại học') ||
    sub.includes('hướng nghiệp') ||
    q.includes('ngành') ||
    q.includes('trường đại học') ||
    q.includes('đại học') ||
    q.includes('điểm chuẩn') ||
    q.includes('xét tuyển')
  ) {
    return `🎓 **CỐ VẤN ĐỊNH HƯỚNG ĐẠI HỌC & NGHỀ NGHIỆP CHO ${studentName.toUpperCase()}**

Hồ sơ của em tại lớp **12A7**:
- **Điểm trung bình hiện tại (GPA):** **${gpa}/10**
- **Hai môn thi tốt nghiệp tự chọn:** **${exam1}** và **${exam2}** (cùng Toán & Ngữ văn bắt buộc)
- **Định hướng mơ ước:** **${dreamCareer}**

### 1. Tổ hợp xét tuyển thế mạnh dành riêng cho em:
- Với bộ môn **Toán + Ngữ văn + ${exam1} + ${exam2}**, em có lợi thế lớn ở các tổ hợp xét tuyển năm 2027 (như **A00, A01, B00, D01, D07, C01** tùy theo trường).
- Điểm học bạ lớp 12 hiện tại (**${gpa}**) rất thuận lợi để kết hợp **Xét tuyển kết hợp (Học bạ + Điểm thi Đánh giá năng lực ĐHQG TP.HCM + Điểm thi TN THPT)**.

### 2. Gợi ý các trường Đại học uy tín tại TP.HCM:
- **Nhóm trường Top đầu (Mục tiêu 25.5 – 27.5+ điểm):** ĐH Bách Khoa, ĐH Khoa học Tự nhiên, ĐH Kinh tế TP.HCM (UEH), ĐH Sư phạm TP.HCM, ĐH Y Dược, ĐH Ngoại thương CS2.
- **Nhóm trường Công lập chất lượng cao (Mục tiêu 22.0 – 25.0 điểm):** ĐH Sài Gòn (SGU), ĐH Công Thương TP.HCM (HUIT), ĐH Ngân hàng (HUB), ĐH Giao thông Vận tải, ĐH Nông Lâm, ĐH Mở TP.HCM (OU).`;
  }

  // ==========================================================================
  // 13. CÂU HỎI TỔNG QUÁT / LỘ TRÌNH HỌC TẬP
  // ==========================================================================
  return `🌟 **GIA SƯ & CỐ VẤN HỌC TẬP AI 12A7 – GIẢI ĐÁP CHO ${studentName.toUpperCase()}**

Chào **${studentName}** (Tổ ${group} - Lớp 12A7)! Thầy đã nhận được câu hỏi của em:
> *"${question}"*

### 1. Hướng dẫn trọng tâm theo câu hỏi của em:
- Với môn thi tự chọn của em là **${exam1}** và **${exam2}** (cùng **Toán** & **Ngữ văn**), khi ôn tập chuyên đề này em cần chia thành **3 bước**:
  1. **Nắm chắc Lý thuyết & Định nghĩa SGK lớp 12:** Ghi nhớ từ khóa cốt lõi để xử lý nhanh 12 câu trắc nghiệm nhiều lựa chọn và 4 câu Đúng/Sai.
  2. **Hệ thống công thức tính nhanh:** Tóm tắt vào sổ tay 1 trang giấy A4 theo sơ đồ tư duy (Mindmap).
  3. **Thực hành 10 câu bài tập tiêu biểu:** Từ mức độ Nhận biết $\\rightarrow$ Thông hiểu $\\rightarrow$ Vận dụng.

### 2. Mẹo để Gia Sư AI 12A7 giải bài chi tiết nhất cho em:
- Em có thể gõ rõ **tên chuyên đề** (ví dụ: *"Tổng hợp kiến thức Chất béo"*, *"Este - Lipit"*, *"Cacbohidrat"*, *"Amin - Peptit"*, *"Khảo sát hàm số"*, *"Nguyên hàm tích phân"*, *"Oxyz"*, *"Vật lý nhiệt"*, *"Khí lý tưởng"*...) hoặc **nhấn biểu tượng Máy ảnh 📷 đính kèm ảnh chụp đề bài**, thầy sẽ giải chi tiết từng bước cho em ngay!`;
}
