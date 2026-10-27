# BẢNG KỊCH BẢN KIỂM THỬ GIÁ TRỊ BIÊN (STANDARD BOUNDARY VALUE ANALYSIS)
## DỰ ÁN: HỆ THỐNG NHẮN TIN THỜI GIAN THỰC NEXUSCHAT
### PHÂN HỆ: HỒ SƠ NGƯỜI DÙNG & THIẾT LẬP BẢO MẬT (PROFILE & SECURITY)

---

- **Thành viên thực hiện:** Vĩnh Phú
- **Vai trò:** Kiểm thử viên (Tester)
- **Kỹ thuật áp dụng:** Phân tích giá trị biên chuẩn (Standard BVA)
- **Công thức tính số ca kiểm thử:**  
  $$\text{Số Test Cases} = 4n + 1$$  
  *(Trong đó $n$ là số biến đầu vào có miền giá trị xác định).*

---

### 1. BÀI TOÁN & XÁC ĐỊNH CÁC RÀNG BUỘC ĐẦU VÀO

Chức năng **Cập nhật Hồ sơ cá nhân & Cấu hình khóa bảo mật hội thoại** trong NexusChat tiếp nhận 3 thông số đầu vào với các ràng buộc nghiệp vụ như sau:

1. **`display_name` (Độ dài Tên hiển thị):**
   - Ràng buộc: Tên hiển thị phải có độ dài từ $2$ đến $30$ ký tự.
   - Miền giá trị: $2 \le \text{display\_name} \le 30$ (ký tự).

2. **`bio` (Độ dài Tiểu sử / Trạng thái ngắn):**
   - Ràng buộc: Cho phép để trống (0 ký tự) hoặc tối đa 60 ký tự.
   - Miền giá trị: $0 \le \text{bio} \le 60$ (ký tự).

3. **`lock_timeout` (Thời gian tự động khóa bảo mật bằng mã PIN):**
   - Ràng buộc: Thời gian tự động kích hoạt mã PIN khóa hội thoại khi người dùng không hoạt động, tính theo phút từ $1$ đến $60$ phút.
   - Miền giá trị: $1 \le \text{lock\_timeout} \le 60$ (phút).

---

### 2. XÁC ĐỊNH CÁC GIÁ TRỊ BIÊN CHO TỪNG BIẾN

Theo kỹ thuật **Standard BVA**, mỗi biến được chọn 5 giá trị đặc trưng bao gồm:
- $Min$: Giá trị biên dưới
- $Min + 1$ ($min+$): Giá trị ngay trên biên dưới
- $Nom$: Giá trị thông thường (danh định) ở giữa miền giá trị hợp lệ
- $Max - 1$ ($max-$): Giá trị ngay dưới biên trên
- $Max$: Giá trị biên trên

| Giá trị | Biến 1: `display_name` (ký tự) | Biến 2: `bio` (ký tự) | Biến 3: `lock_timeout` (phút) |
|:---:|:---:|:---:|:---:|
| **$Min$** | $2$ | $0$ | $1$ |
| **$Min + 1$ ($min+$)** | $3$ | $1$ | $2$ |
| **$Nom$** | $15$ | $30$ | $15$ |
| **$Max - 1$ ($max-$)** | $29$ | $59$ | $59$ |
| **$Max$** | $30$ | $60$ | $60$ |

- **Tổng số biến:** $n = 3$
- **Số lượng Test Cases Standard BVA:**  
  $$4 \times 3 + 1 = 13\ \text{Test Cases}$$

*Quy tắc sinh ca kiểm thử Standard BVA:* Giữ các biến khác ở giá trị danh định ($Nom$), lần lượt thay đổi một biến qua 4 giá trị biên ($Min, Min+, Max-, Max$) cộng thêm 1 ca kiểm thử khi tất cả các biến đều ở giá trị danh định ($Nom$).

---

### 3. BẢNG MA TRẬN KỊCH BẢN KIỂM THỬ (STANDARD BVA TEST CASES)

