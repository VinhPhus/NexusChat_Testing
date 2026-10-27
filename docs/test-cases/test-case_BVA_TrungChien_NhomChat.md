# KIỂM THỬ GIÁ TRỊ BIÊN (STANDARD BVA)

## Chức năng: Quản trị nhóm chat (Group Management)

**Họ và tên sinh viên:** [Điền họ và tên]

**MSSV:** [Điền mã số sinh viên]

---

### 1. Phân tích miền giá trị đầu vào

- **Độ dài tên nhóm (`group_name_len`)**: [3, 50] ký tự
  - Min = 3, Min+ = 4, Nom = 20, Max- = 49, Max = 50
- **Số thành viên (`member_count`)**: [3, 100] người
  - Min = 3, Min+ = 4, Nom = 30, Max- = 99, Max = 100
- **Số phó nhóm (`deputy_count`)**: [0, 3] người
  - Min = 0, Min+ = 1, Nom = 2, Max- = 2, Max = 3
- **Tổng số test case:** 4n + 1 = 4 × 3 + 1 = 13 case

### 2. Bảng kịch bản kiểm thử (BVA Test Cases)

Với mỗi case, các biến không được kiểm tra sẽ giữ nguyên giá trị Nom. Tất cả giá trị đều nằm trong miền hợp lệ, nên kết quả mong đợi là tạo hoặc cập nhật nhóm thành công.

| Case | Độ dài tên nhóm (ký tự) | Số thành viên (người) | Số phó nhóm (người) | Expected Output | Thực tế | Trạng thái |
|:---:|:---:|:---:|:---:|:---|:---:|:---:|
| 1 | 3 (Min) | 30 (Nom) | 2 (Nom) | Tạo / cập nhật nhóm thành công |  |  |
| 2 | 4 (Min+) | 30 (Nom) | 2 (Nom) | Tạo / cập nhật nhóm thành công |  |  |
| 3 | 20 (Nom) | 30 (Nom) | 2 (Nom) | Tạo / cập nhật nhóm thành công |  |  |
| 4 | 49 (Max-) | 30 (Nom) | 2 (Nom) | Tạo / cập nhật nhóm thành công |  |  |
| 5 | 50 (Max) | 30 (Nom) | 2 (Nom) | Tạo / cập nhật nhóm thành công |  |  |
| 6 | 20 (Nom) | 3 (Min) | 2 (Nom) | Tạo / cập nhật nhóm thành công |  |  |
| 7 | 20 (Nom) | 4 (Min+) | 2 (Nom) | Tạo / cập nhật nhóm thành công |  |  |
| 8 | 20 (Nom) | 99 (Max-) | 2 (Nom) | Tạo / cập nhật nhóm thành công |  |  |
| 9 | 20 (Nom) | 100 (Max) | 2 (Nom) | Tạo / cập nhật nhóm thành công |  |  |
| 10 | 20 (Nom) | 30 (Nom) | 0 (Min) | Tạo / cập nhật nhóm thành công |  |  |
| 11 | 20 (Nom) | 30 (Nom) | 1 (Min+) | Tạo / cập nhật nhóm thành công |  |  |
| 12 | 20 (Nom) | 30 (Nom) | 2 (Max-) | Tạo / cập nhật nhóm thành công (trùng giá trị với Case 3) |  |  |
| 13 | 20 (Nom) | 30 (Nom) | 3 (Max) | Tạo / cập nhật nhóm thành công |  |  |

### 3. Ghi chú

Với miền `[0, 3]` của `deputy_count`, giá trị Nom = 2 trùng với Max- = 2. Vì vậy Case 12 có cùng dữ liệu với Case 3; bảng vẫn giữ đủ 13 dòng theo công thức `4n + 1`, nhưng khi chạy thực tế chỉ cần thực hiện một lần cho dữ liệu trùng nhau.
