Feature('Chức Năng Nhắn Tin và Chat');

Scenario('Kiểm tra hiển thị đầy đủ giao diện phòng Chat sau khi đăng nhập', ({ I }) => {
    // 1. Đăng nhập vào hệ thống
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);

    // 2. Xác nhận đã vào trang Chat
    I.seeInCurrentUrl('/chat');

    // 3. Kiểm tra các thành phần chính trên Sidebar Chat
    I.see('NexusChat');
    I.seeElement('input[placeholder="Tìm kiếm bạn bè, nhóm..."]');
    I.see('duy123');
});

Scenario('Kiểm tra ô tìm kiếm bạn bè và nhóm trò chuyện trong Sidebar', ({ I }) => {
    // 1. Đăng nhập vào hệ thống
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    // 2. Gõ từ khóa tìm kiếm
    I.fillField('input[placeholder="Tìm kiếm bạn bè, nhóm..."]', 'bạn thân');
    I.wait(1);

    // 3. Kiểm tra ô tìm kiếm hiển thị đúng từ khóa đã nhập
    I.seeInField('input[placeholder="Tìm kiếm bạn bè, nhóm..."]', 'bạn thân');
});
