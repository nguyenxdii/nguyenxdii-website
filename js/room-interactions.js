// Phòng ảo tương tác - JavaScript

document.addEventListener("DOMContentLoaded", () => {
  initTimeBasedMode(); // Tự động set sáng/tối theo giờ thực
  initRealtimeWeather(); // Sync thời tiết thật (Sài Gòn)
  initRealtimeClock(); // Đồng hồ real-time
  initPolygonHotspots();
  initModals();
  initMusicPlayer();
  initKeyboardNavigation();
  initRainDebug(); // Debug: Alt + D toggle rain
  updateRoomVisuals(); // Cập nhật trạng thái hiển thị ban đầu (quan trọng để ẩn hitbox thừa)

  // Mobile Autoplay: Phát nhạc khi chạm lần đầu
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  if (isMobile) {
    const enableAudio = () => {
      toggleMusic();
      document.removeEventListener("touchstart", enableAudio);
      document.removeEventListener("click", enableAudio);
    };
    document.addEventListener("touchstart", enableAudio, { once: true });
    document.addEventListener("click", enableAudio, { once: true });
  }
});

// Biến trạng thái
let isLightMode = false;
let isMusicPlaying = false;
let isRaining = false;

// Cấu hình âm lượng
const VOLUME_NORMAL = 1.0;
const VOLUME_LOWERED = 0.3;
const VOLUME_TRANSITION_MS = 300;

// Tự động set chế độ sáng/tối theo giờ thực
// Lưu ý: DOM đã được set bởi inline scripts trong HTML để tránh flash
function initTimeBasedMode() {
  const currentHour = new Date().getHours();
  // 6:00 - 18:00 là ban ngày (sáng), còn lại là ban đêm (tối)
  const isDaytime = currentHour >= 6 && currentHour < 18;

  // Chỉ sync biến isLightMode với state hiện tại (DOM đã được set rồi)
  isLightMode = isDaytime;
}

// ------------------------------------------------
// REAL-TIME WEATHER (Open-Meteo API)
// Location: District 1, Ho Chi Minh City
// Latitude: 10.7769, Longitude: 106.7009
// ------------------------------------------------
async function initRealtimeWeather() {
  const API_URL =
    "https://api.open-meteo.com/v1/forecast?latitude=10.7769&longitude=106.7009&current=weather_code,temperature_2m&timezone=Asia%2FBangkok";

  async function fetchWeather() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data && data.current) {
        const code = data.current.weather_code;
        const temp = Math.round(data.current.temperature_2m);

        // WMO Weather Codes mapping
        let startIcon = "☀️";
        let description = "Trời quang";
        let isRainy = false;

        // Map codes
        if (code === 0) {
          startIcon = "☀️";
          description = "Trời quang";
        } else if (code >= 1 && code <= 3) {
          startIcon = "⛅";
          description = "Có mây";
        } else if (code === 45 || code === 48) {
          startIcon = "🌫️";
          description = "Sương mù";
        } else if (code >= 51 && code <= 55) {
          startIcon = "🌧️";
          description = "Mưa phùn";
          isRainy = true;
        } else if (code >= 61 && code <= 65) {
          startIcon = "🌧️";
          description = "Mưa rào";
          isRainy = true;
        } else if ((code >= 80 && code <= 82) || (code >= 66 && code <= 67)) {
          startIcon = "⛈️";
          description = "Mưa lớn";
          isRainy = true;
        } else if (code >= 95 && code <= 99) {
          startIcon = "⛈️";
          description = "Dông bão";
          isRainy = true;
        }

        // Update Text Display
        const weatherStatus = document.getElementById("weather-status");
        if (weatherStatus) {
          weatherStatus.textContent = `${temp}°C ${startIcon} ${description}`;
        }

        // Sync Rain State
        if (isRaining !== isRainy) {
          isRaining = isRainy;
          updateRoomVisuals();

          if (isRaining) {
            showToast(`Sài Gòn đang mưa (${temp}°C)...`);
          }
        }

        // console.log(`Weather: ${temp}°C, ${description} (Code: ${code})`);
      }
    } catch (error) {
      console.error("Failed to fetch weather:", error);
      const weatherStatus = document.getElementById("weather-status");
      if (weatherStatus) weatherStatus.textContent = "N/A";
    }
  }

  // Fetch immediately on load
  fetchWeather();

  // Fetch every 10 minutes (600,000 ms)
  setInterval(fetchWeather, 600000);
}

