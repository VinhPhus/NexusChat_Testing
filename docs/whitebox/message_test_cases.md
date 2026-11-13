# White-Box Test Cases — message module

> **TV2 (PhuongBao)** | Phạm vi: `messageController.js`, `messageHelper.js`
> Cập nhật test và coverage: 2026-11-13.

---

## 1. Control-Flow Graph (CFG) — `getEffectiveStreak`

```mermaid
flowchart TD
    A([START]) --> B{!streak?}
    B -- yes --> Z1[Return empty streak]
    B -- no --> C{!streak.lastMessageDate?}
    C -- yes --> Z1
    C -- no --> D{!streak.count?}
    D -- yes --> Z1
    D -- no --> E[Calculate dayDiff]
    E --> F{dayDiff >= 2?}
    F -- yes --> Z2[Return reset effective streak]
    F -- no --> G{dayDiff === 0?}
    G -- yes --> H[isBoth = Boolean(streak.isBothMessaged)]
    G -- no --> I[isBoth = false]
    H --> J{dayDiff === 0?}
    I --> J
    J -- no --> K[senders = []]
    J -- yes --> L{Array.isArray(streak.senders)?}
    L -- yes --> M[senders = streak.senders]
    L -- no --> K
    K --> N[Return streak count, date, senders, isBoth]
    M --> N
```

**Các nhánh (branches):**

| Nhánh | Điều kiện | Hướng |
|-------|-----------|-------|
| B1–B3 | `!streak`, `!streak.lastMessageDate`, `!streak.count` | Mỗi điều kiện có nhánh true (return) và false (tiếp tục) |
| B4 | `dayDiff >= 2` | TRUE → chuỗi đứt |
| B5 | `dayDiff >= 2` | FALSE → tiếp tục |
| B6 | `dayDiff === 0` (ternary isBoth) | TRUE → lấy `isBothMessaged` |
| B7 | `dayDiff === 0` (ternary isBoth) | FALSE → `false` |
| B8 | `dayDiff === 0` (ternary senders) | TRUE → kiểm tra kiểu senders |
| B9 | `Array.isArray(streak.senders)` | TRUE → giữ senders |
| B10 | `Array.isArray(streak.senders)` | FALSE → senders rỗng |

---

## 2. Cyclomatic Complexity

### 2.1 `getEffectiveStreak`

CFG chi tiết: [`getEffectiveStreak`](./message_CFG.drawio).

| Phần tử | Số lượng |
|---------|----------|
| Nodes (N) | 17 |
| Edges (E) | 23 |
| Connected components (P) | 1 |

> **V(G) = 23 − 17 + 2 = 8**

CFG tách từng toán hạng short-circuit của guard và biểu thức `&&` khi tạo
`senders`. `dayDiff === 0` được kiểm tra riêng cho `isBothMessaged` và
`senders`, đúng với hai điểm quyết định trong source.

Các predicate của CFG:
1. `!streak`
2. `!streak.lastMessageDate`
3. `!streak.count`
4. `dayDiff >= 2`
5. `dayDiff === 0` (ternary `isBothMessaged`)
6. `dayDiff === 0` (vế trái của `&&` khi tạo `senders`)
7. `Array.isArray(streak.senders)`

**V(G) = 7 + 1 = 8**

### 2.2 `sendDirectMessage`

Một số điều kiện cấp cao (không phải danh sách đầy đủ để tính CC):

| # | Điều kiện |
|---|-----------|
| 1 | `!content && !audioUrl && !req.body.imgUrl && !fileUrl && !sharedContactId` |
| 2 | `recipientId` truthy |
| 3 | `!conversation && conversationId` |
| 4 | `checkConvo && checkConvo.participants.some(...)` |
| 5 | `!conversation` (create new) |
| 6 | `conversation.incognitoMode && conversation.incognitoMode.isActive` |
| 7 | `new Date() > new Date(conversation.incognitoMode.expiresAt)` |
| 8 | `!finalExpiresAt && finalExpiresIn` |
| 9 | `io` truthy |
| 10 | `content?.includes("@NexusAI") \|\| (mentions && mentions.includes(...))` |

> Bản nháp trước ghi `M = 11` nhưng bảng trên bỏ sót nhánh `else if`,
> shared contact và exception. Không dùng con số đó làm CC chính thức. CFG
> rút gọn trong [`message_CFG.drawio`](./message_CFG.drawio) gộp mỗi biểu thức
> điều kiện thành một predicate và gộp các return vào một nút thoát ảo:
> `E = 37`, `N = 25`, `P = 1`, nên `V(G) = 37 − 25 + 2 = 14`.
> Đây là CC của CFG rút gọn, chưa phải CC source-level theo quy trình
> `02_QUY_TRINH_KIEM_THU_WHITEBOX.md`, vì các toán tử `&&` / `||` và nhánh
> exception chưa được bung thành từng predicate riêng.

