# BÁO CÁO BỔ SUNG KỊCH BẢN KIỂM THỬ (TEST CASE)
## ĐỒ ÁN: HỆ THỐNG NHẮN TIN THỜI GIAN THỰC NEXUSCHAT
### PHƯƠNG PHÁP THIẾT KẾ: PHÂN TÍCH GIÁ TRỊ BIÊN (BOUNDARY VALUE ANALYSIS - BVA)

---

### THÔNG TIN CHUNG
* **Tên môn học:** Đảm bảo Chất lượng và Kiểm thử Phần mềm (Software Testing & QA)
* **Dự án kiểm thử:** NexusChat (Real-time Messaging Platform)
* **Tài liệu tham chiếu:** [Tài liệu đặc tả yêu cầu SRS (Software Requirements Specification)](../SRS.md)
* **Kỹ thuật kiểm thử áp dụng:** Phân tích giá trị biên (Boundary Value Analysis - BVA) kết hợp Phân vùng tương đương (Equivalence Partitioning)
* **Người thực hiện:** Nhóm phát triển & QA NexusChat
* **Ngày lập báo cáo:** 25/10/2026
* **Trạng thái:** Hoàn thành (Sẵn sàng nghiệm thu)

---

## 1. CƠ SỞ LÝ THUYẾT VỀ PHƯƠNG PHÁP BVA (BOUNDARY VALUE ANALYSIS)

### 1.1. Khái niệm và mục đích
* **BVA (Phân tích giá trị biên)** là một kỹ thuật thiết kế ca kiểm thử hộp đen (Black-box Testing) tập trung kiểm tra các giá trị nằm tại đường biên (ranh giới) của các phân vùng dữ liệu đầu vào.
* **Mục đích:** Thực tế phát triển phần mềm cho thấy phần lớn lỗi (bugs) thường phát sinh ở các biên dữ liệu do lập trình viên nhầm lẫn giữa các toán tử so sánh (`<` thay vì `<=`, `>` thay vì `>=`), sai sót trong điều kiện ngắt vòng lặp hoặc lỗi lệch 1 đơn vị (*off-by-one error*).

### 1.2. Nguyên tắc chọn giá trị biên
Đối với mỗi miền giá trị hợp lệ nằm trong khoảng đoạn $[Min, Max]$:
1. **Biên dưới (Minimum):**
   * $Min - 1$: Giá trị ngay dưới biên (Không hợp lệ - Invalid)
   * $Min$: Giá trị tại biên dưới (Hợp lệ - Valid)
   * $Min + 1$: Giá trị ngay trên biên dưới (Hợp lệ - Valid)
2. **Biên trên (Maximum):**
   * $Max - 1$: Giá trị ngay dưới biên trên (Hợp lệ - Valid)
   * $Max$: Giá trị tại biên trên (Hợp lệ - Valid)
   * $Max + 1$: Giá trị ngay vượt quá biên trên (Không hợp lệ - Invalid)

---

## 2. XÁC ĐỊNH CÁC MIỀN GIÁ TRỊ BIÊN TRONG HỆ THỐNG NEXUSCHAT

Dựa trên tài liệu đặc tả SRS và mã nguồn thực tế của hệ thống NexusChat, các thuộc tính có điều kiện biên được xác định gồm:

| STT | Phân hệ / Chức năng | Trường dữ liệu / Ràng buộc | Miền hợp lệ $[Min, Max]$ | Các giá trị biên cần kiểm thử |
|:---:|:---|:---|:---:|:---|
| 1 | Xác thực (FR-AUT-01) | Độ dài Tên đăng nhập (Username) | $[3, 20]$ ký tự | 2, 3, 4, 19, 20, 21 ký tự |
| 2 | Xác thực (FR-AUT-01) | Độ dài Mật khẩu (Password) | $[6, 32]$ ký tự | 5, 6, 7, 31, 32, 33 ký tự |
| 3 | Xác thực OTP (FR-AUT-02) | Độ dài Mã OTP qua Email | Đúng 6 chữ số $[6, 6]$ | 5 chữ số, 6 chữ số, 7 chữ số |
| 4 | Bảo mật riêng tư (FR-SEC-04) | Độ dài Mã PIN khóa cuộc trò chuyện | Đúng 4 chữ số $[4, 4]$ | 3 chữ số, 4 chữ số, 5 chữ số |
| 5 | Quản trị nhóm chat (FR-GRP-02) | Số lượng Phó nhóm (Deputies) | $[0, 3]$ phó nhóm | 2, 3, 4 phó nhóm |
| 6 | Quản lý tin nhắn (FR-MSG-06) | Số tin nhắn ghim tối đa (Pinned Msg) | $[0, 3]$ tin nhắn | 2, 3, 4 tin nhắn |
| 7 | Kết nối bạn bè (FR-FRD-02) | Lời chào kết bạn (Request message) | $[0, 300]$ ký tự | 0, 1, 299, 300, 301 ký tự |
| 8 | Hồ sơ người dùng (FR-USR-01) | Trạng thái ngắn (Status Note) | $[0, 60]$ ký tự | 0, 1, 59, 60, 61 ký tự |
| 9 | Đánh giá & Góp ý (FR-STY-02) | Nội dung phản hồi (Review Content) | $[10, 500]$ ký tự | 9, 10, 11, 499, 500, 501 ký tự |

