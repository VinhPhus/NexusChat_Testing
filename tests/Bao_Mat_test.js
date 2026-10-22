import { locate } from 'codeceptjs';

Feature('Kiểm Thử Bảo Mật & Quyền Riêng Tư (Security Testing)');

Scenario('1.1. Kiểm tra Protected Route - Chặn truy cập trái phép khi chưa đăng nhập', ({ I }) => {
    // 1. Cố tình truy cập trực tiếp vào đường dẫn được bảo vệ (/chat) khi chưa có session
    I.amOnPage('/chat');
    I.wait(2);

    // 2. Hệ thống phải kích hoạt Protected Route và tự động đá người dùng về trang Đăng nhập (/signin)
    I.seeInCurrentUrl('/signin');

    // 3. Xác nhận giao diện trang Đăng nhập hiển thị đầy đủ
    I.see('Chào mừng quay lại!');
    I.seeElement('#signin-username');
    I.seeElement('#signin-password');
});

Scenario('2.2. Kiểm tra Cài đặt Bảo mật - Quản lý Danh sách người dùng đã chặn', ({ I }) => {
    // 1. Đăng nhập vào hệ thống bằng tài khoản hợp lệ
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    // 2. Mở menu tài khoản cá nhân ở góc dưới Sidebar
    I.click('duy123');
    I.wait(1);

    // 3. Mở mục Cài đặt
    I.waitForText('Cài đặt', 5);
    I.click('Cài đặt');
    I.wait(1);

    // 4. Chuyển sang Tab "Bảo Mật"
    I.waitForText('Bảo Mật', 5);
    I.click('Bảo Mật');
    I.wait(1);

    // 5. Kiểm tra các mục thiết lập quyền riêng tư và bảo mật
    I.see('Quyền riêng tư & Bảo mật');
    I.see('Danh sách người dùng đã chặn');

    // 6. Mở Modal "Danh sách người dùng đã chặn"
    I.click('Danh sách người dùng đã chặn');
    I.wait(1);

    // 7. Xác nhận Modal danh sách chặn hiển thị thành công
    I.waitForText('Danh sách chặn', 5);
    I.see('Quản lý những người bạn đã chặn');
});

Scenario('3.1. Kiểm tra Chế độ Trò chuyện Ẩn danh (Incognito Mode) và Tắt khẩn cấp', ({ I }) => {
    // 1. Đăng nhập vào hệ thống
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    // 2. Mở cuộc hội thoại trực tiếp 1-1 với bạn bè
    I.waitForElement('.space-y-2 .cursor-pointer', 10);
    I.click(locate('.space-y-2 .cursor-pointer').withText('Phạm Bảo'));
    I.wait(2);

    // 3. Bấm vào tiêu đề / tên người dùng ở Header để mở thanh Profile thông tin chi tiết
    I.click(locate('header h2'));
    I.wait(1);

    // 4. Chọn chức năng "Bật Chat Ẩn Danh"
    I.waitForText('Bật Chat Ẩn Danh', 10);
    I.click('Bật Chat Ẩn Danh');
    I.wait(1);

    // 5. Xác nhận hiển thị Modal thiết lập thời gian ẩn danh
    I.waitForText('Cài đặt Chat Ẩn Danh', 5);
    I.click(locate('button[type="submit"]').inside('[role="dialog"]'));
    I.wait(2);

    // 6. Kiểm tra giao diện đã kích hoạt chế độ ẩn danh: Xuất hiện nút "Tắt khẩn cấp" hoặc nhãn "Chat Ẩn Danh"
    I.waitForText('Chat Ẩn Danh', 10);
    I.see('Tắt khẩn cấp');

    // 7. Thoát chế độ ẩn danh bằng nút "Tắt khẩn cấp" trên thanh Header
    I.click('button[title="Tắt khẩn cấp Chat Ẩn Danh"]');
    I.wait(2);

    // 8. Xác nhận đã quay lại chế độ chat thông thường
    I.dontSee('Tắt khẩn cấp');
});

Scenario('3.3. Kiểm tra Thu hồi tin nhắn (Recall Message) để bảo vệ dữ liệu nhạy cảm', ({ I }) => {
    // 1. Đăng nhập vào hệ thống
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    // 2. Mở hội thoại với Phạm Bảo
    I.waitForElement('.space-y-2 .cursor-pointer', 10);
    I.click(locate('.space-y-2 .cursor-pointer').withText('Phạm Bảo'));
    I.wait(2);
    I.waitForElement('input[placeholder="Soạn tin nhắn..."]', 10);

    // 3. Gửi một tin nhắn nhạy cảm kiểm thử
    const sensitiveMessage = `PIN: ${Date.now().toString().slice(-6)}`;
    I.fillField('input[placeholder="Soạn tin nhắn..."]', sensitiveMessage);
    I.click('button:has(svg.lucide-send)');
    I.waitForText(sensitiveMessage, 10);

    // 4. Mở menu tùy chọn trên tin nhắn vừa gửi (lấy phần tử cuối cùng vừa gửi)
    I.waitForElement('.message-options-btn', 10);
    I.click(locate('.message-options-btn').last());
    I.wait(1);

    // 5. Chọn chức năng Thu hồi tin nhắn
    I.waitForText('Thu hồi tin nhắn', 5);
    I.click('Thu hồi tin nhắn');

    // 6. Xác nhận nội dung nhạy cảm đã bị thu hồi thành công trong khung chat
    I.waitForText('Tin nhắn đã bị thu hồi', 10);
    I.see('Tin nhắn đã bị thu hồi');
});

Scenario('4.1. Kiểm thử Phòng chống tấn công XSS (Cross-Site Scripting Injection)', ({ I }) => {
    // 1. Đăng nhập vào hệ thống
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    // 2. Mở hội thoại với Phạm Bảo
    I.waitForElement('.space-y-2 .cursor-pointer', 10);
    I.click(locate('.space-y-2 .cursor-pointer').withText('Phạm Bảo'));
    I.wait(2);
    I.waitForElement('input[placeholder="Soạn tin nhắn..."]', 10);

    // 3. Chuẩn bị chuỗi mã độc XSS Payload tiêu chuẩn
    const xssPayload = '<img src=x onerror=1>';

    // 4. Gửi payload XSS vào khung chat
    I.fillField('input[placeholder="Soạn tin nhắn..."]', xssPayload);
    I.click('button:has(svg.lucide-send)');

    // 5. Xác nhận hệ thống mã hóa/escape an toàn:
    // Chuỗi mã độc chỉ hiển thị nguyên văn dạng chuỗi Text bình thường mà không bị thực thi mã Javascript
    I.waitForText(xssPayload, 10);
    I.see(xssPayload);
});
