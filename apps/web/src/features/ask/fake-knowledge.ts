/**
 * Kho tri thức GIẢ LẬP cho bản demo Module 4 (RAG): các đoạn văn bản đã "chia đoạn + sinh vector",
 * bộ câu hỏi–đáp mẫu có trích dẫn và bản tóm tắt của các tài liệu mẫu ở màn hình Tài liệu.
 * Khi làm Module 4 thật sẽ thay toàn bộ file này bằng API truy hồi (Qdrant) + LLM.
 */
import { type FakeDocument, SEED_DOCUMENTS } from "@/features/documents/fake-data";

export interface FakeChunk {
  id: string;
  documentId: string;
  page: number;
  text: string;
}

export interface FakeAnswer {
  /** Từ khóa (không dấu) để khớp câu hỏi. */
  keywords: string[];
  /** Markdown, `[n]` trỏ tới phần tử thứ n của `citations`. */
  answer: string;
  citations: { chunkId: string; score: number }[];
}

export const CHUNKS: FakeChunk[] = [
  { id: "c1", documentId: "d1", page: 4, text: "Thời gian làm việc chính thức từ 8 giờ 00 đến 17 giờ 30, từ thứ Hai đến thứ Sáu; nghỉ trưa từ 12 giờ 00 đến 13 giờ 30." },
  { id: "c2", documentId: "d1", page: 7, text: "Nhân viên được làm việc từ xa tối đa 02 ngày mỗi tuần sau khi được trưởng bộ phận đồng ý. Việc đăng ký phải thực hiện trên hệ thống nhân sự trước ít nhất 01 ngày làm việc." },
  { id: "c3", documentId: "d1", page: 12, text: "Nhân viên có đủ 12 tháng làm việc được hưởng 12 ngày phép năm hưởng nguyên lương. Cứ mỗi 05 năm làm việc, số ngày phép năm được tăng thêm 01 ngày." },
  { id: "c4", documentId: "d1", page: 13, text: "Đơn xin nghỉ phép từ 03 ngày trở lên phải gửi trước ít nhất 05 ngày làm việc. Ngày phép chưa sử dụng hết được chuyển sang quý I của năm kế tiếp." },
  { id: "c5", documentId: "d2", page: 3, text: "Trong tuần đầu tiên, nhân viên mới được cấp máy tính, tài khoản email, tài khoản hệ thống nội bộ và tham gia buổi đào tạo an toàn thông tin bắt buộc." },
  { id: "c6", documentId: "d2", page: 5, text: "Mỗi nhân viên mới được phân công một người hướng dẫn (buddy) trong 02 tháng thử việc. Kết thúc thử việc, trưởng bộ phận đánh giá theo mẫu HR-05." },
  { id: "c7", documentId: "d4", page: 1, text: "Cài đặt phần mềm FortiClient VPN, nhập địa chỉ máy chủ vpn.congty.vn, cổng 443. Đăng nhập bằng tài khoản email công ty và mã xác thực 2 lớp trên ứng dụng Authenticator." },
  { id: "c8", documentId: "d4", page: 1, text: "Lỗi thường gặp: báo sai mật khẩu → kiểm tra lại mã 2 lớp đã hết hạn chưa; kết nối dừng ở 40% → tắt tường lửa của phần mềm diệt virus rồi thử lại; vẫn lỗi thì liên hệ IT qua số nội bộ 1900." },
  { id: "c9", documentId: "d6", page: 2, text: "Thiết bị có giá trị dưới 20 triệu đồng do trưởng phòng phê duyệt. Từ 20 triệu đồng trở lên phải được Giám đốc phê duyệt." },
  { id: "c10", documentId: "d6", page: 3, text: "Gói mua sắm từ 50 triệu đồng trở lên phải có tối thiểu 03 báo giá từ các nhà cung cấp khác nhau. Thời gian xử lý đề nghị mua sắm là 05 ngày làm việc kể từ khi hồ sơ đầy đủ." },
  { id: "c11", documentId: "d7", page: 6, text: "Mật khẩu phải có tối thiểu 12 ký tự gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt; bắt buộc đổi sau mỗi 90 ngày và không dùng lại 5 mật khẩu gần nhất." },
  { id: "c12", documentId: "d7", page: 9, text: "Khi làm việc từ xa, nhân viên bắt buộc kết nối VPN của công ty trước khi truy cập hệ thống nội bộ; không sử dụng Wi-Fi công cộng không có mật khẩu." },
  { id: "c13", documentId: "d7", page: 14, text: "Sự cố an toàn thông tin (mất thiết bị, nghi ngờ lộ mật khẩu, email lừa đảo) phải được báo cáo trong vòng 24 giờ tới security@congty.vn hoặc số nội bộ 1900." },
  { id: "c14", documentId: "d8", page: 1, text: "Doanh thu tháng 10 đạt 92% kế hoạch, tăng 8% so với cùng kỳ. Chi phí vận hành giảm 5% nhờ tối ưu hạ tầng." },
  { id: "c15", documentId: "d8", page: 2, text: "Thống nhất triển khai thí điểm trợ lý AI nội bộ CAT GPT tại phòng Nhân sự từ tháng 11, đánh giá kết quả vào cuối tháng 12." },
];

