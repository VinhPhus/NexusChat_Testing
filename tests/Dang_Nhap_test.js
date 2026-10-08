Feature('Đăng Nhập Hệ Thống');

Scenario('Kiểm tra đăng nhập thành công vào NexusChat', ({ I }) => {
    // 1. Truy cập trực tiếp vào trang Đăng Nhập
    I.amOnPage('/signin');

    // Kiểm tra xem đã tải đúng trang chưa
    I.see('Chào mừng quay lại!');

    // 2. Điền thông tin vào form (Dựa theo ID thực tế trong code frontend của bạn)
    // Lưu ý: Bạn cần đổi 'admin' và '123456' thành tài khoản thật có trong database của bạn nhé!
    I.fillField('#signin-username', 'testuser1');
    I.fillField('#signin-password', '123456789aA');

    // 3. Bấm nút đăng nhập
    I.click('Đăng nhập');

    // 4. Chờ hệ thống xử lý API (tối đa 5 giây)
    I.wait(3);

    // 5. Kiểm tra xem có được chuyển hướng vào giao diện Chat (route /chat) thành công không
    I.seeInCurrentUrl('/chat');
});
