# BÁO CÁO ĐẶC TẢ KIỂM THỬ HỘP TRẮNG (WHITE-BOX TESTING REPORT)
## Module: Người dùng, AI Rate Limiter & Dịch thuật (User, AI Rate Limiter, Translate)
> **Dự án:** Hệ thống tin nhắn thời gian thực NexusChat  
> **Thành viên phụ trách:** Thành viên 4 (Nhật Duy)  
> **Mã công việc (Jira):** KAN-36 / White-Box Testing Module 4  

---

## 1. Thông tin chung & Mục tiêu kiểm thử

- **Thành viên thực hiện**: Lê Nguyễn Nhật Duy (TV4)
- **Phạm vi mã nguồn phụ trách kiểm thử**:
  1. `backend/src/controllers/userController.js`: Các hàm nghiệp vụ trọng yếu gồm Tìm kiếm người dùng (`searchUserByUsername`), Đổi mật khẩu qua OTP (`changePasswordWithOtp`), Xóa tài khoản qua OTP (`deleteAccountWithOtp`), Lấy thông tin bản thân (`authMe`), Lấy tổng số người dùng (`getUserCount`).
  2. `backend/src/middlewares/aiRateLimiter.js`: Thuật toán Sliding Window kiểm soát tần suất gọi AI (`checkAIRateLimit`) và Express Middleware (`aiRateLimiterMiddleware`).
  3. `backend/src/services/translateService.js`: Dịch vụ dịch thuật đa tầng tự động dự phòng 4 cấp (`translateText` - Multi-tier Fallback: Google GTX $\to$ Google Dict $\to$ MyMemory $\to$ Gemini AI $\to$ Exception).
- **File kịch bản kiểm thử Jest tương ứng**:
  - `tests/whitebox/user/userController.test.js` (22 ca kiểm thử)
  - `tests/whitebox/middleware/aiRateLimiter.test.js` (8 ca kiểm thử)
  - `tests/whitebox/services/translateService.test.js` (12 ca kiểm thử)
  - **Tổng cộng: 42 ca kiểm thử hoàn chỉnh (42/42 Passed - 100%)**
- **Chỉ tiêu độ bao phủ đạt được**:
  - **Statement Coverage**: **100%** (Mục tiêu nhóm đề ra $\ge 90\%$)
  - **Branch Coverage**: **85.45%** (Mục tiêu nhóm đề ra $\ge 80\%$)
  - **Function Coverage**: **100%**
  - **Line Coverage**: **100%**

---

## 2. Phân tích đồ thị dòng điều khiển (CFG) & Độ phức tạp Cyclomatic

### 2.1. Đồ thị CFG & 6 Basis Paths của hàm `translateText()` (Dịch thuật Fallback 4 tầng)

Hàm `translateText` trong `backend/src/services/translateService.js` xử lý dịch văn bản theo kiến trúc dự phòng 4 tầng tuần tự, tránh gián đoạn dịch vụ khi một bên thứ ba gặp sự cố.

#### Đoạn mã nguồn có đánh số Node:
```javascript
export async function translateText(text, targetLang = "vi") {
  /* [Node 1] Entry */
  /* [Node 2 - Predicate] */ if (!text || !text.trim()) {
  /* [Node 3] */   return text;
  }

  // Tầng 1: Google GTX
  try {
  /* [Node 4] */   const result = await translateWithGoogleGtx(text, targetLang);
  /* [Node 5] */   return result;
  } catch (err1) {
  /* [Node 6] */   console.warn("⚠️ [Translate] Google GTX lỗi:", err1.message);
  }

  // Tầng 2: Google Dict Extension
  try {
  /* [Node 7] */   const result = await translateWithGoogleDict(text, targetLang);
  /* [Node 8] */   return result;
  } catch (err2) {
  /* [Node 9] */   console.warn("⚠️ [Translate] Google Dict lỗi:", err2.message);
  }

  // Tầng 3: MyMemory
  try {
  /* [Node 10] */  const result = await translateWithMyMemory(text, targetLang);
  /* [Node 11] */  return result;
  } catch (err3) {
  /* [Node 12] */  console.warn("⚠️ [Translate] MyMemory lỗi:", err3.message);
  }

  // Tầng 4: Gemini AI
  try {
  /* [Node 13] */  const result = await translateWithGemini(text, targetLang);
  /* [Node 14] */  return result;
  } catch (err4) {
  /* [Node 15] */  console.error("❌ Tất cả phương thức dịch đều thất bại:", err4.message);
  /* [Node 16] */  throw new Error("Không thể dịch tin nhắn vào lúc này. Vui lòng thử lại sau.");
  }
}
```

