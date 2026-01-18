/**
 * anti-inspect.js
 * chặn các cách kiểm tra website phổ biến
 * lưu ý: không thể chặn 100%, chỉ là rào cản
 */

(function () {
  "use strict";

  let toastTimeout = null;

  function showToast(message) {
    const existingToast = document.getElementById("anti-inspect-toast");
    if (existingToast) {
      existingToast.remove();
      clearTimeout(toastTimeout);
    }

    const toast = document.createElement("div");
    toast.id = "anti-inspect-toast";
    toast.innerHTML = `<span style="margin-right: 8px;">🚫</span>${message}`;
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(50, 50, 50, 0.95));
      color: #fff;
      padding: 12px 24px;
      border-radius: 12px;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 999999;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = "translateX(-50%) translateY(0)";
      toast.style.opacity = "1";
    });

    toastTimeout = setTimeout(() => {
      toast.style.transform = "translateX(-50%) translateY(100px)";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  let antiInspectEnabled = true;

  // Block right-click
  document.addEventListener("contextmenu", function (e) {
    if (!antiInspectEnabled) return true;
    e.preventDefault();
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    showToast(
      isMobile ? "Nhấn giữ đã bị vô hiệu hóa" : "Chuột phải đã bị vô hiệu hóa",
    );
    return false;
  });

  // Block keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (!antiInspectEnabled) return;

    // F12
    if (e.key === "F12" || e.keyCode === 123) {
      e.preventDefault();
      showToast("F12 đã bị vô hiệu hóa");
      return false;
    }

    // Ctrl+Shift+I
    if (
      e.ctrlKey &&
      e.shiftKey &&
      (e.key === "I" || e.key === "i" || e.keyCode === 73)
    ) {
      e.preventDefault();
      showToast("DevTools đã bị vô hiệu hóa");
      return false;
    }

    // Ctrl+Shift+J
    if (
      e.ctrlKey &&
      e.shiftKey &&
      (e.key === "J" || e.key === "j" || e.keyCode === 74)
    ) {
      e.preventDefault();
      showToast("Console đã bị vô hiệu hóa");
      return false;
    }

    // Ctrl+Shift+C
    if (
      e.ctrlKey &&
      e.shiftKey &&
      (e.key === "C" || e.key === "c" || e.keyCode === 67)
    ) {
      e.preventDefault();
      showToast("Element picker đã bị vô hiệu hóa");
      return false;
    }

    // Ctrl+U
    if (e.ctrlKey && (e.key === "U" || e.key === "u" || e.keyCode === 85)) {
      e.preventDefault();
      showToast("View source đã bị vô hiệu hóa");
      return false;
    }

    // Ctrl+S
    if (e.ctrlKey && (e.key === "S" || e.key === "s" || e.keyCode === 83)) {
      e.preventDefault();
      showToast("Lưu trang đã bị vô hiệu hóa");
      return false;
    }

    // Ctrl+P
    if (e.ctrlKey && (e.key === "P" || e.key === "p" || e.keyCode === 80)) {
      e.preventDefault();
      showToast("In trang đã bị vô hiệu hóa");
      return false;
    }
  });

  // Block drag
  document.addEventListener("dragstart", function (e) {
    e.preventDefault();
    return false;
  });

  // Block text selection
  document.addEventListener("selectstart", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return true;
    }
    e.preventDefault();
    return false;
  });

  // Block copy
  document.addEventListener("copy", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return true;
    }
    e.preventDefault();
    return false;
  });

  // Block cut
  document.addEventListener("cut", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return true;
    }
    e.preventDefault();
    return false;
  });

  // Prevent iframe embedding
  if (window.top !== window.self) {
    window.top.location = window.self.location;
  }

  // CSS to block selection & drag
  const style = document.createElement("style");
  style.textContent = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-user-drag: none !important;
      user-drag: none !important;
      -webkit-touch-callout: none !important;
    }
    
    input, textarea {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
    
    img {
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);

  // Console messages
  console.log(
    "%cHi! :)",
    "font-size: 16px; color: #a855f7; font-weight: bold; font-family: 'Courier New', monospace;",
  );
  console.log(
    "%cFeel free to explore my code, but please ask before copying! 😊",
    "font-size: 13px; color: #ccc; font-family: 'Courier New', monospace;",
  );
  console.log("\n");
  console.log(
    "%c My code is available on GitHub:",
    "font-size: 13px; color: #60a5fa; font-weight: bold; font-family: 'Courier New', monospace;",
  );
  console.log(
    "%c   https://github.com/nguyenxdii/nguyenxdii-website",
    "font-size: 13px; color: #60a5fa; font-family: 'Courier New', monospace;",
  );

  console.log("\n\n\n");

  console.log(
    "%c Hế lô! :)",
    "font-size: 16px; color: #a855f7; font-weight: bold; font-family: 'Courier New', monospace;",
  );
  console.log(
    "%c Thoải mái xem code nhé, nhưng nhớ hỏi trước khi copy nha! 😊",
    "font-size: 13px; color: #ccc; font-family: 'Courier New', monospace;",
  );
  console.log("\n");
  console.log(
    "%c Mã nguồn có sẵn trên GitHub:",
    "font-size: 13px; color: #60a5fa; font-weight: bold; font-family: 'Courier New', monospace;",
  );
  console.log(
    "%c   https://github.com/nguyenxdii/nguyenxdii-website",
    "font-size: 13px; color: #60a5fa; font-family: 'Courier New', monospace;",
  );
})();
