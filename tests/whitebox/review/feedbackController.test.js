import { jest } from "@jest/globals";

const mockFeedbackCreate = jest.fn();

jest.unstable_mockModule("../../../backend/src/models/Feedback.js", () => ({
  default: { create: mockFeedbackCreate },
}));

const { submitFeedback } = await import(
  "../../../backend/src/controllers/feedbackController.js"
);

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("White-Box: feedbackController -> submitFeedback", () => {
  let consoleError;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("TC-FC-01: Nội dung rỗng hoặc chỉ có khoảng trắng trả 400", async () => {
    const res = makeRes();

    await submitFeedback({ body: { message: "   " } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Nội dung góp ý không được để trống.",
    });
    expect(mockFeedbackCreate).not.toHaveBeenCalled();
  });

  it("TC-FC-02: Góp ý hợp lệ được trim và lưu, thiếu tên/email dùng giá trị mặc định", async () => {
    mockFeedbackCreate.mockResolvedValue({ _id: "feedback-1" });
    const res = makeRes();

    await submitFeedback({
      body: { name: "  ", email: undefined, message: "  Nội dung góp ý  " },
    }, res);

    expect(mockFeedbackCreate).toHaveBeenCalledWith({
      name: "Ẩn danh",
      email: "",
      message: "Nội dung góp ý",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Góp ý đã được ghi nhận. Cảm ơn bạn!",
      id: "feedback-1",
    });
  });

  it("TC-FC-03: Tên và email có giá trị được trim trước khi lưu", async () => {
    mockFeedbackCreate.mockResolvedValue({ _id: "feedback-2" });
    const res = makeRes();

    await submitFeedback({
      body: {
        name: "  Nguyen An ",
        email: "  an@example.com ",
        message: "  Xin chào  ",
      },
    }, res);

    expect(mockFeedbackCreate).toHaveBeenCalledWith({
      name: "Nguyen An",
      email: "an@example.com",
      message: "Xin chào",
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("TC-FC-04: Lỗi lưu feedback trả 500", async () => {
    mockFeedbackCreate.mockRejectedValue(new Error("database unavailable"));
    const res = makeRes();

    await submitFeedback({ body: { message: "Help" } }, res);

    expect(consoleError).toHaveBeenCalledWith(
      "[Feedback] submitFeedback error:",
      expect.any(Error),
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Có lỗi xảy ra, vui lòng thử lại.",
    });
  });
});
