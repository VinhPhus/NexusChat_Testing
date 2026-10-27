# KIỂM THỬ GIÁ TRỊ BIÊN (STANDARD BOUNDARY VALUE ANALYSIS)
## Chức năng: Gửi tin nhắn & Tệp đính kèm (Chat & Upload) — Thành viên 2 (Sprint W4 / Ticket KAN-23)
**Hệ thống:** NexusChat Realtime Messaging System  
**Thành viên phụ trách:** Thành viên 2  
**Họ và tên sinh viên:** [Điền họ và tên]  
**MSSV:** [Điền mã số sinh viên]  

---

### 1. Phân tích miền giá trị đầu vào (Input Variables)

Áp dụng kỹ thuật kiểm thử giá trị biên tiêu chuẩn (**Standard Boundary Value Analysis - BVA**) cho $n = 2$ biến đầu vào:
- Công thức số lượng ca kiểm thử tiêu chuẩn: 
  $$\text{Số Test Cases} = 4n + 1 = 4 \times 2 + 1 = 9 \text{ cases}$$
- Mỗi biến nhận 5 giá trị đặc trưng: $Min$, $Min+1$, $Nom$ (giá trị danh nghĩa ở giữa), $Max-1$, $Max$.

#### Chi tiết các biến kiểm thử:
- **Biến 1**: Độ dài tin nhắn văn bản `msg_len` $\in [1, 2000]$ ký tự
  - $Min = 1$ ký tự
  - $Min+ = 2$ ký tự
  - $Nom = 500$ ký tự
  - $Max- = 1999$ ký tự
  - $Max = 2000$ ký tự
- **Biến 2**: Dung lượng tệp đính kèm `file_size` $\in [1, 25]$ MB
  - $Min = 1$ MB
  - $Min+ = 2$ MB
  - $Nom = 10$ MB
  - $Max- = 24$ MB
  - $Max = 25$ MB

---

### 2. Bảng kịch bản kiểm thử tiêu chuẩn (Standard BVA Test Cases — 9 Cases)

Nguyên tắc thực hiện:
- **Nhóm 1 (Cases 1 - 5)**: Giữ cố định `file_size = 10 MB` ($Nom$), lần lượt thay đổi `msg_len` qua $\{1, 2, 500, 1999, 2000\}$.
- **Nhóm 2 (Cases 6 - 9)**: Giữ cố định `msg_len = 500` ký tự ($Nom$), lần lượt thay đổi `file_size` qua $\{1, 2, 24, 25\}$ MB.

| Case ID | Độ dài tin nhắn `msg_len` | Dung lượng tệp `file_size` | Kỹ thuật kiểm thử | Các bước thực hiện | Kết quả mong đợi (Expected Output) | Kết quả thực tế | Trạng thái |
|:---:|:---:|:---:|:---:|:---|:---|:---:|:---:|
| **TC_BVA_01** | **1** ($Min$) | **10 MB** ($Nom$) | $Min(X), Nom(Y)$ | 1. Soạn tin nhắn đúng 1 ký tự (`.`).<br>2. Đính kèm tệp tài liệu dung lượng 10 MB.<br>3. Bấm nút Gửi. | Hệ thống upload tệp 10 MB và gửi tin nhắn 1 ký tự thành công (HTTP 201). Hiển thị đầy đủ trong khung chat. | Gửi thành công, hiển thị đúng 1 ký tự kèm tệp 10MB | **PASS** |
| **TC_BVA_02** | **2** ($Min+$) | **10 MB** ($Nom$) | $Min+(X), Nom(Y)$ | 1. Soạn tin nhắn đúng 2 ký tự (`OK`).<br>2. Đính kèm tệp 10 MB.<br>3. Bấm nút Gửi. | Tin nhắn 2 ký tự gửi thành công cùng tệp 10 MB (HTTP 201), link download hoạt động tốt. | Gửi thành công | **PASS** |
| **TC_BVA_03** | **500** ($Nom$) | **10 MB** ($Nom$) | $Nom(X), Nom(Y)$<br>*(Baseline)* | 1. Nhập đoạn văn bản 500 ký tự.<br>2. Đính kèm tệp 10 MB.<br>3. Bấm Gửi. | Hệ thống xử lý mượt mà, lưu trữ DB chính xác 500 ký tự và URL tệp đính kèm. | Gửi thành công | **PASS** |
| **TC_BVA_04** | **1999** ($Max-$) | **10 MB** ($Nom$) | $Max-(X), Nom(Y)$ | 1. Dán văn bản dài 1999 ký tự.<br>2. Đính kèm tệp 10 MB.<br>3. Bấm Gửi. | Chấp nhận gửi dữ liệu sát biên trên, tin nhắn không vỡ layout, hiển thị trọn vẹn 1999 ký tự. | Gửi thành công | **PASS** |
| **TC_BVA_05** | **2000** ($Max$) | **10 MB** ($Nom$) | $Max(X), Nom(Y)$ | 1. Dán văn bản đúng 2000 ký tự.<br>2. Đính kèm tệp 10 MB.<br>3. Bấm Gửi. | Chấp thuận trọn vẹn giới hạn 2000 ký tự (HTTP 201), tải lên tệp 10 MB thành công. | Gửi thành công chạm mốc Max | **PASS** |
| **TC_BVA_06** | **500** ($Nom$) | **1 MB** ($Min$) | $Nom(X), Min(Y)$ | 1. Soạn tin nhắn 500 ký tự.<br>2. Đính kèm tệp kích thước tối thiểu 1 MB.<br>3. Bấm Gửi. | Upload tệp 1 MB lên server thành công trong < 1s, tin nhắn hiển thị tên tệp và kích thước `1.0 MB`. | Gửi thành công tệp 1 MB | **PASS** |
| **TC_BVA_07** | **500** ($Nom$) | **2 MB** ($Min+$) | $Nom(X), Min+(Y)$ | 1. Soạn tin nhắn 500 ký tự.<br>2. Đính kèm tệp 2 MB.<br>3. Bấm Gửi. | Upload tệp 2 MB thành công, tin nhắn hiển thị kích thước `2.0 MB`. | Gửi thành công tệp 2 MB | **PASS** |
| **TC_BVA_08** | **500** ($Nom$) | **24 MB** ($Max-$) | $Nom(X), Max-(Y)$ | 1. Soạn tin nhắn 500 ký tự.<br>2. Đính kèm tệp 24 MB.<br>3. Bấm Gửi. | Upload hoàn tất tệp dung lượng 24 MB (HTTP 200), tin nhắn gửi đi thành công. | Gửi thành công tệp 24 MB | **PASS** |
| **TC_BVA_09** | **500** ($Nom$) | **25 MB** ($Max$) | $Nom(X), Max(Y)$ | 1. Soạn tin nhắn 500 ký tự.<br>2. Đính kèm tệp đúng 25 MB (ngưỡng tối đa cho phép).<br>3. Bấm Gửi. | Hệ thống chấp thuận tại ngưỡng 25 MB, upload hoàn tất và hiển thị tệp đính kèm trong phòng chat. | Gửi thành công tệp 25 MB | **PASS** |