| Case | `display_name` (ký tự) | `bio` (ký tự) | `lock_timeout` (phút) | Mô tả dữ liệu đầu vào | Kết quả mong đợi (Expected Output) | Kết quả thực tế | Trạng thái |
|:---:|:---:|:---:|:---:|:---|:---|:---|:---:|
| **1** | **15** *(nom)* | **30** *(nom)* | **1** *($min$)* | `display_name` = 15 ký tự, `bio` = 30 ký tự, `lock_timeout` = 1 phút | Lưu hồ sơ thành công, thời gian tự khóa sau 1 phút không thao tác. | Cập nhật thành công | **PASS** |
| **2** | **15** *(nom)* | **30** *(nom)* | **2** *($min+$)* | `display_name` = 15 ký tự, `bio` = 30 ký tự, `lock_timeout` = 2 phút | Lưu hồ sơ thành công, thời gian tự khóa sau 2 phút không thao tác. | Cập nhật thành công | **PASS** |
| **3** | **15** *(nom)* | **30** *(nom)* | **15** *($nom$)* | `display_name` = 15 ký tự, `bio` = 30 ký tự, `lock_timeout` = 15 phút *(Trường hợp chuẩn)* | Lưu hồ sơ thành công, cấu hình thời gian tự khóa 15 phút. | Cập nhật thành công | **PASS** |
| **4** | **15** *(nom)* | **30** *(nom)* | **59** *($max-$)* | `display_name` = 15 ký tự, `bio` = 30 ký tự, `lock_timeout` = 59 phút | Lưu hồ sơ thành công, thời gian tự khóa sau 59 phút không thao tác. | Cập nhật thành công | **PASS** |
| **5** | **15** *(nom)* | **30** *(nom)* | **60** *($max$)* | `display_name` = 15 ký tự, `bio` = 30 ký tự, `lock_timeout` = 60 phút | Lưu hồ sơ thành công, thời gian tự khóa đạt mức tối đa 60 phút. | Cập nhật thành công | **PASS** |
| **6** | **15** *(nom)* | **0** *($min$)* | **15** *(nom)* | `display_name` = 15 ký tự, để trống `bio` (0 ký tự), `lock_timeout` = 15 phút | Lưu hồ sơ thành công, xóa sạch nội dung tiểu sử cũ. | Cập nhật thành công | **PASS** |
| **7** | **15** *(nom)* | **1** *($min+$)* | **15** *(nom)* | `display_name` = 15 ký tự, `bio` = 1 ký tự (`"."`), `lock_timeout` = 15 phút | Lưu hồ sơ thành công với tiểu sử 1 ký tự. | Cập nhật thành công | **PASS** |
| **8** | **15** *(nom)* | **59** *($max-$)* | **15** *(nom)* | `display_name` = 15 ký tự, `bio` = 59 ký tự, `lock_timeout` = 15 phút | Lưu hồ sơ thành công với tiểu sử 59 ký tự. | Cập nhật thành công | **PASS** |
| **9** | **15** *(nom)* | **60** *($max$)* | **15** *(nom)* | `display_name` = 15 ký tự, `bio` = 60 ký tự, `lock_timeout` = 15 phút | Lưu hồ sơ thành công với tiểu sử đúng 60 ký tự. | Cập nhật thành công | **PASS** |
| **10** | **2** *($min$)* | **30** *(nom)* | **15** *(nom)* | `display_name` = 2 ký tự (`"An"`), `bio` = 30 ký tự, `lock_timeout` = 15 phút | Lưu hồ sơ thành công với tên hiển thị 2 ký tự. | Cập nhật thành công | **PASS** |
| **11** | **3** *($min+$)* | **30** *(nom)* | **15** *(nom)* | `display_name` = 3 ký tự (`"Huy"`), `bio` = 30 ký tự, `lock_timeout` = 15 phút | Lưu hồ sơ thành công với tên hiển thị 3 ký tự. | Cập nhật thành công | **PASS** |
| **12** | **29** *($max-$)* | **30** *(nom)* | **15** *(nom)* | `display_name` = 29 ký tự, `bio` = 30 ký tự, `lock_timeout` = 15 phút | Lưu hồ sơ thành công với tên hiển thị 29 ký tự. | Cập nhật thành công | **PASS** |
| **13** | **30** *($max$)* | **30** *(nom)* | **15** *(nom)* | `display_name` = 30 ký tự, `bio` = 30 ký tự, `lock_timeout` = 15 phút | Lưu hồ sơ thành công với tên hiển thị tối đa 30 ký tự. | Cập nhật thành công | **PASS** |

---

### 4. PHẦN MỞ RỘNG: KIỂM THỬ GIÁ TRỊ NGOÀI BIÊN (ROBUSTNESS BVA - XỬ LÝ LỖI)

> *Ghi chú bổ sung dành cho giảng viên yêu cầu mở rộng kiểm thử Robustness ($Min - 1$ và $Max + 1$) để kiểm tra khả năng bắt lỗi và phòng thủ của hệ thống.*

| Mã Test Case | Biến kiểm thử | Giá trị biên kiểm thử | Dữ liệu nhập vào | Kết quả mong đợi (Error Expected) | Kết quả thực tế | Trạng thái |
|:---|:---:|:---:|:---|:---|:---|:---:|
| **TC_ROB_01** | `display_name` | $Min - 1$ (1 ký tự) | `A` | Báo lỗi: *"Tên hiển thị phải có ít nhất 2 ký tự"* (HTTP 400). | Hiển thị cảnh báo lỗi | **PASS** |
| **TC_ROB_02** | `display_name` | $Max + 1$ (31 ký tự) | Chuỗi 31 ký tự | Báo lỗi: *"Tên hiển thị không được vượt quá 30 ký tự"* (HTTP 400). | Chặn nhập hoặc báo lỗi | **PASS** |
| **TC_ROB_03** | `bio` | $Max + 1$ (61 ký tự) | Chuỗi 61 ký tự | Hệ thống tự động cắt tại 60 ký tự hoặc báo lỗi vượt giới hạn. | Ô nhập chặn ký tự thứ 61 | **PASS** |
| **TC_ROB_04** | `lock_timeout` | $Min - 1$ (0 phút) | `0` | Báo lỗi: *"Thời gian tự khóa tối thiểu là 1 phút"*. | Báo lỗi không hợp lệ | **PASS** |
| **TC_ROB_05** | `lock_timeout` | $Max + 1$ (61 phút) | `61` | Báo lỗi: *"Thời gian tự khóa tối đa là 60 phút"*. | Báo lỗi vượt ngưỡng | **PASS** |
