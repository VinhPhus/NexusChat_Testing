import { locate } from 'codeceptjs';
import path from 'path';

Feature('Chức Năng Tải Lên Tập Tin & Hình Ảnh (Upload Media & Files)');

const SAMPLE_IMAGE = './frontend/public/placeholder.png';
const SAMPLE_DOC = './tests/fixtures/test_document.txt';

Scenario('1. Kiểm tra hiển thị Menu mở rộng và các tùy chọn Upload file trong phòng Chat', ({ I }) => {
    // 1. Đăng nhập vào hệ thống
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    // 2. Mở cuộc trò chuyện với bạn bè (Phạm Bảo)
    I.waitForElement('.space-y-2 .cursor-pointer', 10);
    I.click(locate('.space-y-2 .cursor-pointer').withText('Phạm Bảo'));
    I.wait(2);
    I.waitForElement('input[placeholder="Soạn tin nhắn..."]', 10);

    // 3. Kiểm tra hiển thị nút Tính năng mở rộng (+)
    I.seeElement('button[title="Tính năng mở rộng"]');

    // 4. Bấm vào nút tính năng mở rộng để mở dropdown menu
    I.click('button[title="Tính năng mở rộng"]');
    I.wait(1);

    // 5. Xác nhận menu hiển thị các tùy chọn upload media
    I.waitForText('Hình ảnh & Video', 5);
    I.see('Tệp tài liệu');

    // 6. Kiểm tra các thẻ input type=file ẩn đã sẵn sàng trên DOM
    I.seeElementInDOM('input[type="file"][accept="image/*"]');
    I.seeElementInDOM('input[type="file"]:not([accept])');
});

Scenario('2. Kiểm tra chọn và xem trước (Preview) Hình ảnh trước khi gửi', ({ I }) => {
    // 1. Đăng nhập và mở phòng chat
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    I.waitForElement('.space-y-2 .cursor-pointer', 10);
    I.click(locate('.space-y-2 .cursor-pointer').withText('Phạm Bảo'));
    I.wait(2);
    I.waitForElement('input[placeholder="Soạn tin nhắn..."]', 10);

    // 2. Đính kèm file hình ảnh vào input file ảnh
    I.attachFile('input[type="file"][accept="image/*"]', SAMPLE_IMAGE);
    I.wait(2);

    // 3. Kiểm tra khu vực xem trước (Staged Preview) hiển thị ảnh
    I.waitForText('1 hình ảnh', 10);
    I.seeElement('img[alt="Preview"]');
    I.seeElement('button[title="Xoá ảnh này"]');
    I.see('Xoá tất cả');

    // 4. Bấm nút "Xoá tất cả" để hủy chọn ảnh
    I.click('Xoá tất cả');
    I.wait(1);

    // 5. Xác nhận vùng xem trước ảnh đã được đóng lại
    I.dontSee('1 hình ảnh');
    I.dontSeeElement('img[alt="Preview"]');
});

Scenario('3. Kiểm tra chọn và xem trước (Preview) Tệp tài liệu trước khi gửi', ({ I }) => {
    // 1. Đăng nhập và mở phòng chat
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    I.waitForElement('.space-y-2 .cursor-pointer', 10);
    I.click(locate('.space-y-2 .cursor-pointer').withText('Phạm Bảo'));
    I.wait(2);
    I.waitForElement('input[placeholder="Soạn tin nhắn..."]', 10);

    // 2. Đính kèm tệp văn bản vào input file tài liệu
    I.attachFile('input[type="file"]:not([accept])', SAMPLE_DOC);
    I.wait(2);

    // 3. Kiểm tra khung hiển thị tệp tài liệu đính kèm
    I.waitForText('test_document.txt', 10);
    I.seeElement('button[title="Bỏ tệp này"]');

    // 4. Bấm nút Bỏ tệp này để hủy đính kèm
    I.click('button[title="Bỏ tệp này"]');
    I.wait(1);

    // 5. Xác nhận tệp đã được loại bỏ khỏi khung soạn thảo
    I.dontSee('test_document.txt');
});

