import {
  Assignment,
  Announcement,
  EvaluationComment,
  ChatMessage,
  Appointment,
  HappyPost,
  TimetableEntry,
  DailyAttendance,
  ClassAppConfig,
  StudentDisciplineEntry,
  BonusPointEntry,
  EmulationScoreAdjustment,
  DutyScheduleItem,
  SupplementaryAttendanceEntry,
} from "../types";

// Dữ liệu gốc mặc định được hardcode trực tiếp vào mã nguồn từ file JSON chuẩn Lớp 12A7 THPT Vĩnh Lộc B
export const INITIAL_CURRENT_WEEK: number = 6;

export const INITIAL_APP_CONFIG: ClassAppConfig = {
  "className": "12A7",
  "schoolName": "THPT Vĩnh Lộc B",
  "schoolYear": "2026 - 2027",
  "roomNumber": "P.12A7 (Dãy B, Lầu 2)",
  "slogan": "Đoàn kết - Yêu thương - Cùng tiến bộ",
  "motto": "Dream Big And Dare To Fail",
  "targetGoal": "Quyết tâm đậu TN & ĐH 100%",
  "teacherName": "Thầy Trương Xuân Hòa",
  "teacherTitle": "Giáo viên Chủ nhiệm 12A7",
  "teacherSubject": "Hóa học",
  "teacherPhone": "0908 123 456",
  "teacherEmail": "xuanhoa2710@gmail.com",
  "teacherZalo": "0908 123 456",
  "teacherAvatar": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=300&q=80",
  "teacherMessage": "Chào các em 12A7 và quý phụ huynh! Năm học cuối cấp 2026-2027 là thời khắc vàng để các em bứt phá. Thầy chúc cả lớp luôn đoàn kết, tự tin và chinh phục thành công 100% mục tiêu Đại học & Tốt nghiệp mơ ước!"
};

export const INITIAL_TIMETABLE: TimetableEntry[] = [
  {
    "day": "Thứ Hai",
    "periods": [
      {
        "period": 1,
        "session": "morning",
        "time": "07:25 - 08:10",
        "subject": "SHDC (Chào cờ & Sinh hoạt dưới cờ)",
        "teacher": "Thầy Trương Xuân Hòa (GVCN)",
        "room": "Sân trường / P.12A7"
      },
      {
        "period": 2,
        "session": "morning",
        "time": "08:15 - 09:00",
        "subject": "HĐTN 1 (Hoạt động trải nghiệm)",
        "teacher": "Thầy Trương Xuân Hòa (GVCN)",
        "room": "P.12A7"
      },
      {
        "period": 3,
        "session": "morning",
        "time": "09:35 - 10:20",
        "subject": "GDĐP (Giáo dục địa phương)",
        "teacher": "Cô Đinh Thị Đào",
        "room": "P.12A7"
      },
      {
        "period": 4,
        "session": "morning",
        "time": "10:25 - 11:10",
        "subject": "Ngữ văn",
        "teacher": "Cô Đinh Thị Đào",
        "room": "P.12A7"
      },
      {
        "period": 1,
        "session": "afternoon",
        "time": "13:15 - 14:00",
        "subject": "Tiếng Anh",
        "teacher": "Cô Ngô Thị Thảo",
        "room": "P.12A7"
      },
      {
        "period": 2,
        "session": "afternoon",
        "time": "14:05 - 14:50",
        "subject": "Toán học",
        "teacher": "Thầy Hồ Quốc Thanh",
        "room": "P.12A7"
      },
      {
        "period": 3,
        "session": "afternoon",
        "time": "15:15 - 16:00",
        "subject": "Toán học",
        "teacher": "Thầy Hồ Quốc Thanh",
        "room": "P.12A7"
      }
    ]
  },
  {
    "day": "Thứ Ba",
    "periods": [
      {
        "period": 1,
        "session": "morning",
        "time": "07:25 - 08:10",
        "subject": "Hóa học",
        "teacher": "Thầy Trương Xuân Hòa",
        "room": "P.12A7"
      },
      {
        "period": 2,
        "session": "morning",
        "time": "08:15 - 09:00",
        "subject": "Hóa học",
        "teacher": "Thầy Trương Xuân Hòa",
        "room": "P.12A7"
      },
      {
        "period": 3,
        "session": "morning",
        "time": "09:35 - 10:20",
        "subject": "Ngữ văn",
        "teacher": "Cô Đinh Thị Đào",
        "room": "P.12A7"
      },
      {
        "period": 4,
        "session": "morning",
        "time": "10:25 - 11:10",
        "subject": "Ngữ văn",
        "teacher": "Cô Đinh Thị Đào",
        "room": "P.12A7"
      },
      {
        "period": 1,
        "session": "afternoon",
        "time": "13:15 - 14:00",
        "subject": "Giáo dục thể chất (GDTC)",
        "teacher": "Thầy Nguyễn Hữu Nhân",
        "room": "Sân đa năng"
      },
      {
        "period": 2,
        "session": "afternoon",
        "time": "14:05 - 14:50",
        "subject": "Giáo dục thể chất (GDTC)",
        "teacher": "Thầy Nguyễn Hữu Nhân",
        "room": "Sân đa năng"
      },
      {
        "period": 3,
        "session": "afternoon",
        "time": "15:15 - 16:00",
        "subject": "Vật lý",
        "teacher": "Thầy Nguyễn Văn Tèo",
        "room": "P.12A7"
      }
    ]
  },
  {
    "day": "Thứ Tư",
    "periods": [
      {
        "period": 1,
        "session": "morning",
        "time": "07:25 - 08:10",
        "subject": "Tiếng Anh",
        "teacher": "Cô Ngô Thị Thảo",
        "room": "P.12A7"
      },
      {
        "period": 2,
        "session": "morning",
        "time": "08:15 - 09:00",
        "subject": "Tiếng Anh",
        "teacher": "Cô Ngô Thị Thảo",
        "room": "P.12A7"
      },
      {
        "period": 3,
        "session": "morning",
        "time": "09:35 - 10:20",
        "subject": "GDKT-PL (Kinh tế & Pháp luật)",
        "teacher": "Cô Hồ Thị Vân Anh",
        "room": "P.12A7"
      },
      {
        "period": 4,
        "session": "morning",
        "time": "10:25 - 11:10",
        "subject": "Tin học",
        "teacher": "Cô Tạ Thị Tình",
        "room": "Phòng Tin học"
      },
      {
        "period": 1,
        "session": "afternoon",
        "time": "13:15 - 14:00",
        "subject": "GDKT-PL (Kinh tế & Pháp luật)",
        "teacher": "Cô Hồ Thị Vân Anh",
        "room": "P.12A7"
      },
      {
        "period": 2,
        "session": "afternoon",
        "time": "14:05 - 14:50",
        "subject": "Lịch sử",
        "teacher": "Thầy Trịnh Ngọc Thiện",
        "room": "P.12A7"
      },
      {
        "period": 3,
        "session": "afternoon",
        "time": "15:15 - 16:00",
        "subject": "Tiếng Anh bản ngữ",
        "teacher": "Giáo viên Bản ngữ",
        "room": "P.12A7"
      }
    ]
  },
  {
    "day": "Thứ Năm",
    "periods": [
      {
        "period": 1,
        "session": "morning",
        "time": "07:25 - 08:10",
        "subject": "Giáo dục Quốc phòng (GDQP)",
        "teacher": "Cô Đinh Thị Liên",
        "room": "Sân trường / P.12A7"
      },
      {
        "period": 2,
        "session": "morning",
        "time": "08:15 - 09:00",
        "subject": "Vật lý",
        "teacher": "Thầy Nguyễn Văn Tèo",
        "room": "P.12A7"
      },
      {
        "period": 3,
        "session": "morning",
        "time": "09:35 - 10:20",
        "subject": "Toán học",
        "teacher": "Thầy Hồ Quốc Thanh",
        "room": "P.12A7"
      },
      {
        "period": 4,
        "session": "morning",
        "time": "10:25 - 11:10",
        "subject": "Toán học",
        "teacher": "Thầy Hồ Quốc Thanh",
        "room": "P.12A7"
      },
      {
        "period": 1,
        "session": "afternoon",
        "time": "13:15 - 14:00",
        "subject": "STEM",
        "teacher": "Thầy Trương Xuân Hòa & Tổ STEM",
        "room": "Phòng STEM / P.12A7"
      },
      {
        "period": 2,
        "session": "afternoon",
        "time": "14:05 - 14:50",
        "subject": "Tiếng Anh bản ngữ",
        "teacher": "Giáo viên Bản ngữ",
        "room": "P.12A7"
      }
    ]
  },
  {
    "day": "Thứ Sáu",
    "periods": [
      {
        "period": 1,
        "session": "morning",
        "time": "07:25 - 08:10",
        "subject": "Vật lý",
        "teacher": "Thầy Nguyễn Văn Tèo",
        "room": "P.12A7"
      },
      {
        "period": 2,
        "session": "morning",
        "time": "08:15 - 09:00",
        "subject": "Tin học",
        "teacher": "Cô Tạ Thị Tình",
        "room": "Phòng Tin học"
      },
      {
        "period": 3,
        "session": "morning",
        "time": "09:35 - 10:20",
        "subject": "Lịch sử",
        "teacher": "Thầy Trịnh Ngọc Thiện",
        "room": "P.12A7"
      },
      {
        "period": 4,
        "session": "morning",
        "time": "10:25 - 11:10",
        "subject": "HĐTN 2 (Hoạt động trải nghiệm)",
        "teacher": "Thầy Trương Xuân Hòa (GVCN)",
        "room": "P.12A7"
      },
      {
        "period": 1,
        "session": "afternoon",
        "time": "13:15 - 14:00",
        "subject": "HĐTN 3 (Sinh hoạt lớp & HĐTN)",
        "teacher": "Thầy Trương Xuân Hòa (GVCN)",
        "room": "P.12A7"
      },
      {
        "period": 2,
        "session": "afternoon",
        "time": "14:05 - 14:50",
        "subject": "Hóa học",
        "teacher": "Thầy Trương Xuân Hòa",
        "room": "P.12A7"
      }
    ]
  }
];

