# KIỂM THỬ GIÁ TRỊ BIÊN (STANDARD BVA)
## Chức năng: Đăng ký tài khoản (Authentication)

**Họ và tên sinh viên:** Giang Tỷ  
**MSSV:** 091205001046

---

### 1. Phân tích miền giá trị đầu vào

| Biến | Miền hợp lệ | Min | Min+ | Nom | Max- | Max |
|---|---:|---:|---:|---:|---:|---:|
| `username_len` | [3, 20] ký tự | 3 | 4 | 10 | 19 | 20 |
| `password_len` | [6, 32] ký tự | 6 | 7 | 12 | 31 | 32 |

Theo Standard BVA, với `n = 2` biến: **4n + 1 = 4 x 2 + 1 = 9 test case**. Mỗi biến được kiểm tra tại Min, Min+, Max- và Max; test case còn lại dùng giá trị Nom của cả hai biến.

### 2. Bảng kịch bản kiểm thử (BVA Test Cases)

Các trường không thuộc miền đang kiểm tra được giữ hợp lệ. Mật khẩu trong các test case đều có chữ hoa, chữ thường và chữ số để không bị từ chối bởi quy tắc độ phức tạp.

| Case | `username_len` | `password_len` | Expected Output | Thực tế | Trạng thái |
|:---:|:---:|:---:|:---|:---|:---:|
| BVA-01 | 10 (`bvauser001`) | 12 (`Aa1234567890`) | Cả hai độ dài được chấp nhận; API đi đến bước kiểm tra OTP và trả HTTP 400 với thông báo OTP không chính xác/hết hạn. | Chưa chạy | Chờ chạy |
| BVA-02 | 3 (`bva`) | 12 | Username tại Min được chấp nhận; API đi đến bước kiểm tra OTP. | Chưa chạy | Chờ chạy |
| BVA-03 | 4 (`bvaa`) | 12 | Username tại Min+ được chấp nhận; API đi đến bước kiểm tra OTP. | Chưa chạy | Chờ chạy |
| BVA-04 | 19 (`bva` + 16 ký tự `u`) | 12 | Username tại Max- được chấp nhận; API đi đến bước kiểm tra OTP. | Chưa chạy | Chờ chạy |
| BVA-05 | 20 (`bva` + 17 ký tự `u`) | 12 | Username tại Max được chấp nhận; API đi đến bước kiểm tra OTP. | Chưa chạy | Chờ chạy |
| BVA-06 | 10 | 6 (`Aa1234`) | Password tại Min được chấp nhận; API đi đến bước kiểm tra OTP. | Chưa chạy | Chờ chạy |
| BVA-07 | 10 | 7 (`Aa12345`) | Password tại Min+ được chấp nhận; API đi đến bước kiểm tra OTP. | Chưa chạy | Chờ chạy |
| BVA-08 | 10 | 31 (`Aa` + 29 chữ số `1`) | Password tại Max- được chấp nhận; API đi đến bước kiểm tra OTP. | Chưa chạy | Chờ chạy |
| BVA-09 | 10 | 32 (`Aa` + 30 chữ số `1`) | Password tại Max được chấp nhận; API đi đến bước kiểm tra OTP. | Chưa chạy | Chờ chạy |

### 3. Cách chạy kiểm thử

1. Khởi động backend và MongoDB theo cấu hình dự án (backend mặc định chạy ở `http://localhost:5001`).
2. Import [`BVA_Dang_Ky.postman_collection.json`](../../postman/collections/BVA_Dang_Ky.postman_collection.json) vào Postman.
3. Mở Collection Runner, chọn request **BVA - Signup username/password boundaries**, đặt số lần chạy (Iterations) là **9**, rồi chạy.
4. Mỗi lần chạy gửi một bộ dữ liệu biên. OTP cố ý là giá trị không hợp lệ để API dừng trước khi tạo tài khoản; không cần gửi email OTP.
5. Kết quả đạt khi cả hai assertion của từng iteration đều PASS. Ghi kết quả thực tế vào cột tương ứng sau khi chạy.

**Lưu ý về giới hạn password:** Backend hiện kiểm tra password tối thiểu 6 ký tự nhưng chưa kiểm tra tối đa 32 ký tự. Vì vậy test tại Max=32 có thể được chấp nhận, nhưng bộ 9 test Standard BVA này không chứng minh rằng giá trị 33 bị từ chối. Cần bổ sung test Max+1 nếu cần xác nhận ràng buộc trên; kết quả BVA tại Max không thay thế được phép thử đó.
