/** Câu trả lời mẫu cho MockLlmProvider. `{question}` được thay bằng câu hỏi của người dùng. */
export const MOCK_ANSWERS: readonly string[] = [
  `Cảm ơn bạn đã hỏi về **"{question}"**. Dưới đây là một số ý chính:

1. **Xác định mục tiêu**: làm rõ kết quả mong muốn trước khi bắt đầu.
2. **Thu thập thông tin**: tra cứu tài liệu nội bộ và các nguồn liên quan.
3. **Đánh giá phương án**: so sánh ưu, nhược điểm của từng lựa chọn.
4. **Triển khai và theo dõi**: thực hiện theo từng bước, đo lường kết quả.

> Đây là câu trả lời mẫu từ chế độ giả lập. Khi tích hợp mô hình ngôn ngữ thật, nội dung sẽ được sinh dựa trên câu hỏi của bạn.`,

  `Về câu hỏi **"{question}"**, mình tóm tắt thành bảng so sánh như sau:

| Tiêu chí | Phương án A | Phương án B |
|---|---|---|
| Chi phí | Thấp | Trung bình |
| Thời gian triển khai | 1–2 tuần | 3–4 tuần |
| Khả năng mở rộng | Hạn chế | Tốt |
| Độ phức tạp | Đơn giản | Cao hơn |

**Gợi ý:** nếu cần kết quả nhanh, hãy chọn *Phương án A*; nếu ưu tiên lâu dài, *Phương án B* phù hợp hơn.`,

  `Đây là ví dụ minh họa bằng TypeScript cho yêu cầu **"{question}"**:

\`\`\`typescript
interface Task {
  id: number;
  title: string;
  done: boolean;
}

function summarize(tasks: Task[]): string {
  const done = tasks.filter((t) => t.done).length;
  return \`Đã hoàn thành \${done}/\${tasks.length} công việc\`;
}

console.log(summarize([{ id: 1, title: "Viết báo cáo", done: true }]));
\`\`\`

Giải thích nhanh:
- \`Task\` mô tả cấu trúc một công việc.
- \`summarize\` đếm số việc đã xong và trả về chuỗi tóm tắt.`,

  `## Tổng quan

Câu hỏi **"{question}"** có thể được tiếp cận theo ba góc nhìn:

### 1. Góc nhìn kỹ thuật
Tập trung vào giải pháp, công cụ và quy trình thực hiện. Cần chú ý tới tính *ổn định* và *bảo mật*.

### 2. Góc nhìn nghiệp vụ
Đảm bảo giải pháp đáp ứng đúng nhu cầu của người dùng cuối và mục tiêu của tổ chức.

### 3. Góc nhìn vận hành
- Chi phí duy trì hằng tháng
- Nhân sự phụ trách
- Kế hoạch sao lưu và khôi phục

Bạn muốn mình đi sâu vào góc nhìn nào?`,

  `Chào bạn! Mình là **CAT GPT** – trợ lý AI nội bộ (đang chạy ở chế độ giả lập).

Với câu hỏi **"{question}"**, mình có thể hỗ trợ bạn:
- ✍️ Soạn thảo email, báo cáo, biên bản cuộc họp
- 📊 Tóm tắt và phân tích thông tin
- 💡 Gợi ý ý tưởng và giải pháp
- 🧑‍💻 Giải thích và viết mã nguồn

Hãy mô tả chi tiết hơn để mình hỗ trợ tốt nhất nhé!`,
];