export const INITIAL_DUTY_SCHEDULE: DutyScheduleItem[] = [
  {
    "id": "duty-1",
    "group": "Tổ 1",
    "day": "Thứ Hai",
    "task": "Kê bàn ghế chào cờ sân trường, lau bảng sạch trước 6h45, kiểm tra khăn lau phấn, đổ rác đầu tuần",
    "leaderName": "Nguyễn Hoàng Khang (Tổ trưởng)",
    "assignedBy": "Trần Anh Khoa (Lớp phó Lao động)",
    "status": "completed",
    "score": 10,
    "note": "Tổ 1 hoàn thành xuất sắc, lớp học rất sạch sẽ và ngăn nắp đầu tuần."
  },
  {
    "id": "duty-2",
    "group": "Tổ 2",
    "day": "Thứ Ba & Thứ Năm",
    "task": "Vệ sinh phòng học trước 6h45, chuẩn bị bút viết bảng/phấn, đổ rác sau tiết 4 sáng và sau tiết 3 chiều",
    "leaderName": "Lê Quang Hải (Tổ trưởng)",
    "assignedBy": "Trần Anh Khoa (Lớp phó Lao động)",
    "status": "completed",
    "score": 9.5,
    "note": "Lau bảng sạch, giặt khăn sạch sẽ. Cần nhắc nhở bạn cuối dãy kê lại bàn ngay ngắn."
  },
  {
    "id": "duty-3",
    "group": "Tổ 3",
    "day": "Thứ Tư",
    "task": "Kiểm tra hệ thống quạt, đèn trước và sau buổi học; tưới cây xanh hành lang lớp 12A7; thu gom rác hộc bàn",
    "leaderName": "Phạm Nhật Minh (Tổ trưởng)",
    "assignedBy": "Trần Anh Khoa (Lớp phó Lao động)",
    "status": "in_progress",
    "score": 10,
    "note": "Cây xanh hành lang tươi tốt, tắt quạt đèn đúng giờ ra về."
  },
  {
    "id": "duty-4",
    "group": "Tổ 4",
    "day": "Thứ Sáu",
    "task": "Tổng vệ sinh cuối tuần, lau cửa kính, quét mạng nhện, khóa chặt cửa sổ, kiểm kê bàn ghế và thiết bị lớp",
    "leaderName": "Võ Hoàng Tuấn (Tổ trưởng)",
    "assignedBy": "Trần Anh Khoa (Lớp phó Lao động)",
    "status": "pending",
    "score": 10,
    "note": "Chuẩn bị kế hoạch tổng vệ sinh cuối tuần sau tiết sinh hoạt lớp."
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    "id": "ann-4",
    "title": "Họp Phụ huynh định kỳ đầu năm học và tư vấn hướng nghiệp 12",
    "type": "parent_meeting",
    "content": "Trân trọng kính mời Quý phụ huynh học sinh lớp 12A7 đến tham dự buổi họp phụ huynh đầu năm:\n- Thời gian: 08:00 sáng Chủ Nhật ngày 18/10/2026.\n- Địa điểm: Phòng học lớp 12A7 (Lầu 2, Dãy B, Trường THPT Vĩnh Lộc B).\n- Nội dung chính:\n  + Báo cáo định hướng chuyên môn năm học cuối cấp 2026-2027.\n  + Thống nhất kế hoạch ôn thi TN THPT & ĐH 100%.\n  + Bầu Ban đại diện Cha mẹ học sinh lớp.\n  + Trao đổi riêng về từng học sinh.\nSự hiện diện đầy đủ của Quý phụ huynh là niềm động viên lớn cho các em!",
    "author": "Cô Tạ Thị Tình",
    "role": "Giáo viên chủ nhiệm 12A7",
    "createdAt": "2026-10-02 09:00",
    "isPinned": false
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    "id": "asg-1",
    "title": "Chuyên đề ôn tập este & lipit - Đề thi thử số 01",
    "subject": "Hóa học",
    "description": "Hoàn thành 30 câu hỏi trắc nghiệm định dạng đề thi tốt nghiệp THPT năm 2027.\nYêu cầu:\n- Tự làm nghiêm túc, ghi rõ giải thích chi tiết cho các câu mức độ vận dụng (từ câu 25 đến 30).\n- Chụp ảnh bài làm hoặc tải file PDF lời giải lên hệ thống.",
    "dueDate": "2026-10-15 23:59",
    "targetGroup": "all",
    "attachments": [
      {
        "name": "De_on_tap_Este_Lipit_12A7.pdf",
        "type": "pdf",
        "size": "1.2 MB"
      },
      {
        "name": "Bang_he_thong_cong_thuc.docx",
        "type": "doc",
        "size": "540 KB"
      }
    ],
    "createdAt": "2026-10-08 08:00",
    "submissions": {
      "hs-3": {
        "studentId": "hs-3",
        "studentName": "Trần Ngọc Mai Anh",
        "submittedAt": "2026-10-09 20:15",
        "content": "Em đã hoàn thành đủ 30 câu và ghi chú các dạng bài bẫy este đa chức ạ!",
        "attachments": [
          "Bai_lam_MaiAnh_12A7.pdf"
        ],
        "grade": 9.5,
        "feedback": "Bài làm rất chỉn chu, trình bày rõ ràng và nắm bản chất Este rất tốt. Khen ngợi em!",
        "status": "graded"
      },
      "hs-43": {
        "studentId": "hs-43",
        "studentName": "Lê Phú Trình",
        "submittedAt": "2026-10-09 19:40",
        "content": "Dạ em nộp bài tập Hóa học số 1. Em có thêm 2 cách giải bảo toàn khối lượng ở câu 29-30 ạ.",
        "attachments": [
          "LePhuTrinh_HoaHoc_Bai1.pdf"
        ],
        "grade": 10,
        "feedback": "Xuất sắc! Lối tư duy bảo toàn e và bảo toàn khối lượng rất sắc bén.",
        "status": "graded"
      },
      "hs-28": {
        "studentId": "hs-28",
        "studentName": "Nguyễn Tam Minh",
        "submittedAt": "2026-10-09 21:00",
        "content": "Em nộp bài tập ạ!",
        "attachments": [
          "NguyenTamMinh_Hoa1.pdf"
        ],
        "grade": 9.8,
        "feedback": "Bài làm tuyệt vời, tiếp tục phát huy nhé Minh!",
        "status": "graded"
      }
    }
  },
  {
    "id": "asg-2",
    "title": "Khảo sát sự biến thiên và vẽ đồ thị hàm số chứa tham số m",
    "subject": "Toán học",
    "description": "Bài tập Toán nâng cao dành cho nhóm thi khối Tự nhiên A00, B00, D01.\nCác em giải 5 bài toán tự luận về cực trị và tương giao đồ thị hàm số bậc 3, bậc 4.",
    "dueDate": "2026-10-16 22:00",
    "targetGroup": "all",
    "attachments": [
      {
        "name": "Bai_tap_Ham_so_Tham_so_m.pdf",
        "type": "pdf",
        "size": "890 KB"
      }
    ],
    "createdAt": "2026-10-07 10:00",
    "submissions": {}
  },
  {
    "id": "asg-3",
    "title": "Writing Task 1 & Reading Practice Test - Unit 1 Life Stories",
    "subject": "Tiếng Anh",
    "description": "Luyện đọc hiểu 2 bài đọc chủ đề Nhân vật truyền cảm hứng và viết 1 đoạn văn (120-150 từ) về tấm gương em ngưỡng mộ.",
    "dueDate": "2026-10-18 20:00",
    "targetGroup": "all",
    "attachments": [
      {
        "name": "Unit1_Practice_Test_A7.pdf",
        "type": "pdf",
        "size": "2.1 MB"
      }
    ],
    "createdAt": "2026-10-09 14:00",
    "submissions": {}
  }
];

