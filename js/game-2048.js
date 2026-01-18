// 2048 Mini Game - JavaScript
// Swipe to move tiles

class Game2048 {
  constructor(container) {
    this.container = container;
    this.size = 4;
    this.grid = [];
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem("best2048") || "0");
    this.gameOver = false;
    this.won = false;
    this.touchStartX = 0;
    this.touchStartY = 0;

    this.init();
  }

  init() {
    this.grid = Array(this.size)
      .fill(null)
      .map(() => Array(this.size).fill(0));
    this.score = 0;
    this.gameOver = false;
    this.won = false;

    this.addRandomTile();
    this.addRandomTile();
    this.render();
    this.bindControls();
  }

  render() {
    this.container.innerHTML = `
      <div class="game2048-wrapper">
        <div class="game2048-header">
          <div class="game2048-title">2048</div>
          <div class="game2048-scores">
            <div class="score-box">
              <span class="label">SCORE</span>
              <span class="value" id="game2048-score">${this.score}</span>
            </div>
            <div class="score-box">
              <span class="label">BEST</span>
              <span class="value" id="game2048-best">${this.bestScore}</span>
            </div>
          </div>
        </div>
        <div class="game2048-hint">WASD / ↑↓←→ để di chuyển</div>
        <div class="game2048-board" id="game2048-board"></div>
        <button class="game2048-restart" id="game2048-restart">Chơi lại</button>
      </div>
    `;

    this.boardElement = document.getElementById("game2048-board");
    this.renderBoard();

    document
      .getElementById("game2048-restart")
      ?.addEventListener("click", () => {
        this.restart();
      });
  }

  renderBoard() {
    if (!this.boardElement) return;

    let html = "";
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const value = this.grid[y][x];
        const className = value
          ? `game2048-tile tile-${value}`
          : "game2048-tile";
        html += `<div class="${className}">${value || ""}</div>`;
      }
    }
    this.boardElement.innerHTML = html;

    // Check game state
    if (this.gameOver || this.won) {
      this.showEndScreen();
    }
  }

  addRandomTile() {
    const emptyCells = [];
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.grid[y][x] === 0) {
          emptyCells.push({ x, y });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { x, y } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.grid[y][x] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  move(direction) {
    if (this.gameOver || this.won) return;

    let moved = false;
    const oldGrid = JSON.stringify(this.grid);
    let merged = false;

    switch (direction) {
      case "up":
        merged = this.moveUp();
        break;
      case "down":
        merged = this.moveDown();
        break;
      case "left":
        merged = this.moveLeft();
        break;
      case "right":
        merged = this.moveRight();
        break;
    }

    if (JSON.stringify(this.grid) !== oldGrid) {
      // Play sound effect
      if (typeof gameSounds !== "undefined") {
        if (merged) {
          gameSounds.playMerge();
        } else {
          gameSounds.playMove();
        }
      }

      this.addRandomTile();
      this.updateScore();
      this.renderBoard();

      if (!this.canMove()) {
        this.gameOver = true;
        if (typeof gameSounds !== "undefined") {
          gameSounds.playGameOver();
        }
        this.renderBoard();
      }
    }
  }

  moveLeft() {
    let moved = false;
    let merged = false;
    for (let y = 0; y < this.size; y++) {
      const row = this.grid[y].filter((v) => v !== 0);
      const mergedRow = [];

      for (let i = 0; i < row.length; i++) {
        if (i < row.length - 1 && row[i] === row[i + 1]) {
          mergedRow.push(row[i] * 2);
          this.score += row[i] * 2;
          if (row[i] * 2 === 2048) {
            this.won = true;
            if (typeof gameSounds !== "undefined") gameSounds.playWin();
          }
          merged = true;
          i++;
        } else {
          mergedRow.push(row[i]);
        }
      }

      while (mergedRow.length < this.size) mergedRow.push(0);

      if (JSON.stringify(this.grid[y]) !== JSON.stringify(mergedRow)) {
        moved = true;
      }
      this.grid[y] = mergedRow;
    }
    return merged;
  }

  moveRight() {
    let moved = false;
    let merged = false;
    for (let y = 0; y < this.size; y++) {
      const row = this.grid[y].filter((v) => v !== 0);
      const mergedRow = [];

      for (let i = row.length - 1; i >= 0; i--) {
        if (i > 0 && row[i] === row[i - 1]) {
          mergedRow.unshift(row[i] * 2);
          this.score += row[i] * 2;
          if (row[i] * 2 === 2048) {
            this.won = true;
            if (typeof gameSounds !== "undefined") gameSounds.playWin();
          }
          merged = true;
          i--;
        } else {
          mergedRow.unshift(row[i]);
        }
      }

      while (mergedRow.length < this.size) mergedRow.unshift(0);

      if (JSON.stringify(this.grid[y]) !== JSON.stringify(mergedRow)) {
        moved = true;
      }
      this.grid[y] = mergedRow;
    }
    return merged;
  }

  moveUp() {
    let moved = false;
    let merged = false;
    for (let x = 0; x < this.size; x++) {
      const col = [];
      for (let y = 0; y < this.size; y++) {
        if (this.grid[y][x] !== 0) col.push(this.grid[y][x]);
      }

      const mergedCol = [];
      for (let i = 0; i < col.length; i++) {
        if (i < col.length - 1 && col[i] === col[i + 1]) {
          mergedCol.push(col[i] * 2);
          this.score += col[i] * 2;
          if (col[i] * 2 === 2048) {
            this.won = true;
            if (typeof gameSounds !== "undefined") gameSounds.playWin();
          }
          merged = true;
          i++;
        } else {
          mergedCol.push(col[i]);
        }
      }

      while (mergedCol.length < this.size) mergedCol.push(0);

      for (let y = 0; y < this.size; y++) {
        if (this.grid[y][x] !== mergedCol[y]) {
          moved = true;
        }
        this.grid[y][x] = mergedCol[y];
      }
    }
    return merged;
  }

  moveDown() {
    let moved = false;
    let merged = false;
    for (let x = 0; x < this.size; x++) {
      const col = [];
      for (let y = 0; y < this.size; y++) {
        if (this.grid[y][x] !== 0) col.push(this.grid[y][x]);
      }

      const mergedCol = [];
      for (let i = col.length - 1; i >= 0; i--) {
        if (i > 0 && col[i] === col[i - 1]) {
          mergedCol.unshift(col[i] * 2);
          this.score += col[i] * 2;
          if (col[i] * 2 === 2048) {
            this.won = true;
            if (typeof gameSounds !== "undefined") gameSounds.playWin();
          }
          merged = true;
          i--;
        } else {
          mergedCol.unshift(col[i]);
        }
      }

      while (mergedCol.length < this.size) mergedCol.unshift(0);

      for (let y = 0; y < this.size; y++) {
        if (this.grid[y][x] !== mergedCol[y]) {
          moved = true;
        }
        this.grid[y][x] = mergedCol[y];
      }
    }
    return merged;
  }

  canMove() {
    // Check for empty cells
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.grid[y][x] === 0) return true;
      }
    }

    // Check for possible merges
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const val = this.grid[y][x];
        if (x < this.size - 1 && this.grid[y][x + 1] === val) return true;
        if (y < this.size - 1 && this.grid[y + 1][x] === val) return true;
      }
    }

    return false;
  }

  updateScore() {
    const scoreEl = document.getElementById("game2048-score");
    const bestEl = document.getElementById("game2048-best");

    if (scoreEl) scoreEl.textContent = this.score;

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem("best2048", this.bestScore.toString());
      if (bestEl) bestEl.textContent = this.bestScore;
    }
  }

  showEndScreen() {
    // Play appropriate sound
    if (typeof gameSounds !== "undefined") {
      if (this.won) {
        gameSounds.playWin();
      } else {
        gameSounds.playGameOver();
      }
    }

    const overlay = document.createElement("div");
    overlay.className = "game2048-overlay";
    overlay.innerHTML = `
      <div class="overlay-content">
        <h2>${this.won ? "🎉 Bạn thắng!" : "Game Over"}</h2>
        <p>Score: ${this.score}</p>
        <button class="game2048-restart" id="game2048-overlay-restart">Chơi lại</button>
      </div>
    `;
    this.container.querySelector(".game2048-wrapper")?.appendChild(overlay);

    // Add restart button event
    document
      .getElementById("game2048-overlay-restart")
      ?.addEventListener("click", () => {
        this.restart();
      });
  }

  restart() {
    this.grid = Array(this.size)
      .fill(null)
      .map(() => Array(this.size).fill(0));
    this.score = 0;
    this.gameOver = false;
    this.won = false;

    this.addRandomTile();
    this.addRandomTile();
    this.render();
  }

  bindControls() {
    // Kiểm tra có phải mobile portrait (màn hình đang xoay 90 độ)
    const isRotatedScreen = () => {
      return window.innerWidth < 768 && window.innerHeight > window.innerWidth;
    };

    // Touch controls for mobile
    this.handleTouchStart = (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    };

    this.handleTouchEnd = (e) => {
      if (!this.touchStartX || !this.touchStartY) return;

      const deltaX = e.changedTouches[0].clientX - this.touchStartX;
      const deltaY = e.changedTouches[0].clientY - this.touchStartY;
      const minSwipe = 30;

      let direction = null;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipe) {
          direction = deltaX > 0 ? "right" : "left";
        }
      } else {
        if (Math.abs(deltaY) > minSwipe) {
          direction = deltaY > 0 ? "down" : "up";
        }
      }

      // Nếu màn hình đang xoay 90 độ, đảo hướng swipe
      if (direction && isRotatedScreen()) {
        const rotatedMap = {
          up: "left",
          down: "right",
          left: "down",
          right: "up",
        };
        direction = rotatedMap[direction];
      }

      if (direction) {
        this.move(direction);
      }

      this.touchStartX = 0;
      this.touchStartY = 0;
    };

    // Keyboard controls (for testing on PC)
    this.handleKeyDown = (e) => {
      if (this.gameOver) return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          this.move("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          this.move("down");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          this.move("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          this.move("right");
          break;
      }
    };

    const board = document.getElementById("game2048-board");
    board?.addEventListener("touchstart", this.handleTouchStart, {
      passive: true,
    });
    board?.addEventListener("touchend", this.handleTouchEnd, { passive: true });
    document.addEventListener("keydown", this.handleKeyDown);
  }

  destroy() {
    const board = document.getElementById("game2048-board");
    board?.removeEventListener("touchstart", this.handleTouchStart);
    board?.removeEventListener("touchend", this.handleTouchEnd);
    document.removeEventListener("keydown", this.handleKeyDown);
  }
}

// Global game instance
let game2048 = null;

function initGame2048() {
  const container = document.getElementById("game2048-container");
  if (container) {
    if (game2048) {
      game2048.destroy();
    }
    game2048 = new Game2048(container);
  }
}

function destroyGame2048() {
  if (game2048) {
    game2048.destroy();
    game2048 = null;
  }
}