### 2.3 `updateConversationAfterCreateMessage`

Theo CFG trong [`message_CFG.drawio`](./message_CFG.drawio), các biểu thức
`finalContent` được nhóm thành một khối xử lý và các nhánh streak được giữ
riêng:

| Phần tử | Số lượng |
|---------|----------|
| Nodes (N) | 17 |
| Edges (E) | 21 |
| Connected components (P) | 1 |

> **V(G) = 21 − 17 + 2 = 6 (CFG rút gọn)**

Phần `finalContent`, short-circuit, unread count và xử lý exception được nhóm
trong CFG này. Con số 6 không phải CC source-level của toàn hàm.

### 2.4 Basis Paths

**`getEffectiveStreak` — source-level V(G) = 8**
1. `TC-GS-01`: `streak` thiếu.
2. `TC-GS-03`: `streak` có nhưng `lastMessageDate` thiếu.
3. `TC-GS-02`: `streak` và ngày có nhưng `count` bằng 0.
4. `TC-GS-04`: guard hợp lệ, `dayDiff >= 2`.
5. `TC-GS-06`: cùng ngày, `isBothMessaged` truthy và `senders` là array.
6. `TC-GS-07`: cùng ngày, `senders` không phải array.
7. `TC-GS-05`: `dayDiff = 1`.
8. Predicate `dayDiff === 0` được đánh giá lần hai trong biểu thức `senders`.
   Đây là điểm quyết định lặp trên cùng giá trị; đường đi độc lập thứ 8 về mặt
   đồ thị không khả thi độc lập với predicate ngày ở mục 5–7. Vì vậy không
   khẳng định đạt 100% path coverage chỉ từ branch coverage.

**`sendDirectMessage` — V(G) = 14 trên CFG rút gọn**
1. `TC-SM-01`: thiếu nội dung, trả HTTP 400.
2. `TC-SM-02`: conversation direct đã có, nhánh gửi thường.
3. `TC-SM-10`: fallback conversation ID và người nhận là participant.
4. `TC-SM-11`: fallback ID không hợp lệ, tạo conversation mới.
5. `TC-SM-12`: không có recipient ID, tra theo conversation ID.
6. Nhánh không có recipient ID và conversation ID: chưa có test; source hiện tại vẫn tạo conversation với recipient chưa xác định.
7. `TC-SM-03`: không tìm thấy conversation, tạo conversation.
8. `TC-SM-04`: incognito hoạt động và chưa hết hạn.
9. `TC-SM-05`: incognito hết hạn.
10. `TC-SM-06`: có `expiresIn` tùy chỉnh.
11. `TC-SM-09`: shared contact.
12. `TC-SM-13`: phát socket event.
13. `TC-SM-07` / `TC-SM-14`: kích hoạt AI qua nội dung hoặc mention ID.
14. `TC-SM-15`: exception, trả HTTP 500.

**`updateConversationAfterCreateMessage` — V(G) = 6 trên CFG rút gọn**
1. `TC-UC-07`: conversation nhóm, không xử lý streak.
2. `TC-UC-02`: streak chưa có ngày cuối, bắt đầu từ 1.
3. `TC-UC-03`: streak đứt, khởi động lại từ 1.
4. `TC-UC-04`: ngày kế tiếp và cả hai bên đã nhắn.
5. `TC-UC-05`: ngày kế tiếp nhưng chưa đủ hai bên.
6. `TC-UC-06`: cùng ngày, giữ count.

`getDayDifference` có 3 luồng ở mức short-circuit: `d1` thiếu, `d1` có nhưng
`d2` thiếu, và cả hai ngày hợp lệ; vì vậy **V(G) = 3** (được kiểm tra bởi
`TC-DD-01` đến `TC-DD-05`).

---

## 3. Data Flow Analysis — `getEffectiveStreak`

### Biến `dayDiff`

| Vị trí | Loại | Ghi chú |
|--------|------|---------|
| Line 17 | **DEF** | `const dayDiff = getDayDifference(streak.lastMessageDate, now)` |
| Line 19 | **USE** | `if (dayDiff >= 2)` — predicate use |
| Line 23 | **USE** | `dayDiff === 0 ? ... : false` — predicate use (isBoth) |
| Line 27 | **USE** | `dayDiff === 0 && Array.isArray(...)` — predicate use (senders) |

**Def-use pairs cho `dayDiff`:**
- (L17, L19): def → guard chuỗi đứt
- (L17, L23): def → tính isBoth
- (L17, L27): def → tính senders

### Biến `isBoth` (alias `isBothMessaged`)

