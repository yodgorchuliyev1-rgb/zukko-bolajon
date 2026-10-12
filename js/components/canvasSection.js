// Interactive Canvas UI & AI Verification Modal
function renderCanvasSection(container) {
  const state = window.appState;
  const task = state.activeTask;

  container.innerHTML = `
    <div class="bg-white border-2 border-indigo-100 rounded-3xl p-5 md:p-7 shadow-xl">
      
      <!-- Top Bar: Task Info & Reward Badge -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-md text-white">
            ${task.emoji || '✏️'}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl md:text-2xl font-black text-slate-800">${task.title}</h2>
              <span class="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-black rounded-lg">Namunadan ko'chir</span>
            </div>
            <p class="text-xs md:text-sm font-semibold text-slate-500">
              Chiziqlar ustidan qalam bilan aniq yurgizing va AI yordamida tekshiring!
            </p>
          </div>
        </div>

        <!-- Task Reward Indicator -->
        <div class="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 px-4 py-2 rounded-2xl shadow-sm">
          <span class="text-2xl">🪙</span>
          <div>
            <span class="text-[10px] font-bold text-amber-600 block leading-tight">MUKOFOT</span>
            <span class="text-sm md:text-base font-black text-amber-800 leading-tight">+${task.reward} Tanga</span>
          </div>
        </div>
      </div>

      <!-- Main Interactive Work Area -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left 8 Columns: Canvas Box -->
        <div class="lg:col-span-8 flex flex-col items-center">
          
          <!-- Drawing Toolbar -->
          <div class="w-full flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl mb-3 shadow-inner">
            
            <!-- Tool: Brush & Eraser -->
            <div class="flex items-center gap-1.5">
              <button id="toolBrush" class="tool-btn px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-indigo-600 text-white shadow-sm transition-all">
                <span>✏️</span> Qalam
              </button>
              <button id="toolEraser" class="tool-btn px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all">
                <span>🧹</span> O'chirg'ich
              </button>
            </div>

            <!-- Color Palette -->
            <div class="flex items-center gap-1.5">
              <button class="color-dot w-7 h-7 rounded-full bg-indigo-600 ring-2 ring-indigo-400 ring-offset-2 transition-transform hover:scale-110" data-color="#6366F1"></button>
              <button class="color-dot w-7 h-7 rounded-full bg-sky-500 transition-transform hover:scale-110" data-color="#0EA5E9"></button>
              <button class="color-dot w-7 h-7 rounded-full bg-emerald-500 transition-transform hover:scale-110" data-color="#10B981"></button>
              <button class="color-dot w-7 h-7 rounded-full bg-pink-500 transition-transform hover:scale-110" data-color="#EC4899"></button>
              <button class="color-dot w-7 h-7 rounded-full bg-amber-500 transition-transform hover:scale-110" data-color="#F59E0B"></button>
              <button class="color-dot w-7 h-7 rounded-full bg-slate-800 transition-transform hover:scale-110" data-color="#1E293B"></button>
            </div>

            <!-- Brush Size Picker -->
            <div class="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200">
              <button class="size-btn px-2 py-0.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-100" data-size="8">Yupqa</button>
              <button class="size-btn px-2 py-0.5 rounded text-xs font-black bg-indigo-100 text-indigo-700" data-size="16">O'rta</button>
              <button class="size-btn px-2 py-0.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-100" data-size="26">Qalin</button>
            </div>

            <!-- Action: Undo & Clear -->
            <div class="flex items-center gap-1.5">
              <button id="btnUndo" class="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all" title="Oxirgi chiziqni bekor qilish">
                ↩️ Orqaga
              </button>
              <button id="btnClear" class="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold transition-all" title="Doskani tozalash">
                🗑️ Tozalash
              </button>
            </div>

          </div>

          <!-- Canvas Surface Container -->
          <div class="relative w-full h-[360px] md:h-[400px] bg-slate-50/60 rounded-3xl border-4 border-dashed border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
            
            <!-- Guideline Canvas (Background) -->
            <canvas id="guideCanvas" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>

            <!-- User Drawing Canvas (Foreground) -->
            <canvas id="drawingCanvas" class="absolute inset-0 w-full h-full z-10"></canvas>

            <!-- Scanning Overlay (Hidden by default, shown during AI verify) -->
            <div id="scanningOverlay" class="absolute inset-0 z-20 pointer-events-none hidden bg-indigo-900/20 backdrop-blur-[1px] flex flex-col items-center justify-center">
              <!-- Laser line -->
              <div class="laser-line absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]"></div>
              
              <!-- Scanning Badge -->
              <div class="bg-slate-900/90 text-cyan-300 border border-cyan-400/50 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
                <span class="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
                <span class="text-sm md:text-base font-black tracking-wide">AI Yozuvni Tahlil Qilmoqda...</span>
              </div>
            </div>

          </div>

          <!-- AI Verify Trigger Button -->
          <div class="w-full mt-4 flex items-center justify-center">
            <button id="btnVerifyAI" class="btn-bouncy w-full md:w-3/4 py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white rounded-2xl font-black text-lg md:text-xl shadow-xl flex items-center justify-center gap-3 cursor-pointer">
              <span class="text-2xl animate-pulse">🤖</span>
              <span>AI BILAN TEKSHIRISH</span>
              <span class="text-sm bg-white/20 px-2 py-0.5 rounded-full">+${task.reward} 🪙</span>
            </button>
          </div>

        </div>

        <!-- Right 4 Columns: AI Feedback Card & Quick Character Helper -->
        <div class="lg:col-span-4 flex flex-col gap-4">
          
          <!-- Character Mini Guidance -->
          <div class="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-3xl p-4 shadow-md">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl">${state.student.avatar === 'bilagon' ? '👦' : '👧'}</span>
              <div>
                <h4 class="text-sm font-black text-indigo-900">${state.characters[state.student.avatar].name} maslahati:</h4>
                <span class="text-xs text-indigo-500 font-semibold">Qadam-baqadam yozish</span>
              </div>
            </div>
            <p class="text-xs text-slate-600 font-medium leading-relaxed bg-white/70 p-3 rounded-2xl border border-indigo-50">
              "Avval yashil nuqtadan boshla, keyin chiziqni pastga tushir. Oxirida o'rta chiziqchasini qo'y. Shunda AI 100% to'g'ri deb qabul qiladi!"
            </p>
          </div>

          <!-- AI Result Box (Dynamic) -->
          <div id="aiResultCard" class="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 text-center transition-all">
            <div class="w-14 h-14 mx-auto mb-2 rounded-2xl bg-slate-200 flex items-center justify-center text-3xl">
              🎯
            </div>
            <h4 class="text-base font-black text-slate-700">AI Tekshiruv Kutilmoqda</h4>
            <p class="text-xs text-slate-500 mt-1 font-medium">
              Chizib bo'lgach, "AI bilan tekshirish" tugmasini bosing!
            </p>
          </div>

          <!-- Other Alphabet Letters Quick Switch -->
          <div class="bg-white border-2 border-slate-100 rounded-3xl p-4 shadow-sm">
            <h5 class="text-xs font-black text-slate-700 uppercase tracking-wider mb-2.5">Boshqa harflarga o'tish:</h5>
            <div class="flex flex-wrap gap-2">
              ${state.lessons.slice(0, 6).map(l => `
                <button class="quick-letter-btn px-3 py-1.5 rounded-xl font-black text-xs transition-all ${l.char === task.char ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-indigo-50'}" data-char="${l.char}">
                  ${l.char}
                </button>
              `).join('')}
            </div>
          </div>

        </div>

      </div>

    </div>
  `;

  // Initialize Canvas Engine
  const canvasEl = container.querySelector('#drawingCanvas');
  const guideCanvasEl = container.querySelector('#guideCanvas');
  const scanningOverlay = container.querySelector('#scanningOverlay');
  const resultCard = container.querySelector('#aiResultCard');

  const canvasEngine = new AICanvasEngine(canvasEl, guideCanvasEl);
  canvasEngine.setTask(task);
  canvasEngine.resize();

  // Resize handler
  window.addEventListener('resize', () => {
    canvasEngine.resize();
  });

  // Tools Setup
  const btnBrush = container.querySelector('#toolBrush');
  const btnEraser = container.querySelector('#toolEraser');
  const btnUndo = container.querySelector('#btnUndo');
  const btnClear = container.querySelector('#btnClear');
  const btnVerify = container.querySelector('#btnVerifyAI');

  btnBrush.addEventListener('click', () => {
    canvasEngine.setTool('brush');
    btnBrush.className = 'tool-btn px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-indigo-600 text-white shadow-sm';
    btnEraser.className = 'tool-btn px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200';
    if (window.soundEngine) window.soundEngine.playClick();
  });

  btnEraser.addEventListener('click', () => {
    canvasEngine.setTool('eraser');
    btnEraser.className = 'tool-btn px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-rose-600 text-white shadow-sm';
    btnBrush.className = 'tool-btn px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200';
    if (window.soundEngine) window.soundEngine.playClick();
  });

  btnUndo.addEventListener('click', () => {
    canvasEngine.undo();
    if (window.soundEngine) window.soundEngine.playClick();
  });

  btnClear.addEventListener('click', () => {
    canvasEngine.clear();
    if (window.soundEngine) window.soundEngine.playClick();
  });

  // Colors
  container.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      const color = e.currentTarget.getAttribute('data-color');
      canvasEngine.setColor(color);
      container.querySelectorAll('.color-dot').forEach(d => d.classList.remove('ring-2', 'ring-indigo-400', 'ring-offset-2'));
      e.currentTarget.classList.add('ring-2', 'ring-indigo-400', 'ring-offset-2');
      if (window.soundEngine) window.soundEngine.playClick();
    });
  });

  // Sizes
  container.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const size = parseInt(e.currentTarget.getAttribute('data-size'), 10);
      canvasEngine.setSize(size);
      container.querySelectorAll('.size-btn').forEach(b => {
        b.className = 'size-btn px-2 py-0.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-100';
      });
      e.currentTarget.className = 'size-btn px-2 py-0.5 rounded text-xs font-black bg-indigo-100 text-indigo-700';
      if (window.soundEngine) window.soundEngine.playClick();
    });
  });

  // Quick switch letters
  container.querySelectorAll('.quick-letter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const char = e.currentTarget.getAttribute('data-char');
      const targetLesson = state.lessons.find(l => l.char === char);
      if (targetLesson) {
        state.selectTask({
          id: targetLesson.id,
          title: `${targetLesson.char} harfini yozish`,
          char: targetLesson.char,
          word: targetLesson.word,
          emoji: targetLesson.emoji,
          category: 'alphabet',
          reward: targetLesson.reward
        });
      }
    });
  });

  // AI Verify Button Click Handler
  btnVerify.addEventListener('click', async () => {
    scanningOverlay.classList.remove('hidden');
    btnVerify.disabled = true;

    const result = await canvasEngine.verifyWithAI();

    scanningOverlay.classList.add('hidden');
    btnVerify.disabled = false;

    if (result.isTooLittle) {
      if (window.soundEngine) window.soundEngine.playTryAgain();
      resultCard.innerHTML = `
        <div class="w-14 h-14 mx-auto mb-2 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl animate-bounce">
          ✏️
        </div>
        <h4 class="text-base font-black text-amber-900">Doska Bo'sh</h4>
        <p class="text-xs text-amber-700 mt-1 font-semibold">${result.message}</p>
      `;
      return;
    }

    if (result.success) {
      // Success reaction!
      state.addReward(result.coinsEarned, 25);
      if (window.soundEngine) {
        window.soundEngine.playSuccess();
      }

      // Update Character speech to congratulatory
      const activeChar = state.characters[state.student.avatar];
      const praise = activeChar.quotesSuccess[Math.floor(Math.random() * activeChar.quotesSuccess.length)];
      activeChar.speech = praise;
      if (window.soundEngine) {
        setTimeout(() => window.soundEngine.speak(praise), 400);
      }

      // Confetti effect
      createConfettiParticles();

      resultCard.className = 'bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 text-center shadow-lg';
      resultCard.innerHTML = `
        <div class="w-16 h-16 mx-auto mb-2 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-4xl shadow-md animate-bounce">
          ⭐
        </div>
        <div class="text-xs font-black text-emerald-600 uppercase tracking-widest">AI Bahosi: ${result.score}%</div>
        <h4 class="text-lg font-black text-emerald-900 mt-1">A'lo Daraja!</h4>
        <p class="text-xs text-emerald-800 mt-1 font-semibold">${result.message}</p>
        
        <!-- Coins Earned Banner -->
        <div class="mt-3 inline-flex items-center gap-1.5 bg-white border border-emerald-200 px-3 py-1.5 rounded-2xl text-emerald-700 font-black text-sm shadow-sm">
          <span>🪙</span> +${result.coinsEarned} Zukko-Tanga qo'shildi!
        </div>

        <button id="btnNextLesson" class="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all">
          Keyingi Darsga O'tish ➡️
        </button>
      `;

      const btnNext = resultCard.querySelector('#btnNextLesson');
      if (btnNext) {
        btnNext.addEventListener('click', () => {
          // Switch to next lesson in array
          const currentIndex = state.lessons.findIndex(l => l.char === task.char);
          const nextIndex = (currentIndex + 1) % state.lessons.length;
          const nextLesson = state.lessons[nextIndex];
          state.selectTask({
            id: nextLesson.id,
            title: `${nextLesson.char} harfini yozish`,
            char: nextLesson.char,
            word: nextLesson.word,
            emoji: nextLesson.emoji,
            category: 'alphabet',
            reward: nextLesson.reward
          });
        });
      }

    } else {
      // Need try again
      if (window.soundEngine) {
        window.soundEngine.playTryAgain();
      }

      const activeChar = state.characters[state.student.avatar];
      const encourage = activeChar.quotesTryAgain[Math.floor(Math.random() * activeChar.quotesTryAgain.length)];
      activeChar.speech = encourage;
      if (window.soundEngine) {
        setTimeout(() => window.soundEngine.speak(encourage), 300);
      }

      resultCard.className = 'bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 text-center shadow-md';
      resultCard.innerHTML = `
        <div class="w-14 h-14 mx-auto mb-2 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-3xl">
          💪
        </div>
        <div class="text-xs font-black text-amber-600 uppercase tracking-widest">AI Bahosi: ${result.score}%</div>
        <h4 class="text-base font-black text-amber-900 mt-1">Deyarli uddalading!</h4>
        <p class="text-xs text-amber-800 mt-1 font-semibold">${result.message}</p>
        <button id="btnRetryCanvas" class="mt-3 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-sm transition-all">
          Qayta Urinish 🔄
        </button>
      `;

      const btnRetry = resultCard.querySelector('#btnRetryCanvas');
      if (btnRetry) {
        btnRetry.addEventListener('click', () => {
          canvasEngine.clear();
          if (window.soundEngine) window.soundEngine.playClick();
        });
      }
    }
  });
}

// Confetti burst on success
function createConfettiParticles() {
  const count = 40;
  const container = document.body;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 6;

    el.style.position = 'fixed';
    el.style.zIndex = '9999';
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.backgroundColor = color;
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.left = `${window.innerWidth / 2 + (Math.random() * 200 - 100)}px`;
    el.style.top = `${window.innerHeight / 2}px`;
    el.style.pointerEvents = 'none';
    el.style.transition = 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)';

    container.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 300 + 80;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance - 80;

    requestAnimationFrame(() => {
      el.style.transform = `translate(${destX}px, ${destY}px) rotate(${Math.random() * 720}deg)`;
      el.style.opacity = '0';
    });

    setTimeout(() => {
      el.remove();
    }, 1300);
  }
}

window.renderCanvasSection = renderCanvasSection;