export const INITIAL_EVALUATIONS: EvaluationComment[] = [
  {
    "id": "ev-1",
    "studentId": "hs-43",
    "studentName": "Lê Phú Trình",
    "period": "Tháng",
    "periodLabel": "Tháng 9/2026",
    "academic": "Thành tích học tập xuất sắc toàn diện, dẫn đầu lớp về điểm Toán, Hóa, Lý và Anh.",
    "awareness": "Ý thức tự giác học tập rất cao, là tấm gương sáng cho cả lớp noi theo.",
    "skills": "Kỹ năng giải quyết bài toán phức tạp và tư duy logic nổi bật.",
    "attitude": "Khiêm tốn, hòa nhã với bạn bè, tích cực giúp đỡ các bạn trong tổ.",
    "strengths": "Khả năng tự học đỉnh cao, tư duy nghiên cứu khoa học sắc bén.",
    "improvements": "Cần chú ý ăn uống đầy đủ và nghỉ ngơi hợp lý, tránh thức quá khuya ảnh hưởng sức khỏe.",
    "teacherNote": "Học sinh tiêu biểu của 12A7, cô rất kỳ vọng em sẽ đạt thủ khoa kỳ thi đại học!",
    "createdAt": "2026-10-01"
  },
  {
    "id": "ev-2",
    "studentId": "hs-27",
    "studentName": "Huỳnh Thị Ái Ly",
    "period": "Tháng",
    "periodLabel": "Tháng 9/2026",
    "academic": "Học lực giỏi, nổi bật môn Ngữ văn và các môn Tự nhiên.",
    "awareness": "Nghiêm túc chấp hành nội quy, gương mẫu trong vai trò Lớp phó Học tập.",
    "skills": "Kỹ năng tổ chức học nhóm và điều phối lớp học rất hiệu quả.",
    "attitude": "Tâm huyết, trách nhiệm, luôn quan tâm đến sự tiến bộ của bạn bè.",
    "strengths": "Chăm chỉ, chu đáo, khả năng viết và truyền cảm hứng tốt.",
    "improvements": "Giữ tâm lý thoải mái, tự tin vào bản thân hơn nữa.",
    "teacherNote": "Cảm ơn em đã luôn là cánh tay đắc lực hỗ trợ cô quản lý và động viên lớp!",
    "createdAt": "2026-10-01"
  },
  {
    "id": "ev-3",
    "studentId": "hs-8",
    "studentName": "Nguyễn Quốc Cường",
    "period": "Tháng",
    "periodLabel": "Tháng 9/2026",
    "academic": "Có sự tiến bộ rõ rệt ở môn Hóa và Tin học, tiếp thu bài nhanh.",
    "awareness": "Chuyên cần đã có chuyển biến tích cực, đi học đúng giờ hơn so với năm lớp 11.",
    "skills": "Thực hành thao tác kỹ thuật nhanh nhẹn.",
    "attitude": "Lễ phép với thầy cô, nhiệt tình giúp đỡ bạn bè trong các hoạt động.",
    "strengths": "Năng động, thật thà, yêu thích máy móc kỹ thuật.",
    "improvements": "Cần củng cố thêm môn Toán và Tiếng Anh để đảm bảo mục tiêu tốt nghiệp.",
    "teacherNote": "Cô ghi nhận nỗ lực cố gắng của Cường trong tháng vừa qua, em hãy giữ vững tinh thần này nhé!",
    "createdAt": "2026-10-01"
  }
];