// Đồng hồ real-time
function initRealtimeClock() {
  const clockElement = document.getElementById("clock-time");
  if (!clockElement) return;

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }

  // Cập nhật ngay lập tức
  updateClock();
  // Cập nhật mỗi giây
  setInterval(updateClock, 1000);
}

// Khởi tạo các vùng tương tác polygon
function initPolygonHotspots() {
  // Lấy tất cả polygon hotspot từ SVG overlay
  const polygons = document.querySelectorAll(".hotspot-polygon");

  polygons.forEach((polygon) => {
    polygon.addEventListener("click", (e) => {
      e.stopPropagation();

      // Kiểm tra action (đèn, nhạc, mèo)
      const action = polygon.dataset.action;
      if (action) {
        handleAction(action);
        return;
      }

      // Kiểm tra modal
      const modalId = polygon.dataset.modal;
      if (modalId) {
        openModal(modalId);
      }
    });
  });
}

function handleAction(action) {
  switch (action) {
    case "lamp":
      toggleLamp();
      break;
    case "music":
      toggleMusic();
      break;
    case "cat":
      playCatMeow();
      break;
  }
}

// Cập nhật giao diện phòng (Background, Rain, Hotspot)
function updateRoomVisuals() {
  const bgDark = document.getElementById("bg-dark");
  const bgLight = document.getElementById("bg-light");
  const bgDarkRain = document.getElementById("bg-dark-rain");
  const bgLightRain = document.getElementById("bg-light-rain");

  const hotspotDark = document.getElementById("hotspot-dark");
  const hotspotLight = document.getElementById("hotspot-light");
  const roomContainer = document.getElementById("room-container");

  const rainCanvas = document.getElementById("rain-canvas");
  const windowLight = document.querySelector(".window-light");

  // 1. Xử lý Hotspots & Room Mode (Light/Dark)
  if (isLightMode) {
    // Chế độ sáng
    roomContainer?.classList.remove("dark-mode");
    roomContainer?.classList.add("light-mode");
    hotspotDark?.classList.remove("active");
    hotspotLight?.classList.add("active");

    // Nếu mưa thì tắt nắng
    if (windowLight) windowLight.style.opacity = isRaining ? "0" : "";
  } else {
    // Chế độ tối
    roomContainer?.classList.remove("light-mode");
    roomContainer?.classList.add("dark-mode");
    hotspotLight?.classList.remove("active");
    hotspotDark?.classList.add("active");
  }

  // 2. Xử lý Backgrounds & Rain
  // Reset active classes
  bgDark?.classList.remove("active");
  bgLight?.classList.remove("active");
  bgDarkRain?.classList.remove("active");
  bgLightRain?.classList.remove("active");

  if (isRaining) {
    // Đang mưa
    rainCanvas?.classList.add("active");
    // Start canvas animation
    if (typeof initRainEffect === "function") initRainEffect();
    if (typeof startRain === "function") startRain();

    if (isLightMode) {
      bgLightRain?.classList.add("active");
    } else {
      bgDarkRain?.classList.add("active");
    }
  } else {
    // Không mưa
    rainCanvas?.classList.remove("active");
    // Stop canvas animation
    if (typeof stopRain === "function") stopRain();

    if (isLightMode) {
      bgLight?.classList.add("active");
    } else {
      bgDark?.classList.add("active");
    }
  }

  // 3. Xử lý Mèo (Refined Logic)
  // Chỉ hiện mèo trên mái nhà (cat-rain) khi TRỜI TỐI và CÓ MƯA.
  const catNormal = document.querySelectorAll(".cat-normal");
  const catRain = document.querySelectorAll(".cat-rain");

  // Logic: Show Roof Cat ONLY if Night + Rain
  const showRoofCat = !isLightMode && isRaining;

  // console.log(
  //   `[Cat Logic] Light: ${isLightMode}, Rain: ${isRaining} => Show Roof: ${showRoofCat}`,
  // );
  // console.log(
  //   `[Cat Logic] Normal Nodes: ${catNormal.length}, Rain Nodes: ${catRain.length}`,
  // );

  if (showRoofCat) {
    // Hide Inside Cat, Show Roof Cat
    catNormal.forEach((el) => {
      el.style.display = "none";
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none"; // GUARANTEE no clicks
    });
    catRain.forEach((el) => {
      el.style.display = "block";
      el.style.visibility = "visible";
      el.style.pointerEvents = "auto";
    });
  } else {
    // Show Inside Cat, Hide Roof Cat
    catNormal.forEach((el) => {
      el.style.display = "block";
      el.style.visibility = "visible";
      el.style.pointerEvents = "auto";
    });
    catRain.forEach((el) => {
      el.style.display = "none";
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none"; // GUARANTEE no clicks
    });
  }
}

