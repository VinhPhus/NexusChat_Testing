Feature('Chuyển Đổi Giao Diện Sáng Tối');

Scenario('Kiểm tra nút chuyển đổi chế độ Sáng và Tối (Dark / Light Theme)', ({ I }) => {
    // 1. Truy cập vào trang Đăng ký
    I.amOnPage('/signup');

    // 2. Kiểm tra có nút chuyển đổi giao diện trên Header
    I.seeElement('header button[title*="giao diện"]');

    // 3. Bấm vào nút chuyển đổi giao diện
    I.click('header button[title*="giao diện"]');
    I.wait(1);

    // 4. Bấm chuyển đổi lần nữa để quay lại chế độ ban đầu
    I.click('header button[title*="giao diện"]');
    I.wait(1);
});
