# PHÂN CÔNG NHIỆM VỤ KIỂM THỬ HỘP TRẮNG (WHITE-BOX TESTING)
## Dự án: NexusChat — Nhóm 5 thành viên

---

## 1. Mục tiêu kiểm thử White-Box của nhóm
- **Kỹ thuật chính áp dụng (Chương 4)**:
  - **Branch Coverage (Bao phủ nhánh)**: Tối thiểu $\ge 80\%$ cho mỗi module.
  - **Statement Coverage (Bao phủ câu lệnh)**: Tối thiểu $\ge 90\%$ cho mỗi module.
  - **Control Flow Graph (CFG) & Cyclomatic Complexity ($V(G)$)**: Mỗi thành viên phải vẽ ít nhất 01 sơ đồ CFG cho hàm phức tạp nhất của mình và tính số đường dẫn độc lập $V(G)$.
- **Công cụ thực thi**: Jest (Node.js ES Modules), đo coverage tự động với Istanbul/lcov.

---

## 2. Bảng phân công chi tiết 5 thành viên

| STT | Thành viên | Module đảm nhiệm | File mã nguồn Backend cần kiểm thử | File Test Jest (Đã setup template) | Hàm trọng tâm cần kiểm thử |
|:---:|:---|:---|:---|:---|:---|
| **1** | **Thành viên 1**<br>*(VinhPhu)* | **Module Xác thực & Bảo mật (Auth & Security)** | `backend/src/controllers/authController.js`<br>`backend/src/middlewares/authMiddleware.js` | `tests/whitebox/auth/authController.test.js`<br>`tests/whitebox/auth/authMiddleware.test.js` | `validateUsername`, `validateEmail`, `validatePassword`, `signUp`, `signIn`, `sendOtp`, `verifyOtp`, `refreshToken`, `protectedRoute` |
| **2** | **Thành viên 2**<br>*(Ookinaha)* | **Module Tin nhắn & Chuỗi Streak (Messages & Streak)** | `backend/src/controllers/messageController.js`<br>`backend/src/utils/messageHelper.js` | `tests/whitebox/message/messageController.test.js`<br>`tests/whitebox/message/messageHelper.test.js` | `sendDirectMessage`, `sendDirectMessageFile`, `getDayDifference`, `getEffectiveStreak`, `updateConversationAfterCreateMessage` |
| **3** | **Thành viên 3**<br>*(TrungChien)* | **Module Bạn bè & Quyền riêng tư (Friendship & Privacy)** | `backend/src/controllers/friendController.js`<br>`backend/src/middlewares/friendMiddleware.js` | `tests/whitebox/friend/friendController.test.js`<br>`tests/whitebox/friend/friendMiddleware.test.js` | `sendFriendRequest`, `acceptFriendRequest`, `declineFriendRequest`, `removeFriend`, `checkFriendship` (kiểm tra bạn bè, chặn người dùng) |
| **4** | **Thành viên 4**<br>*(NhatDuy / PhuongBao)* | **Module Người dùng & Dịch thuật/AI Rate Limit (User & Services)** | `backend/src/controllers/userController.js`<br>`backend/src/middlewares/aiRateLimiter.js`<br>`backend/src/services/translateService.js` | `tests/whitebox/user/userController.test.js`<br>`tests/whitebox/middleware/aiRateLimiter.test.js`<br>`tests/whitebox/services/translateService.test.js` | `searchUserByUsername`, `authMe`, `getUserCount`, `checkAIRateLimit`, `aiRateLimiterMiddleware`, `translateText` (Multi-tier Fallback 4 tầng) |
| **5** | **Thành viên 5**<br>*(GiangTy / ThanhVien5)* | **Module Lập lịch & Đánh giá (Schedule Worker & Reviews)** | `backend/src/services/scheduleWorker.js`<br>`backend/src/controllers/reviewController.js` | `tests/whitebox/services/scheduleWorker.test.js`<br>`tests/whitebox/review/reviewController.test.js` | `processScheduledMessages` (hẹn giờ tin nhắn, kích hoạt AI), `checkAndResetExpiredStreaks`, `submitReview` (kiểm duyệt nội dung, fallback từ khóa) |

---

## 3. Sản phẩm bàn giao yêu cầu từ mỗi thành viên

Mỗi thành viên cần nộp 2 phần:
1. **Code kiểm thử Jest**:
   - Mở file test tương ứng trong thư mục `tests/whitebox/<module>/`.
   - Đọc các nhánh gợi ý tại `it.todo(...)` và chuyển thành các bài test `it(...)` hoàn chỉnh.
   - Chạy lệnh kiểm thử cục bộ:
     ```bash
     cd backend
     npm run test:whitebox
     ```
   - Chạy kiểm tra độ bao phủ (Coverage):
     ```bash
     cd backend
     npm run test:coverage
     ```
2. **Tài liệu báo cáo đặc tả Test Case White-Box**:
   - Tạo file báo cáo `docs/whitebox/test_cases_<ten_thanh_vien>.md` theo mẫu chuẩn tại `docs/whitebox/03_MAU_TEST_CASE_WHITEBOX.md`.
   - Có ít nhất **01 sơ đồ CFG** cho hàm phức tạp nhất.
   - Tính toán **Cyclomatic Complexity $V(G)$** và liệt kê tập đường dẫn độc lập (Basis Paths).
   - Bảng ánh xạ Test Case ID với từng nhánh/đường dẫn.

---

## 4. Bảng phân phối vẽ đồ thị CFG mẫu cho từng thành viên

| Thành viên | Hàm chỉ định vẽ đồ thị dòng điều khiển (CFG) | Độ phức tạp Cyclomatic ước tính $V(G)$ | Lý do chọn |
|:---|:---|:---:|:---|
| **TV1** | `validatePassword` hoặc `signUp` trong `authController.js` | $V(G) = 6 \sim 7$ | Nhiều điều kiện rẽ nhánh (độ dài, regex chữ hoa, chữ thường, số, OTP, trùng username/email) |
| **TV2** | `getEffectiveStreak` hoặc `updateConversationAfterCreateMessage` trong `messageHelper.js` | $V(G) = 5 \sim 6$ | Xử lý logic chuỗi streak theo ngày ($diff = 0, 1, >1$) và cập nhật tin nhắn chưa đọc |
| **TV3** | `checkFriendship` trong `friendMiddleware.js` | $V(G) = 6 \sim 8$ | Kiểm tra 1-1 vs Nhóm, kiểm tra danh sách kết bạn, kiểm tra chặn chéo hai chiều |
| **TV4** | `translateText` (Multi-tier Fallback) trong `translateService.js` | $V(G) = 6$ | Cấu trúc 4 tầng fallback bắt lỗi tuần tự: GTX $\to$ Chrome Dict $\to$ MyMemory $\to$ Gemini AI $\to$ Error |
| **TV5** | `processScheduledMessages` trong `scheduleWorker.js` | $V(G) = 5 \sim 6$ | Vòng lặp duyệt tin nhắn chờ, kiểm tra tồn tại hội thoại, tạo tin nhắn, kích hoạt AI, bắt lỗi cục bộ |

