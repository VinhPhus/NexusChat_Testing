/**
 * White-Box Testing: translateService.js
 * Phụ trách: TV4 (User & Services)
 * Kỹ thuật áp dụng: Multi-Tier Fallback Path Testing & Cyclomatic Complexity (V(G)=6)
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

describe("White-Box: translateService -> translateText (6 Basis Paths)", () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = "test_gemini_key";
  });

  afterAll(() => {
    global.fetch = originalFetch;
    process.env.GEMINI_API_KEY = originalApiKey;
  });

  // PATH 1: Văn bản rỗng hoặc chỉ có khoảng trắng
  it("TC-TR-01 (Path 1): Văn bản rỗng hoặc khoảng trắng -> Trả về nguyên bản", async () => {
    const resEmpty = await translateText("");
    const resWhitespace = await translateText("   ");
    const resNull = await translateText(null);

    expect(resEmpty).toBe("");
    expect(resWhitespace).toBe("   ");
    expect(resNull).toBe(null);
  });

  // PATH 2: Tầng 1 (Google GTX) thành công ngay lập tức
  it("TC-TR-02 (Path 2): Tầng 1 (Google GTX) thành công -> Trả về kết quả dịch", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [[["Xin chào", "Hello"]]],
    });

    const res = await translateText("Hello", "vi");
    expect(res).toBe("Xin chào");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  // PATH 3: Tầng 1 lỗi -> Tự động fallback sang Tầng 2 (Google Dict) thành công
  it("TC-TR-03 (Path 3): Tầng 1 lỗi -> Tự động fallback sang Tầng 2 (Google Dict) thành công", async () => {
    global.fetch = jest
      .fn()
      // Tầng 1: GTX HTTP 500
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      // Tầng 2: Dict thành công
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ["Xin chào từ Dict"],
      });

    const res = await translateText("Hello", "vi");
    expect(res).toBe("Xin chào từ Dict");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  // PATH 4: Tầng 1 & 2 đều lỗi -> Tự động fallback sang Tầng 3 (MyMemory) thành công
  it("TC-TR-04 (Path 4): Tầng 1 & 2 đều lỗi -> Tự động fallback sang Tầng 3 (MyMemory) thành công", async () => {
    global.fetch = jest
      .fn()
      // Tầng 1 lỗi mạng
      .mockRejectedValueOnce(new Error("Network timeout"))
      // Tầng 2 trả về định dạng sai
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: true }),
      })
      // Tầng 3 (MyMemory) thành công
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          responseStatus: 200,
          responseData: { translatedText: "Xin chào từ MyMemory" },
        }),
      });

    const res = await translateText("Hello", "vi");
    expect(res).toBe("Xin chào từ MyMemory");
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  // PATH 5: Tầng 1, 2, 3 đều lỗi -> Tự động fallback sang Tầng 4 (Gemini AI) thành công
  it("TC-TR-05 (Path 5): Tầng 1, 2, 3 đều lỗi -> Tự động fallback sang Tầng 4 (Gemini AI) thành công", async () => {
    global.fetch = jest
      .fn()
      // Tầng 1 lỗi
      .mockRejectedValueOnce(new Error("GTX Failure"))
      // Tầng 2 lỗi
      .mockRejectedValueOnce(new Error("Dict Failure"))
      // Tầng 3 lỗi MyMemory API Status 403
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          responseStatus: 403,
          responseDetails: "Quota exceeded",
        }),
      });

    // Tầng 4: Gemini AI trả về kết quả
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "Xin chào từ Gemini AI",
      },
    });

    const res = await translateText("Hello", "vi");
    expect(res).toBe("Xin chào từ Gemini AI");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  // PATH 6: Cả 4 tầng dịch đều bị lỗi -> Bắt lỗi và throw Error
  it("TC-TR-06 (Path 6): Cả 4 tầng dịch đều bị lỗi -> Bắt lỗi và throw Error tổng", async () => {
    global.fetch = jest
      .fn()
      // Tầng 1 lỗi
      .mockRejectedValueOnce(new Error("GTX failed"))
      // Tầng 2 lỗi
      .mockRejectedValueOnce(new Error("Dict failed"))
      // Tầng 3 lỗi HTTP
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
      });

    // Tầng 4: Gemini lỗi
    mockGenerateContent.mockRejectedValueOnce(new Error("Gemini quota error"));

    await expect(translateText("Hello", "vi")).rejects.toThrow(
      "Không thể dịch tin nhắn vào lúc này. Vui lòng thử lại sau."
    );
  });
});

describe("White-Box: translateService -> Internal Edge Cases Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Kiểm tra trường hợp định dạng Google Dict là mảng lồng nhau data[0][0]
  it("TC-TR-07: Google Dict trả về cấu trúc mảng lồng [[text]]", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error("GTX Fail"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [["Bản dịch lồng nhau"]],
      });

    const res = await translateText("Nested text", "vi");
    expect(res).toBe("Bản dịch lồng nhau");
  });

  // Kiểm tra trường hợp Google GTX trả về mảng nhưng rỗng hoặc chuỗi trắng (Line 35)
  it("TC-TR-08: Google GTX trả về dữ liệu rỗng -> Kích hoạt throw lỗi định dạng GTX", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[["   "]]], // chuỗi trắng bị trim
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ["Fallback qua Dict"],
      });

    const res = await translateText("Test empty GTX", "vi");
    expect(res).toBe("Fallback qua Dict");
  });

  // Kiểm tra trường hợp Google Dict trả về response !ok (Line 55)
  it("TC-TR-09: Google Dict trả về HTTP 400 (not ok) -> Fallback sang MyMemory", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error("GTX Fail"))
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          responseStatus: 200,
          responseData: { translatedText: "Dịch từ MyMemory" },
        }),
      });

    const res = await translateText("Test Dict not ok", "vi");
    expect(res).toBe("Dịch từ MyMemory");
  });

  // Kiểm tra trường hợp MyMemory không trả về responseData.translatedText (Line 96)
  it("TC-TR-10: MyMemory trả về 200 nhưng thiếu trường translatedText -> Fallback sang Gemini", async () => {
    process.env.GEMINI_API_KEY = "test_key";
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error("GTX Fail"))
      .mockRejectedValueOnce(new Error("Dict Fail"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          responseStatus: 200,
          responseData: {}, // Thiếu translatedText
        }),
      });

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "Dịch từ Gemini fallback",
      },
    });

    const res = await translateText("Test MyMemory empty text", "en");
    expect(res).toBe("Dịch từ Gemini fallback");
  });

  // Kiểm tra trường hợp Gemini AI khi không cấu hình GEMINI_API_KEY
  it("TC-TR-11: Gemini AI khi không cấu hình GEMINI_API_KEY", async () => {
    delete process.env.GEMINI_API_KEY;

    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error("GTX Fail"))
      .mockRejectedValueOnce(new Error("Dict Fail"))
      .mockRejectedValueOnce(new Error("MyMemory Fail"));

    await expect(translateText("Hello", "vi")).rejects.toThrow(
      "Không thể dịch tin nhắn vào lúc này. Vui lòng thử lại sau."
    );
  });

  // Kiểm tra trường hợp Gemini AI phản hồi nhưng chuỗi dịch bị rỗng
  it("TC-TR-12: Gemini AI phản hồi nhưng chuỗi dịch bị rỗng", async () => {
    process.env.GEMINI_API_KEY = "dummy_key";

    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error("GTX Fail"))
      .mockRejectedValueOnce(new Error("Dict Fail"))
      .mockRejectedValueOnce(new Error("MyMemory Fail"));

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "",
      },
    });

    await expect(translateText("Hello", "vi")).rejects.toThrow(
      "Không thể dịch tin nhắn vào lúc này. Vui lòng thử lại sau."
    );
  });
});
