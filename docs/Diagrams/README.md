# SƠ ĐỒ CHUYỂN ĐỔI TRẠNG THÁI (STATE TRANSITION DIAGRAMS)

Tài liệu tổng hợp các sơ đồ chuyển đổi trạng thái và kịch bản kiểm thử tương ứng cho hệ thống NexusChat (Môn: Kiểm thử phần mềm - Kỹ thuật kiểm thử hộp đen, dựa trên Slide 40 Chương IV).

---

## 1. Chức năng Đăng nhập (Sign In)

![Sơ đồ chuyển đổi trạng thái - Đăng nhập](dang_nhap.png)

---

## 2. Chức năng Đăng ký (Sign Up)

> **Cơ sở thiết kế:** Áp dụng mô hình kiểm thử chuyển đổi trạng thái theo **Slide 40 - Chương IV** (Mô hình giới hạn 3 lần thử xác thực OTP / 3-Try Limit Pattern).

### 2.1. Hình ảnh sơ đồ trạng thái Đăng ký (Vector SVG)

![Sơ đồ chuyển đổi trạng thái - Đăng ký](dang_ky.svg)

---

### 2.2. Sơ đồ Mermaid (Tự động render trực tiếp trên GitHub)

```mermaid
flowchart LR
    Start["<b>Start</b><br/>(Nhập form Đăng ký)"]
    Try1["<b>1st Try</b><br/>(Nhập OTP lần 1)"]
    Try2["<b>2nd Try</b><br/>(Nhập OTP lần 2)"]
    Try3["<b>3rd Try</b><br/>(Nhập OTP lần 3)"]
    Success["<b>Access Granted</b><br/>(Đăng Ký Thành Công)"]
    Blocked["<b>Registration Blocked</b><br/>(Hủy phiên / Khóa Đăng Ký)"]

    Start -->|"Thông tin hợp lệ<br/>[Gửi mã OTP]"| Try1
    Start -.->|"Form lỗi / Thiếu trường<br/>[Báo lỗi]"| Start

    Try1 -->|"Incorrect OTP<br/>(Sai lần 1)"| Try2
    Try2 -->|"Incorrect OTP<br/>(Sai lần 2)"| Try3
    Try3 -->|"Incorrect OTP<br/>(Sai lần 3)"| Blocked

    Try1 -->|"Correct OTP"| Success
    Try2 -->|"Correct OTP"| Success
    Try3 -->|"Correct OTP"| Success

    style Start fill:#10b981,stroke:#047857,stroke-width:2.5px,color:#ffffff
    style Try1 fill:#fbbf24,stroke:#d97706,stroke-width:2.5px,color:#78350f
    style Try2 fill:#38bdf8,stroke:#0284c7,stroke-width:2.5px,color:#0c4a6e
    style Try3 fill:#a3e635,stroke:#65a30d,stroke-width:2.5px,color:#365314
    style Success fill:#16a34a,stroke:#15803d,stroke-width:2.5px,color:#ffffff
    style Blocked fill:#dc2626,stroke:#b91c1c,stroke-width:2.5px,color:#ffffff
```

---

### 2.3. Bảng thiết kế Ca kiểm thử chuyển trạng thái (State Transition Test Cases)

| Test Case ID | Trạng thái ban đầu | Sự kiện / Dữ liệu vào | Kết quả mong đợi (Expected Output) | Trạng thái kết thúc | Loại Test |
|:---:|:---:|:---|:---|:---:|:---:|
| **TC_ST_01** | `Start` | Để trống Họ tên/Email/Password | Báo lỗi *"Bạn cần nhập đủ thông tin!"*, ở lại form | `Start` | Negative |
| **TC_ST_02** | `Start` | Điền thông tin hợp lệ và bấm Đăng ký | Gửi mã OTP 6 số qua email, chuyển sang form OTP | `1st Try` | Positive |
| **TC_ST_03** | `1st Try` | Nhập đúng mã OTP ngay lần 1 | Báo *"Đăng ký thành công"*, tạo User, chuyển sang `/signin` | `Access Granted` | Positive |
| **TC_ST_04** | `1st Try` | Nhập sai OTP lần 1 (VD: `000000`) | Báo *"Mã OTP không chính xác, còn 2 lần thử"* | `2nd Try` | Negative |
| **TC_ST_05** | `2nd Try` | Nhập đúng OTP ở lần thử thứ 2 | Báo *"Đăng ký thành công"*, tạo User, chuyển sang `/signin` | `Access Granted` | Positive |
| **TC_ST_06** | `2nd Try` | Nhập sai OTP lần 2 (VD: `111111`) | Báo *"Mã OTP không chính xác, còn 1 lần thử"* | `3rd Try` | Negative |
| **TC_ST_07** | `3rd Try` | Nhập đúng OTP ở lần thử thứ 3 | Báo *"Đăng ký thành công"*, hoàn tất kích hoạt | `Access Granted` | Positive |
| **TC_ST_08** | `3rd Try` | Nhập sai OTP lần 3 (VD: `222222`) | Báo *"Đã vượt quá số lần cho phép. Phiên đăng ký bị hủy!"* | `Registration Blocked` | Negative |
