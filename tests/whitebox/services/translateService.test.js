/**
 * STARTER TEMPLATE — White-Box Testing: translateService.js
 * Phụ trách: TV4 (NhatDuy / PhuongBao)
 * Kỹ thuật áp dụng: Multi-Tier Fallback Path Testing & Cyclomatic Complexity (V(G)=6)
 *
 * HƯỚNG DẪN DÀNH CHO THÀNH VIÊN:
 * 1. Đọc kỹ file mã nguồn: backend/src/services/translateService.js
 * 2. Hàm trọng tâm: `translateText(text, targetLang)` có 4 tầng dịch dự phòng:
 *    - Branch 1: text rỗng hoặc chỉ có khoảng trắng -> trả về nguyên bản
 *    - Branch 2: Tầng 1 (Google GTX) thành công -> trả về kết quả ngay
 *    - Branch 3: Tầng 1 lỗi -> Chuyển sang Tầng 2 (Google Dict) thành công -> trả về kết quả
 *    - Branch 4: Tầng 1 & 2 lỗi -> Chuyển sang Tầng 3 (MyMemory) thành công -> trả về kết quả
 *    - Branch 5: Tầng 1, 2, 3 lỗi -> Chuyển sang Tầng 4 (Gemini AI) thành công -> trả về kết quả
 *    - Branch 6: Toàn bộ 4 tầng đều lỗi -> Ném Error "Không thể dịch tin nhắn vào lúc này..."
 * 3. Hoàn thiện các bài test để bao phủ toàn bộ 6 đường dẫn độc lập trên.
 */

// @ts-nocheck
import { jest } from "@jest/globals";

// Mock thư viện Google Gemini AI
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent,
}));

jest.unstable_mockModule("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

// Import service sau khi mock
const { translateText } = await import(
  "../../../backend/src/services/translateService.js"
);

describe("White-Box: translateService -> translateText", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  // TEST MẪU 1: Chuỗi văn bản rỗng (Branch 1)
  it("TC-TR-01: Văn bản rỗng hoặc khoảng trắng -> Trả về nguyên văn bản mà không gọi API", async () => {
    const result1 = await translateText("");
    const result2 = await translateText("   ");

    expect(result1).toBe("");
    expect(result2).toBe("   ");
  });

  // TEST MẪU 2: Tầng 1 (Google GTX) thành công ngay lập tức (Branch 2)
  it("TC-TR-02: Tầng 1 (Google GTX) thành công -> Trả về kết quả dịch", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [[["Xin chào", "Hello"]]],
    });

    const res = await translateText("Hello", "vi");
    expect(res).toBe("Xin chào");
  });

  // TODO cho thành viên: Viết tiếp các đường dẫn dự phòng (Fallback paths)
  it.todo("TC-TR-03: Tầng 1 lỗi HTTP 500 -> Tự động fallback sang Tầng 2 (Google Dict) thành công");
  it.todo("TC-TR-04: Tầng 1 & 2 đều lỗi -> Tự động fallback sang Tầng 3 (MyMemory) thành công");
  it.todo("TC-TR-05: Tầng 1, 2, 3 đều lỗi -> Tự động fallback sang Tầng 4 (Gemini AI) thành công");
  it.todo("TC-TR-06: Cả 4 tầng dịch đều bị lỗi -> Bắt lỗi và throw Error thông báo người dùng thử lại sau");
});

