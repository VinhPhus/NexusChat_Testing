# TỔNG HỢP KIỂM THỬ HỘP TRẮNG (WHITE-BOX TESTING) — NEXUSCHAT

Thư mục này lưu trữ toàn bộ tài liệu đặc tả, sơ đồ dòng điều khiển (Control Flow Graph - CFG) và báo cáo kiểm thử hộp trắng của **Nhóm 5 thành viên**.

---

## 📋 Bảng tổng hợp tiến độ các Module

| STT | Thành viên | Module đảm nhiệm | File đặc tả Test Cases | File sơ đồ Draw.io | Sơ đồ CFG trực quan | Trạng thái |
|:---:|:---|:---|:---|:---|:---:|:---:|
| **TV1** | **Vinh Phú** | **Xác thực & Bảo mật (Auth & Security)** | [`auth_test_cases.md`](./auth_test_cases.md) | [`auth_CFG.drawio`](./auth_CFG.drawio) | [Xem sơ đồ](#1-module-xác-thực--bảo-mật-tv1--vinh-phú) | ✅ **Hoàn thành (65/65 Passed)** |
| **TV2** | **Ookinaha** | **Tin nhắn & Streak (Messages & Streak)** | [`message_test_cases.md`](./message_test_cases.md) | `message_CFG.drawio` | [Xem sơ đồ](#2-module-tin-nhắn--chuỗi-streak-tv2--ookinaha) | 🔄 Đang hoàn thiện |
| **TV3** | **Trung Chiến** | **Bạn bè & Quyền riêng tư (Friendship & Privacy)** | `friend_test_cases.md` | `friend_CFG.drawio` | [Xem sơ đồ](#3-module-bạn-bè--quyền-riêng-tư-tv3--trung-chiến) | 🔄 Đang hoàn thiện |
| **TV4** | **Nhật Duy / Phương Bảo** | **Người dùng & Dịch thuật/AI Services** | `user_service_test_cases.md` | `user_service_CFG.drawio` | [Xem sơ đồ](#4-module-người-dùng--dịch-thuật-tv4--nhật-duy--phương-bảo) | 🔄 Đang hoàn thiện |
| **TV5** | **Giang Tỷ / Thành viên 5** | **Lập lịch & Đánh giá (Schedule & Reviews)** | `WHITEBOX_REPORT.md` | `schedule_CFG.drawio` | [Xem sơ đồ](#5-module-lập-lịch--đánh-giá-tv5--giang-tỷ) | 🔄 Đang hoàn thiện |

---

## 1. Module Xác thực & Bảo mật (TV1 — Vinh Phú)
- **Tài liệu đặc tả**: [`auth_test_cases.md`](./auth_test_cases.md) (65 Test Cases, Statement 98.26%, Branch 93.38%)
- **File Draw.io gốc**: [`auth_CFG.drawio`](./auth_CFG.drawio)

### 1.1 Sơ đồ CFG: Hàm `validatePassword()`
- **Độ phức tạp Cyclomatic**: $V(G) = E - N + 2 = 12 - 8 + 2 = \mathbf{6}$

```mermaid
flowchart TD
    Start(["START: validatePassword(password)"]):::startClass
    D1{"Node 1: !password || !password.trim()?"}:::decisionClass
    O1["Return 400: Mật khẩu không được để trống"]:::errorClass

    D2{"Node 2: password.length < 6?"}:::decisionClass
    O2["Return 400: Mật khẩu phải có ít nhất 6 ký tự"]:::errorClass

    D3{"Node 3: !/[A-Z]/.test(password)?"}:::decisionClass
    O3["Return 400: Thiếu ít nhất 1 chữ hoa (A-Z)"]:::errorClass

    D4{"Node 4: !/[a-z]/.test(password)?"}:::decisionClass
    O4["Return 400: Thiếu ít nhất 1 chữ thường (a-z)"]:::errorClass

    D5{"Node 5: !/[0-9]/.test(password)?"}:::decisionClass
    O5["Return 400: Thiếu ít nhất 1 chữ số (0-9)"]:::errorClass

    O6["Node 6: Return '' (Mật khẩu Hợp lệ)"]:::successClass
    EndNode(["END: Kết thúc hàm"]):::endClass

    Start --> D1
    D1 -- True --> O1 --> EndNode
    D1 -- False --> D2
    D2 -- True --> O2 --> EndNode
    D2 -- False --> D3
    D3 -- True --> O3 --> EndNode
    D3 -- False --> D4
    D4 -- True --> O4 --> EndNode
    D4 -- False --> D5
    D5 -- True --> O5 --> EndNode
    D5 -- False --> O6 --> EndNode

    classDef startClass fill:#dbeafe,stroke:#3b82f6,stroke-width:2px;
    classDef decisionClass fill:#fef3c7,stroke:#f59e0b,stroke-width:2px;
    classDef errorClass fill:#fee2e2,stroke:#ef4444,stroke-width:1px;
    classDef successClass fill:#d1fae5,stroke:#10b981,stroke-width:2px;
    classDef endClass fill:#e2e8f0,stroke:#64748b,stroke-width:2px;
```

### 1.2 Sơ đồ CFG: Middleware `protectedRoute()`
- **Độ phức tạp Cyclomatic**: $V(G) = E - N + 2 = 22 - 17 + 2 = \mathbf{7}$

```mermaid
flowchart TD
    MWStart(["START: protectedRoute(req, res, next)"]):::startClass
    MW_D1{"Node 2: !authHeader || !authHeader.startsWith('Bearer ')?"}:::decisionClass
    MW_O1["Return 401: Không tìm thấy access token"]:::errorClass

    MW_N4["Node 4: token = authHeader.split(' ')[1]"]:::processClass
    MW_D2{"Node 5: !token?"}:::decisionClass
    MW_O2["Return 401: Không tìm thấy access token"]:::errorClass

    MW_N7["Node 7: jwt.verify(token, SECRET, callback)"]:::processClass
    MW_D3{"Node 8: Callback có lỗi err (hết hạn / sai signature)?"}:::decisionClass
    MW_O3["Return 403: Token không hợp lệ hoặc đã hết hạn"]:::errorClass

    MW_N10["Node 10: User.findById(decodedUser.userId)"]:::processClass
    MW_D4{"Node 11: !user?"}:::decisionClass
    MW_O4["Return 404: Người dùng không tồn tại"]:::errorClass

    MW_D5{"Node 13: user.tokenVersion !== decodedUser.tokenVersion?"}:::decisionClass
    MW_O5["Return 401: SESSION_TERMINATED (Đã login ở thiết bị khác)"]:::errorClass

    MW_O6["Node 15: req.user = user; next() (Xác thực thành công)"]:::successClass
    MW_Catch["Node 16: Catch Exception -> Return 500 'Lỗi hệ thống'"]:::errorClass
    MWEnd(["END: Kết thúc Middleware"]):::endClass

    MWStart --> MW_D1
    MW_D1 -- True --> MW_O1 --> MWEnd
    MW_D1 -- False --> MW_N4 --> MW_D2
    MW_D2 -- True --> MW_O2 --> MWEnd
    MW_D2 -- False --> MW_N7 --> MW_D3
    MW_D3 -- True --> MW_O3 --> MWEnd
    MW_D3 -- False --> MW_N10 --> MW_D4
    MW_D4 -- True --> MW_O4 --> MWEnd
    MW_D4 -- False --> MW_D5
    MW_D5 -- True --> MW_O5 --> MWEnd
    MW_D5 -- False --> MW_O6 --> MWEnd
    MWStart -. Ngoại lệ đồng bộ .-> MW_Catch --> MWEnd

    classDef startClass fill:#dbeafe,stroke:#3b82f6,stroke-width:2px;
    classDef decisionClass fill:#fef3c7,stroke:#f59e0b,stroke-width:2px;
    classDef processClass fill:#f1f5f9,stroke:#94a3b8,stroke-width:1px;
    classDef errorClass fill:#fee2e2,stroke:#ef4444,stroke-width:1px;
    classDef successClass fill:#d1fae5,stroke:#10b981,stroke-width:2px;
    classDef endClass fill:#e2e8f0,stroke:#64748b,stroke-width:2px;
```

---

## 2. Module Tin nhắn & Chuỗi Streak (TV2 — Ookinaha)
- **Tài liệu đặc tả**: [`message_test_cases.md`](./message_test_cases.md)
- **File Draw.io**: `message_CFG.drawio` *(Thành viên sẽ bổ sung sau)*

### Sơ đồ CFG: Hàm `getEffectiveStreak()`
- **Độ phức tạp Cyclomatic**: $V(G) = 13 - 10 + 2 = \mathbf{5}$

```mermaid
flowchart TD
    S_Start(["START: getEffectiveStreak(streak, now)"]):::startClass
    S_D1{"!streak || !streak.lastMessageDate || !streak.count?"}:::decisionClass
    S_O1["Return { count: 0, lastMessageDate: null, senders: [], isBothMessaged: false }"]:::errorClass

    S_Calc["dayDiff = getDayDifference(streak.lastMessageDate, now)"]:::processClass
    S_D2{"dayDiff >= 2?"}:::decisionClass
    S_O2["Return { count: 0, lastMessageDate: streak.lastMessageDate, senders: [], isBothMessaged: false }"]:::errorClass

    S_Eval["isBoth = (dayDiff === 0) ? Boolean(streak.isBothMessaged) : false<br/>senders = (dayDiff === 0 && Array.isArray) ? streak.senders : []"]:::processClass
    S_O3["Return { count: streak.count, lastMessageDate, senders, isBothMessaged: isBoth }"]:::successClass
    S_End(["END"]):::endClass

    S_Start --> S_D1
    S_D1 -- True --> S_O1 --> S_End
    S_D1 -- False --> S_Calc --> S_D2
    S_D2 -- True --> S_O2 --> S_End
    S_D2 -- False --> S_Eval --> S_O3 --> S_End

    classDef startClass fill:#dbeafe,stroke:#3b82f6,stroke-width:2px;
    classDef decisionClass fill:#fef3c7,stroke:#f59e0b,stroke-width:2px;
    classDef processClass fill:#f1f5f9,stroke:#94a3b8,stroke-width:1px;
    classDef errorClass fill:#fee2e2,stroke:#ef4444,stroke-width:1px;
    classDef successClass fill:#d1fae5,stroke:#10b981,stroke-width:2px;
    classDef endClass fill:#e2e8f0,stroke:#64748b,stroke-width:2px;
```

---

## 3. Module Bạn bè & Quyền riêng tư (TV3 — Trung Chiến)
- **Tài liệu đặc tả**: `friend_test_cases.md` *(Đang hoàn thiện)*
- **File Draw.io**: `friend_CFG.drawio` *(Đang hoàn thiện)*
- **Hàm trọng tâm**: `checkFriendship` trong `friendMiddleware.js`
- *(Thành viên 3 sẽ dán biểu đồ Mermaid và link file vẽ vào đây khi hoàn thành)*

---

## 4. Module Người dùng & Dịch thuật (TV4 — Nhật Duy / Phương Bảo)
- **Tài liệu đặc tả**: `user_service_test_cases.md` *(Đang hoàn thiện)*
- **File Draw.io**: `user_service_CFG.drawio` *(Đang hoàn thiện)*
- **Hàm trọng tâm**: `translateText` (Multi-tier Fallback 4 tầng, $V(G) = 6$) trong `translateService.js` và `checkAIRateLimit` trong `aiRateLimiter.js`.
- *(Thành viên 4 sẽ dán biểu đồ Mermaid và link file vẽ vào đây khi hoàn thành)*

---

## 5. Module Lập lịch & Đánh giá (TV5 — Giang Tỷ)
- **Tài liệu đặc tả**: `WHITEBOX_REPORT.md` *(Đang hoàn thiện)*
- **File Draw.io**: `schedule_CFG.drawio` *(Đang hoàn thiện)*
- **Hàm trọng tâm**: `processScheduledMessages` trong `scheduleWorker.js` và `submitReview` trong `reviewController.js`.
- *(Thành viên 5 sẽ dán biểu đồ Mermaid và link file vẽ vào đây khi hoàn thành)*

---

## 🛠️ Hướng dẫn các thành viên cập nhật vào file README này

Khi thành viên hoàn thành xong phần của mình:
1. Đặt file vẽ vào thư mục: `docs/whitebox/<tên_module>_CFG.drawio`.
2. Đặt file đặc tả test case vào: `docs/whitebox/<tên_module>_test_cases.md`.
3. Mở file `docs/whitebox/README.md` này, tìm đến mục của mình và:
   - Cập nhật link file và trạng thái tại bảng tổng hợp ở đầu trang.
   - Thêm biểu đồ Mermaid tương ứng của hàm bạn đã vẽ để hiển thị trực quan ngay trên GitHub.
4. Commit lên GitHub theo cú pháp Jira: `git commit -m "KAN-XX: Hoan thanh kiem thu White-box module ..."`
