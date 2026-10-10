Feature('Đăng Ký Tài Khoản');

Scenario('Kiểm tra hiển thị đầy đủ giao diện trang Đăng Ký', ({ I }) => {
    // 1. Truy cập vào trang Đăng ký
    I.amOnPage('/signup');

    // 2. Kiểm tra các thành phần giao diện chính
    I.see('Tạo tài khoản mới');
    I.seeElement('#signup-lastname');
    I.seeElement('#signup-firstname');
    I.seeElement('#signup-username');
    I.seeElement('#signup-email');
    I.seeElement('#signup-password');
    I.seeElement('#signup-confirm-password');
    I.see('Tiếp tục (Nhận mã OTP)');
});

Scenario('Kiểm tra cảnh báo lỗi khi để trống các trường thông tin', ({ I }) => {
    I.amOnPage('/signup');

    // Bấm nút tiếp tục khi chưa nhập gì
    I.click('Tiếp tục (Nhận mã OTP)');
    I.wait(1);

    // Hệ thống thông báo lỗi yêu cầu nhập đủ thông tin
    I.see('Bạn cần nhập đủ thông tin!');
});

Scenario('Kiểm tra validation mật khẩu nhập lại không khớp', ({ I }) => {
    I.amOnPage('/signup');

    I.fillField('#signup-lastname', 'Nguyễn');
    I.fillField('#signup-firstname', 'Văn Test');
    I.fillField('#signup-username', 'test_user_99');
    I.fillField('#signup-email', 'testuser99@example.com');
    I.fillField('#signup-password', 'Matkhau123');
    I.fillField('#signup-confirm-password', 'MatkhauKhac123');

    I.click('Tiếp tục (Nhận mã OTP)');
    I.wait(1);

    // Kiểm tra thông báo lỗi mật khẩu không khớp
    I.see('Mật khẩu nhập lại không khớp');
});

Scenario('Kiểm tra validation yêu cầu độ phức tạp của mật khẩu', ({ I }) => {
    I.amOnPage('/signup');

    // Nhập mật khẩu yếu (chỉ có chữ thường)
    I.fillField('#signup-password', 'matkhau');
    
    // Kiểm tra chỉ báo độ mạnh mật khẩu hiển thị
    I.see('Chữ hoa (A-Z)');
    I.see('Chữ số (0-9)');
});

Scenario('Kiểm tra nhập đầy đủ thông tin hợp lệ không xuất hiện cảnh báo lỗi', ({ I }) => {
    const randomUser = `user_${Date.now()}`;
    const randomEmail = `test_${Date.now()}@example.com`;

    I.amOnPage('/signup');

    I.fillField('#signup-lastname', 'Trần');
    I.fillField('#signup-firstname', 'Kiểm Thử');
    I.fillField('#signup-username', randomUser);
    I.fillField('#signup-email', randomEmail);
    I.fillField('#signup-password', 'Matkhau123');
    I.fillField('#signup-confirm-password', 'Matkhau123');

    // Kiểm tra các trường đã được điền đầy đủ và đúng chuẩn
    I.seeInField('#signup-lastname', 'Trần');
    I.seeInField('#signup-firstname', 'Kiểm Thử');
    I.dontSee('Mật khẩu nhập lại không khớp');
});


Scenario('Kiểm tra chuyển sang trang Đăng Nhập khi bấm liên kết Đã có tài khoản', ({ I }) => {
    I.amOnPage('/signup');

    // Bấm vào liên kết Đăng nhập ngay
    I.click('Đăng nhập ngay');
    I.wait(1);

    // Kiểm tra đã quay về giao diện Đăng nhập
    I.see('Chào mừng quay lại!');
    I.seeInCurrentUrl('/signin');
});

