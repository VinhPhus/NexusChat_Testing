// @ts-nocheck
import { jest } from "@jest/globals";

// ─── Mock tất cả dependencies TRƯỚC khi import controller ───────────────────

const mockUserFindOne = jest.fn();
const mockUserCreate = jest.fn();
const mockUserFindById = jest.fn();
const mockUserFindByIdAndUpdate = jest.fn();

jest.unstable_mockModule("../../../backend/src/models/User.js", () => ({
  default: {
    findOne: mockUserFindOne,
    create: mockUserCreate,
    findById: mockUserFindById,
    findByIdAndUpdate: mockUserFindByIdAndUpdate,
  },
}));

const mockOtpFindOne = jest.fn();
const mockOtpCreate = jest.fn();
const mockOtpDeleteMany = jest.fn();

jest.unstable_mockModule("../../../backend/src/models/Otp.js", () => ({
  default: {
    findOne: mockOtpFindOne,
    create: mockOtpCreate,
    deleteMany: mockOtpDeleteMany,
  },
}));

const mockSessionCreate = jest.fn();
const mockSessionDeleteMany = jest.fn();
const mockSessionFindOne = jest.fn();
const mockSessionDeleteOne = jest.fn();

jest.unstable_mockModule("../../../backend/src/models/Session.js", () => ({
  default: {
    create: mockSessionCreate,
    deleteMany: mockSessionDeleteMany,
    findOne: mockSessionFindOne,
    deleteOne: mockSessionDeleteOne,
  },
}));

const mockBcryptHash = jest.fn();
const mockBcryptCompare = jest.fn();

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: mockBcryptHash,
    compare: mockBcryptCompare,
  },
}));

const mockJwtSign = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: mockJwtSign,
  },
}));

const mockSendOtpEmail = jest.fn();

jest.unstable_mockModule("../../../backend/src/libs/nodemailer.js", () => ({
  sendOtpEmail: mockSendOtpEmail,
}));

// ─── Import controller SAU khi mock xong ────────────────────────────────────
const {
  signUp,
  signIn,
  sendOtp,
  verifyOtp,
  refreshToken,
  checkUsername,
  checkEmail,
  resetPassword,
  signOut,
} = await import("../../../backend/src/controllers/authController.js");

// ─── Helper tạo mock req/res ─────────────────────────────────────────────────
const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

