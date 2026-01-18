// Import Firebase SDKs từ CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  onDisconnect,
  increment,
  push,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Cấu hình Firebase
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

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Các references trong Database
const onlineRef = ref(db, "status/online");
const visitsRef = ref(db, "status/visits");
const myConnectionRef = push(onlineRef);

// 1. Xử lý đếm người đang Online
// Khi kết nối thành công:
// - Thêm 1 node mới vào status/online (đại diện cho người này)
// - Đặt chế độ: Nếu mất kết nối (tắt tab/rớt mạng) -> tự động xóa node này
set(myConnectionRef, {
  timestamp: serverTimestamp(),
  userAgent: navigator.userAgent,
}).then(() => {
  onDisconnect(myConnectionRef).remove();
});

// Lắng nghe thay đổi số lượng người online
onValue(onlineRef, (snapshot) => {
  // Đếm số lượng keys trong status/online
  const count = snapshot.size;
  updateUI("online-count", count);
});

// 2. Xử lý đếm tổng lượt truy cập (Visits)
// Logic: Chỉ tăng đếm khi là một session mới (để F5 không bị tính nhiều lần)
const SESSION_KEY = "has_visited_session_" + new Date().toDateString();

if (!sessionStorage.getItem(SESSION_KEY)) {
  // Nếu chưa có session key -> Tăng visits lên 1
  // Dùng transaction increment để đảm bảo chính xác khi nhiều người vào cùng lúc
  set(visitsRef, increment(1));

  // Đánh dấu đã visit trong session này
  sessionStorage.setItem(SESSION_KEY, "true");
}

// Lắng nghe thay đổi tổng lượt visits để cập nhật UI
onValue(visitsRef, (snapshot) => {
  const visits = snapshot.val() || 0;
  updateUI("visit-count", visits);
});

// Helper: Cập nhật UI
function updateUI(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    // Animation nhảy số nhẹ nhàng
    animateValue(
      element,
      parseInt(element.innerText.replace(/[^0-9]/g, "") || "0"),
      value,
      500,
    );
  }
}

function animateValue(obj, start, end, duration) {
  if (start === end) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(
      progress * (end - start) + start,
    ).toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end.toLocaleString(); // Đảm bảo số cuối cùng chính xác
    }
  };
  window.requestAnimationFrame(step);
}

console.log("🔥 Firebase Visitor Counter Initialized");
