// Interactive Word & Sentence Builder with Letter Cards Connection
function renderWordBuilder(container) {
  const state = window.appState;
  const puzzles = state.wordPuzzles;

  // Track active puzzle index in local state or dataset
  let currentIdx = container.dataset.puzzleIdx ? parseInt(container.dataset.puzzleIdx, 10) : 0;
  if (currentIdx >= puzzles.length) currentIdx = 0;
  const currentPuzzle = puzzles[currentIdx];

  // User's formed word array
  let assembledLetters = [];
  let availableCards = [...currentPuzzle.scrambled];

  const updateUI = () => {
    const isCompleted = assembledLetters.join('') === currentPuzzle.targetWord;

    container.innerHTML = `
      <div class="bg-white border-2 border-indigo-100 rounded-3xl p-5 md:p-7 shadow-xl">
        
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 bg-gradient-to-tr from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center text-3xl shadow-md text-white">
              🧩
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xl md:text-2xl font-black text-slate-800">So'z va Gap Tuzish</h3>
                <span class="px-2.5 py-0.5 bg-pink-100 text-pink-700 text-xs font-black rounded-lg">
                  Topshiriq ${currentIdx + 1} / ${puzzles.length}
                </span>
              </div>
              <p class="text-xs md:text-sm font-semibold text-slate-500">
                Harf kartochkalarini ketma-ket ulab, to'g'ri so'zni hosil qiling!
              </p>
            </div>
          </div>

          <!-- Reward -->
          <div class="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 px-4 py-2 rounded-2xl shadow-sm">
            <span class="text-2xl">🪙</span>
            <div>
              <span class="text-[10px] font-bold text-amber-600 block leading-tight">MUKOFOT</span>
              <span class="text-sm md:text-base font-black text-amber-800 leading-tight">+${currentPuzzle.reward} Tanga</span>
            </div>
          </div>
        </div>

        <!-- Word Puzzle Interactive Area -->
        <div class="max-w-2xl mx-auto flex flex-col items-center">
          
          <!-- Clue / Hint Box -->
          <div class="w-full bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border-2 border-pink-100 p-4 rounded-3xl mb-6 text-center flex flex-col items-center">
            <span class="text-4xl mb-1">${currentPuzzle.emoji}</span>
            <span class="text-xs font-black uppercase text-pink-500 tracking-wider">Topishmoq</span>
            <h4 class="text-base md:text-lg font-bold text-slate-700 mt-0.5">"${currentPuzzle.hint}"</h4>
          </div>

          <!-- Assembled Word Drop Slots (Target Boxes) -->
          <div class="w-full mb-6">
            <div class="text-xs font-black text-slate-400 uppercase tracking-widest text-center mb-2">Hosil bo'layotgan so'z:</div>
            <div class="flex flex-wrap items-center justify-center gap-2.5 md:gap-3.5 min-h-[70px] p-3 bg-slate-50 border-2 border-dashed border-indigo-200 rounded-3xl">
              ${currentPuzzle.targetWord.split('').map((_, i) => {
                const letter = assembledLetters[i];
                return `
                  <div class="w-12 h-14 md:w-14 md:h-16 rounded-2xl border-2 ${letter ? 'bg-gradient-to-t from-indigo-500 to-indigo-600 border-indigo-700 text-white shadow-md' : 'bg-white border-slate-200 text-slate-300'} flex items-center justify-center text-2xl md:text-3xl font-black transition-all cursor-pointer hover:scale-105" data-slot-idx="${i}">
                    ${letter || '_'}
                  </div>
                `;
              }).join('')}
            </div>
            <p class="text-[11px] text-center text-slate-400 font-semibold mt-1">Noto'g'ri qo'yilgan harfni olib tashlash uchun uning ustiga bosing</p>
          </div>

          <!-- Available Letter Cards to Connect -->
          <div class="w-full mb-6">
            <div class="text-xs font-black text-slate-400 uppercase tracking-widest text-center mb-2">Mavjud harf kartochkalari:</div>
            <div class="flex flex-wrap items-center justify-center gap-3">
              ${availableCards.map((letter, i) => `
                <button class="letter-card-btn btn-bouncy w-14 h-16 md:w-16 md:h-18 bg-gradient-to-t from-amber-400 to-amber-300 hover:from-amber-500 hover:to-amber-400 border-2 border-amber-500 text-slate-900 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black shadow-lg cursor-pointer transition-transform" data-letter="${letter}" data-idx="${i}">
                  ${letter}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Result Celebration Banner if Completed -->
          ${isCompleted ? `
            <div class="w-full bg-emerald-50 border-2 border-emerald-300 p-5 rounded-3xl text-center shadow-lg animate-bounce mb-4">
              <div class="text-3xl mb-1">🎉 🌟 👏</div>
              <h4 class="text-xl font-black text-emerald-800">Qoyilmaqom! To'g'ri topdingiz: "${currentPuzzle.targetWord}"</h4>
              <p class="text-xs text-emerald-700 font-bold mt-1">Sizga +${currentPuzzle.reward} Zukko-tanga taqdim etildi!</p>
              
              <button id="btnNextPuzzle" class="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md transition-all">
                Keyingi Topishmoqqa O'tish ➡️
              </button>
            </div>
          ` : ''}

          <!-- Reset Button -->
          <button id="btnResetWord" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors">
            🔄 Harflarni qayta joylashtirish
          </button>

        </div>

      </div>
    `;

    // Event Listeners for Letter Click
    container.querySelectorAll('.letter-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const letter = e.currentTarget.getAttribute('data-letter');
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);

        if (assembledLetters.length < currentPuzzle.targetWord.length) {
          assembledLetters.push(letter);
          availableCards.splice(idx, 1);
          if (window.soundEngine) window.soundEngine.playClick();

          // Check if just completed
          if (assembledLetters.join('') === currentPuzzle.targetWord) {
            state.addReward(currentPuzzle.reward, 30);
            if (window.soundEngine) {
              window.soundEngine.playSuccess();
              window.soundEngine.speak(`Barakalla! ${currentPuzzle.targetWord} so'zini to'g'ri tuzdingiz!`);
            }
          }
          updateUI();
        }
      });
    });

    // Event Listeners for Slot Click (Remove letter)
    container.querySelectorAll('[data-slot-idx]').forEach(slot => {
      slot.addEventListener('click', (e) => {
        const slotIdx = parseInt(e.currentTarget.getAttribute('data-slot-idx'), 10);
        if (assembledLetters[slotIdx]) {
          const removed = assembledLetters.splice(slotIdx, 1)[0];
          availableCards.push(removed);
          if (window.soundEngine) window.soundEngine.playClick();
          updateUI();
        }
      });
    });

    // Reset button
    const btnReset = container.querySelector('#btnResetWord');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        assembledLetters = [];
        availableCards = [...currentPuzzle.scrambled];
        if (window.soundEngine) window.soundEngine.playClick();
        updateUI();
      });
    }

    // Next puzzle button
    const btnNext = container.querySelector('#btnNextPuzzle');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        container.dataset.puzzleIdx = (currentIdx + 1) % puzzles.length;
        renderWordBuilder(container);
      });
    }
  };

  updateUI();
}

window.renderWordBuilder = renderWordBuilder;