#### Sơ đồ dòng điều khiển CFG (Render trực tiếp qua Mermaid):
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

#### Tính toán độ phức tạp Cyclomatic Complexity ($V(G)$):
* **Số nút quyết định (Predicate Nodes - $P$)**: Có 5 điểm rẽ nhánh độc lập:
  1. $N_2$: `!text || !text.trim()`
  2. $N_5$: `try/catch` Google GTX
  3. $N_8$: `try/catch` Google Dict
  4. $N_{11}$: `try/catch` MyMemory
  5. $N_{14}$: `try/catch` Gemini AI
* **Công thức**:
  $$V(G) = P + 1 = 5 + 1 = \mathbf{6}$$
  Hoặc theo số cung và số nút: $E = 20, N = 16 \implies V(G) = E - N + 2 = 20 - 16 + 2 = \mathbf{6}$.

#### Thiết kế 6 Đường dẫn cơ sở độc lập (6 Basis Paths):
1. **Path 1 (Văn bản rỗng/khoảng trắng)**:
   $$N_1 \to N_2 \text{ [True]} \to N_3 \to \text{END}$$
   *Đặc tả*: Input chuỗi rỗng `""` hoặc `"   "` $\to$ Trả về chuỗi gốc ngay không gọi API.
2. **Path 2 (Tầng 1 - Google GTX thành công)**:
   $$N_1 \to N_2 \text{ [False]} \to N_4 \to N_5 \text{ [Success]} \to N_5\text{a} \to \text{END}$$
   *Đặc tả*: GTX API phản hồi HTTP 200 kèm mảng kết quả $\to$ Trả về kết quả dịch từ GTX.
3. **Path 3 (Tầng 1 lỗi $\to$ Tầng 2 Google Dict thành công)**:
   $$N_1 \to N_2 \to N_4 \to N_5 \text{ [Error]} \to N_6 \to N_7 \to N_8 \text{ [Success]} \to N_8\text{a} \to \text{END}$$
   *Đặc tả*: Mock GTX lỗi 500 $\to$ Fallback sang Google Dict thành công $\to$ Trả về kết quả từ Dict.
4. **Path 4 (Tầng 1, 2 lỗi $\to$ Tầng 3 MyMemory thành công)**:
   $$N_1 \to N_2 \to N_4 \to N_5 \to N_6 \to N_7 \to N_8 \text{ [Error]} \to N_9 \to N_{10} \to N_{11} \text{ [Success]} \to N_{11}\text{a} \to \text{END}$$
   *Đặc tả*: GTX timeout, Dict trả dữ liệu không hợp lệ $\to$ MyMemory trả về kết quả $\to$ Trả về kết quả MyMemory.
5. **Path 5 (Tầng 1, 2, 3 lỗi $\to$ Tầng 4 Gemini AI thành công)**:
   $$N_1 \to N_2 \to N_4 \to N_5 \to N_6 \to N_7 \to N_8 \to N_9 \to N_{10} \to N_{11} \text{ [Error]} \to N_{12} \to N_{13} \to N_{14} \text{ [Success]} \to N_{14}\text{a} \to \text{END}$$
   *Đặc tả*: Cả 3 dịch vụ Google/MyMemory đều lỗi $\to$ Kích hoạt Gemini 2.5 Flash $\to$ Trả về bản dịch từ AI.
