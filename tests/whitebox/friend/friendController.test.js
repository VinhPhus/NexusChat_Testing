/**
 * White-Box Tests: friendController.js
 * TV3 (TrungChien)
 *
 * Covers:
 *  - sendFriendRequest()   TC-FR-01 to TC-FR-06
 *  - acceptFriendRequest() TC-AF-01 to TC-AF-03
 *  - declineFriendRequest() (rejectFriendRequest)
 *  - removeFriend()        (unfriend)
 */

import { jest } from "@jest/globals";

// ─── Mock modules (must be hoisted before any import) ───────────────────────
const mockFriendFindOne = jest.fn();
const mockFriendCreate = jest.fn();
const mockFriendFindOneAndDelete = jest.fn();

const mockFriendRequestFindOne = jest.fn();
const mockFriendRequestCreate = jest.fn();
const mockFriendRequestFindById = jest.fn();
const mockFriendRequestFindByIdAndDelete = jest.fn();

const mockUserExists = jest.fn();
const mockUserFindById = jest.fn();

const mockConversationFindOne = jest.fn();

jest.unstable_mockModule(
  "../../../backend/src/models/Friend.js",
  () => ({
    default: {
      findOne: mockFriendFindOne,
      create: mockFriendCreate,
      findOneAndDelete: mockFriendFindOneAndDelete,
    },
  })
);

jest.unstable_mockModule(
  "../../../backend/src/models/FriendRequest.js",
  () => ({
    default: {
      findOne: mockFriendRequestFindOne,
      create: mockFriendRequestCreate,
      findById: mockFriendRequestFindById,
      findByIdAndDelete: mockFriendRequestFindByIdAndDelete,
    },
  })
);

jest.unstable_mockModule(
  "../../../backend/src/models/User.js",
  () => ({
    default: {
      exists: mockUserExists,
      findById: mockUserFindById,
    },
  })
);

jest.unstable_mockModule(
  "../../../backend/src/models/Conversation.js",
  () => ({
    default: {
      findOne: mockConversationFindOne,
    },
  })
);

jest.unstable_mockModule("mongoose", () => ({
  default: {
    Types: {
      ObjectId: jest.fn((id) => id),
    },
  },
}));

// ─── Import after mocks ──────────────────────────────────────────────────────
let sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend;

