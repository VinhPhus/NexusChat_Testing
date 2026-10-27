# KIỂM THỬ GIÁ TRỊ BIÊN (STANDARD BVA)

## Chức năng: Tạo cuộc bình chọn (Poll Creation)

**Họ và tên sinh viên:** [Phạm Lâm Phương Bảo]  
**MSSV:** [08420500267]

---

### 1. Phân tích miền giá trị đầu vào

- **Độ dài câu hỏi (`question_len`)** thuộc [5, 100] ký tự
  - Min = 5, Min+ = 6, Nom = 40, Max- = 99, Max = 100
- **Số phương án (`options_count`)** thuộc [2, 10] phương án
  - Min = 2, Min+ = 3, Nom = 4, Max- = 9, Max = 10
- **Tổng số test case:** 4n + 1 = 4 × 2 + 1 = **9**

Các ca dưới đây áp dụng Standard BVA, vì vậy tất cả giá trị kiểm thử đều nằm trong miền hợp lệ. Khi kiểm tra một biến, giữ biến còn lại ở giá trị Nom.

### 2. Bảng kịch bản kiểm thử (BVA Test Cases)

| Case | Độ dài câu hỏi (`question_len`) | Số phương án (`options_count`) | Expected Output | Thực tế | Trạng thái |
|:---:|:---:|:---:|:---|:---|:---:|
| 1 | 5 (Min) | 4 (Nom) | Tạo bình chọn thành công |  |  |
| 2 | 6 (Min+) | 4 (Nom) | Tạo bình chọn thành công |  |  |
| 3 | 40 (Nom) | 4 (Nom) | Tạo bình chọn thành công |  |  |
| 4 | 99 (Max-) | 4 (Nom) | Tạo bình chọn thành công |  |  |
| 5 | 100 (Max) | 4 (Nom) | Tạo bình chọn thành công |  |  |
| 6 | 40 (Nom) | 2 (Min) | Tạo bình chọn thành công |  |  |
| 7 | 40 (Nom) | 3 (Min+) | Tạo bình chọn thành công |  |  |
| 8 | 40 (Nom) | 9 (Max-) | Tạo bình chọn thành công |  |  |
| 9 | 40 (Nom) | 10 (Max) | Tạo bình chọn thành công |  |  |

### 3. Điều kiện và cách thực hiện

- **Điều kiện trước:** Người dùng đã đăng nhập và là thành viên của nhóm chat; có sẵn `conversationId` hợp lệ.
- **Dữ liệu:** Câu hỏi có đúng độ dài ghi trong từng ca; mỗi phương án có nội dung không rỗng.
- **Thực hiện:** Mở chức năng tạo bình chọn, nhập câu hỏi và số phương án theo ca, sau đó gửi tạo bình chọn.
- **Kết quả cần xác nhận:** Bình chọn được tạo thành công, câu hỏi và các phương án được lưu đầy đủ.
- Điền cột **Thực tế** và **Trạng thái** sau khi chạy kiểm thử. Để trống trạng thái đến khi có kết quả thực thi.

