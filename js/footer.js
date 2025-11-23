/* js/footer.js */

const footerHTML = `
<footer>
  <div class="footer-container">
    <div class="footer-col">
      <a href="index.html" class="footer-logo">Dii.EXE</a>
      <p class="footer-desc">
        Website cá nhân chia sẻ về lập trình, dự án và đam mê.<br />
        "It might not run after I finish coding, but if it runs… I'm not
        touching it again."
      </p>
      <div class="footer-socials">
        <a href="https://fb.com/dii.exe411" target="_blank"><i class="fa-brands fa-facebook"></i></a>
        <a href="https://github.com/nguyenxdii" target="_blank"><i class="fa-brands fa-github"></i></a>
        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@dii.exe" target="_blank"><i class="fa-solid fa-envelope"></i></a>
      </div>
    </div>

    <div class="footer-col">
      <h4>Khám Phá</h4>
      <ul>
        <li><a href="index.html">Trang chủ</a></li>
        <li><a href="projects.html">Dự án của tôi</a></li>
        <li><a href="contact.html">Liên hệ</a></li>
        <li><a href="#">Blog cá nhân</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Chuyên Môn</h4>
      <ul>
        <li><a href="#">Lập trình Web</a></li>
        <li><a href="#">Ứng dụng Windows</a></li>
        <li><a href="#">UI/UX Design</a></li>
        <li><a href="#">Database Design</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Liên Hệ</h4>
      <ul class="contact-info">
        <li><i class="fa-solid fa-location-dot"></i> TP. Hồ Chí Minh, Việt Nam</li>
        <li><i class="fa-solid fa-phone"></i> +84 348 345 248</li>
        <li><i class="fa-solid fa-envelope"></i> contact@nguyexndii.id.vn</li>
      </ul>
    </div>
  </div>

  <div class="footer-bottom">
    <p>&copy; 2025 Dii Nguyen. If the site runs, consider it a miracle.</p>
  </div>
</footer>
`;

// Tìm thẻ có id="footer-placeholder" và chèn nội dung vào
const footerPlaceholder = document.getElementById("footer-placeholder");
if (footerPlaceholder) {
  footerPlaceholder.innerHTML = footerHTML;
}