6. **Path 6 (Toàn bộ 4 tầng đều lỗi $\to$ Throw Exception)**:
   $$N_1 \to N_2 \to N_4 \to N_5 \to N_6 \to N_7 \to N_8 \to N_9 \to N_{10} \to N_{11} \to N_{12} \to N_{13} \to N_{14} \text{ [Error]} \to N_{15} \to N_{16} \to \text{END}$$
   *Đặc tả*: Tất cả 4 tầng đều ném exception $\to$ Bắt lỗi tổng và throw Error báo người dùng thử lại sau.

---

### 2.2. Đồ thị CFG & Phân tích Dòng dữ liệu (Data Flow) của hàm `checkAIRateLimit()`

#### Đoạn mã nguồn có đánh số Node:
```javascript
export const checkAIRateLimit = (userId) => {
  /* [Node 1] */ const now = Date.now();
  /* [Node 2 - Predicate] */ if (!requestCounts.has(userId)) {
  /* [Node 3] */   requestCounts.set(userId, []);
  }

  /* [Node 4] */ const timestamps = requestCounts.get(userId);
  /* [Node 4] */ const recentTimestamps = timestamps.filter(time => now - time < WINDOW_MS);
  
  /* [Node 5 - Predicate] */ if (recentTimestamps.length >= MAX_REQUESTS) {
  /* [Node 6] */   requestCounts.set(userId, recentTimestamps);
  /* [Node 6] */   return false; // Vượt quá giới hạn
  }

  /* [Node 7] */ recentTimestamps.push(now);
  /* [Node 7] */ requestCounts.set(userId, recentTimestamps);
  /* [Node 7] */ return true; // Hợp lệ
};
```

#### Sơ đồ dòng điều khiển CFG (Render qua Mermaid):
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

#### Độ phức tạp Cyclomatic $V(G)$:
- Số nút điều kiện: $P = 2$ ($Node\ 2, Node\ 5$).
- $$V(G) = P + 1 = 2 + 1 = \mathbf{3}$$
- Gồm 3 đường dẫn độc lập:
  - **Path 1**: $R_1 \to R_2 \text{ [True]} \to R_3 \to R_4 \to R_5 \text{ [False]} \to R_7 \to \text{END}$ (User mới $\to$ Tạo danh sách rỗng $\to$ Cho phép).
  - **Path 2**: $R_1 \to R_2 \text{ [False]} \to R_4 \to R_5 \text{ [False]} \to R_7 \to \text{END}$ (User cũ $\to$ Số request $< 5 \to$ Cho phép).
  - **Path 3**: $R_1 \to R_2 \text{ [False]} \to R_4 \to R_5 \text{ [True]} \to R_6 \to \text{END}$ (User cũ $\to$ Số request $\ge 5 \to$ Chặn).

---

### 2.3. Phân tích Dòng Dữ Liệu (Data Flow Analysis) cho `timestamps` và `recentTimestamps`

Kiểm thử dòng dữ liệu kiểm tra chu kỳ sống của các biến qua các thao tác: **def** (định nghĩa/gán giá trị), **c-use** (sử dụng trong tính toán), **p-use** (sử dụng trong biểu thức điều kiện), và **kill** (hủy/ra khỏi phạm vi).

#### 1. Biến `timestamps`:
| Node | Thao tác (Action) | Đoạn mã tương ứng | Ý nghĩa |
|:---:|:---:|:---|:---|
| **Node 4** | **def** | `const timestamps = requestCounts.get(userId);` | Định nghĩa mảng lịch sử timestamp lấy từ Map. |
| **Node 4** | **c-use** | `timestamps.filter(time => now - time < WINDOW_MS);` | Dùng trong biểu thức lọc lấy các mốc thời gian trong vòng 60 giây. |
| **Sau Node 4** | **kill** | Biến cục bộ kết thúc phạm vi sử dụng trong hàm. | Không còn được tham chiếu trong các bước sau. |

* **def-use chain**: $(Node\ 4 \to Node\ 4)$ — Chuỗi định nghĩa và sử dụng hoàn tất, không tồn tại lỗi biến chưa khởi tạo (undefined use) hay biến thừa không dùng.