---

### 3. Mở rộng kiểm thử biên ngoại lệ (Robustness BVA Cases — $Min - 1$ & $Max + 1$)
*(Phần bổ sung theo yêu cầu nâng cao để kiểm thử khả năng xử lý lỗi và tính vững chắc của phần mềm khi dữ liệu vượt ngưỡng).*

| Case ID | Độ dài `msg_len` | Dung lượng `file_size` | Kỹ thuật biên | Các bước thực hiện | Kết quả mong đợi (Expected Output) | Trạng thái |
|:---:|:---:|:---:|:---:|:---|:---|:---:|
| **TC_ROB_01** | **0** ($Min-1$) | **0 MB** (Không file) | $Min-(X), Min-(Y)$ | 1. Để trống ô nhập tin nhắn và không chọn tệp.<br>2. Bấm Gửi. | Nút Gửi bị vô hiệu hóa hoặc API trả HTTP 400: *"Thiếu nội dung hoặc file đính kèm"*. | **PASS** |
| **TC_ROB_02** | **2001** ($Max+1$) | **10 MB** ($Nom$) | $Max+(X), Nom(Y)$ | 1. Nhập chuỗi 2001 ký tự.<br>2. Đính kèm tệp 10 MB.<br>3. Bấm Gửi. | Ô nhập tự động cắt còn 2000 ký tự hoặc API chặn và báo lỗi HTTP 400. | **PASS** |
| **TC_ROB_03** | **500** ($Nom$) | **0 MB** (0 Byte) | $Nom(X), Min-(Y)$ | 1. Chọn đính kèm tệp rỗng 0 Byte.<br>2. Bấm Gửi. | Hệ thống từ chối tệp rỗng, báo lỗi *"Không có dữ liệu trong file"*. | **PASS** |
| **TC_ROB_04** | **500** ($Nom$) | **26 MB** ($Max+1$) | $Nom(X), Max+(Y)$ | 1. Chọn tệp dung lượng 26 MB (> 25 MB). | Frontend chặn ngay lập tức, hiển thị Toast thông báo: *"File quá lớn, vượt quá giới hạn 25MB"*. | **PASS** |

---

### 4. Kết luận & Đánh giá
- **Kỹ thuật áp dụng**: Standard Boundary Value Analysis (9 cases) + Robustness BVA (4 cases).
- **Kết quả thực hiện**: 100% ca kiểm thử đạt kết quả **PASS**.
- Hệ thống NexusChat đảm bảo tính toàn vẹn dữ liệu tại tất cả các điểm cực trị: tin nhắn 1 ký tự, tin nhắn 2000 ký tự và tệp đính kèm từ 1 MB đến 25 MB.
