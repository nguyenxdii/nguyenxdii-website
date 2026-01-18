// ================================================
// GUESTBOOK FEATURE - FIREBASE INTEGRATION
// ================================================

// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  onChildChanged,
  serverTimestamp,
  increment,
  update,
  query,
  orderByChild,
  limitToLast,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase Configuration (same as visitor-counter.js)
const firebaseConfig = {
  apiKey: "AIzaSyB2dz-jHuCBbgPspUnd3M2rMWQpYjk_iAo",
  authDomain: "my-web-c93a1.firebaseapp.com",
  databaseURL:
    "https://my-web-c93a1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-web-c93a1",
  storageBucket: "my-web-c93a1.firebasestorage.app",
  messagingSenderId: "471469563187",
  appId: "1:471469563187:web:8ba2a6998404c832f63246",
  measurementId: "G-T1VFLWC57D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Database reference
const guestbookRef = ref(db, "guestbook");

// ================================================
// SPAM PROTECTION - BAD WORDS FILTER
// ================================================
const badWords = [
  "đồ ngu",
  "đần",
  "khùng",
  "điên",
  "đéo",
  "đ.m",
  "dm",
  "lồn",
  "cặc",
  "đ.i.t",
  "dit",
  "shit",
  "fuck",
  "bitch",
];

function containsBadWords(text) {
  const lowerText = text.toLowerCase();

  // Check each bad word with word boundaries
  return badWords.some((word) => {
    // Create regex with word boundaries for whole word match
    const regex = new RegExp(
      `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    );
    return regex.test(lowerText);
  });
}

// ================================================
// COOLDOWN SYSTEM
// ================================================
const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

function canPost() {
  const lastPostTime = localStorage.getItem("last_guest_post_time");
  if (!lastPostTime) return true;

  const elapsed = Date.now() - parseInt(lastPostTime);
  return elapsed >= COOLDOWN_TIME;
}

function getRemainingCooldown() {
  const lastPostTime = localStorage.getItem("last_guest_post_time");
  if (!lastPostTime) return 0;

  const elapsed = Date.now() - parseInt(lastPostTime);
  const remaining = COOLDOWN_TIME - elapsed;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

// XSS Protection - Escape HTML
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Get random color class
function getRandomColor() {
  const colors = ["note-yellow", "note-pink", "note-blue", "note-green"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Get random rotation (-3deg to 3deg)
function getRandomRotation() {
  const rotation = (Math.random() * 6 - 3).toFixed(2);
  return `rotate(${rotation}deg)`;
}

// Get random pin color
function getRandomPinColor() {
  const colors = [
    "pin-red",
    "pin-blue",
    "pin-green",
    "pin-yellow",
    "pin-purple",
    "pin-orange",
    "pin-pink",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Get random pin position (15% to 85% from left)
function getRandomPinPosition() {
  const position = Math.floor(Math.random() * 70) + 15; // 15% to 85%
  return `${position}%`;
}

// Format timestamp as relative time
function formatTimestamp(timestamp) {
  if (!timestamp) return "Vừa xong";

  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return "Vừa xong";
}

// ================================================
// LIVE TIMESTAMP SYSTEM
// ================================================
function initLiveTimestamps() {
  setInterval(() => {
    document.querySelectorAll(".note-timestamp").forEach((el) => {
      const timestamp = el.dataset.timestamp;
      if (timestamp) {
        el.textContent = formatTimestamp(parseInt(timestamp));
      }
    });
  }, 60000); // Update every minute
}

// Start live updates
initLiveTimestamps();

// ================================================
// DOM ELEMENTS
// ================================================
const form = document.getElementById("guestbook-form");
const nameInput = document.getElementById("guest-name");
const messageInput = document.getElementById("guest-message");
const nameCounter = document.getElementById("name-counter");
const messageCounter = document.getElementById("message-counter");
const errorDiv = document.getElementById("form-error");
const gridContainer = document.getElementById("guestbook-grid");
const floatingBtn = document.getElementById("floating-write-btn");
const popupOverlay = document.getElementById("write-popup-overlay");
const popupClose = document.getElementById("popup-close");

// ================================================
// POPUP CONTROLS
// ================================================
floatingBtn?.addEventListener("click", () => {
  popupOverlay?.classList.add("active");
  // Hide the floating button when popup is open
  if (floatingBtn) floatingBtn.style.display = "none";
  // Play sound if available
  if (typeof gameSounds !== "undefined") gameSounds.playClick();
  nameInput?.focus();
});

function closePopup() {
  popupOverlay?.classList.remove("active");
  // Show the floating button when popup is closed
  if (floatingBtn) floatingBtn.style.display = "flex";
}

popupClose?.addEventListener("click", () => {
  closePopup();
});

popupOverlay?.addEventListener("click", (e) => {
  if (e.target === popupOverlay) {
    closePopup();
  }
});

// ================================================
// CHARACTER COUNTERS
// ================================================
nameInput?.addEventListener("input", () => {
  if (nameCounter) {
    nameCounter.textContent = nameInput.value.length;
  }
});

messageInput?.addEventListener("input", () => {
  if (messageCounter) {
    messageCounter.textContent = messageInput.value.length;
  }
});

// ================================================
// FORM VALIDATION & SUBMISSION
// ================================================
function showError(message) {
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add("show");
    setTimeout(() => {
      errorDiv.classList.remove("show");
    }, 5000);
  }
}

function clearError() {
  if (errorDiv) {
    errorDiv.classList.remove("show");
  }
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  // Validation
  if (!name) {
    showError("❌ Vui lòng nhập tên!");
    return;
  }

  if (name.length > 15) {
    showError("❌ Tên không được quá 15 ký tự!");
    return;
  }

  if (!message) {
    showError("❌ Vui lòng nhập lời nhắn!");
    return;
  }

  if (message.length > 200) {
    showError("❌ Lời nhắn không được quá 200 ký tự!");
    return;
  }

  // Bad words check
  if (containsBadWords(name) || containsBadWords(message)) {
    showError("❌ Tin nhắn chứa từ ngữ không phù hợp!");
    return;
  }

  // Cooldown check
  if (!canPost()) {
    const remainingSeconds = getRemainingCooldown();
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    showError(
      `⏰ Bạn chỉ có thể gửi 1 tin nhắn mỗi 5 phút. Vui lòng đợi ${minutes}:${seconds.toString().padStart(2, "0")}.`,
    );
    return;
  }

  // Send to Firebase
  try {
    const avatarId = Math.floor(Math.random() * 20) + 1; // Random 1-20
    const newMessage = {
      sender_name: name,
      content: message,
      avatar_id: avatarId,
      timestamp: serverTimestamp(),
      reactions: {
        heart: 0,
        haha: 0,
        sad: 0,
        fire: 0,
      },
    };

    await push(guestbookRef, newMessage);

    // Update cooldown
    localStorage.setItem("last_guest_post_time", Date.now().toString());

    // Clear form
    nameInput.value = "";
    messageInput.value = "";
    if (nameCounter) nameCounter.textContent = "0";
    if (messageCounter) messageCounter.textContent = "0";

    // Close popup
    popupOverlay?.classList.remove("active");
    if (floatingBtn) floatingBtn.style.display = "flex";

    // Success feedback
    showError("✅ Lưu bút của bạn đã được gửi thành công!");
    errorDiv.style.background = "rgba(34, 197, 94, 0.9)";
    setTimeout(() => {
      errorDiv.style.background = "rgba(220, 38, 38, 0.9)";
      clearError();
    }, 3000);
  } catch (error) {
    console.error("Error sending message:", error);
    showError("❌ Có lỗi xảy ra. Vui lòng thử lại!");
  }
});

// ================================================
// RENDER MESSAGE CARD
// ================================================
function renderMessage(messageId, data) {
  const card = document.createElement("div");
  card.className = `pixel-note ${getRandomColor()}`;
  card.style.transform = getRandomRotation();
  card.dataset.messageId = messageId;

  const avatarPath = `assets/images/avatars/avatar-${data.avatar_id}.webp`;

  // Random pin styling
  const pinColor = getRandomPinColor();
  const pinPosition = getRandomPinPosition();

  // Sort reactions by count (Highest first)
  const reactions = data.reactions || {};
  const sortedReactions = Object.entries(reactions)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);

  // Reaction Icons Map
  const reactionIcons = {
    heart: "❤️",
    haha: "😂",
    sad: "😢",
    fire: "🔥",
  };

  // Build Reaction List HTML (Facebook-style stacked icons)
  let reactionsHtml = "";
  if (sortedReactions.length > 0) {
    // Calculate total count
    const totalCount = sortedReactions.reduce(
      (sum, [, count]) => sum + count,
      0,
    );

    reactionsHtml = `<div class="reactions-list">`;

    // Total count (FIRST)
    reactionsHtml += `<span class="reaction-total-count">${totalCount}</span>`;

    // Stacked icons (show up to 3 different types) (SECOND)
    reactionsHtml += `<div class="reaction-icons-stack">`;
    sortedReactions.slice(0, 3).forEach(([type]) => {
      const icon = reactionIcons[type];
      reactionsHtml += `<div class="reaction-icon-stacked">${icon}</div>`;
    });
    reactionsHtml += `</div>`;

    reactionsHtml += `</div>`;
  }

  card.innerHTML = `
    <div class="note-pin ${pinColor}" style="left: ${pinPosition}"></div>
    <div class="note-header">
      <img
        src="${avatarPath}" 
        alt="Avatar" 
        class="note-avatar"
        onerror="this.src='assets/images/avatars/avatar-1.webp'"
      />
      <div class="note-name">${escapeHTML(data.sender_name)}</div>
    </div>
    <div class="note-message">${escapeHTML(data.content)}</div>
    <div class="note-footer">
      <div class="note-timestamp" data-timestamp="${data.timestamp}">${formatTimestamp(data.timestamp)}</div>
      
      <div class="reaction-container">
        <!-- Existing Reactions List (FIRST) -->
        ${reactionsHtml}
        
        <!-- Trigger Button with Picker (SECOND) -->
        <div class="reaction-trigger-btn" onclick="handleReaction('${messageId}', 'heart')">
          <span class="heart-icon">❤️</span>
          <!-- Popup Picker (nested inside trigger) -->
          <div class="reaction-picker" onclick="event.stopPropagation()">
            <span class="reaction-option" onclick="handleReaction('${messageId}', 'heart')">❤️</span>
            <span class="reaction-option" onclick="handleReaction('${messageId}', 'haha')">😂</span>
            <span class="reaction-option" onclick="handleReaction('${messageId}', 'sad')">😢</span>
            <span class="reaction-option" onclick="handleReaction('${messageId}', 'fire')">🔥</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Prepend to grid (newest first)
  if (gridContainer) {
    gridContainer.insertBefore(card, gridContainer.firstChild);
  }
}

// ================================================
// REACTION LOGIC (MULTI-TYPE)
// ================================================
window.handleReaction = function (messageId, type) {
  const storageKey = `reaction_${messageId}`;
  const currentReaction = localStorage.getItem(storageKey);

  const messageRef = ref(db, `guestbook/${messageId}`);

  runTransaction(messageRef, (post) => {
    if (post) {
      if (!post.reactions) post.reactions = {};

      if (currentReaction === type) {
        // User clicked same reaction -> REMOVE
        post.reactions[type] = (post.reactions[type] || 0) - 1;
        if (post.reactions[type] < 0) post.reactions[type] = 0;
        localStorage.removeItem(storageKey);
      } else {
        // User clicked different reaction -> SWAP (Remove old, Add new)
        if (currentReaction) {
          post.reactions[currentReaction] =
            (post.reactions[currentReaction] || 0) - 1;
          if (post.reactions[currentReaction] < 0)
            post.reactions[currentReaction] = 0;
        }
        // Add new
        post.reactions[type] = (post.reactions[type] || 0) + 1;
        localStorage.setItem(storageKey, type);
      }
    }
    return post;
  })
    .then(() => {
      // Transaction success
    })
    .catch((err) => console.error("Reaction transaction failed", err));
};

// ================================================
// REAL-TIME LISTENER
// ================================================
// Listen for new messages (newest first, limit to last 50)
const messagesQuery = query(
  guestbookRef,
  orderByChild("timestamp"),
  limitToLast(50),
);

// Track loaded messages to avoid duplicates
const loadedMessages = new Set();

// 1. ADD: Handle new messages
onChildAdded(messagesQuery, (snapshot) => {
  const messageId = snapshot.key;
  const data = snapshot.val();

  // Avoid rendering duplicates
  if (loadedMessages.has(messageId)) return;
  loadedMessages.add(messageId);

  renderMessage(messageId, data);
});

// 2. UPDATE: Handle changes (reactions)
onChildChanged(messagesQuery, (snapshot) => {
  const messageId = snapshot.key;
  const data = snapshot.val();
  const card = document.querySelector(
    `.pixel-note[data-message-id="${messageId}"]`,
  );

  if (card) {
    // Re-calculate sorted reactions
    const reactions = data.reactions || {};
    const sortedReactions = Object.entries(reactions)
      .sort(([, a], [, b]) => b - a)
      .filter(([, count]) => count > 0);

    const reactionIcons = { heart: "❤️", haha: "😂", sad: "😢", fire: "🔥" };
    let reactionsHtml = "";

    if (sortedReactions.length > 0) {
      // Calculate total count
      const totalCount = sortedReactions.reduce(
        (sum, [, count]) => sum + count,
        0,
      );

      reactionsHtml = `<div class="reactions-list">`;

      // Total count (FIRST)
      reactionsHtml += `<span class="reaction-total-count">${totalCount}</span>`;

      // Stacked icons (show up to 3 different types) (SECOND)
      reactionsHtml += `<div class="reaction-icons-stack">`;
      sortedReactions.slice(0, 3).forEach(([type]) => {
        const icon = reactionIcons[type];
        reactionsHtml += `<div class="reaction-icon-stacked">${icon}</div>`;
      });
      reactionsHtml += `</div>`;

      reactionsHtml += `</div>`;
    }

    // Update just the footer reaction container
    const container = card.querySelector(".reaction-container");
    if (container) {
      container.innerHTML = `
            ${reactionsHtml}
            <div class="reaction-trigger-btn" onclick="handleReaction('${messageId}', 'heart')">
              <span class="heart-icon">❤️</span>
              <div class="reaction-picker" onclick="event.stopPropagation()">
                <span class="reaction-option" onclick="handleReaction('${messageId}', 'heart')">❤️</span>
                <span class="reaction-option" onclick="handleReaction('${messageId}', 'haha')">😂</span>
                <span class="reaction-option" onclick="handleReaction('${messageId}', 'sad')">😢</span>
                <span class="reaction-option" onclick="handleReaction('${messageId}', 'fire')">🔥</span>
              </div>
            </div>
          `;
    }
  }
});

// ================================================
// INITIALIZATION
// ================================================
// console.log("📌 Guestbook Feature Initialized");
// console.log("🔥 Firebase Connected - Real-time Updates Active");