#### 2. Biến `recentTimestamps`:
| Node | Thao tác (Action) | Đoạn mã tương ứng | Ý nghĩa |
|:---:|:---:|:---|:---|
| **Node 4** | **def** | `const recentTimestamps = timestamps.filter(...);` | Tạo mảng mới chứa các timestamp hợp lệ trong window 60s. |
| **Node 5** | **p-use** | `if (recentTimestamps.length >= MAX_REQUESTS)` | Sử dụng thuộc tính `length` trong câu lệnh rẽ nhánh điều kiện. |
| **Node 6** | **c-use** | `requestCounts.set(userId, recentTimestamps);` | Dùng làm giá trị cập nhật lại Map khi vượt ngưỡng rate limit. |
| **Node 7** | **c-use** | `recentTimestamps.push(now);`<br>`requestCounts.set(userId, recentTimestamps);` | Dùng để push thời điểm hiện tại và lưu vào Map khi request hợp lệ. |

* **def-use paths (du-paths)**:
  1. $Node\ 4 \xrightarrow{\text{def}} Node\ 5 \xrightarrow{\text{p-use}} Node\ 6 \xrightarrow{\text{c-use}}$ (Nhánh vượt ngưỡng).
  2. $Node\ 4 \xrightarrow{\text{def}} Node\ 5 \xrightarrow{\text{p-use}} Node\ 7 \xrightarrow{\text{c-use}}$ (Nhánh chấp nhận request).
* **Kết luận Data Flow**: Tất cả các du-paths đều được bao phủ 100% thông qua các kịch bản kiểm thử `TC-RL-01`, `TC-RL-02`, `TC-RL-03`, và `TC-RL-04`.

---

## 3. Ma trận Ca kiểm thử White-Box (42 Test Cases)

### 3.1. Module `translateService.js` (12 Test Cases)

| STT | Mã Test Case | Hàm / Đường dẫn | Dữ liệu đầu vào (Input) | Điều kiện Tiền đề (Pre-condition / Mock) | Kết quả mong đợi (Expected Output) | Kỹ thuật áp dụng | Trạng thái |
|:---:|:---|:---|:---|:---|:---|:---|:---:|
| 1 | `TC-TR-01` | `translateText` (Path 1) | `text = ""` hoặc `"   "` | Không cần mock | Trả về nguyên văn bản mà không gọi bất kỳ API nào | Boundary / Early Return | **PASS** |
| 2 | `TC-TR-02` | `translateText` (Path 2) | `text = "Hello", targetLang = "vi"` | Mock `fetch` trả về dữ liệu chuẩn Google GTX | Nhận kết quả `"Xin chào"`, gọi `fetch` đúng 1 lần | Basis Path 2 | **PASS** |
| 3 | `TC-TR-03` | `translateText` (Path 3) | `text = "Hello", targetLang = "vi"` | Tầng 1 mock lỗi 500; Tầng 2 (Dict) mock trả về mảng kết quả | Nhận kết quả từ Google Dict, gọi `fetch` 2 lần | Basis Path 3 (Fallback Tier 2) | **PASS** |
| 4 | `TC-TR-04` | `translateText` (Path 4) | `text = "Hello", targetLang = "vi"` | Tầng 1 ném exception; Tầng 2 trả JSON không hợp lệ; Tầng 3 (MyMemory) mock 200 | Nhận kết quả từ MyMemory, gọi `fetch` 3 lần | Basis Path 4 (Fallback Tier 3) | **PASS** |
| 5 | `TC-TR-05` | `translateText` (Path 5) | `text = "Hello", targetLang = "vi"` | Tầng 1, 2 lỗi mạng; Tầng 3 trả `responseStatus: 403`; Tầng 4 mock `generateContent` | Nhận kết quả từ Gemini AI, kích hoạt GoogleGenerativeAI mock | Basis Path 5 (Fallback Tier 4) | **PASS** |
| 6 | `TC-TR-06` | `translateText` (Path 6) | `text = "Hello", targetLang = "vi"` | Cả 4 tầng đều ném exception (HTTP lỗi & Gemini quota error) | Bắt lỗi tổng quát và throw Error: *"Không thể dịch tin nhắn vào lúc này..."* | Basis Path 6 (All Failed) | **PASS** |
| 7 | `TC-TR-07` | `translateWithGoogleDict` | `text = "Nested", targetLang = "vi"` | Google Dict trả về định dạng mảng lồng nhau `[["Bản dịch lồng nhau"]]` | Bóc tách mảng cấp 2 thành công và trả về bản dịch | Branch Coverage (Array nesting) | **PASS** |
| 8 | `TC-TR-08` | `translateWithGoogleGtx` | `text = "Test", targetLang = "vi"` | Google GTX trả về mảng chuỗi trắng rỗng `[[["   "]]]` | Kích hoạt ném lỗi định dạng Google GTX không hợp lệ | Exception Branch | **PASS** |
| 9 | `TC-TR-09` | `translateWithGoogleDict` | `text = "Test", targetLang = "vi"` | Google Dict trả về `ok: false, status: 400` | Ném lỗi `Google Clients5 HTTP 400` và chuyển sang MyMemory | Exception Branch | **PASS** |
| 10 | `TC-TR-10` | `translateWithMyMemory` | `text = "Test", targetLang = "en"` | MyMemory trả về status 200 nhưng thiếu trường `responseData.translatedText` | Ném lỗi không nhận được kết quả và chuyển sang Gemini AI | Exception Branch | **PASS** |
| 11 | `TC-TR-11` | `translateWithGemini` | `text = "Hello", targetLang = "vi"` | Xóa biến môi trường `GEMINI_API_KEY` | Báo lỗi thiếu API key và throw Error tổng | Boundary / Environment check | **PASS** |
| 12 | `TC-TR-12` | `translateWithGemini` | `text = "Hello", targetLang = "vi"` | Gemini phản hồi nhưng text rỗng `""` | Báo lỗi Gemini không trả về kết quả và throw Error tổng | Boundary / Empty response | **PASS** |

