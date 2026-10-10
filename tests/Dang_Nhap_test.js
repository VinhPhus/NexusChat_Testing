Feature('Đăng Nhập Hệ Thống');

Scenario('Kiểm tra hiển thị đầy đủ giao diện trang Đăng Nhập', ({ I }) => {
    // 1. Truy cập vào trang Đăng Nhập
    I.amOnPage('/signin');

    // 2. Kiểm tra các thành phần giao diện chính
    I.see('Chào mừng quay lại!');
    I.seeElement('#signin-username');
    I.seeElement('#signin-password');
    I.see('Đăng nhập');
    I.see('Quên mật khẩu?');
    I.see('Đăng ký tài khoản mới');
});

Scenario('Kiểm tra cảnh báo lỗi khi để trống thông tin đăng nhập', ({ I }) => {
    I.amOnPage('/signin');

    // Bấm nút đăng nhập khi chưa nhập thông tin
    I.click('Đăng nhập');
    I.wait(1);

    // Kiểm tra thông báo yêu cầu nhập đủ thông tin
    I.see('Bạn cần nhập đủ thông tin!');
});

Scenario('Kiểm tra chuyển hướng sang trang Đăng Ký khi bấm liên kết', ({ I }) => {
    I.amOnPage('/signin');

    // Bấm vào liên kết đăng ký tài khoản mới
    I.click('Đăng ký tài khoản mới');
    I.wait(1);

    // Kiểm tra đã chuyển sang form Đăng ký
    I.see('Tạo tài khoản mới');
});

Scenario('Kiểm tra đăng nhập thành công vào NexusChat', ({ I }) => {
    // 1. Truy cập trực tiếp vào trang Đăng Nhập
    I.amOnPage('/signin');

    // 2. Điền thông tin vào form (Dùng tài khoản hợp lệ trong database)
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');

    // 3. Bấm nút đăng nhập
    I.click('Đăng nhập');

    // 4. Chờ hệ thống phản hồi API
    I.wait(3);

    // 5. Kiểm tra chuyển hướng vào giao diện Chat thành công (/chat)
    I.seeInCurrentUrl('/chat');
    I.wait(3); // Giữ màn hình 3 giây để nhìn thấy giao diện chat
});

Scenario('Kiểm tra luồng liên hoàn: Test Đăng ký, chuyển sang test Đăng nhập và vào tài khoản duy123', ({ I }) => {
    // BƯỚC 1: Vào trang Đăng ký và điền form kiểm thử
    I.amOnPage('/signup');
    I.see('Tạo tài khoản mới');
    I.fillField('#signup-lastname', 'Nguyễn');
    I.fillField('#signup-firstname', 'Văn Test');
    I.fillField('#signup-username', 'user_test_flow');
    I.fillField('#signup-email', 'user_test_flow@gmail.com');
    I.fillField('#signup-password', 'Matkhau123');
    I.fillField('#signup-confirm-password', 'Matkhau123');
    I.wait(1);

    // BƯỚC 2: Bấm chuyển sang trang Đăng nhập
    I.click('Đăng nhập ngay');
    I.wait(1);
    I.see('Chào mừng quay lại!');

    // BƯỚC 3: Thử bấm Đăng nhập để test bắt lỗi khi để trống
    I.click('Đăng nhập');
    I.wait(1);
    I.see('Bạn cần nhập đủ thông tin!');

    // BƯỚC 4: Điền chính xác thông tin tài khoản duy123
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);

    // BƯỚC 5: Xác nhận chuyển hướng vào thẳng giao diện Chat (/chat)
    I.seeInCurrentUrl('/chat');
    I.wait(3); // Giữ màn hình 3 giây để nhìn thấy trang Chat
});

