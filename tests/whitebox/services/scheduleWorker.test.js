import { jest } from "@jest/globals";

const mockScheduledMessageFind = jest.fn();
const mockConversationFindById = jest.fn();
const mockConversationFind = jest.fn();
const mockMessageCreate = jest.fn();
const mockUpdateConversationAfterCreateMessage = jest.fn();
const mockHandleAIResponse = jest.fn();

jest.unstable_mockModule("../../../backend/src/models/ScheduledMessage.js", () => ({
  default: { find: mockScheduledMessageFind },
}));

jest.unstable_mockModule("../../../backend/src/models/Conversation.js", () => ({
  default: {
    findById: mockConversationFindById,
    find: mockConversationFind,
  },
}));

jest.unstable_mockModule("../../../backend/src/models/Message.js", () => ({
  default: { create: mockMessageCreate },
}));

jest.unstable_mockModule("../../../backend/src/utils/messageHelper.js", () => ({
  updateConversationAfterCreateMessage: mockUpdateConversationAfterCreateMessage,
}));

jest.unstable_mockModule("../../../backend/src/services/aiService.js", () => ({
  handleAIResponse: mockHandleAIResponse,
}));

const {
  processScheduledMessages,
  checkAndResetExpiredStreaks,
  startScheduleWorker,
  stopScheduleWorker,
} = await import("../../../backend/src/services/scheduleWorker.js");

const makeQuery = (result) => ({ limit: jest.fn().mockResolvedValue(result) });

