// Controls: A/D = move, S = soft drop, Space = rotate

class TetrisGame {
  constructor(container) {
    this.container = container;
    this.cols = 10;
    this.rows = 20;
    this.grid = [];
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.gameOver = false;
    this.isPaused = false;
    this.currentPiece = null;
    this.nextPiece = null; // Khối tiếp theo
    this.currentX = 0;
    this.currentY = 0;
    this.dropInterval = null;
    this.dropSpeed = 1000;

    // 7 loại khối Tetris chuẩn
    this.pieces = {
      I: { shape: [[1, 1, 1, 1]], color: "#00f5ff" },
      O: {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#ffeb3b",
      },
      T: {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "#a855f7",
      },
      S: {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "#4caf50",
      },
      Z: {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "#f44336",
      },
      J: {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: "#2196f3",
      },
      L: {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: "#ff9800",
      },
    };

    this.pieceTypes = Object.keys(this.pieces);
    this.init();
  }

  init() {
    // Tạo grid rỗng
    this.grid = Array(this.rows)
      .fill(null)
      .map(() => Array(this.cols).fill(0));

    // Tạo khối tiếp theo đầu tiên
    this.generateNextPiece();

    this.render();
    this.spawnPiece();
    this.startGameLoop();
    this.bindControls();
  }

  generateNextPiece() {
    const type =
      this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
    this.nextPiece = { ...this.pieces[type] };
    this.nextPiece.shape = this.pieces[type].shape.map((row) => [...row]);
  }

  render() {
    this.container.innerHTML = `
      <div class="tetris-wrapper">
        <div class="tetris-info">
          <div class="tetris-next">
            <span class="label">NEXT</span>
            <div class="tetris-next-grid" id="tetris-next-grid"></div>
          </div>
          <div class="tetris-score">
            <span class="label">SCORE</span>
            <span class="value" id="tetris-score">0</span>
          </div>
          <div class="tetris-level">
            <span class="label">LEVEL</span>
            <span class="value" id="tetris-level">1</span>
          </div>
          <div class="tetris-lines">
            <span class="label">LINES</span>
            <span class="value" id="tetris-lines">0</span>
          </div>
          <div class="tetris-controls">
            <span class="label">CONTROLS</span>
            <div class="control-hint">A/D - Move</div>
            <div class="control-hint">S - Drop</div>
            <div class="control-hint">Space - Rotate</div>
          </div>
        </div>
        <div class="tetris-board" id="tetris-board"></div>
      </div>
    `;

    this.boardElement = document.getElementById("tetris-board");
    this.nextElement = document.getElementById("tetris-next-grid");
    this.renderBoard();
    this.renderNextPiece();
  }

