/**
 * STARTER TEMPLATE — White-Box Testing: friendMiddleware.js
 * Phụ trách: TV3 (TrungChien)
 * Kỹ thuật áp dụng: Branch Coverage & Condition Coverage (CFG)
 *
 * HƯỚNG DẪN DÀNH CHO THÀNH VIÊN:
 * 1. Đọc kỹ file mã nguồn: backend/src/middlewares/friendMiddleware.js
 * 2. Xác định các nhánh quyết định trong hàm `checkFriendship`:
 *    - Nhánh 1: Không có recipientId và memberIds rỗng -> 400
 *    - Nhánh 2: recipientId trùng với me (tự chat với mình) -> 400
 *    - Nhánh 3: Chưa kết bạn (Friend.findOne trả về null) -> 403
 *    - Nhánh 4: Người gửi đã chặn người nhận (sender.blockedUsers) -> 403
 *    - Nhánh 5: Người nhận đã chặn người gửi (recipient.blockedUsers) -> 403
 *    - Nhánh 6: Kiểm tra bạn bè thành công với 1-1 -> gọi next()
 *    - Nhánh 7: Kiểm tra nhóm chat (memberIds): có thành viên chưa kết bạn -> 403
 *    - Nhánh 8: Kiểm tra nhóm chat: có thành viên bị chặn -> 403
 *    - Nhánh 9: Kiểm tra nhóm chat hợp lệ -> gọi next()
 * 3. Hoàn thiện các bài test còn lại bên dưới.
 */

// @ts-nocheck
import { jest } from "@jest/globals";

// ─── Mock các dependencies Mongoose trước khi import middleware ──────────────
const mockFriendFindOne = jest.fn();
const mockUserFindById = jest.fn();
const mockConversationFindOne = jest.fn();

jest.unstable_mockModule("../../../backend/src/models/Friend.js", () => ({
  default: {
    findOne: mockFriendFindOne,
  },
}));

jest.unstable_mockModule("../../../backend/src/models/User.js", () => ({
  default: {
    findById: mockUserFindById,
  },
}));

jest.unstable_mockModule("../../../backend/src/models/Conversation.js", () => ({
  default: {
    findOne: mockConversationFindOne,
  },
}));

// ─── Import middleware sau khi đã mock ─────────────────────────────────────────
const { checkFriendship } = await import(
  "../../../backend/src/middlewares/friendMiddleware.js"
);

// ─── Helper tạo mock req/res/next ──────────────────────────────────────────────
const makeReq = (user = { _id: "userA" }, body = {}) => ({
  user,
  body,
});

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("White-Box: friendMiddleware -> checkFriendship", () => {
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFriendFindOne.mockReset();
    mockUserFindById.mockReset();
    mockConversationFindOne.mockReset();
    next = jest.fn();
  });

  // TEST MẪU 1: Kiểm tra nhánh thiếu dữ liệu (Branch 1)
  it("TC-FM-01: Không có recipientId và memberIds rỗng -> Trả về 400", async () => {
    const req = makeReq({ _id: "userA" }, {});
    const res = makeRes();

    await checkFriendship(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Cần cung cấp recipientId hoặc memberIds",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  // TEST MẪU 2: Nhánh tự tạo cuộc trò chuyện với chính mình (Branch 2)
  it("TC-FM-02: recipientId trùng với ID người dùng hiện tại -> Trả về 400", async () => {
    const req = makeReq({ _id: "userA" }, { recipientId: "userA" });
    const res = makeRes();

    await checkFriendship(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Không thể tạo cuộc trò chuyện với chính mình",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  // TODO cho thành viên: Viết tiếp các test case để đạt 100% Branch Coverage
  it.todo("TC-FM-03: recipientId hợp lệ nhưng chưa kết bạn -> Trả về 403");
  it.todo("TC-FM-04: Đã kết bạn nhưng sender đã chặn recipient -> Trả về 403");
  it.todo("TC-FM-05: Đã kết bạn nhưng recipient đã chặn sender -> Trả về 403");
  it.todo("TC-FM-06: 1-1 chat hợp lệ (là bạn, không bị chặn) -> Gọi next()");
  it.todo("TC-FM-07: Group chat có 1 thành viên chưa kết bạn -> Trả về 403");
  it.todo("TC-FM-08: Group chat hợp lệ toàn bộ thành viên -> Gọi next()");
  it.todo("TC-FM-09: Lỗi exception trong quá trình truy vấn DB -> Trả về 500");
});

