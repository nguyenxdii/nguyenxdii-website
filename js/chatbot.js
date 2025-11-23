const chatbotHTML = `
  <div class="chatbot-toggler">
    <span class="material-symbols-rounded"><i class="fa-solid fa-message"></i></span>
    <span class="material-symbols-rounded"><i class="fa-solid fa-xmark"></i></span>
  </div>
  <div class="chatbot">
    <header>
      <h2>Chat với Dii AI</h2>
      <span class="close-btn"><i class="fa-solid fa-xmark"></i></span>
    </header>
    <ul class="chatbox">
      <li class="chat incoming">
        <img src="assets/images/bot-avatar.png" alt="Bot" class="bot-avatar" />
        <p>Xin chào! Mình là trợ lý AI của Dii. Bạn muốn hỏi gì không?<br><b style="color:red;">Đồ free trả lời hơi xi đa <i class="fa-solid fa-heart-crack"></i></b></p>

      </li>
    </ul>
    <div class="chat-input">
      <textarea placeholder="Nhập câu hỏi..." spellcheck="false" required></textarea>
      <span id="send-btn" class="material-symbols-rounded"><i class="fa-solid fa-paper-plane"></i></span>
    </div>
  </div>
`;

// Cấu hình API
const API_KEY = "AIzaSyAVm3XBST9AK1pk1DoHIrdc1whre061OB0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
const SYSTEM_INSTRUCTION = `
Bạn là trợ lý AI cho website Portfolio của Dii Nguyễn (cu Dii).
Thông tin về Dii Nguyễn:
- Tên: Dii Nguyễn (@dii.exe411).
- Kỹ năng: Web (HTML/CSS/JS), WinForm (C#), Java, MySQL.
- Dự án: Logistics App, Stationery Shop, Portfolio Web.
- Liên hệ: contact@nguyexndii.id.vn.
Trả lời thân thiện, ngắn gọn, có chút cá tính IT.
`;

const initChatbot = () => {
  // 2. Tự động chèn HTML chatbot vào cuối trang
  document.body.insertAdjacentHTML("beforeend", chatbotHTML);

  // 3. Lấy các element sau khi đã chèn
  const chatbotToggler = document.querySelector(".chatbot-toggler");
  const closeBtn = document.querySelector(".close-btn");
  const chatbox = document.querySelector(".chatbox");
  const chatInput = document.querySelector(".chat-input textarea");
  const sendChatBtn = document.querySelector(".chat-input span");

  let userMessage = null;
  const inputInitHeight = chatInput.scrollHeight;

  const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent =
      className === "outgoing"
        ? `<p></p>`
        : `<img src="assets/images/bot-avatar.png" alt="Bot" class="bot-avatar"><p></p>`;
    chatLi.innerHTML = chatContent;

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
    chatElement.classList.add("typing");

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: SYSTEM_INSTRUCTION + "\n\nKhách: " + userMessage }],
          },
        ],
      }),
    };

    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);
      messageElement.textContent =
        data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      messageElement.textContent = "Lỗi kết nối: " + error.message;
      messageElement.style.color = "#ff6b6b";
    } finally {
      chatElement.classList.remove("typing");
      chatbox.scrollTo(0, chatbox.scrollHeight);
    }
  };

  const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
      const incomingChatLi = createChatLi("...", "incoming");
      chatbox.appendChild(incomingChatLi);
      chatbox.scrollTo(0, chatbox.scrollHeight);
      generateResponse(incomingChatLi);
    }, 600);
  };

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
};

// Kích hoạt khi trang tải xong
document.addEventListener("DOMContentLoaded", initChatbot);
