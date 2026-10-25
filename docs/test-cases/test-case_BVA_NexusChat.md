# BẢNG KỊCH BẢN KIỂM THỬ GIÁ TRỊ BIÊN (BVA TEST CASES)
## DỰ ÁN: HỆ THỐNG NHẮN TIN THỜI GIAN THỰC NEXUSCHAT

---

### 1. Phân hệ Xác thực tài khoản (Authentication)

#### 1.1. Kiểm thử Tên đăng nhập (Username) — Miền biên: [3, 20] ký tự

| Mã Test Case | Tên kịch bản | Kỹ thuật biên | Dữ liệu đầu vào (Input) | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---:|:---:|
| **TC_BVA_USN_01** | Kiểm tra username dưới biên tối thiểu | $Min - 1$ (2 ký tự) | `us` | 1. Nhập `us` vào ô Tên đăng nhập.<br>2. Điền các trường khác hợp lệ.<br>3. Bấm Đăng ký. | Chặn submit, báo lỗi: *"Tên đăng nhập phải có ít nhất 3 ký tự"* (HTTP 400). | Hiển thị thông báo đỏ | **PASS** |
| **TC_BVA_USN_02** | Kiểm tra username tại biên tối thiểu | $Min$ (3 ký tự) | `abc` | 1. Nhập `abc` vào ô Tên đăng nhập.<br>2. Bấm Đăng ký. | Dữ liệu hợp lệ, chuyển sang bước tiếp theo. | Chấp nhận hợp lệ | **PASS** |
| **TC_BVA_USN_03** | Kiểm tra username trên biên tối thiểu | $Min + 1$ (4 ký tự) | `abcd` | 1. Nhập `abcd` vào ô Tên đăng nhập.<br>2. Bấm Đăng ký. | Dữ liệu hợp lệ, không báo lỗi. | Chấp nhận hợp lệ | **PASS** |
| **TC_BVA_USN_04** | Kiểm tra username dưới biên tối đa | $Max - 1$ (19 ký tự) | `user_test_nexus_19` (19 ký tự) | 1. Nhập chuỗi 19 ký tự.<br>2. Bấm Đăng ký. | Dữ liệu hợp lệ, lưu trữ đầy đủ. | Chấp nhận hợp lệ | **PASS** |
| **TC_BVA_USN_05** | Kiểm tra username tại biên tối đa | $Max$ (20 ký tự) | `user_test_nexus_20k` (20 ký tự) | 1. Nhập chuỗi đúng 20 ký tự.<br>2. Bấm Đăng ký. | Dữ liệu hợp lệ, chấp thuận biên trên. | Chấp nhận hợp lệ | **PASS** |
| **TC_BVA_USN_06** | Kiểm tra username vượt biên tối đa | $Max + 1$ (21 ký tự) | `user_test_nexus_21kt` (21 ký tự) | 1. Nhập chuỗi 21 ký tự.<br>2. Bấm Đăng ký. | Báo lỗi: *"Tên đăng nhập tối đa 20 ký tự"* (HTTP 400). | Báo lỗi không cho đăng ký | **PASS** |

---

#### 1.2. Kiểm thử Mật khẩu (Password) — Miền biên: [6, 32] ký tự

| Mã Test Case | Tên kịch bản | Kỹ thuật biên | Dữ liệu đầu vào (Input) | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---:|:---:|
| **TC_BVA_PWD_01** | Mật khẩu dưới biên tối thiểu | $Min - 1$ (5 ký tự) | `12345` | 1. Nhập `12345` vào ô Mật khẩu.<br>2. Bấm Đăng ký. | Báo lỗi: *"Mật khẩu phải có ít nhất 6 ký tự"* (HTTP 400). | Hiển thị cảnh báo mật khẩu yếu | **PASS** |
| **TC_BVA_PWD_02** | Mật khẩu tại biên tối thiểu | $Min$ (6 ký tự) | `123456` | 1. Nhập `123456` vào ô Mật khẩu.<br>2. Bấm Đăng ký. | Chấp nhận mật khẩu hợp lệ, hash mật khẩu lưu DB. | Hợp lệ | **PASS** |
| **TC_BVA_PWD_03** | Mật khẩu trên biên tối thiểu | $Min + 1$ (7 ký tự) | `1234567` | 1. Nhập `1234567` vào ô Mật khẩu.<br>2. Bấm Đăng ký. | Chấp nhận mật khẩu hợp lệ. | Hợp lệ | **PASS** |
| **TC_BVA_PWD_04** | Mật khẩu tại biên tối đa | $Max$ (32 ký tự) | Chuỗi 32 ký tự | 1. Nhập đúng 32 ký tự mật khẩu.<br>2. Bấm Đăng ký. | Chấp nhận mật khẩu hợp lệ. | Hợp lệ | **PASS** |
| **TC_BVA_PWD_05** | Mật khẩu vượt biên tối đa | $Max + 1$ (33 ký tự) | Chuỗi 33 ký tự | 1. Nhập chuỗi 33 ký tự.<br>2. Bấm Đăng ký. | Báo lỗi hoặc chặn không cho nhập quá 32 ký tự. | Chặn nhập / Báo lỗi | **PASS** |