export const INITIAL_HAPPY_POSTS: HappyPost[] = [
  {
    "id": "post-1",
    "category": "good_deed",
    "title": "Đôi bạn cùng tiến: Bạn Trình và bạn Minh kèm Toán Lý cho nhóm bạn Tổ 2",
    "content": "Chiều nay sau giờ tan học, bạn Phú Trình và Tam Minh đã chủ động ở lại lớp 45 phút để hướng dẫn lại phần công thức giải nhanh con lắc và bài toán Este cho các bạn còn vướng mắc. Tinh thần tương thân tương ái của 12A7 thật đáng trân trọng! \"Đoàn kết - Yêu thương - Cùng tiến bộ\"!",
    "authorName": "Cô Tạ Thị Tình",
    "authorRole": "teacher",
    "likes": 38,
    "likedBy": [
      "hs-1",
      "hs-2",
      "hs-3",
      "hs-5",
      "hs-8",
      "hs-27",
      "hs-28",
      "hs-43"
    ],
    "comments": [
      {
        "id": "c-1",
        "author": "Nguyễn Cao Kỳ",
        "text": "Cảm ơn 2 bạn đã chỉ bài cho tụi mình nhiệt tình!",
        "time": "18:30"
      },
      {
        "id": "c-2",
        "author": "Phạm Đình Bảo Khánh",
        "text": "12A7 đỉnh nóc kịch trần luôn ạ! 🔥",
        "time": "18:45"
      }
    ],
    "imageUrl": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    "createdAt": "2026-10-09 18:00"
  },
  {
    "id": "post-2",
    "category": "gratitude",
    "title": "Lời cảm ơn từ bạn Huỳnh Thị Ái Ly gửi cô chủ nhiệm",
    "content": "Em muốn gửi lời cảm ơn sâu sắc nhất đến Cô Tình. Ngày đầu năm 12 chúng em ai cũng mang theo nhiều áp lực về kỳ thi tốt nghiệp và chọn trường, nhưng sự ấm áp, nụ cười và những ly trà sữa cô mời sau giờ kiểm tra đã tiếp thêm cho chúng em rất nhiều động lực. Chúng em hứa sẽ cố gắng 100% để cô tự hào!",
    "authorName": "Huỳnh Thị Ái Ly",
    "authorRole": "student",
    "likes": 45,
    "likedBy": [
      "hs-3",
      "hs-4",
      "hs-5",
      "hs-6",
      "hs-7",
      "hs-11",
      "hs-27"
    ],
    "comments": [
      {
        "id": "c-3",
        "author": "Cô Tạ Thị Tình",
        "text": "Yêu thương các em nhiều, các con chính là niềm hạnh phúc lớn nhất của cô!",
        "time": "20:10"
      }
    ],
    "imageUrl": "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
    "createdAt": "2026-10-08 19:30"
  },
  {
    "id": "post-3",
    "category": "birthday",
    "title": "Chúc mừng sinh nhật các thành viên 12A7 sinh trong Tháng 10! 🎂🎉",
    "content": "Cả lớp cùng gửi những lời chúc ngọt ngào nhất tới:\n- Bạn Trịnh Thu Hiền (07/10)\n- Bạn Trần Anh Khoa (10/09 -> sinh nhật vừa qua)\nChúc các bạn tuổi 17 tràn ngập niềm vui, học thật giỏi, giữ vững nụ cười và chạm tay tới ước mơ đại học nhé!",
    "authorName": "Ban Cán Sự 12A7",
    "authorRole": "student",
    "likes": 49,
    "likedBy": [
      "hs-1",
      "hs-2",
      "hs-14",
      "hs-21"
    ],
    "comments": [
      {
        "id": "c-4",
        "author": "Trịnh Thu Hiền",
        "text": "Cảm ơn cả lớp và cô rất nhiều ạ! ❤️",
        "time": "09:00"
      }
    ],
    "imageUrl": "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
    "createdAt": "2026-10-07 08:00"
  },
  {
    "id": "post-4",
    "category": "memory",
    "title": "Khoảnh khắc Lễ khai giảng năm học 2026 - 2027: Năm học cuối cấp rực rỡ",
    "content": "Bộ ảnh khai giảng đầu năm học của 51 thành viên 12A7 dưới mái trường THPT Vĩnh Lộc B thân yêu. Hãy cùng lưu giữ từng khoảnh khắc thanh xuân tươi đẹp này các bạn nhé!",
    "authorName": "Nguyễn Thành Đạt",
    "authorRole": "student",
    "likes": 51,
    "likedBy": [
      "hs-1",
      "hs-2",
      "hs-3",
      "hs-4",
      "hs-5"
    ],
    "comments": [],
    "imageUrl": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    "createdAt": "2026-09-05 11:00"
  }
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  "hs-1": [
    {
      "id": "m-1",
      "studentId": "hs-1",
      "sender": "teacher",
      "senderName": "Thầy Trương Xuân Hòa (GVCN)",
      "text": "Chào phụ huynh em Bảo An, thầy gửi lời khen ngợi em An tuần này rất tập trung và tiến bộ trong giờ Hóa học nhé ạ.",
      "timestamp": "2026-10-08 16:30"
    }
  ]
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    "id": "apt-1",
    "studentId": "hs-8",
    "parentName": "Nguyễn Thị Tú Uyên",
    "studentName": "Nguyễn Quốc Cường",
    "date": "2026-10-18",
    "time": "10:30",
    "purpose": "Trao đổi định hướng chọn tổ hợp xét tuyển và duy trì chuyên cần năm lớp 12",
    "status": "accepted",
    "createdAt": "2026-10-08"
  }
];