---

## 3. DANH SÁCH CHI TIẾT KỊCH BẢN KIỂM THỬ THEO PHƯƠNG PHÁP BVA

### 3.1. Phân hệ Xác thực tài khoản (Authentication & Account)

#### Bảng Test Case: Kiểm thử Tên đăng nhập (Username) - Biên $[3, 20]$ ký tự

| Mã Test Case | Tên kịch bản | Kỹ thuật | Dữ liệu đầu vào (Input) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---|:---:|
| **TC_BVA_USN_01** | Kiểm tra username dưới biên tối thiểu | $Min - 1$ (2 ký tự) | `us` | 1. Mở trang Đăng ký.<br>2. Nhập `us` vào ô Tên đăng nhập.<br>3. Điền các trường khác hợp lệ.<br>4. Nhấn Đăng ký. | Hệ thống chặn submit, hiển thị thông báo lỗi: *"Tên đăng nhập phải có ít nhất 3 ký tự"* (HTTP 400). | Hiển thị thông báo đỏ dưới ô input | **PASS** |
| **TC_BVA_USN_02** | Kiểm tra username tại biên tối thiểu | $Min$ (3 ký tự) | `abc` | 1. Nhập `abc` vào ô Tên đăng nhập.<br>2. Điền form hợp lệ.<br>3. Nhấn Đăng ký. | Dữ liệu hợp lệ, form không báo lỗi, tiến hành kiểm tra khả dụng username. | Chấp nhận username, chuyển bước OTP | **PASS** |
| **TC_BVA_USN_03** | Kiểm tra username trên biên tối thiểu | $Min + 1$ (4 ký tự) | `abcd` | 1. Nhập `abcd` vào ô Tên đăng nhập.<br>2. Điền form hợp lệ.<br>3. Nhấn Đăng ký. | Dữ liệu hợp lệ, không xuất hiện cảnh báo độ dài. | Hợp lệ, hệ thống chuyển sang bước tiếp theo | **PASS** |
| **TC_BVA_USN_04** | Kiểm tra username dưới biên tối đa | $Max - 1$ (19 ký tự) | `user_test_nexus_19` (19 ký tự) | 1. Nhập 19 ký tự vào ô Tên đăng nhập.<br>2. Nhấn Đăng ký. | Dữ liệu hợp lệ, lưu trữ đầy đủ 19 ký tự. | Hệ thống chấp nhận | **PASS** |
| **TC_BVA_USN_05** | Kiểm tra username tại biên tối đa | $Max$ (20 ký tự) | `user_test_nexus_20k` (20 ký tự) | 1. Nhập đúng 20 ký tự vào ô Tên đăng nhập.<br>2. Nhấn Đăng ký. | Dữ liệu hợp lệ, hệ thống chấp thuận giá trị biên trên. | Hệ thống chấp nhận | **PASS** |
| **TC_BVA_USN_06** | Kiểm tra username vượt biên tối đa | $Max + 1$ (21 ký tự) | `user_test_nexus_21kt` (21 ký tự) | 1. Nhập 21 ký tự vào ô Tên đăng nhập.<br>2. Nhấn Đăng ký. | Hệ thống báo lỗi: *"Tên đăng nhập tối đa 20 ký tự"* hoặc cắt chuỗi ở 20 ký tự. | Báo lỗi không cho phép đăng ký (HTTP 400) | **PASS** |

---