| Vị trí | Loại | Ghi chú |
|--------|------|---------|
| Line 23 | **DEF** | `const isBoth = dayDiff === 0 ? Boolean(streak.isBothMessaged) : false` |
| Line 28 | **USE** | `isBothMessaged: isBoth` — computation use |

**Def-use pairs:** (L23, L28)

### Biến `count`

| Vị trí | Loại | Ghi chú |
|--------|------|---------|
| `streak.count` (input) | **DEF (external)** | Giá trị đầu vào |
| Line 13 | **USE** | `!streak.count` — guard |
| Line 25 | **USE** | `count: streak.count` — computation use |

**Def-use pairs:** (input, L13), (input, L25)

---

## 4. Bảng Test Cases — `getDayDifference`

| ID | Mô tả | Input d1 | Input d2 | Expected | Nhánh | Kỹ thuật |
|----|-------|----------|----------|----------|-------|----------|
| TC-DD-01 | d1 null | `null` | `new Date()` | `0` | B: `!d1` | Branch |
| TC-DD-02 | d2 null | `new Date()` | `null` | `0` | B: `!d2` | Branch |
| TC-DD-03 | Cùng ngày | `2024-05-10` | `2024-05-10` | `0` | Nominal | Statement |
| TC-DD-04 | d2 sau 1 ngày | `2024-05-10` | `2024-05-11` | `1` | Nominal | Path |
| TC-DD-05 | d2 sau 2 ngày | `2024-05-10` | `2024-05-12` | `2` | Nominal | Path |

---

## 5. Bảng Test Cases — `getEffectiveStreak`

| ID | Mô tả | Input streak | dayDiff (ước tính) | Expected count | Expected isBothMessaged | Nhánh được test |
|----|-------|-------------|-------------------|---------------|------------------------|-----------------|
| TC-GS-01 | streak null | `null` | — | 0 | false | B1 TRUE |
| TC-GS-01b | streak undefined | `undefined` | — | 0 | false | B1 TRUE |
| TC-GS-02 | count = 0 | `{count:0, lastMessageDate:new Date()}` | — | 0 | false | B1 TRUE (count falsy) |
| TC-GS-03 | lastMessageDate null | `{count:5, lastMessageDate:null}` | — | 0 | false | B1 TRUE |
| TC-GS-04 | dayDiff ≥ 2 | `{count:7, lastMessageDate:3 ngày trước}` | 3 | 0 | false | B3 TRUE |
| TC-GS-05 | dayDiff = 1 | `{count:5, lastMessageDate:hôm qua}` | 1 | 5 | false | B3 FALSE, B5 FALSE |
| TC-GS-06 | dayDiff = 0 | `{count:3, lastMessageDate:hôm nay, isBothMessaged:true}` | 0 | 3 | true | B3 FALSE, B5 TRUE |

---

## 6. Bảng Test Cases — `updateConversationAfterCreateMessage` (finalContent)

| ID | Mô tả | isViewOnce | content | fileUrl | imgUrl | audioUrl | poll | sharedContact | Expected finalContent |
|----|-------|-----------|---------|---------|--------|---------|------|--------------|----------------------|
| TC-FC-01 | Text thường | false | "Xin chào!" | — | — | — | — | — | "Xin chào!" |
| TC-FC-02 | isViewOnce | true | "bí mật" | — | — | — | — | — | "[Tin nhắn xem một lần]" |
| TC-FC-03 | fileUrl | false | — | "https://..." | — | — | — | — | "Đã gửi tệp tin" |
| TC-FC-04 | imgUrl | false | — | — | "https://..." | — | — | — | "Đã gửi 1 ảnh" |
| TC-FC-05 | audioUrl | false | — | — | — | "https://..." | — | — | "Đã gửi tin nhắn thoại" |
| TC-FC-06 | poll | false | — | — | — | — | `{options:[...]}` | — | "Đã tạo một bình chọn" |
| TC-FC-07 | sharedContact | false | — | — | — | — | — | `{_id:"c1"}` | "Đã chia sẻ 1 liên hệ" |
| TC-FC-08 | Rỗng hoàn toàn | false | — | — | — | — | — | — | "" |

---

## 7. Bảng Test Cases — `sendDirectMessage`