export const ANSWERS: FakeAnswer[] = [
  {
    keywords: ["lam viec tu xa", "remote", "wfh", "work from home", "lam tai nha"],
    answer: `Theo quy định hiện hành, việc làm việc từ xa như sau:

- **Số ngày:** tối đa **02 ngày mỗi tuần**, cần được trưởng bộ phận đồng ý [1].
- **Đăng ký:** trên hệ thống nhân sự, trước ít nhất **01 ngày làm việc** [1].
- **Bảo mật:** bắt buộc kết nối **VPN** của công ty trước khi truy cập hệ thống nội bộ và không dùng Wi-Fi công cộng không có mật khẩu [2].

Hướng dẫn cài đặt VPN có trong tài liệu hướng dẫn sử dụng VPN [3].`,
    citations: [
      { chunkId: "c2", score: 0.91 },
      { chunkId: "c12", score: 0.84 },
      { chunkId: "c7", score: 0.71 },
    ],
  },
  {
    keywords: ["nghi phep", "phep nam", "ngay phep", "leave", "nghi bao nhieu"],
    answer: `Về chế độ nghỉ phép năm:

1. Nhân viên đủ 12 tháng làm việc có **12 ngày phép/năm** hưởng nguyên lương; cứ mỗi **05 năm** làm việc được cộng thêm **01 ngày** [1].
2. Nghỉ từ **03 ngày trở lên** phải gửi đơn trước ít nhất **05 ngày làm việc** [2].
3. Ngày phép chưa dùng hết được **chuyển sang quý I** năm sau [2].`,
    citations: [
      { chunkId: "c3", score: 0.93 },
      { chunkId: "c4", score: 0.86 },
    ],
  },
  {
    keywords: ["mua sam", "mua thiet bi", "mua laptop", "phe duyet", "bao gia", "mua may tinh"],
    answer: `Quy trình phê duyệt mua sắm thiết bị:

| Giá trị | Người phê duyệt | Yêu cầu thêm |
|---|---|---|
| Dưới 20 triệu đồng | Trưởng phòng [1] | — |
| Từ 20 triệu đồng | Giám đốc [1] | — |
| Từ 50 triệu đồng | Giám đốc [1] | Tối thiểu 03 báo giá [2] |

Thời gian xử lý là **05 ngày làm việc** kể từ khi hồ sơ đầy đủ [2].`,
    citations: [
      { chunkId: "c9", score: 0.92 },
      { chunkId: "c10", score: 0.88 },
    ],
  },
  {
    keywords: ["vpn", "ket noi", "forticlient", "khong vao duoc"],
    answer: `Các bước kết nối VPN:

1. Cài **FortiClient VPN**, nhập máy chủ \`vpn.congty.vn\`, cổng \`443\` [1].
2. Đăng nhập bằng tài khoản email công ty và **mã xác thực 2 lớp** trên ứng dụng Authenticator [1].

Nếu gặp lỗi [2]:
- *Báo sai mật khẩu* → kiểm tra mã 2 lớp đã hết hạn chưa.
- *Dừng ở 40%* → tắt tường lửa của phần mềm diệt virus rồi thử lại.
- Vẫn lỗi → liên hệ IT qua số nội bộ **1900**.`,
    citations: [
      { chunkId: "c7", score: 0.94 },
      { chunkId: "c8", score: 0.9 },
    ],
  },
  {
    keywords: ["nhan vien moi", "onboarding", "tuan dau", "thu viec", "buddy"],
    answer: `Với nhân viên mới:

- **Tuần đầu tiên:** nhận máy tính, tài khoản email, tài khoản hệ thống nội bộ và tham gia buổi **đào tạo an toàn thông tin bắt buộc** [1].
- **Thử việc 02 tháng:** có một người hướng dẫn (*buddy*) đi kèm; kết thúc thử việc, trưởng bộ phận đánh giá theo mẫu **HR-05** [2].`,
    citations: [
      { chunkId: "c5", score: 0.9 },
      { chunkId: "c6", score: 0.87 },
    ],
  },
  {
    keywords: ["mat khau", "su co", "bao mat", "lua dao", "mat thiet bi", "password"],
    answer: `Một số quy định an toàn thông tin quan trọng:

- **Mật khẩu:** tối thiểu **12 ký tự** (chữ hoa, chữ thường, số, ký tự đặc biệt), đổi sau mỗi **90 ngày**, không dùng lại 5 mật khẩu gần nhất [1].
- **Báo cáo sự cố** (mất thiết bị, nghi lộ mật khẩu, email lừa đảo): trong vòng **24 giờ** tới \`security@congty.vn\` hoặc số nội bộ 1900 [2].`,
    citations: [
      { chunkId: "c11", score: 0.89 },
      { chunkId: "c13", score: 0.86 },
    ],
  },
  {
    keywords: ["doanh thu", "giao ban", "thang 10", "cuoc hop", "ket qua kinh doanh"],
    answer: `Kết quả cuộc họp giao ban tháng 10:

- **Doanh thu** đạt **92%** kế hoạch, tăng **8%** so với cùng kỳ; chi phí vận hành giảm **5%** nhờ tối ưu hạ tầng [1].
- Thống nhất **thí điểm CAT GPT** tại phòng Nhân sự từ tháng 11, đánh giá vào cuối tháng 12 [2].`,
    citations: [
      { chunkId: "c14", score: 0.9 },
      { chunkId: "c15", score: 0.83 },
    ],
  },
];

