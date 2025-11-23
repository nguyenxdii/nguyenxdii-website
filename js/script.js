/* js/script.js */

// =========================================================
// HÀM KHỞI TẠO CÁC SỰ KIỆN SAU KHI HTML LOAD XONG
// =========================================================
const initEvents = () => {
  // 1. XỬ LÝ MENU MOBILE (HAMBURGER)
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("nav-active");

      // Đổi icon hamburger
      const icon = hamburger.querySelector("i");
      if (icon.classList.contains("fa-bars")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });
  }

  // 2. XỬ LÝ DARK/LIGHT MODE
  const themeToggleBtn = document.getElementById("theme-toggle");
  const body = document.body;

  // Hàm cập nhật icon
  const updateThemeIcon = (isLight) => {
    if (!themeToggleBtn) return;
    if (isLight) {
      themeToggleBtn.classList.remove("fa-sun");
      themeToggleBtn.classList.add("fa-moon");
    } else {
      themeToggleBtn.classList.remove("fa-moon");
      themeToggleBtn.classList.add("fa-sun");
    }
  };

  // Kiểm tra bộ nhớ ngay lập tức
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "light") {
    body.classList.add("light-mode");
    updateThemeIcon(true);
  } else {
    updateThemeIcon(false);
  }

  // Gắn sự kiện click
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      body.classList.toggle("light-mode");
      const isLightMode = body.classList.contains("light-mode");
      updateThemeIcon(isLightMode);
      localStorage.setItem("theme", isLightMode ? "light" : "dark");
    });
  }
};

// 3. HIỆU ỨNG SPOTLIGHT THEO CHUỘT (Chạy độc lập)
const glow = document.querySelector(".cursor-glow");
if (glow) {
  document.addEventListener("mousemove", (e) => {
    requestAnimationFrame(() => {
      glow.style.setProperty("--x", e.clientX + "px");
      glow.style.setProperty("--y", e.clientY + "px");
    });
  });
}

// =========================================================
// QUAN TRỌNG: Đợi DOM load xong mới chạy hàm initEvents
// Để đảm bảo Navbar.js đã chạy xong và có phần tử để bắt sự kiện
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  // Delay nhẹ 1 xíu để chắc chắn Navbar đã render (vì navbar.js chạy đồng bộ nhưng an toàn hơn)
  setTimeout(initEvents, 50);
});