const makeScheduledMessage = (overrides = {}) => ({
  _id: "scheduled-1",
  conversationId: "conversation-1",
  senderId: "sender-1",
  content: "Scheduled message",
  imgUrl: "",
  audioUrl: "",
  fileUrl: "",
  fileName: "",
  fileSize: 0,
  mentions: [],
  status: "pending",
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

const makeConversation = () => ({
  _id: "conversation-1",
  participants: [
    { userId: { _id: "user-1" } },
    { userId: "user-2" },
    { _id: "user-3" },
  ],
  unreadCounts: new Map([["user-1", 1]]),
  save: jest.fn().mockResolvedValue(true),
});

const makeIo = () => ({
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
});

describe("White-Box: scheduleWorker -> processScheduledMessages", () => {
  let consoleError;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    mockUpdateConversationAfterCreateMessage.mockResolvedValue(true);
    mockHandleAIResponse.mockResolvedValue(true);
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("TC-SW-01: Không có tin nhắn đến hạn thì không truy vấn hội thoại", async () => {
    const query = makeQuery([]);
    mockScheduledMessageFind.mockReturnValue(query);

    await processScheduledMessages(makeIo());

    expect(mockScheduledMessageFind).toHaveBeenCalledWith({
      status: "pending",
      scheduledFor: { $lte: expect.any(Date) },
    });
    expect(query.limit).toHaveBeenCalledWith(50);
    expect(mockConversationFindById).not.toHaveBeenCalled();
    expect(mockMessageCreate).not.toHaveBeenCalled();
  });

  it("TC-SW-02: Hội thoại không tồn tại thì đánh dấu lịch gửi thất bại", async () => {
    const scheduled = makeScheduledMessage({ conversationId: "deleted" });
    mockScheduledMessageFind.mockReturnValue(makeQuery([scheduled]));
    mockConversationFindById.mockResolvedValue(null);

    await processScheduledMessages(makeIo());

    expect(scheduled.status).toBe("failed");
    expect(scheduled.errorReason).toBe("Conversation not found");
    expect(scheduled.save).toHaveBeenCalledTimes(1);
    expect(mockMessageCreate).not.toHaveBeenCalled();
  });

  it("TC-SW-03: Gửi thành công, cập nhật hội thoại và phát socket cho thành viên", async () => {
    const scheduled = makeScheduledMessage();
    const conversation = makeConversation();
    const message = { _id: "message-1" };
    const io = makeIo();
    mockScheduledMessageFind.mockReturnValue(makeQuery([scheduled]));
    mockConversationFindById.mockResolvedValue(conversation);
    mockMessageCreate.mockResolvedValue(message);

    await processScheduledMessages(io);

    expect(mockMessageCreate).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: scheduled.conversationId,
      senderId: scheduled.senderId,
      content: scheduled.content,
      mentions: scheduled.mentions,
    }));
    expect(mockUpdateConversationAfterCreateMessage).toHaveBeenCalledWith(
      conversation,
      message,
      scheduled.senderId,
    );
    expect(conversation.save).toHaveBeenCalledTimes(1);
    expect(scheduled.status).toBe("sent");
    expect(scheduled.executedAt).toBeInstanceOf(Date);
    expect(scheduled.save).toHaveBeenCalledTimes(1);
    expect(io.emit).toHaveBeenCalledWith("new-message", expect.objectContaining({
      message,
      conversation,
      unreadCounts: { "user-1": 1 },
    }));
    expect(io.emit).toHaveBeenCalledWith("scheduled-message:executed", {
      scheduledId: scheduled._id,
      messageId: message._id,
      conversationId: scheduled.conversationId,
    });
    expect(io.to).toHaveBeenCalledWith("user:user-1");
    expect(io.to).toHaveBeenCalledWith("user:user-2");
    expect(io.to).toHaveBeenCalledWith("user:user-3");
  });

  it("TC-SW-03B: unreadCounts rỗng vẫn phát socket với object rỗng", async () => {
    const scheduled = makeScheduledMessage();
    const conversation = { ...makeConversation(), unreadCounts: null };
    const io = makeIo();
    mockScheduledMessageFind.mockReturnValue(makeQuery([scheduled]));
    mockConversationFindById.mockResolvedValue(conversation);
    mockMessageCreate.mockResolvedValue({ _id: "message-no-unread-counts" });

    await processScheduledMessages(io);

    expect(io.emit).toHaveBeenCalledWith("new-message", expect.objectContaining({
      unreadCounts: {},
    }));
  });

  it("TC-SW-04: Tin nhắn nhắc @NexusAI thì gọi AI sau khi gửi", async () => {
    const scheduled = makeScheduledMessage({
      content: "Xin chào @NexusAI",
      senderId: "sender-ai-test",
    });
    const conversation = makeConversation();
    mockScheduledMessageFind.mockReturnValue(makeQuery([scheduled]));
    mockConversationFindById.mockResolvedValue(conversation);
    mockMessageCreate.mockResolvedValue({ _id: "message-ai" });

    await processScheduledMessages(makeIo());

    expect(scheduled.status).toBe("sent");
    expect(mockHandleAIResponse).toHaveBeenCalledWith(
      conversation._id,
      expect.any(Object),
      scheduled.senderId,
    );
  });

  it("TC-SW-04B: Mention ID của NexusAI kích hoạt AI dù nội dung không có tag", async () => {
    const scheduled = makeScheduledMessage({
      content: "Tin nhắn có mention entity",
      mentions: ["000000000000000000000000"],
    });
    const conversation = makeConversation();
    mockScheduledMessageFind.mockReturnValue(makeQuery([scheduled]));
    mockConversationFindById.mockResolvedValue(conversation);
    mockMessageCreate.mockResolvedValue({ _id: "message-mentioned-ai" });

    await processScheduledMessages(makeIo());

    expect(mockHandleAIResponse).toHaveBeenCalledWith(
      conversation._id,
      expect.any(Object),
      scheduled.senderId,
    );
  });

  it("TC-SW-04C: Không có io thì vẫn gửi lịch nhưng không gọi AI", async () => {
    const scheduled = makeScheduledMessage({ content: "@NexusAI giúp tôi" });
    mockScheduledMessageFind.mockReturnValue(makeQuery([scheduled]));
    mockConversationFindById.mockResolvedValue(makeConversation());
    mockMessageCreate.mockResolvedValue({ _id: "message-no-io" });

    await processScheduledMessages();

    expect(scheduled.status).toBe("sent");
    expect(mockHandleAIResponse).not.toHaveBeenCalled();
  });

  it("TC-SW-05: Lỗi ở một lịch được ghi nhận và worker vẫn xử lý các lịch còn lại", async () => {
    const missingConversation = makeScheduledMessage({ _id: "scheduled-missing" });
    const successful = makeScheduledMessage({ _id: "scheduled-success" });
    const failing = makeScheduledMessage({ _id: "scheduled-error" });
    const conversation = makeConversation();
    mockScheduledMessageFind.mockReturnValue(
      makeQuery([missingConversation, successful, failing]),
    );
    mockConversationFindById
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(conversation)
      .mockResolvedValueOnce(conversation);
    mockMessageCreate
      .mockResolvedValueOnce({ _id: "message-success" })
      .mockRejectedValueOnce(new Error("message database unavailable"));

    await processScheduledMessages(makeIo());

    expect(missingConversation.status).toBe("failed");
    expect(successful.status).toBe("sent");
    expect(failing.status).toBe("failed");
    expect(failing.errorReason).toBe("message database unavailable");
    expect(failing.save).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("[ScheduleWorker] Lỗi khi xử lý tin nhắn"),
      expect.any(Error),
    );
    expect(mockMessageCreate).toHaveBeenCalledTimes(2);
  });

  it("TC-SW-05B: Thiếu user ID thành viên thì bỏ qua socket của thành viên đó", async () => {
    const scheduled = makeScheduledMessage();
    const conversation = {
      ...makeConversation(),
      participants: [{}, { userId: "user-2" }],
    };
    const io = makeIo();
    mockScheduledMessageFind.mockReturnValue(makeQuery([scheduled]));
    mockConversationFindById.mockResolvedValue(conversation);
    mockMessageCreate.mockResolvedValue({ _id: "message-no-participant-id" });

    await processScheduledMessages(io);

    expect(io.to).toHaveBeenCalledWith("user:user-2");
    expect(io.to).toHaveBeenCalledWith(`user:${scheduled.senderId}`);
    expect(io.to).not.toHaveBeenCalledWith("user:undefined");
  });

  it("TC-SW-05C: Lỗi khi lưu trạng thái failed không làm worker thoát", async () => {
    const scheduled = makeScheduledMessage({
      save: jest.fn().mockRejectedValue(new Error("save failed")),
    });
    mockScheduledMessageFind.mockReturnValue(makeQuery([scheduled]));
    mockConversationFindById.mockResolvedValue(makeConversation());
    mockMessageCreate.mockRejectedValue(new Error("message creation failed"));

    await expect(processScheduledMessages()).resolves.toBeUndefined();

    expect(scheduled.status).toBe("failed");
    expect(scheduled.save).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("[ScheduleWorker] Lỗi khi xử lý tin nhắn"),
      expect.any(Error),
    );
  });

  it("TC-SW-05D: Lỗi không có message dùng errorReason mặc định", async () => {
    const error = new Error();
    error.message = "";
    const scheduled = makeScheduledMessage();
    mockScheduledMessageFind.mockReturnValue(makeQuery([scheduled]));
    mockConversationFindById.mockResolvedValue(makeConversation());
    mockMessageCreate.mockRejectedValue(error);

    await processScheduledMessages();

    expect(scheduled.errorReason).toBe("Unknown error");
    expect(scheduled.status).toBe("failed");
  });

  it("TC-SW-06: Lỗi truy vấn worker được bắt và không thoát ra ngoài", async () => {
    mockScheduledMessageFind.mockImplementation(() => {
      throw new Error("scheduled query failed");
    });

    await expect(processScheduledMessages()).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledWith(
      "[ScheduleWorker] Lỗi worker chu kỳ kiểm tra tin nhắn hẹn giờ:",
      expect.any(Error),
    );
  });
});