Scenario('4. Kiểm tra gửi tin nhắn kèm Hình ảnh (Upload & Send Image)', ({ I }) => {
    // 1. Đăng nhập và mở phòng chat với Phạm Bảo
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    I.waitForElement('.space-y-2 .cursor-pointer', 10);
    I.click(locate('.space-y-2 .cursor-pointer').withText('Phạm Bảo'));
    I.wait(2);
    I.waitForElement('input[placeholder="Soạn tin nhắn..."]', 10);

    // 2. Chọn hình ảnh để tải lên
    I.attachFile('input[type="file"][accept="image/*"]', SAMPLE_IMAGE);
    I.wait(2);
    I.waitForText('1 hình ảnh', 10);

    // 3. Bấm nút Gửi tin nhắn
    I.click('button:has(svg.lucide-send)');

    // 4. Chờ hệ thống upload lên máy chủ và hiển thị ảnh trong khung chat
    I.waitForElement('img[title="Bấm để xem ảnh phóng to"]', 25);
});

Scenario('5. Kiểm tra gửi tin nhắn kèm Tệp tài liệu (Upload & Send Document File)', ({ I }) => {
    // 1. Đăng nhập và mở phòng chat với Phạm Bảo
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    I.waitForElement('.space-y-2 .cursor-pointer', 10);
    I.click(locate('.space-y-2 .cursor-pointer').withText('Phạm Bảo'));
    I.wait(2);
    I.waitForElement('input[placeholder="Soạn tin nhắn..."]', 10);

    // 2. Chọn tệp tài liệu để đính kèm
    I.attachFile('input[type="file"]:not([accept])', SAMPLE_DOC);
    I.wait(2);
    I.waitForText('test_document.txt', 10);

    // 3. Bấm nút Gửi tin nhắn
    I.click('button:has(svg.lucide-send)');

    // 4. Chờ upload lên cloud lưu trữ và tin nhắn xuất hiện trong khung chat
    I.waitForText('test_document.txt', 25);
    I.waitForElement('a[title="Tải xuống"]', 25);
});

Scenario('6. Kiểm tra luồng liên hoàn (End-to-End): Upload đồng thời ảnh và tài liệu cùng lúc', ({ I }) => {
    // BƯỚC 1: Đăng nhập vào hệ thống
    I.amOnPage('/signin');
    I.fillField('#signin-username', 'duy123');
    I.fillField('#signin-password', 'Duy3101');
    I.click('Đăng nhập');
    I.wait(3);
    I.seeInCurrentUrl('/chat');

    // BƯỚC 2: Chọn bạn bè Phạm Bảo trong sidebar
    I.waitForElement('.space-y-2 .cursor-pointer', 10);
    I.click(locate('.space-y-2 .cursor-pointer').withText('Phạm Bảo'));
    I.wait(2);
    I.waitForElement('input[placeholder="Soạn tin nhắn..."]', 10);

    // BƯỚC 3: Đính kèm cả hình ảnh và tệp tài liệu
    I.attachFile('input[type="file"][accept="image/*"]', SAMPLE_IMAGE);
    I.wait(1);
    I.attachFile('input[type="file"]:not([accept])', SAMPLE_DOC);
    I.wait(2);

    // BƯỚC 4: Kiểm tra cả 2 thành phần xem trước đều hiển thị
    I.waitForText('1 hình ảnh', 10);
    I.waitForText('test_document.txt', 10);

    // BƯỚC 5: Bấm nút Gửi để truyền tải cả media và document
    I.click('button:has(svg.lucide-send)');

    // BƯỚC 6: Xác nhận các nội dung gửi thành công và xuất hiện trong luồng chat
    I.waitForElement('img[title="Bấm để xem ảnh phóng to"]', 25);
    I.waitForText('test_document.txt', 25);
    I.waitForElement('a[title="Tải xuống"]', 25);
});
