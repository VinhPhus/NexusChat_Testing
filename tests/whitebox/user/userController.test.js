/**
 * STARTER TEMPLATE — White-Box Testing: userController.js
 * Phụ trách: TV4 (NhatDuy / PhuongBao)
 * Kỹ thuật áp dụng: Branch Coverage, Statement Coverage, Boundary Value Analysis
 *
 * HƯỚNG DẪN DÀNH CHO THÀNH VIÊN:
 * 1. Đọc kỹ file mã nguồn: backend/src/controllers/userController.js
 * 2. Các hàm trọng tâm cần kiểm thử:
 *    a) `searchUserByUsername`:
 *       - Branch 1: query rỗng -> 400 "Thiếu từ khóa tìm kiếm"
 *       - Branch 2: query hợp lệ nhưng không tìm thấy user nào -> 404 "Không tìm thấy người dùng"
 *       - Branch 3: query hợp lệ và tìm thấy danh sách users -> 200 { users }
 *       - Branch 4: Lỗi DB -> 500 "Lỗi hệ thống"
 *    b) `authMe`:
 *       - Branch 1: Có user trong req -> 200 { user }
 *       - Branch 2: Bắt lỗi exception -> 500
 *    c) `getUserCount`:
 *       - Branch 1: Trả về số lượng người dùng từ DB -> 200 { count }
 *       - Branch 2: Lỗi DB -> 500
 */

// @ts-nocheck
import { jest } from "@jest/globals";

// Mock các model Mongoose
const mockUserFind = jest.fn();
const mockUserCountDocuments = jest.fn();

jest.unstable_mockModule("../../../backend/src/models/User.js", () => ({
  default: {
    find: mockUserFind,
    countDocuments: mockUserCountDocuments,
  },
}));

// Mock các thư viện phụ thuộc
jest.unstable_mockModule("../../../backend/src/libs/cloudinary.js", () => ({
  default: {
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

// Import controller sau khi đã mock
const { searchUserByUsername, authMe, getUserCount } = await import(
  "../../../backend/src/controllers/userController.js"
);

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

  // TEST MẪU 1: Từ khóa tìm kiếm rỗng (Branch 1)
  it("TC-US-01: Từ khóa tìm kiếm rỗng -> Trả về 400", async () => {
    const req = { query: { username: "" } };
    const res = makeRes();

    await searchUserByUsername(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Thiếu từ khóa tìm kiếm",
    });
  });

  // TEST MẪU 2: Không tìm thấy người dùng phù hợp (Branch 2)
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

  // TODO cho thành viên:
  it.todo("TC-US-03: Tìm thấy người dùng -> Trả về danh sách users kèm HTTP 200");
  it.todo("TC-US-04: Lỗi kết nối DB trong quá trình truy vấn -> Trả về 500");
});

describe("White-Box: userController -> authMe & getUserCount", () => {
  it("TC-US-05: authMe trả về thông tin user hiện tại kèm HTTP 200", async () => {
    const fakeUser = { _id: "u123", username: "tester", displayName: "Tester" };
    const req = { user: fakeUser };
    const res = makeRes();

    await authMe(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user: fakeUser });
  });

  // TODO cho thành viên:
  it.todo("TC-US-06: getUserCount trả về tổng số lượng users từ Database");
  it.todo("TC-US-07: getUserCount gặp lỗi DB -> Trả về 500");
});

