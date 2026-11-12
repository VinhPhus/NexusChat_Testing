# White-Box Test Cases — message module

> **TV2 (Ookinaha)** | Phạm vi: `messageController.js`, `messageHelper.js`

---

## 1. Control-Flow Graph (CFG) — `getEffectiveStreak`

```
       START
         │
         ▼
 ┌───────────────────────────────────────────┐
 │  !streak || !streak.lastMessageDate       │
 │  || !streak.count ?                       │
 └───────────────────────────────────────────┘
         │                        │
       TRUE                     FALSE
         │                        │
         ▼                        ▼
  return {count:0,         dayDiff = getDayDifference(
  lastMsgDate:null,          streak.lastMessageDate, now)
  senders:[],                       │
  isBothMessaged:false}             ▼
         │               ┌────────────────────┐
         │               │  dayDiff >= 2 ?     │
         │               └────────────────────┘
         │                     │          │
         │                   TRUE       FALSE
         │                     │          │
         │                     ▼          ▼
         │            return {count:0,  isBoth = (dayDiff===0)
         │            lastMsgDate:      ? Boolean(streak.isBothMessaged)
         │            streak.last...,  : false
         │            senders:[],              │
         │            isBothMessaged:false}    ▼
         │                     │      senders = (dayDiff===0
         │                     │       && Array.isArray(streak.senders))
         │                     │       ? streak.senders : []
         │                     │              │
         │                     │              ▼
         │                     │       return {
         │                     │         count: streak.count,
         │                     │         lastMessageDate: streak.lastMessageDate,
         │                     │         senders,
         │                     │         isBothMessaged: isBoth
         │                     │       }
         │                     │              │
         └─────────────────────┴──────────────┘
                               │
                              END
```

**Các nhánh (branches):**

| Nhánh | Điều kiện | Hướng |
|-------|-----------|-------|
| B1 | `!streak \|\| !streak.lastMessageDate \|\| !streak.count` | TRUE → early return |
| B2 | same as B1 | FALSE → tính dayDiff |
| B3 | `dayDiff >= 2` | TRUE → chuỗi đứt |
| B4 | `dayDiff >= 2` | FALSE → tiếp tục |
| B5 | `dayDiff === 0` (ternary isBoth) | TRUE → isBoth = streak.isBothMessaged |
| B6 | `dayDiff === 0` (ternary isBoth) | FALSE (dayDiff=1) → isBoth = false |
| B7 | `dayDiff === 0 && Array.isArray(streak.senders)` | TRUE → senders = streak.senders |
| B8 | same as B7 | FALSE → senders = [] |

---

## 2. Cyclomatic Complexity

### 2.1 `getEffectiveStreak`

Formula: **M = E − N + 2P**

| Phần tử | Số lượng |
|---------|----------|
| Nodes (N) | 10 |
| Edges (E) | 13 |
| Connected components (P) | 1 |

> **M = 13 − 10 + 2 = 5**

Hoặc đếm điều kiện độc lập:
1. `!streak || !streak.lastMessageDate || !streak.count`
2. `dayDiff >= 2`
3. `dayDiff === 0` (ternary isBoth)
4. `dayDiff === 0 && Array.isArray(streak.senders)` (ternary senders)

**M = 4 + 1 = 5** ✓

### 2.2 `sendDirectMessage`

Các điều kiện độc lập:

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

**M = 10 + 1 = 11**

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

> _Tài liệu được tạo bởi TV2 (Ookinaha) — NexusChat White-Box Testing Sprint_
