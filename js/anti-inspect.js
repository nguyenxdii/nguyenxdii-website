/**
 * anti-inspect.js
 * chặn các cách kiểm tra website phổ biến
 * lưu ý: không thể chặn 100%, chỉ là rào cản
 */

(function () {
  "use strict";

  // ========================================
  // TOAST NOTIFICATION SYSTEM
  // ========================================
  let toastTimeout = null;

  function showToast(message) {
    // xóa toast cũ nếu có
    const existingToast = document.getElementById("anti-inspect-toast");
    if (existingToast) {
      existingToast.remove();
      clearTimeout(toastTimeout);
    }

    // tạo toast mới
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

    // animation vào
    requestAnimationFrame(() => {
      toast.style.transform = "translateX(-50%) translateY(0)";
      toast.style.opacity = "1";
    });

    // tự động ẩn sau 2 giây
    toastTimeout = setTimeout(() => {
      toast.style.transform = "translateX(-50%) translateY(100px)";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // ========================================
  // TOGGLE CHO VIỆC TEST (Phím D)
  // ========================================
  let antiInspectEnabled = true;

  // ========================================
  // 1. chặn chuột phải (context menu)
  // ========================================
  document.addEventListener("contextmenu", function (e) {
    if (!antiInspectEnabled) return true;
    e.preventDefault();
    // Detect mobile để hiện text phù hợp
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    showToast(
      isMobile ? "Nhấn giữ đã bị vô hiệu hóa" : "Chuột phải đã bị vô hiệu hóa",
    );
    return false;
  });

  // ========================================
  // 2. chặn các phím tắt phổ biến
  // ========================================
  document.addEventListener("keydown", function (e) {
    // Phím D - Toggle anti-inspect debug đã bị loại bỏ theo yêu cầu

    // Nếu đã tắt anti-inspect thì không chặn gì
    if (!antiInspectEnabled) return;

    // F12 - DevTools
    if (e.key === "F12" || e.keyCode === 123) {
      e.preventDefault();
      showToast("F12 đã bị vô hiệu hóa");
      return false;
    }

    // Ctrl+Shift+I - DevTools
    if (
      e.ctrlKey &&
      e.shiftKey &&
      (e.key === "I" || e.key === "i" || e.keyCode === 73)
    ) {
      e.preventDefault();
      showToast("DevTools đã bị vô hiệu hóa");
      return false;
    }

    // Ctrl+Shift+J - Console
    if (
      e.ctrlKey &&
      e.shiftKey &&
      (e.key === "J" || e.key === "j" || e.keyCode === 74)
    ) {
      e.preventDefault();
      showToast("Console đã bị vô hiệu hóa");
      return false;
    }

    // Ctrl+Shift+C - Element picker
    if (
      e.ctrlKey &&
      e.shiftKey &&
      (e.key === "C" || e.key === "c" || e.keyCode === 67)
    ) {
      e.preventDefault();
      showToast("Element picker đã bị vô hiệu hóa");
      return false;
    }

    // Ctrl+U - View source
    if (e.ctrlKey && (e.key === "U" || e.key === "u" || e.keyCode === 85)) {
      e.preventDefault();
      showToast("View source đã bị vô hiệu hóa");
      return false;
    }

    // Ctrl+S - Save page
    if (e.ctrlKey && (e.key === "S" || e.key === "s" || e.keyCode === 83)) {
      e.preventDefault();
      showToast("Lưu trang đã bị vô hiệu hóa");
      return false;
    }

    // Ctrl+P - Print
    if (e.ctrlKey && (e.key === "P" || e.key === "p" || e.keyCode === 80)) {
      e.preventDefault();
      showToast("In trang đã bị vô hiệu hóa");
      return false;
    }
  });

  // ========================================
  // 3. chặn kéo thả (drag) hình ảnh và link
  // ========================================
  document.addEventListener("dragstart", function (e) {
    e.preventDefault();
    return false;
  });

  // ========================================
  // 4. chặn chọn text (select) - KHÔNG hiện toast
  // ========================================
  document.addEventListener("selectstart", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return true;
    }
    e.preventDefault();
    return false;
  });

  // ========================================
  // 5. chặn copy (Ctrl+C) - KHÔNG hiện toast vì đã chặn ở keydown
  // ========================================
  document.addEventListener("copy", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return true;
    }
    e.preventDefault();
    return false;
  });

  // ========================================
  // 6. chặn cut (Ctrl+X)
  // ========================================
  document.addEventListener("cut", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return true;
    }
    e.preventDefault();
    return false;
  });

  // ========================================
  // 7. phát hiện DevTools mở (TẮT vì gây lỗi khi zoom)
  // ========================================
  // Lưu ý: Phương pháp kiểm tra kích thước cửa sổ bị tắt vì:
  // - Zoom browser sẽ thay đổi innerWidth/innerHeight
  // - Gây hiểu nhầm là DevTools đang mở
  // Các phím tắt và chuột phải vẫn được chặn ở trên

  // ========================================
  // 8. chống iframe embedding
  // ========================================
  if (window.top !== window.self) {
    window.top.location = window.self.location;
  }

  // ========================================
  // 9. css bổ sung để chặn select và drag
  // ========================================
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

  // ========================================
  // 10. log cảnh báo trong console
  // ========================================
  console.log("%cCẢNH BÁO!", "color: red; font-size: 50px; font-weight: bold;");
  console.log("%cĐây là tính năng dành cho developer.", "font-size: 18px;");
  console.log(
    "%cNếu ai đó yêu cầu bạn paste code ở đây, đó có thể là lừa đảo!",
    "font-size: 18px; color: red;",
  );
})();
