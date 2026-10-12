// Interactive Primary Math & Shapes Quiz Component
function renderMathQuiz(container) {
  const state = window.appState;
  const challenges = state.mathChallenges;

  let currentIdx = container.dataset.mathIdx ? parseInt(container.dataset.mathIdx, 10) : 0;
  if (currentIdx >= challenges.length) currentIdx = 0;
  const item = challenges[currentIdx];

  let selectedOption = null;
  let isAnswered = false;

  const updateUI = () => {
    container.innerHTML = `
      <div class="bg-white border-2 border-indigo-100 rounded-3xl p-5 md:p-7 shadow-xl">
        
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl shadow-md text-white">
              🔢
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xl md:text-2xl font-black text-slate-800">${item.title}</h3>
                <span class="px-2.5 py-0.5 bg-sky-100 text-sky-700 text-xs font-black rounded-lg">
                  Topshiriq ${currentIdx + 1} / ${challenges.length}
                </span>
              </div>
              <p class="text-xs md:text-sm font-semibold text-slate-500">
                Oddiy qo'shish, ayirish va mantiqiy shakllarni o'rganamiz!
              </p>
            </div>
          </div>

          <!-- Reward -->
          <div class="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 px-4 py-2 rounded-2xl shadow-sm">
            <span class="text-2xl">🪙</span>
            <div>
              <span class="text-[10px] font-bold text-amber-600 block leading-tight">MUKOFOT</span>
              <span class="text-sm md:text-base font-black text-amber-800 leading-tight">+${item.reward} Tanga</span>
            </div>
          </div>
        </div>

        <!-- Math Problem Card -->
        <div class="max-w-2xl mx-auto flex flex-col items-center">
          
          <!-- Visual Counting Display -->
          <div class="w-full bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 border-2 border-sky-100 p-6 rounded-3xl mb-6 text-center shadow-inner">
            <div class="text-3xl md:text-5xl font-black text-slate-700 tracking-wider mb-3 animate-float">
              ${item.visual}
            </div>
            <h4 class="text-lg md:text-xl font-black text-indigo-900">
              "${item.question}"
            </h4>
          </div>

          <!-- Options Grid -->
          <div class="w-full grid grid-cols-3 gap-3 md:gap-4 mb-6">
            ${item.options.map(opt => {
              let btnClass = 'bg-white border-2 border-slate-200 text-slate-800 hover:border-sky-400 hover:bg-sky-50';
              if (isAnswered) {
                if (opt === item.answer) {
                  btnClass = 'bg-emerald-500 border-2 border-emerald-600 text-white shadow-lg animate-bounce';
                } else if (opt === selectedOption) {
                  btnClass = 'bg-rose-500 border-2 border-rose-600 text-white shadow-md';
                } else {
                  btnClass = 'bg-slate-100 border-2 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return `
                <button class="math-opt-btn btn-bouncy py-4 md:py-6 rounded-3xl text-2xl md:text-3xl font-black shadow-md transition-all cursor-pointer ${btnClass}" data-opt="${opt}" ${isAnswered ? 'disabled' : ''}>
                  ${opt}
                </button>
              `;
            }).join('')}
          </div>

          <!-- Response Feedback -->
          ${isAnswered ? `
            <div class="w-full p-4 rounded-3xl mb-4 text-center ${selectedOption === item.answer ? 'bg-emerald-50 border-2 border-emerald-300' : 'bg-rose-50 border-2 border-rose-300'}">
              <h5 class="text-base md:text-lg font-black ${selectedOption === item.answer ? 'text-emerald-800' : 'text-rose-800'}">
                ${selectedOption === item.answer ? `🎉 To'g'ri javob! +${item.reward} tanga berildi!` : `😔 Noto'g'ri bo'ldi. To'g'ri javob: ${item.answer}`}
              </h5>

              <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
                <!-- Practice on Canvas button -->
                <button id="btnPracticeOnCanvas" class="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl text-xs md:text-sm font-black shadow-md hover:scale-105 transition-transform flex items-center gap-2">
                  <span>✏️</span> "${item.charToDraw}" raqamini AI doskasida chizish
                </button>

                <!-- Next challenge button -->
                <button id="btnNextChallenge" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs md:text-sm font-black shadow-md hover:scale-105 transition-transform flex items-center gap-2">
                  <span>Keyingi misol</span> ➡️
                </button>
              </div>
            </div>
          ` : ''}

        </div>

      </div>
    `;

    // Listeners for Options
    container.querySelectorAll('.math-opt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectedOption = e.currentTarget.getAttribute('data-opt');
        isAnswered = true;

        if (selectedOption === item.answer) {
          state.addReward(item.reward, 25);
          if (window.soundEngine) {
            window.soundEngine.playSuccess();
            window.soundEngine.speak("Ofarin, to'g'ri hisobladingiz!");
          }
        } else {
          if (window.soundEngine) {
            window.soundEngine.playTryAgain();
            window.soundEngine.speak("Biroz adashdingiz, keyingi safar albatta to'g'ri topasiz!");
          }
        }

        updateUI();
      });
    });

    // Practice on Canvas
    const btnCanvas = container.querySelector('#btnPracticeOnCanvas');
    if (btnCanvas) {
      btnCanvas.addEventListener('click', () => {
        state.selectTask({
          id: 'math_' + item.id,
          title: `"${item.charToDraw}" raqamini yozish`,
          char: item.charToDraw,
          word: `Raqam ${item.charToDraw}`,
          emoji: '🔢',
          category: 'math',
          reward: 10
        });
      });
    }

    // Next challenge
    const btnNext = container.querySelector('#btnNextChallenge');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        container.dataset.mathIdx = (currentIdx + 1) % challenges.length;
        renderMathQuiz(container);
      });
    }
  };

  updateUI();
}

window.renderMathQuiz = renderMathQuiz;
