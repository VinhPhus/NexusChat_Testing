/**
 * White-Box Tests — messageHelper.js
 * TV2 (PhuongBao)
 *
 * Coverage:
 *  - getDayDifference(d1, d2)
 *  - getEffectiveStreak(streak)
 *  - updateConversationAfterCreateMessage — finalContent logic (8 branches)
 */

import { jest } from "@jest/globals";

// ─── Mock Message model (used inside updateConversationAfterCreateMessage) ───
const mockMessageFind = jest.fn();

jest.unstable_mockModule("../../../backend/src/models/Message.js", () => ({
  default: {
    find: mockMessageFind,
  },
}));

// ─── Import SUT after mocks ───────────────────────────────────────────────────
const {
  getDayDifference,
  getEffectiveStreak,
  updateConversationAfterCreateMessage,
} = await import("../../../backend/src/utils/messageHelper.js");

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build a minimal conversation stub for updateConversationAfterCreateMessage
// ─────────────────────────────────────────────────────────────────────────────
function makeConversation(overrides = {}) {
  const unreadCounts = new Map();
  return {
    type: "direct",
    _id: "conv123",
    participants: [
      { userId: "user-a" },
      { userId: "user-b" },
    ],
    unreadCounts,
    streak: null,
    set(fields) {
      Object.assign(this, fields);
    },
    markModified: jest.fn(),
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. getDayDifference
// ─────────────────────────────────────────────────────────────────────────────
describe("getDayDifference", () => {
  it("TC-DD-01: d1 null → trả về 0", () => {
    expect(getDayDifference(null, new Date())).toBe(0);
  });

  it("TC-DD-02: d2 null → trả về 0", () => {
    expect(getDayDifference(new Date(), null)).toBe(0);
  });

  it("TC-DD-03: Cùng ngày → 0", () => {
    const d = new Date("2024-05-10T08:00:00Z");
    expect(getDayDifference(d, d)).toBe(0);
  });

  it("TC-DD-04: d2 sau d1 đúng 1 ngày → 1", () => {
    const d1 = new Date("2024-05-10T08:00:00Z");
    const d2 = new Date("2024-05-11T08:00:00Z");
    expect(getDayDifference(d1, d2)).toBe(1);
  });

  it("TC-DD-05: d2 sau d1 đúng 2 ngày → 2", () => {
    const d1 = new Date("2024-05-10T08:00:00Z");
    const d2 = new Date("2024-05-12T08:00:00Z");
    expect(getDayDifference(d1, d2)).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. getEffectiveStreak
// ─────────────────────────────────────────────────────────────────────────────
describe("getEffectiveStreak", () => {
  const ZERO_RESULT = { count: 0, lastMessageDate: null, senders: [], isBothMessaged: false };

  it("TC-GS-01: streak null → {count:0, ...}", () => {
    expect(getEffectiveStreak(null)).toEqual(ZERO_RESULT);
  });

  it("TC-GS-01b: streak undefined → {count:0, ...}", () => {
    expect(getEffectiveStreak(undefined)).toEqual(ZERO_RESULT);
  });

  it("TC-GS-02: streak.count = 0 → {count:0, ...}", () => {
    const streak = { count: 0, lastMessageDate: new Date(), isBothMessaged: true, senders: ["a"] };
    expect(getEffectiveStreak(streak)).toEqual(ZERO_RESULT);
  });

  it("TC-GS-03: lastMessageDate = null → {count:0, ...}", () => {
    const streak = { count: 5, lastMessageDate: null, isBothMessaged: true, senders: ["a"] };
    expect(getEffectiveStreak(streak)).toEqual(ZERO_RESULT);
  });

  it("TC-GS-04: dayDiff >= 2 (chuỗi đứt) → count về 0, giữ lastMessageDate", () => {
    const oldDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 ngày trước
    const streak = { count: 7, lastMessageDate: oldDate, isBothMessaged: true, senders: ["a", "b"] };
    const result = getEffectiveStreak(streak);
    expect(result.count).toBe(0);
    expect(result.senders).toEqual([]);
    expect(result.isBothMessaged).toBe(false);
    expect(result.lastMessageDate).toBe(oldDate);
  });

  it("TC-GS-05: dayDiff = 1 (sang ngày mới) → giữ count, isBothMessaged = false, senders = []", () => {
    // Set lastMessageDate to yesterday midnight UTC so dayDiff = 1 regardless of time-of-day
    const now = new Date();
    const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    const streak = { count: 5, lastMessageDate: yesterday, isBothMessaged: true, senders: ["a", "b"] };
    const result = getEffectiveStreak(streak);
    expect(result.count).toBe(5);
    expect(result.isBothMessaged).toBe(false);
    expect(result.senders).toEqual([]);
  });

  it("TC-GS-06: dayDiff = 0 (cùng ngày) → trả về streak hiện tại (count, senders, isBothMessaged)", () => {
    const today = new Date();
    const streak = {
      count: 3,
      lastMessageDate: today,
      isBothMessaged: true,
      senders: ["a", "b"],
    };
    const result = getEffectiveStreak(streak);
    expect(result.count).toBe(3);
    expect(result.isBothMessaged).toBe(true);
    expect(result.senders).toEqual(["a", "b"]);
  });

  it("TC-GS-07: senders không phải mảng thì trả về mảng rỗng", () => {
    const streak = {
      count: 3,
      lastMessageDate: new Date(),
      isBothMessaged: true,
      senders: "user-a",
    };

    expect(getEffectiveStreak(streak)).toEqual({
      count: 3,
      lastMessageDate: streak.lastMessageDate,
      senders: [],
      isBothMessaged: true,
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. updateConversationAfterCreateMessage — finalContent logic (8 branches)
// ─────────────────────────────────────────────────────────────────────────────
describe("updateConversationAfterCreateMessage — finalContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: Message.find returns empty array (no messages today)
    mockMessageFind.mockResolvedValue([]);
  });

  /**
   * Helper: runs updateConversationAfterCreateMessage and returns the value
   * stored in conversation.lastMessage.content (= finalContent).
   */
  async function getFinalContent(messageOverrides) {
    const conversation = makeConversation();
    const message = {
      _id: "msg1",
      createdAt: new Date(),
      content: undefined,
      isViewOnce: false,
      fileUrl: undefined,
      imgUrl: undefined,
      audioUrl: undefined,
      poll: undefined,
      sharedContact: undefined,
      ...messageOverrides,
    };
    // Patch Message.find to return proper chainable object
    mockMessageFind.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });
    await updateConversationAfterCreateMessage(conversation, message, "user-a");
    return conversation.lastMessage.content;
  }

  it("Branch 1: content có text thường → content gốc", async () => {
    const result = await getFinalContent({ content: "Xin chào!" });
    expect(result).toBe("Xin chào!");
  });

  it("Branch 2: isViewOnce = true → '[Tin nhắn xem một lần]'", async () => {
    const result = await getFinalContent({ isViewOnce: true, content: "bí mật" });
    expect(result).toBe("[Tin nhắn xem một lần]");
  });

  it("Branch 3: content rỗng + fileUrl → 'Đã gửi tệp tin'", async () => {
    const result = await getFinalContent({ fileUrl: "https://file.url/doc.pdf" });
    expect(result).toBe("Đã gửi tệp tin");
  });

  it("Branch 4: content rỗng + imgUrl → 'Đã gửi 1 ảnh'", async () => {
    const result = await getFinalContent({ imgUrl: "https://img.url/photo.jpg" });
    expect(result).toBe("Đã gửi 1 ảnh");
  });

  it("Branch 5: content rỗng + audioUrl → 'Đã gửi tin nhắn thoại'", async () => {
    const result = await getFinalContent({ audioUrl: "https://audio.url/voice.mp3" });
    expect(result).toBe("Đã gửi tin nhắn thoại");
  });

  it("Branch 6: content rỗng + poll với options → 'Đã tạo một bình chọn'", async () => {
    const result = await getFinalContent({
      poll: { options: [{ text: "Lựa chọn A", votes: [] }, { text: "Lựa chọn B", votes: [] }] },
    });
    expect(result).toBe("Đã tạo một bình chọn");
  });

  it("Branch 7: content rỗng + sharedContact → 'Đã chia sẻ 1 liên hệ'", async () => {
    const result = await getFinalContent({ sharedContact: { _id: "contact1" } });
    expect(result).toBe("Đã chia sẻ 1 liên hệ");
  });

  it("Branch 8: content rỗng hoàn toàn → ''", async () => {
    const result = await getFinalContent({});
    expect(result).toBe("");
  });
});

describe("updateConversationAfterCreateMessage — unread counts and streak", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMessageFind.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });
  });

  async function updateWithStreak(streak, todayMessages = []) {
    mockMessageFind.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(todayMessages),
    });
    const conversation = makeConversation({ streak });
    const message = { _id: "msg1", createdAt: new Date(), content: "Hi" };
    await updateConversationAfterCreateMessage(conversation, message, "user-a");
    return conversation;
  }

  it("TC-UC-01: Reset unread count sender, tăng recipient và đánh dấu streak thay đổi", async () => {
    const unreadCounts = new Map([
      ["user-a", 4],
      ["user-b", 2],
    ]);
    const conversation = makeConversation({ unreadCounts });
    mockMessageFind.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });

    await updateConversationAfterCreateMessage(
      conversation,
      { _id: "msg1", createdAt: new Date(), content: "Hi" },
      "user-a"
    );

    expect(unreadCounts.get("user-a")).toBe(0);
    expect(unreadCounts.get("user-b")).toBe(3);
    expect(conversation.markModified).toHaveBeenCalledWith("streak");
    expect(conversation.streak.count).toBe(1);
  });

  it("TC-UC-02: Không có streak trước đó thì bắt đầu từ 1", async () => {
    const conversation = await updateWithStreak(null);

    expect(conversation.streak.count).toBe(1);
    expect(conversation.streak.isBothMessaged).toBe(false);
  });

  it("TC-UC-03: Streak cũ từ hai ngày trở lên bắt đầu lại từ 1", async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 3);
    const conversation = await updateWithStreak({
      count: 8,
      lastMessageDate: oldDate,
      senders: [],
      isBothMessaged: false,
    });

    expect(conversation.streak.count).toBe(1);
  });

  it("TC-UC-04: Ngày kế tiếp tăng streak khi cả hai thành viên đã nhắn", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const conversation = await updateWithStreak(
      { count: 4, lastMessageDate: yesterday, senders: [], isBothMessaged: false },
      [{ senderId: "user-b" }]
    );

    expect(conversation.streak.count).toBe(5);
    expect(conversation.streak.isBothMessaged).toBe(true);
  });

  it("TC-UC-05: Ngày kế tiếp giữ streak nếu người còn lại chưa nhắn", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const conversation = await updateWithStreak({
      count: 4,
      lastMessageDate: yesterday,
      senders: [],
      isBothMessaged: false,
    });

    expect(conversation.streak.count).toBe(4);
    expect(conversation.streak.isBothMessaged).toBe(false);
  });

  it("TC-UC-06: Cùng ngày giữ streak hiện tại", async () => {
    const conversation = await updateWithStreak({
      count: 4,
      lastMessageDate: new Date(),
      senders: [],
      isBothMessaged: false,
    });

    expect(conversation.streak.count).toBe(4);
  });

  it("TC-UC-07: Tin nhắn nhóm cập nhật last message nhưng không truy vấn hay đổi streak", async () => {
    const conversation = makeConversation({
      type: "group",
      streak: { count: 7, lastMessageDate: new Date("2024-01-01") },
    });
    const message = { _id: "msg1", createdAt: new Date(), content: "Group message" };

    await updateConversationAfterCreateMessage(conversation, message, "user-a");

    expect(conversation.lastMessage.content).toBe("Group message");
    expect(conversation.streak.count).toBe(7);
    expect(mockMessageFind).not.toHaveBeenCalled();
    expect(conversation.markModified).not.toHaveBeenCalled();
  });

  it("TC-UC-08: Hỗ trợ unreadCounts dạng object và các dạng participant ID", async () => {
    const conversation = makeConversation({
      participants: [
        { userId: { _id: "user-a" } },
        { _id: "user-b" },
      ],
      unreadCounts: { "user-a": 3, "user-b": 2 },
      streak: {
        count: 2,
        lastMessageDate: new Date(),
        toObject() {
          return { count: 2, lastMessageDate: this.lastMessageDate };
        },
      },
      markModified: undefined,
    });

    await updateConversationAfterCreateMessage(
      conversation,
      { _id: "msg1", createdAt: new Date(), content: "Hi" },
      "user-a"
    );

    expect(conversation.lastMessage.senderId).toBe("user-a");
    expect(conversation.streak.isBothMessaged).toBe(false);
    expect(conversation.markModified).toBeUndefined();
  });

  it("TC-UC-09: Một participant không được coi là cả hai bên đã nhắn", async () => {
    const conversation = makeConversation({
      participants: [{ userId: "user-a" }],
      streak: { count: 2, lastMessageDate: new Date() },
    });

    await updateConversationAfterCreateMessage(
      conversation,
      { _id: "msg1", createdAt: new Date(), content: "Hi" },
      "user-a"
    );

    expect(conversation.streak.isBothMessaged).toBe(false);
    expect(conversation.streak.count).toBe(2);
  });
});