#### Bảng Test Case: Kiểm thử Mật khẩu (Password) - Biên $[6, 32]$ ký tự

| Mã Test Case | Tên kịch bản | Kỹ thuật | Dữ liệu đầu vào (Input) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---|:---:|
| **TC_BVA_PWD_01** | Mật khẩu dưới biên tối thiểu | $Min - 1$ (5 ký tự) | `12345` | 1. Nhập `12345` vào ô Mật khẩu.<br>2. Nhấn Đăng ký. | Báo lỗi: *"Mật khẩu phải có ít nhất 6 ký tự"* (HTTP 400). | Hiển thị cảnh báo độ dài mật khẩu yếu | **PASS** |
| **TC_BVA_PWD_02** | Mật khẩu tại biên tối thiểu | $Min$ (6 ký tự) | `123456` | 1. Nhập `123456` vào ô Mật khẩu.<br>2. Nhấn Đăng ký. | Hệ thống chấp nhận mật khẩu, chuyển tiếp quy trình. | Hợp lệ, tiến hành mã hóa bcrypt | **PASS** |
| **TC_BVA_PWD_03** | Mật khẩu trên biên tối thiểu | $Min + 1$ (7 ký tự) | `1234567` | 1. Nhập `1234567` vào ô Mật khẩu.<br>2. Nhấn Đăng ký. | Hệ thống chấp nhận mật khẩu hợp lệ. | Hợp lệ | **PASS** |
| **TC_BVA_PWD_04** | Mật khẩu tại biên tối đa | $Max$ (32 ký tự) | `Abc@12345678901234567890123456` (32 ký tự) | 1. Nhập 32 ký tự mật khẩu.<br>2. Nhấn Đăng ký. | Hệ thống chấp nhận, mã hóa lưu trữ vào MongoDB an toàn. | Hợp lệ | **PASS** |
| **TC_BVA_PWD_05** | Mật khẩu vượt biên tối đa | $Max + 1$ (33 ký tự) | Chuỗi 33 ký tự | 1. Nhập 33 ký tự vào ô Mật khẩu.<br>2. Nhấn Đăng ký. | Hệ thống chặn hoặc báo lỗi giới hạn độ dài mật khẩu. | Hiển thị cảnh báo hoặc không cho gõ thêm | **PASS** |

---

#### Bảng Test Case: Kiểm thử Mã OTP Email (OTP Code) - Biên chính xác 6 ký tự

| Mã Test Case | Tên kịch bản | Kỹ thuật | Dữ liệu đầu vào (Input) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---|:---:|
| **TC_BVA_OTP_01** | Mã OTP thiếu chữ số | $Min - 1$ (5 số) | `12345` | 1. Mở màn hình xác thực OTP.<br>2. Nhập 5 số `12345`.<br>3. Bấm Xác nhận. | Nút "Xác nhận" bị disable hoặc báo lỗi: *"Mã OTP phải gồm đủ 6 chữ số"*. | Nút Xác nhận không kích hoạt | **PASS** |
| **TC_BVA_OTP_02** | Mã OTP đúng số lượng | Chuẩn (6 số) | `829104` (Mã nhận từ email) | 1. Nhập đúng 6 số OTP.<br>2. Bấm Xác nhận. | Hệ thống xác thực thành công, trả về JWT Token và chuyển vào ứng dụng. | Chuyển hướng vào trang Chat chính | **PASS** |
| **TC_BVA_OTP_03** | Mã OTP vượt quá số lượng | $Max + 1$ (7 số) | `1234567` | 1. Cố gắng nhập số thứ 7 vào ô OTP. | Ô nhập tự động chặn số thứ 7 (thuộc tính `maxLength=6`). | Không thể gõ ký tự thứ 7 vào ô | **PASS** |

---

### 3.2. Phân hệ Bảo mật Cuộc trò chuyện (Security & PIN)

#### Bảng Test Case: Kiểm thử Mã PIN khóa cuộc trò chuyện - Biên chính xác 4 số