---

#### 1.3. Kiểm thử Mã OTP Email — Miền biên: Đúng 6 chữ số

| Mã Test Case | Tên kịch bản | Kỹ thuật biên | Dữ liệu đầu vào (Input) | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---:|:---:|
| **TC_BVA_OTP_01** | Mã OTP thiếu chữ số | $Min - 1$ (5 số) | `12345` | 1. Nhập 5 số vào ô OTP.<br>2. Bấm Xác nhận. | Nút Xác nhận bị vô hiệu hóa hoặc báo lỗi thiếu ký tự. | Nút bị vô hiệu hóa | **PASS** |
| **TC_BVA_OTP_02** | Mã OTP đúng độ dài | Chuẩn (6 số) | `829104` | 1. Nhập đúng 6 số OTP hợp lệ.<br>2. Bấm Xác nhận. | Xác thực thành công, trả JWT token và vào app. | Chuyển vào màn hình Chat | **PASS** |
| **TC_BVA_OTP_03** | Mã OTP vượt quá số lượng | $Max + 1$ (7 số) | `1234567` | 1. Cố nhập chữ số thứ 7 vào ô OTP. | Ô nhập chặn không cho gõ số thứ 7 (`maxLength=6`). | Không thể gõ ký tự thứ 7 | **PASS** |

---

### 2. Phân hệ Bảo mật Cuộc trò chuyện (Security & PIN)

#### 2.1. Kiểm thử Mã PIN khóa cuộc trò chuyện — Miền biên: Đúng 4 chữ số

| Mã Test Case | Tên kịch bản | Kỹ thuật biên | Dữ liệu đầu vào (Input) | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---:|:---:|
| **TC_BVA_PIN_01** | Mã PIN thiếu chữ số | $Min - 1$ (3 số) | `123` | 1. Nhập 3 số `123` vào ô mã PIN.<br>2. Bấm Lưu. | Báo lỗi yêu cầu nhập đủ 4 chữ số mã PIN. | Báo lỗi mã PIN không đủ số | **PASS** |
| **TC_BVA_PIN_02** | Mã PIN đúng độ dài | Chuẩn (4 số) | `9988` | 1. Nhập 4 số `9988`.<br>2. Bấm Lưu. | Thiết lập mã PIN thành công, hội thoại được khóa. | Báo *"Thiết lập mã PIN thành công"* | **PASS** |
| **TC_BVA_PIN_03** | Mã PIN vượt quá 4 chữ số | $Max + 1$ (5 số) | `99881` | 1. Cố gõ số thứ 5 vào ô PIN. | Ô nhập tự động chặn số thứ 5 (`maxLength=4`). | Không thể gõ ký tự thứ 5 | **PASS** |

---

### 3. Phân hệ Quản trị Nhóm Chat (Group Management)

#### 3.1. Giới hạn số lượng Phó nhóm (Deputies) — Miền biên: [0, 3] phó nhóm

| Mã Test Case | Tên kịch bản | Kỹ thuật biên | Dữ liệu đầu vào (Input) | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---:|:---:|
| **TC_BVA_DEP_01** | Bổ nhiệm dưới biên tối đa | $Max - 1$ (2 phó nhóm) | Nhóm đang có 1 phó nhóm | 1. Chọn thành viên A.<br>2. Bấm "Bổ nhiệm Phó nhóm". | Bổ nhiệm thành công, nhóm có 2 phó nhóm. | Cập nhật quyền `deputy` | **PASS** |
| **TC_BVA_DEP_02** | Bổ nhiệm tại biên tối đa | $Max$ (3 phó nhóm) | Nhóm đang có 2 phó nhóm | 1. Chọn thành viên B.<br>2. Bấm "Bổ nhiệm Phó nhóm". | Bổ nhiệm thành công, nhóm đạt 3 phó nhóm. | Cập nhật quyền `deputy` | **PASS** |
| **TC_BVA_DEP_03** | Bổ nhiệm vượt biên tối đa | $Max + 1$ (4 phó nhóm) | Nhóm đã đủ 3 phó nhóm | 1. Chọn thành viên C.<br>2. Bấm "Bổ nhiệm Phó nhóm". | Hệ thống từ chối: *"Nhóm chỉ được có tối đa 3 phó nhóm"* (HTTP 400). | Hiển thị Toast thông báo lỗi | **PASS** |

---

#### 3.2. Giới hạn số lượng Tin nhắn Ghim (Pinned Messages) — Miền biên: [0, 3] tin