export const NOT_FOUND_ANSWER = `Mình **không tìm thấy thông tin** liên quan tới câu hỏi này trong các tài liệu đã chọn, nên sẽ không đưa ra câu trả lời để tránh cung cấp thông tin sai.

Bạn có thể:
- Mở rộng **phạm vi tài liệu** tra cứu.
- Diễn đạt câu hỏi cụ thể hơn.
- Tải lên tài liệu có chứa thông tin cần tìm.`;

/** Chỉ tài liệu đã xử lý xong mới tra cứu được. */
export const SEARCHABLE_DOCUMENTS: FakeDocument[] = SEED_DOCUMENTS.filter((d) => d.status === "READY");

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

export interface ResolvedSource extends FakeChunk {
  number: number;
  score: number;
  document: FakeDocument;
}

/** "Truy hồi" giả lập: khớp từ khóa, chỉ chấp nhận khi mọi nguồn trích dẫn nằm trong phạm vi đã chọn. */
export function findAnswer(question: string, scope: string[]): { answer: string; sources: ResolvedSource[] } {
  const q = normalize(question);
  const match = ANSWERS.map((a) => ({ a, hits: a.keywords.filter((k) => q.includes(k)).length }))
    .filter((m) => m.hits > 0)
    .sort((x, y) => y.hits - x.hits)[0]?.a;

  const sources = (match?.citations ?? []).map((c, i) => {
    const chunk = CHUNKS.find((ch) => ch.id === c.chunkId)!;
    return { ...chunk, number: i + 1, score: c.score, document: SEED_DOCUMENTS.find((d) => d.id === chunk.documentId)! };
  });

  if (!match || sources.some((s) => !scope.includes(s.documentId))) {
    return { answer: NOT_FOUND_ANSWER, sources: [] };
  }
  return { answer: match.answer, sources };
}