export const INITIAL_ATTENDANCE: DailyAttendance = {
  "date": "2026-10-23",
  "records": {
    "hs-1": "present",
    "hs-2": "present",
    "hs-3": "present",
    "hs-4": "present",
    "hs-5": "present",
    "hs-6": "present",
    "hs-7": "present",
    "hs-8": "present",
    "hs-9": "present",
    "hs-10": "present",
    "hs-11": "present",
    "hs-12": "present",
    "hs-13": "present",
    "hs-14": "present",
    "hs-15": "present",
    "hs-16": "present",
    "hs-17": "present",
    "hs-18": "present",
    "hs-19": "present",
    "hs-20": "present",
    "hs-21": "late",
    "hs-22": "present",
    "hs-23": "present",
    "hs-24": "late",
    "hs-25": "present",
    "hs-26": "present",
    "hs-27": "present",
    "hs-28": "present",
    "hs-29": "excused",
    "hs-30": "present",
    "hs-31": "present",
    "hs-32": "present",
    "hs-33": "present",
    "hs-34": "present",
    "hs-35": "present",
    "hs-36": "present",
    "hs-37": "present",
    "hs-38": "present",
    "hs-39": "present",
    "hs-40": "present",
    "hs-41": "present",
    "hs-42": "present",
    "hs-43": "present",
    "hs-44": "present",
    "hs-45": "present",
    "hs-46": "present",
    "hs-47": "present",
    "hs-48": "present",
    "hs-49": "present",
    "hs-50": "present",
    "hs-51": "present",
    "hs-1792030357853": "present"
  },
  "note": "Lớp học nghiêm túc, bạn Trà My có phép do cảm cúm, 2 bạn Khoa và Kỳ trễ 5 phút đầu giờ.",
  "checkedBy": "Cô Tạ Thị Tình (GVCN)"
};

