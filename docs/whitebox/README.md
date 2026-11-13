# TỔNG HỢP KIỂM THỬ HỘP TRẮNG (WHITE-BOX TESTING) — NEXUSCHAT

Thư mục này lưu trữ toàn bộ tài liệu đặc tả, sơ đồ dòng điều khiển (Control Flow Graph - CFG) và báo cáo kiểm thử hộp trắng của **Nhóm 5 thành viên**.

---

## 📋 Bảng tổng hợp tiến độ các Module

| STT | Thành viên | Module đảm nhiệm | File đặc tả Test Cases | File sơ đồ Draw.io | Sơ đồ CFG trực quan | Trạng thái |
|:---:|:---|:---|:---|:---|:---:|:---:|
| **TV1** | **Vinh Phú** | **Xác thực & Bảo mật (Auth & Security)** | [`auth_test_cases.md`](./auth_test_cases.md) | [`auth_CFG.drawio`](./auth_CFG.drawio) | [Xem sơ đồ](#1-module-xác-thực--bảo-mật-tv1--vinh-phú) | ✅ **Hoàn thành (65/65 Passed)** |
| **TV2** | **Phuong Bao** | **Tin nhắn & Streak (Messages & Streak)** | [`message_test_cases.md`](./message_test_cases.md) | [`message_CFG.drawio`](./message_CFG.drawio) | [Xem sơ đồ](#2-module-tin-nhắn--chuỗi-streak-tv2--PhuongBao) | ✅ **87/87 tests passed; coverage đạt ngưỡng** |
| **TV3** | **Trung Chiến** | **Bạn bè & Quyền riêng tư (Friendship & Privacy)** | `friend_test_cases.md` | `friend_CFG.drawio` | [Xem sơ đồ](#3-module-bạn-bè--quyền-riêng-tư-tv3--trung-chiến) | 🔄 Đang hoàn thiện |
| **TV4** | **Nhật Duy ** | **Người dùng & Dịch thuật/AI Services** | [`user_service_test_cases.md`](./user_service_test_cases.md) | [`user_service_CFG.drawio`](./user_service_CFG.drawio) | [Xem sơ đồ](#4-module-người-dùng--dịch-thuật-tv4--nhật-duy) | ✅ **Hoàn thành (42/42 Passed)** |
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

## 2. Module Tin nhắn & Chuỗi Streak (TV2 — Phuong Bao)
- **Tài liệu đặc tả và coverage**: [`message_test_cases.md`](./message_test_cases.md)
- **File Draw.io**: [`message_CFG.drawio`](./message_CFG.drawio) (CFG cho `sendDirectMessage`, `getEffectiveStreak` và `updateConversationAfterCreateMessage`)
- **Jest tests**: [`messageController.test.js`](../../tests/whitebox/message/messageController.test.js), [`messageControllerOther.test.js`](../../tests/whitebox/message/messageControllerOther.test.js), [`messageHelper.test.js`](../../tests/whitebox/message/messageHelper.test.js)
- **Kết quả**: 87/87 tests passed. `messageController.js` đạt Statements 99.07% / Branches 90.19%; `messageHelper.js` đạt Statements 100% / Branches 93.75%. Các giới hạn còn lại (model `Game.js` thiếu và export `sendDirectMessageFile` không tồn tại) được ghi trong báo cáo.

### Sơ đồ CFG: Hàm `getEffectiveStreak()`
- **Độ phức tạp Cyclomatic source-level**: $V(G) = 23 - 17 + 2 = \mathbf{8}$ (tách short-circuit)

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

## 4. Module Người dùng & Dịch thuật (TV4 — Nhật Duy)
- **Tài liệu đặc tả**: [`user_service_test_cases.md`](./user_service_test_cases.md) (42 Test Cases, Statement 100%, Branch 85.45%)
- **File Draw.io gốc**: [`user_service_CFG.drawio`](./user_service_CFG.drawio)
- **Hàm trọng tâm**: `translateText` (Multi-tier Fallback 4 tầng, $V(G) = 6$) trong `translateService.js` và `checkAIRateLimit` trong `aiRateLimiter.js`.

### 4.1 Sơ đồ CFG: Hàm `translateText()` (Dịch thuật đa tầng Fallback 4 cấp)
- **Kiến trúc**: Multi-tier Fallback: Google GTX $\to$ Google Dict $\to$ MyMemory $\to$ Gemini AI $\to$ Exception.
- **Độ phức tạp Cyclomatic**: $V(G) = P + 1 = 5 + 1 = \mathbf{6}$ (hoặc $V(G) = E - N + 2 = 20 - 16 + 2 = \mathbf{6}$).
- **6 Basis Paths**:
  1. **Path 1**: Text rỗng/khoảng trắng $\to$ Return chuỗi gốc.
  2. **Path 2**: Gọi Google GTX thành công $\to$ Return kết quả GTX.
  3. **Path 3**: GTX lỗi $\to$ Fallback Google Dict thành công $\to$ Return kết quả Dict.
  4. **Path 4**: GTX & Dict lỗi $\to$ Fallback MyMemory thành công $\to$ Return kết quả MyMemory.
  5. **Path 5**: GTX, Dict & MyMemory lỗi $\to$ Fallback Gemini 2.5 Flash thành công $\to$ Return kết quả AI.
  6. **Path 6**: Cả 4 tầng đều lỗi $\to$ Throw Error thông báo thử lại sau.

```mermaid
flowchart TD
    N1(["Node 1: Entry translateText(text, targetLang)"]):::startClass
    N2{"Node 2: !text || !text.trim() ?"}:::decisionClass
    N3["Node 3: Return text (Nguyên bản)"]:::successClass

    N4["Node 4: Tầng 1: Thử gọi Google GTX"]:::processClass
    N5{"Node 5: GTX thành công hay có lỗi ?"}:::decisionClass
    N5_OK["Node 5a: Return kết quả GTX"]:::successClass
    N6["Node 6: Catch err1 -> Log warn chuyển Tầng 2"]:::errorClass

    N7["Node 7: Tầng 2: Thử gọi Google Dict"]:::processClass
    N8{"Node 8: Dict thành công hay có lỗi ?"}:::decisionClass
    N8_OK["Node 8a: Return kết quả Dict"]:::successClass
    N9["Node 9: Catch err2 -> Log warn chuyển Tầng 3"]:::errorClass

    N10["Node 10: Tầng 3: Thử gọi MyMemory"]:::processClass
    N11{"Node 11: MyMemory thành công hay có lỗi ?"}:::decisionClass
    N11_OK["Node 11a: Return kết quả MyMemory"]:::successClass
    N12["Node 12: Catch err3 -> Log warn chuyển Tầng 4"]:::errorClass

    N13["Node 13: Tầng 4: Thử gọi Gemini AI"]:::processClass
    N14{"Node 14: Gemini thành công hay có lỗi ?"}:::decisionClass
    N14_OK["Node 14a: Return kết quả Gemini AI"]:::successClass
    N15["Node 15: Catch err4 -> Log error tất cả thất bại"]:::errorClass
    N16["Node 16: Throw new Error('Không thể dịch...')"]:::endClass

    EndNode(["END: Kết thúc hàm"]):::startClass

    N1 --> N2
    N2 -- True --> N3 --> EndNode
    N2 -- False --> N4 --> N5
    N5 -- Thành công --> N5_OK --> EndNode
    N5 -- Exception --> N6 --> N7 --> N8
    N8 -- Thành công --> N8_OK --> EndNode
    N8 -- Exception --> N9 --> N10 --> N11
    N11 -- Thành công --> N11_OK --> EndNode
    N11 -- Exception --> N12 --> N13 --> N14
    N14 -- Thành công --> N14_OK --> EndNode
    N14 -- Exception --> N15 --> N16 --> EndNode

    classDef startClass fill:#dbeafe,stroke:#3b82f6,stroke-width:2px;
    classDef decisionClass fill:#fef3c7,stroke:#f59e0b,stroke-width:2px;
    classDef processClass fill:#f1f5f9,stroke:#94a3b8,stroke-width:1px;
    classDef errorClass fill:#fee2e2,stroke:#ef4444,stroke-width:1px;
    classDef successClass fill:#d1fae5,stroke:#10b981,stroke-width:2px;
    classDef endClass fill:#f87171,stroke:#b91c1c,stroke-width:2px;
```

### 4.2 Sơ đồ CFG: Hàm `checkAIRateLimit()` (Giới hạn tần suất AI Sliding Window)
- **Độ phức tạp Cyclomatic**: $V(G) = P + 1 = 2 + 1 = \mathbf{3}$
- **3 Đường dẫn cơ sở**:
  - **Path 1**: User mới chưa có trong Map $\to$ Khởi tạo mảng rỗng $\to$ Lưu timestamp và cho phép (`true`).
  - **Path 2**: User đã tồn tại, số request trong 60s $< 5$ $\to$ Thêm timestamp và cho phép (`true`).
  - **Path 3**: User đã tồn tại, số request trong 60s $\ge 5$ $\to$ Chặn request (`false`).

```mermaid
flowchart TD
    R1(["Node 1: Entry -> now = Date.now()"]):::startClass
    R2{"Node 2: !requestCounts.has(userId) ?"}:::decisionClass
    R3["Node 3: requestCounts.set(userId, [])"]:::processClass
    R4["Node 4: timestamps = requestCounts.get(userId)<br/>recentTimestamps = timestamps.filter(...)"]:::processClass
    R5{"Node 5: recentTimestamps.length >= MAX_REQUESTS (5) ?"}:::decisionClass
    R6["Node 6: requestCounts.set(userId, recentTimestamps)<br/>Return false (Bị chặn)"]:::errorClass
    R7["Node 7: recentTimestamps.push(now)<br/>requestCounts.set(userId, recentTimestamps)<br/>Return true (Hợp lệ)"]:::successClass
    REnd(["END"]):::startClass

    R1 --> R2
    R2 -- True --> R3 --> R4
    R2 -- False --> R4
    R4 --> R5
    R5 -- True (>= 5) --> R6 --> REnd
    R5 -- False (< 5) --> R7 --> REnd

    classDef startClass fill:#dbeafe,stroke:#3b82f6,stroke-width:2px;
    classDef decisionClass fill:#fef3c7,stroke:#f59e0b,stroke-width:2px;
    classDef processClass fill:#f1f5f9,stroke:#94a3b8,stroke-width:1px;
    classDef errorClass fill:#fee2e2,stroke:#ef4444,stroke-width:1px;
    classDef successClass fill:#d1fae5,stroke:#10b981,stroke-width:2px;
```

### 4.3 Phân tích Luồng Dữ Liệu (Data Flow Analysis) cho `checkAIRateLimit`
| Biến (Variable) | Node | Hành động (Action) | Ý nghĩa (Description) | DU-Path |
|---|:---:|:---:|---|---|
| `timestamps` | 4 | **def** | Gán từ `requestCounts.get(userId)` | (Node 4 $\to$ Node 4) |
| `timestamps` | 4 | **c-use** | Sử dụng trong `.filter(...)` tính `recentTimestamps` | (Được bao phủ 100%) |
| `recentTimestamps` | 4 | **def** | Khởi tạo mảng kết quả sau khi lọc theo `WINDOW_MS` | (Node 4 $\to$ Node 5, 6, 7) |
| `recentTimestamps` | 5 | **p-use** | Kiểm tra độ dài `.length >= MAX_REQUESTS` | (Node 4 $\to$ Node 5 [True/False]) |
| `recentTimestamps` | 6 | **c-use** | Ghi đè vào `requestCounts` khi bị chặn rate limit | (Node 4 $\to$ Node 5 $\to$ Node 6) |
| `recentTimestamps` | 7 | **c-use** | Gọi `.push(now)` và ghi đè vào `requestCounts` khi hợp lệ | (Node 4 $\to$ Node 5 $\to$ Node 7) |

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