  renderNextPiece() {
    if (!this.nextElement || !this.nextPiece) return;

    // Reset grid
    this.nextElement.innerHTML = "";

    // Tạo grid 4x2 cho preview (vì các khối đều vừa trong 4x2 hoặc 3x2)
    const previewGrid = Array(2)
      .fill(null)
      .map(() => Array(4).fill(0));

    // Đặt khối vào giữa grid preview
    const shape = this.nextPiece.shape;
    const offsetY = Math.floor((2 - shape.length) / 2);
    const offsetX = Math.floor((4 - shape[0].length) / 2);

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          previewGrid[y + offsetY][x + offsetX] = 1;
        }
      }
    }

    // Render HTML
    let html = "";
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 4; x++) {
        const filled = previewGrid[y][x];
        const color = filled ? this.nextPiece.color : "";
        html += `<div class="tetris-next-cell" style="${color ? `background-color: ${color}` : ""}"></div>`;
      }
    }
    this.nextElement.innerHTML = html;
  }

  renderBoard() {
    if (!this.boardElement) return;

    let html = "";
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let color = this.grid[y][x];
        let isPiece = false;

        // Kiểm tra xem ô có thuộc khối đang rơi không
        if (this.currentPiece) {
          const shape = this.currentPiece.shape;
          for (let py = 0; py < shape.length; py++) {
            for (let px = 0; px < shape[py].length; px++) {
              if (
                shape[py][px] &&
                this.currentX + px === x &&
                this.currentY + py === y
              ) {
                color = this.currentPiece.color;
                isPiece = true;
              }
            }
          }
        }

        const filled = color ? "filled" : "";
        const style = color ? `background-color: ${color};` : "";
        html += `<div class="tetris-cell ${filled}" style="${style}"></div>`;
      }
    }
    this.boardElement.innerHTML = html;
  }

  spawnPiece() {
    this.currentPiece = this.nextPiece;
    this.currentX = Math.floor(
      (this.cols - this.currentPiece.shape[0].length) / 2,
    );
    this.currentY = 0;

    // Tạo khối tiếp theo mới
    this.generateNextPiece();
    this.renderNextPiece();

    // Check game over
    if (
      !this.isValidPosition(
        this.currentX,
        this.currentY,
        this.currentPiece.shape,
      )
    ) {
      this.endGame();
    } else {
      this.renderBoard();
    }
  }

  isValidPosition(x, y, shape) {
    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const newX = x + px;
          const newY = y + py;

          // Check bounds
          if (newX < 0 || newX >= this.cols || newY >= this.rows) {
            return false;
          }

          // Check collision with placed pieces
          if (newY >= 0 && this.grid[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }

  movePiece(dx, dy) {
    if (this.gameOver || this.isPaused) return;

    const newX = this.currentX + dx;
    const newY = this.currentY + dy;

    if (this.isValidPosition(newX, newY, this.currentPiece.shape)) {
      this.currentX = newX;
      this.currentY = newY;
      this.renderBoard();
      // Play move sound
      if (typeof gameSounds !== "undefined" && dx !== 0) {
        gameSounds.playTetrisMove();
      }
      return true;
    }
    return false;
  }

  rotatePiece() {
    if (this.gameOver || this.isPaused) return;

    const shape = this.currentPiece.shape;
    const rows = shape.length;
    const cols = shape[0].length;

    // Rotate 90 degrees clockwise
    const rotated = [];
    for (let x = 0; x < cols; x++) {
      rotated[x] = [];
      for (let y = rows - 1; y >= 0; y--) {
        rotated[x].push(shape[y][x]);
      }
    }

    // Try rotation with wall kicks
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (this.isValidPosition(this.currentX + kick, this.currentY, rotated)) {
        this.currentPiece.shape = rotated;
        this.currentX += kick;
        this.renderBoard();
        // Play rotate sound
        if (typeof gameSounds !== "undefined") {
          gameSounds.playTetrisRotate();
        }
        return;
      }
    }
  }

  dropPiece() {
    if (!this.movePiece(0, 1)) {
      this.lockPiece();
    }
  }

  lockPiece() {
    const shape = this.currentPiece.shape;

    // Đặt khối vào grid
    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const y = this.currentY + py;
          const x = this.currentX + px;
          if (y >= 0 && y < this.rows && x >= 0 && x < this.cols) {
            this.grid[y][x] = this.currentPiece.color;
          }
        }
      }
    }

    // Play lock sound
    if (typeof gameSounds !== "undefined") {
      gameSounds.playTetrisLock();
    }

    this.clearLines();
    this.spawnPiece();
    this.renderBoard();
  }

  clearLines() {
    let linesCleared = 0;

    for (let y = this.rows - 1; y >= 0; y--) {
      if (this.grid[y].every((cell) => cell !== 0)) {
        // Xóa hàng và thêm hàng trống ở trên
        this.grid.splice(y, 1);
        this.grid.unshift(Array(this.cols).fill(0));
        linesCleared++;
        y++; // Check same row again
      }
    }

    if (linesCleared > 0) {
      // Play clear line sound
      if (typeof gameSounds !== "undefined") {
        gameSounds.playTetrisClearLine();
      }

      // Scoring: 100, 300, 500, 800 for 1, 2, 3, 4 lines
      const points = [0, 100, 300, 500, 800][linesCleared] * this.level;
      this.score += points;
      this.lines += linesCleared;

      // Level up every 10 lines
      const newLevel = Math.floor(this.lines / 10) + 1;
      if (newLevel > this.level) {
        this.level = newLevel;
        this.dropSpeed = Math.max(100, 1000 - (this.level - 1) * 100);
        this.restartGameLoop();
        // Play level up sound
        if (typeof gameSounds !== "undefined") {
          gameSounds.playTetrisLevelUp();
        }
      }

      this.updateUI();
    }
  }

  updateUI() {
    const scoreEl = document.getElementById("tetris-score");
    const levelEl = document.getElementById("tetris-level");
    const linesEl = document.getElementById("tetris-lines");

    if (scoreEl) scoreEl.textContent = this.score;
    if (levelEl) levelEl.textContent = this.level;
    if (linesEl) linesEl.textContent = this.lines;
  }

  startGameLoop() {
    this.dropInterval = setInterval(() => {
      if (!this.isPaused && !this.gameOver) {
        this.dropPiece();
      }
    }, this.dropSpeed);
  }

  restartGameLoop() {
    clearInterval(this.dropInterval);
    this.startGameLoop();
  }

  endGame() {
    this.gameOver = true;
    clearInterval(this.dropInterval);

    // Play game over sound
    if (typeof gameSounds !== "undefined") {
      gameSounds.playTetrisGameOver();
    }

    // Show game over overlay
    const overlay = document.createElement("div");
    overlay.className = "tetris-gameover";
    overlay.innerHTML = `
      <div class="gameover-content">
        <h2>GAME OVER</h2>
        <p>Score: ${this.score}</p>
        <p>Level: ${this.level}</p>
        <p>Lines: ${this.lines}</p>
        <button id="tetris-restart">Play Again</button>
      </div>
    `;
    this.container.querySelector(".tetris-wrapper").appendChild(overlay);

    document.getElementById("tetris-restart")?.addEventListener("click", () => {
      this.restart();
    });
  }

  restart() {
    this.grid = Array(this.rows)
      .fill(null)
      .map(() => Array(this.cols).fill(0));
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.gameOver = false;
    this.dropSpeed = 1000;

    this.render();
    this.spawnPiece();
    this.restartGameLoop();
    this.updateUI();
  }

  bindControls() {
    this.handleKeyDown = (e) => {
      if (this.gameOver) return;

      switch (e.key.toLowerCase()) {
        case "a":
        case "arrowleft":
          e.preventDefault();
          this.movePiece(-1, 0);
          break;
        case "d":
        case "arrowright":
          e.preventDefault();
          this.movePiece(1, 0);
          break;
        case "s":
        case "arrowdown":
          e.preventDefault();
          this.movePiece(0, 1);
          break;
        case " ":
          e.preventDefault();
          this.rotatePiece();
          break;
      }
    };

    document.addEventListener("keydown", this.handleKeyDown);
  }

  destroy() {
    clearInterval(this.dropInterval);
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }
}

// Global game instance
let tetrisGame = null;

function initTetrisGame() {
  const container = document.getElementById("tetris-container");
  if (container) {
    if (tetrisGame) {
      tetrisGame.destroy();
    }
    tetrisGame = new TetrisGame(container);
  }
}

function destroyTetrisGame() {
  if (tetrisGame) {
    tetrisGame.destroy();
    tetrisGame = null;
  }
}
