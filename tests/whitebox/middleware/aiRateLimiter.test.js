/**
 * White-Box Testing: aiRateLimiter.js
 * Phụ trách: TV4 (User & Services)
 * Kỹ thuật áp dụng: Path Coverage, Branch Coverage, Data Flow Testing
 */

// @ts-nocheck
import { jest } from "@jest/globals";

// Import trực tiếp module cần kiểm thử
const { checkAIRateLimit, aiRateLimiterMiddleware } = await import(
  "../../../backend/src/middlewares/aiRateLimiter.js"
);

describe("White-Box: aiRateLimiter -> checkAIRateLimit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // TC-RL-01: User mới (Branch 1) -> Khởi tạo mảng rỗng và trả về true
  it("TC-RL-01: User mới gọi lần đầu tiên -> Trả về true", () => {
    const userId = "test_user_new_" + Date.now();
    const result = checkAIRateLimit(userId);
    expect(result).toBe(true);
  });

  // TC-RL-02: Gửi liên tiếp 5 requests trong 1 phút (Branch 4) -> Đều trả về true
  it("TC-RL-02: Gửi liên tiếp 5 requests trong 1 phút -> Đều trả về true", () => {
    const userId = "test_user_burst_" + Date.now();
    for (let i = 0; i < 5; i++) {
      expect(checkAIRateLimit(userId)).toBe(true);
    }
  });

  // TC-RL-03: Request thứ 6 vượt giới hạn (Branch 3) -> Trả về false
  it("TC-RL-03: Request thứ 6 trong vòng 1 phút -> Trả về false (Rate Limited)", () => {
    const userId = "test_user_limit_" + Date.now();
    for (let i = 0; i < 5; i++) {
      checkAIRateLimit(userId);
    }
    const sixthRequest = checkAIRateLimit(userId);
    expect(sixthRequest).toBe(false);
  });

  // TC-RL-04: Sau 60 giây (Sliding Window), các timestamps cũ bị lọc bỏ -> Cho phép gọi tiếp
  it("TC-RL-04: Sau 60 giây (vượt window), các request cũ bị xóa khỏi bộ đệm -> Được phép gọi tiếp", () => {
    const userId = "test_user_window_" + Date.now();
    let currentTime = 1000000;
    const dateSpy = jest.spyOn(Date, "now").mockImplementation(() => currentTime);

    // Gửi 5 request tại mốc thời gian T
    for (let i = 0; i < 5; i++) {
      expect(checkAIRateLimit(userId)).toBe(true);
    }

    // Request thứ 6 tại cùng mốc thời gian -> Bị chặn
    expect(checkAIRateLimit(userId)).toBe(false);

    // Thời gian trôi qua 61 giây (> 60000ms)
    currentTime += 61000;

    // Lúc này các timestamps cũ đã bị lọc bỏ -> Request thành công
    expect(checkAIRateLimit(userId)).toBe(true);

    dateSpy.mockRestore();
  });
});

describe("White-Box: aiRateLimiter -> aiRateLimiterMiddleware", () => {
  const makeRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-RL-MW-01: Không có req.user -> 401
  it("TC-RL-MW-01: Không có thông tin người dùng (req.user rỗng) -> Trả về 401", () => {
    const req = { user: null };
    const res = makeRes();
    const next = jest.fn();

    aiRateLimiterMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  // TC-RL-MW-02: Có req.user nhưng không có _id -> 401
  it("TC-RL-MW-02: req.user không có _id -> Trả về 401 Unauthorized", () => {
    const req = { user: {} };
    const res = makeRes();
    const next = jest.fn();

    aiRateLimiterMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  // TC-RL-MW-03: User gửi request trong giới hạn cho phép -> Gọi next()
  it("TC-RL-MW-03: Người dùng gửi trong định mức cho phép -> Gọi next()", () => {
    const req = { user: { _id: "user_mw_ok_" + Date.now() } };
    const res = makeRes();
    const next = jest.fn();

    aiRateLimiterMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  // TC-RL-MW-04: User bị rate limit -> Trả về 429
  it("TC-RL-MW-04: Người dùng bị rate limit -> Trả về 429 và thông báo tiếng Việt", () => {
    const userId = "user_mw_blocked_" + Date.now();
    const req = { user: { _id: userId } };
    const res = makeRes();
    const next = jest.fn();

    // Gọi 5 lần để chạm ngưỡng
    for (let i = 0; i < 5; i++) {
      checkAIRateLimit(userId);
    }

    aiRateLimiterMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      message: "Bạn thao tác quá nhanh, vui lòng đợi 1 phút nữa nhé!",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