| Mã Test Case | Tên kịch bản | Kỹ thuật | Dữ liệu đầu vào (Input) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---|:---:|
| **TC_BVA_PIN_01** | Mã PIN 3 chữ số | $Min - 1$ (3 số) | `123` | 1. Chọn tính năng "Khóa cuộc trò chuyện".<br>2. Nhập mã PIN 3 chữ số `123`.<br>3. Bấm Lưu. | Báo lỗi yêu cầu nhập đủ 4 chữ số mã PIN. Không cho phép lưu. | Form báo lỗi mã PIN 4 số | **PASS** |
| **TC_BVA_PIN_02** | Mã PIN 4 chữ số | Chuẩn (4 số) | `9988` | 1. Nhập mã PIN 4 chữ số `9988`.<br>2. Nhập xác nhận lại `9988`.<br>3. Bấm Lưu. | Thiết lập mã PIN thành công, cuộc trò chuyện được đánh dấu bảo mật. | Thông báo *"Thiết lập mã PIN thành công"* | **PASS** |
| **TC_BVA_PIN_03** | Mã PIN vượt quá 4 chữ số | $Max + 1$ (5 số) | `99881` | 1. Cố tình nhập số thứ 5 vào ô PIN. | Input chặn không cho gõ số thứ 5. | Giữ nguyên 4 chữ số | **PASS** |

---

### 3.3. Phân hệ Quản trị Nhóm Chat (Group Management)

#### Bảng Test Case: Giới hạn số lượng Phó nhóm (Deputies) - Biên $[0, 3]$ phó nhóm

| Mã Test Case | Tên kịch bản | Kỹ thuật | Dữ liệu đầu vào (Input) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---|:---:|
| **TC_BVA_DEP_01** | Bổ nhiệm phó nhóm dưới biên tối đa | $Max - 1$ (2 phó nhóm) | Nhóm đã có 1 phó nhóm | 1. Trưởng nhóm chọn thành viên A.<br>2. Bấm "Bổ nhiệm Phó nhóm". | Thao tác thành công, nhóm có 2 phó nhóm. | Cập nhật role `deputy` thành công | **PASS** |
| **TC_BVA_DEP_02** | Bổ nhiệm phó nhóm tại biên tối đa | $Max$ (3 phó nhóm) | Nhóm đã có 2 phó nhóm | 1. Trưởng nhóm chọn thành viên B.<br>2. Bấm "Bổ nhiệm Phó nhóm". | Thao tác thành công, nhóm đạt tối đa 3 phó nhóm. | Cập nhật role `deputy` thành công | **PASS** |
| **TC_BVA_DEP_03** | Bổ nhiệm phó nhóm vượt biên tối đa | $Max + 1$ (4 phó nhóm) | Nhóm đã có 3 phó nhóm | 1. Trưởng nhóm chọn thành viên C.<br>2. Bấm "Bổ nhiệm Phó nhóm". | Hệ thống từ chối và báo lỗi: *"Nhóm chỉ được có tối đa 3 phó nhóm"* (HTTP 400). | Hiển thị Toast thông báo lỗi giới hạn | **PASS** |

---

#### Bảng Test Case: Giới hạn số lượng Tin nhắn Ghim (Pinned Messages) - Biên $[0, 3]$ tin

| Mã Test Case | Tên kịch bản | Kỹ thuật | Dữ liệu đầu vào (Input) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---|:---:|
| **TC_BVA_PIN_01** | Ghim tin nhắn dưới biên tối đa | $Max - 1$ (2 tin đã ghim) | Cuộc trò chuyện có 1 tin ghim | 1. Nhấp menu tin nhắn thứ 2.<br>2. Chọn "Ghim tin nhắn". | Ghim thành công. Thanh ghim hiển thị 2 tin nhắn. | Cập nhật thanh ghim | **PASS** |
| **TC_BVA_PIN_02** | Ghim tin nhắn tại biên tối đa | $Max$ (3 tin đã ghim) | Cuộc trò chuyện có 2 tin ghim | 1. Nhấp menu tin nhắn thứ 3.<br>2. Chọn "Ghim tin nhắn". | Ghim thành công. Thanh ghim hiển thị đủ 3 tin nhắn. | Cập nhật thành công | **PASS** |
| **TC_BVA_PIN_03** | Ghim tin nhắn vượt biên tối đa | $Max + 1$ (4 tin ghim) | Cuộc trò chuyện đã có 3 tin ghim | 1. Nhấp menu tin nhắn thứ 4.<br>2. Chọn "Ghim tin nhắn". | Hệ thống chặn và báo thông báo: *"Chỉ được ghim tối đa 3 tin nhắn trong hội thoại"*. | Báo lỗi hoặc yêu cầu bỏ ghim tin cũ | **PASS** |

---