// Bật/tắt đèn (chuyển đổi giữa ảnh sáng/tối)
function toggleLamp() {
  // Sound effect
  const switchSound = document.getElementById("light-switch");
  if (switchSound) {
    switchSound.currentTime = 0;
    switchSound.play().catch((e) => console.log(e));
  }

  isLightMode = !isLightMode;
  updateRoomVisuals();

  showToast(isLightMode ? "💡 Đèn bật!" : "🌙 Đèn tắt!");
}

// Debug: Alt + D toggle rain
function initRainDebug() {
  document.addEventListener("keydown", (e) => {
    if (e.altKey && (e.key === "d" || e.key === "D")) {
      e.preventDefault();
      toggleRain();
    }
  });
}

function toggleRain() {
  isRaining = !isRaining;
  updateRoomVisuals();
  showToast(isRaining ? "🌧️ Trời đang mưa..." : "🌤️ Trời đã tạnh!");
}

// Phát âm thanh mèo kêu
function playCatMeow() {
  const catAudio = document.getElementById("cat-meow");
  if (catAudio) {
    catAudio.currentTime = 0;
    catAudio.play().catch((err) => {
      console.log("Lỗi phát âm thanh mèo:", err);
    });
    showToast("🐱 Meow~");
  }
}

// Khởi tạo trình phát nhạc
function initMusicPlayer() {
  const mobileMusic = document.querySelector(
    '.mobile-nav-item[data-action="music"]',
  );
  const mobileLamp = document.querySelector(
    '.mobile-nav-item[data-action="lamp"]',
  );

  mobileMusic?.addEventListener("click", toggleMusic);
  mobileLamp?.addEventListener("click", toggleLamp);

  // Chống extension thay đổi tốc độ phát nhạc
  const bgMusic = document.getElementById("bg-music");
  if (bgMusic) {
    bgMusic.addEventListener("ratechange", () => {
      if (bgMusic.playbackRate !== 1.0) {
        bgMusic.playbackRate = 1.0;
      }
    });
  }
}

// Bật/tắt nhạc nền
function toggleMusic() {
  const bgMusic = document.getElementById("bg-music");
  const musicIndicator = document.querySelector(".music-indicator");

  if (!bgMusic) return;

  if (isMusicPlaying) {
    bgMusic.pause();
    isMusicPlaying = false;
    musicIndicator?.classList.add("paused");
    setTimeout(() => {
      if (!isMusicPlaying) musicIndicator?.classList.remove("visible");
    }, 2000);
    showToast("⏸️ Nhạc tạm dừng");
  } else {
    bgMusic
      .play()
      .then(() => {
        isMusicPlaying = true;
        musicIndicator?.classList.add("visible");
        musicIndicator?.classList.remove("paused");
        showToast("🎵 Đang phát nhạc...");
      })
      .catch((err) => {
        console.log("Lỗi phát nhạc:", err);
        showToast("Click lần nữa để phát nhạc");
      });
  }
}

// Khởi tạo hệ thống modal
function initModals() {
  const overlay = document.querySelector(".modal-overlay");
  const closeButtons = document.querySelectorAll(".modal-close");

  // Đóng modal khi click vào overlay (trừ modal-game)
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) {
      // Kiểm tra xem modal game có đang mở không
      const gameModal = document.getElementById("modal-projects");
      if (gameModal && gameModal.style.display === "block") {
        // Không đóng modal game khi click bên ngoài - phải dùng nút power
        return;
      }
      closeAllModals();
    }
  });

  // Nút đóng modal
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", closeAllModals);
  });

  // Menu mobile
  const mobileNavItems = document.querySelectorAll(
    ".mobile-nav-item[data-modal]",
  );
  mobileNavItems.forEach((item) => {
    item.addEventListener("click", () => {
      const modalId = item.dataset.modal;
      openModal(modalId);
    });
  });
}

