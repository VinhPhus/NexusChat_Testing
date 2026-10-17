import { locate } from 'codeceptjs';

Feature('Chức Năng Nhắn Tin, Thả Cảm Xúc và Thu Hồi Tin Nhắn');

Scenario('1. Kiểm tra hiển thị đầy đủ giao diện phòng Chat sau khi đăng nhập', ({ I }) => {
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

Scenario('2. Kiểm tra gửi tin nhắn văn bản bằng phím Enter', ({ I }) => {
    // 1. Đăng nhập vào hệ thống
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    // 2. Chờ tải danh sách hội thoại và mở đoạn chat với Phạm Bảo trong sidebar
    I.waitForElement('.space-y-2 .cursor-pointer', 10);
    I.click(locate('.space-y-2 .cursor-pointer').withText('Phạm Bảo'));
    I.wait(2);

    // 3. Xác nhận hiển thị ô soạn tin nhắn
    I.waitForElement('input[placeholder="Soạn tin nhắn..."]', 10);

    // 4. Soạn nội dung tin nhắn kiểm thử
    const testMessage = `Test enter ${Date.now()}`;
    I.fillField('input[placeholder="Soạn tin nhắn..."]', testMessage);
    I.wait(1);

    // 5. Bấm vào ô input và nhấn phím Enter để gửi
    I.click('input[placeholder="Soạn tin nhắn..."]');
    I.pressKey('Enter');
    
    // 6. Kiểm tra tin nhắn vừa gửi xuất hiện trong khung chat
    I.waitForText(testMessage, 10);
});

Scenario('3. Kiểm tra gửi tin nhắn bằng nút Gửi kèm biểu tượng cảm xúc Emoji Picker', ({ I }) => {
    // 1. Đăng nhập vào hệ thống
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    // 2. Mở cuộc trò chuyện với Phạm Bảo trong sidebar
    I.waitForElement('.space-y-2 .cursor-pointer', 10);
    I.click(locate('.space-y-2 .cursor-pointer').withText('Phạm Bảo'));
    I.wait(2);
    I.waitForElement('input[placeholder="Soạn tin nhắn..."]', 10);

    // 3. Kiểm tra có nút Emoji Picker trên thanh soạn thảo
    I.seeElement('svg.lucide-smile');

    // 4. Nhập nội dung văn bản kèm Emoji vào ô soạn tin
    const messageWithEmoji = `Test emoji 😀 ${Date.now()}`;
    I.fillField('input[placeholder="Soạn tin nhắn..."]', messageWithEmoji);
    I.wait(1);

    // 5. Bấm nút Gửi (Send Button) để gửi tin nhắn
    I.click('button:has(svg.lucide-send)');

    // 6. Xác nhận tin nhắn hiển thị thành công trong cuộc trò chuyện
    I.waitForText(messageWithEmoji, 10);
});

Scenario('4. Kiểm tra luồng liên hoàn (End-to-End): Tìm kiếm bạn bè -> Mở chat -> Gửi tin -> Thả React -> Thu hồi tin nhắn', ({ I }) => {
    // BƯỚC 1: Đăng nhập vào tài khoản kiểm thử duy123
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    // BƯỚC 2: Tìm kiếm bạn bè 'Phạm Bảo' và bấm vào đoạn chat trong sidebar
    I.waitForElement('input[placeholder="Tìm kiếm bạn bè, nhóm..."]', 10);
    I.fillField('input[placeholder="Tìm kiếm bạn bè, nhóm..."]', 'Phạm Bảo');
    I.wait(1);
    I.seeInField('input[placeholder="Tìm kiếm bạn bè, nhóm..."]', 'Phạm Bảo');
    I.waitForElement('.space-y-2 .cursor-pointer', 10);
    I.click(locate('.space-y-2 .cursor-pointer').withText('Phạm Bảo'));
    I.wait(2);
    I.waitForElement('input[placeholder="Soạn tin nhắn..."]', 10);

    // BƯỚC 3: Gửi tin nhắn kiểm thử cho luồng liên hoàn bằng nút Gửi
    const flowMessage = `Test E2E ${Date.now()}`;
    I.fillField('input[placeholder="Soạn tin nhắn..."]', flowMessage);
    I.click('button:has(svg.lucide-send)');
    I.waitForText(flowMessage, 10);

    // BƯỚC 4: Thả cảm xúc ❤️ vào tin nhắn vừa gửi qua menu tùy chọn
    I.waitForElement('.message-options-btn', 10);
    I.click(locate('.message-options-btn').first());
    I.wait(1);
    I.waitForText('❤️', 10);
    I.click('❤️');
    I.waitForText('❤️', 10);

    // BƯỚC 5: Mở lại menu tùy chọn và thực hiện Thu hồi tin nhắn (Recall)
    I.click(locate('.message-options-btn').first());
    I.wait(1);
    I.waitForText('Thu hồi tin nhắn', 10);
    I.click('Thu hồi tin nhắn');

    // BƯỚC 6: Xác nhận tin nhắn trong khung chat đã chuyển sang trạng thái bị thu hồi
    I.waitForText('Tin nhắn đã bị thu hồi', 10);
    I.see('Tin nhắn đã bị thu hồi');
});