---

### 3.2. Module `aiRateLimiter.js` (8 Test Cases)

| STT | Mã Test Case | Hàm / Nhánh | Dữ liệu đầu vào (Input) | Điều kiện Tiền đề (Pre-condition) | Kết quả mong đợi (Expected Output) | Kỹ thuật áp dụng | Trạng thái |
|:---:|:---|:---|:---|:---|:---|:---|:---:|
| 13 | `TC-RL-01` | `checkAIRateLimit` (Nhánh 1) | `userId = "new_user_1"` | Chưa tồn tại trong Map | Trả về `true`, khởi tạo mảng rỗng trong Map | Branch Coverage | **PASS** |
| 14 | `TC-RL-02` | `checkAIRateLimit` (Nhánh 4) | `userId = "burst_user"`, lặp 5 lần | Gọi 5 lần liên tiếp trong 1 phút | Cả 5 lần đều trả về `true` | Boundary (Tại ngưỡng Max) | **PASS** |
| 15 | `TC-RL-03` | `checkAIRateLimit` (Nhánh 3) | `userId = "limit_user"`, lần thứ 6 | Đã có 5 timestamp trong 1 phút | Trả về `false` (Bị rate limit) | Boundary (Ngưỡng Max + 1) | **PASS** |
| 16 | `TC-RL-04` | `checkAIRateLimit` (Sliding) | `userId = "window_user"` | Mock `Date.now` trôi qua 61 giây | Timestamps cũ bị xóa $\to$ Request thứ 6 thành công (`true`) | Data Flow & Sliding Window | **PASS** |
| 17 | `TC-RL-MW-01` | `aiRateLimiterMiddleware` | `req.user = null` | Không có thông tin người dùng | Trả về HTTP 401 `{ message: "Unauthorized" }` | Branch Coverage | **PASS** |
| 18 | `TC-RL-MW-02` | `aiRateLimiterMiddleware` | `req.user = {}` (thiếu `_id`) | Có user nhưng thiếu ID định danh | Trả về HTTP 401 `{ message: "Unauthorized" }` | Branch Coverage | **PASS** |
| 19 | `TC-RL-MW-03` | `aiRateLimiterMiddleware` | `req.user._id = "valid_id"` | Request trong định mức cho phép ($< 5$) | Gọi `next()`, không gọi `res.status` | Branch Coverage (Success Path) | **PASS** |
| 20 | `TC-RL-MW-04` | `aiRateLimiterMiddleware` | `req.user._id = "blocked_id"` | Request thứ 6 vượt hạn mức | Trả về HTTP 429 *"Bạn thao tác quá nhanh..."* | Branch Coverage (Throttling) | **PASS** |

