// Interactive Writing Canvas & AI Recognition Engine
class AICanvasEngine {
  constructor(canvasElement, guideCanvasElement) {
    this.canvas = canvasElement;
    this.guideCanvas = guideCanvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.guideCtx = this.guideCanvas.getContext('2d', { willReadFrequently: true });

    this.isDrawing = false;
    this.currentTool = 'brush'; // 'brush' or 'eraser'
    this.brushColor = '#6366F1';
    this.brushSize = 16;

    // Stroke history for Undo
    this.history = [];
    this.currentStroke = [];

    // Scanning state
    this.isScanning = false;

    this.initEvents();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set display size
    const width = rect.width || 420;
    const height = rect.height || 360;

    // Set internal resolution
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.guideCanvas.width = width * dpr;
    this.guideCanvas.height = height * dpr;

    this.ctx.scale(dpr, dpr);
    this.guideCtx.scale(dpr, dpr);

    this.width = width;
    this.height = height;

    this.redrawGuide();
    this.redrawAllStrokes();
  }

  setTask(task) {
    this.task = task;
    this.clear();
    this.redrawGuide();
  }

  // Draw Letter/Number Contour Guideline on background canvas
  redrawGuide() {
    if (!this.guideCtx || !this.task) return;

    this.guideCtx.clearRect(0, 0, this.width, this.height);

    const char = this.task.char || 'A';
    this.guideCtx.save();
    this.guideCtx.fillStyle = '#E2E8F0';
    this.guideCtx.textAlign = 'center';
    this.guideCtx.textBaseline = 'middle';
    
    // Choose font size based on char length
    const fontSize = char.length > 1 ? 160 : 210;
    this.guideCtx.font = `bold ${fontSize}px "Fredoka", "Nunito", sans-serif`;

    // Draw soft dashed watermark contour
    this.guideCtx.strokeStyle = '#CBD5E1';
    this.guideCtx.lineWidth = 4;
    this.guideCtx.setLineDash([10, 10]);

    this.guideCtx.strokeText(char, this.width / 2, this.height / 2 + 10);
    this.guideCtx.fillText(char, this.width / 2, this.height / 2 + 10);

    // Draw little start guide dot & arrow
    this.guideCtx.setLineDash([]);
    this.guideCtx.fillStyle = '#10B981';
    this.guideCtx.beginPath();
    this.guideCtx.arc(this.width / 2 - 50, this.height / 2 - 70, 8, 0, Math.PI * 2);
    this.guideCtx.fill();

    this.guideCtx.fillStyle = '#059669';
    this.guideCtx.font = 'bold 12px sans-serif';
    this.guideCtx.fillText('Boshlash', this.width / 2 - 50, this.height / 2 - 85);

    this.guideCtx.restore();
  }

  initEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const startDraw = (e) => {
      if (this.isScanning) return;
      e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);
      this.currentStroke = [{
        x: pos.x,
        y: pos.y,
        color: this.currentTool === 'eraser' ? '#FFFFFF' : this.brushColor,
        size: this.brushSize,
        tool: this.currentTool
      }];

      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = this.currentTool === 'eraser' ? '#FFFFFF' : this.brushColor;
      this.ctx.lineWidth = this.brushSize;
      this.ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
      this.ctx.stroke();
    };

    const moveDraw = (e) => {
      if (!this.isDrawing || this.isScanning) return;
      e.preventDefault();
      const pos = getPos(e);

      this.currentStroke.push({
        x: pos.x,
        y: pos.y,
        color: this.currentTool === 'eraser' ? '#FFFFFF' : this.brushColor,
        size: this.brushSize,
        tool: this.currentTool
      });

      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    };

    const endDraw = (e) => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.ctx.closePath();
      if (this.currentStroke.length > 0) {
        this.history.push([...this.currentStroke]);
        this.currentStroke = [];
      }
    };

    // Pointer Events (supports Touch, Mouse, Pen)
    this.canvas.addEventListener('pointerdown', startDraw);
    this.canvas.addEventListener('pointermove', moveDraw);
    this.canvas.addEventListener('pointerup', endDraw);
    this.canvas.addEventListener('pointercancel', endDraw);
    this.canvas.addEventListener('pointerleave', endDraw);
  }

  setTool(tool) {
    this.currentTool = tool;
  }

  setColor(color) {
    this.brushColor = color;
    this.currentTool = 'brush';
  }

  setSize(size) {
    this.brushSize = size;
  }

  clear() {
    this.history = [];
    this.currentStroke = [];
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  undo() {
    if (this.history.length === 0) return;
    this.history.pop();
    this.redrawAllStrokes();
  }

  redrawAllStrokes() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (const stroke of this.history) {
      if (stroke.length === 0) continue;
      this.ctx.beginPath();
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = stroke[0].color;
      this.ctx.lineWidth = stroke[0].size;

      this.ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        this.ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  // AI Recognition & Verification Engine
  async verifyWithAI() {
    if (this.isScanning) return;
    this.isScanning = true;

    // Check if child actually drew anything
    let totalDrawnPoints = 0;
    this.history.forEach(stroke => totalDrawnPoints += stroke.length);

    if (totalDrawnPoints < 12) {
      this.isScanning = false;
      return {
        success: false,
        score: 15,
        message: "Iltimos, avval qalam bilan harf ustidan chizib ko'ring! ✏️",
        isTooLittle: true
      };
    }

    // Play scanning sound
    if (window.soundEngine) {
      window.soundEngine.playScan();
    }

    // Real Pixel Density Analysis between User Canvas and Target Guide
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(this.width * dpr);
    const h = Math.floor(this.height * dpr);

    const userImg = this.ctx.getImageData(0, 0, w, h).data;
    const guideImg = this.guideCtx.getImageData(0, 0, w, h).data;

    let guidePixels = 0;
    let matchPixels = 0;
    let userNonEmptyPixels = 0;

    // Sample pixels for fast, accurate matching
    for (let i = 3; i < userImg.length; i += 16) {
      const userAlpha = userImg[i];
      const guideAlpha = guideImg[i];

      const isUserDrawn = userAlpha > 40;
      const isGuideDrawn = guideAlpha > 40;

      if (isGuideDrawn) {
        guidePixels++;
        if (isUserDrawn) {
          matchPixels++;
        }
      }
      if (isUserDrawn) {
        userNonEmptyPixels++;
      }
    }

    // Calculate accuracy percentage
    const coverage = guidePixels > 0 ? (matchPixels / guidePixels) : 0.8;
    const precision = userNonEmptyPixels > 0 ? (matchPixels / userNonEmptyPixels) : 0.8;
    
    // Balanced score with generous boost for children encouragement
    let rawScore = Math.round((coverage * 0.6 + precision * 0.4) * 100);
    // Children friendly scaling: if they tried reasonably, give 75-96%
    let finalScore = Math.min(98, Math.max(45, Math.round(rawScore * 1.35 + 25)));

    // Artificial delay for scanning animation
    await new Promise(resolve => setTimeout(resolve, 1800));

    this.isScanning = false;

    if (finalScore >= 68) {
      return {
        success: true,
        score: finalScore,
        stars: finalScore >= 85 ? 3 : 2,
        message: "Ofarin! Harfni juda chiroyli va to'g'ri yozding! 🌟",
        coinsEarned: this.task.reward || 10
      };
    } else {
      return {
        success: false,
        score: finalScore,
        stars: 1,
        message: "Yaxshi harakat! Chiziqlar ustidan yana bir bor aniqroq yurgizib ko'r! 💪",
        coinsEarned: 0
      };
    }
  }
}

window.AICanvasEngine = AICanvasEngine;
