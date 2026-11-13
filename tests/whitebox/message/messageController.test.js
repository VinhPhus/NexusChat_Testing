/**
 * White-Box Tests — messageController.js → sendDirectMessage()
 * TV2 (PhuongBao)
 *
 * Coverage:
 *  TC-SM-01  Thiếu content, audioUrl, imgUrl, fileUrl, sharedContactId → 400
 *  TC-SM-02  Tin nhắn văn bản, conversation tồn tại sẵn → 201
 *  TC-SM-03  Chưa có conversation → tạo mới bằng Conversation.create
 *  TC-SM-04  incognitoMode active + chưa hết hạn → finalExpiresAt từ incognitoMode
 *  TC-SM-05  incognitoMode active + đã hết hạn → tắt incognito
 *  TC-SM-06  expiresIn có giá trị → tính finalExpiresAt = now + expiresIn * 1000
 *  TC-SM-07  content có "@NexusAI" → gọi handleAIResponse
 *  TC-SM-08  isViewOnce = true → message được tạo với isViewOnce
 */

import { jest } from "@jest/globals";

// ─── Mock stubs ───────────────────────────────────────────────────────────────
const mockConversationFindOne    = jest.fn();
const mockConversationFindById   = jest.fn();
const mockConversationCreate     = jest.fn();

const mockMessageCreate          = jest.fn();

const mockHandleAIResponse       = jest.fn();

// mongoose.Types.ObjectId — just needs to be callable as `new`
const MockObjectId = jest.fn().mockImplementation((v) => v);

// ─── Register mocks BEFORE any import of the SUT ─────────────────────────────
jest.unstable_mockModule("../../../backend/src/models/Conversation.js", () => ({
  default: {
    findOne:   mockConversationFindOne,
    findById:  mockConversationFindById,
    create:    mockConversationCreate,
  },
}));

jest.unstable_mockModule("../../../backend/src/models/Message.js", () => ({
  default: {
    create: mockMessageCreate,
  },
}));

jest.unstable_mockModule("../../../backend/src/services/aiService.js", () => ({
  handleAIResponse: mockHandleAIResponse,
}));

jest.unstable_mockModule("mongoose", () => ({
  default: {
    Types: { ObjectId: MockObjectId },
  },
}));

// updateConversationAfterCreateMessage — mock to avoid DB calls inside helper
const mockUpdateConversation = jest.fn().mockResolvedValue(undefined);
jest.unstable_mockModule("../../../backend/src/utils/messageHelper.js", () => ({
  updateConversationAfterCreateMessage: mockUpdateConversation,
}));

// Mock unused heavy deps so the module loads cleanly
jest.unstable_mockModule("../../../backend/src/libs/cloudinary.js", () => ({
  default: { uploader: { upload: jest.fn(), destroy: jest.fn() } },
}));
jest.unstable_mockModule("../../../backend/src/services/translateService.js", () => ({
  translateText: jest.fn(),
}));
jest.unstable_mockModule("../../../backend/src/services/driveService.js", () => ({
  uploadFileToDrive: jest.fn(),
}));
jest.unstable_mockModule("fs", () => ({
  default: { unlinkSync: jest.fn(), existsSync: jest.fn().mockReturnValue(false) },
}));

// ─── Import SUT ──────────────────────────────────────────────────────────────
const { sendDirectMessage } = await import(
  "../../../backend/src/controllers/messageController.js"
);

// ─── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Build a minimal Express-style request object.
 */
function makeReq(overrides = {}) {
  const { body: bodyOverrides, ...requestOverrides } = overrides;

  return {
    body: {
      recipientId: "recipient-id",
      content: "Hello",
      conversationId: undefined,
      audioUrl: undefined,
      imgUrl: undefined,
      expiresIn: undefined,
      isViewOnce: false,
      mentions: undefined,
      replyTo: undefined,
      isForwarded: false,
      fileUrl: undefined,
      fileName: undefined,
      fileSize: undefined,
      sharedContactId: undefined,
      ...bodyOverrides,
    },
    user: { _id: "sender-id" },
    app: { get: jest.fn().mockReturnValue(null) }, // no io
    ...requestOverrides,
  };
}

