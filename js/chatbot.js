/* js/chatbot.js - PHIÊN BẢN "BỘ NHỚ DAI" & AUTO-RESUME */

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
        <p>Xin chào! Mình là trợ lý AI của Dii Nguyễn. Bạn cần thông tin gì về Dii không?</p>
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
Bạn là trợ lý AI cho website Portfolio của Dii Nguyễn (Dii.EXE).
THÔNG TIN VỀ DII NGUYỄN:
- Tên thật: Dii Nguyễn (@dii.exe411).
- Giới tính: Nam.
- Năm sinh: 2003.
- Vai trò: Lập trình viên (Developer).
- Kỹ năng chính: Web (HTML/CSS/JS), WinForm (C#), Java, MySQL.
- Các dự án tiêu biểu: Logistics App, Stationery Shop, Portfolio Web.
- Liên hệ: Email (contact@nguyexndii.id.vn), Facebook, Github.

QUY TẮC TRẢ LỜI:
1. Trả lời ngắn gọn, thân thiện, xưng hô là "mình" và "bạn".
2. Tuyệt đối nhớ Dii là Nam.
3. CUỐI CÙNG CỦA CÂU TRẢ LỜI, hãy thêm dòng chứa ký tự "---" và theo sau là 3 câu gợi ý ngắn (dưới 6 từ) liên quan để khách hỏi tiếp, cách nhau bởi dấu "|".
`;

const initChatbot = () => {
  // 1. Chèn HTML nếu chưa có
  if (!document.querySelector(".chatbot")) {
    document.body.insertAdjacentHTML("beforeend", chatbotHTML);
  }

  const chatbotToggler = document.querySelector(".chatbot-toggler");
  const closeBtn = document.querySelector(".close-btn");
  const chatbot = document.querySelector(".chatbot"); // Lấy thẻ chatbot chính
  const chatbox = document.querySelector(".chatbox");
  const chatInput = document.querySelector(".chat-input textarea");
  const sendChatBtn = document.querySelector(".chat-input span");

  let userMessage = null;
  let isGenerating = false;
  const inputInitHeight = chatInput.scrollHeight;

  // --- CÁC HÀM LƯU TRỮ TRẠNG THÁI (localStorage) ---

  const saveState = () => {
    // 1. Lưu HTML lịch sử chat
    localStorage.setItem("chat_history", chatbox.innerHTML);

    // 2. Lưu trạng thái mở/đóng
    const isOpen = document.body.classList.contains("show-chatbot");
    localStorage.setItem("chat_is_open", isOpen);

    // 3. Lưu trạng thái đang gõ dở (nếu có)
    localStorage.setItem("chat_is_generating", isGenerating);
  };

  const loadState = () => {
    // 1. Khôi phục trạng thái MỞ/ĐÓNG (Sửa lỗi nháy hình)
    const isOpen = localStorage.getItem("chat_is_open") === "true";
    if (isOpen) {
      document.body.classList.add("show-chatbot");
      // Thêm class tắt hiệu ứng để nó hiện ngay lập tức
      chatbot.classList.add("no-transition");
      // Sau 100ms thì xóa class này đi để các lần sau vẫn có hiệu ứng đẹp
      setTimeout(() => chatbot.classList.remove("no-transition"), 100);
    }

    // 2. Khôi phục LỊCH SỬ CHAT
    const savedHistory = localStorage.getItem("chat_history");
    if (savedHistory) {
      chatbox.innerHTML = savedHistory;
      reattachFAQEvents(); // Gán lại sự kiện click cho các nút FAQ cũ
    } else {
      // Lần đầu tiên vào web -> Hiện FAQ mặc định
      setTimeout(() => {
        appendFAQ([
          "Dii là ai?",
          "Kỹ năng chuyên môn?",
          "Các dự án tiêu biểu?",
          "Thông tin liên hệ?",
        ]);
      }, 600);
    }

    // 3. Xử lý AUTO-RESUME (Nếu chuyển trang khi đang chờ trả lời)
    const wasGenerating = localStorage.getItem("chat_is_generating") === "true";
    const lastPrompt = localStorage.getItem("chat_last_prompt");

    if (wasGenerating && lastPrompt) {
      // Xóa bong bóng "typing..." cũ nếu bị kẹt lại trong HTML
      const stuckTyping = chatbox.querySelector(".chat.incoming.typing");
      if (stuckTyping) stuckTyping.remove();

      // Gọi lại API ngay lập tức (Resume)
      isGenerating = true; // Set cờ để khóa nút gửi
      generateResponse(null, lastPrompt); // Gọi hàm trả lời với prompt cũ
    }

    chatbox.scrollTo(0, chatbox.scrollHeight);
  };

  const reattachFAQEvents = () => {
    const chips = chatbox.querySelectorAll(".suggestion-chip");
    chips.forEach((chip) => {
      const newChip = chip.cloneNode(true);
      chip.parentNode.replaceChild(newChip, chip);
      newChip.addEventListener("click", () => {
        if (isGenerating) return;
        chatInput.value = newChip.textContent;
        handleChat();
      });
    });
  };

  const appendFAQ = (questions) => {
    const oldFaqs = document.querySelectorAll(".faq-container");
    oldFaqs.forEach((el) => el.remove());

    const faqDiv = document.createElement("div");
    faqDiv.classList.add("faq-container");

    questions.forEach((q) => {
      if (!q.trim()) return;
      const chip = document.createElement("span");
      chip.classList.add("suggestion-chip");
      chip.textContent = q.trim();

      chip.addEventListener("click", () => {
        if (isGenerating) return;
        chatInput.value = q.trim();
        handleChat();
      });

      faqDiv.appendChild(chip);
    });

    chatbox.appendChild(faqDiv);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    saveState(); // Lưu lại ngay khi có FAQ mới
  };

  const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent =
      className === "outgoing"
        ? `<p></p>`
        : `<img src="assets/images/bot-avatar.png" alt="Bot" class="bot-avatar"><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
  };

  // Hàm generateResponse được sửa lại để nhận prompt trực tiếp (cho tính năng Resume)
  const generateResponse = async (chatElement, resumePrompt = null) => {
    const messageElement = chatElement ? chatElement.querySelector("p") : null;

    // Nếu không có chatElement (trường hợp Resume), ta tạo mới bong bóng Bot
    let currentChatEl = chatElement;
    let currentMsgEl = messageElement;

    if (!currentChatEl) {
      currentChatEl = createChatLi("...", "incoming");
      chatbox.appendChild(currentChatEl);
      currentMsgEl = currentChatEl.querySelector("p");
    }

    // Hiệu ứng gõ
    currentChatEl.classList.add("typing");
    currentMsgEl.innerHTML = `<span></span><span></span><span></span>`;
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Quyết định nội dung gửi đi (Tin nhắn mới hay Tin nhắn cũ cần Resume)
    const promptToSend = resumePrompt || userMessage;

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: SYSTEM_INSTRUCTION + "\n\nKhách: " + promptToSend },
            ],
          },
        ],
      }),
    };

    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const rawText = data.candidates[0].content.parts[0].text.trim();
      const parts = rawText.split("---");
      const botAnswer = parts[0].trim();
      const suggestionsRaw = parts[1] ? parts[1].trim() : "";

      currentMsgEl.textContent = botAnswer;

      if (suggestionsRaw) {
        const newQuestions = suggestionsRaw.split("|");
        setTimeout(() => appendFAQ(newQuestions), 600);
      }
    } catch (error) {
      currentMsgEl.textContent = "Lỗi kết nối: " + error.message;
      currentMsgEl.style.color = "#ff6b6b";
    } finally {
      currentChatEl.classList.remove("typing");
      chatbox.scrollTo(0, chatbox.scrollHeight);

      // Reset trạng thái
      isGenerating = false;
      sendChatBtn.style.opacity = "1";
      sendChatBtn.style.pointerEvents = "auto";
      chatInput.focus();

      // Xóa cờ đang generate để không resume bậy bạ
      localStorage.setItem("chat_is_generating", "false");
      localStorage.removeItem("chat_last_prompt");

      saveState(); // Lưu lại kết quả
    }
  };

  const handleChat = () => {
    if (isGenerating) return;
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // 1. Bật trạng thái đang xử lý & Lưu prompt lại đề phòng chuyển trang
    isGenerating = true;
    localStorage.setItem("chat_is_generating", "true");
    localStorage.setItem("chat_last_prompt", userMessage);

    sendChatBtn.style.opacity = "0.4";
    sendChatBtn.style.pointerEvents = "none";

    // Xóa FAQ cũ
    const oldFaqs = document.querySelectorAll(".faq-container");
    oldFaqs.forEach((el) => el.remove());

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Hiển thị tin nhắn người dùng
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    saveState(); // Lưu HTML ngay lập tức

    // Gọi Bot trả lời
    setTimeout(() => {
      generateResponse(null, userMessage); // Truyền userMessage vào
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

  closeBtn.addEventListener("click", () => {
    document.body.classList.remove("show-chatbot");
    saveState();
  });

  chatbotToggler.addEventListener("click", () => {
    document.body.classList.toggle("show-chatbot");
    saveState();
  });

  // *** QUAN TRỌNG: Tải lại trạng thái khi vừa vào trang ***
  loadState();
};

document.addEventListener("DOMContentLoaded", initChatbot);
