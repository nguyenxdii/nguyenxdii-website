/* js/chatbot.js */
const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Biến lưu tin nhắn người dùng
const inputInitHeight = chatInput.scrollHeight;

// =================================================================
// CẤU HÌNH API KEY VÀ THÔNG TIN BOT
// =================================================================
const API_KEY = "AIzaSyAVm3XBST9AK1pk1DoHIrdc1whre061OB0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const SYSTEM_INSTRUCTION = `
Bạn là trợ lý AI cho website Portfolio của Dii Nguyễn (Dii.EXE).
Thông tin về Dii Nguyễn:
- Tên: Dii Nguyễn (@dii.exe411).
- Slogan: "Một người bình thường, cố gắng trở nên khá hơn từng chút."
- Kỹ năng chính: Lập trình Web, Ứng dụng Windows (WinForm), C#, Java, MySQL, HTML/CSS/JS.
- Các dự án tiêu biểu:
  1. Logistics App (C#, WinForm): Hệ thống quản lý vận tải, kho bãi.
  2. Stationery Shop (Java, MySQL): Phần mềm quản lý bán hàng văn phòng phẩm.
  3. Portfolio Web (HTML, CSS, JS): Website phong cách Neon Glassmorphism.
- Liên hệ: Email (contact@nguyexndii.id.vn), Facebook, Github.
- Phong cách trả lời: Thân thiện, ngắn gọn, chuyên nghiệp nhưng có chút cá tính (như dân IT).
Hãy trả lời các câu hỏi của khách truy cập dựa trên thông tin trên. Nếu không biết, hãy gợi ý họ liên hệ qua Email hoặc Facebook.
`;

const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);

  let chatContent =
    className === "outgoing"
      ? `<p></p>`
      : `<img src="assets/images/bot-avatar.png" alt="Bot" class="bot-avatar"><p></p>`;

  chatLi.innerHTML = chatContent;

  // Nếu là typing animation thì chèn HTML, nếu là text thường thì chèn textContent
  if (message === "...") {
    chatLi.querySelector(
      "p"
    ).innerHTML = `<span></span><span></span><span></span>`;
  } else {
    chatLi.querySelector("p").textContent = message;
  }

  return chatLi;
};

const generateResponse = async (chatElement) => {
  const messageElement = chatElement.querySelector("p");

  // Thêm class typing để kích hoạt CSS animation
  chatElement.classList.add("typing");

  // Cấu trúc Request gửi lên Gemini
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                SYSTEM_INSTRUCTION + "\n\nCâu hỏi của khách: " + userMessage,
            },
          ],
        },
      ],
    }),
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Lấy text trả về từ Gemini
    const apiResponse = data.candidates[0].content.parts[0].text.trim();

    // Gán nội dung trả lời
    messageElement.textContent = apiResponse;
  } catch (error) {
    messageElement.textContent =
      "Xin lỗi, hiện tại tôi đang bị quá tải. Vui lòng thử lại sau! (Lỗi: " +
      error.message +
      ")";
    messageElement.style.color = "#ff6b6b";
  } finally {
    // Xóa class typing sau khi đã có câu trả lời (để mất hiệu ứng 3 chấm và padding của typing)
    chatElement.classList.remove("typing");
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
};

const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;

  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  // 1. Thêm tin nhắn của người dùng vào khung chat
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  // 2. Hiển thị trạng thái "Đang nhập..." (hiệu ứng 3 chấm)
  setTimeout(() => {
    // Truyền "..." để createChatLi nhận biết và tạo các thẻ span
    const incomingChatLi = createChatLi("...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

// Xử lý sự kiện
chatInput.addEventListener("input", () => {
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () =>
  document.body.classList.remove("show-chatbot")
);
chatbotToggler.addEventListener("click", () =>
  document.body.classList.toggle("show-chatbot")
);
