// Dữ liệu trò chơi ô chữ "Giải mã Hải Hà" - LTT XXVIII
// Trích xuất từ Kịch bản & Ý tưởng trò chơi giao lưu SVCG Hải Hà

const GAME_DATA = {
  title: "GIẢI MÃ HẢI HÀ",
  subtitle: "Lễ Truyền Thống XXVIII • 'Đừng sợ, vì Ta ở với ngươi' (Is 41,10)",
  roundTime: 15, // Thời gian đếm ngược mặc định: 15 giây
  
  // Từ khóa dọc chính
  verticalKeyword: {
    word: "NGỌN HẢI ĐĂNG",
    letters: ["N", "G", "O", "N", "H", "A", "I", "D", "A", "N", "G"],
    length: 11,
    wordCount: 3,
    question: "Theo ý nghĩa câu chủ đề LTT XXVIII, Lời Chúa 'Đừng sợ' là lời an ủi dịu dàng, một điểm tựa vững chắc và là … dẫn đường cho chúng ta.",
    hints: [
      {
        afterRow: 4,
        type: "text",
        title: "Gợi ý 1 (Sau hàng thứ 4)",
        content: "Từ khóa hàng dọc gồm 11 chữ cái, cấu tạo từ 3 từ."
      },
      {
        afterRow: 8,
        type: "image",
        title: "Gợi ý 2 (Sau hàng thứ 8)",
        content: "",
        imageUrl: "assets/images/lighthouse.svg"
      }
    ]
  },

  // 4 Đội thi theo 4 Quận
  teams: [
    { id: "cau-giay", name: "Cầu Giấy", color: "#3b82f6", score: 0, buzzerKey: "1" },
    { id: "hoang-mai", name: "Hoàng Mai", color: "#ef4444", score: 0, buzzerKey: "2" },
    { id: "thanh-xuan", name: "Thanh Xuân", color: "#10b981", score: 0, buzzerKey: "3" },
    { id: "dong-da", name: "Đống Đa", color: "#f59e0b", score: 0, buzzerKey: "4" }
  ],

  // 11 Hàng ngang
  rows: [
    {
      id: 1,
      keyLetter: "N",
      keyIndex: 3, // H-O-A-[N]-G-M-A-I (0-indexed)
      answer: "HOANGMAI",
      length: 8,
      question: "Năm 2005–2006, nhóm chia thành hai quận đầu tiên là Cầu Giấy và quận nào?",
      source: "Lịch sử hình thành nhóm",
      mcStory: "Quận Hoàng Mai hiện đang lưu giữ bản Thánh Giá đầu tiên của nhóm sau khi được tìm lại, là biểu tượng tình anh em quy tụ."
    },
    {
      id: 2,
      keyLetter: "G",
      keyIndex: 4, // G-I-A-N-[G]-V-O (0-indexed: index 4)
      answer: "GIANGVO",
      length: 7,
      question: "Cuộc thi Tiếng Hát Thánh Ca lần thứ I (thời anh Đỗ Công Sơn, 2010–2012) diễn ra tại địa điểm nào?",
      source: "Lịch sử hình thành nhóm",
      mcStory: "Cuộc thi Tiếng Hát Thánh Ca tại Giảng Võ ghi dấu thời anh Đỗ Công Sơn, cũng là cái nôi hình thành và phát triển của đoàn Gabriel."
    },
    {
      id: 3,
      keyLetter: "O",
      keyIndex: 2, // V-U-[O]-T-Q-U-A (0-indexed)
      answer: "VUOTQUA",
      length: 7,
      question: "Lễ Truyền Thống không chỉ là một cột mốc kỷ niệm mà còn là một cuộc “…” nỗi sợ (hai từ)?",
      source: "Ý nghĩa câu chủ đề LTT XXVIII",
      mcStory: "Lễ Truyền Thống không chỉ để nhìn lại quá khứ mà còn là động lực để cùng nhau vượt qua nỗi sợ hãi, khó khăn và tiếp tục ngọn lửa nhiệt huyết."
    },
    {
      id: 4,
      keyLetter: "N",
      keyIndex: 2, // T-A-[N]-S-I-N-H-V-I-E-N (0-indexed: index 2)
      answer: "TANSINHVIEN",
      length: 11,
      question: "Mỗi tháng 9, nhóm tổ chức Thánh lễ đón những bạn nào và khai giảng năm học mới?",
      source: "Tổng quát 1 năm Hải Hà",
      mcStory: "Chào đón Tân sinh viên luôn là hoạt động trọng tâm. Nhiều thế hệ anh chị gắn bó với nhóm khởi nguồn từ chiến dịch 'Tiếp sức mùa thi'."
    },
    {
      id: 5,
      keyLetter: "H",
      keyIndex: 0, // [H]-A-I-P-H-O-N-G (0-indexed: index 0)
      answer: "HAIPHONG",
      length: 8,
      question: "Tên 'Hải Hà' ghép từ miền Hà Tây và giáo phận nào?",
      source: "Lịch sử hình thành nhóm",
      mcStory: "Hải Phòng và Hà Tây là 2 miền hình thành nên mái nhà chung Hải Hà. Mãi đến nhiệm kỳ 2018–2020 mới có trưởng nhóm đầu tiên ngoài 2 miền này."
    },
    {
      id: 6,
      keyLetter: "A",
      keyIndex: 4, // A-N-P-H-[A]-O-M-E-G-A (0-indexed: index 4)
      answer: "ANPHAOMEGA",
      length: 10,
      question: "Trong logo nhóm, hai chữ cái Hy Lạp nào đặt trên nền cuốn Kinh Thánh, biểu tượng cho Hải Hà sinh ra và được dẫn lối bởi Lời Chúa?",
      source: "Lịch sử hình thành nhóm",
      mcStory: "Anpha và Ômêga: Lời Chúa khởi đầu và hoàn tất mọi hành trình của Hải Hà, cùng với lời nguyện 'Xin cho họ nên một' (Ga 17,21)."
    },
    {
      id: 7,
      keyLetter: "I",
      keyIndex: 2, // S-O-[I]-C-H-I-D-O (0-indexed: index 2)
      answer: "SOICHIDO",
      length: 8,
      question: "Sự hiện diện của Chúa trong nhóm không chỉ là điểm tựa tâm linh, mà còn là “…” thắt chặt tình anh em (ba từ)?",
      source: "Ý nghĩa câu chủ đề LTT XXVIII",
      mcStory: "Sợi chỉ đỏ: khi mỗi người cảm nhận được Chúa ở cùng, chúng ta dễ dàng mở lòng nâng đỡ nhau trong học tập, công việc và đời sống đức tin."
    },
    {
      id: 8,
      keyLetter: "D",
      keyIndex: 0, // [D]-O-N-G-T-E-N (0-indexed: index 0)
      answer: "DONGTEN",
      length: 7,
      question: "Từ ngày 17/6/2012, nhóm theo đường hướng và linh đạo của Dòng tu nào?",
      source: "Lịch sử hình thành nhóm",
      mcStory: "Linh đạo Dòng Tên giúp nhóm có hướng đi chiều sâu; từ tháng 9/2017 nhóm đón Cha đồng hành Tôma Aquino Nguyễn Khánh Duy SJ."
    },
    {
      id: 9,
      keyLetter: "A",
      keyIndex: 6, // L-U-O-N-G-H-[A]-I-H-A (0-indexed: index 6)
      answer: "LUONGHAIHA",
      length: 10,
      question: "Tên gọi Hải Hà còn mang ý nghĩa ngụ ý tình yêu thương bao dung và “…” của Thiên Chúa (ba từ)?",
      source: "Lịch sử hình thành nhóm",
      mcStory: "'Lượng hải hà' nhắc nhở mỗi thành viên về lòng thương xót, sự quảng đại và bao dung như biển rộng sông dài mà Thiên Chúa ban cho con người."
    },
    {
      id: 10,
      keyLetter: "N",
      keyIndex: 2, // D-A-[N]-T-H-A-N (0-indexed: index 2)
      answer: "DANTHAN",
      length: 7,
      question: "Lời mời gọi LTT XXVIII là: 'Đừng sợ …, đừng sợ yêu thương và chia sẻ, đừng sợ làm chứng cho Chúa' (hai từ)?",
      source: "Ý nghĩa câu chủ đề LTT XXVIII",
      mcStory: "Dấn thân phục vụ: Dù cuộc sống sinh viên và công việc có nhiều bận rộn, các bạn vẫn luôn sẵn sàng hy sinh thời gian để phục vụ cộng đoàn."
    },
    {
      id: 11,
      keyLetter: "G",
      keyIndex: 5, // T-H-A-N-H-[G]-I-A (0-indexed: index 5)
      answer: "THANHGIA",
      length: 8,
      question: "Biểu trưng thiêng liêng nào của nhóm có bản đầu tặng năm 2005, từng thất lạc rồi tìm lại được, bản gỗ hiện luân chuyển giữa các quận?",
      source: "Lịch sử hình thành nhóm",
      mcStory: "Thánh Giá Hải Hà: Suốt từ năm 2005 đến nay, Hải Hà luôn quy tụ và tìm thấy sức mạnh dưới bóng cây Thánh Giá tình yêu."
    }
  ]
};

// Xuất ra phạm vi global để dùng trực tiếp trong browser
if (typeof window !== "undefined") {
  window.GAME_DATA = GAME_DATA;
}
