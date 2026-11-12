// @ts-nocheck
import { jest } from "@jest/globals";

// ─── Mock dependencies TRƯỚC khi import middleware ──────────────────────────

const mockUserFindById = jest.fn();

jest.unstable_mockModule("../../../backend/src/models/User.js", () => ({
  default: {
    findById: mockUserFindById,
  },
}));

const mockJwtVerify = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: mockJwtVerify,
  },
}));

// ─── Import middleware SAU khi mock xong ────────────────────────────────────
const { protectedRoute } = await import(
  "../../../backend/src/middlewares/authMiddleware.js"
);

// ─── Helper ─────────────────────────────────────────────────────────────────
const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ════════════════════════════════════════════════════════════════════════════
// protectedRoute — 6 nhánh
// ════════════════════════════════════════════════════════════════════════════
describe("protectedRoute (authMiddleware)", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Nhánh 1: Thiếu Authorization header ──────────────────────────────────
  it("TC-MW-01: Không có Authorization header → 401 'Không tìm thấy access token'", async () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = jest.fn();

    protectedRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Không tìm thấy access token" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  // ── Nhánh 2: Token sai format (không có "Bearer ") ───────────────────────
  it("TC-MW-02: Authorization không có Bearer → 401", async () => {
    const req = { headers: { authorization: "invalidtoken" } };
    const res = makeRes();
    const next = jest.fn();

    // "invalidtoken".split(" ")[1] === undefined → token = undefined → falsy
    protectedRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Không tìm thấy access token" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  // ── Nhánh 3: JWT verify fail (token expired / sai secret) ────────────────
  it("TC-MW-03: JWT verify fail → 403 'Access token hết hạn hoặc không đúng'", async () => {
    // jwt.verify gọi callback với err
    mockJwtVerify.mockImplementation((_token, _secret, cb) => {
      cb(new Error("jwt expired"), null);
    });

    const req = { headers: { authorization: "Bearer bad_token" } };
    const res = makeRes();
    const next = jest.fn();

    protectedRoute(req, res, next);

    // Chờ callback async
    await new Promise((r) => setImmediate(r));

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Access token hết hạn hoặc không đúng" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  // ── Nhánh 4: User không tồn tại trong DB ─────────────────────────────────
  it("TC-MW-04: JWT hợp lệ nhưng user không tồn tại → 404", async () => {
    const decodedUser = { userId: "u999", tokenVersion: 1 };
    mockJwtVerify.mockImplementation((_token, _secret, cb) => {
      cb(null, decodedUser);
    });

    // .select().populate() chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockResolvedValue(null);
    mockUserFindById.mockReturnValue({ select: mockSelect, populate: mockPopulate });

    const req = { headers: { authorization: "Bearer good_token" } };
    const res = makeRes();
    const next = jest.fn();

    protectedRoute(req, res, next);
    await new Promise((r) => setImmediate(r));

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Người dùng không tồn tại." })
    );
    expect(next).not.toHaveBeenCalled();
  });

  // ── Nhánh 5: tokenVersion không khớp → 401 SESSION_TERMINATED ────────────
  it("TC-MW-05: tokenVersion không khớp → 401 SESSION_TERMINATED", async () => {
    const decodedUser = { userId: "u1", tokenVersion: 1 };
    const dbUser = { _id: "u1", tokenVersion: 2 }; // version khác

    mockJwtVerify.mockImplementation((_token, _secret, cb) => {
      cb(null, decodedUser);
    });

    const mockSelect = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockResolvedValue(dbUser);
    mockUserFindById.mockReturnValue({ select: mockSelect, populate: mockPopulate });

    const req = { headers: { authorization: "Bearer good_token" } };
    const res = makeRes();
    const next = jest.fn();

    protectedRoute(req, res, next);
    await new Promise((r) => setImmediate(r));

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: "SESSION_TERMINATED" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  // ── Nhánh 6: Thành công → next() được gọi, req.user được set ─────────────
  it("TC-MW-06: Token hợp lệ, tokenVersion khớp → next() được gọi, req.user được set", async () => {
    const decodedUser = { userId: "u1", tokenVersion: 3 };
    const dbUser = { _id: "u1", tokenVersion: 3, displayName: "An Nguyen" };

    mockJwtVerify.mockImplementation((_token, _secret, cb) => {
      cb(null, decodedUser);
    });

    const mockSelect = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockResolvedValue(dbUser);
    mockUserFindById.mockReturnValue({ select: mockSelect, populate: mockPopulate });

    const req = { headers: { authorization: "Bearer valid_token" } };
    const res = makeRes();
    const next = jest.fn();

    protectedRoute(req, res, next);
    await new Promise((r) => setImmediate(r));

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(dbUser);
    expect(res.status).not.toHaveBeenCalled();
  });
});