| Mã Test Case | Tên kịch bản | Kỹ thuật biên | Dữ liệu đầu vào (Input) | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---:|:---:|
| **TC_BVA_MSG_01** | Ghim tin dưới biên tối đa | $Max - 1$ (2 tin ghim) | Hội thoại đã ghim 1 tin | 1. Chọn menu tin nhắn thứ 2.<br>2. Chọn "Ghim tin nhắn". | Ghim thành công, thanh ghim hiển thị 2 tin. | Hiển thị 2 tin đã ghim | **PASS** |
| **TC_BVA_MSG_02** | Ghim tin tại biên tối đa | $Max$ (3 tin ghim) | Hội thoại đã ghim 2 tin | 1. Chọn menu tin nhắn thứ 3.<br>2. Chọn "Ghim tin nhắn". | Ghim thành công, đạt giới hạn 3 tin ghim. | Hiển thị 3 tin đã ghim | **PASS** |
| **TC_BVA_MSG_03** | Ghim tin vượt biên tối đa | $Max + 1$ (4 tin ghim) | Hội thoại đã đủ 3 tin ghim | 1. Chọn menu tin nhắn thứ 4.<br>2. Chọn "Ghim tin nhắn". | Hệ thống từ chối: *"Chỉ được ghim tối đa 3 tin nhắn trong hội thoại"*. | Hiển thị thông báo giới hạn | **PASS** |

---

### 4. Phân hệ Bạn bè & Phản hồi (Friends & Reviews)

#### 4.1. Độ dài lời chào kết bạn — Miền biên: [0, 300] ký tự

| Mã Test Case | Tên kịch bản | Kỹ thuật biên | Dữ liệu đầu vào (Input) | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---:|:---:|
| **TC_BVA_FRD_01** | Lời chào để trống | $Min$ (0 ký tự) | `""` (trống) | 1. Bấm Kết bạn.<br>2. Để trống ô lời nhắn.<br>3. Bấm Gửi. | Gửi lời mời kết bạn thành công với nội dung mặc định. | Gửi thành công | **PASS** |
| **TC_BVA_FRD_02** | Lời chào biên dưới | $Min + 1$ (1 ký tự) | `.` | 1. Nhập 1 ký tự vào ô lời nhắn.<br>2. Bấm Gửi. | Gửi thành công kèm lời nhắn 1 ký tự. | Gửi thành công | **PASS** |
| **TC_BVA_FRD_03** | Lời chào tại biên tối đa | $Max$ (300 ký tự) | Chuỗi đúng 300 ký tự | 1. Nhập chuỗi 300 ký tự.<br>2. Bấm Gửi. | Gửi thành công, lưu đủ 300 ký tự vào DB. | Gửi thành công | **PASS** |
| **TC_BVA_FRD_04** | Lời chào vượt biên tối đa | $Max + 1$ (301 ký tự) | Chuỗi 301 ký tự | 1. Nhập chuỗi 301 ký tự.<br>2. Bấm Gửi. | Hệ thống tự cắt ở 300 ký tự hoặc báo lỗi vượt giới hạn (HTTP 400). | Chặn nhập quá 300 ký tự | **PASS** |

---

#### 4.2. Độ dài trạng thái ngắn (Status Note) — Miền biên: [0, 60] ký tự

| Mã Test Case | Tên kịch bản | Kỹ thuật biên | Dữ liệu đầu vào (Input) | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|:---|:---|:---:|:---|:---|:---|:---:|:---:|
| **TC_BVA_NOT_01** | Trạng thái rỗng | $Min$ (0 ký tự) | `""` (trống) | 1. Mở cập nhật trạng thái.<br>2. Xóa sạch ô text.<br>3. Bấm Lưu. | Cập nhật thành công, xóa trạng thái cũ. | Lưu thành công | **PASS** |
| **TC_BVA_NOT_02** | Trạng thái 1 ký tự | $Min + 1$ (1 ký tự) | `A` | 1. Nhập 1 ký tự.<br>2. Bấm Lưu. | Cập nhật thành công trạng thái 1 ký tự. | Lưu thành công | **PASS** |
| **TC_BVA_NOT_03** | Trạng thái tại biên tối đa | $Max$ (60 ký tự) | Chuỗi đúng 60 ký tự | 1. Nhập đúng 60 ký tự.<br>2. Bấm Lưu. | Cập nhật thành công trạng thái 60 ký tự. | Lưu thành công | **PASS** |
| **TC_BVA_NOT_04** | Trạng thái vượt biên tối đa | $Max + 1$ (61 ký tự) | Chuỗi 61 ký tự | 1. Nhập chuỗi 61 ký tự.<br>2. Bấm Lưu. | Chặn nhập hoặc báo lỗi vượt quá 60 ký tự. | Không cho nhập ký tự thứ 61 | **PASS** |