/**
 * Build a minimal Express-style response object.
 * Captures the last status + json call.
 */
function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

/**
 * Build a mock message returned by Message.create.
 */
function makeMessage(overrides = {}) {
  return {
    _id: "msg-id",
    conversationId: "conv-id",
    senderId: "sender-id",
    content: "Hello",
    isViewOnce: false,
    populate: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

/**
 * Build a mock conversation returned by Conversation.findOne / findById / create.
 */
function makeConversation(overrides = {}) {
  return {
    _id: "conv-id",
    type: "direct",
    participants: [
      { userId: "sender-id" },
      { userId: "recipient-id" },
    ],
    unreadCounts: new Map(),
    incognitoMode: null,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────
describe("sendDirectMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────────────────────────
  it("TC-SM-01: Thiếu content, audioUrl, imgUrl, fileUrl, sharedContactId → 400", async () => {
    const req = makeReq({
      body: {
        recipientId: "recipient-id",
        content: undefined,
        audioUrl: undefined,
        imgUrl: undefined,
        fileUrl: undefined,
        sharedContactId: undefined,
      },
    });
    const res = makeRes();

    await sendDirectMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Thiếu") })
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  it("TC-SM-02: Tin nhắn văn bản, conversation đã tồn tại → 201", async () => {
    const conv = makeConversation();
    mockConversationFindOne.mockResolvedValue(conv);
    mockMessageCreate.mockResolvedValue(makeMessage());

    const req = makeReq({ body: { recipientId: "recipient-id", content: "Hello" } });
    const res = makeRes();

    await sendDirectMessage(req, res);

    expect(mockConversationCreate).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.anything(), conversation: expect.anything() })
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  it("TC-SM-03: Không có conversation → gọi Conversation.create để tạo mới", async () => {
    const newConv = makeConversation();
    mockConversationFindOne.mockResolvedValue(null);
    mockConversationCreate.mockResolvedValue(newConv);
    mockMessageCreate.mockResolvedValue(makeMessage({ conversationId: newConv._id }));

    const req = makeReq({ body: { recipientId: "recipient-id", content: "Hey" } });
    const res = makeRes();

    await sendDirectMessage(req, res);

    expect(mockConversationCreate).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ──────────────────────────────────────────────────────────────────────────
  it("TC-SM-04: incognitoMode active + chưa hết hạn → finalExpiresAt lấy từ incognitoMode.expiresAt", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ nữa
    const conv = makeConversation({
      incognitoMode: {
        isActive: true,
        expiresAt: futureDate,
        startedAt: new Date(),
        startedBy: "sender-id",
      },
    });
    mockConversationFindOne.mockResolvedValue(conv);

    let capturedCreateArgs;
    mockMessageCreate.mockImplementation((args) => {
      capturedCreateArgs = args;
      return Promise.resolve(makeMessage(args));
    });

    const req = makeReq({ body: { recipientId: "recipient-id", content: "Mật" } });
    const res = makeRes();

    await sendDirectMessage(req, res);

    // finalExpiresAt phải = incognitoMode.expiresAt
    expect(capturedCreateArgs.expiresAt).toEqual(futureDate);
    // finalExpiresIn phải bị override → null
    expect(capturedCreateArgs.expiresIn).toBeNull();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ──────────────────────────────────────────────────────────────────────────
  it("TC-SM-05: incognitoMode active + đã hết hạn → tắt incognito (isActive = false)", async () => {
    const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 giờ trước
    const incognito = {
      isActive: true,
      expiresAt: pastDate,
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      startedBy: "sender-id",
    };
    const conv = makeConversation({ incognitoMode: incognito });
    mockConversationFindOne.mockResolvedValue(conv);
    mockMessageCreate.mockResolvedValue(makeMessage());

    const req = makeReq({ body: { recipientId: "recipient-id", content: "Hết hạn" } });
    const res = makeRes();

    await sendDirectMessage(req, res);

    // incognitoMode phải bị tắt
    expect(conv.incognitoMode.isActive).toBe(false);
    expect(conv.incognitoMode.expiresAt).toBeNull();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ──────────────────────────────────────────────────────────────────────────
  it("TC-SM-06: expiresIn có giá trị → finalExpiresAt = now + expiresIn * 1000", async () => {
    const conv = makeConversation();
    mockConversationFindOne.mockResolvedValue(conv);

    let capturedArgs;
    mockMessageCreate.mockImplementation((args) => {
      capturedArgs = args;
      return Promise.resolve(makeMessage(args));
    });

    const expiresIn = 300; // 5 phút
    const beforeCall = Date.now();

    const req = makeReq({ body: { recipientId: "recipient-id", content: "Tự hủy", expiresIn } });
    const res = makeRes();

    await sendDirectMessage(req, res);

    const afterCall = Date.now();
    const expiresAtMs = new Date(capturedArgs.expiresAt).getTime();

    expect(expiresAtMs).toBeGreaterThanOrEqual(beforeCall + expiresIn * 1000 - 100);
    expect(expiresAtMs).toBeLessThanOrEqual(afterCall + expiresIn * 1000 + 100);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ──────────────────────────────────────────────────────────────────────────
  it("TC-SM-07: content chứa '@NexusAI' → gọi handleAIResponse", async () => {
    const conv = makeConversation();
    mockConversationFindOne.mockResolvedValue(conv);
    mockMessageCreate.mockResolvedValue(makeMessage({ content: "@NexusAI hãy giải thích" }));

    const req = makeReq({ body: { recipientId: "recipient-id", content: "@NexusAI hãy giải thích" } });
    const res = makeRes();

    await sendDirectMessage(req, res);

    expect(mockHandleAIResponse).toHaveBeenCalledTimes(1);
    expect(mockHandleAIResponse).toHaveBeenCalledWith(conv._id, null, "sender-id");
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ──────────────────────────────────────────────────────────────────────────
  it("TC-SM-08: isViewOnce = true → message được tạo với isViewOnce = true", async () => {
    const conv = makeConversation();
    mockConversationFindOne.mockResolvedValue(conv);

    let capturedArgs;
    mockMessageCreate.mockImplementation((args) => {
      capturedArgs = args;
      return Promise.resolve(makeMessage({ ...args, isViewOnce: true }));
    });

    const req = makeReq({ body: { recipientId: "recipient-id", content: "Bí mật", isViewOnce: true } });
    const res = makeRes();

    await sendDirectMessage(req, res);

    expect(capturedArgs.isViewOnce).toBe(true);
    expect(res.status).toHaveBeenCalledWith(201);
  });

it.each([
  ["audioUrl", "https://audio.example/voice.mp3"],
  ["imgUrl", "https://image.example/photo.png"],
  ["fileUrl", "https://file.example/report.pdf"],
  ["sharedContactId", "contact-id"],
])("TC-SM-09: Chỉ có %s vẫn gửi được tin nhắn", async (field, value) => {
  const conv = makeConversation();
  mockConversationFindOne.mockResolvedValue(conv);
  mockMessageCreate.mockImplementation((args) => Promise.resolve(makeMessage(args)));
  const req = makeReq({ body: { content: "", [field]: value } });
  const res = makeRes();

  await sendDirectMessage(req, res);

  expect(mockMessageCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      [field === "sharedContactId" ? "sharedContact" : field]: value,
    })
  );
  expect(res.status).toHaveBeenCalledWith(201);
});

it("TC-SM-10: Dùng conversationId dự phòng khi conversation direct chưa tìm thấy", async () => {
  const conv = makeConversation();
  mockConversationFindOne.mockResolvedValue(null);
  mockConversationFindById.mockResolvedValue(conv);
  mockMessageCreate.mockResolvedValue(makeMessage());
  const req = makeReq({
    body: { recipientId: "recipient-id", conversationId: "conv-id", content: "Hello" },
  });
  const res = makeRes();

  await sendDirectMessage(req, res);

  expect(mockConversationFindById).toHaveBeenCalledWith("conv-id");
  expect(mockConversationCreate).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(201);
});

it("TC-SM-11: Bỏ qua conversationId nếu người nhận không tham gia conversation đó", async () => {
  const unrelatedConv = makeConversation({
    participants: [{ userId: "sender-id" }, { userId: "another-user" }],
  });
  const newConv = makeConversation();
  mockConversationFindOne.mockResolvedValue(null);
  mockConversationFindById.mockResolvedValue(unrelatedConv);
  mockConversationCreate.mockResolvedValue(newConv);
  mockMessageCreate.mockResolvedValue(makeMessage());
  const req = makeReq({
    body: { recipientId: "recipient-id", conversationId: "conv-id", content: "Hello" },
  });
  const res = makeRes();

  await sendDirectMessage(req, res);

  expect(mockConversationCreate).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(201);
});

it("TC-SM-12: Tìm conversation theo ID khi request không có recipientId", async () => {
  const conv = makeConversation();
  mockConversationFindById.mockResolvedValue(conv);
  mockMessageCreate.mockResolvedValue(makeMessage());
  const req = makeReq({
    body: { recipientId: undefined, conversationId: "conv-id", content: "Hello" },
  });
  const res = makeRes();

  await sendDirectMessage(req, res);

  expect(mockConversationFindOne).not.toHaveBeenCalled();
  expect(mockConversationFindById).toHaveBeenCalledWith("conv-id");
  expect(mockConversationCreate).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(201);
});

it("TC-SM-13: Phát sự kiện new-message tới từng thành viên khi có socket", async () => {
  const conv = makeConversation();
  const emit = jest.fn();
  const io = { to: jest.fn().mockReturnValue({ emit }) };
  mockConversationFindOne.mockResolvedValue(conv);
  mockMessageCreate.mockResolvedValue(makeMessage());
  const req = makeReq({ body: { content: "Hello" }, app: { get: jest.fn().mockReturnValue(io) } });
  const res = makeRes();

  await sendDirectMessage(req, res);

  expect(io.to).toHaveBeenCalledTimes(2);
  expect(emit).toHaveBeenCalledTimes(2);
  expect(emit).toHaveBeenCalledWith(
    "new-message",
    expect.objectContaining({
      message: expect.anything(),
      conversation: expect.objectContaining({ _id: conv._id }),
      unreadCounts: {},
    })
  );
});

it("TC-SM-13b: Dùng unreadCounts rỗng nếu conversation chưa có map", async () => {
  const conv = makeConversation({ unreadCounts: null });
  expect(conv.unreadCounts).toBeNull();
  const emit = jest.fn();
  const io = { to: jest.fn().mockReturnValue({ emit }) };
  mockConversationFindOne.mockResolvedValue(conv);
  mockMessageCreate.mockResolvedValue(makeMessage());
  const req = makeReq({ body: { content: "Hello" }, app: { get: jest.fn().mockReturnValue(io) } });
  const res = makeRes();

  await sendDirectMessage(req, res);

  expect(emit).toHaveBeenCalledWith(
    "new-message",
    expect.objectContaining({ unreadCounts: {} })
  );
  expect(res.status).toHaveBeenCalledWith(201);
});

it("TC-SM-14: Gọi NexusAI qua mentions ID khi nội dung không có tên gọi", async () => {
  const conv = makeConversation();
  mockConversationFindOne.mockResolvedValue(conv);
  mockMessageCreate.mockResolvedValue(makeMessage());
  const req = makeReq({
    body: { content: "Giúp mình với", mentions: ["000000000000000000000000"] },
  });
  const res = makeRes();

  await sendDirectMessage(req, res);

  expect(mockHandleAIResponse).toHaveBeenCalledWith(conv._id, null, "sender-id");
  expect(res.status).toHaveBeenCalledWith(201);
});

it("TC-SM-15: Lỗi khi tạo message trả HTTP 500", async () => {
  const conv = makeConversation();
  const logError = jest.spyOn(console, "error").mockImplementation(() => {});
  mockConversationFindOne.mockResolvedValue(conv);
  mockMessageCreate.mockRejectedValue(new Error("database unavailable"));
  const req = makeReq({ body: { content: "Hello" } });
  const res = makeRes();

  try {
    await sendDirectMessage(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống" });
  } finally {
    logError.mockRestore();
  }
});
});