// ════════════════════════════════════════════════════════════════════════════
// NHÓM 1 — validateUsername (test qua checkUsername)
// Các nhánh: rỗng | < 3 ký tự | > 20 ký tự | ký tự không hợp lệ | hợp lệ
// ════════════════════════════════════════════════════════════════════════════
describe("validateUsername (via checkUsername)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("TC-VU-01: username rỗng → 400 'Tên đăng nhập không được để trống'", async () => {
    const req = { body: { username: "" } };
    const res = makeRes();
    await checkUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tên đăng nhập không được để trống" })
    );
  });

  it("TC-VU-02: username chỉ có space → 400 'Tên đăng nhập không được để trống'", async () => {
    const req = { body: { username: "   " } };
    const res = makeRes();
    await checkUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tên đăng nhập không được để trống" })
    );
  });

  it("TC-VU-03: username < 3 ký tự → 400 'ít nhất 3 ký tự'", async () => {
    const req = { body: { username: "ab" } };
    const res = makeRes();
    await checkUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tên đăng nhập phải có ít nhất 3 ký tự" })
    );
  });

  it("TC-VU-04: username > 20 ký tự → 400 'tối đa 20 ký tự'", async () => {
    const req = { body: { username: "a".repeat(21) } };
    const res = makeRes();
    await checkUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tên đăng nhập tối đa 20 ký tự" })
    );
  });

  it("TC-VU-05: username chứa ký tự đặc biệt → 400 'chỉ được chứa chữ, số...'", async () => {
    const req = { body: { username: "user name!" } };
    const res = makeRes();
    await checkUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("chỉ được chứa chữ"),
      })
    );
  });

  it("TC-VU-06: username hợp lệ → 200 available:true", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const req = { body: { username: "valid_user" } };
    const res = makeRes();
    await checkUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ available: true })
    );
  });

  it("TC-VU-07: username đã tồn tại trong DB → 200 available:false", async () => {
    mockUserFindOne.mockResolvedValue({ _id: "u1", username: "existing_user" });
    const req = { body: { username: "existing_user" } };
    const res = makeRes();
    await checkUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      available: false,
      message: "Tên đăng nhập này đã được sử dụng",
    });
  });

  it("TC-VU-08: DB ném lỗi khi checkUsername → 500", async () => {
    mockUserFindOne.mockRejectedValue(new Error("DB Error"));
    const req = { body: { username: "valid_user" } };
    const res = makeRes();
    await checkUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống" });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// NHÓM 2 — validateEmail (test qua checkEmail)
// Các nhánh: rỗng | sai format | hợp lệ
// ════════════════════════════════════════════════════════════════════════════
describe("validateEmail (via checkEmail)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("TC-VE-01: email rỗng → 400 'Email không được để trống'", async () => {
    const req = { body: { email: "" } };
    const res = makeRes();
    await checkEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Email không được để trống" })
    );
  });

  it("TC-VE-02: email sai format → 400 'Email không hợp lệ'", async () => {
    const req = { body: { email: "not-an-email" } };
    const res = makeRes();
    await checkEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Email không hợp lệ") })
    );
  });

  it("TC-VE-03: email hợp lệ, chưa tồn tại → 200 available:true", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const req = { body: { email: "user@example.com" } };
    const res = makeRes();
    await checkEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ available: true })
    );
  });

  it("TC-VE-04: email đã tồn tại trong DB → 200 available:false", async () => {
    mockUserFindOne.mockResolvedValue({ _id: "u1", email: "used@example.com" });
    const req = { body: { email: "used@example.com" } };
    const res = makeRes();
    await checkEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      available: false,
      message: "Email này đã được sử dụng",
    });
  });

  it("TC-VE-05: DB ném lỗi khi checkEmail → 500", async () => {
    mockUserFindOne.mockRejectedValue(new Error("DB Error"));
    const req = { body: { email: "user@example.com" } };
    const res = makeRes();
    await checkEmail(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống" });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// NHÓM 3 — validatePassword (test qua signUp)
// Các nhánh: rỗng | ngắn | thiếu hoa | thiếu thường | thiếu số | hợp lệ
// ════════════════════════════════════════════════════════════════════════════
describe("validatePassword (via signUp)", () => {
  beforeEach(() => jest.clearAllMocks());

  // Base body với đầy đủ fields hợp lệ ngoài password
  const baseBody = {
    username: "validUser",
    email: "user@example.com",
    firstName: "An",
    lastName: "Nguyen",
    otp: "123456",
  };

  it("TC-VP-01: password rỗng → 400 'Mật khẩu không được để trống'", async () => {
    const req = { body: { ...baseBody, password: "" } };
    const res = makeRes();
    await signUp(req, res);
    // signUp sẽ từ chối ở bước "thiếu trường" trước khi validate password
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("TC-VP-02: password < 6 ký tự → 400 'ít nhất 6 ký tự'", async () => {
    // Phải pass qua bước thiếu fields → mock OTP trả null để nó chạy validate
    mockOtpFindOne.mockResolvedValue(null); // sẽ trả về null nhưng validate chạy trước
    const req = { body: { ...baseBody, password: "Ab1" } };
    const res = makeRes();
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Mật khẩu phải có ít nhất 6 ký tự" })
    );
  });

  it("TC-VP-03: password thiếu chữ hoa → 400 'ít nhất 1 chữ hoa'", async () => {
    const req = { body: { ...baseBody, password: "abcde1" } };
    const res = makeRes();
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z)" })
    );
  });

  it("TC-VP-04: password thiếu chữ thường → 400 'ít nhất 1 chữ thường'", async () => {
    const req = { body: { ...baseBody, password: "ABCDE1" } };
    const res = makeRes();
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Mật khẩu phải chứa ít nhất 1 chữ thường (a-z)" })
    );
  });

  it("TC-VP-05: password thiếu số → 400 'ít nhất 1 chữ số'", async () => {
    const req = { body: { ...baseBody, password: "AbcDef" } };
    const res = makeRes();
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Mật khẩu phải chứa ít nhất 1 chữ số (0-9)" })
    );
  });

  it("TC-VP-06: password hợp lệ → validation pass, tiếp tục xử lý", async () => {
    // Với password hợp lệ, hàm sẽ tiếp tục → kiểm tra OTP
    mockOtpFindOne.mockResolvedValue(null); // OTP không tồn tại → 400 OTP
    const req = { body: { ...baseBody, password: "Valid1Pass" } };
    const res = makeRes();
    await signUp(req, res);
    // Validation pass, bị chặn ở OTP check
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Mã OTP không chính xác hoặc đã hết hạn" })
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// NHÓM 4 — signUp — 7 luồng
// ════════════════════════════════════════════════════════════════════════════
describe("signUp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserFindOne.mockReset();
    mockOtpFindOne.mockReset();
    mockBcryptHash.mockReset();
    mockUserCreate.mockReset();
    mockOtpDeleteMany.mockReset();
  });

  const validBody = {
    username: "validUser",
    email: "user@example.com",
    password: "Valid1Pass",
    firstName: "An",
    lastName: "Nguyen",
    otp: "123456",
  };

  it("TC-SU-01: Thiếu trường bắt buộc → 400", async () => {
    const req = { body: { username: "user" } };
    const res = makeRes();
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("username") })
    );
  });

  it("TC-SU-02: Username không hợp lệ → 400", async () => {
    const req = { body: { ...validBody, username: "ab" } };
    const res = makeRes();
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tên đăng nhập phải có ít nhất 3 ký tự" })
    );
  });

  it("TC-SU-03: OTP không tồn tại → 400", async () => {
    mockOtpFindOne.mockResolvedValue(null);
    const req = { body: { ...validBody } };
    const res = makeRes();
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Mã OTP không chính xác hoặc đã hết hạn" })
    );
  });

  it("TC-SU-04: Username đã tồn tại → 409", async () => {
    mockOtpFindOne.mockResolvedValue({ _id: "otp1" });
    mockUserFindOne
      .mockResolvedValueOnce({ _id: "u1" }) // username duplicate
      .mockResolvedValueOnce(null);
    const req = { body: { ...validBody } };
    const res = makeRes();
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Username đã tồn tại" })
    );
  });

  it("TC-SU-05: Email đã tồn tại → 409", async () => {
    mockOtpFindOne.mockResolvedValue({ _id: "otp1" });
    mockUserFindOne
      .mockResolvedValueOnce(null)           // username OK
      .mockResolvedValueOnce({ _id: "u2" }); // email duplicate
    const req = { body: { ...validBody } };
    const res = makeRes();
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Email đã tồn tại" })
    );
  });

  it("TC-SU-06: Thành công → 204", async () => {
    mockOtpFindOne.mockResolvedValue({ _id: "otp1" });
    mockUserFindOne.mockResolvedValue(null);
    mockBcryptHash.mockResolvedValue("hashed_pass");
    mockUserCreate.mockResolvedValue({});
    mockOtpDeleteMany.mockResolvedValue({});
    const req = { body: { ...validBody } };
    const res = makeRes();
    await signUp(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "validUser",
        hashedPassword: "hashed_pass",
        email: "user@example.com",
      })
    );
  });

  it("TC-SU-07: DB throw error → 500", async () => {
    mockOtpFindOne.mockRejectedValue(new Error("DB error"));
    const req = { body: { ...validBody } };
    const res = makeRes();
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Lỗi hệ thống khi đăng ký" })
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// NHÓM 5 — signIn — 5 luồng
// ════════════════════════════════════════════════════════════════════════════
describe("signIn", () => {
  beforeEach(() => jest.clearAllMocks());

  const makeSignInReq = (body, appMock = { get: () => null }) => ({
    body,
    app: appMock,
  });

  it("TC-SI-01: Thiếu username hoặc password → 400", async () => {
    const req = makeSignInReq({ username: "user" });
    const res = makeRes();
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Thiếu username hoặc password." })
    );
  });

  it("TC-SI-02: User không tồn tại → 401", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const req = makeSignInReq({ username: "nouser", password: "pass" });
    const res = makeRes();
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tên đăng nhập hoặc mật khẩu không chính xác" })
    );
  });

  it("TC-SI-03: Sai mật khẩu → 401", async () => {
    mockUserFindOne.mockResolvedValue({ _id: "u1", hashedPassword: "hash", tokenVersion: 1 });
    mockBcryptCompare.mockResolvedValue(false);
    const req = makeSignInReq({ username: "user1", password: "wrongpass" });
    const res = makeRes();
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tên đăng nhập hoặc mật khẩu không chính xác" })
    );
  });

  it("TC-SI-04: Đăng nhập thành công → 200 với accessToken", async () => {
    const mockUser = {
      _id: "u1",
      hashedPassword: "hash",
      tokenVersion: 0,
      displayName: "An Nguyen",
      lastActiveAt: null,
      save: jest.fn().mockResolvedValue(true),
    };
    mockUserFindOne.mockResolvedValue(mockUser);
    mockBcryptCompare.mockResolvedValue(true);
    mockSessionDeleteMany.mockResolvedValue({});
    mockJwtSign.mockReturnValue("mock_access_token");
    mockSessionCreate.mockResolvedValue({});

    const req = makeSignInReq({ username: "user1", password: "Valid1Pass" });
    const res = makeRes();
    await signIn(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "mock_access_token" })
    );
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockSessionCreate).toHaveBeenCalled();
  });

  it("TC-SI-05: DB throw error → 500", async () => {
    mockUserFindOne.mockRejectedValue(new Error("DB error"));
    const req = makeSignInReq({ username: "user", password: "pass" });
    const res = makeRes();
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Lỗi hệ thống" })
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// NHÓM 6 — sendOtp — 6 nhánh theo type
// ════════════════════════════════════════════════════════════════════════════
describe("sendOtp", () => {
  beforeEach(() => jest.clearAllMocks());

  it("TC-OTP-01: Thiếu email hoặc type không hợp lệ → 400", async () => {
    const req = { body: { email: "a@b.com", type: "invalid_type" } };
    const res = makeRes();
    await sendOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Email và loại OTP (type) không hợp lệ" })
    );
  });

  it("TC-OTP-02: Email không hợp lệ → 400", async () => {
    const req = { body: { email: "not-email", type: "register" } };
    const res = makeRes();
    await sendOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Email không hợp lệ") })
    );
  });

  it("TC-OTP-03: type=register, email đã tồn tại → 409", async () => {
    mockUserFindOne.mockResolvedValue({ _id: "u1" });
    const req = { body: { email: "exists@test.com", type: "register" } };
    const res = makeRes();
    await sendOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Email này đã được sử dụng cho một tài khoản khác" })
    );
  });

  it("TC-OTP-04: type=reset_password, email không tồn tại → 444", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const req = { body: { email: "notexist@test.com", type: "reset_password" } };
    const res = makeRes();
    await sendOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(444);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Email không tồn tại trong hệ thống" })
    );
  });

  it("TC-OTP-05: Gửi mail thất bại (missing_config) → 500", async () => {
    mockUserFindOne.mockResolvedValue(null); // register, email chưa tồn tại
    mockOtpDeleteMany.mockResolvedValue({});
    mockOtpCreate.mockResolvedValue({});
    mockSendOtpEmail.mockResolvedValue({ success: false, reason: "missing_config" });

    const req = { body: { email: "user@test.com", type: "register" } };
    const res = makeRes();
    await sendOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("EMAIL_USER") })
    );
  });

  it("TC-OTP-06: Gửi mail thành công → 200", async () => {
    mockUserFindOne.mockResolvedValue(null);
    mockOtpDeleteMany.mockResolvedValue({});
    mockOtpCreate.mockResolvedValue({});
    mockSendOtpEmail.mockResolvedValue({ success: true });

    const req = { body: { email: "user@test.com", type: "register" } };
    const res = makeRes();
    await sendOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Mã OTP đã được gửi đến email của bạn!" })
    );
  });

  it("TC-OTP-07: DB ném lỗi khi sendOtp → 500", async () => {
    mockUserFindOne.mockRejectedValue(new Error("DB Error"));
    const req = { body: { email: "user@test.com", type: "register" } };
    const res = makeRes();
    await sendOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/DB Error|Lỗi/) })
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// NHÓM 7 — verifyOtp — 4 luồng
// ════════════════════════════════════════════════════════════════════════════
describe("verifyOtp", () => {
  beforeEach(() => jest.clearAllMocks());

  it("TC-VO-01: Thiếu email/otp/type → 400", async () => {
    const req = { body: { email: "a@b.com", otp: "123456" } }; // thiếu type
    const res = makeRes();
    await verifyOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Thiếu email, otp hoặc type" })
    );
  });

  it("TC-VO-02: OTP không tồn tại hoặc hết hạn → 400", async () => {
    mockOtpFindOne.mockResolvedValue(null);
    const req = { body: { email: "a@b.com", otp: "wrong", type: "register" } };
    const res = makeRes();
    await verifyOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Mã OTP không chính xác hoặc đã hết hạn" })
    );
  });

  it("TC-VO-03: OTP hợp lệ → 200", async () => {
    mockOtpFindOne.mockResolvedValue({ _id: "otp1" });
    const req = { body: { email: "a@b.com", otp: "123456", type: "register" } };
    const res = makeRes();
    await verifyOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Xác thực mã OTP thành công!" })
    );
  });

  it("TC-VO-04: DB ném lỗi khi verifyOtp → 500", async () => {
    mockOtpFindOne.mockRejectedValue(new Error("DB Error"));
    const req = { body: { email: "a@b.com", otp: "123456", type: "register" } };
    const res = makeRes();
    await verifyOtp(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống khi xác thực OTP" });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// NHÓM 8 — resetPassword — 6 luồng
// ════════════════════════════════════════════════════════════════════════════
describe("resetPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOtpFindOne.mockReset();
    mockUserFindOne.mockReset();
    mockBcryptHash.mockReset();
    mockOtpDeleteMany.mockReset();
    mockSessionDeleteMany.mockReset();
  });

  const validResetBody = {
    email: "user@example.com",
    otp: "123456",
    newPassword: "NewValidPassword123",
  };

  it("TC-RP-01: Thiếu trường bắt buộc → 400", async () => {
    const req = { body: { email: "user@example.com", otp: "123456" } }; // thiếu newPassword
    const res = makeRes();
    await resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Thiếu email, otp hoặc mật khẩu mới" });
  });

  it("TC-RP-02: newPassword không thỏa mãn chính sách mật khẩu → 400", async () => {
    const req = { body: { ...validResetBody, newPassword: "123" } };
    const res = makeRes();
    await resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
  });

  it("TC-RP-03: OTP không chính xác hoặc đã hết hạn → 400", async () => {
    mockOtpFindOne.mockResolvedValue(null);
    const req = { body: { ...validResetBody } };
    const res = makeRes();
    await resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Mã OTP không chính xác hoặc đã hết hạn" });
  });

  it("TC-RP-04: Không tìm thấy người dùng với email → 404", async () => {
    mockOtpFindOne.mockResolvedValue({ _id: "otp1" });
    mockUserFindOne.mockResolvedValue(null);
    const req = { body: { ...validResetBody } };
    const res = makeRes();
    await resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy người dùng với email này" });
  });

  it("TC-RP-05: Đặt lại mật khẩu thành công → 200", async () => {
    const mockUser = {
      _id: "u123",
      hashedPassword: "old_hashed_password",
      save: jest.fn().mockResolvedValue(true),
    };
    mockOtpFindOne.mockResolvedValue({ _id: "otp1" });
    mockUserFindOne.mockResolvedValue(mockUser);
    mockBcryptHash.mockResolvedValue("new_hashed_password");
    mockOtpDeleteMany.mockResolvedValue({});
    mockSessionDeleteMany.mockResolvedValue({});

    const req = { body: { ...validResetBody } };
    const res = makeRes();
    await resetPassword(req, res);

    expect(mockBcryptHash).toHaveBeenCalledWith("NewValidPassword123", 10);
    expect(mockUser.hashedPassword).toBe("new_hashed_password");
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockOtpDeleteMany).toHaveBeenCalledWith({ email: "user@example.com", type: "reset_password" });
    expect(mockSessionDeleteMany).toHaveBeenCalledWith({ userId: "u123" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.",
    });
  });

  it("TC-RP-06: DB ném lỗi khi resetPassword → 500", async () => {
    mockOtpFindOne.mockRejectedValue(new Error("DB Error"));
    const req = { body: { ...validResetBody } };
    const res = makeRes();
    await resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống khi đặt lại mật khẩu" });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// NHÓM 9 — signOut — 4 luồng
// ════════════════════════════════════════════════════════════════════════════
describe("signOut", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionFindOne.mockReset();
    mockSessionDeleteOne.mockReset();
    mockUserFindByIdAndUpdate.mockReset();
  });

  it("TC-SO-01: Không có token refreshToken trong cookie → 204", async () => {
    const req = { cookies: {} };
    const res = makeRes();
    await signOut(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
    expect(res.clearCookie).not.toHaveBeenCalled();
  });

  it("TC-SO-02: Có token nhưng session không tồn tại trong DB → clearCookie và 204", async () => {
    mockSessionFindOne.mockResolvedValue(null);
    const req = { cookies: { refreshToken: "invalid_token" } };
    const res = makeRes();
    await signOut(req, res);
    expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
    expect(res.sendStatus).toHaveBeenCalledWith(204);
    expect(mockUserFindByIdAndUpdate).not.toHaveBeenCalled();
    expect(mockSessionDeleteOne).not.toHaveBeenCalled();
  });

  it("TC-SO-03: Có token và session hợp lệ → Cập nhật lastActiveAt, xóa session, clearCookie và 204", async () => {
    mockSessionFindOne.mockResolvedValue({ _id: "s1", userId: "u123", refreshToken: "valid_token" });
    mockUserFindByIdAndUpdate.mockResolvedValue({});
    mockSessionDeleteOne.mockResolvedValue({});

    const req = { cookies: { refreshToken: "valid_token" } };
    const res = makeRes();
    await signOut(req, res);

    expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith("u123", expect.objectContaining({ lastActiveAt: expect.any(Date) }));
    expect(mockSessionDeleteOne).toHaveBeenCalledWith({ refreshToken: "valid_token" });
    expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it("TC-SO-04: DB ném lỗi khi signOut → 500", async () => {
    mockSessionFindOne.mockRejectedValue(new Error("DB Error"));
    const req = { cookies: { refreshToken: "valid_token" } };
    const res = makeRes();
    await signOut(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống" });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// NHÓM 10 — refreshToken — 6 luồng
// ════════════════════════════════════════════════════════════════════════════
describe("refreshToken", () => {
  beforeEach(() => jest.clearAllMocks());

  it("TC-RT-01: Không có refreshToken cookie → 401 SESSION_TERMINATED", async () => {
    const req = { cookies: {} };
    const res = makeRes();
    await refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: "SESSION_TERMINATED" })
    );
  });

  it("TC-RT-02: Session không tồn tại trong DB → 401 SESSION_TERMINATED + clearCookie", async () => {
    mockSessionFindOne.mockResolvedValue(null);
    const req = { cookies: { refreshToken: "ghost_token" } };
    const res = makeRes();
    await refreshToken(req, res);
    expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: "SESSION_TERMINATED" })
    );
  });

  it("TC-RT-03: Session hết hạn → 401 SESSION_TERMINATED, deleteOne, clearCookie", async () => {
    const expiredSession = {
      _id: "s1",
      userId: "u1",
      expiresAt: new Date(Date.now() - 1000), // quá khứ
    };
    mockSessionFindOne.mockResolvedValue(expiredSession);
    mockSessionDeleteOne.mockResolvedValue({});
    const req = { cookies: { refreshToken: "token123" } };
    const res = makeRes();
    await refreshToken(req, res);
    expect(mockSessionDeleteOne).toHaveBeenCalledWith({ _id: "s1" });
    expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: "SESSION_TERMINATED" })
    );
  });

  it("TC-RT-04: User không tồn tại trong DB → 404", async () => {
    const validSession = {
      _id: "s1",
      userId: "u1",
      expiresAt: new Date(Date.now() + 100000), // tương lai
    };
    mockSessionFindOne.mockResolvedValue(validSession);
    mockUserFindById.mockResolvedValue(null);
    const req = { cookies: { refreshToken: "token123" } };
    const res = makeRes();
    await refreshToken(req, res);
    expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Người dùng không tồn tại." })
    );
  });

  it("TC-RT-05: Thành công → 200 với accessToken mới", async () => {
    const validSession = {
      _id: "s1",
      userId: "u1",
      expiresAt: new Date(Date.now() + 100000),
    };
    const mockUser = { _id: "u1", tokenVersion: 2 };
    mockSessionFindOne.mockResolvedValue(validSession);
    mockUserFindById.mockResolvedValue(mockUser);
    mockJwtSign.mockReturnValue("new_access_token");

    const req = { cookies: { refreshToken: "token123" } };
    const res = makeRes();
    await refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "new_access_token" })
    );
  });

  it("TC-RT-06: DB ném lỗi khi refreshToken → 500", async () => {
    mockSessionFindOne.mockRejectedValue(new Error("DB Error"));
    const req = { cookies: { refreshToken: "token123" } };
    const res = makeRes();
    await refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống" });
  });
});