---

### 3.3. Module `userController.js` (22 Test Cases)

| STT | Mã Test Case | Hàm kiểm thử | Nhánh điều kiện kiểm tra | Dữ liệu đầu vào (Input) | Điều kiện Tiền đề (Mock) | Kết quả mong đợi (Expected Output) | Kỹ thuật | Trạng thái |
|:---:|:---|:---|:---|:---|:---|:---|:---:|:---:|
| 21 | `TC-US-01` | `searchUserByUsername` | Query rỗng | `query.username = ""` | Không cần mock | HTTP 400 *"Thiếu từ khóa tìm kiếm"* | Branch Coverage | **PASS** |
| 22 | `TC-US-02` | `searchUserByUsername` | Không có kết quả | `query.username = "nonexistent"` | Mock `User.find().limit` trả `[]` | HTTP 404 *"Không tìm thấy người dùng"* | Branch Coverage | **PASS** |
| 23 | `TC-US-03` | `searchUserByUsername` | Tìm thấy danh sách | `query.username = "duy"` | Mock `User.find().limit` trả danh sách users | HTTP 200 `{ users: [...] }` | Branch Coverage | **PASS** |
| 24 | `TC-US-04` | `searchUserByUsername` | DB Exception | `query.username = "error"` | Mock `User.find` throw Error | HTTP 500 *"Lỗi hệ thống"* | Exception Path | **PASS** |
| 25 | `TC-CP-01` | `changePasswordWithOtp` | Thiếu OTP hoặc pass mới | `otp = ""` hoặc `newPassword = ""` | Không cần mock | HTTP 400 *"Thiếu mã OTP hoặc mật khẩu mới"* | Branch Coverage | **PASS** |
| 26 | `TC-CP-02` | `changePasswordWithOtp` | Password < 6 ký tự | `newPassword = "Pass1"` | Không cần mock | HTTP 400 *"Mật khẩu mới phải có ít nhất 6 ký tự"* | BVA (Độ dài < 6) | **PASS** |
| 27 | `TC-CP-03` | `changePasswordWithOtp` | Thiếu chữ hoa | `newPassword = "password123"` | Không cần mock | HTTP 400 *"Thiếu chữ hoa (A-Z)"* | Regex Check | **PASS** |
| 28 | `TC-CP-04` | `changePasswordWithOtp` | Thiếu chữ thường | `newPassword = "PASSWORD123"` | Không cần mock | HTTP 400 *"Thiếu chữ thường (a-z)"* | Regex Check | **PASS** |
| 29 | `TC-CP-05` | `changePasswordWithOtp` | Thiếu chữ số | `newPassword = "PasswordXyz"` | Không cần mock | HTTP 400 *"Thiếu chữ số (0-9)"* | Regex Check | **PASS** |
| 30 | `TC-CP-06` | `changePasswordWithOtp` | OTP sai hoặc hết hạn | `otp = "123456"` | Mock `Otp.findOne` trả về `null` | HTTP 400 *"Mã OTP không chính xác hoặc đã hết hạn"* | Branch Coverage | **PASS** |
| 31 | `TC-CP-07` | `changePasswordWithOtp` | User không tồn tại | `otp = "123456"`, pass chuẩn | `Otp.findOne` trả về record, `User.findById` trả `null` | HTTP 404 *"Không tìm thấy người dùng"* | Branch Coverage | **PASS** |
| 32 | `TC-CP-08` | `changePasswordWithOtp` | Đổi mật khẩu thành công | `otp` đúng, pass chuẩn | Mock `User.findById` có user, `bcrypt.hash`, `user.save` | HTTP 200 *"Đổi mật khẩu thành công!"*, xóa OTP cũ | Success Path | **PASS** |
| 33 | `TC-CP-09` | `changePasswordWithOtp` | Exception khi đổi pass | `otp` đúng, pass chuẩn | Mock `Otp.findOne` throw Error | HTTP 500 *"Lỗi hệ thống khi đổi mật khẩu"* | Exception Path | **PASS** |
| 34 | `TC-DA-01` | `deleteAccountWithOtp` | Thiếu OTP xác thực | `otp = ""` | Không cần mock | HTTP 400 *"Vui lòng nhập mã OTP xác thực"* | Branch Coverage | **PASS** |
| 35 | `TC-DA-02` | `deleteAccountWithOtp` | OTP sai hoặc hết hạn | `otp = "654321"` | Mock `Otp.findOne` trả `null` | HTTP 400 *"Mã OTP không chính xác hoặc đã hết hạn"* | Branch Coverage | **PASS** |
| 36 | `TC-DA-03` | `deleteAccountWithOtp` | Xóa tài khoản thành công | `otp = "654321"` | Mock `User.deleteOne`, `Friend.deleteMany`, `Session.deleteMany` | HTTP 200 *"Đã xoá tài khoản thành công"* | Cascade Delete Path | **PASS** |
| 37 | `TC-DA-04` | `deleteAccountWithOtp` | Xóa tài khoản có Socket IO | `otp = "654321"` | Mock `req.app.get("io")` có socket broadcast | HTTP 200, emit event `conversation:update` tới peers | Realtime Notification Path | **PASS** |
| 38 | `TC-DA-05` | `deleteAccountWithOtp` | Exception khi xóa | `otp = "654321"` | Mock `Otp.findOne` throw Error | HTTP 500 *"Lỗi hệ thống khi xoá tài khoản"* | Exception Path | **PASS** |
| 39 | `TC-US-05` | `authMe` | Lấy profile bản thân | `req.user = { _id: "u123" }` | User đã được giải mã từ middleware | HTTP 200 `{ user: { ... } }` | Success Path | **PASS** |
| 40 | `TC-US-06` | `authMe` | Exception trong `authMe` | `req.user` ném exception | Mock property getter lỗi | HTTP 500 *"Lỗi hệ thống"* | Exception Path | **PASS** |
| 41 | `TC-US-07` | `getUserCount` | Đếm tổng số người dùng | Không có param | Mock `User.countDocuments` trả về `42` | HTTP 200 `{ count: 42 }` | Success Path | **PASS** |
| 42 | `TC-US-08` | `getUserCount` | Lỗi DB khi đếm | Không có param | Mock `User.countDocuments` throw Error | HTTP 500 *"Lỗi hệ thống"* | Exception Path | **PASS** |

