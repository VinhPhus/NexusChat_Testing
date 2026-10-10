Feature('Chức Năng Đăng Xuất');

Scenario('Kiểm tra đăng xuất thành công khỏi hệ thống NexusChat', ({ I }) => {
    // 1. Đăng nhập vào hệ thống
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);

    // 2. Xác nhận đã vào phòng chat
    I.seeInCurrentUrl('/chat');

    // 3. Mở menu tài khoản cá nhân ở góc dưới Sidebar
    I.click('duy123');
    I.wait(1);

    // 4. Bấm nút Logout
    I.see('Logout');
    I.click('Logout');
    I.wait(2);

    // 5. Xác nhận đã chuyển hướng về trang Đăng nhập thành công
    I.seeInCurrentUrl('/signin');
    I.see('Chào mừng quay lại!');
});
