import { jest } from "@jest/globals";

const mockReviewFindOneAndUpdate = jest.fn();
const mockReviewFind = jest.fn();
const mockGenerateContent = jest.fn();

jest.unstable_mockModule("../../../backend/src/models/Review.js", () => ({
  Review: {
    findOneAndUpdate: mockReviewFindOneAndUpdate,
    find: mockReviewFind,
  },
}));

jest.unstable_mockModule("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: () => ({ generateContent: mockGenerateContent }),
  })),
}));

const {
  submitReview,
  getApprovedReviews,
  getReviewStats,
} = await import("../../../backend/src/controllers/reviewController.js");

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeRequest = (overrides = {}) => ({
  user: { _id: "user-123" },
  body: { rating: 5, content: "Ứng dụng hữu ích và dễ sử dụng." },
  ...overrides,
});

const moderationResponse = (result) => ({
  response: { text: () => JSON.stringify(result) },
});

const makeReviewQuery = (result) => {
  const query = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  query.sort.mockImplementation(() => query);
  return query;
};

describe("White-Box: reviewController -> submitReview", () => {
  let consoleError;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("TC-RC-01: Thiếu rating hoặc content thì trả 400 và không gọi AI", async () => {
    const res = makeRes();

    await submitReview(makeRequest({ body: { rating: 0, content: "review" } }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Vui lòng nhập đánh giá và số sao.",
    }));
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("TC-RC-02: Nội dung vượt 500 ký tự trả 400", async () => {
    const res = makeRes();

    await submitReview(makeRequest({
      body: { rating: 5, content: "a".repeat(501) },
    }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Đánh giá quá dài (tối đa 500 ký tự).",
    }));
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("TC-RC-03: AI từ chối nội dung thì trả 400 và không ghi review", async () => {
    mockGenerateContent.mockResolvedValue(moderationResponse({
      status: "rejected",
      confidence: 99,
      reason: "Nội dung xúc phạm.",
    }));
    const res = makeRes();

    await submitReview(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      reason: "Nội dung xúc phạm.",
    }));
    expect(mockReviewFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it("TC-RC-04: Nội dung hợp lệ dài đúng 500 ký tự được lưu bằng upsert", async () => {
    const review = { _id: "review-1", status: "approved" };
    mockGenerateContent.mockResolvedValue(moderationResponse({
      status: "approved",
      confidence: 95,
      reason: "",
    }));
    mockReviewFindOneAndUpdate.mockResolvedValue(review);
    const res = makeRes();
    const content = "x".repeat(500);

    await submitReview(makeRequest({ body: { rating: 5, content } }), res);

    expect(mockReviewFindOneAndUpdate).toHaveBeenCalledWith(
      { user: "user-123" },
      expect.objectContaining({
        user: "user-123",
        rating: 5,
        content,
        status: "approved",
        aiConfidence: 95,
        rejectionReason: "",
      }),
      { new: true, upsert: true },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      review,
    }));
  });

  it("TC-RC-04B: AI trả fenced JSON vẫn được parse và lưu review", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => '```json\n{"status":"approved","confidence":90,"reason":""}\n```',
      },
    });
    mockReviewFindOneAndUpdate.mockResolvedValue({ _id: "review-markdown" });
    const res = makeRes();

    await submitReview(makeRequest(), res);

    expect(mockReviewFindOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ status: "approved", aiConfidence: 90 }),
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("TC-RC-05: AI trả pending thì vẫn lưu và báo đang chờ duyệt", async () => {
    mockGenerateContent.mockResolvedValue(moderationResponse({
      status: "pending",
      confidence: 40,
      reason: "",
    }));
    mockReviewFindOneAndUpdate.mockResolvedValue({ _id: "review-pending" });
    const res = makeRes();

    await submitReview(makeRequest(), res);

    expect(mockReviewFindOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ status: "pending", aiConfidence: 40 }),
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Đánh giá của bạn đã được ghi nhận và đang chờ Admin duyệt do AI Server quá tải.",
    }));
  });

  it("TC-RC-06: AI lỗi dùng fallback keyword và từ chối nội dung vi phạm", async () => {
    mockGenerateContent.mockRejectedValue(new Error("AI unavailable"));
    const res = makeRes();

    await submitReview(makeRequest({
      body: { rating: 1, content: "Hãy vay tiền qua dịch vụ này" },
    }), res);

    expect(consoleError).toHaveBeenCalledWith("AI Moderation Error:", expect.any(Error));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      reason: "Phát hiện từ khóa vi phạm (Fallback Filter).",
    }));
    expect(mockReviewFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it("TC-RC-07: AI lỗi nhưng nội dung sạch thì fallback cho phép lưu", async () => {
    mockGenerateContent.mockRejectedValue(new Error("AI unavailable"));
    mockReviewFindOneAndUpdate.mockResolvedValue({ _id: "review-fallback" });
    const res = makeRes();

    await submitReview(makeRequest(), res);

    expect(mockReviewFindOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ status: "approved", aiConfidence: 50 }),
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("TC-RC-07B: AI trả JSON không hợp lệ thì fallback từ khóa vẫn chặn nội dung", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "not-json" },
    });
    const res = makeRes();

    await submitReview(makeRequest({
      body: { rating: 1, content: "Dịch vụ cá độ bóng đá" },
    }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockReviewFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it("TC-RC-08: Lỗi lưu review trả 500", async () => {
    mockGenerateContent.mockResolvedValue(moderationResponse({
      status: "approved",
      confidence: 80,
      reason: "",
    }));
    mockReviewFindOneAndUpdate.mockRejectedValue(new Error("database unavailable"));
    const res = makeRes();

    await submitReview(makeRequest(), res);

    expect(consoleError).toHaveBeenCalledWith("Error in submitReview:", expect.any(Error));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Lỗi máy chủ nội bộ.",
    });
  });
});

