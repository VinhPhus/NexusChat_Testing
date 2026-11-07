# Thiết kế test case Black-box cho chức năng quản trị nhóm chat

## 1. Mục tiêu

Kiểm thử chức năng tạo nhóm chat và gán phó nhóm dựa trên đầu vào và kết quả mong đợi, không xét cấu trúc mã nguồn bên trong. Bài áp dụng bốn kỹ thuật Black-box trong Chương 4:

- Phân hoạch lớp tương đương (Equivalence Partitioning - EP)
- Phân tích giá trị biên (Boundary Value Analysis - BVA)
- Kiểm thử chuyển trạng thái (State Transition Testing)
- Bảng quyết định (Decision Table Testing)

## 2. Phạm vi và giả định

Các giới hạn dưới đây lấy theo collection Postman `BVA_TrungChien_Group_Management`:

| Thuộc tính | Điều kiện hợp lệ |
|---|---|
| Độ dài tên nhóm | Từ 3 đến 50 ký tự |
| Tổng số thành viên | Từ 3 đến 100 người, gồm cả trưởng nhóm |
| Số phó nhóm | Từ 0 đến 3 người |
| ID thành viên | ID hợp lệ, không trùng; người dùng đáp ứng điều kiện của ứng dụng |
| Tài khoản tạo nhóm | Token hợp lệ; người tạo là trưởng nhóm |

Theo collection, tạo nhóm thành công mong đợi HTTP `201`; gán vai trò thành công mong đợi HTTP `200`. Với dữ liệu không hợp lệ, mong đợi ứng dụng từ chối yêu cầu và không tạo/cập nhật dữ liệu. Mã HTTP cụ thể cho từng lỗi cần xác nhận theo đặc tả API.

> **Lưu ý:** Đây là giả định dựa trên collection Postman, chưa được đối chiếu với đặc tả chính thức của ứng dụng. Cần điều chỉnh nếu tài liệu yêu cầu quy định giới hạn khác.

## 3. Phân hoạch lớp tương đương (EP)

EP chia đầu vào thành các nhóm hợp lệ và không hợp lệ, sau đó chọn một giá trị đại diện ở mỗi nhóm.

| ID | Dữ liệu kiểm thử | Kết quả mong đợi |
|---|---|---|
| EP-01 | Tên dài 20 ký tự; 30 thành viên; 2 phó nhóm; các ID hợp lệ và không trùng | Tạo nhóm thành công; thông tin nhóm, thành viên và vai trò đúng |
| EP-02 | Tên nhóm dài 2 ký tự | Từ chối vì tên ngắn hơn mức tối thiểu |
| EP-03 | Tên nhóm dài 51 ký tự | Từ chối vì tên vượt mức tối đa |
| EP-04 | Tổng cộng 2 thành viên | Từ chối vì ít hơn mức tối thiểu |
| EP-05 | Tổng cộng 101 thành viên | Từ chối vì vượt mức tối đa |
| EP-06 | Danh sách thành viên có ID sai định dạng | Từ chối ID không hợp lệ |
| EP-07 | Danh sách thành viên chứa ID trùng | Từ chối dữ liệu trùng lặp |
| EP-08 | Yêu cầu có 4 phó nhóm | Từ chối vì vượt mức tối đa |
| EP-09 | Gán phó nhóm cho ID không thuộc nhóm | Không gán vai trò; dữ liệu nhóm không thay đổi |

## 4. Phân tích giá trị biên (BVA)

BVA tập trung vào các giá trị tại hoặc gần giới hạn vì lỗi thường xuất hiện ở biên. Mỗi test case chỉ thay đổi một biến; giữ các biến khác ở giá trị chuẩn: tên 20 ký tự, 30 thành viên và 2 phó nhóm.

### 4.1 Standard BVA - các biên hợp lệ

| ID | Biến được kiểm tra | Giá trị | Kết quả mong đợi |
|---|---|---:|---|
| BVA-01 | Độ dài tên nhóm | 3 | Thành công |
| BVA-02 | Độ dài tên nhóm | 4 | Thành công |
| BVA-03 | Độ dài tên nhóm | 20 | Thành công - giá trị chuẩn |
| BVA-04 | Độ dài tên nhóm | 49 | Thành công |
| BVA-05 | Độ dài tên nhóm | 50 | Thành công |
| BVA-06 | Tổng số thành viên | 3 | Thành công |
| BVA-07 | Tổng số thành viên | 4 | Thành công |
| BVA-08 | Tổng số thành viên | 30 | Thành công - giá trị chuẩn |
| BVA-09 | Tổng số thành viên | 99 | Thành công |
| BVA-10 | Tổng số thành viên | 100 | Thành công |
| BVA-11 | Số phó nhóm | 0 | Thành công |
| BVA-12 | Số phó nhóm | 1 | Thành công |
| BVA-13 | Số phó nhóm | 2 | Thành công - giá trị chuẩn |
| BVA-14 | Số phó nhóm | 3 | Thành công |

