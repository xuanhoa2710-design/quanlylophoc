// THANG ĐIỂM THI ĐUA HỌC SINH - TRƯỜNG THPT VĨNH LỘC B
// Ban hành ngày 05 tháng 09 năm 2026
// Áp dụng tính điểm thi đua tuần (Mỗi học sinh mỗi tuần khởi điểm 100 điểm)

export interface ViolationRule {
  stt: number;
  category: 'individual' | 'group';
  level: 'Mức độ I' | 'Mức độ II' | 'Mức độ III';
  title: string;
  pointsDeducted: number;
  note?: string;
}

export const VIOLATIONS_CATALOG: ViolationRule[] = [
  // ==================== I. XỬ LÝ VI PHẠM CÁ NHÂN ====================
  {
    stt: 1,
    category: 'individual',
    level: 'Mức độ III',
    title: 'Đi trễ, vào lớp trễ sau giáo viên, đoàn viên không đeo huy hiệu đoàn khi được kiểm tra.',
    pointsDeducted: 5,
  },
  {
    stt: 2,
    category: 'individual',
    level: 'Mức độ III',
    title: 'Tập trung trễ, không xếp hàng, mất trật tự khi xếp hàng, tách khỏi hàng khi di chuyển...',
    pointsDeducted: 5,
  },
  {
    stt: 3,
    category: 'individual',
    level: 'Mức độ III',
    title: 'Mất trật tự giờ vắng giáo viên - giờ giải lao, ở trong lớp ngoài giờ học mà không có nhiệm vụ sau khi kết thúc buổi học 15 phút, ngủ trong lớp (do GVBM yêu cầu ghi nhận).',
    pointsDeducted: 10,
  },
  {
    stt: 4,
    category: 'individual',
    level: 'Mức độ III',
    title: 'Không mang sổ liên lạc khi bị xử lý vi phạm. Sổ liên lạc thiếu thông tin (Họ tên và chữ ký HS, CMHS, người đỡ đầu, GVCN,...)',
    pointsDeducted: 15,
  },
  {
    stt: 5,
    category: 'individual',
    level: 'Mức độ III',
    title: 'Lỗi tác phong Trừ điểm 01 lần trong ngày (Đồng phục không đúng quy định): Quần, áo, phù hiệu, dây nịch, đồng phục thể dục, mang balo không phải mẫu của trường, hoặc cặp học sinh sai quy định, mang dép (dép lê, dép xuồng, dép Crocs...), đi giày cao gót trên 5 phân và gót nhọn trên 3 phân...',
    pointsDeducted: 20,
    note: 'Trừ điểm 01 lần trong ngày',
  },
  {
    stt: 6,
    category: 'individual',
    level: 'Mức độ III',
    title: 'Lỗi tác phong sẽ trừ điểm nhiều lần trong ngày: áo ngoài quần trong khuôn viên trường (kể cả chơi thể thao), không gài nơ áo nữ, mặc áo khoác trong sân trường, đi sandal không cài quai hoặc đạp quai, đi chân không ra khỏi lớp học, đeo bông tai 1 bên từ 2 chiếc trở lên đối với nữ, son môi, gắn mi giả, trang điểm, mang dép trong trường hay trong lớp học, mang giày sandal khi mặc đồ thể dục - quốc phòng ngoài khuôn viên lớp học...',
    pointsDeducted: 20,
    note: 'Trừ nhiều lần trong ngày nếu vi phạm lặp đi lặp lại',
  },
  {
    stt: 7,
    category: 'individual',
    level: 'Mức độ III',
    title: 'Leo, nhảy, trên bàn ghế, cửa sổ, hàng rào, hành lang, lan can; ngồi trên bàn học, bàn giáo viên, lan can; đá bóng, đá cầu... không đúng nơi quy định.',
    pointsDeducted: 20,
  },
  {
    stt: 8,
    category: 'individual',
    level: 'Mức độ III',
    title: 'Vắng có phép / 1 buổi.',
    pointsDeducted: 5,
  },
  {
    stt: 9,
    category: 'individual',
    level: 'Mức độ III',
    title: 'Vắng không phép / 1 buổi.',
    pointsDeducted: 20,
  },
  {
    stt: 10,
    category: 'individual',
    level: 'Mức độ III',
    title: 'Không trình diện vi phạm khi có thông báo hoặc đã được gọi trực tiếp trên lớp hay bằng loa mà HS không xuống TD.',
    pointsDeducted: 20,
  },
  {
    stt: 11,
    category: 'individual',
    level: 'Mức độ II',
    title: 'Giẫm lên cỏ, phá hoại cây xanh...',
    pointsDeducted: 30,
  },
  {
    stt: 12,
    category: 'individual',
    level: 'Mức độ II',
    title: 'Mang thức ăn, mang nước uống có đường, có màu (chai nước ngọt nhựa, ly giấy, hộp giấy, ly nhựa…) lên khuôn viên lớp (hành lang và trong lớp) nhưng chưa sử dụng. (Ngoại trừ sữa hộp giấy, nước lọc đóng chai)',
    pointsDeducted: 30,
  },
  {
    stt: 13,
    category: 'individual',
    level: 'Mức độ II',
    title: 'Đang sử dụng thức ăn, mang nước uống có đường trong khuôn viên lớp (hành lang và trong lớp).',
    pointsDeducted: 40,
    note: 'Lưu ý: Điều 11 và điều 12 là 2 lỗi tồn tại độc lập, tách bạch với nhau.',
  },
  {
    stt: 14,
    category: 'individual',
    level: 'Mức độ II',
    title: 'Lỗi tác phong thông báo phụ huynh điều chỉnh: Tóc không đúng quy định (nam sinh tóc phải hớt ngắn, cao hơn cổ áo và chân mày), nhuộm tóc, cắt hớt tóc dị biệt, sơn móng tay, sơn móng chân, kẻ bass trên đầu, kẻ bass ở chân mày, để móng tay dài hoặc nhọn…; Đeo bông tai đối với nam, đeo bông tai dị biệt cả nam và nữ; Lộ hình xăm trên người gây ảnh hưởng đến giáo viên và học sinh khác.',
    pointsDeducted: 40,
  },
  {
    stt: 15,
    category: 'individual',
    level: 'Mức độ II',
    title: 'Trốn tiết, Tự ý rời khỏi lớp.',
    pointsDeducted: 40,
  },
  {
    stt: 16,
    category: 'individual',
    level: 'Mức độ II',
    title: 'Sử dụng điện thoại di động, các thiết bị khác trong/ngoài giờ học trái với quy định; để ĐTDĐ trạng thái mở nguồn; làm mất trật tự trong lớp học.',
    pointsDeducted: 40,
    note: 'Chỉ được phép sử dụng khi giáo viên cho phép hoặc sau 16h00 tan học.',
  },
  {
    stt: 17,
    category: 'individual',
    level: 'Mức độ II',
    title: 'Xả rác; Bỏ rác không đúng theo quy định; không nhặt rác khi có hiệu lệnh từ giáo viên; Bôi viết bẩn; vẽ bậy lên tường, bàn ghế; ở lại trong lớp hoặc khu vực cấm trong giờ ra chơi buổi sáng…',
    pointsDeducted: 40,
  },
  {
    stt: 18,
    category: 'individual',
    level: 'Mức độ II',
    title: 'Nói tục, chửi thề, vi phạm quy tắc ứng xử trong trường học, gây xích mích với bạn...',
    pointsDeducted: 45,
  },
  {
    stt: 19,
    category: 'individual',
    level: 'Mức độ I',
    title: 'Thiếu trung thực trong mọi tình huống, nói dối Thầy Cô, không hợp tác khi vi phạm nội quy.',
    pointsDeducted: 51,
  },
  {
    stt: 20,
    category: 'individual',
    level: 'Mức độ I',
    title: 'Mang thuốc lá, hút thuốc lá truyền thống và điện tử; uống rượu bia; đánh nhau; đánh bài, cá cược trong trường.',
    pointsDeducted: 51,
  },
  {
    stt: 21,
    category: 'individual',
    level: 'Mức độ I',
    title: 'Lấy cắp, phá hoại tài sản, giấu sổ đầu bài…',
    pointsDeducted: 51,
  },
  {
    stt: 22,
    category: 'individual',
    level: 'Mức độ I',
    title: 'Vô lễ, xúc phạm danh dự, ứng xử không đúng chuẩn mực với GV-CNV; Giao tiếp hoặc hành động không lễ phép với giáo viên, CNV và khách mời của trường.',
    pointsDeducted: 51,
  },
  {
    stt: 23,
    category: 'individual',
    level: 'Mức độ I',
    title: 'Sử dụng, lưu trữ, vận chuyển vật phẩm, dữ liệu,… có nội dung khiêu dâm, cá cược, kích động bạo lực, phản động; đem các vật nguy hiểm, vật liệu cháy nổ vào trường không thuộc danh mục thiết bị hỗ trợ học tập (hộp quẹt, kéo,… )',
    pointsDeducted: 51,
  },
  {
    stt: 24,
    category: 'individual',
    level: 'Mức độ I',
    title: 'Sử dụng ĐTDĐ và các thiết bị khác vi phạm các quy định của Pháp luật; chia sẻ, phát tán bài viết phản động, xuyên tạc; bôi nhọ danh dự, nói xấu thầy cô bạn bè trên mạng xã hội.',
    pointsDeducted: 51,
  },
  {
    stt: 25,
    category: 'individual',
    level: 'Mức độ I',
    title: 'Nẹt bô trong khuôn viên trường, chạy xe tốc độ cao, phá hoại tài sản nhà trường (căn tin, bãi xe...và các khu vực giáo dục khác), vi phạm về an toàn giao thông, pháp luật nhà nước…',
    pointsDeducted: 51,
  },
  {
    stt: 26,
    category: 'individual',
    level: 'Mức độ I',
    title: 'Các vi phạm khác phát sinh (xử lý theo mức độ).',
    pointsDeducted: 20,
    note: 'Tùy vào mức độ để xử lý',
  },

  // ==================== II. XỬ LÝ VI PHẠM TẬP THỂ LỚP ====================
  {
    stt: 27,
    category: 'group',
    level: 'Mức độ II',
    title: 'Lớp trưởng, Bí thư lớp không dự họp giao ban công tác học sinh, công tác Đoàn, công tác khác khi có thông báo từ nhà trường.',
    pointsDeducted: 20,
  },
  {
    stt: 28,
    category: 'group',
    level: 'Mức độ II',
    title: 'Công tác vệ sinh lớp học: không vệ sinh lớp học, vệ sinh lớp dơ hoặc trễ, hành lang dơ không quét, không sắp xếp bàn ghế, để rác trong hộc bàn khi ra về...',
    pointsDeducted: 15,
    note: 'Từ 5 đến 30 điểm tùy mức độ vi phạm',
  },
  {
    stt: 29,
    category: 'group',
    level: 'Mức độ II',
    title: 'Lớp, hành lang có vết kẹo singum…',
    pointsDeducted: 30,
  },
  {
    stt: 30,
    category: 'group',
    level: 'Mức độ II',
    title: 'Cố ý không điểm danh hoặc điểm danh sai…',
    pointsDeducted: 30,
  },
  {
    stt: 31,
    category: 'group',
    level: 'Mức độ II',
    title: 'Không dọn dẹp bàn ghế, vệ sinh khu vực lớp sau lễ, không làm vệ sinh định kì.',
    pointsDeducted: 30,
  },
  {
    stt: 32,
    category: 'group',
    level: 'Mức độ II',
    title: 'Không tắt đèn quạt khi ra khỏi lớp; không khóa cửa lớp khi tan học.',
    pointsDeducted: 30,
  },
  {
    stt: 33,
    category: 'group',
    level: 'Mức độ II',
    title: 'Lớp ồn, tự quản không tốt (giờ ôn bài, giờ vắng GV, giờ nghỉ...), di chuyển tiết học mất trật tự, không theo 1 hàng.',
    pointsDeducted: 30,
  },
  {
    stt: 34,
    category: 'group',
    level: 'Mức độ I',
    title: 'Tập thể lớp vô kỷ luật, không chấp hành điều động của trường - của giáo viên, mất trật tự khi tập trung, lớp xếp hàng trễ, tập trung trễ dưới sân, tụ tập gây mất trật tự...',
    pointsDeducted: 51,
  },
  {
    stt: 35,
    category: 'group',
    level: 'Mức độ I',
    title: 'Không vệ sinh phòng học theo kế hoạch.',
    pointsDeducted: 51,
  },
  {
    stt: 36,
    category: 'group',
    level: 'Mức độ I',
    title: 'Không tham gia hoặc tham gia không hiệu quả hoạt động phong trào học sinh được tổ chức Đoàn TN triển khai.',
    pointsDeducted: 51,
  },
];

export const BONUS_PRESETS = [
  { reason: 'Đạt Giải Nhất phong trào / hội thao / văn nghệ trường', points: 50 },
  { reason: 'Đạt Giải Nhì phong trào / cuộc thi cấp trường', points: 40 },
  { reason: 'Đạt Giải Ba phong trào / cuộc thi cấp trường', points: 30 },
  { reason: 'Đạt Giải Khuyến khích phong trào học sinh', points: 20 },
  { reason: 'Gương người tốt việc tốt / Nhặt được của rơi trả lại người mất', points: 20 },
  { reason: 'Tổ có tuần lễ nề nếp trực nhật xuất sắc 100%', points: 15 },
  { reason: 'Hỗ trợ lớp và nhà trường trong công tác đột xuất', points: 10 },
];
