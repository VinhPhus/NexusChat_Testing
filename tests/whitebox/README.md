# HỆ THỐNG KIỂM THỬ HỘP TRẮNG (WHITE-BOX TESTING) — NEXUSCHAT

Dự án kiểm thử hộp trắng Backend áp dụng các kỹ thuật theo **Chương 4: Kỹ thuật thiết kế kiểm thử**:
- **Branch Coverage (Bao phủ nhánh)**: Mục tiêu $\ge 80\%$
- **Statement Coverage (Bao phủ câu lệnh)**: Mục tiêu $\ge 90\%$
- **Control Flow Graph (CFG) & Cyclomatic Complexity ($V(G)$)**: Xác định tập đường dẫn độc lập (Basis Paths)

---

## 1. Lệnh thực thi nhanh (Quick Start)

Mở terminal tại thư mục `backend`:

```bash
cd backend

# Chạy tất cả bài test white-box:
npm run test:whitebox

# Chạy kiểm thử kèm đo độ bao phủ (Coverage Report):
npm run test:coverage
```

Báo cáo Coverage trực quan dạng HTML được lưu tại:
`NexusChat_Testing/coverage/lcov-report/index.html`

---

## 2. Cấu trúc thư mục kiểm thử

```
tests/whitebox/
├── auth/                       # TV1 (VinhPhu)
│   ├── authController.test.js
│   └── authMiddleware.test.js
├── message/                    # TV2 (Ookinaha)
│   ├── messageController.test.js
│   └── messageHelper.test.js
├── friend/                     # TV3 (TrungChien)
│   ├── friendController.test.js
│   └── friendMiddleware.test.js
├── user/                       # TV4 (NhatDuy / PhuongBao)
│   └── userController.test.js
├── middleware/                 # TV4 (NhatDuy / PhuongBao)
│   └── aiRateLimiter.test.js
├── services/                   # TV4 & TV5
│   ├── translateService.test.js   # TV4: Multi-tier fallback (V(G)=6)
│   └── scheduleWorker.test.js     # TV5: Batch processing & streak
├── review/                     # TV5 (GiangTy / ThanhVien5)
│   ├── reviewController.test.js   # TV5: AI moderation, reviews & stats
│   └── feedbackController.test.js # TV5: feedback validation & persistence
└── __mocks__/                  # Helpers tạo mock Model Mongoose
```

`jest-junit` reporter ghi kết quả XML tại `output/junit/whitebox-junit.xml`.

---

## 3. Thư mục tài liệu hướng dẫn & đặc tả (`docs/whitebox/`)

- `01_PHAN_CONG_NHIEM_VU.md`: Bảng phân công chi tiết 5 thành viên, phạm vi mã nguồn, hàm trọng tâm và chỉ tiêu coverage.
- `02_QUY_TRINH_KIEM_THU_WHITEBOX.md`: Hướng dẫn từng bước từ đọc mã, vẽ CFG, tính $V(G)$, thiết kế test case, viết test Jest và đọc báo cáo coverage.
- `03_MAU_TEST_CASE_WHITEBOX.md`: Template báo cáo đặc tả test case chuẩn Chương 4 để thành viên copy và điền nội dung.