export const INITIAL_ALL_ATTENDANCE_DAYS: Record<string, DailyAttendance> = {
  "2026-10-10": {
    "date": "2026-10-10",
    "records": {
      "hs-1": "present",
      "hs-2": "present",
      "hs-3": "present",
      "hs-4": "present",
      "hs-5": "present",
      "hs-6": "present",
      "hs-7": "present",
      "hs-8": "present",
      "hs-9": "present",
      "hs-10": "present",
      "hs-11": "present",
      "hs-12": "present",
      "hs-13": "present",
      "hs-14": "present",
      "hs-15": "present",
      "hs-16": "present",
      "hs-17": "present",
      "hs-18": "present",
      "hs-19": "present",
      "hs-20": "present",
      "hs-21": "late",
      "hs-22": "present",
      "hs-23": "present",
      "hs-24": "late",
      "hs-25": "present",
      "hs-26": "present",
      "hs-27": "present",
      "hs-28": "present",
      "hs-29": "excused",
      "hs-30": "present",
      "hs-31": "present",
      "hs-32": "present",
      "hs-33": "present",
      "hs-34": "present",
      "hs-35": "present",
      "hs-36": "present",
      "hs-37": "present",
      "hs-38": "present",
      "hs-39": "present",
      "hs-40": "present",
      "hs-41": "present",
      "hs-42": "present",
      "hs-43": "present",
      "hs-44": "present",
      "hs-45": "present",
      "hs-46": "present",
      "hs-47": "present",
      "hs-48": "present",
      "hs-49": "present",
      "hs-50": "present",
      "hs-51": "present",
      "hs-1792030357853": "present"
    },
    "note": "Lớp học nghiêm túc, bạn Trà My có phép do cảm cúm, 2 bạn Khoa và Kỳ trễ 5 phút đầu giờ.",
    "checkedBy": "Cô Tạ Thị Tình (GVCN)"
  },
  "2026-10-09": {
    "date": "2026-10-09",
    "records": {
      "hs-1": "present",
      "hs-2": "present",
      "hs-3": "present",
      "hs-4": "present",
      "hs-5": "present",
      "hs-6": "present",
      "hs-7": "present",
      "hs-8": "present",
      "hs-9": "present",
      "hs-10": "present",
      "hs-11": "present",
      "hs-12": "present",
      "hs-13": "present",
      "hs-14": "present",
      "hs-15": "present",
      "hs-16": "present",
      "hs-17": "present",
      "hs-18": "present",
      "hs-19": "present",
      "hs-20": "present",
      "hs-21": "present",
      "hs-22": "present",
      "hs-23": "present",
      "hs-24": "late",
      "hs-25": "present",
      "hs-26": "present",
      "hs-27": "present",
      "hs-28": "present",
      "hs-29": "excused",
      "hs-30": "present",
      "hs-31": "present",
      "hs-32": "present",
      "hs-33": "present",
      "hs-34": "present",
      "hs-35": "present",
      "hs-36": "present",
      "hs-37": "present",
      "hs-38": "present",
      "hs-39": "present",
      "hs-40": "present",
      "hs-41": "present",
      "hs-42": "present",
      "hs-43": "present",
      "hs-44": "present",
      "hs-45": "present",
      "hs-46": "present",
      "hs-47": "present",
      "hs-48": "present",
      "hs-49": "present",
      "hs-50": "present",
      "hs-51": "present",
      "hs-1792030357853": "present"
    },
    "note": "Tiết học diễn ra thuận lợi, 100% chuyên cần."
  },
  "2026-10-23": {
    "date": "2026-10-23",
    "records": {
      "hs-1": "present",
      "hs-2": "present",
      "hs-3": "present",
      "hs-4": "present",
      "hs-5": "present",
      "hs-6": "present",
      "hs-7": "present",
      "hs-8": "present",
      "hs-9": "present",
      "hs-10": "present",
      "hs-11": "present",
      "hs-12": "present",
      "hs-13": "present",
      "hs-14": "present",
      "hs-15": "present",
      "hs-16": "present",
      "hs-17": "present",
      "hs-18": "present",
      "hs-19": "present",
      "hs-20": "present",
      "hs-21": "late",
      "hs-22": "present",
      "hs-23": "present",
      "hs-24": "late",
      "hs-25": "present",
      "hs-26": "present",
      "hs-27": "present",
      "hs-28": "present",
      "hs-29": "excused",
      "hs-30": "present",
      "hs-31": "present",
      "hs-32": "present",
      "hs-33": "present",
      "hs-34": "present",
      "hs-35": "present",
      "hs-36": "present",
      "hs-37": "present",
      "hs-38": "present",
      "hs-39": "present",
      "hs-40": "present",
      "hs-41": "present",
      "hs-42": "present",
      "hs-43": "present",
      "hs-44": "present",
      "hs-45": "present",
      "hs-46": "present",
      "hs-47": "present",
      "hs-48": "present",
      "hs-49": "present",
      "hs-50": "present",
      "hs-51": "present",
      "hs-1792030357853": "present"
    },
    "note": "Lớp học nghiêm túc, bạn Trà My có phép do cảm cúm, 2 bạn Khoa và Kỳ trễ 5 phút đầu giờ.",
    "checkedBy": "Cô Tạ Thị Tình (GVCN)"
  },
  "2026-10-22": {
    "date": "2026-10-22",
    "records": {
      "hs-1": "present",
      "hs-2": "present",
      "hs-3": "present",
      "hs-4": "present",
      "hs-5": "present",
      "hs-6": "present",
      "hs-7": "present",
      "hs-8": "present",
      "hs-9": "present",
      "hs-10": "present",
      "hs-11": "present",
      "hs-12": "present",
      "hs-13": "present",
      "hs-14": "present",
      "hs-15": "present",
      "hs-16": "present",
      "hs-17": "present",
      "hs-18": "present",
      "hs-19": "present",
      "hs-20": "present",
      "hs-21": "late",
      "hs-22": "present",
      "hs-23": "present",
      "hs-24": "late",
      "hs-25": "present",
      "hs-26": "present",
      "hs-27": "present",
      "hs-28": "present",
      "hs-29": "excused",
      "hs-30": "present",
      "hs-31": "present",
      "hs-32": "present",
      "hs-33": "present",
      "hs-34": "present",
      "hs-35": "present",
      "hs-36": "present",
      "hs-37": "present",
      "hs-38": "present",
      "hs-39": "present",
      "hs-40": "present",
      "hs-41": "present",
      "hs-42": "present",
      "hs-43": "present",
      "hs-44": "present",
      "hs-45": "present",
      "hs-46": "present",
      "hs-47": "present",
      "hs-48": "present",
      "hs-49": "present",
      "hs-50": "present",
      "hs-51": "present",
      "hs-1792030357853": "present"
    },
    "note": "Lớp học nghiêm túc, bạn Trà My có phép do cảm cúm, 2 bạn Khoa và Kỳ trễ 5 phút đầu giờ.",
    "checkedBy": "Cô Tạ Thị Tình (GVCN)"
  },
  "2026-10-21": {
    "date": "2026-10-21",
    "records": {
      "hs-1": "present",
      "hs-2": "present",
      "hs-3": "present",
      "hs-4": "present",
      "hs-5": "present",
      "hs-6": "present",
      "hs-7": "present",
      "hs-8": "present",
      "hs-9": "present",
      "hs-10": "present",
      "hs-11": "present",
      "hs-12": "present",
      "hs-13": "present",
      "hs-14": "present",
      "hs-15": "present",
      "hs-16": "present",
      "hs-17": "present",
      "hs-18": "present",
      "hs-19": "present",
      "hs-20": "present",
      "hs-21": "late",
      "hs-22": "present",
      "hs-23": "present",
      "hs-24": "late",
      "hs-25": "present",
      "hs-26": "present",
      "hs-27": "present",
      "hs-28": "present",
      "hs-29": "excused",
      "hs-30": "present",
      "hs-31": "present",
      "hs-32": "present",
      "hs-33": "present",
      "hs-34": "present",
      "hs-35": "present",
      "hs-36": "present",
      "hs-37": "present",
      "hs-38": "present",
      "hs-39": "present",
      "hs-40": "present",
      "hs-41": "present",
      "hs-42": "present",
      "hs-43": "present",
      "hs-44": "present",
      "hs-45": "present",
      "hs-46": "present",
      "hs-47": "present",
      "hs-48": "present",
      "hs-49": "present",
      "hs-50": "present",
      "hs-51": "present",
      "hs-1792030357853": "present"
    },
    "note": "Lớp học nghiêm túc, bạn Trà My có phép do cảm cúm, 2 bạn Khoa và Kỳ trễ 5 phút đầu giờ.",
    "checkedBy": "Cô Tạ Thị Tình (GVCN)"
  },
  "2026-10-20": {
    "date": "2026-10-20",
    "records": {
      "hs-1": "present",
      "hs-2": "present",
      "hs-3": "present",
      "hs-4": "present",
      "hs-5": "present",
      "hs-6": "present",
      "hs-7": "present",
      "hs-8": "present",
      "hs-9": "present",
      "hs-10": "present",
      "hs-11": "present",
      "hs-12": "present",
      "hs-13": "present",
      "hs-14": "present",
      "hs-15": "present",
      "hs-16": "present",
      "hs-17": "present",
      "hs-18": "present",
      "hs-19": "present",
      "hs-20": "present",
      "hs-21": "late",
      "hs-22": "present",
      "hs-23": "present",
      "hs-24": "late",
      "hs-25": "present",
      "hs-26": "present",
      "hs-27": "present",
      "hs-28": "present",
      "hs-29": "excused",
      "hs-30": "present",
      "hs-31": "present",
      "hs-32": "present",
      "hs-33": "present",
      "hs-34": "present",
      "hs-35": "present",
      "hs-36": "present",
      "hs-37": "present",
      "hs-38": "present",
      "hs-39": "present",
      "hs-40": "present",
      "hs-41": "present",
      "hs-42": "present",
      "hs-43": "present",
      "hs-44": "present",
      "hs-45": "present",
      "hs-46": "present",
      "hs-47": "present",
      "hs-48": "present",
      "hs-49": "present",
      "hs-50": "present",
      "hs-51": "present",
      "hs-1792030357853": "present"
    },
    "note": "Lớp học nghiêm túc, bạn Trà My có phép do cảm cúm, 2 bạn Khoa và Kỳ trễ 5 phút đầu giờ.",
    "checkedBy": "Cô Tạ Thị Tình (GVCN)"
  },
  "2026-10-19": {
    "date": "2026-10-19",
    "records": {
      "hs-1": "present",
      "hs-2": "present",
      "hs-3": "present",
      "hs-4": "present",
      "hs-5": "present",
      "hs-6": "present",
      "hs-7": "present",
      "hs-8": "present",
      "hs-9": "present",
      "hs-10": "present",
      "hs-11": "present",
      "hs-12": "present",
      "hs-13": "present",
      "hs-14": "present",
      "hs-15": "present",
      "hs-16": "present",
      "hs-17": "present",
      "hs-18": "present",
      "hs-19": "present",
      "hs-20": "present",
      "hs-21": "late",
      "hs-22": "present",
      "hs-23": "present",
      "hs-24": "late",
      "hs-25": "present",
      "hs-26": "present",
      "hs-27": "present",
      "hs-28": "present",
      "hs-29": "excused",
      "hs-30": "present",
      "hs-31": "present",
      "hs-32": "present",
      "hs-33": "present",
      "hs-34": "present",
      "hs-35": "present",
      "hs-36": "present",
      "hs-37": "present",
      "hs-38": "present",
      "hs-39": "present",
      "hs-40": "present",
      "hs-41": "present",
      "hs-42": "present",
      "hs-43": "present",
      "hs-44": "present",
      "hs-45": "present",
      "hs-46": "present",
      "hs-47": "present",
      "hs-48": "present",
      "hs-49": "present",
      "hs-50": "present",
      "hs-51": "present",
      "hs-1792030357853": "present"
    },
    "note": "Lớp học nghiêm túc, bạn Trà My có phép do cảm cúm, 2 bạn Khoa và Kỳ trễ 5 phút đầu giờ.",
    "checkedBy": "Cô Tạ Thị Tình (GVCN)"
  },
  "2026-10-16": {
    "date": "2026-10-16",
    "records": {
      "hs-1": "present",
      "hs-2": "present",
      "hs-3": "present",
      "hs-4": "present",
      "hs-5": "present",
      "hs-6": "present",
      "hs-7": "present",
      "hs-8": "present",
      "hs-9": "present",
      "hs-10": "present",
      "hs-11": "present",
      "hs-12": "present",
      "hs-13": "present",
      "hs-14": "present",
      "hs-15": "present",
      "hs-16": "present",
      "hs-17": "present",
      "hs-18": "present",
      "hs-19": "present",
      "hs-20": "present",
      "hs-21": "late",
      "hs-22": "present",
      "hs-23": "present",
      "hs-24": "late",
      "hs-25": "present",
      "hs-26": "present",
      "hs-27": "present",
      "hs-28": "present",
      "hs-29": "excused",
      "hs-30": "present",
      "hs-31": "present",
      "hs-32": "present",
      "hs-33": "present",
      "hs-34": "present",
      "hs-35": "present",
      "hs-36": "present",
      "hs-37": "present",
      "hs-38": "present",
      "hs-39": "present",
      "hs-40": "present",
      "hs-41": "present",
      "hs-42": "present",
      "hs-43": "present",
      "hs-44": "present",
      "hs-45": "present",
      "hs-46": "present",
      "hs-47": "present",
      "hs-48": "present",
      "hs-49": "present",
      "hs-50": "present",
      "hs-51": "present",
      "hs-1792030357853": "present"
    },
    "note": "Lớp học nghiêm túc, bạn Trà My có phép do cảm cúm, 2 bạn Khoa và Kỳ trễ 5 phút đầu giờ.",
    "checkedBy": "Cô Tạ Thị Tình (GVCN)"
  }
};