beforeAll(async () => {
  const mod = await import(
    "../../../backend/src/controllers/friendController.js"
  );
  sendFriendRequest = mod.sendFriendRequest;
  acceptFriendRequest = mod.acceptFriendRequest;
  declineFriendRequest = mod.declineFriendRequest;
  removeFriend = mod.removeFriend;
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const mockIo = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

const buildReq = (overrides = {}) => ({
  user: { _id: "user-aaa" },
  body: {},
  params: {},
  app: { get: jest.fn(() => mockIo) },
  ...overrides,
});

const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

// ─── sendFriendRequest ────────────────────────────────────────────────────────
describe("sendFriendRequest()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-FR-01: from === to → 400 Không thể gửi lời mời kết bạn cho chính mình", async () => {
    const req = buildReq({
      user: { _id: "same-id" },
      body: { to: "same-id", message: "" },
    });
    const res = buildRes();

    await sendFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("chính mình"),
      })
    );
  });

  it("TC-FR-02: User 'to' không tồn tại → 404", async () => {
    mockUserExists.mockResolvedValue(null);

    const req = buildReq({
      user: { _id: "user-aaa" },
      body: { to: "user-bbb", message: "" },
    });
    const res = buildRes();

    await sendFriendRequest(req, res);

    expect(mockUserExists).toHaveBeenCalledWith({ _id: "user-bbb" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("không tồn tại") })
    );
  });

  it("TC-FR-03: Đã là bạn (alreadyFriends) → 400", async () => {
    mockUserExists.mockResolvedValue({ _id: "user-bbb" });
    mockFriendFindOne.mockResolvedValue({ userA: "user-aaa", userB: "user-bbb" });
    mockFriendRequestFindOne.mockResolvedValue(null);

    const req = buildReq({
      user: { _id: "user-aaa" },
      body: { to: "user-bbb", message: "" },
    });
    const res = buildRes();

    await sendFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("bạn bè") })
    );
  });

  it("TC-FR-04: Đã có lời mời kết bạn đang chờ → 400", async () => {
    mockUserExists.mockResolvedValue({ _id: "user-bbb" });
    mockFriendFindOne.mockResolvedValue(null);
    mockFriendRequestFindOne.mockResolvedValue({ from: "user-aaa", to: "user-bbb" });

    const req = buildReq({
      user: { _id: "user-aaa" },
      body: { to: "user-bbb", message: "" },
    });
    const res = buildRes();

    await sendFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("đang chờ") })
    );
  });

  it("TC-FR-05: Thành công → 201, gọi io.emit", async () => {
    const fakeRequest = { _id: "req-001", from: "user-aaa", to: "user-bbb" };
    mockUserExists.mockResolvedValue({ _id: "user-bbb" });
    mockFriendFindOne.mockResolvedValue(null);
    mockFriendRequestFindOne.mockResolvedValue(null);
    mockFriendRequestCreate.mockResolvedValue(fakeRequest);

    const req = buildReq({
      user: { _id: "user-aaa" },
      body: { to: "user-bbb", message: "Kết bạn nhé!" },
    });
    const res = buildRes();

    await sendFriendRequest(req, res);

    expect(mockFriendRequestCreate).toHaveBeenCalledWith({
      from: "user-aaa",
      to: "user-bbb",
      message: "Kết bạn nhé!",
    });
    expect(mockIo.emit).toHaveBeenCalledWith("friend-request:new", fakeRequest);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ request: fakeRequest })
    );
  });

  it("TC-FR-06: Thành công khi a > b → userA/userB được swap đúng", async () => {
    // "user-zzz" > "user-aaa" lexicographically → swap: userA="user-aaa", userB="user-zzz"
    const fakeRequest = { _id: "req-002", from: "user-zzz", to: "user-aaa" };
    mockUserExists.mockResolvedValue({ _id: "user-aaa" });
    mockFriendFindOne.mockResolvedValue(null);
    mockFriendRequestFindOne.mockResolvedValue(null);
    mockFriendRequestCreate.mockResolvedValue(fakeRequest);

    const req = buildReq({
      user: { _id: "user-zzz" },
      body: { to: "user-aaa", message: "" },
    });
    const res = buildRes();

    await sendFriendRequest(req, res);

    // Friend.findOne phải được gọi với userA < userB
    expect(mockFriendFindOne).toHaveBeenCalledWith({
      userA: "user-aaa",
      userB: "user-zzz",
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ─── acceptFriendRequest ──────────────────────────────────────────────────────
describe("acceptFriendRequest()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-AF-01: requestId không tìm thấy → 404", async () => {
    mockFriendRequestFindById.mockResolvedValue(null);

    const req = buildReq({
      user: { _id: "user-bbb" },
      params: { requestId: "nonexistent-id" },
    });
    const res = buildRes();

    await acceptFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Không tìm thấy") })
    );
  });

  it("TC-AF-02: Người nhận không phải là 'to' → 403", async () => {
    mockFriendRequestFindById.mockResolvedValue({
      _id: "req-001",
      from: { toString: () => "user-aaa" },
      to: { toString: () => "user-bbb" },
    });

    const req = buildReq({
      user: { _id: "user-ccc" }, // not the recipient
      params: { requestId: "req-001" },
    });
    const res = buildRes();

    await acceptFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("không có quyền"),
      })
    );
  });

  it("TC-AF-03: Thành công → tạo Friend, xóa FriendRequest, trả về 200", async () => {
    const fakeRequest = {
      _id: "req-001",
      from: { toString: () => "user-aaa" },
      to: { toString: () => "user-bbb" },
    };
    const fakeFriend = { _id: "friend-001", userA: "user-aaa", userB: "user-bbb" };
    const fakeUser = { _id: "user-aaa", displayName: "Alice", avatarUrl: "avatar.png" };

    mockFriendRequestFindById.mockResolvedValue(fakeRequest);
    mockFriendCreate.mockResolvedValue(fakeFriend);
    mockFriendRequestFindByIdAndDelete.mockResolvedValue(fakeRequest);
    mockUserFindById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(fakeUser),
    });

    const req = buildReq({
      user: { _id: "user-bbb" },
      params: { requestId: "req-001" },
    });
    const res = buildRes();

    await acceptFriendRequest(req, res);

    expect(mockFriendCreate).toHaveBeenCalledWith({
      userA: fakeRequest.from,
      userB: fakeRequest.to,
    });
    expect(mockFriendRequestFindByIdAndDelete).toHaveBeenCalledWith("req-001");
    expect(mockIo.emit).toHaveBeenCalledWith("friend-request:accepted", fakeFriend);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("thành công"),
        newFriend: expect.objectContaining({ displayName: "Alice" }),
      })
    );
  });
});