// Chuyển đổi giữa các Apps trong Monitor (Menu, Games, About)
function openMonitorApp(appName) {
  // Play sound
  if (typeof gameSounds !== "undefined") {
    gameSounds.playClick();
  }

  // Stop any running games when switching apps/menus
  if (typeof destroyTetrisGame === "function") destroyTetrisGame();
  if (typeof destroyGame2048 === "function") destroyGame2048();

  const mainMenu = document.getElementById("game-menu");
  const gamesSubmenu = document.getElementById("games-submenu");
  const aboutApp = document.getElementById("app-about");

  // Hide all first
  if (mainMenu) mainMenu.style.display = "none";
  if (gamesSubmenu) gamesSubmenu.style.display = "none";
  if (aboutApp) aboutApp.style.display = "none";

  // Reset Game Display
  const gameDisplay = document.getElementById("game-display-area");
  if (gameDisplay) gameDisplay.style.display = "none";

  switch (appName) {
    case "menu":
      if (mainMenu) mainMenu.style.display = "flex";
      break;
    case "games":
      if (gamesSubmenu) gamesSubmenu.style.display = "flex";
      break;
    case "about":
      if (aboutApp) aboutApp.style.display = "flex";
      break;
  }
}

window.openMonitorApp = openMonitorApp; // Expose globally

// Mở modal theo ID
function openModal(modalId) {
  const overlay = document.querySelector(".modal-overlay");
  const modals = document.querySelectorAll(".modal");
  const targetModal = document.getElementById(modalId);

  if (!targetModal || !overlay) return;

  // Ẩn tất cả modal trước
  modals.forEach((modal) => (modal.style.display = "none"));

  // Đóng popup ghi chú nếu đang mở
  const writePopup = document.getElementById("write-popup-overlay");
  if (writePopup) {
    writePopup.classList.remove("active");
  }

  // Hiển thị modal được chọn
  if (modalId === "modal-guestbook") {
    targetModal.style.display = "flex";
    // Show floating write button only for guestbook
    const floatingBtn = document.getElementById("floating-write-btn");
    if (floatingBtn) floatingBtn.style.display = "flex";
  } else {
    targetModal.style.display = "block";
    // Hide floating write button for other modals
    const floatingBtn = document.getElementById("floating-write-btn");
    if (floatingBtn) floatingBtn.style.display = "none";
  }

  overlay.classList.add("active");

  // Ngăn cuộn trang
  document.body.style.overflow = "hidden";

  // Giảm âm lượng nhạc khi mở modal
  lowerMusicVolume();

  // Khởi tạo game phù hợp với thiết bị
  if (modalId === "modal-projects") {
    initGameForDevice();
  }
}

// Phát hiện thiết bị mobile
function isMobileDevice() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) || window.innerWidth <= 768
  );
}

// Khởi tạo game theo thiết bị
function initGameForDevice() {
  // Luôn mở về System Menu mặc định
  if (typeof openMonitorApp === "function") {
    openMonitorApp("menu");
  }
}

// Chuyển đổi game
window.switchGame = function (gameName) {
  // Play sound
  if (typeof gameSounds !== "undefined") {
    gameSounds.playClick();
  }

  // Hide Submenu instead of Main Menu (since Main Menu is already hidden)
  const submenu = document.getElementById("games-submenu");
  const displayArea = document.getElementById("game-display-area");
  const tetrisContainer = document.getElementById("tetris-container");
  const game2048Container = document.getElementById("game2048-container");

  if (submenu) submenu.style.display = "none";
  if (displayArea) displayArea.style.display = "flex";

  // Reset containers
  if (tetrisContainer) {
    tetrisContainer.innerHTML = "";
    tetrisContainer.style.display = "none";
  }
  if (game2048Container) {
    game2048Container.innerHTML = "";
    game2048Container.style.display = "none";
  }

  // Init Game logic... (Fixed function names)
  if (gameName === "tetris") {
    tetrisContainer.style.display = "block";
    // Delay slightly to ensure display:block is applied before init
    setTimeout(() => {
      if (typeof initTetrisGame === "function") initTetrisGame();
    }, 50);
  } else if (gameName === "2048") {
    game2048Container.style.display = "block";
    setTimeout(() => {
      if (typeof initGame2048 === "function") initGame2048();
    }, 50);
  }

  window.stopCurrentGame = function () {
    if (typeof destroyTetrisGame === "function") destroyTetrisGame();
    if (typeof destroyGame2048 === "function") destroyGame2048();
  };
};

