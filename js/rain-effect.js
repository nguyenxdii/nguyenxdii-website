/**
 * High-Performance Sharp Rain Effect
 * Uses internal Canvas clipping for perfect alignment and High-DPI scaling for sharpness.
 * Style: Fast, sharp rain streaks with splashes.
 */

class RainEffect {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;

    this.width = 0;
    this.height = 0;

    this.drops = [];
    this.splashes = [];
    this.isActive = false;
    this.animationId = null;

    // Mask Geometry
    this.windows = [
      // w1
      [
        1555, 217, 1552, 724, 1602, 656, 1655, 716, 1734, 761, 1734, 809, 1877,
        806, 1875, 212,
      ],
      // w2
      [1909, 217, 1912, 809, 2247, 809, 2247, 212],
      // w3
      [2284, 217, 2287, 809, 2604, 809, 2607, 214],
      // w4
      [2647, 217, 2649, 814, 2789, 806, 2781, 212],
    ];

    this.maskPath = new Path2D(); // Store the clip path

    // Configuration
    this.rainSpeed = 25;
    this.dropLength = 30;
    this.dropCount = 300; // Dense rain

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    if (!this.canvas) return;

    // Use clientWidth/Height to match CSS container exactly (avoids scrollbar discrepancies)
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + "px";
    this.canvas.style.height = this.height + "px";

    this.ctx.scale(this.dpr, this.dpr);

    this.updateMaskPath();
  }

  updateMaskPath() {
    // 1. Calculate Image Object-Fit Logic
    const imgW = 2752;
    const imgH = 1536;
    const screenW = this.width;
    const screenH = this.height;

    const screenRatio = screenW / screenH;
    const imgRatio = imgW / imgH;

    let scale;

    // object-fit: cover logic
    if (screenRatio > imgRatio) {
      scale = screenW / imgW;
    } else {
      scale = screenH / imgH;
    }

    // Centering offsets (Standard X/Y Mid logic)
    // Manual Adjustment: Shift left 8px (Final tune)
    const manualOffsetX = -8;
    const offsetX = (screenW - imgW * scale) / 2 + manualOffsetX;
    const offsetY = (screenH - imgH * scale) / 2;

    // 2. Create the Clip Path
    this.maskPath = new Path2D();

    this.windows.forEach((coords) => {
      for (let i = 0; i < coords.length; i += 2) {
        const x = coords[i] * scale + offsetX;
        const y = coords[i + 1] * scale + offsetY;

        if (i === 0) this.maskPath.moveTo(x, y);
        else this.maskPath.lineTo(x, y);
      }
      this.maskPath.closePath();
    });
  }

  // --- Logic ---

  start() {
    if (this.isActive) return;
    this.isActive = true;

    // Reset drops
    this.drops = [];
    for (let i = 0; i < this.dropCount; i++) {
      this.drops.push(this.resetDrop());
    }

    this.animate();
  }

  stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  resetDrop() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * -this.height,
      z: Math.random() * 0.5 + 0.5, // Depth for parallax speed
      len: Math.random() * 10 + 20,
    };
  }

  animate() {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // --- DRAWING WITH CLIPPING ---
    this.ctx.save();

    // Apply Mask
    this.ctx.clip(this.maskPath);

    // Draw Rain
    this.ctx.strokeStyle = "rgba(174, 194, 224, 0.4)";
    this.ctx.lineWidth = 1.5;
    this.ctx.lineCap = "round";

    this.ctx.beginPath();
    for (let i = 0; i < this.drops.length; i++) {
      const d = this.drops[i];

      this.ctx.moveTo(d.x, d.y);
      this.ctx.lineTo(d.x, d.y + d.len * d.z);

      // Update
      d.y += this.rainSpeed * d.z;

      // Reset
      if (d.y > this.height) {
        // Splash?
        if (Math.random() > 0.9) {
          this.splashes.push({
            x: d.x,
            y: this.height - Math.random() * 50, // Approximation
            age: 0,
          });
        }

        Object.assign(d, this.resetDrop());
        d.y = -20; // Start just above
      }
    }
    this.ctx.stroke();

    // Draw Splashes (Simple circles)
    /* 
       Note: We aren't calculating exact splash collision with the window sill 
       because the polygon is complex. 
       For now, rain just falls "through" the view, which is standard for 
       "looking out a window".
    */

    this.ctx.restore(); // Remove clip for next frame (though we clear anyway)

    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// Global instance interface
let rainEffect = null;

function initRainEffect() {
  if (!rainEffect) {
    rainEffect = new RainEffect("rain-canvas");
  }
}

function startRain() {
  if (rainEffect) rainEffect.start();
}

function stopRain() {
  if (rainEffect) rainEffect.stop();
}