---

## 4. Kết quả đo lường độ bao phủ (Coverage Statistics)

Kết quả thực thi tự động từ lệnh `npm run test:coverage` của Jest:

```text
----------------------|---------|----------|---------|---------|-------------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s       
----------------------|---------|----------|---------|---------|-------------------------
All files             |     100 |    85.45 |     100 |     100 |                         
 middlewares          |     100 |      100 |     100 |     100 |                         
  aiRateLimiter.js    |     100 |      100 |     100 |     100 |                         
 services             |     100 |    82.97 |     100 |     100 |                         
  translateService.js |     100 |    82.97 |     100 |     100 | 6,25-27,41,61-72,89,102 
----------------------|---------|----------|---------|---------|-------------------------
```

### Đánh giá so với mục tiêu chất lượng:
* **Statement Coverage**: Đạt **100%** (Vượt xa mục tiêu tối thiểu $\ge 90\%$).
* **Branch Coverage**: Đạt **85.45%** (Vượt mục tiêu tối thiểu $\ge 80\%$).
* **Function Coverage**: Đạt **100%** (Tất cả các hàm và helper strategies đều được thực thi).
* **Line Coverage**: Đạt **100%** (Toàn bộ các dòng lệnh đều được kiểm chứng).
* **Kết luận**: Module Người dùng, AI Rate Limiter và Dịch thuật đáp ứng toàn diện tiêu chuẩn kiểm thử White-Box của đồ án môn học.