describe("White-Box: reviewController -> getApprovedReviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-RC-09: Lấy danh sách review approved theo thứ tự mới nhất và tối đa 10", async () => {
    const reviews = [{ _id: "review-1" }];
    const query = makeReviewQuery(reviews);
    mockReviewFind.mockReturnValue(query);
    const res = makeRes();

    await getApprovedReviews({}, res);

    expect(mockReviewFind).toHaveBeenCalledWith({ status: "approved" });
    expect(query.populate).toHaveBeenCalledWith("user", "displayName avatarUrl");
    expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(query.limit).toHaveBeenCalledWith(10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, reviews });
  });

  it("TC-RC-10: Lỗi lấy danh sách trả 500", async () => {
    mockReviewFind.mockImplementation(() => {
      throw new Error("review query failed");
    });
    const res = makeRes();
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    await getApprovedReviews({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    consoleError.mockRestore();
  });

  it("TC-RC-10B: Lỗi populate review trả 500", async () => {
    const query = {
      populate: jest.fn().mockImplementation(() => {
        throw new Error("populate failed");
      }),
    };
    mockReviewFind.mockReturnValue(query);
    const res = makeRes();
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    await getApprovedReviews({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    consoleError.mockRestore();
  });
});

describe("White-Box: reviewController -> getReviewStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-RC-11: Không có review thì trả số liệu rỗng", async () => {
    const query = makeReviewQuery([]);
    mockReviewFind.mockReturnValue(query);
    const res = makeRes();

    await getReviewStats({}, res);

    expect(query.sort).toHaveBeenCalledWith({ rating: -1, createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      averageRating: 0,
      totalReviews: 0,
      recentAvatars: [],
      topReviews: [],
    });
  });

  it("TC-RC-12: Tính trung bình, avatar gần đây và review tốt", async () => {
    const reviews = [
      { rating: 5, content: "Một trải nghiệm tuyệt vời", user: { displayName: "An", avatarUrl: "a.png" } },
      { rating: 4, content: "Rất dễ sử dụng và tiện lợi", user: { displayName: "Bình", avatarUrl: "b.png" } },
      { rating: 4, content: "Nội dung dài hơn mười ký tự", user: {} },
      { rating: 2, content: "Chưa tốt", user: null },
    ];
    const query = makeReviewQuery(reviews);
    mockReviewFind.mockReturnValue(query);
    const res = makeRes();

    await getReviewStats({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      averageRating: 3.8,
      totalReviews: 4,
      recentAvatars: [
        { name: "An", avatar: "a.png" },
        { name: "Bình", avatar: "b.png" },
        { name: "?", avatar: null },
        { name: "?", avatar: null },
      ],
      topReviews: [
        { name: "An", avatar: "a.png", rating: 5, content: "Một trải nghiệm tuyệt vời" },
        { name: "Bình", avatar: "b.png", rating: 4, content: "Rất dễ sử dụng và tiện lợi" },
        { name: "Người dùng", avatar: null, rating: 4, content: "Nội dung dài hơn mười ký tự" },
      ],
    });
  });

  it("TC-RC-13: Lỗi lấy số liệu review trả 500", async () => {
    mockReviewFind.mockImplementation(() => {
      throw new Error("stats query failed");
    });
    const res = makeRes();
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    await getReviewStats({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Lỗi máy chủ nội bộ.",
    });
    consoleError.mockRestore();
  });
});