export const SUMMARIES: Record<string, { short: string; detailed: string }> = {
  d1: {
    short: `**Quy chế làm việc 2026** quy định giờ làm việc (8:00–17:30), chế độ làm việc từ xa tối đa 2 ngày/tuần và chế độ nghỉ phép năm 12 ngày, tăng thêm 1 ngày cho mỗi 5 năm thâm niên.`,
    detailed: `## Tóm tắt: Quy chế làm việc 2026

### 1. Thời gian làm việc
- Từ **8:00 đến 17:30**, thứ Hai – thứ Sáu; nghỉ trưa 12:00–13:30.

### 2. Làm việc từ xa
- Tối đa **2 ngày/tuần**, cần trưởng bộ phận đồng ý.
- Đăng ký trên hệ thống nhân sự trước ít nhất 1 ngày làm việc.

### 3. Nghỉ phép năm
- **12 ngày/năm** hưởng nguyên lương; +1 ngày cho mỗi 5 năm làm việc.
- Nghỉ từ 3 ngày trở lên phải xin trước 5 ngày làm việc.
- Phép chưa dùng được chuyển sang quý I năm sau.

### Điểm cần lưu ý
> Mọi đăng ký (làm từ xa, nghỉ phép) đều thực hiện trên hệ thống nhân sự để được phê duyệt.`,
  },
  d2: {
    short: `**Sổ tay nhân viên mới** hướng dẫn các việc trong tuần đầu (nhận thiết bị, tài khoản, đào tạo an toàn thông tin) và quy trình thử việc 2 tháng có người hướng dẫn (buddy).`,
    detailed: `## Tóm tắt: Sổ tay nhân viên mới

### Tuần đầu tiên
- Nhận máy tính, email, tài khoản hệ thống nội bộ.
- Tham gia **đào tạo an toàn thông tin** (bắt buộc).

### Thời gian thử việc
- Kéo dài **2 tháng**, có **buddy** hướng dẫn.
- Cuối kỳ: trưởng bộ phận đánh giá theo mẫu **HR-05**.`,
  },
  d4: {
    short: `**Hướng dẫn sử dụng VPN** mô tả cách cài FortiClient, kết nối tới vpn.congty.vn với xác thực 2 lớp và cách xử lý các lỗi thường gặp.`,
    detailed: `## Tóm tắt: Hướng dẫn sử dụng VPN

### Cài đặt và kết nối
1. Cài **FortiClient VPN**.
2. Máy chủ \`vpn.congty.vn\`, cổng \`443\`.
3. Đăng nhập bằng email công ty + **mã xác thực 2 lớp**.

### Xử lý lỗi
| Hiện tượng | Cách xử lý |
|---|---|
| Báo sai mật khẩu | Kiểm tra mã 2 lớp còn hạn |
| Dừng ở 40% | Tắt tường lửa của phần mềm diệt virus |
| Vẫn lỗi | Gọi IT – số nội bộ 1900 |`,
  },
  d6: {
    short: `**Quy trình mua sắm thiết bị** phân cấp phê duyệt theo giá trị (dưới 20 triệu: trưởng phòng; từ 20 triệu: Giám đốc), yêu cầu 3 báo giá cho gói từ 50 triệu và xử lý trong 5 ngày làm việc.`,
    detailed: `## Tóm tắt: Quy trình mua sắm thiết bị

### Phân cấp phê duyệt
- **< 20 triệu đồng:** trưởng phòng.
- **≥ 20 triệu đồng:** Giám đốc.

### Yêu cầu hồ sơ
- Gói **≥ 50 triệu đồng** cần tối thiểu **3 báo giá** từ các nhà cung cấp khác nhau.

### Thời gian
- **5 ngày làm việc** kể từ khi hồ sơ đầy đủ.`,
  },
  d7: {
    short: `**Chính sách bảo mật thông tin** quy định về mật khẩu (tối thiểu 12 ký tự, đổi sau 90 ngày), bắt buộc dùng VPN khi làm từ xa và báo cáo sự cố trong vòng 24 giờ.`,
    detailed: `## Tóm tắt: Chính sách bảo mật thông tin

### Mật khẩu
- Tối thiểu **12 ký tự**, đủ chữ hoa/thường, số, ký tự đặc biệt.
- Đổi sau mỗi **90 ngày**; không dùng lại 5 mật khẩu gần nhất.

### Làm việc từ xa
- **Bắt buộc VPN** trước khi truy cập hệ thống nội bộ.
- Không dùng Wi-Fi công cộng không có mật khẩu.

### Báo cáo sự cố
- Trong vòng **24 giờ** tới \`security@congty.vn\` hoặc số nội bộ 1900.`,
  },
  d8: {
    short: `**Biên bản họp giao ban tháng 10**: doanh thu đạt 92% kế hoạch (tăng 8% cùng kỳ), chi phí vận hành giảm 5%, thống nhất thí điểm CAT GPT tại phòng Nhân sự từ tháng 11.`,
    detailed: `## Tóm tắt: Họp giao ban tháng 10

### Kết quả kinh doanh
- Doanh thu: **92%** kế hoạch, **+8%** so với cùng kỳ.
- Chi phí vận hành: **−5%** nhờ tối ưu hạ tầng.

### Quyết định
- Thí điểm **CAT GPT** tại phòng Nhân sự từ **tháng 11**.
- Đánh giá kết quả vào **cuối tháng 12**.`,
  },
};

/** Tài liệu mới tải lên trong phiên demo chưa có tóm tắt soạn sẵn → dùng mẫu chung. */
export function summaryOf(document: FakeDocument): { short: string; detailed: string } {
  return (
    SUMMARIES[document.id] ?? {
      short: `**${document.name}** gồm ${document.pages ?? "nhiều"} trang. Tài liệu trình bày các nội dung chính về quy định, quy trình và hướng dẫn liên quan tới hoạt động nội bộ của công ty.`,
      detailed: `## Tóm tắt: ${document.name}\n\n### Nội dung chính\n- Bối cảnh và mục tiêu của tài liệu.\n- Các quy định, quy trình được áp dụng.\n- Trách nhiệm của các bộ phận liên quan.\n\n### Điểm cần lưu ý\n> Đây là bản tóm tắt minh họa. Khi tích hợp mô hình ngôn ngữ thật, nội dung sẽ được sinh từ ${document.chunks ?? "các"} đoạn văn bản của tài liệu.`,
    }
  );
}
