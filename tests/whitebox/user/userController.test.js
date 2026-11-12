/**
 * White-Box Testing: userController.js
 * Phụ trách: TV4 (User & Services)
 * Kỹ thuật áp dụng: Branch Coverage, Statement Coverage, Boundary Value Analysis, Exception Handling
 */

// @ts-nocheck
import { jest } from "@jest/globals";

// Mock các hàm của model User
const mockUserFind = jest.fn();
const mockUserFindById = jest.fn();
const mockUserFindByIdAndUpdate = jest.fn();
const mockUserCountDocuments = jest.fn();
const mockUserDeleteOne = jest.fn();

jest.unstable_mockModule("../../../backend/src/models/User.js", () => ({
  default: {
    find: mockUserFind,
    findById: mockUserFindById,
    findByIdAndUpdate: mockUserFindByIdAndUpdate,
    countDocuments: mockUserCountDocuments,
    deleteOne: mockUserDeleteOne,
  },
}));

// Mock Otp model
const mockOtpFindOne = jest.fn();
const mockOtpDeleteMany = jest.fn();
jest.unstable_mockModule("../../../backend/src/models/Otp.js", () => ({
  default: {
    findOne: mockOtpFindOne,
    deleteMany: mockOtpDeleteMany,
  },
}));

// Mock Session model
const mockSessionDeleteMany = jest.fn();
jest.unstable_mockModule("../../../backend/src/models/Session.js", () => ({
  default: {
    deleteMany: mockSessionDeleteMany,
  },
}));

// Mock Conversation model
const mockConvoFind = jest.fn();
const mockConvoFindById = jest.fn();
const mockConvoUpdateMany = jest.fn();
jest.unstable_mockModule("../../../backend/src/models/Conversation.js", () => ({
  default: {
    find: mockConvoFind,
    findById: mockConvoFindById,
    updateMany: mockConvoUpdateMany,
  },
}));

// Mock Friend model
const mockFriendDeleteMany = jest.fn();
jest.unstable_mockModule("../../../backend/src/models/Friend.js", () => ({
  default: {
    deleteMany: mockFriendDeleteMany,
  },
}));

// Mock FriendRequest model
const mockFriendRequestDeleteMany = jest.fn();
jest.unstable_mockModule("../../../backend/src/models/FriendRequest.js", () => ({
  default: {
    deleteMany: mockFriendRequestDeleteMany,
  },
}));

// Mock bcrypt
const mockBcryptHash = jest.fn();
jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: mockBcryptHash,
    compare: jest.fn(),
  },
}));

// Mock cloudinary
jest.unstable_mockModule("../../../backend/src/libs/cloudinary.js", () => ({
  default: {
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

// Import controller sau khi đã mock tất cả phụ thuộc
const {
  searchUserByUsername,
  authMe,
  getUserCount,
  changePasswordWithOtp,
  deleteAccountWithOtp,
} = await import("../../../backend/src/controllers/userController.js");

// Helper tạo mock Response
const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("White-Box: userController -> searchUserByUsername", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-US-01: Từ khóa rỗng -> 400
  it("TC-US-01: Từ khóa tìm kiếm rỗng -> Trả về 400", async () => {
    const req = { query: { username: "" } };
    const res = makeRes();

    await searchUserByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Thiếu từ khóa tìm kiếm",
    });
  });

  // TC-US-02: Không tìm thấy người dùng -> 404
  it("TC-US-02: Không tìm thấy người dùng nào phù hợp -> Trả về 404", async () => {
    const req = { query: { username: "nonexistent_user" } };
    const res = makeRes();

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    };
    mockUserFind.mockReturnValue(mockQuery);

    await searchUserByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Không tìm thấy người dùng",
    });
  });

  // TC-US-03: Tìm thấy người dùng -> 200
  it("TC-US-03: Tìm thấy người dùng -> Trả về danh sách users kèm HTTP 200", async () => {
    const req = { query: { username: "duy" } };
    const res = makeRes();

    const mockUsers = [
      { _id: "u1", username: "nhatduy", displayName: "Nhật Duy" },
    ];
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockUsers),
    };
    mockUserFind.mockReturnValue(mockQuery);

    await searchUserByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ users: mockUsers });
  });

  // TC-US-04: Lỗi DB -> 500
  it("TC-US-04: Lỗi kết nối DB trong quá trình truy vấn -> Trả về 500", async () => {
    const req = { query: { username: "error_trigger" } };
    const res = makeRes();

    mockUserFind.mockImplementation(() => {
      throw new Error("DB Crash");
    });

    await searchUserByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống" });
  });
});

