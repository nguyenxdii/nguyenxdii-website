const navbarHTML = `
<nav>
  <a href="index.html" class="logo">Dii.EXE</a>
  <div class="hamburger"><i class="fa-solid fa-bars"></i></div>
  <ul class="nav-links">
    <li><a href="index.html">Trang chủ</a></li>
    <li><a href="projects.html">Dự án</a></li>
    <li><a href="contact.html">Liên hệ</a></li>
    
    <li class="theme-switch-wrapper">
      <i class="fa-solid fa-sun" id="theme-toggle"></i>
    </li>
  </ul>
</nav>
`;

// 1. Chèn Navbar vào placeholder
const navPlaceholder = document.getElementById("nav-placeholder");
if (navPlaceholder) {
  navPlaceholder.innerHTML = navbarHTML;
}

// 2. Tự động Active menu theo trang hiện tại
const currentPage = window.location.pathname.split("/").pop() || "index.html";
const navLinksEl = document.querySelectorAll(".nav-links a");

navLinksEl.forEach((link) => {
  // Lấy tên file từ href (ví dụ: 'projects.html')
  const href = link.getAttribute("href");

  // So sánh tương đối (xử lý trường hợp URL có thể chứa đường dẫn folder)
  if (href === currentPage) {
    link.classList.add("active");
  }
});