| ID | Mô tả | Điều kiện đầu vào | Expected Status | Hành vi kiểm tra | Kỹ thuật |
|----|-------|-----------------|-----------------|-----------------|---------|
| TC-SM-01 | Thiếu tất cả nội dung | content/audio/img/file/contact đều undefined | 400 | res.status(400) | Branch |
| TC-SM-02 | Text bình thường, conv sẵn | content="Hello", Conversation.findOne trả conv | 201 | Conversation.create KHÔNG gọi | Path |
| TC-SM-03 | Chưa có conv | findOne → null | 201 | Conversation.create được gọi | Branch |
| TC-SM-04 | incognito active, chưa hết hạn | incognitoMode.expiresAt = tương lai | 201 | expiresAt = incognitoMode.expiresAt, expiresIn = null | Branch |
| TC-SM-05 | incognito active, đã hết hạn | incognitoMode.expiresAt = quá khứ | 201 | isActive → false | Branch |
| TC-SM-06 | expiresIn có giá trị | expiresIn = 300 | 201 | expiresAt ≈ now + 300s | Path |
| TC-SM-07 | Mention @NexusAI | content = "@NexusAI ..." | 201 | handleAIResponse được gọi | Branch |
| TC-SM-08 | isViewOnce = true | isViewOnce = true | 201 | Message.create nhận isViewOnce: true | Statement |

---

## 8. Test cases bổ sung và kết quả

Ba file Jest bao phủ helper và các endpoint trong controller:

- [`messageController.test.js`](../../tests/whitebox/message/messageController.test.js)
- [`messageControllerOther.test.js`](../../tests/whitebox/message/messageControllerOther.test.js)
- [`messageHelper.test.js`](../../tests/whitebox/message/messageHelper.test.js)

Các tình huống bổ sung cho `sendDirectMessage`: gửi audio/ảnh/file/liên hệ,
fallback theo conversation ID, không dùng conversation của người khác, gửi theo
conversation ID không có recipient, phát socket, gọi AI qua mention ID và trả
HTTP 500 khi tạo message lỗi.

Suite bổ sung kiểm tra các nhánh thành công, lỗi, phân quyền, socket và dữ liệu
ranh giới của `sendGroupMessage`, upload audio/image/file, reaction, pin,
view-once, recall, poll, translate, edit và delete. Các tình huống helper gồm
unread counts, streak mới/bị đứt/sang ngày mới/cùng ngày, cả hai người đã nhắn,
participant ID nhiều dạng và group không cập nhật streak.

| Test Case | Nhánh/đường dẫn được kiểm tra |
|---|---|
| `TC-SM-09` (4 trường hợp) | Chỉ có audio, ảnh, file hoặc shared contact |
| `TC-SM-10` | Fallback conversation ID; người nhận là participant |
| `TC-SM-11` | Fallback ID không thuộc người nhận; tạo conversation mới |
| `TC-SM-12` | Tra conversation ID khi không có recipient ID |
| `TC-SM-13`, `TC-SM-13b` | Socket có/không có `unreadCounts` |
| `TC-SM-14` | Nhánh gọi NexusAI qua mention ID |
| `TC-SM-15` | Exception khi tạo message, trả HTTP 500 |
| `TC-GS-07` | `senders` không phải array |
| `TC-UC-01` | Unread count và streak khởi tạo |
| `TC-UC-02`–`TC-UC-06` | Các luồng streak mới, đứt, ngày kế tiếp và cùng ngày |
| `TC-UC-07` | Tin nhắn nhóm không cập nhật streak |
| `TC-UC-08`, `TC-UC-09` | Dạng participant ID và số participant |
| `messageControllerOther.test.js` | 38 test cho 12 endpoint còn lại, gồm success/error/permission/notification paths |

| Phạm vi | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| `messageHelper.js` | 100% | 93.75% | 100% | 100% |
| `messageController.js` toàn file | 99.07% | 90.19% | 93.75% | 99.01% |

**Đạt chỉ tiêu của nhóm:** controller đạt Statement ≥ 90% và Branch ≥ 80%;
helper cũng đạt cả hai ngưỡng. Ba dòng chưa được thực thi trong controller là
nhánh xóa `gameEvent` khi thu hồi tin nhắn. Source import
`backend/src/models/Game.js`, nhưng model này không có trong repository; luồng
này không thể kiểm thử thành công với source hiện tại.

`sendDirectMessageFile` có trong bảng phân công nhưng không có hàm/export trong
`messageController.js` hiện tại. Nhánh không có cả `recipientId` lẫn
`conversationId` của `sendDirectMessage` cũng chưa được chạy; source hiện tại
vẫn đi vào tạo conversation với recipient chưa xác định.

### Lệnh kiểm thử và kết quả

Chạy từ thư mục `backend`:

```bash
npm run test:coverage -- --runTestsByPath ../tests/whitebox/message/messageController.test.js ../tests/whitebox/message/messageControllerOther.test.js ../tests/whitebox/message/messageHelper.test.js
```

Kết quả: **3 suites passed, 87 tests passed**. `messageController.js` đạt
99.07% statements / 90.19% branches; `messageHelper.js` đạt 100% / 93.75%.

> _Tài liệu được cập nhật bởi TV2 (PhuongBao) — NexusChat White-Box Testing Sprint_