describe("White-Box: scheduleWorker -> checkAndResetExpiredStreaks", () => {
  let consoleError;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("TC-SW-07: Không có hội thoại hết hạn thì không lưu hay phát socket", async () => {
    mockConversationFind.mockReturnValue(makeQuery([]));
    const io = makeIo();

    await checkAndResetExpiredStreaks(io);

    expect(mockConversationFind).toHaveBeenCalledWith(expect.objectContaining({
      type: "direct",
      "streak.count": { $gt: 0 },
      "streak.lastMessageDate": { $lte: expect.any(Date) },
    }));
    expect(io.emit).not.toHaveBeenCalled();
  });

  it("TC-SW-08: Reset streak quá hạn, đánh dấu modified và báo cho từng thành viên", async () => {
    const conversation = {
      _id: "expired-conversation",
      streak: { count: 5, lastMessageDate: new Date(), senders: ["a"], isBothMessaged: true },
      participants: [{ userId: { _id: "u1" } }, { userId: "u2" }, {}],
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };
    mockConversationFind.mockReturnValue(makeQuery([conversation]));
    const io = makeIo();

    await checkAndResetExpiredStreaks(io);

    expect(conversation.streak).toEqual({
      count: 0,
      lastMessageDate: null,
      senders: [],
      isBothMessaged: false,
    });
    expect(conversation.markModified).toHaveBeenCalledWith("streak");
    expect(conversation.save).toHaveBeenCalledTimes(1);
    expect(io.emit).toHaveBeenCalledTimes(2);
    expect(io.emit).toHaveBeenCalledWith("conversation:streak-reset", {
      conversationId: conversation._id,
      streak: conversation.streak,
    });
  });

  describe("White-Box: scheduleWorker lifecycle", () => {
    afterEach(() => {
      stopScheduleWorker();
      jest.restoreAllMocks();
    });

    it("TC-SW-11: Khởi động chạy ngay, kiểm tra streak mỗi sáu chu kỳ và dừng timer", async () => {
      mockScheduledMessageFind.mockReturnValue(makeQuery([]));
      mockConversationFind.mockReturnValue(makeQuery([]));
      const setInterval = jest.spyOn(globalThis, "setInterval").mockReturnValue(123);
      const clearInterval = jest.spyOn(globalThis, "clearInterval").mockImplementation(() => {});
      const io = makeIo();

      startScheduleWorker(io);
      await new Promise((resolve) => setImmediate(resolve));

      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 10000);
      expect(mockScheduledMessageFind).toHaveBeenCalledTimes(1);
      expect(mockConversationFind).toHaveBeenCalledTimes(1);
      const callback = setInterval.mock.calls[0][0];
      for (let index = 0; index < 6; index += 1) callback();
      await new Promise((resolve) => setImmediate(resolve));

      expect(mockScheduledMessageFind).toHaveBeenCalledTimes(7);
      expect(mockConversationFind).toHaveBeenCalledTimes(2);

      stopScheduleWorker();
      expect(clearInterval).toHaveBeenCalledWith(123);
      stopScheduleWorker();
      expect(clearInterval).toHaveBeenCalledTimes(1);
    });

    it("TC-SW-12: Khởi động lần nữa sẽ xóa interval cũ trước khi tạo interval mới", async () => {
      mockScheduledMessageFind.mockReturnValue(makeQuery([]));
      mockConversationFind.mockReturnValue(makeQuery([]));
      const setInterval = jest.spyOn(globalThis, "setInterval")
        .mockReturnValueOnce(321)
        .mockReturnValueOnce(654);
      const clearInterval = jest.spyOn(globalThis, "clearInterval").mockImplementation(() => {});

      startScheduleWorker(makeIo());
      await new Promise((resolve) => setImmediate(resolve));
      startScheduleWorker(makeIo());
      await new Promise((resolve) => setImmediate(resolve));

      expect(clearInterval).toHaveBeenCalledWith(321);
      expect(setInterval).toHaveBeenCalledTimes(2);

      stopScheduleWorker();
      expect(clearInterval).toHaveBeenCalledWith(654);
    });
  });

  it("TC-SW-09: Không có io vẫn reset và lưu streak", async () => {
    const conversation = {
      _id: "expired-no-io",
      streak: { count: 1 },
      participants: [{ userId: "u1" }],
      save: jest.fn().mockResolvedValue(true),
    };
    mockConversationFind.mockReturnValue(makeQuery([conversation]));

    await expect(checkAndResetExpiredStreaks()).resolves.toBeUndefined();

    expect(conversation.streak.count).toBe(0);
    expect(conversation.save).toHaveBeenCalledTimes(1);
  });

  it("TC-SW-10: Lỗi truy vấn streak được bắt an toàn", async () => {
    mockConversationFind.mockImplementation(() => {
      throw new Error("conversation query failed");
    });

    await expect(checkAndResetExpiredStreaks(makeIo())).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledWith(
      "[ScheduleWorker] Lỗi khi kiểm tra streak hết hạn:",
      expect.any(Error),
    );
  });
});