describe("White-Box: userController -> changePasswordWithOtp", () => {
  const baseReq = {
    user: { _id: "uid_123", email: "user@example.com" },
    body: {
      otp: "123456",
      newPassword: "Password123",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-CP-01: Thiếu otp hoặc newPassword
  it("TC-CP-01: Thiếu mã OTP hoặc mật khẩu mới -> Trả về 400", async () => {
    const req1 = { user: baseReq.user, body: { otp: "", newPassword: "Password123" } };
    const res1 = makeRes();
    await changePasswordWithOtp(req1, res1);
    expect(res1.status).toHaveBeenCalledWith(400);
    expect(res1.json).toHaveBeenCalledWith({ message: "Thiếu mã OTP hoặc mật khẩu mới" });

    const req2 = { user: baseReq.user, body: { otp: "123456", newPassword: "" } };
    const res2 = makeRes();
    await changePasswordWithOtp(req2, res2);
    expect(res2.status).toHaveBeenCalledWith(400);
    expect(res2.json).toHaveBeenCalledWith({ message: "Thiếu mã OTP hoặc mật khẩu mới" });
  });

  // TC-CP-02: Mật khẩu < 6 ký tự
  it("TC-CP-02: Mật khẩu mới có ít hơn 6 ký tự -> Trả về 400", async () => {
    const req = { user: baseReq.user, body: { otp: "123456", newPassword: "Pass1" } };
    const res = makeRes();
    await changePasswordWithOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
  });

  // TC-CP-03: Mật khẩu thiếu chữ hoa
  it("TC-CP-03: Mật khẩu mới không chứa chữ hoa -> Trả về 400", async () => {
    const req = { user: baseReq.user, body: { otp: "123456", newPassword: "password123" } };
    const res = makeRes();
    await changePasswordWithOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z)" });
  });

  // TC-CP-04: Mật khẩu thiếu chữ thường
  it("TC-CP-04: Mật khẩu mới không chứa chữ thường -> Trả về 400", async () => {
    const req = { user: baseReq.user, body: { otp: "123456", newPassword: "PASSWORD123" } };
    const res = makeRes();
    await changePasswordWithOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Mật khẩu phải chứa ít nhất 1 chữ thường (a-z)" });
  });

  // TC-CP-05: Mật khẩu thiếu chữ số
  it("TC-CP-05: Mật khẩu mới không chứa chữ số -> Trả về 400", async () => {
    const req = { user: baseReq.user, body: { otp: "123456", newPassword: "PasswordXyz" } };
    const res = makeRes();
    await changePasswordWithOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Mật khẩu phải chứa ít nhất 1 chữ số (0-9)" });
  });

  // TC-CP-06: OTP sai hoặc hết hạn
  it("TC-CP-06: Mã OTP không chính xác hoặc đã hết hạn -> Trả về 400", async () => {
    const req = { ...baseReq };
    const res = makeRes();

    mockOtpFindOne.mockResolvedValueOnce(null);

    await changePasswordWithOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Mã OTP không chính xác hoặc đã hết hạn" });
  });

  // TC-CP-07: Không tìm thấy User trong Database
  it("TC-CP-07: Không tìm thấy người dùng theo userId -> Trả về 404", async () => {
    const req = { ...baseReq };
    const res = makeRes();

    mockOtpFindOne.mockResolvedValueOnce({ _id: "otp_1" });
    mockUserFindById.mockResolvedValueOnce(null);

    await changePasswordWithOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy người dùng" });
  });

  // TC-CP-08: Đổi mật khẩu thành công
  it("TC-CP-08: Thông tin hợp lệ -> Đổi mật khẩu thành công và trả về 200", async () => {
    const req = { ...baseReq };
    const res = makeRes();

    const mockUserInstance = {
      _id: "uid_123",
      hashedPassword: "old_hash",
      save: jest.fn().mockResolvedValue(true),
    };

    mockOtpFindOne.mockResolvedValueOnce({ _id: "otp_1" });
    mockUserFindById.mockResolvedValueOnce(mockUserInstance);
    mockBcryptHash.mockResolvedValueOnce("new_hashed_password");
    mockOtpDeleteMany.mockResolvedValueOnce({ deletedCount: 1 });

    await changePasswordWithOtp(req, res);

    expect(mockUserInstance.save).toHaveBeenCalled();
    expect(mockOtpDeleteMany).toHaveBeenCalledWith({
      email: "user@example.com",
      type: "change_password",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Đổi mật khẩu thành công!" });
  });

  // TC-CP-09: Lỗi Exception trong hàm đổi mật khẩu
  it("TC-CP-09: Gặp lỗi Exception -> Trả về 500", async () => {
    const req = { ...baseReq };
    const res = makeRes();

    mockOtpFindOne.mockRejectedValueOnce(new Error("Database error"));

    await changePasswordWithOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống khi đổi mật khẩu" });
  });
});

describe("White-Box: userController -> deleteAccountWithOtp", () => {
  const baseReq = {
    user: { _id: "uid_del_123", email: "delete_me@example.com" },
    body: { otp: "654321" },
    app: {
      get: jest.fn().mockReturnValue(null),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-DA-01: Thiếu OTP
  it("TC-DA-01: Không cung cấp mã OTP -> Trả về 400", async () => {
    const req = { user: baseReq.user, body: { otp: "" }, app: baseReq.app };
    const res = makeRes();

    await deleteAccountWithOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Vui lòng nhập mã OTP xác thực" });
  });

  // TC-DA-02: OTP không chính xác hoặc hết hạn
  it("TC-DA-02: Mã OTP sai hoặc hết hạn -> Trả về 400", async () => {
    const req = { ...baseReq };
    const res = makeRes();

    mockOtpFindOne.mockResolvedValueOnce(null);

    await deleteAccountWithOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Mã OTP không chính xác hoặc đã hết hạn" });
  });

  // TC-DA-03: Xoá tài khoản thành công (Không có Socket IO)
  it("TC-DA-03: Xóa tài khoản thành công -> Dọn dẹp dữ liệu và trả về 200", async () => {
    const req = { ...baseReq };
    const res = makeRes();

    mockOtpFindOne.mockResolvedValueOnce({ _id: "otp_del_1" });
    mockUserDeleteOne.mockResolvedValueOnce({ deletedCount: 1 });
    mockConvoFind.mockResolvedValueOnce([]);
    mockConvoUpdateMany.mockResolvedValueOnce({ modifiedCount: 1 });
    mockFriendDeleteMany.mockResolvedValueOnce({ deletedCount: 2 });
    mockFriendRequestDeleteMany.mockResolvedValueOnce({ deletedCount: 0 });
    mockSessionDeleteMany.mockResolvedValueOnce({ deletedCount: 1 });
    mockOtpDeleteMany.mockResolvedValueOnce({ deletedCount: 1 });

    await deleteAccountWithOtp(req, res);

    expect(mockUserDeleteOne).toHaveBeenCalledWith({ _id: "uid_del_123" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Đã xoá tài khoản thành công" });
  });

  // TC-DA-04: Xoá tài khoản thành công kèm Socket IO broadcast
  it("TC-DA-04: Xóa tài khoản thành công và broadcast socket tới các thành viên hội thoại", async () => {
    const mockEmit = jest.fn();
    const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
    const mockIo = { to: mockTo };

    const req = {
      ...baseReq,
      app: {
        get: jest.fn().mockReturnValue(mockIo),
      },
    };
    const res = makeRes();

    mockOtpFindOne.mockResolvedValueOnce({ _id: "otp_del_2" });
    mockUserDeleteOne.mockResolvedValueOnce({ deletedCount: 1 });

    // Mock danh sách conversations có user khác
    mockConvoFind.mockResolvedValueOnce([{ _id: "c1" }]);

    const mockUpdatedConvo = {
      _id: "c1",
      participants: [
        {
          userId: { _id: "u_peer", displayName: "Peer" },
          joinedAt: new Date(),
          role: "member",
        },
      ],
    };
    mockConvoFindById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockUpdatedConvo),
    });

    await deleteAccountWithOtp(req, res);

    expect(mockTo).toHaveBeenCalledWith("user:u_peer");
    expect(mockEmit).toHaveBeenCalledWith(
      "conversation:update",
      expect.objectContaining({ conversationId: "c1" })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // TC-DA-05: Lỗi Exception trong hàm xoá tài khoản
  it("TC-DA-05: Gặp lỗi Exception khi xóa tài khoản -> Trả về 500", async () => {
    const req = { ...baseReq };
    const res = makeRes();

    mockOtpFindOne.mockRejectedValueOnce(new Error("Server error"));

    await deleteAccountWithOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống khi xoá tài khoản" });
  });
});

describe("White-Box: userController -> authMe & getUserCount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-US-05: authMe thành công
  it("TC-US-05: authMe trả về thông tin user hiện tại kèm HTTP 200", async () => {
    const fakeUser = { _id: "u123", username: "tester", displayName: "Tester" };
    const req = { user: fakeUser };
    const res = makeRes();

    await authMe(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user: fakeUser });
  });

  // TC-US-06: authMe gặp lỗi -> 500
  it("TC-US-06: authMe gặp exception -> Trả về 500", async () => {
    const req = {}; // Không có req.user nhưng truy cập gây lỗi nếu bị wrap
    const res = {
      status: jest.fn().mockImplementation(() => {
        throw new Error("Simulated Error");
      }),
      json: jest.fn(),
    };
    // Thay res bình thường và trigger catch
    const normalRes = makeRes();
    const badReq = {
      get user() {
        throw new Error("Getter error");
      },
    };

    await authMe(badReq, normalRes);

    expect(normalRes.status).toHaveBeenCalledWith(500);
    expect(normalRes.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống" });
  });

  // TC-US-07: getUserCount thành công
  it("TC-US-07: getUserCount trả về tổng số lượng users từ Database", async () => {
    const req = {};
    const res = makeRes();

    mockUserCountDocuments.mockResolvedValueOnce(42);

    await getUserCount(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ count: 42 });
  });

  // TC-US-08: getUserCount gặp lỗi DB -> 500
  it("TC-US-08: getUserCount gặp lỗi DB -> Trả về 500", async () => {
    const req = {};
    const res = makeRes();

    mockUserCountDocuments.mockRejectedValueOnce(new Error("DB error"));

    await getUserCount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống" });
  });
});