export const INITIAL_SUPPLEMENTARY_ATTENDANCE: SupplementaryAttendanceEntry[] = [
  {
    "id": "supp-1",
    "studentId": "hs-29",
    "studentName": "Phạm Thị Trà My",
    "studentCode": "2612A7029",
    "group": 3,
    "date": "2026-10-19",
    "session": "all_day",
    "previousStatus": "unexcused",
    "newStatus": "excused",
    "reason": "Đơn xin phép của phụ huynh (bị sốt siêu vi)",
    "note": "Phụ huynh đã gọi điện cho GVCN Thầy Hòa lúc 7h15 và nộp đơn xin phép qua Zalo",
    "recordedBy": "Thầy Trương Xuân Hòa (GVCN)",
    "createdAt": "2026-10-19 14:30"
  },
  {
    "id": "supp-2",
    "studentId": "hs-21",
    "studentName": "Trần Anh Khoa",
    "studentCode": "2612A7021",
    "group": 2,
    "date": "2026-10-19",
    "session": "morning",
    "previousStatus": "unexcused",
    "newStatus": "late",
    "reason": "Hỏng xe đạp điện trên đường đến trường, vào lớp lúc 7h15",
    "note": "Đã báo với sao đỏ tại cổng trường và được GVCN kiểm tra xác nhận",
    "recordedBy": "Thầy Trương Xuân Hòa (GVCN)",
    "createdAt": "2026-10-19 08:00"
  },
  {
    "id": "supp-3",
    "studentId": "hs-05",
    "studentName": "Nguyễn Tấn Đạt",
    "studentCode": "2612A7005",
    "group": 1,
    "date": "2026-10-16",
    "session": "morning",
    "previousStatus": "unexcused",
    "newStatus": "excused",
    "reason": "Tham gia bồi dưỡng Đội tuyển HSG Hóa học cấp trường",
    "note": "Có danh sách triệu tập từ Ban Giám Hiệu và Thầy Trương Xuân Hòa phụ trách",
    "recordedBy": "Thầy Trương Xuân Hòa (GVCN)",
    "createdAt": "2026-10-16 11:20"
  }
];