// Quay về menu
window.backToMenu = function () {
  openMonitorApp("games"); // Re-open Games folder
};

// Đóng tất cả modal
function closeAllModals() {
  const overlay = document.querySelector(".modal-overlay");
  const modals = document.querySelectorAll(".modal");
  const gameModal = document.getElementById("modal-projects");

  // Sound effect for Monitor Off
  if (gameModal && gameModal.style.display === "block") {
    const offSound = document.getElementById("pc-monitor-off");
    if (offSound) {
      offSound.currentTime = 0;
      offSound.play().catch((e) => console.log(e));
    }
  }

  modals.forEach((modal) => (modal.style.display = "none"));
  overlay?.classList.remove("active");
  document.body.style.overflow = "";

  // Đóng popup ghi chú nếu đang mở
  const writePopup = document.getElementById("write-popup-overlay");
  if (writePopup) {
    writePopup.classList.remove("active");
  }

  // Reset nhạc về âm lượng thường
  restoreMusicVolume();

  // Dừng game nếu có
  if (typeof destroyTetrisGame === "function") {
    destroyTetrisGame();
  }
  if (typeof destroyGame2048 === "function") {
    destroyGame2048();
  }
}

// Giảm âm lượng nhạc (khi mở modal)
function lowerMusicVolume() {
  const bgMusic = document.getElementById("bg-music");
  if (!bgMusic || !isMusicPlaying) return;

  smoothVolumeTransition(bgMusic, VOLUME_LOWERED);
}

// Khôi phục âm lượng nhạc (khi đóng modal)
function restoreMusicVolume() {
  const bgMusic = document.getElementById("bg-music");
  if (!bgMusic || !isMusicPlaying) return;

  smoothVolumeTransition(bgMusic, VOLUME_NORMAL);
}

// Chuyển đổi âm lượng mượt mà
function smoothVolumeTransition(audioElement, targetVolume) {
  const startVolume = audioElement.volume;
  const volumeDiff = targetVolume - startVolume;
  const steps = 20;
  const stepDuration = VOLUME_TRANSITION_MS / steps;
  let currentStep = 0;

  const interval = setInterval(() => {
    currentStep++;
    const progress = currentStep / steps;
    // Easing function for smooth transition
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    audioElement.volume = startVolume + volumeDiff * easeProgress;

    if (currentStep >= steps) {
      clearInterval(interval);
      audioElement.volume = targetVolume;
    }
  }, stepDuration);
}

// Điều hướng bằng phím tắt
function initKeyboardNavigation() {
  document.addEventListener("keydown", (e) => {
    // Không kích hoạt phím tắt khi đang nhập liệu
    const activeTag = document.activeElement.tagName;
    if (activeTag === "INPUT" || activeTag === "TEXTAREA") {
      if (e.key === "Escape") {
        closeAllModals(); // Vẫn cho phép ESC để đóng modal/focus
      }
      return;
    }

    // ESC để đóng modal
    if (e.key === "Escape") {
      closeAllModals();
    }

    // M để bật/tắt nhạc
    if (e.key === "m" || e.key === "M") {
      toggleMusic();
    }

    // L để bật/tắt đèn
    if (e.key === "l" || e.key === "L") {
      toggleLamp();
    }
  });
}

// Hiển thị thông báo toast
function showToast(message) {
  // Xóa toast cũ nếu có
  const existingToast = document.querySelector(".toast");
  existingToast?.remove();

  // Tạo toast mới
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 5rem;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: rgba(15, 15, 20, 0.95);
    color: #fff;
    padding: 0.75rem 1.5rem;
    border-radius: 100px;
    font-size: 0.875rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 2000;
    opacity: 0;
    transition: all 0.3s ease;
  `;

  document.body.appendChild(toast);

  // Hiệu ứng xuất hiện
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  // Tự động ẩn sau 2.5 giây
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Copy to Clipboard Logic
window.copyToClipboard = function (text, btnElement) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // Add 'copied' class to trigger CSS animations (Check icon shows)
      btnElement.classList.add("copied");

      // Remove 'copied' class after 2 seconds to revert to Copy icon
      setTimeout(() => {
        btnElement.classList.remove("copied");
      }, 2000);

      showToast("Đã sao chép vào bộ nhớ tạm!");
    })
    .catch((err) => {
      console.error("Copy failed:", err);
      showToast("Sao chép thất bại!");
    });
};