// ─── declineFriendRequest (rejectFriendRequest) ───────────────────────────────
describe("declineFriendRequest()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Không tìm thấy request → 404", async () => {
    mockFriendRequestFindById.mockResolvedValue(null);

    const req = buildReq({
      user: { _id: "user-bbb" },
      params: { requestId: "bad-id" },
    });
    const res = buildRes();

    await declineFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("Không phải người nhận (cũng không phải người gửi) → 403", async () => {
    mockFriendRequestFindById.mockResolvedValue({
      _id: "req-001",
      from: { toString: () => "user-aaa" },
      to: { toString: () => "user-bbb" },
    });

    const req = buildReq({
      user: { _id: "user-ccc" },
      params: { requestId: "req-001" },
    });
    const res = buildRes();

    await declineFriendRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("Thành công (người nhận từ chối) → 204", async () => {
    const fakeRequest = {
      _id: "req-001",
      from: { toString: () => "user-aaa" },
      to: { toString: () => "user-bbb" },
    };
    mockFriendRequestFindById.mockResolvedValue(fakeRequest);
    mockFriendRequestFindByIdAndDelete.mockResolvedValue(fakeRequest);

    const req = buildReq({
      user: { _id: "user-bbb" },
      params: { requestId: "req-001" },
    });
    const res = buildRes();

    await declineFriendRequest(req, res);

    expect(mockFriendRequestFindByIdAndDelete).toHaveBeenCalledWith("req-001");
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it("Thành công (người gửi hủy lời mời) → 204", async () => {
    const fakeRequest = {
      _id: "req-002",
      from: { toString: () => "user-aaa" },
      to: { toString: () => "user-bbb" },
    };
    mockFriendRequestFindById.mockResolvedValue(fakeRequest);
    mockFriendRequestFindByIdAndDelete.mockResolvedValue(fakeRequest);

    const req = buildReq({
      user: { _id: "user-aaa" }, // sender cancels
      params: { requestId: "req-002" },
    });
    const res = buildRes();

    await declineFriendRequest(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });
});

// ─── removeFriend (unfriend) ──────────────────────────────────────────────────
describe("removeFriend()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Chưa là bạn (Friend không tồn tại) → 404", async () => {
    mockFriendFindOneAndDelete.mockResolvedValue(null);

    const req = buildReq({
      user: { _id: "user-aaa" },
      params: { friendId: "user-bbb" },
    });
    const res = buildRes();

    await removeFriend(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Không tìm thấy") })
    );
  });

  it("Thành công → xóa Friend, emit socket, 200", async () => {
    const fakeFriend = { _id: "friend-001", userA: "user-aaa", userB: "user-bbb" };
    mockFriendFindOneAndDelete.mockResolvedValue(fakeFriend);
    // No direct conversation found (streak reset branch skipped cleanly)
    mockConversationFindOne.mockResolvedValue(null);

    const req = buildReq({
      user: { _id: "user-aaa" },
      params: { friendId: "user-bbb" },
    });
    const res = buildRes();

    await removeFriend(req, res);

    expect(mockFriendFindOneAndDelete).toHaveBeenCalled();
    expect(mockIo.emit).toHaveBeenCalledWith(
      "friend:removed",
      expect.objectContaining({ friendId: "user-bbb" })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("thành công") })
    );
  });

  it("Thành công + có conversation → reset streak và emit streak-reset", async () => {
    const fakeFriend = { _id: "friend-001", userA: "user-aaa", userB: "user-bbb" };
    const fakeConv = {
      _id: "conv-001",
      streak: {},
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };
    mockFriendFindOneAndDelete.mockResolvedValue(fakeFriend);
    mockConversationFindOne.mockResolvedValue(fakeConv);

    const req = buildReq({
      user: { _id: "user-aaa" },
      params: { friendId: "user-bbb" },
    });
    const res = buildRes();

    await removeFriend(req, res);

    expect(fakeConv.save).toHaveBeenCalled();
    expect(mockIo.emit).toHaveBeenCalledWith(
      "conversation:streak-reset",
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("Thiếu friendId → 400", async () => {
    const req = buildReq({
      user: { _id: "user-aaa" },
      params: { friendId: undefined },
    });
    const res = buildRes();

    await removeFriend(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
