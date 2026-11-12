/**
 * STARTER TEMPLATE — White-Box Testing: scheduleWorker.js
 * Phụ trách: TV5 (GiangTy / ThanhVien5)
 * Kỹ thuật áp dụng: Branch Coverage & Loop Testing (CFG for worker batch processing)
 *
 * HƯỚNG DẪN DÀNH CHO THÀNH VIÊN:
 * 1. Đọc kỹ file mã nguồn: backend/src/services/scheduleWorker.js
 * 2. Hàm trọng tâm: `processScheduledMessages(io)`
 *    - Branch 1: Không có tin nhắn nào đến hạn (pendingMessages rỗng) -> return ngay
 *    - Branch 2: Có tin nhắn nhưng Conversation không tồn tại -> Đánh dấu status="failed", ghi nhận errorReason
 *    - Branch 3: Tin nhắn thường gửi thành công -> Tạo Message, update conversation, emit socket, status="sent"
 *    - Branch 4: Tin nhắn có nhắc tới @NexusAI -> Kích hoạt xử lý AI qua `handleAIResponse`
 *    - Branch 5: Lỗi trong quá trình xử lý 1 tin nhắn -> Catch lỗi từng item, không làm chết worker
 * 3. Hàm kiểm tra Streak: `checkAndResetExpiredStreaks(io)`
 *    - Branch 1: Tìm các hội thoại có streak > 0 nhưng quá hạn -> Reset streak về 0 và emit socket "conversation:streak-reset"
 */

// @ts-nocheck
import { jest } from "@jest/globals";

// Mock các model Mongoose
const mockScheduledMessageFind = jest.fn();
const mockConversationFindById = jest.fn();
const mockConversationFind = jest.fn();
const mockMessageCreate = jest.fn();

jest.unstable_mockModule("../../../backend/src/models/ScheduledMessage.js", () => ({
  default: {
    find: mockScheduledMessageFind,
  },
}));

jest.unstable_mockModule("../../../backend/src/models/Conversation.js", () => ({
  default: {
    findById: mockConversationFindById,
    find: mockConversationFind,
  },
}));

jest.unstable_mockModule("../../../backend/src/models/Message.js", () => ({
  default: {
    create: mockMessageCreate,
  },
}));

// Mock utils
jest.unstable_mockModule("../../../backend/src/utils/messageHelper.js", () => ({
  updateConversationAfterCreateMessage: jest.fn().mockResolvedValue(true),
}));

// Mock AI service
const mockHandleAIResponse = jest.fn().mockResolvedValue(true);
jest.unstable_mockModule("../../../backend/src/services/aiService.js", () => ({
  handleAIResponse: mockHandleAIResponse,
}));

// Import service sau khi đã mock
const { processScheduledMessages, checkAndResetExpiredStreaks } = await import(
  "../../../backend/src/services/scheduleWorker.js"
);

describe("White-Box: scheduleWorker -> processScheduledMessages", () => {
  let mockIo;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIo = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
  });

  // TEST MẪU 1: Không có tin nhắn chờ (Branch 1)
  it("TC-SW-01: Không có tin nhắn nào đến hạn xử lý -> Không thực hiện hành động nào", async () => {
    const mockQuery = {
      limit: jest.fn().mockResolvedValue([]),
    };
    mockScheduledMessageFind.mockReturnValue(mockQuery);

    await processScheduledMessages(mockIo);

    expect(mockConversationFindById).not.toHaveBeenCalled();
    expect(mockMessageCreate).not.toHaveBeenCalled();
  });

  // TEST MẪU 2: Cuộc trò chuyện không tồn tại (Branch 2)
  it("TC-SW-02: Cuộc trò chuyện bị xóa -> Đánh dấu tin nhắn là failed", async () => {
    const fakeScheduled = {
      _id: "sch_1",
      conversationId: "convo_deleted",
      status: "pending",
      save: jest.fn().mockResolvedValue(true),
    };

    const mockQuery = {
      limit: jest.fn().mockResolvedValue([fakeScheduled]),
    };
    mockScheduledMessageFind.mockReturnValue(mockQuery);
    mockConversationFindById.mockResolvedValue(null);

    await processScheduledMessages(mockIo);

    expect(fakeScheduled.status).toBe("failed");
    expect(fakeScheduled.errorReason).toBe("Conversation not found");
    expect(fakeScheduled.save).toHaveBeenCalled();
  });

  // TODO cho thành viên:
  it.todo("TC-SW-03: Tin nhắn hợp lệ -> Tạo bản ghi tin nhắn mới, đánh dấu sent và phát socket");
  it.todo("TC-SW-04: Tin nhắn có nhắc tới @NexusAI -> Kích hoạt handleAIResponse");
  it.todo("TC-SW-05: Lỗi phát sinh trong 1 tin nhắn -> Được catch an toàn, tiếp tục xử lý các tin khác");
});

describe("White-Box: scheduleWorker -> checkAndResetExpiredStreaks", () => {
  it.todo("TC-SW-06: Hội thoại quá hạn streak -> Reset streak về 0 và thông báo socket");
});