### 4.2 Robust BVA - các giá trị ngoài biên

| ID | Biến được kiểm tra | Giá trị | Kết quả mong đợi |
|---|---|---:|---|
| RBVA-01 | Độ dài tên nhóm | 2 | Bị từ chối |
| RBVA-02 | Độ dài tên nhóm | 51 | Bị từ chối |
| RBVA-03 | Tổng số thành viên | 2 | Bị từ chối |
| RBVA-04 | Tổng số thành viên | 101 | Bị từ chối |
| RBVA-05 | Số phó nhóm | -1 | Bị từ chối nếu API nhận giá trị này |
| RBVA-06 | Số phó nhóm | 4 | Bị từ chối |

Collection hiện có chạy 13 case Standard BVA hợp lệ. Các test case Robust BVA cần được thêm hoặc chạy riêng.

## 5. Kiểm thử chuyển trạng thái

Kiểm tra trạng thái thay đổi thế nào sau một sự kiện. Trạng thái vai trò đơn giản: chưa có nhóm → thành viên → phó nhóm.

| ID | Trạng thái ban đầu | Sự kiện / đầu vào | Kết quả mong đợi |
|---|---|---|---|
| ST-01 | Chưa có nhóm | Tạo nhóm với dữ liệu hợp lệ | Nhóm được tạo; người gửi là trưởng nhóm; các ID được thêm là thành viên |
| ST-02 | Nhóm đã tạo; người được chọn đang là thành viên thường | Gửi yêu cầu gán người đó làm phó nhóm | Yêu cầu thành công; vai trò của người đó đổi thành `deputy` |
| ST-03 | Nhóm đã tạo | Gán phó nhóm cho ID không thuộc nhóm | Yêu cầu bị từ chối; trạng thái nhóm không đổi |

## 6. Bảng quyết định

`—` nghĩa là điều kiện đó không ảnh hưởng đến kết quả của quy tắc đang xét. Mỗi quy tắc lỗi chỉ làm sai một điều kiện để dễ xác định nguyên nhân.

| Điều kiện / Kết quả | R1 | R2 | R3 | R4 | R5 |
|---|---:|---:|---:|---:|---:|
| Token hợp lệ | Có | Có | Có | Có | Có |
| Tên nhóm hợp lệ | Có | Không | Có | Có | Có |
| Số thành viên hợp lệ | Có | Có | Không | Có | Có |
| ID hợp lệ, không trùng | Có | Có | Có | Không | Có |
| Số phó nhóm hợp lệ | Có | Có | Có | Có | Không |
| **Kết quả mong đợi** | Tạo nhóm; gán vai trò thành công | Từ chối tên | Từ chối số thành viên | Từ chối danh sách ID | Từ chối số phó nhóm |

Việc tạo nhóm và gán phó nhóm có thể là hai request riêng. Khi kiểm thử, cần xác nhận kết quả từng request.

## 7. Hướng dẫn chạy bằng Postman

1. Mở collection Postman và cấu hình `baseUrl`, token thật trong `bearerToken`, cùng danh sách ID người dùng thật trong `memberIds`.
2. Chạy collection hiện tại để thực hiện các case Standard BVA.
3. So sánh response thực tế với kết quả mong đợi trong các bảng; ghi lại Pass/Fail.
4. Các case EP dữ liệu không hợp lệ và Robust BVA chưa có sẵn đầy đủ trong collection hiện tại, cần tạo/copy request tương ứng và thay dữ liệu đầu vào.

**Lưu ý về dữ liệu:** Tổng số thành viên gồm cả tài khoản tạo nhóm. Do đó nhóm 100 người cần 99 ID thành viên khác. Dùng ID hợp lệ của ứng dụng; không dùng ID ví dụ hoặc ID giả. Mỗi test tạo nhóm mới, nên cần dọn dữ liệu kiểm thử nếu không còn sử dụng.

## 8. Giải thích ngắn gọn

- **EP:** Không cần thử mọi giá trị; chọn giá trị đại diện cho từng nhóm hợp lệ và không hợp lệ.
- **BVA:** Thử ngay tại và gần giới hạn, ví dụ tên 3, 4, 49, 50 ký tự.
- **State Transition:** Kiểm tra hành động làm hệ thống đổi trạng thái đúng hay không, ví dụ thành viên thường trở thành phó nhóm.
- **Decision Table:** Kiểm tra nhiều điều kiện kết hợp; dữ liệu chỉ được chấp nhận khi các điều kiện bắt buộc đều hợp lệ.

## 9. Kết luận

Bốn kỹ thuật Black-box giúp chọn test case có hệ thống từ yêu cầu chức năng: EP bao phủ các nhóm dữ liệu, BVA tập trung vào giới hạn, State Transition kiểm tra thay đổi trạng thái và Decision Table kiểm tra tổ hợp điều kiện. Collection Postman hiện có hỗ trợ chạy các case Standard BVA; cần bổ sung các case không hợp lệ và các kiểm thử trạng thái/điều kiện để có độ bao phủ đầy đủ hơn.