export const INITIAL_DISCIPLINE_ENTRIES: StudentDisciplineEntry[] = [
  {
    "id": "disc-1",
    "studentId": "hs-21",
    "studentName": "Trần Anh Khoa",
    "group": 2,
    "weekNumber": 6,
    "date": "2026-10-26",
    "ruleNumber": 1,
    "violationText": "Đi trễ, vào lớp trễ sau giáo viên, đoàn viên không đeo huy hiệu đoàn khi được kiểm tra.",
    "level": "Mức độ III",
    "pointsDeducted": 5,
    "note": "Trễ 7 phút tiết 1 buổi sáng Thứ Hai (Liên kết từ Điểm danh)",
    "recordedBy": "Đặng Đình Phúc (Lớp phó Kỉ luật)",
    "createdAt": "2026-10-26 07:10"
  },
  {
    "id": "disc-2",
    "studentId": "hs-24",
    "studentName": "Nguyễn Cao Kỳ",
    "group": 2,
    "weekNumber": 6,
    "date": "2026-10-26",
    "ruleNumber": 1,
    "violationText": "Đi trễ, vào lớp trễ sau giáo viên, đoàn viên không đeo huy hiệu đoàn khi được kiểm tra.",
    "level": "Mức độ III",
    "pointsDeducted": 5,
    "note": "Trễ 5 phút tiết 1 Thứ Hai (Liên kết từ Điểm danh)",
    "recordedBy": "Đặng Đình Phúc (Lớp phó Kỉ luật)",
    "createdAt": "2026-10-26 07:08"
  },
  {
    "id": "disc-3",
    "studentId": "hs-7",
    "studentName": "Lê Gia Bảo",
    "group": 1,
    "weekNumber": 6,
    "date": "2026-10-27",
    "ruleNumber": 4,
    "violationText": "Không mang sổ liên lạc khi bị xử lý vi phạm. Sổ liên lạc thiếu thông tin (Họ tên và chữ ký HS, CMHS, người đỡ đầu, GVCN,...)",
    "level": "Mức độ III",
    "pointsDeducted": 15,
    "note": "Quên sổ liên lạc ở nhà",
    "recordedBy": "Thầy Trương Xuân Hòa (GVCN)",
    "createdAt": "2026-10-27 08:30"
  },
  {
    "id": "disc-4",
    "studentId": "hs-29",
    "studentName": "Phạm Thị Trà My",
    "group": 3,
    "weekNumber": 6,
    "date": "2026-10-26",
    "ruleNumber": 8,
    "violationText": "Vắng có phép / 1 buổi.",
    "level": "Mức độ III",
    "pointsDeducted": 5,
    "note": "Phụ huynh có xin phép nghỉ do sốt nhẹ (Liên kết từ Điểm danh)",
    "recordedBy": "Thầy Trương Xuân Hòa (GVCN)",
    "createdAt": "2026-10-26 07:00"
  }
];

export const INITIAL_BONUS_ENTRIES: BonusPointEntry[] = [
  {
    "id": "bon-1",
    "studentId": "hs-42",
    "studentName": "Nguyễn Ngọc Bích Trâm",
    "group": 4,
    "weekNumber": 6,
    "date": "2026-10-26",
    "reason": "Đạt Giải Nhì cuộc thi Thiết kế Báo tường Chào mừng ngày 20/11 cấp trường",
    "pointsAdded": 40,
    "recordedBy": "Thầy Trương Xuân Hòa (GVCN)",
    "createdAt": "2026-10-26 11:30"
  },
  {
    "id": "bon-2",
    "studentId": "hs-1",
    "studentName": "Vũ Trịnh Bảo An",
    "group": 1,
    "weekNumber": 6,
    "date": "2026-10-27",
    "reason": "Gương người tốt việc tốt: Nhặt được điện thoại tại sân bóng và nộp lại phòng Giám thị",
    "pointsAdded": 20,
    "recordedBy": "Thầy Trương Xuân Hòa (GVCN)",
    "createdAt": "2026-10-27 16:45"
  }
];

export const INITIAL_EMULATION_ADJUSTMENTS: EmulationScoreAdjustment[] = [];