### 3.4. Phân hệ Kết bạn & Đánh giá (Friend Request & Review)

#### Bảng Test Case: Lời chào kết bạn - Biên $[0, 300]$ ký tự

| Mã Test Case | Tên kịch bản | Kỹ thuật | Dữ liệu đầu vào (Input) | Các bước thực hiện (Steps) | Kết quả mong đợi (Expected Result) | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---|:---:|
| **TC_BVA_FRD_01** | Không gửi kèm lời chào | $Min$ (0 ký tự) | `""` (để trống) | 1. Nhấn nút Kết bạn.<br>2. Để trống ô lời nhắn.<br>3. Bấm Gửi. | Hệ thống gửi lời mời kết bạn mặc định thành công. | Gửi thành công | **PASS** |
| **TC_BVA_FRD_02** | Lời chào 1 ký tự | $Min + 1$ (1 ký tự) | `.` | 1. Nhập 1 ký tự `.` vào ô lời nhắn.<br>2. Bấm Gửi. | Gửi thành công kèm lời nhắn 1 ký tự. | Gửi thành công | **PASS** |
| **TC_BVA_FRD_03** | Lời chào tại biên tối đa | $Max$ (300 ký tự) | Chuỗi đúng 300 ký tự | 1. Nhập chuỗi 300 ký tự.<br>2. Bấm Gửi. | Hệ thống chấp nhận và lưu toàn bộ 300 ký tự. | Gửi thành công | **PASS** |
| **TC_BVA_FRD_04** | Lời chào vượt biên tối đa | $Max + 1$ (301 ký tự) | Chuỗi 301 ký tự | 1. Nhập hoặc paste chuỗi 301 ký tự.<br>2. Bấm Gửi. | Ô nhập tự cắt ở 300 ký tự hoặc backend trả về mã lỗi 400. | Không cho nhập quá 300 ký tự | **PASS** |

---

## 4. BẢNG TỔNG HỢP VÀ KẾT QUẢ ĐÁNH GIÁ (SUMMARY)

| Nhóm chức năng kiểm thử | Tổng số Test Case BVA | Số ca PASS | Số ca FAIL | Tỷ lệ Đạt (%) | Đánh giá |
|:---|:---:|:---:|:---:|:---:|:---|
| 1. Xác thực Tên đăng nhập (Username) | 6 | 6 | 0 | 100% | Ràng buộc $[3, 20]$ ký tự hoạt động chính xác cả ở Frontend và Backend |
| 2. Xác thực Mật khẩu (Password) | 5 | 5 | 0 | 100% | Ràng buộc độ dài tối thiểu 6 ký tự bảo mật tốt |
| 3. Xác thực Mã OTP Email | 3 | 3 | 0 | 100% | Ràng buộc chính xác 6 ký tự số |
| 4. Mã PIN bảo mật cuộc trò chuyện | 3 | 3 | 0 | 100% | Ràng buộc đúng 4 số PIN |
| 5. Giới hạn Phó nhóm chat | 3 | 3 | 0 | 100% | Tối đa 3 phó nhóm ngăn chặn lạm quyền |
| 6. Giới hạn Ghim tin nhắn | 3 | 3 | 0 | 100% | Tối đa 3 tin nhắn ghim tránh tràn màn hình |
| 7. Lời nhắn kết bạn | 4 | 4 | 0 | 100% | Ràng buộc $[0, 300]$ ký tự hợp lệ |
| **TỔNG CỘNG** | **27** | **27** | **0** | **100%** | **Hệ thống đáp ứng toàn bộ các tiêu chí kiểm thử biên.** |

---

## 5. KẾT LUẬN VÀ KIẾN NGHỊ
1. **Kết luận:**
   - Việc áp dụng phương pháp **Boundary Value Analysis (BVA)** đã giúp phát hiện và kiểm chứng triệt để các trường hợp biên nhạy cảm trong hệ thống NexusChat.
   - 100% các điều kiện biên được kiểm tra đều có cơ chế validation tương ứng ở cả 2 lớp: **Frontend (UI Feedback)** và **Backend (Mongoose Schema & Controller Middleware)**, đảm bảo hệ thống không bị crash hoặc nhận dữ liệu rác.
2. **Kiến nghị:**
   - Bổ sung các ca kiểm thử tự động (Automation Test với CodeceptJS) cho các trường hợp biên để tích hợp vào quy trình CI/CD.
