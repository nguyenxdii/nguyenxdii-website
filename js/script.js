// 1. Xử lý Menu Mobile (Hamburger)
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("nav-active");

    // Đổi icon từ 3 gạch thành dấu X (nếu dùng FontAwesome class)
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

// 2. Xử lý Hiệu ứng Spotlight theo chuột
// Lấy phần tử cursor-glow
const glow = document.querySelector(".cursor-glow");

document.addEventListener("mousemove", (e) => {
  // Cập nhật vị trí chuột vào biến CSS
  // requestAnimationFrame để mượt hơn
  requestAnimationFrame(() => {
    glow.style.setProperty("--x", e.clientX + "px");
    glow.style.setProperty("--y", e.clientY + "px");
  });
});
